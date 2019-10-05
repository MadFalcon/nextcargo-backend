const CryptoJS = require('crypto-js');
function crypt(param) {
  let json = JSON.stringify(param)
  const key = "nokia0000";
  var key2 = CryptoJS.MD5(key).toString();
  var crypted = CryptoJS.AES.encrypt(json, key2).toString();
  return JSON.stringify(crypted);
}
module.exports = crypt