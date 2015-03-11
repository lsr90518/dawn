var express = require('express');
var mongodb = require('mongodb');
var router = express.Router();

/* GET home page. */ 
router.get('/', function (req, res) {

    //导入 aws node js
    var aws = require("aws-lib");

    prodAdv = aws.createProdAdvClient('AKIAIT3AEIDR54CLXCAA', 'iA2hLHPySFIK9iJifAraJJOJrP5iDm01pjuBDdXZ', 'lb90518-22');

    //根据关键字，暧昧搜索，获得搜索结果链接，详细内容。
//    for (var i = 1;i<2;i++){
        prodAdv.call("ItemSearch", {BrowseNode:"465610",SearchIndex:"Books",ResponseGroup:"SalesRank",Sort:"salesrank",ItemPage:"2"}, function(err, result) {

            console.log(err);
            console.log(result);
            var items = result.Items.Item;
//            console.log(result.BrowseNodes.BrowseNode.TopSellers);
//            console.log(result.BrowseNodes.BrowseNode.TopItemSet);
            for(var i = 0;i<items.length;i++){
                console.log(items[i]);
            }
        });
//    }

    //根据ID 搜索详细，获取单个商品详细内容。
//    prodAdv.call("ItemLookup", {ItemId: "4121023005", ResponseGroup:"SalesRank"}, function(err, result) {
//
//        console.log(err);
//        console.log(result.Items.Item);
//    });
  res.send({
	  "name": "Dawn"
  })
});

/* GET test page. */
router.get('/test', function (req, res) {

    //连接mongodb服务器，无用户名密码
    //db name = dawn
    //test collection = user
    var server = new mongodb.Server("104.155.213.128",80,{safe:true});
    new mongodb.Db('dawn',server,{}).open(function(error,client){
        if(error) throw error;
        var collection = new mongodb.Collection(client,'user');
        collection.find(function(error,cursor){
            cursor.each(function(error,doc){
                if(doc){
                    console.log(doc);
                }
            });
        });
    });


    res.render('index.jade',{'title':'test'});
});

module.exports = router;
