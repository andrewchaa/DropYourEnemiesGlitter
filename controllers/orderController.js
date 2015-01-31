module.exports = function (app) {

  var Order = require('../models/order');

  app.get('/orders', function (req, res) {

    Order.find(function (err, orders) {

      res.render('orders', { orders: orders });
    });
    
  });

}