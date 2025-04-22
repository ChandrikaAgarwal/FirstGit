const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const DeletedRecipes = sequelize.define('deletedRecipe', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    recipeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    creatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    deletedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    reason: {
        type: Sequelize.TEXT,
        allowNull: false,
    }
}, { timestamps: true })

module.exports = DeletedRecipes;