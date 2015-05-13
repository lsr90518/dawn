var Scraper = require('./scraper');
var URL_PREFIX = 'http://www.amazon.co.jp/gp/offer-listing/';
var BookDao = require('./bookDao');

if (process.argv[2] == 'test') {
  var mongo = require('./mongo');
  mongo.init(function(err, db) {
    if (!err) {
      var priceReloader = new PriceReloader();
      console.log(priceReloader);
      priceReloader.start({
        startPos: 60
      });
      setTimeout(function() {
        console.log(priceReloader.pause());
        setTimeout(function() {
          priceReloader.resume();
          setTimeout(function() {
            priceReloader.stop();
            setTimeout(priceReloader.start(), 5000);
          }, 5000);
        }, 5000);
      }, 5000);
    }
  });
}

function PriceReloader() {

  var LIMIT = 10;
  var nullList = [];
  var count = 0;
  var current = 0;
  var startPos = 0;

  this.start = function start(option) {
    if (option) {
      startPos = option.startPos;
      current = option.startPos;
    }
    BookDao.count(onGetCount);
  };

  this.getStatus = function getStatus() {
    return {
      current: current,
      LIMIT: LIMIT,
      count: count,
      startPos: startPos
    };
  };

  this.pause = function pause() {
    var data = this.getStatus();
    count = -1;
    return data;
  };

  this.resume = function resume() {
    this.start();
  };

  this.restart = function restart() {
    this.start({
      startPos: 0
    });
  };

  this.stop = function stop() {
    count = -1;
    current = 0;
    startPos = 0;
  };

  function onGetCount(err, ct) {
    var _count = ct;
    count = ct;
    console.log("Amount: ", ct);
    startWave(onFindAll);
  }

  function startWave(onFindAll) {
    BookDao.findAllWithLimit(null, LIMIT, LIMIT * current, onFindAll);
  }

  function onFindAll(err, list) {
    if (!err) {
      var asins = list.map(function(v, k, list) {
        var asin = v.ASIN;
        Scraper(URL_PREFIX + asin, function(result) {
          var remain = 0;
          if (result.code === 200) {
            collector.add(asin, result);
          } else {
            collector.add(asin, null);
          }
        });
        return asin;
      });
      var collector = new Collector(asins);
      collector.onFinished(onSetPrice);
      collector.onNull(function(asin) {
        nullList.push(asin);
      });
    }
  }

  function onSetPrice(results) {
    Object.keys(results).map(function(key, index, keys) {
      BookDao.updateWithConditions({
        "ASIN": key
      }, {
        $set: {
          "PriceNew": results[key].new.price,
          "PriceSecondHand": results[key].secondHand.price,
        }
      });
    });
    current++;
    console.log("Finished: ", "no:", current * LIMIT, (-startPos + current) * LIMIT, '/', count - startPos);
    console.log("nullList:", nullList);
    if (count > current * LIMIT)
      startWave(onFindAll);
  }

  function Collector(list) {
    var _length = list.length;
    var _results = {};
    var _count = _length;
    var _onFinished = console.log;
    var _onNull = console.warn;
    list.forEach(function(asin) {
      _results[asin] = 0;
    });
    this.add = function add(asin, result) {
      if (result === null) {
        _onNull(asin);
        delete _results[asin];
      } else
        _results[asin] = result;
      if (--_count === 0)
        return _onFinished(_results);
      return _count;
    };
    this.onFinished = function onFinished(callback) {
      _onFinished = callback;
    };
    this.onNull = function onNull(callback) {
      _onNull = callback;
    };
  }
}
