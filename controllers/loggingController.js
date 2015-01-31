module.exports = function (app) {

  var winston = require('winston');

  app.post('/api/log/:step', function (req, res) {
    winston.info(req.cookies.sessionId + ': The user has clicked ' + req.params.step);
    res.sendStatus(200);
  })

}