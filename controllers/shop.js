const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([rows])=>{
    res.render('shop/product-list', {
      prods: rows,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch((err)=>{
    console.log(err);
  })  
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; //so because we have used productId as the name after the colon so we can use it on params object
  Product.findById(prodId).then(([product])=>{
    res.render('shop/product-detail', {
      product: product[0],
      pageTitle: product.title,
      path: '/products'
    });
  }).catch((err)=>{
    console.log(err);
  })
  };

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(([rows,fieldData])=>{ //using destructuring
    res.render('shop/index', {
      prods: rows,  //rows are the entries in our products table
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch((err)=>{
    console.log(err);
  })
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
