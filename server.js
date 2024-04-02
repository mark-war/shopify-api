var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/shopify');

var Product = require('./model/product');
var WishList = require('./model/wishlist');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/product', function(request, response) {
    var product = new Product();
    product.title = request.body.title;
    product.price = request.body.price;

    product.save()
        .then(result => {
            response.send(result);
        })
        .catch(err => {
            response.status(500).send({error: err.message});
        });
});

app.get('/product', function(request, response) {
    Product.find({})
        .then(products => {
            if (products.length === 0) {
                response.status(404).send({ error: "No products found." });
            } else {
                response.send(products);
            }
        })
        .catch(error => {
            response.status(500).send({ error: error.message });
        });
});

app.get('/wishlist', function(request, response) {
    WishList.find({}).populate({path: 'products', model: 'Product'}).exec()
        .then(wishLists => {
            if (wishLists.length === 0) {
                response.status(404).send({ error: "No products found." });
            } else {
                response.send(wishLists);
            }
        })
        .catch(error => {
            response.status(500).send({ error: error.message });
        });
});

app.post('/wishlist', function(request,response) {
    var wishList = new WishList();
    wishList.title = request.body.title;

    wishList.save()
        .then(result => {
            response.send(result);
        })
        .catch(err => {
            response.status(500).send({error: err.message});
        });
});

app.put('/wishlist/product/add', function(request, response) {
    Product.findOne({_id: request.body.productId})
        .then(product => {
            WishList.updateOne({_id: request.body.wishListId}, {$addToSet: {products: product.id}})
                .then(result => {
                    response.send(result);
                })
                .catch(err => {
                    response.status(500).send({error: err.message});
                });
        })
        .catch(err => {
            response.status(500).send({error: err.message});
        });
});

app.listen(3004, function() {
    console.log("Shopify API running on port 3004...")
});

app.use(cors({
    origin: 'http://localhost:3000'
}));