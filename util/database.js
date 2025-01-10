//to connect to sql and also gives us back a connection object so that we can run queries.

// const mysql=require('mysql2');
// const pool=mysql.createPool({
//     host: 'localhost',
//     user:'root',
//     database: 'node-complete',
//     password: 'Ia24yon#'
// })

// module.exports=pool.promise();


//connecting sequelize to the database. precisely sequelize willset up a connection pool
const Sequelize=require('sequelize')

const sequelize=new Sequelize('node-complete','root','Ia24yon#',{
    dialect: 'mysql',host:'localhost'});
    //dialect:which db we are using.


module.exports=sequelize;
