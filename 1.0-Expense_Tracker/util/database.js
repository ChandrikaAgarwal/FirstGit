const {Sequelize}=require('sequelize')

const sequelize=new Sequelize('expense-tracker','root','Ia24yon#',{
    dialect: 'mysql',host:'localhost'});

module.exports=sequelize;