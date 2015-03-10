var express = require('express');
var router = express.Router();

/* GET home page. */ 
router.get('/', function (req, res) {

    //导入 aws node js
    var aws = require("aws-lib");

    prodAdv = aws.createProdAdvClient('AKIAIT3AEIDR54CLXCAA', 'iA2hLHPySFIK9iJifAraJJOJrP5iDm01pjuBDdXZ', 'lb90518-22');

    //根据关键字，暧昧搜索，获得搜索结果链接，详细内容。
    prodAdv.call("ItemSearch", {SearchIndex: "Books", Keywords: "現代史",ResponseGroup:"SalesRank,ItemAttributes",Sort:"salesrank",ItemPage:"1"}, function(err, result) {

        console.log(err);
        var items = result.Items.Item;
        for(var i = 0;i<items.length;i++){
            console.log(items[i]);
        }
    });
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



    res.render('index.jade',{'title':'test'});
});

module.exports = router;
