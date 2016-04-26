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
var Order = mongoose.model('Order');

var wipeCollections = function () {
    var removeUsers = User.remove({});
    var removeProducts = Product.remove({});
    return Promise.all([
        removeUsers,
        removeProducts
    ]);
};

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return User.create(users);

};

var seedProducts = function() {
    var products = [
        {
            name: 'Cerveza con Cebollo',
            price: 10
        },
        {
            name: 'Duff Beer',
            price: 5
        },
        {
            name: 'Wicked Smaht IPA',
            price: 7
        }
    ];

    return Product.create(products);
}

var seedOrder = function () {

    var newUser = new User(
        {
            email: 'andrew@fsa.com',
            password: 'password'
        });

    return newUser.save(function(err){

        var order1 = new Order({
            user: newUser._id,
            status: 'cart'
          });

        return order1.save();
    })

};


connectToDb
    .then(function () {
        return wipeCollections();
    })
    .then(function () {
        return seedUsers();
    })
    .then(function() {
        return seedProducts();
    })
     .then(function() {
        return seedOrder();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
