const Sequelize=require('sequelize') //this will give us a class or constructor function
const sequelize=require('../util/database') //this is a fully configured sequelize environment that also has a connection pool

//define a model to be managed by sequelize

const Product=sequelize.define('product', {
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
  },
  title:Sequelize.STRING,
  price:{
    type:Sequelize.DOUBLE,
    allowNull:false,
  },
 imageUrl:{
  type:Sequelize.STRING,
  allowNull:false,
 },
 description:{
type:Sequelize.STRING,
allowNull:false,
 }
  });

module.exports=Product;