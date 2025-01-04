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
  const product = new Product(null,title, imageUrl, description, price);
  product.save().then(()=>{
 res.redirect('/');
  }).catch(err=>console.log(err));
  
};

exports.getEditProduct = (req, res, next) => {
  const editMode=req.query.edit
  if(!editMode){
   return res.redirect('/')
  }
  prodId=req.params.productId
  Product.findById(prodId,product=>{
    if(!product){
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product:product
        });
  })
  
};
exports.getDeleteProduct=(req,res,next)=>{
  prodId=req.params.productId
  console.log("ProductId!: ",prodId);
  Product.findById(prodId).then(([product])=>{
    if(!product){
      res.redirect('/')
     }else{
      console.log("product: ",product);
      Product.deleteproductbyId(prodId)
      res.redirect('/admin/products')
      // Cart.deleteProduct(prodId)
     }
  }).catch(err=>console.log(err))
  
  

}
exports.postEditProduct=(req,res,next)=>{
const prodId=req.body.productId //in the view in edit-product.ejs we have used productId as the name of hidden input
const updatedTitle=req.body.title;
const updatedPrice=req.body.price;
const updatedimageUrl=req.body.imageUrl;
const updatedDescription=req.body.description;
const updatedProduct= new Product(prodId,updatedTitle,updatedimageUrl,updatedDescription,updatedPrice);
console.log(prodId);

updatedProduct.save()
}
 
exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([products])=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  }).catch(err=>console.log(err));
};
