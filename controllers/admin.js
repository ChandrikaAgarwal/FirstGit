const Product = require('../models/product');
const mongodb = require('mongodb')
// const ObjectId =mongodb.ObjectId
// const Cart = require('../models/cart')
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
    const product = new Product({title:title, price:price,imageUrl:imageUrl,description:description,userId:req.user}); //b/c we have saved our user into the request
    product
        .save() 
        .then(result => {
            console.log('Product Created!');
            res.redirect('/admin/products')

        }).catch(err => console.log(err));
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if (!editMode) {
        return res.redirect('/')
    }
    prodId = req.params.productId
        // Product.findAll({
        //   where:{
        //    id:prodId,
        //   }
        Product.findById(prodId)
        .then(product => {
                res.render('admin/edit-product', {
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: editMode,
                    product: product
                });
            // }
        }).catch(err => {
            console.log(err);
        })
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId //in the view in edit-product.ejs we have used productId as the name of hidden input
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedimageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    
    const product =  Product.updateOne({ title:updatedTitle, price: updatedPrice, description:updatedDescription, imageUrl:updatedimageUrl })
        // product.save() //save method takes the data as we edit it and saves it back to the db. 
        //here we are returning the promise that is returned by save.
        .then(result => {
            // product.save()
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products')

        })
        .catch(err => console.log(err))

}

//admin side fetchAll
exports.getProducts = (req, res, next) => {

    Product.find()
    .select('title price -_id')
    .populate('userId', 'name')
        .then(products => {
            console.log("products: ",products);
            
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findByIdAndDelete(prodId )
        .then(()=>{
        console.log("DESTROYED PRODUCT");
        res.redirect('/admin/products')
        })
    .catch(err=>console.log(err))
}