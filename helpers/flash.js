/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 * @api public
 */
module.exports = function flash(options) {
  return function(req, res, next) {

    req.flash = function (key) {
      if (key) {
        var retrieved = req.cookies[key] || '';
        res.clearCookie(key); 
        return retrieved
      }
    };

    res.flash = function (key, value) {
      if (key && value) {
        res.cookie(key, value);        
      }
    }

    next();
  }
}
