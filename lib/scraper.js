var client = require('cheerio-httpcli');

// Googleで「node.js」について検索する。
// var word = 'node.js';
var url = 'http://www.amazon.co.jp/gp/offer-listing/B005F23G90';

function fetch(url, callback){
  if( callback === undefined )
    callback = console.log;
  client.fetch(url, null, function (err, $, res, body) {
    if(err){
      return callback({code:err.code});
    }
    var result = {};
    result.code = res.statusCode;
    if(res.statusCode == 200){
      var $itemsSec = $('#olpTabUsed');
      var textSec = $( $itemsSec[0] ).text();
      var priceSec = nubmerFilter(textSec);
      var $itemsNew = $('#olpTabNew');
      var textNew = $( $itemsNew[0] ).text();
      var priceNew = nubmerFilter(textNew);
      result.new = {
        text : textNew,
        price : priceNew
      };
      result.secondHand = {
        text : textSec,
        price : priceSec
      };
    }else{
      console.warn(res.request.uri.path, res.statusCode);
    }
    return callback(result);
  });
}

function nubmerFilter(text){
  text = text.replace(/\(.*\)/,"");
  var digitals = text.match(/\d/g);
  if(digitals === null){
    return -1;
  }
  var numberStr = digitals.join("");
  var number = parseInt(numberStr,10);
  return number;
}
module.exports = exports = fetch;
