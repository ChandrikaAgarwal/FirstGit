const {Sequelize}=require('sequelize')
const sequelize=new Sequelize('company-review','root','Ia24yon#',{
dialect:'mysql',host:'localhost'
})

module.exports=sequelize;