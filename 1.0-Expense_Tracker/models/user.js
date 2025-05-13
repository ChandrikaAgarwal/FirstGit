const { Sequelize } = require('sequelize') //this is sequelize constructor or class
const sequelize = require('../util/database') //this is the sequelize object
const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING(15),
        allowNull: false
    },
    totalExpense: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    premium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;