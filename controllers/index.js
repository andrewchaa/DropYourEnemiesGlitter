module.exports = function (app) {

  require("./dropController")(app);
  require("./orderController")(app);
  require("./loggingController")(app);

}