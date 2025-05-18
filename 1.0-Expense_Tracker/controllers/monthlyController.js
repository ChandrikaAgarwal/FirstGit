const Income = require('../models/income')
const User = require('../models/user')
const Expense = require('../models/expense')
const Month = require('../models/monthly')
const File = require('../models/fileUrl')
const AWS = require('aws-sdk')
const mongoose = require('mongoose')

async function getStartAndEndDate(year, month) {
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    console.log("start Date: ", startDate);
    console.log("end Date: ", endDate);

    return { startDate, endDate }
}
exports.getAllExpenses = async (req, res = null) => {
    try {
        let { month } = req.query
        let { year } = req.query
        month = parseInt(month)
        year = parseInt(year)
        let carryForward = 0;
        let balance = 0;
        let totalIncome = 0;
        let totalExpense = 0;
        console.log("month number is: ", month, "of type: ", typeof (month));

        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("Fetching Expenses for User: ", req.user.id);

        const returnedDate = await getStartAndEndDate(year, month)
        const startDate = returnedDate.startDate;
        const endDate = returnedDate.endDate

        const existingMonth = await Month.findOne({
                userId: req.user.id,
                monthNum: month,
                year: year
        })

        const allexpenses = await Expense.find({
            
                userId: req.user.id,
                createdAt: { $gte: startDate, $lte:endDate }
            
            // order: [["id", "DESC"]]
        }).sort({_id:-1}).exec()

        const allincomes = await Income.find({
            
                userId: req.user.id,
                createdAt: { $gte: startDate, $lte: endDate }
           
            // order: [["id", "DESC"]]
        }).sort({ _id: -1 }).exec()

        if (existingMonth) {
            totalIncome = existingMonth.totalIncome
            totalExpense = existingMonth.totalExpense
            balance = existingMonth.balance
            carryForward = existingMonth.carryForward
        }
        const responseData = {
            allexpenses,
            allincomes,
            totalIncome,
            totalExpense,
            carryForward,
            balance,
            isPremium: user.premium
        }
        if (res) {

            return res.status(200).json({ message: "all months in this year: ", responseData });
        } else {
            return responseData;
        }
    } catch (err) {
        console.log("Error in getting all expenses: ", err);
        if (res) {
            return res.status(500).json({ message: "Error in fetching monthly report", error: err });
        } else {
            throw err; // Internal use ke liye error throw karenge
        }
    }
}

async function calculateDate(start, end) {
    let prevWeekStart = new Date(start)
    let prevWeekEnd = new Date(end)
    prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)
    prevWeekStart = prevWeekStart.toISOString().split('T')[0]
    prevWeekEnd = prevWeekEnd.toISOString().split('T')[0]
    return { prevWeekStart, prevWeekEnd }
}

exports.getExpensesWeekly = async (req, res, next) => {
    try {

        let { startDate, endDate, year } = req.query;
        console.log("startDate: ", startDate, "endDate", endDate);
        startDate = new Date(startDate)
        endDate = new Date(endDate)
       
        console.log("startDate ", startDate, "endDate ", endDate);
        let previousWeek = await calculateDate(startDate, endDate)
        console.log("previous Week!!! ", previousWeek);
        // let totalIncome = 0;
        let totalExpense = 0;
        let carryForward = 0;
        let balance = 0;
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("Fetching Weekly Expenses for User: ", req.user.id);

        const allExpenses = await Expense.find({
            
            userId: req.user.id,
            createdAt: { $gte: startDate, $lte: endDate }
            
            // order: [["id", "DESC"]]
        }).sort({_id:-1}).exec()
        const allincomes = await Income.find({
            
                userId: req.user.id,
                createdAt: { $gte: startDate, $lte: endDate }
            
            // order: [["id", "DESC"]]
        }).sort({ _id: -1 }).exec()
        console.log("all incomes: ",allincomes);
        

       let totalIncome = await Income.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount:{$sum:"$amount"}
                }
            }
        ])
        console.log("totalIncome in monthly Calculation: ",totalIncome);
        // if (!totalIncome) {
        //     totalIncome = 0;
        // }
        let total_I = totalIncome.length > 0 ? totalIncome[0].totalAmount : 0
        totalExpense = await Expense.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(req.user.id),
                            createdAt: { $gte: startDate, $lte: endDate}
                     
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$amount" }
                        }
                    }
                ])

        // if (!totalExpense) {
        //     totalExpense = 0;
        // }
        let total_E = totalExpense.length > 0 ? totalExpense[0].totalAmount : 0
        const lastWeekExpense = await Expense.findOne({
            
                userId: req.user.id,
                createdAt: { $lt: startDate }
            
            // order: [['createdAt', "DESC"], ["id", "DESC"]],
            // limit: 1
        }).sort({ createdAt:-1, _id:-1}).exec()
        console.log("lastWeekExpense!!! ", lastWeekExpense);

        const lastWeekIncome = await Income.findOne({
           
                userId: req.user.id,
                createdAt: { $lt: startDate }
        
            // order: [['createdAt', "DESC"], ["id", "DESC"]],
            // limit: 1
        }).sort({ createdAt: -1, _id: -1 }).exec()
        console.log("lastWeekIncome!!! ", lastWeekIncome);

        if (!lastWeekExpense && !lastWeekIncome) {
            carryForward = 0;
        }
        let lastDate = lastWeekExpense?.createdAt || lastWeekIncome?.createdAt;

        if (lastWeekExpense && lastWeekIncome) {
            lastDate = lastWeekExpense.createdAt > lastWeekIncome.createdAt ? lastWeekExpense.createdAt : lastWeekIncome.createdAt;
        }
        console.log("last Date!!!  ", lastDate);

        if (lastDate === lastWeekExpense?.createdAt) {
            carryForward = lastWeekExpense?.currentsaving || 0;
        } else if (lastDate === lastWeekIncome?.createdAt) {
            carryForward = lastWeekIncome?.totalsaving || 0;
        }
        console.log("carry Forward!!! ", carryForward);

        console.log("Filtered Expenses: ", allExpenses);
        console.log("total Income: ", total_I);
        console.log("total Expense: ", total_E);

        if (total_E && total_I && carryForward) {
            balance = (total_I + carryForward) - total_E
        } else if (total_I && total_E) {
            balance = total_I - total_E
        } else if (total_E && carryForward) {
            balance = carryForward - total_E
        } else if (total_I && carryForward) {
            balance = total_I + carryForward
        } else if (total_E) {
            balance = -total_E
        } else if (carryForward) {
            balance = carryForward
        } else {
            balance=total_I
        }
        console.log("Balance of this week: ", balance);

        res.status(200).json({ message: "getting all weekly expenses: ", allExpenses, allincomes, totalIncome:total_I, totalExpense:total_E, carryForward, balance, isPremium: user.premium });
    } catch (err) {
        console.log("Error in getting all weekly expenses: ", err);
        res.status(400).json({ message: "error in getting expenses ", details: err })
    }
}

