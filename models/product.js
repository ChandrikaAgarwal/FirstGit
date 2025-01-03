const fs = require('fs');
const path = require('path');
const Cart=require('./cart')
const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      console.log(err);
      
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id,title, imageUrl, description, price) {
    this.id=id //we pass null for a brand new product
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {  //adds new products or editing existing products
    getProductsFromFile(products => {
      if(this.id){
      const existingProdIndex=products.findIndex(prod=>prod.id===this.id)
      const updatedProducts=[...products]
      updatedProducts[existingProdIndex]=this
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        console.log(err);
      });
    } else{
      this.id = Math.random().toString();
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
   
    }
});
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      // console.log("id: ",id);
      // console.log("products ",products);
      const product = products.find(p => p.id === String(id)); //find executes the function passed to eavery element of the array
      // console.log("prod ",product);
      
      
      cb(product);
    });
  }
  static deleteproductbyId(id){
       getProductsFromFile(products=>{
        const product=products.find(prod=>prod.id===id)
        const updatedProducts=products.filter(prod=>prod.id!==id)
         console.log(updatedProducts);
         
        fs.writeFile(p, JSON.stringify(updatedProducts, null, 2), err => {
          if (err) {
              console.error("Problem writing to file after deletion:", err);
              return;
          }
          console.log("Product deleted successfully!");
          Cart.deleteProduct(id,product.price)
      });
       })
        
      }
  

}
