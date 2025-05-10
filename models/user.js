const getDb = require('../util/database').getDb
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId
class User{
    constructor(username, email) {
        this.name = username;
        this.email=email
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this)
            .then((result) => {
            console.log("user: ",result);
            }).catch(err => {
            console.log(err);
            
        })
    }
    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: new ObjectId(userId) }) //findOne will not give a cursor but will immdiately return one element therefore next is not required.
            .then(user => {
                console.log("User by id:", user)
                return user
            })
            .catch(err => console.log(err))
    }
}

module.exports=User;