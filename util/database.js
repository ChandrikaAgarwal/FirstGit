// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient;

// let _db;
// //connects and stores the connection to the database
// const mongoConnect = callback => {
//     MongoClient.connect('mongodb+srv://chandrika30:chandrika30@cluster0.f0j665r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(client => {
//         console.log("connected");
//         _db = client.db('e-commerce') //storing access to the database here. 
//         console.log(typeof(_db));
        
//         callback()
//     }).catch(err => {
//         console.log("could not connect");
//         console.log(err)
//         throw err;
//     })
// }

// //returns access to that connected db if it exists.
// const getDb = () => {
//     if (_db) {
//         return _db
//     }
//     throw "no database found"
// }
// exports.mongoConnect = mongoConnect;
// exports.getDb=getDb

