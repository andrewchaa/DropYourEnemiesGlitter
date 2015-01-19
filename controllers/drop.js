module.exports = function (app) {

  var Order = require('../models/order');

  app.get('/drop/:id', function (req, res) {

    var id = req.params.id;
    Order.findById(id, function (err, order) {
      if (err)
        throw err;

      res.render('drop', order);
    });

  });

  app.post('/drop', function (req, res) {
    
    var order = new Order();
    order.email = req.body.email;
    order.address = req.body.address;
    order.postCode = req.body.postCode;

    order.add(function (err) {
      if (err)
        res.status(400).send(err);

      res.redirect('/drop/' + order.id);
    })

  })

}