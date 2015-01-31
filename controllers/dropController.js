module.exports = function (app) {

  var paypal = require('paypal-rest-sdk');
  var Order = require('../models/order');
  var uuid = require('node-uuid');
  var winston = require('winston');
  var paypalConfig = {
    'host': process.env.paypal_host,
    'mode': process.env.paypal_mode,
    'client_id': process.env.paypal_client_id,
    'client_secret': process.env.paypal_client_secret
  };

  var getIndex = function (req, res) {

    var sessionId = uuid();
    if (req.cookies.sessionId) {
      sessionId = req.cookies.sessionId;
      winston.info(sessionId + ': Reusing the sessionId');
    } else {
      res.cookie('sessionId', sessionId);
      winston.info(sessionId + ': A user landed on the page');
    }

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

    var sessionId = req.cookies.sessionId;
    winston.info(sessionId + ': Validating form inputs...');

    var email = req.body.email;
    var name = req.body.name;
    var address = req.body.address;
    var postCode = req.body.postCode;

    res.cookie('email', email);
    res.cookie('name', name);
    res.cookie('address', address);
    res.cookie('postCode', postCode);

    if (!email) {
      winston.info(sessionId + ": The email is missing.");
      res.cookie('error', 'email');
      res.cookie('sessionId', sessionId);
      res.redirect('/#drop');
      return;
    }

    if (!name) {
      winston.info(sessionId + ": The name is missing.");
      res.cookie("error", "name");
      res.redirect('/#drop');
      return;
    }

    if (!address) {
      winston.info(sessionId + ": The address is missing.");
      res.cookie("error", "address");
      res.redirect('/#drop');
      return;
    }

    if (!postCode) {
      winston.info(sessionId + ": The postCode is missing.");
      res.cookie("error", "postCode");
      res.redirect('/#drop');
      return;
    }


    winston.info(sessionId + ': paypal configure');
    paypal.configure(paypalConfig);

    winston.info(session + ': paypal generate token');
    paypal.generate_token(function (err, token) {
      if (err) {
        winston.info(sessionId + ': error ', err);
        throw err;
      }

      winston.info('access_token: ', token);
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

      winston.info('paypal create payment for user (' + sessionId + ')');
      paypal.payment.create(create_payment_json, { headers: { Authorization : token } }, 
        function (err, response) {
        if (err) {
          throw err;
        } else {
          winston.info("response: %s", JSON.stringify(response));

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
    winston.info('user(' + sessionId + ') approved the payment.');

    var payer = { payer_id: req.query.PayerID };
    var paymentId = req.query.paymentId;

    winston.info('query: ', req.query);

    winston.info('paypal configuration again for user(' + sessionId + ').');
    paypal.configure(paypalConfig);

    winston.info('paypal execute payment for user(' + sessionId + ').');
    paypal.payment.execute(paymentId, payer, function (err, response) {
      if (err) {
        winston.error(sessionId + ': ', err);
        throw err;
      }

      winston.info(sessionId + ': updating payment result');
      Order.findByPaymentId(paymentId, function (err, order) {
        if (err)
          throw err;

        winston.info('order', order);
        order.paid = true;
        order.update(function () {
          res.redirect('/dropped/' + order.RowKey);  
        });
        
      });
    });
  };

  var getCancelled = function (req, res) {
    var sessionId = req.cookies.sessionId;
    winston.info(sessionId + ': The user canncelled the purchase.');
    res.render('cancelled');
  };

  app.get('/', getIndex);
  app.post('/drop', postDrop);  
  app.get('/approved', getApproved); 
  app.get('/cancelled', getCancelled);
  app.get('/dropped/:id', getDropped);


}