//all the code dealing with the products will be written here.
//we are exporting this function here 
// using exports.<anyname>- using this we can have multiple exports in one file.
// now we import this function in te admin.js

const products = [];
exports.getAddProduct=(req, res, next) => {
  res.render('add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

exports.postAddProduct=(req, res, next) => {
    products.push({ title: req.body.title });
    console.log(products);
    
    res.redirect('/');
  }

exports.getProducts= (req, res, next) => {
      res.render('shop', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  }