const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err=>console.log(err))
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; //so because we have used productId as the name after the colon so we can use it on params object
  Product.findAll({ //sequelize also has a findById method.
    where:{
      id:prodId,
    }
  }).then(products=>{
    res.render('shop/product-detail', {
      product: products[0],
      pageTitle: products[0].title,
      path: '/products'
    });
  }).catch((err)=>{
    console.log(err);
  })
  // Product.findById(prodId)
  // .then(product=>{
  //   res.render('shop/product-detail', {
  //         product: product,
  //         pageTitle: product.title,
  //         path: '/products'
  //       });
  // }).catch(err=>console.log(err))
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products=>{
    res.render('shop/index', {
      prods: products,  //rows are the entries in our products table
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err=>console.log(err))
};

exports.getCart = (req, res, next) => {
  console.log("Cart!!!",req.user.cart);
  
  req.user.getCart().then(cart=>{
    return cart
    .getProducts()
    .then(products=>{
      res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products:products
        });
    })
  .catch(err=>console.log(err))
})
    .catch(err=>console.log(err));
  // res.render('shop/cart', {
  //   path: '/cart',
  //   pageTitle: 'Your Cart'
  // });
};

exports.postCart= (req,res,next)=>{
const prod_Id=req.body.ProductId //productId is the name we are using in the product-detail.ejs view file
let fetchedCart;
// Product.findById(prod_Id,(product)=>{
// console.log(prod_Id);
// console.log(product);
// Cart.addProduct(prod_Id,product.price);
// })
// res.redirect('/cart') //this will go to the get cart\
req.user.getCart()
.then(cart=>{
  fetchedCart=cart;
  return cart.getProducts({where:{id:prod_Id}})
})
.then(products=>{ //this products is an array but will hold only one product if it is present in the cart.
  let product;
  if(products.length>0){
    product=products[0]
  }
  let newQty=1;
  if(product){
  }
//product not part of a cart yet
return Product.findByPk(prod_Id).then(product=>{
  return fetchedCart.addProduct(product,{through:{quantity:newQty}}) //another method by sequelize for many to many relationships.
  //this single product will be added to this inbetween table with its id.
})
.catch(err=>console.log(err))
})
.then(()=>{
  res.redirect('/cart')
})
.catch(err=>console.log(err))


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
