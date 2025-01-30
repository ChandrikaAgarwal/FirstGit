const {Sequelize}=require('sequelize') //this is sequelize constructor or class
const sequelize=require('../util/database') //this is the sequelize object
const User=sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    email:{
        type: Sequelize.STRING,
        allowNull:false,
        unique:true
    },

    password:{
        type:Sequelize.STRING(255),
    allowNull:false
}
});

module.exports=User;