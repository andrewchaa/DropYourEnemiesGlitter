module.exports = function (app) {

  var order = require('../models/order');

  require("./drop")(app);

	app.get('/', function (req, res) {
		res.render('index', {});
	});



  app.post('drop', function (req, res) {
    
    var order = new Order();
    order.email = req.body.email;
    order.address = req.body.address;
    order.postCode = req.body.postCode;

    order.add(function (err) {
      if (err)
        res.status(400).send(err);

      res.redirect('/dropped/' + order.id);
    })

  })

}