/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Product = mongoose.model('Product');
var Category = mongoose.model('Category');
var Order = mongoose.model('Order');
var LineItem = mongoose.model('LineItem');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});

var supertest = require('supertest-as-promised');
var app = require('./server/app');
var agent = supertest(app);
var expect = require('chai').expect;

var wipeCollections = function() {
    var removeUsers = User.remove({});
    var removeProducts = Product.remove({});
    return Promise.all([
        removeUsers,
        removeProducts
    ]);
};

var seedUsers = function() {

    var users = [{
        email: 'testing@fsa.com',
        password: 'password',
        admin: false
    }, {
        email: 'obama@gmail.com',
        password: 'potus',
        admin: true
    }];

    return User.create(users);

};

var uniqueCats = [
    "Pale Lager",
    "Golden Ale-Blond Ale",
    "Bohemian Pilsener",
    "India Pale Ale (IPA)",
    "Belgian White (Witbier)",
    "Stout",
    "Brown Ale",
    "American Pale Ale",
    "Spice-Herb-Vegetable",
    "German Hefeweizen",
    "Imperial-Double IPA",
    "Wheat Ale",
    "Dortmunder-Helles",
    // "English Pale Ale",
    "Pilsener",
    "Kilsch",
    // "Premium Lager",
    "Schwarzbier",
    // "Smoked",
    // "Fruit Beer",
    // "Classic German Pilsener",
    // "Altbier",
    "Vieno",
    "Porter",
    "Berliner Weisse",
    // "Abbey Dubbel",
    "Black IPA",
    "Old Ale",
    // "Weizen Bock"
]

var catKV={};
//read from seed csv file
require("fs").createReadStream("./andrew-seed-data.csv").pipe(converter);

//end_parsed will be emitted once parsing finished
converter.on("end_parsed", function(jsonArray) {
    Category.remove({}).then(function(){
            seedCats(uniqueCats).then(function(){
            var productArray=catReplace(jsonArray,catKV);
            runSeed(productArray);
        })
    })

});

var seedProducts = function(x) {
    return Product.create(x);
}


var seedCats= function(cats){
    return Promise.map(cats, function(cat){
        return Category.create({name:cat})
                .then(function(category){
                    catKV[category.name]=category._id;
                })
    })
}

var catReplace= function(productArray,catKeys){
    productArray.forEach(function(prod){
        prod.category=[catKV[prod.style]]
    })
    return productArray;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
var seedOrders = function(users, products) {
    var promises = [],
        lineitemspromises = [];
    products.forEach(function(product) {
        promises.push(createLineItem(product));
    });

    return Promise.map(promises, function(lineitem) {
        return lineitem;
    }).then(function(lineitems) {
        while (lineitems.length > 0) {
            lineitemspromises.push(createOrder(users[0], lineitems.splice(0, 3)));
        }
        return Promise.map(lineitemspromises, function(order) {
            return order;
        });
    }).then(function(orders) {
        return orders;
    });
}

var createOrder = function(user, lineitems) {
    return Order.create({
        user: user._id,
        lineItems: lineitems
    });
}

var createLineItem = function(product) {
    return LineItem.create({
        productId: product._id,
        quantity: getRandomInt(1, 8),
        price: getRandomInt(5, 20)
    });
}

var runSeed = function(productArray) {

    connectToDb
        .then(function() {
            return agent.get('/clearsession');
        })
        .then(function(resp) {
            return Promise.all([wipeCollections(), seedUsers(), seedProducts(productArray)]);
        })
        .spread(function(wipe, users, products) {
            return seedOrders(users, products);
        }).then(function() {
            process.kill(0);
        })
        .catch(function(err) {
            console.error(err);
            process.kill(1);
        });
}
