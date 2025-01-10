const Product = require('../models/product');
const Cart=require('../models/cart')
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
      });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user.createProduct({
    title:title,  //title on the right is the constant and on the left is the attribute that is defined in the model
   price:price,
   imageUrl:imageUrl,
   description:description,
   //  userId:req.user.id -setting it manually
  })
   //create creates a new element based on that model and immediately saves it to the database 
   //we have to pass the arguments based on the model
  .then(result=>{
    console.log('Product Created!');
    res.redirect('/admin/products')
    
  }).catch(err=>console.log(err));
}

exports.getEditProduct = (req, res, next) => {
  const editMode=req.query.edit
  if(!editMode){
   return res.redirect('/')
  }
  prodId=req.params.productId
  req.user.getProducts({
    where:{id:prodId}
  })
  // Product.findAll({
  //   where:{
  //    id:prodId,
  //   }
  .then(products=>{
    for(let i=0;i<products.length;i++){
      if(!products[i]){
        return res.redirect('/')
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product:products[i]
          });
   }
    }) .catch(err=>{console.log(err); 
})
};
exports.getDeleteProduct=(req,res,next)=>{
  prodId=req.params.productId
  console.log("ProductId!: ",prodId);
  Product.findByPk(prodId)
  .then(product=>{
    return product.destroy();
  })
  .then(result=>{
    console.log("DESTROYED PRODUCT");
    res.redirect('/admin/products')
  })
  .catch(err=>console.log(err))
}

exports.postEditProduct=(req,res,next)=>{
const prodId=req.body.productId //in the view in edit-product.ejs we have used productId as the name of hidden input
const updatedTitle=req.body.title;
const updatedPrice=req.body.price;
const updatedimageUrl=req.body.imageUrl;
const updatedDescription=req.body.description;
Product.findByPk(prodId).then(product=>{
product.title=updatedTitle;
product.price=updatedPrice;
product.description=updatedDescription;
product.imageUrl=updatedimageUrl;    //this will only change the data locally not in the database
return product.save() //save method takes the data as we edit it and saves it back to the db. 
//here we are returning the promise that is returned by save.
})
.then(result=>{
  console.log('UPDATED PRODUCT');
  res.redirect('/admin/products')
  
})
.catch(err=>console.log(err))

}
 
exports.getProducts = (req, res, next) => {

  // Product.findAll()
  req.user.getProducts()
  .then(products=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  }).catch(err=>console.log(err));
};
