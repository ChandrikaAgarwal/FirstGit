const { Sequelize } = require('sequelize') 
const sequelize = require('../util/database')
const { v4: uuidv4 } = require("uuid");
const forgotPassReq = sequelize.define('resetPassword', {
    id: {
        type: Sequelize.UUID,
        defaultValue: uuidv4(),
        allowNull: false,
        primaryKey:true,
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
})

module.exports = forgotPassReq;