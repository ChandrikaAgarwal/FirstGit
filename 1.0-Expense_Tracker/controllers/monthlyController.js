const Income = require('../models/income')
const User = require('../models/user')
const Expense = require('../models/expense')
const Month = require('../models/monthly')
const File = require('../models/fileUrl')
const { Sequelize, Op } = require('sequelize')
const AWS = require('aws-sdk')

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

        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("Fetching Expenses for User: ", req.user.id);

        const returnedDate = await getStartAndEndDate(year, month)
        const startDate = returnedDate.startDate;
        const endDate = returnedDate.endDate

        const existingMonth = await Month.findOne({
            where: {
                userId: req.user.id,
                monthNum: month,
                year: year
            },
        })

        const allexpenses = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            order: [["id", "DESC"]]
        })

        const allincomes = await Income.findAll({
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            order: [["id", "DESC"]]
        })

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
        let totalIncome = 0;
        let totalExpense = 0;
        let carryForward = 0;
        let balance = 0;
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("Fetching Weekly Expenses for User: ", req.user.id);

        const allExpenses = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            order: [["id", "DESC"]]
        })
        const allincomes = await Income.findAll({
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            order: [["id", "DESC"]]
        })

        totalIncome = await Income.sum("amount", {
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
        })

        if (!totalIncome) {
            totalIncome = 0;
        }

        totalExpense = await Expense.sum("amount", {
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
        })

        if (!totalExpense) {
            totalExpense = 0;
        }

        const lastWeekExpense = await Expense.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: startDate }
            },
            order: [['createdAt', "DESC"], ["id", "DESC"]],
            limit: 1
        })
        console.log("lastWeekExpense!!! ", lastWeekExpense);

        const lastWeekIncome = await Income.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: startDate }
            },
            order: [['createdAt', "DESC"], ["id", "DESC"]],
            limit: 1
        })
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
        console.log("total Income: ", totalIncome);
        console.log("total Expense: ", totalExpense);

        if (totalExpense && totalIncome && carryForward) {
            balance = (totalIncome + carryForward) - totalExpense
        } else if (totalIncome && totalExpense) {
            balance = totalIncome - totalExpense
        } else if (totalExpense && carryForward) {
            balance = carryForward - totalExpense
        } else if (totalIncome && carryForward) {
            balance = totalIncome + carryForward
        } else if (totalExpense) {
            balance = -totalExpense
        } else if (carryForward) {
            balance = carryForward
        } else {
            balance=totalIncome
        }
        console.log("Balance of this week: ", balance);

        res.status(200).json({ message: "getting all weekly expenses: ", allExpenses, allincomes, totalIncome, totalExpense, carryForward, balance, isPremium: user.premium });
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
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const allMonths = await Month.findAll({
            where: {
                userId: req.user.id,
                year: year
            },
            order: [["monthNum", "ASC"]]
        })
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
        let s3bucket = new AWS.S3({
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
        const user = await User.findByPk(req.user.id)
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
        

        const newUrl = await user.createFileurl({
            url: fileURL,
            createdAt: new Date()
        })
        res.status(200).json({ message: "message from download report", fileURL, monthlyData, yearlyData })
    } catch (err) {
        console.log("Error in downloading report:", err);
        res.status(500).json({ message: "Error in downloading report", error: err });
    }
}

exports.getAllReports = async (req, res) => {
    try {
        const fileUrls = await File.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']] // Latest first
        });

        res.status(200).json({ fileUrls });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Error fetching reports" });
    }
};
