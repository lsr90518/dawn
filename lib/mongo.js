var config = require('../config');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

module.exports = exports = {
    init: function (callback) {
        async.waterfall([
            function(next) {
                MongoClient.connect(config.mongo.url, next);
            }
        ], function(err, db) {
            module.exports.db = exports.db = database = db;
            if(err) {
                console.log("Mongodb connection error", err, db);
            } else {
                console.log("Mongodb connected");
            }
            callback(err, db);
        });
    }
};