const Income = require('../models/income')
const User = require('../models/user')
const Expense = require('../models/expense')
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
        let balance=0;
        console.log("month number is: ", month, "of type: ", typeof (month));

        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("Fetching Expenses for User: ", req.user.id);

        const returnedDate = await getStartAndEndDate(year, month)
        const startDate = returnedDate.startDate;
        const endDate = returnedDate.endDate

        const lastExpenseDate = await Expense.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: new Date(`${year}-${month}`) }  // Before current month
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // attributes:['createdAt']
        })

        console.log("Last expense date : ", lastExpenseDate)

        const lastIncomeDate = await Income.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: new Date(`${year}-${month}`) }  // Before current month
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // attributes: ['createdAt']
        })

        console.log("Last expense date: ", lastExpenseDate?.createdAt);
        console.log("Last income date: ", lastIncomeDate?.createdAt);

        if (!lastExpenseDate && !lastIncomeDate) {
            carryForward = 0;
        }

        let lastDate = lastExpenseDate?.createdAt || lastIncomeDate?.createdAt;
        if (lastExpenseDate && lastIncomeDate) {
            lastDate = lastExpenseDate.createdAt > lastIncomeDate.createdAt ? lastExpenseDate.createdAt : lastIncomeDate.createdAt;
        }

        console.log("last Date: ", lastDate);

        if (lastDate === lastExpenseDate?.createdAt) {
            carryForward = lastExpenseDate?.currentsaving || 0;
        } else if (lastDate === lastIncomeDate?.createdAt) {
            carryForward = lastIncomeDate?.totalsaving || 0;
        }
        console.log("carry Forward: ", carryForward);

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

        let totalIncome = await Income.sum("amount", {
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
        })
        if (!totalIncome) {
            totalIncome = 0;
        }

        let totalExpense = await Expense.sum("amount", {
            where: {
                userId: req.user.id,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
        })
        if (!totalExpense) {
            totalExpense = 0;
        }

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
        console.log("Filtered Expenses: ", allexpenses);
        console.log("total Income: ", totalIncome);
        console.log("total Expense: ", totalExpense);

        res.status(200).json({ message: "getting all expenses", allExpenses: allexpenses, allincomes: allincomes, totalInc: totalIncome, totalExp: totalExpense, carryforward: carryForward, balance: balance })
    } catch (err) {
        console.log("Error in getting all expenses: ", err);
        res.status(400).json({ message: "error in getting expenses ", details: err })
    }
}