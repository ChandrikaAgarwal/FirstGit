const getDb = require('../util/database').getDb
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId
class User{
    constructor(username, email,cart,id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
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

    addToCart(product) {
        const db = getDb();
    //     const cartProduct = this.cart.items.findIndex(cp => {   //find the product with the same id we are trying to add in the cart
    //         return cp._id === product._id //if true then the product already exists in the cart
        //    })
        //adding a new product to cart.
        // product.quantity = 1  //adding a field on the fly in javascript
        const updatedCart = { items: [{ productId:new ObjectId(product._id) , quantity: 1 }] }
        return db.collection('users').updateOne({ _id:new ObjectId(this._id)},{$set:{cart:updatedCart}})
        
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