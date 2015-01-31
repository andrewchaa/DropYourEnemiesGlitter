module.exports = function (app) {

  var paypal = require('paypal-rest-sdk');
  var Order = require('../models/order');
  var uuid = require('node-uuid');
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

  var getIndex = function (req, res) {

    var userId = uuid();
    res.cookie('userId', userId);
    log.info('A user(' + userId + ') landed on the page');

    var error = req.cookies.error || '';
    var email = req.cookies.email || '';
    var name = req.cookies.name || '';
    var address = req.cookies.address || '';
    var postCode = req.cookies.postCode || '';

    res.clearCookie("error");
    res.clearCookie("email");
    res.clearCookie("name");
    res.clearCookie("address");
    res.clearCookie("postCode");

    res.render('index', { 
      error: error,
      email: email || '',
      name: name || '',
      address: address || '',
      postCode: postCode || ''
    });

  };

  var getDropped = function (req, res) {

    var id = req.params.id;
    Order.findByRowKey(id, function (err, order) {
      if (err)
        throw err;

      res.render('dropped', order);
    });

  };

  var postDrop = function (req, res) {

    var userId = req.cookies.userId;
    log.info('validating form inputs for user (' + userId + ')...');

    var email = req.body.email;
    var name = req.body.name;
    var address = req.body.address;
    var postCode = req.body.postCode;

    res.cookie('email', email);
    res.cookie('name', name);
    res.cookie('address', address);
    res.cookie('postCode', postCode);

    if (!email) {
      log.info("The email is missing.");
      res.cookie('error', 'email');
      res.redirect('/#drop');
      return;
    }

    if (!name) {
      log.info("The name is missing.");
      res.cookie("error", "name");
      res.redirect('/#drop');
      return;
    }

    if (!address) {
      log.info("The address is missing.");
      res.cookie("error", "address");
      res.redirect('/#drop');
      return;
    }

    if (!postCode) {
      log.info("The postCode is missing.");
      res.cookie("error", "postCode");
      res.redirect('/#drop');
      return;
    }


    log.info('paypal configure for user (' + userId + ')');
    paypal.configure(paypalConfig);

    log.info('paypal generate token for user (' + userId + ')');
    paypal.generate_token(function (err, token) {
      if (err) {
        log.info('error with user (' + userId + '): ', err);
        throw err;
      }

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
                  "sku": "glitter",
                  "price": "2.99",
                  "currency": "GBP",
                  "quantity": 1
              }]
          },
          "amount": {
            "currency": "GBP",
            "total": "2.99"
          },
          "description": "Ship your enemies glitter for fun!"
        }]
      };

      log.info('paypal create payment for user (' + userId + ')');
      paypal.payment.create(create_payment_json, { headers: { Authorization : token } }, 
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

  };

  var getApproved = function (req, res) {
    var userId = req.cookies.userId;
    log.info('user(' + userId + ') approved the payment.');

    var payer = { payer_id: req.query.PayerID };
    var paymentId = req.query.paymentId;

    log.info('query: ', req.query);

    log.info('paypal configuration again for user(' + userId + ').');
    paypal.configure(paypalConfig);

    log.info('paypal execute payment for user(' + userId + ').');
    paypal.payment.execute(paymentId, payer, function (err, response) {
      if (err) {
        log.error(err);
        throw err;
      }

      log.info('updating payment result for user(' + userId + ').');
      Order.findByPaymentId(paymentId, function (err, order) {
        if (err)
          throw err;

        log.info('order', order);
        order.paid = true;
        order.update(function () {
          res.redirect('/dropped/' + order.RowKey);  
        });
        
      });
    });
  };

  var getCancelled = function (req, res) {
    var userId = req.cookies.userId;
    log.info('The user(' + userId + ') canncelled the purchase.');
    res.render('cancelled');
  };

  app.get('/', getIndex);
  app.post('/drop', postDrop);  
  app.get('/approved', getApproved); 
  app.get('/cancelled', getCancelled);
  app.get('/dropped/:id', getDropped);


}