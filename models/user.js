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
        const cartProductInd = this.cart.items.findIndex(cp => {   //find the product with the same id we are trying to add in the cart
            // console.log("cpId",cp.productId ,"prodId: ",product._id);
            
            return cp.productId.toString() === product._id.toString() //if true then the product already exists in the cart
        })
        let newQuantity = 1
        const updatedCartItems=[...this.cart.items] //we have to append new products in cart not replace existing ones so copying all the old elements
        if (cartProductInd >= 0) {
            newQuantity = this.cart.items[cartProductInd].quantity + 1;
            updatedCartItems[cartProductInd].quantity=newQuantity //updating quantity of existing cartItem
        } else {
            updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity }) //addinga new cartItem
        }
        //adding a new product to cart.
        // product.quantity = 1  //adding a field on the fly in javascript
        const updatedCart = { items:updatedCartItems }
        return db.collection('users').updateOne({ _id:new ObjectId(this._id)},{$set:{cart:updatedCart}})
        
    }

    getCart() {
        const db = getDb();
        const prodIds = this.cart.items.map(i => {
            return i.productId
        })
        return db.collection('products').find({ _id: { $in: prodIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p, quantity: this.cart.items.find(i => {
                    return i.productId.toString()===p._id.toString()
                }).quantity}
            })
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