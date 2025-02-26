const Expense = require('../models/expense')
const User = require('../models/user')
const Income = require('../models/income')
const { Sequelize, Op } = require('sequelize');

async function finduserIncome(incomedate, userId) {
    return await Income.findOne({
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
}

exports.postAddExpense = async (req, res, next) => {
    console.log("expense controller activated!!");
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { date } = req.query
        let latestsaving = 0

        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt) = '${date}'`)
            },
            order: [['id', 'DESC']],
            limit: 1
        });
        console.log("incomeonThatDate ", incomeonThatDate)
        let userIncome = incomeonThatDate ? incomeonThatDate : await finduserIncome(date, req.user.id)
        console.log("User Income!!!", userIncome);

        const lastExpense = await Expense.findOne({ //yeh tab milega jab hum 19 mein expense naya add karenge tab karna lastExpense.at(-1)
            where:
            {
                userId: req.user.id,
                createdAt: { [Op.lt]: date }
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit: 1
        })
        console.log("LAst expense in PostAddExp: ", lastExpense);

        const expenses = await Expense.findAll(
            {
                where: {
                    userId: req.user.id,
                    createdAt: date
                },
            })

        console.log("Expense on date: ", date, ": ", expenses);
        console.log("Previous Expenses!!! ", lastExpense);

        if (!incomeonThatDate && expenses.length > 0) {
            latestsaving = expenses.at(-1).currentsaving
        } else if (!incomeonThatDate && lastExpense) {
            latestsaving = lastExpense.currentsaving;
        } else if (incomeonThatDate) {
            latestsaving = incomeonThatDate.totalsaving
        } else if (userIncome) {
            latestsaving = userIncome.totalsaving
        }

        const amount = req.body.amount
        const description = req.body.description
        const category = req.body.category
        //    const createdAt=req.body.createdAt || new Date();
        latestsaving = latestsaving - amount

        const newExpense = await user.createExpense({
            amount: amount,
            description: description,
            category: category,
            currentsaving: latestsaving,
            createdAt: date //overriding default value of createdAt
        })

        // if (lastExpense) {
        //     while (lastExpense.createdAt > date) {
        //         lastExpense.currentsaving -= amount;
        //         lastExpense.save()
        //     }
        // }

        if (incomeonThatDate) {
            incomeonThatDate.totalsaving = latestsaving;
            await incomeonThatDate.save();
        }


        // await updateFutureExpenses(req.user.id, date,latestsaving);
        await updateFutureExpenses(req.user.id, date, req.body.amount);

        console.log("Updated Saving after Expense: ", latestsaving);

        console.log("incomes table updated");

        console.log("latest saving !!", latestsaving);


        res.status(200).json({ message: "New expense created ", expensedetail: newExpense })

    } catch (err) {
        console.log("expense Error!!! ", err);

        res.status(500).json({ error: "Failed to create a new expense", details: err })
    }
};

async function updateFutureExpenses(userId, updatedDate, newSaving) {
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
        console.log("new saving:: ", newSaving);

        for (let expense of futureExpenses) {
            // Deduct each future expense
            expense.currentsaving -= newSaving;
            await expense.save(); // Save updated expense

        }

        for (let income of futureIncomes) {
            income.totalsaving -= newSaving
            await income.save()
        }

    } catch (err) {
        console.log("Error in updating future incomes and expenses:: ", err);

    }

}

exports.getExpenses = async (req, res, next) => {
    try {
        const { carouseldate } = req.query
        const userid = req.user.id
        console.log("Response ", res);
        let userIncome;
        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt) = '${carouseldate}'`)
            },
            order: [['id', 'DESC']],
            limit: 1
        });

        const expenses = await Expense.findAll(
            {
                where: {
                    userId: userid,
                    createdAt: carouseldate
                }
            })
        if (expenses.length > 0 && expenses.at(-1).currentsaving < 0) {
            userIncome = incomeonThatDate ? incomeonThatDate : await finduserIncome(carouseldate, userid)
            if (userIncome) {
                expenses.at(-1).currentsaving += userIncome.amount
            }
            await expenses.at(-1).save()
        }
        res.status(200).json({ expenses })

    } catch (err) {
        console.log("Error in getExpenses: ", err);

        res.status(500).json({ message: "Error fetching expenses ", details: err })
    }
};
exports.deleteExpense = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        let userIncome;
        const expensetodel = await Expense.findOne({ where: { id, userId: req.user.id } })
        console.log("Expense to be deleted: ", expensetodel);

        console.log("type of id:: ", typeof (id));

        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'DESC']],
            limit: 1
        });

        let expensesbeforeDel = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'ASC']],
        })

        let delamount = expensetodel.amount
        let delcurrSave = expensetodel.currentsaving
        console.log("Del amount:: ", delamount);
        await expensetodel.destroy()

        let remainingExpenses = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate,
                id: { [Op.gt]: id }
            },
            order: [['id', 'ASC']],
        })
        let lastExpcurrSaving;
        console.log("delete id:: ", id);


        if (parseInt(id) !== expensesbeforeDel.at(-1).dataValues.id) {
            for (let expense of remainingExpenses) {
                expense.currentsaving += delamount
                expense.save()
            }


        }
        if (incomeonThatDate) {
            incomeonThatDate.totalsaving += delamount
            await incomeonThatDate.save()
        }

        res.status(200).json({ message: "Deleted successfully!", expensetodelete: expensetodel });
        updateAfterDelete(req.user.id, prevdate, delamount)
    } catch (err) {
        console.log("delete error!!! ", err);

        res.status(500).json({ error: 'Failed to delete expense', details: err })
    }
};

async function updateAfterDelete(userId, updatedDate, addedAmount) {
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
        console.log("update error!! ", err);

        console.log("Error in updating future incomes:: ", err);
    }
}

exports.getExpenseById = async (req, res, next) => {
    try {
        const { id } = req.params
        const expense = await Expense.findByPk(id)
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(200).json({ expense });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expense', details: err.message });
    }
};

exports.updateExpense = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        let oldAmount = 0
        const { amount, description, category } = req.body
        const preExpenses = await Expense.findAll({
            where:
            {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt)='${prevdate}'`)
            },
            order: [['createdAt', 'DESC']],
            limit: 1
        })
        console.log("PreExpenses:: ", preExpenses);

        const userIncome = await finduserIncome(prevdate, req.user.id)

        const expense = await Expense.findByPk(id)

        console.log(expense);
        oldAmount = expense.amount
        console.log("Old Amount", oldAmount);
        userIncome.totalsaving = userIncome.totalsaving + oldAmount
        await userIncome.save()
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        await expense.destroy()
        expense.amount = amount;
        expense.description = description;
        expense.category = category;


        await expense.save()

        res.status(200).json({ message: 'Updated expense', editexpense: expense })

    } catch (err) {
        res.status(500).json({ error: 'Failed to edit expense', details: err.message });
    }
}