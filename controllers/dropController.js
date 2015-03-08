module.exports = function (app) {

  var paypal = require('paypal-rest-sdk');
  var Order = require('../models/order');
  var uuid = require('node-uuid');
  var cookieFlash = require('../helpers/flash');
  var paypalConfig = {
    'host': process.env.paypal_host,
    'mode': process.env.paypal_mode,
    'client_id': process.env.paypal_client_id,
    'client_secret': process.env.paypal_client_secret
  };
  var winston = require('winston');

  var getIndex = function (req, res) {

    var sessionId = uuid();
    if (req.cookies.sessionId) {
      sessionId = req.cookies.sessionId;
      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'Reusing the sessionId');
    } else {
      var referrer = req.get('Referrer') || '';
      res.cookie('sessionId', sessionId);

      if (referrer) {
        winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'A user landed from ' + referrer);  
      }  
    }

    var error = req.flash('error');
    var email = req.flash('email');
    var name = req.flash('name');
    var address = req.flash('address');
    var postCode = req.flash('postCode');

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
    Order.findById(id, function (err, order) {
      if (err)
        throw err;

      res.render('dropped', order);
    });

  };

  var postDrop = function (req, res) {

    var sessionId = req.cookies.sessionId;
    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'Validating form inputs...');

    var email = req.body.email;
    var name = req.body.name;
    var address = req.body.address;
    var postCode = req.body.postCode;

    res.flash('email', email);
    res.flash('name', name);
    res.flash('address', address);
    res.flash('postCode', postCode);

    if (!email) {
      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'The email is missing.');
      res.flash('error', 'email');
      res.redirect('/#drop');
      return;
    }

    if (!name) {
      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'The name is missing.');
      res.flash("error", "name");
      res.redirect('/#drop');
      return;
    }

    if (!address) {
      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'The address is missing.');
      res.flash("error", "address");
      res.redirect('/#drop');
      return;
    }

    if (!postCode) {
      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'The postCode is missing.');
      res.flash("error", "postCode");
      res.redirect('/#drop');
      return;
    }


    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'paypal configure');
    paypal.configure(paypalConfig);

    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'paypal generate token');
    paypal.generate_token(function (err, token) {
      if (err) {
        winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'error ', err);
        throw err;
      }

      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'access_token: ', token);
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

      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'paypal create payment');
      paypal.payment.create(create_payment_json, { headers: { Authorization : token } }, 
        function (err, response) {
        if (err) {
          throw err;
        } else {
          winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'response: ' + 
            JSON.stringify(response));

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
    var sessionId = req.cookies.sessionId;
    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'the user approved the payment.');

    var payerId = req.query.PayerID;
    var paymentId = req.query.paymentId;

    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'query: ' + req.query);
    res.render('approved', { payerId : payerId, paymentId : paymentId });

  };

  var postApproved = function (req, res) {

    var sessionId = req.cookies.sessionId;
    var payer = { payer_id: req.body.payerId };
    var paymentId = req.body.paymentId;

    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'paypal configuration again');
    paypal.configure(paypalConfig);

    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'paypal execute the payment.');
    paypal.payment.execute(paymentId, payer, function (err, response) {
      if (err) {
        winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, ': ', err);
        throw err;
      }

      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'updating payment result');
      Order.findByPaymentId(paymentId, function (err, order) {
        if (err)
          throw err;

        winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'order', order);
        order.paid = true;
        order.update(function () {
          res.redirect('/dropped/' + order.id);  
        });
        
      });
    });
  };

  var getCancelled = function (req, res) {
    var sessionId = req.cookies.sessionId;
    winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, 'The user canncelled the purchase.');
    res.render('cancelled');
  };

  app.get('/', getIndex);
  app.post('/drop', postDrop);  
  app.get('/approved', getApproved); 
  app.post('/approved', postApproved);
  app.get('/cancelled', getCancelled);
  app.get('/dropped/:id', getDropped);


}