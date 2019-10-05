const CryptoJS = require('crypto-js');

function decrypt(params) {
  const key2 = 'nokia0000';
  const key = CryptoJS.MD5(key2).toString();
  let bytes = CryptoJS.AES.decrypt(params, key)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
module.exports = decrypt