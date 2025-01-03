//to connect to sql and also gives us back a connection object so that we can run queries.

const mysql=require('mysql2');
const pool=mysql.createPool({
    host: 'localhost',
    user:'root',
    database: 'node-complete',
    password: 'Ia24yon#'
})

module.exports=pool.promise();
