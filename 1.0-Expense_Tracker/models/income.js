const {Sequelize}=require('sequelize')
const sequelize=require('../util/database')
const Income=sequelize.define('income',{
id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
},
amount:{
    type:Sequelize.INTEGER,
    allowNull:false
},
description:{
    type:Sequelize.STRING,
    allowNull:false
},
totalsaving:{
    type:Sequelize.INTEGER,
    allowNull:false
}
})

module.exports=Income;