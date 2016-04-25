
var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Order = mongoose.model('Order');

var wipeCollections = function () {
    var removeUsers = User.remove({});
    return Promise.all([
        removeUsers
    ]);
};


var seedOrders = function () {

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
        //return seedUsers();
        return seedOrders();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
