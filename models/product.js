const getDb=require('../util/database').getDb // to get access to the database
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
}

module.exports = Product;