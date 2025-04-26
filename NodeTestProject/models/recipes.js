const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const Recipe = sequelize.define('recipe', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull:false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    ingredients: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    method: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    cuisine: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cookingTime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    marinationTime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    serves: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    mainingrediant: {
        type: Sequelize.STRING,
        allowNull: false
    },
    recipetype: {
        type: Sequelize.STRING,
       allowNull:false 
    },
    recipeImg: {
        type: Sequelize.JSON,
        allowNull: true
    },
    avgRating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        defaultValue:0
    },
    totalRatings: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull:false
    }

}, { timestamps: true })

module.exports = Recipe;