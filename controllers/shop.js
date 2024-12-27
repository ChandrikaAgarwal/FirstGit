const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; //so because we have used productId as the name after the colon so we can use it on params object
  Product.findById(prodId,product=>{
    console.log("Get product: ",product);
    
  })
  
  Product.findById(prodId, product => {
    console.log(prodId);
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart'
  });
};

exports.postCart= (req,res,next)=>{
const prod_Id=req.body.ProductId //productId is the name we are using in the product-detail.ejs view file
Product.findById(prod_Id,(product)=>{
console.log(prod_Id);
console.log(product);
Cart.addProduct(prod_Id,product.price);
})
res.redirect('/cart') //this will go to the get cart

};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
