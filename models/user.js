// const getDb = require('../util/database').getDb
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product' ,required: true },
                quantity: { type: Number, required: true }
            }]
    }
})
userSchema.methods.addToCart = function (product) {
    // const db = getDb();
    const cartProductInd = this.cart.items.findIndex(cp => {   //find the product with the same id we are trying to add in the cart
        // console.log("cpId",cp.productId ,"prodId: ",product._id);
            
        return cp.productId.toString() === product._id.toString() //if true then the product already exists in the cart
                })
        let newQuantity = 1
        const updatedCartItems = [...this.cart.items] //we have to append new products in cart not replace existing ones so copying all the old elements
        if (cartProductInd >= 0) {
            newQuantity = this.cart.items[cartProductInd].quantity + 1;
            updatedCartItems[cartProductInd].quantity = newQuantity //updating quantity of existing cartItem
        } else {
            updatedCartItems.push({ productId:(product._id), quantity: newQuantity }) //addinga new cartItem
        }
        //adding a new product to cart.
        product.quantity = 1  //adding a field on the fly in javascript
        const updatedCart = { items: updatedCartItems }
        this.cart=updatedCart
        return this.save()
        
    
}
userSchema.methods.removeFromCart = function(prod_Id) {
    const userCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== prod_Id.toString()
    })
    this.cart.items = userCartItems;
    return this.save();
}

userSchema.methods.addOrder =function(products){
                
                const order = {
                    items: products,
                    user: {
                        _id: this._id,
                        name: this.name,
                        email: this.email
                    }
                };
                return db.collection('orders').insertOne(order)
            
            .then(result => {
                this.cart = { items: [] };
                return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items:[]}}})
            })
}
userSchema.methods.clearCart = function () {
        this.cart={items:[]}
    return this.save();
    }
module.exports=mongoose.model('User',userSchema)
// const ObjectId = mongodb.ObjectId
// class User{
//     constructor(username, email,cart,id) {`
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//             .then((result) => {
//             console.log("user: ",result);
//             }).catch(err => {
//             console.log(err);
            
//         })
//     }

//     addToCart(product) {
//         const db = getDb();
//         const cartProductInd = this.cart.items.findIndex(cp => {   //find the product with the same id we are trying to add in the cart
//             // console.log("cpId",cp.productId ,"prodId: ",product._id);
            
//             return cp.productId.toString() === product._id.toString() //if true then the product already exists in the cart
//         })
//         let newQuantity = 1
//         const updatedCartItems=[...this.cart.items] //we have to append new products in cart not replace existing ones so copying all the old elements
//         if (cartProductInd >= 0) {
//             newQuantity = this.cart.items[cartProductInd].quantity + 1;
//             updatedCartItems[cartProductInd].quantity=newQuantity //updating quantity of existing cartItem
//         } else {
//             updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity }) //addinga new cartItem
//         }
//         //adding a new product to cart.
//         // product.quantity = 1  //adding a field on the fly in javascript
//         const updatedCart = { items:updatedCartItems }
//         return db.collection('users').updateOne({ _id:new ObjectId(this._id)},{$set:{cart:updatedCart}})
        
//     }

    
//     deleteById(prod_Id) {
//         const db = getDb();
//         const userCartItems = this.cart.items.filter(item => {
//             return item.productId.toString()!==prod_Id.toString() //return true if we want to keep the items and return false f we want to get rid of it.
//         })
//         return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) },{$set:{cart:{items:userCartItems}}})
//             .then(result => {
//             console.log("product deleted");
            
//         }).catch(err=>console.log(err))
//     }
//     addOrder() {
//         const db = getDb()
//         return this.getCart().then(products => {
            
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.name,
//                     email: this.email
//                 }
//             };
//             return db.collection('orders').insertOne(order)
//         })
//         .then(result => {
//             this.cart = { items: [] };
//             return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items:[]}}})
//         })
//     }

//     getOrders() {
//         const db = getDb()
//         return db.collection('orders').find({ 'user._id': new ObjectId(this._id) }).toArray()
//         .then()
//     }
//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({ _id: new ObjectId(userId) }) //findOne will not give a cursor but will immdiately return one element therefore next is not required.
//             .then(user => {
//                 console.log("User by id:", user)
//                 return user
//             })
//             .catch(err => console.log(err))
//     }

    
// }

// module.exports=User;