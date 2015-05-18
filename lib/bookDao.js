var async = require('async');
var mongo =require('./mongo');
var ObjectID = require('mongodb').ObjectID;

var collectionName = 'books'; // Table name

var bookDao = {
  findAll: function(query, callback) {
    mongo.db.collection(collectionName, function(err, collection) {
      if(err) throw err;
      collection.find(query).toArray(function(err, list) {
        callback(err, list);
      });
    });
  },

  findOne: function(id, callback) {
    mongo.db.collection(collectionName, function(err, collection) {
      if(err) throw err;
      collection.findOne(new ObjectID(id), function(err, book) {
        callback(err, book);
      });
    });
  },
  create: function(book, callback){
      console.log("collection name :" +collectionName);
    mongo.db.collection(collectionName, function (err, collection) {
      if(err) {
          console.log("err : "+err);
          throw err;
      }
      collection.insert(book, function(err, record) {
//        callback(err, record);
      });
    });
  },
  update: function(id, book, callback) {
    book._id = new ObjectID(id);
    mongo.db.collection(collectionName, function (err, collection) {
      if(err) throw err;
      collection.save(book, function(err, record) {
        callback(err, record);
      });
    });
  },
  remove: function(id, callback) {
    mongo.db.collection(collectionName, function(err, collection) {
      if(err) throw err;
      collection.remove({_id: new ObjectID(id)}, function(err, number) {
        callback(err, number);
      });
    });
  },
  removeAll: function(query, callback){
    mongo.db.collection(collectionName, function(err, collection) {
      if(err) throw err;
      collection.remove(query, function(err, number){
        callback(err, number);
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
    },
  changeCollection: function(id, callback) {
      if(colectionName == "bookZone2"){
          collectionName = "bookZone1";
      } else {
          collectionName = "bookZone2";
      }
  }
};

module.exports = exports = bookDao;
