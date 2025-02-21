const Expense = require('../models/expense')
const User = require('../models/user')
const Income = require('../models/income')
const { jwtAuthMiddleware, generateToken } = require('../jwtmiddleware');
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


exports.postAddUser = async (req, res, next) => {

    console.log("request body!! ", req.body);

    try {

        const email = req.body.email
        const password = req.body.password
        const user = await User.findOne({ where: { email: email } })
        if (!user) {
            const newUser = await User.create({
                email: email,
                password: password
            })
            const token = generateToken({ id: newUser.id, email: newUser.email })
            console.log("New User Created: ", newUser, "Token :", token);

            return res.status(200).json({ message: "New user created ", userdetail: newUser, token: token })
        }

        if (user.password !== password) {
            console.log("passowrd mismatch ", email);
            return res.status(401).json({ message: "Password mismatch" })

        }
        const token = generateToken({ id: user.id, email: user.email })
        console.log("Existing User:", user, "Token: ", token);
        return res.status(200).json({ message: "Login successful", existinguser: user, token })
        // console.log("New user: ",newUser);

    } catch (err) {
        console.log(err);

        res.status(500).json({ error: "Failed to create a new user", details: err })

    }
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

        // if (expenses) {
        //     await updateFutureExpenses(req.user.id, date, );
        // } else {
        await updateFutureExpenses(req.user.id, date, latestsaving);
        // }
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
    let futureExpenses = await Expense.findAll({
        where: {
            userId: userId,
            createdAt: { [Op.gt]: updatedDate }  // Get expenses after the updated date
        },
        order: [['createdAt', 'ASC'], ['id', 'ASC']]
    });
    console.log("new saving:: ", newSaving);

    for (let expense of futureExpenses) {
        newSaving -= expense.amount; // Deduct each future expense
        expense.currentsaving = newSaving;
        await expense.save(); // Save updated expense
    }
}
// exports.getExpenses = async (req, res, next) => {
//     try {
//         const { carouseldate } = req.query
//         const userid = req.user.id
//         console.log("Response ", res);
//         // if (!date) {
//         //     return res.status(400).json({ error: "Date is required" });
//         // }
//         const expenses = await Expense.findAll(
//             {
//                 where: {
//                     userId: userid,
//                     createdAt: carouseldate
//                 }
//             })
//        

//         res.status(200).json({ expenses })

//     } catch (err) {
//         res.status(500).json({ message: "Error fetching expenses ", details: err })
//     }
// };

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
            expenses.at(-1).save()
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
        const userIncome = await finduserIncome(prevdate, req.user.id)
        const expensetodel = await Expense.findByPk(id)
        console.log("Expense to be deleted: ", expensetodel);

        userIncome.totalsaving += expensetodel.amount
        delamount = expensetodel.amount
        await userIncome.save()
        await expensetodel.destroy()
        res.status(200).json({ message: 'Congratulations you cut on expenses!' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete expense', details: err })
    }
};

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


        // .then(result=>{
        //     console.log("Expense to be edited removed from db");

        // })
        // .catch(err=>console.log(err))

        // Update fields




    } catch (err) {
        res.status(500).json({ error: 'Failed to edit expense', details: err.message });
    }
}