exports.getYearlyReport = async (req, res = null) => {
    try {
        let { year } = req.query
        year = parseInt(year)
        console.log("year is: ", year, "of type: ", typeof (year));
        let totalIncome = 0
        let totalExpense = 0
        let totalcf = 0
        let totalBalance = 0
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const allMonths = await Month.find({
            
            userId: req.user.id,
            year: {$eq: year}
        
            // order: [["monthNum", "ASC"]]
        }).sort({monthNum:1}).exec()
        for (let month of allMonths) {
            totalIncome += month.totalIncome
            totalExpense += month.totalExpense
            totalcf += month.carryForward
            totalBalance += month.balance
        }

        const responseData = {
            allMonths, totalIncome, totalExpense, totalcf, totalBalance, isPremium: user.premium
        }
        console.log(totalIncome, totalExpense, totalcf, totalBalance);
        if (res) {

            return res.status(200).json({ message: "all months in this year: ", responseData });
        } else {
            return responseData;
        }
    } catch (err) {
        console.log("Error in getting yearly report:", err);
        if (res) {
            return res.status(500).json({ message: "Error in fetching yearly report", error: err });
        } else {
            throw err; // Internal use ke liye error throw karenge
        }
    }
};
function uploadToS3(data, filename) {
    try {
        const BUCKET_NAME = process.env.BUCKET_NAME
        const IAM_USER_KEY = process.env.IAM_USER_KEY
        const IAM_USER_SECRET = process.env.IAM_USER_SECRET
        let s3bucket = new AWS.S3({ //instance of s3 bucket
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
            // Bucket:BUCKET_NAME

        }) //initializing instance of s3


        var params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL: 'public-read'  //to make the file publicly readable
        }
        return new Promise((resolve, reject) => {

            s3bucket.upload(params, (err, s3response) => {
                if (err) {
                    console.log('Something went wrong', err);
                    reject(err)

                } else {
                    console.log("SUCCESS", s3response);
                    resolve(s3response.Location)
                }
            })
        })
    } catch (error) {
        console.log("error in uploading to s3: ", error);
        throw new Error("S3 Upload Failed: " + error.message);
    }
}
exports.downloadReport = async (req, res) => {
    try {
        let { month, year } = req.query;
        month = parseInt(month)
        year = parseInt(year)
        const monthlyData = await this.getAllExpenses(req);
        console.log("monthlyData: ", monthlyData.allexpenses);
        const user = await User.findById(req.user.id)
        console.log("User: ", user);

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const userId = req.user.id
        const yearlyData = await this.getYearlyReport(req);
        const combinedData = { monthlyData, yearlyData }
        const data = JSON.stringify(combinedData) 

        const filename = `Expense_Report${userId}/${new Date()}.txt` //generates new file name each and every time
        const fileURL = await uploadToS3(data, filename, userId);
        console.log(fileURL);

        console.log("string data: ", combinedData);
        

        const newUrl =  new File({
            url: fileURL,
            createdAt: new Date(),
            userId:userId
        })
        await newUrl.save()
        res.status(200).json({ message: "message from download report", fileURL, monthlyData, yearlyData })
    } catch (err) {
        console.log("Error in downloading report:", err);
        res.status(500).json({ message: "Error in downloading report", error: err });
    }
}

exports.getAllReports = async (req, res) => {
    try {
        const fileUrls = await File.find({ userId: req.user.id }).sort({createdAt:-1}).exec()
            

        res.status(200).json({ fileUrls });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Error fetching reports" });
    }
};
