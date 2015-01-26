module.exports = function (app) {

  require("./dropController")(app);
  require("./orderController")(app);

	app.get('/', function (req, res) {
		res.render('index', {});
	});

}