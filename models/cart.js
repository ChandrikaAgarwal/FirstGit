const fs=require('fs')
const path=require('path')

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports=class Cart{
   static addProduct(id,productPrice){
    //fetch the previous cart from file
    fs.readFile(p,(err,fileContent)=>{
        let cart={products:[],totalPrice:0}
        if(!err){
           cart=JSON.parse(fileContent) 
        }
        //analyze the cart => find existing cart
        const existingProdIndex=cart.products.findIndex(prod=>prod.id===id)
        const existingProd=cart.products[existingProdIndex]
        let updatedProd;
//Add new product or increase quantity
        if(existingProd){ //if we have a product that already exists we make a new product with the updated quantity and rest properties being the same.
            //we want to replace the old product instead of adding a new one, so we need to find the index of existing product in the oldproducts
            updatedProd={...existingProd} //taking all the properties of the existingproduct and adding them to new js object using spread operator.
            updatedProd.qty=updatedProd.qty+1
            cart.products=[...cart.products]
            cart.products[existingProdIndex]=updatedProd;
        }else{ //if we have new product
          updatedProd={id: id, qty:1};
          cart.products=[...cart.products,updatedProd] //adding a new product
        }

        cart.totalPrice=cart.totalPrice+productPrice
       fs.writeFile(p,JSON.stringify(cart),(err)=>{
        console.log(err );
        
       })
    })
    
   }
 
   static deleteProduct(id,productPrice){
    fs.readFile(p,(err,fileContent)=>{
      if(err){
         return
      }
        const updatedCart={...JSON.parse(fileContent)}
        const product=updatedCart.products.find(p=>p.id===id)
        const productQty=product.qty
        updatedCart.products=updatedCart.products.filter(prod=>prod.id!==id)
   
        updatedCart.totalPrice= updatedCart.totalPrice-(productPrice*productQty)
         fs.writeFile(p, JSON.stringify(updatedCart,null,2),err=>{
        console.log("Error writing to cart.js: ",err);
        return
      })
      
   })

   }

}