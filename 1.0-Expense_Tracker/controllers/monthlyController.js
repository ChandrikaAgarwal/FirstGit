const Income = require('../models/income')
const User = require('../models/user')
const Expense = require('../models/expense')
const Month=require('../models/monthly')
const { Sequelize, Op } = require('sequelize')


async function getStartAndEndDate(year, month) {
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    console.log("start Date: ", startDate);
    console.log("end Date: ", endDate);

    return { startDate, endDate }
}
exports.getAllExpenses = async (req, res, next) => {
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
        res.status(200).json({ message: "getting all expenses", allExpenses: allexpenses, allincomes: allincomes, totalInc: totalIncome, totalExp: totalExpense, carryforward: carryForward, balance: balance,isPremium:user.premium })
    } catch (err) {
        console.log("Error in getting all expenses: ", err);
        res.status(400).json({ message: "error in getting expenses ", details: err })
    }
}

async function calculateDate(start,end) {
    let prevWeekStart = new Date(start)
    let prevWeekEnd = new Date(end)
    prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)
    prevWeekStart=prevWeekStart.toISOString().split('T')[0]
    prevWeekEnd=prevWeekEnd.toISOString().split('T')[0]
    return {prevWeekStart,prevWeekEnd}
}

exports.getExpensesWeekly = async (req, res, next) => {
    try {

        let { startDate, endDate, year } = req.query;
        console.log("startDate: ",startDate, "endDate",endDate);
        startDate = new Date(startDate)
        endDate = new Date(endDate)
        console.log("startDate ",startDate, "endDate ",endDate);
        let previousWeek = await calculateDate(startDate, endDate)
        console.log("previous Week!!! ",previousWeek);
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
            order:[["id","DESC"]]
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
                createdAt: { [Op.lt]: startDate}
            },
            order: [['createdAt', "DESC"], ["id", "DESC"]],
            limit:1
        })
        console.log("lastWeekExpense!!! ", lastWeekExpense);

        const lastWeekIncome = await Income.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: startDate }
            },
            order: [['createdAt', "DESC"],["id","DESC"]],
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
        }
        console.log("Balance of this week: ",balance);
        
        res.status(200).json({message:"getting all weekly expenses: ",allExpenses,allincomes,totalIncome,totalExpense,carryForward,balance,});
    } catch (err) {
        console.log("Error in getting all weekly expenses: ", err);
        res.status(400).json({ message: "error in getting expenses ", details: err })
    }
}

exports.getYearlyReport = async (req, res, next) => {
    try { 
        let { year } = req.query
        year = parseInt(year)
        console.log("year is: ", year, "of type: ", typeof (year));
        let totalIncome = 0
        let totalExpense = 0
        let totalcf = 0
        let totalBalance=0
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const allMonths = await Month.findAll({
            where: {
                userId: req.user.id,
                year:year
            },
            order:[["monthNum","ASC"]]
        })
        for (let month of allMonths) {
            totalIncome += month.totalIncome
            totalExpense += month.totalExpense
            totalcf += month.carryForward
            totalBalance += month.balance
        }
        console.log(totalIncome,totalExpense,totalcf,totalBalance);
        
        res.status(200).json({ message: "all months in this year: ", allMonths, totalIncome, totalExpense, totalcf, totalBalance });
    } catch (err) { 
        console.log("Error in getting all months in this year: ", err);
        res.status(400).json({ message: "error in getting months ", details: err })
    }
}