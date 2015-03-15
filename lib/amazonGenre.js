var async = require('async');
var debug = require('debug')('dawn');
var NodeCache = require('node-cache');
var jsonfile = require('jsonfile');
var path = require('path');

var rootNode = jsonfile.readFileSync(path.join(__dirname, './AmazonGenreData.json'));

function getGenreList(callback) {
    async.waterfall([
        function (next) {
            // TODO
        }
    ], callback);
}

exports.getGenreList = getGenreList;