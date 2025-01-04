const db=require('../util/database')
const Cart=require('./cart')

module.exports = class Product {
  constructor(id,title, imageUrl, description, price) {
    this.id=id //we pass null for a brand new product
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {  //adds new products or editing existing products
   return db.execute('INSERT INTO products(title,price,description,imageUrl) VALUES(?,?,?,?)',[this.title,this.price,this.description,this.imageUrl])
   
    }

  static fetchAll() {
   return db.execute('SELECT * FROM products') //this will return the entire promise
  }

  static findById(id) {
   return db.execute('SELECT * FROM products WHERE products.id=?',[id])
      
      
      
  }
  static deleteproductbyId(id){
   return db.execute('DELETE FROM products WHERE products.id=?',[id])   
        
      }
  

}
