const Product = require('../models/product');
// const Cart = require('../models/cart');
// const Order=require('../models/order');

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
  console.log("Cart!!!",req.user.cart);//undefined- we cannot access cart as a property here
  
  req.user.getCart().then(cart=>{
    return cart
    .getProducts() //returning the products inside of the cart
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
let newQty=1;
// Product.findById(prod_Id,(product)=>{
// console.log(prod_Id);
// console.log(product);
// Cart.addProduct(prod_Id,product.price);
// })
// res.redirect('/cart') //this will go to the get cart\
req.user.getCart()
.then(cart=>{
  fetchedCart=cart;
  return cart.getProducts({where:{id:prod_Id}}) //checking if the product is already present in the cart
})
.then(products=>{ //this products is an array but will hold only one product atmost if it is present in the cart.
  let product;
  if(products.length>0){
    product=products[0]
  }
  
  if(product){ //if product is present in the cart
    const oldQuantity=product.cartItem.quantity;
    newQty=oldQuantity+1;
    return product
    // return fetchedCart.addProduct(product,{through:{quantity:newQty}})
  }
//product not part of a cart yet
return Product.findByPk(prod_Id)
  // return fetchedCart.addProduct(product,{through:{quantity:newQty}}) //another method (addProduct) by sequelize for many to many relationships.
  //this single product will be added to this inbetween table with its id.
})
.then(product=>{ //now here the data holds both the product and the quantity
  return fetchedCart.addProduct(product,{through:{quantity:newQty}})
})
.then(()=>{
  res.redirect('/cart')
})
.catch(err=>console.log(err))


};

exports.postCartDeleteProd=(req,res,next)=>{
  const prodId=req.body.productId;
  console.log("Body!!!",req.body);
  
  console.log("Product ID !!! ",prodId);
  
  req.user.getCart().then(cart=>{
    console.log("Cart Found!!!",cart);
    
    return cart.getProducts({where:{id:prodId}})
  })
  .then(products=>{
    if(!products||products.length===0){
      throw new Error("Product not found in cart.");
    }else{
      const product=products[0] //we destroy the product not in the products table but in the cartItems table that connects the cart and the product
      console.log("Product to delete: ",product);
      
      return product.cartItem.destroy()
    }
    })
  .then(result=>{
    console.log("Product removed from cart!!");
    
    res.redirect('/cart')
  })
  .catch(err=>console.log(err))
}

exports.postOrder=(req,res,next)=>{
  let fetchedCart
  req.user.getCart().then(cart=>{
    fetchedCart=cart;
    return cart.getProducts()
  })
  .then(products=>{
    return req.user.createOrder()
    .then(order=>{
      return order.addProducts(products.map(product=>{
        product.orderItem={quantity:product.cartItem.quantity}; //the name orderItem should be similar to the name defined in the model orderItem
        // we get the quantity as above
        return product;
      }));
    })
    .catch(err=>console.log(err))
    console.log(products);
    
  })
  .then(result=>{
   return fetchedCart.setProducts(null)
  })
  .then(result=>{
    res.redirect('/orders')

  })
  .catch(err=>console.log(err))
}
exports.getOrders = (req, res, next) => {
  req.user.getOrders({include:['products']}).then(orders=>{
    console.log("Orders!!!",orders);
    
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders:orders
    });
  }).catch(err=>console.log(err))
  
};

