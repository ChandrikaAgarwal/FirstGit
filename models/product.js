const mongoose=require('mongoose')
const Schema = mongoose.Schema;
const productSchema = new Schema({  //instantiating a Schema object by calling new Schema
    title: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    imageUrl: {
        type: String,
        required:true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', //refering to user model telling mongoose to only take the id that refers to a user not any objectid. Also we are detting up relation
        required:true
    }
});

module.exports=mongoose.model('Product',productSchema)

// const getDb=require('../util/database').getDb // to get access to the database
// const mongodb=require('mongodb')
// class Product{
//     constructor(title,price,description,imageUrl,id,userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId=userId
//     }
//     save() {
//         const db = getDb(); //getDb gives us the connection to the database
//         let dbOp;
//         if (this._id) {
//             //update the product
//             dbOp = db.collection('products').updateOne({ _id: this._id },{$set:this})
//         } else {
//             dbOp = db.collection('products').insertOne(this)
//         }
//         return dbOp
//             .then((result) => {
//             console.log(result);
//         }).catch((err) => {
//             console.log(err);
            
//         });
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products').find().toArray().then(products => {
//             console.log(products);
//             return products
            
//         }).catch(err => {
//             console.log(err);
//         })
//     }

//     static findById(prodId) {
//         const db = getDb();
//         return db.collection('products').find({ _id: new mongodb.ObjectId(prodId) }).next().then(
//             product => {
//                 console.log(product);
//                 return product
//             }
//         ).catch(err=>console.log(err))
//     }

//     static deleteById(prodId) {
//         const db = getDb();
//         return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) })
//             .then(result => {
//             console.log("Deleted product");
            
//             }).catch(err=>console.log(err))
//     }
// }

// module.exports = Product;