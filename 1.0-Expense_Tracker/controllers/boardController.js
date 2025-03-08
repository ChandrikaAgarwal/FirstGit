const Expense = require('../models/expense')
const User = require('../models/user')
const Income = require('../models/income');
const sequelize = require('sequelize');

exports.compareExpenses = async (req, res, next) => {
    try {
        console.log("Fetching users with total expenses...");

        const usersWithExpenses = await User.findAll({
            attributes: ["id", "name",
                [sequelize.fn("COALESCE", sequelize.fn('SUM', sequelize.col('expenses.amount')), 0), 'total_expenses']
            ], //yeh hume last mein chahiye as result
            include: [   //by default left outer join hota hai
                {
                    model: Expense,
                    attributes: [],
                },
            ],
            group: ["user.id"], //padhna ki user.id ku use kiya expense.id ki jagah
            order: [[sequelize.Sequelize.literal('total_expenses'), "DESC"]]
        })
        console.log("Sorted user expenses: ", usersWithExpenses);

        res.status(200).json({ message: "all users: ", userExpenses: usersWithExpenses })
    } catch (err) {
        console.error("Error in comparing expenses on the backend: ", err);
        res.status(500).json({ message: "Error fetching users" });

    }
}