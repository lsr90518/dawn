/**
 * Created by Lsr on 3/31/15.
 */
var async = require('async');
var mongo =require('./mongo');
var ObjectID = require('mongodb').ObjectID;

var collectionName = 'count'; // Table name

var countDao = {
    findFirst: function(callback){
        mongo.db.collection(collectionName, function (err, collection) {
           if(err) {
               console.log("err : "+err);
               throw err;
           }
            collection.findOne({'count':{$gt: -1}}, function(err, record) {
                callback(record);
            })

        });
    },
    update: function(count){

        mongo.db.collection(collectionName, function (err, collection) {
            if(err) {
                console.log("err : "+err);
                throw err;
            }
            collection.update({"current" :1},{"current" :1,"count":count},function(err, record) {
                console.log("update err:"+err);
            });

        });
    },
    create: function(count,callback){
        mongo.db.collection(collectionName, function (err, collection) {
            if(err) {
                console.log("err : "+err);
                throw err;
            }
            collection.insert(count, function(err, record) {
            callback(err, record);
            });
        });
    },
    clear: function(){
        mongo.db.collection(collectionName, function (err,collection) {
           if(err) {
               console.log("err:"+err);

           }
            collection.remove("",function(err, record){
                if(err) {
                    console.log("err:"+err);

                }
            });
        });
    }

};

module.exports = exports = countDao;