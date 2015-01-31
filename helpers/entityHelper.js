module.exports = {
  string : function (key) {
    if (!key) {
      return '';
    }

    return key._;
  },

  date : function (key) {
    if (!key) {
      return '';
    }

    var keyDate = new Date(key._);
    return keyDate.getDate() + '/' + keyDate.getMonth() + '/' + keyDate.getYear() + ' ' +
      keyDate.getHours() + ':' + keyDate.getMinutes();
  }
} 
