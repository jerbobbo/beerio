'use strict';
var router   = require('express').Router();
var Order    = require('mongoose').model('Order');
var LineItem = require('mongoose').model('LineItem');
var Address  = require('mongoose').model('Address');
var _        = require('lodash');
var sendgrid = require('../../../sendgrid');

router.use('/', function(req,res,next) {
  if (!req.user) {
    res.sendStatus(401);
  } else {
    next();
  }
});

// modified this route to return all orders made by a particular user
router.get('/', function(req, res) {
  Order.find({user: req.user._id}).populate({
    path: 'lineItems',
    populate: {
      path: 'productId',
      model: 'Product'
    }
  })
    .then(function(orders) {
      res.json(orders);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// return specific order made by user. if unauth, return 401
router.get('/:order_id', function(req, res) {
  Order.findById(req.params.order_id).populate({
    path: 'lineItems',
    populate: {
      path: 'productId',
      model: 'Product'
    }
  })
    .then(function(order) {
      res.json(order);
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.post('/', function(req, res, next) {
  Order.create(req.body)
    .then(function(order){
      return Order.findById(order._id)
        .populate('user')
        .populate('lineItems')
        .populate('shippingAddress')
        .populate('billingAddress');
    })
    .then(function(populatedOrder) {
      res.json(populatedOrder);
    })
    .catch(console.error);
});

router.put('/:orderId', function(req, res, next) {
  var lineItems       = req.body.lineItems,
      shippingAddress = req.body.shippingAddress,
      billingAddress  = req.body.billingAddress,
      subtotal        = req.body.subtotal,
      total           = req.body.total,
      email           = req.body.email,
      status          = req.body.status;

  Order.findById(req.params.orderId)
    .populate('user lineItems shippingAddress billingAddress')
    .then(function(order){
      if (total && subtotal) {
        order.subtotal = subtotal;
        order.total = total;
      }
      if (email) {
        order.email = email;
      }
      if (status) {
        order.status = status;
      }
      if (lineItems) {
        lineItems.forEach(function(lineItem) {
          var searchedLineItem = order.lineItems.filter(function(_orderlineItem) {
            return _orderlineItem.productId.toString() === lineItem.productId.toString();
          })[0];
          if (searchedLineItem){
            // it already exists so we're just updating quantity
            searchedLineItem.quantity = lineItem.quantity;
          } else {
            // lineItem doesn't exist tso we'll create a new lineItem 
            // and push it into the order model
            order.lineItems.push(new LineItem(lineItem));
          }  
        })
      }
      if (shippingAddress) {
        if (order.shippingAddress) {
          // if it exists in the order already then just modify
          order.shippingAddress.type    = shippingAddress.type;
          order.shippingAddress.street  = shippingAddress.street;
          order.shippingAddress.city    = shippingAddress.city;
          order.shippingAddress.state   = shippingAddress.state;
          order.shippingAddress.country = shippingAddress.country;
          order.shippingAddress.postal  = shippingAddress.postal;
        } else {
          // we need to create a new address model to insert
          order.shippingAddress = new Address(shippingAddress);
        }
        
      }
      if (billingAddress) {
        if (order.billingAddress) {
          order.billingAddress.type    = billingAddress.type;
          order.billingAddress.street  = billingAddress.street;
          order.billingAddress.city    = billingAddress.city;
          order.billingAddress.state   = billingAddress.state;
          order.billingAddress.country = billingAddress.country;
          order.billingAddress.postal  = billingAddress.postal;
        } else {
          order.billingAddress = new Address(billingAddress);
        }
      }
      order.user = req.user._id;

      return order.save();
    })
    .then(function(savedOrder) {
      console.log(savedOrder)
      if (savedOrder.shippingAddress.email && savedOrder.status === 'complete') {
        console.log('sending email.. ', savedOrder.shippingAddress.email)
        sendgrid.mailTo(savedOrder.shippingAddress.email)
       }
      res.json(savedOrder);
    })
    .catch(console.error);
});

module.exports = router;
