const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const Rating = sequelize.define('rating', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    recipeId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    totalRatings: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      allowNull: true
    },
    avgRating: {
        type: Sequelize.DOUBLE(3,2),
        allowNull: true,
        defaultValue:0
    },
    comment: {
        type: Sequelize.TEXT,
        allowNull:true
    }
}, { timestamps: true })

module.exports = Rating;