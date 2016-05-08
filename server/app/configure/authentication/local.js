'use strict';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Cart = mongoose.model('Cart');
var CartItem = mongoose.model('CartItem');
var Promise = require('bluebird');

module.exports = function(app) {

    // When passport.authenticate('local') is used, this function will receive
    // the email and password to run the actual authentication logic.
    var strategyFn = function(email, password, done) {
        User.findOne({
            email: email
        })
            .then(function(user) {
                // user.correctPassword is a method from the User schema.
                if (!user || !user.correctPassword(password)) {
                    done(null, false);
                } else {
                    // Properly authenticated.
                    done(null, user);
                }
            })
            .catch(done);
    };

    // middle ware for creating a cart
    app.use(function(req, res, next) {
        if (!req.user && !req.session.cart) {
            Cart.create({})
                .then(function(cart) {
                    req.session.cart = cart;
                    next();
                });

        } else {
            next();
        }
    });

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, strategyFn));

    // A POST /login route is created to handle login.
    app.post('/login', function(req, res, next) {
        var authCb = function(err, user) {

            if (err) return next(err);

            if (!user) {
                var error = new Error('Invalid login credentials.');
                error.status = 401;
                return next(error);
            }

            // req.logIn will establish our session.
            req.logIn(user, function(loginErr) {
                if (loginErr) return next(loginErr);
                // We respond with a response object that has user with _id and email.
                Cart.findOne({
                    user: req.user._id
                })
                    .then(function(loggedInCart) {
                        if (!loggedInCart) {
                            return Cart.findById(req.session.cart._id)
                                .then(function(cart) {
                                    cart.user = req.user;
                                    return cart.save();
                                });
                        }
                        var combinedArr = [];
                        for (var i = 0; i < loggedInCart.items.length; i++) {
                            for (var j = 0; j < req.session.cart.items.length; j++) {
                                if (loggedInCart.items[i]._id === req.session.cart.items[j]._id || req.session.cart.items[j].productId == loggedInCart.items[i].productId._id) {
                                    // take the greater of the two quantities
                                    if (loggedInCart.items[i].quantity >= req.session.cart.items[j].quantity) {
                                        combinedArr.push(loggedInCart.items[i]);
                                        break;
                                    }
                                    if (loggedInCart.items[i].quantity <= req.session.cart.items[j].quantity) {
                                        combinedArr.push(req.session.cart.items[j]);
                                        break;
                                    }
                                }
                                combinedArr.push(loggedInCart.items[i]);
                                combinedArr.push(req.session.cart.items[j]);
                            }
                        }
                        console.log(combinedArr)
                        console.log('================FOUND CART==========', loggedInCart)
                        loggedInCart.items = combinedArr;
                        req.session.cart = null;
                        return loggedInCart.save()
                    })
                    .then(function(finishedCart) {
                        console.log('finished', finishedCart)
                        res.status(200).send({
                            user: user.sanitize()
                        });
                    })
            });

        };

        passport.authenticate('local', authCb)(req, res, next);

    });

};