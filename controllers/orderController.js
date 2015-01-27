module.exports = function (app) {

  var Order = require('../models/order');
  var bunyan = require('bunyan');
  var log = bunyan.createLogger({name: 'orderController', serializers: bunyan.stdSerializers});


  app.get('/orders', function (req, res) {

    Order.find(function (err, orders) {

      res.render('orders', { orders: orders });
    });
    
  });

}