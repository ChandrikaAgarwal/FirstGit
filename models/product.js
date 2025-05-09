const getDb=require('../util/database').getDb // to get access to the database
const mongodb=require('mongodb')
class Product{
    constructor(title,price,description,imageUrl) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }
    save() {
        const db = getDb(); //getDb gives us the connection to the database
        return db.collection('products')
            .insertOne(this)
            .then((result) => {
            console.log(result);
        }).catch((err) => {
            console.log(err);
            
        });
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray().then(products => {
            console.log(products);
            return products
            
        }).catch(err => {
            console.log(err);
        })
    }

    static findById(prodId) {
        const db = getDb();
        return db.collection('products').find({ _id: mongodb.ObjectId.createFromHexString(prodId) }).next().then(
            product => {
                console.log(product);
                return product
            }
        ).catch(err=>console.log(err))
    }
}

module.exports = Product;