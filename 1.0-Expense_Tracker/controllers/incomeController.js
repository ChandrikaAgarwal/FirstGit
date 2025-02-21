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
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit: 1
        })
        console.log("lastExpense ", lastExpense);

        if (existingIncome) {
            amount += existingIncome + amount; // Add to existing income
            latestSaving = existingIncome.totalsaving + req.body.amount;
        } else {
            latestSaving = lastExpense ? lastExpense.currentsaving + amount : amount;
        }

        const newIncome = await user.createIncome({
            amount,
            description,
            totalsaving: latestSaving,
            createdAt: date
        })

        // const prevExp=await Expense.findAll({ 
        //     where:
        //     {
        //         userId: req.user.id,
        //         createdAt:Sequelize.literal(`DATE(createdAt)='${date}'`)
        //     },
        //     order: [['id', 'DESC']],
        //     limit:1
        // })
        // console.log("PrevExpenses: ", prevExp[0]);

        // let savings;
        // if (existingIncome.length > 0) {
        //     console.log("Previous Income!!!", existingIncome[0]);

        //     amount = existingIncome[0].amount + req.body.amount
        //     savings = existingIncome[0].totalsaving + req.body.amount
        //     // if (lastExpense[0]) {
        //     //     lastExpense[0].currentsaving = lastExpense[0].currentsaving + req.body.amount
        //     //     lastExpense[0].save()
        //     // }
        // } else if (prevExp.length > 0) {
        //     savings = prevExp[0].currentsaving + amount
        // } else {
        //     savings = amount
        // }

        // if (lastExpense[0] && lastExpense[0].currentsaving < 0) {
        //     lastExpense[0].currentsaving = newIncome.totalsaving - Math.abs(lastExpense[0].currentsaving)
        //     await lastExpense[0].save()
        // }


        console.log("New Income:", newIncome);
        res.status(200).json({ message: "New income created ", incomedetail: newIncome })
    } catch (err) {
        res.status(500).json({ error: "Failed to create an income ", details: err })
    }
}

// exports.getIncome = async (req, res, next) => {
//     try {
//         const { carouseldate } = req.query
//         const income = await Income.findOne({
//             where: {
//                 userId: req.user.id,
//                 createdAt: Sequelize.literal(`DATE(createdAt)='${carouseldate}'`)
//             },
//             order: [['id', 'DESC']], //largest id will come first
//             limit: 1
//         })

//         let lastIncome = await finduserIncome(carouseldate, req.user.id)
//         let savings = lastIncome ? lastIncome.totalsaving : 0;
//         console.log("Getting Income:::", income);
//         console.log("Last Income ",lastIncome);

//         console.log("savings testing ", savings);

//         res.status(200).json({ income, savings })

//     } catch (err) {
//         res.status(500).json({ error: "Failed to get income", details: err })

//     }
// }

exports.getIncome = async (req, res, next) => {
    try {
        const { carouseldate } = req.query
        let expenseOnLatest;
        const income = await Income.findOne({
            where: {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt)='${carouseldate}'`)
            },
            order: [['id', 'DESC']], //largest id will come first
            limit: 1
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
        if (expenseOnLatest) {
            savings = expenseOnLatest.currentsaving
        } else if (income) {
            savings = income.totalsaving
        } else if (lastIncome) {
            savings = lastIncome.totalsaving
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
