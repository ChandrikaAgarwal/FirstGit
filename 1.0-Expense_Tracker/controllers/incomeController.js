const Income = require('../models/income')
const User = require('../models/user')
const Expense = require('../models/expense')
const { Sequelize, Op } = require('sequelize')


async function finduserIncome(incomedate, userId) {
    const lastIncome = await Income.findOne({
        where:
        {
            userId,
            createdAt: {
                [Op.lt]: incomedate  //incomedate se pehle ki latest entry
            }
        },
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: 1
    });
    console.log("Last Income on latest date!!!", lastIncome);

    return lastIncome
}

exports.postAddIncome = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { date } = req.query
        let amount = req.body.amount
        let description = req.body.description;
        let latestSaving = 0;

        const existingIncome = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt)='${date}'`)

            },
            order: [['id', 'DESC']],
            limit: 1
        })

        console.log("existingIncome: ", existingIncome);

        const lastExpense = await Expense.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: date }
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit: 1
        })

        const lastIncome = await finduserIncome(date, req.user.id)
        console.log("lastExpense ", lastExpense);
        const expenseonDate = await Expense.findOne({
            where: {
                userId: req.user.id,
                createdAt: date
            },
            order: [['id', 'DESC']],
            limit: 1
        })

        if (existingIncome) {
            amount = req.body.amount; // Add to existing income
            latestSaving = existingIncome.totalsaving + req.body.amount;

            if (expenseonDate) {
                expenseonDate.currentsaving += req.body.amount
                latestSaving = expenseonDate.currentsaving
                await expenseonDate.save()
            }
        } else if (expenseonDate) {
            expenseonDate.currentsaving += req.body.amount
            latestSaving = expenseonDate.currentsaving
            await expenseonDate.save()

        } else if (lastExpense) {
            latestSaving = lastExpense.currentsaving + req.body.amount;

        } else if (lastIncome) {
            latestSaving = lastIncome.totalsaving + req.body.amount;

        } else {
            latestSaving = req.body.amount;
        }

        const newIncome = await user.createIncome({
            amount,
            description,
            totalsaving: latestSaving,
            createdAt: date
        })
        await updateFutureIncomes(req.user.id, date, req.body.amount)
        console.log("New Income:", newIncome);
        res.status(200).json({ message: "New income created ", incomedetail: newIncome })
    } catch (err) {
        console.log("Error in postAddIncome:: ", err);

        res.status(500).json({ error: "Failed to create an income ", details: err })
    }
}

async function updateFutureIncomes(userId, updatedDate, addedAmount) {
    try {

        let futureExpenses = await Expense.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }  // Get expenses after the updated date
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']]
        });

        let futureIncomes = await Income.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']]
        })


        console.log("new saving:: ", addedAmount);
        for (let expense of futureExpenses) {
            // date = expense.createdAt
            expense.currentsaving += addedAmount
            await expense.save(); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", addedAmount);

        for (let income of futureIncomes) {
            income.totalsaving += addedAmount
            await income.save()
        }

        console.log("Future expenses updated successfully");
    } catch (err) {
        console.log("Error in updating future incomes:: ", err);
    }
}

exports.getIncome = async (req, res, next) => {
    try {

        const { carouseldate } = req.query
        let lastIncomeDate;
        let expenseOnLatestDate;
        let expenseOnLatest;
        const income = await Income.findOne({
            where: {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt)='${carouseldate}'`)
            },
            order: [['id', 'DESC']], //largest id will come first
            limit: 1
        })
        let expenseonDate = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: carouseldate
            },
            order: [['id', 'ASC']]
        })
        expenseOnLatest = await Expense.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: carouseldate }
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit: 1
        })
        console.log("LAtest Expense:: ", expenseOnLatest);

        let lastIncome = await finduserIncome(carouseldate, req.user.id)
        if (lastIncome) {
            lastIncomeDate = lastIncome.createdAt
            lastIncomeDate = lastIncomeDate.toISOString().split('T')[0]
            console.log("Last income date ", lastIncomeDate);
        }
        if (expenseOnLatest) {
            expenseOnLatestDate = expenseOnLatest.createdAt.toISOString().split('T')[0]
            console.log("Expense on latest date:: ", expenseOnLatestDate);
        }
        if (expenseonDate.length > 0) {
            savings = expenseonDate.at(-1).currentsaving
        } else if (expenseOnLatest && lastIncome) {
            if (lastIncomeDate > expenseOnLatestDate) {
                savings = lastIncome.totalsaving
            } else if (expenseOnLatestDate >= lastIncomeDate) {
                savings = expenseOnLatest.currentsaving
            }
        } else if (income) {
            savings = income.totalsaving
        } else if (lastIncome) {
            savings = lastIncome.totalsaving
        } else if (expenseOnLatest) {
            savings = expenseOnLatest.currentsaving
        } else {
            savings = 0
        }
        // let savings = lastIncome ? lastIncome.totalsaving : 0;
        console.log("Getting Income:::", income);
        console.log("Last Income ", lastIncome);

        console.log("savings testing ", savings);

        res.status(200).json({ income, savings })

    } catch (err) {
        console.log("Income EERR!!! ", err);

        res.status(500).json({ error: "Failed to get income", details: err })

    }
}

exports.deleteIncome = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        let finalsaving;
        console.log("Date on deletion:: ", prevdate);

        const incometoDel = await Income.findOne({
            where: {
                userId: req.user.id,
                id: id
            },
        })
        console.log("Income to delete:: ", incometoDel);
        const delAmount = incometoDel.amount
        const expensesOnDate = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'ASC']], //smallest id will come first
        })

        if (expensesOnDate.length === 0) {
            await incometoDel.destroy()
        } else {
            for (let expense of expensesOnDate) {
                expense.currentsaving -= delAmount
                finalsaving = expense.currentsaving
                await expense.save()
            }
            await incometoDel.destroy()
        }
        const incomeonDate = await Income.findOne({
            where: {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', "DESC"]],
            limit: 1
        })
        if (incomeonDate) {
            incomeonDate.totalsaving = finalsaving
            incomeonDate.save()
        }
        await updateAfterDelete(req.user.id, prevdate, delAmount)
        res.status(200).json({ message: "Income deleted successfully" })
    } catch (err) {
        console.log("Error deleting income from backend ", err);

        res.status(500).json({ error: "Failed to delete income", details: err })
    }
}

async function updateAfterDelete(userId, updatedDate, amount) {
    try {
        let futureExpenses = await Expense.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }  // Get expenses after the updated date
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']]
        });

        let futureIncomes = await Income.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']]
        })

        for (let expense of futureExpenses) {
            // date = expense.createdAt
            expense.currentsaving -= amount
            await expense.save(); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", amount);

        for (let income of futureIncomes) {
            income.totalsaving -= amount
            await income.save()
        }
    } catch (err) {
        console.log("Error in updating after deletion ", err);

    }
}