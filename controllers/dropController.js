module.exports = function (app) {

  var paypal = require('paypal-rest-sdk');
  var Order = require('../models/order');
  var bunyan = require('bunyan');
  var log = bunyan.createLogger({ 
    name: 'dropController',
    serializers: bunyan.stdSerializers
  });
  var paypalConfig = {
    'host': process.env.paypal_host,
    'mode': process.env.paypal_mode,
    'client_id': process.env.paypal_client_id,
    'client_secret': process.env.paypal_client_secret
  };

  app.get('/drop/:id', function (req, res) {

    var id = req.params.id;
    Order.findByRowKey(id, function (err, order) {
      if (err)
        throw err;

      res.render('drop', order);
    });

  });

  app.post('/drop', function (req, res) {
    
    log.info('paypal configure');
    paypal.configure(paypalConfig);

    log.info('paypal generate token');
    paypal.generate_token(function (err, token) {
      if (err)
        throw err;

      log.info('access_token: ', token);
      res.cookie('access_token', token);

      var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": process.env.paypal_paid_url,
          "cancel_url": process.env.paypal_cancelled_url
        },
        "transactions": [{
           "item_list": {
              "items": [{
                  "name": "ship your enemies glitter",
                  "sku": "ship your enemies glitter",
                  "price": "4.99",
                  "currency": "GBP",
                  "quantity": 1
              }]
          },
          "amount": {
            "currency": "GBP",
            "total": "4.99"
          },
          "description": "Ship your enemies glitter for fun!"
        }]
      };

      paypal.payment.create(create_payment_json, { Authorization: token}, 
        function (err, response) {
        if (err) {
          throw err;
        } else {
          log.info("response: %s", JSON.stringify(response));

          var approvalLink = response.links.filter(function (link) {
            return link.rel == 'approval_url';
          })[0];

          var order = new Order();
          order.email = req.body.email;
          order.name = req.body.name;
          order.address = req.body.address;
          order.postCode = req.body.postCode;
          order.note = req.body.note;
          order.paymentId = response.id;


          order.add(function (err) {
            if (err)
              res.status(400).send(err);

            res.redirect(approvalLink.href);
          })
        }
      })

    })

  });

  app.get('/pay', function (req, res) {
    
    var payer = { payer_id: req.query.PayerID };
    var paymentId = req.query.paymentId;

    log.info('query: ', req.query);

    paypal.configure(paypalConfig);
    paypal.payment.execute(paymentId, payer, function (err, response) {
      if (err) {
        log.error(err);
        throw err;
      }

      Order.findByPaymentId(paymentId, function (err, order) {
        if (err)
          throw err;

        log.info('order', order);
        order.paid = true;
        order.update(function () {
          res.redirect('/drop/' + order.RowKey);  
        });
        
      });
    });

  });
}