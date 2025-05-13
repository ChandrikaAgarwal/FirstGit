const Expense = require('../models/expense')
const User = require('../models/user')
const Income = require('../models/income');
const sequelize = require('sequelize');

exports.compareExpenses = async (req, res, next) => {
    try {
        console.log("Fetching users with total expenses...");
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const usersWithExpenses = await User.findAll({
            attributes: ["id", "name", "totalExpense"],
            order: [["totalExpense", "DESC"]]
        })
        console.log("Sorted user expenses: ", usersWithExpenses);
        res.status(200).json({ message: "all users: ", userExpenses: usersWithExpenses,isPremium:user.premium })
    } catch (err) {
        console.error("Error in comparing expenses on the backend: ", err);
        res.status(500).json({ message: "Error fetching users" });

    }
}