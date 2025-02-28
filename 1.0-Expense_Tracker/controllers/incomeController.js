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
        // const expenseonDate = await Expense.findOne({
        //     where: {
        //         userId: req.user.id,
        //         createdAt: date
        //     },
        //     order: [['id', 'DESC']],
        //     limit: 1
        // }) 
        let allexpensesOnDate = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: date
            },
            order: [['id', 'ASC']],
        })
        if (existingIncome) {
            amount = req.body.amount; // Add to existing income
            latestSaving = existingIncome.totalsaving + req.body.amount;

            if (allexpensesOnDate.length > 0) {  //update the cs of all expenses on that date if present
                for (let expense of allexpensesOnDate) {
                    expense.currentsaving += req.body.amount
                    await expense.save();
                }
            }
        } else if (allexpensesOnDate.length > 0) {  //update the cs of all expenses on that date if present
            for (let expense of allexpensesOnDate) {
                expense.currentsaving += req.body.amount
                await expense.save();
            }
            latestSaving
        } else if (lastExpense) {
            latestSaving = lastExpense.currentsaving + req.body.amount;

        } else if (lastIncome) {
            latestSaving = lastIncome.totalsaving + req.body.amount;

        } else {
            latestSaving = req.body.amount;
        }

        console.log("latestSaving:: ", latestSaving);

        const newIncome = await user.createIncome({
            amount,
            description,
            totalsaving: latestSaving,
            createdAt: date
        })
        console.log("req.body.amount:: ", req.body.amount);

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

        let newaddedInc = await Income.findOne({
            where: {
                userId: userId,
                createdAt: updatedDate
            },
            order: [['id', 'DESC']],
            limit: 1
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

        const allincomesonDate = await Income.findAll({
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

        // res.status(200).json({income, savings })
        res.status(200).json({ allincomesonDate, income, savings })

    } catch (err) {
        console.log("Income EERR!!! ", err);

        res.status(500).json({ error: "Failed to get income", details: err })

    }
}
exports.getIncomebyId = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        const editIncomeonDate = await Income.findByPk(id)
        res.status(200).json({ message: "Getting income to be edited", editincome: editIncomeonDate })
    } catch (err) {
        console.log("get Income by id EERR!!! ", err);

        res.status(500).json({ error: "Failed to get income", details: err })
    }
}
exports.deleteIncome = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        await deleteInc(id, prevdate, req.user.id)
        res.status(200).json({ message: "Income deleted successfully" })
    } catch (err) {
        console.log("error in delete income controller function:: ", err);

        res.status(500).json({ error: "Failed to delete income", details: err })
    }
}

async function deleteInc(id, date, userId) {
    try {
        let finalsaving;
        console.log("Date on deletion:: ", date);


        const incometoDel = await Income.findOne({
            where: {
                userId: userId,
                id: id
            },
        })
        console.log("Income to delete:: ", incometoDel);
        const delAmount = incometoDel.amount

        let incomesbeforeDel = await Income.findAll({
            where: {
                userId: userId,
                createdAt: date
            },
            order: [['id', 'ASC']],
        })

        console.log("incomes before delete: ", incomesbeforeDel);

        const expensesOnDate = await Expense.findAll({
            where: {
                userId: userId,
                createdAt: date
            },
            order: [['id', 'ASC']], //smallest id will come first
        })

        if (expensesOnDate.length === 0) {
            await incometoDel.destroy()
        } else {
            for (let expense of expensesOnDate) {
                expense.currentsaving -= delAmount
                console.log("currentsaving : ", expense.currentsaving);

                finalsaving = expense.currentsaving
                await expense.save()
            }
            await incometoDel.destroy()
        }

        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: userId,
                createdAt: date
            },
            order: [['id', 'DESC']],
            limit: 1
        });

        console.log("income on that date:: ", incomeonThatDate);

        const remainingincomes = await Income.findAll({
            where: {
                userId: userId,
                createdAt: date,
                id: { [Op.gt]: id }
            },
            order: [['id', "ASC"]],
            // limit: 1
        })

        console.log("remaining incomes: ", remainingincomes);

        if (parseInt(id) !== incomesbeforeDel.at(-1).id) {
            for (let income of remainingincomes) {
                income.totalsaving -= delAmount
                await income.save()
            }
        }

        console.log("final saving: ", finalsaving);
        console.log("income on that date after deletion: ", incomeonThatDate);
        if (incomeonThatDate) {
            incomeonThatDate.totalsaving = finalsaving
            await incomeonThatDate.save()
        }
        await updateAfterDelete(userId, date, delAmount)

    } catch (err) {
        console.log("Error deleting income from backend ", err);


    }
}

exports.editIncome = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        const { amount, description } = req.body
        let finalSaving;
        console.log("amount: ", req.body.amount);
        console.log("description", req.body.description);

        const incometoEdit = await Income.findByPk(id)
        console.log("Income to edit : ", incometoEdit);

        let oldAmount = incometoEdit.amount
        let difference = amount - oldAmount
        console.log("difference: ", difference);

        incometoEdit.amount = amount
        incometoEdit.description = description
        incometoEdit.totalsaving += difference
        incometoEdit.save()

        const allexpensesOnDate = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'ASC']]
        })
        for (let expense of allexpensesOnDate) {
            expense.currentsaving += difference
            finalSaving = expense.currentsaving
            await expense.save()
        }

        const remainingincomes = await Income.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate,
                id: { [Op.gt]: id }
            },
            order: [['id', "ASC"]],
            // limit: 1
        })
        console.log("remaining incomes: ", remainingincomes);

        for (let income of remainingincomes) {
            income.totalsaving += difference
            await income.save()
        }
        updateFutureIncomes(req.user.id, prevdate, difference)
        res.status(200).json({ message: "edited income.", editedIncome: incometoEdit })

    } catch (err) {
        console.log("Error editing Income: ", err);
        res.status(500).json({ error: "Failed to edit income", details: err })

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