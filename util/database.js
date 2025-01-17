const {Sequelize}=require('sequelize')

const sequelize=new Sequelize('book_Appointment','root','Ia24yon#',{
    dialect:'mysql',host:'localhost'
});

module.exports=sequelize;
