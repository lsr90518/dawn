
var router = require('express').Router();
var async = require('async');
var bookDao = require('../lib/bookDao');
var countDao = require('../lib/countDao');
var later = require('later');
var amazonGenre = require('../lib/amazonGenre.js');
var aws = require("aws-lib");
prodAdv = aws.createProdAdvClient('AKIAIT3AEIDR54CLXCAA', 'iA2hLHPySFIK9iJifAraJJOJrP5iDm01pjuBDdXZ', 'lb90518-22', {
    host: "ecs.amazonaws.jp"
});


/* 显示主页. */
//router.get('/', function (req, res) {
//    res.render('index', {
//        title: "Dawn"
//    });
//});

// router.get('/:id?', function(req, res) {
//     var id = req.params.id || '';
// 	var priceFrom = req.query['price-from'] || 0;
// 	var priceTo = req.query['price-to'] || Number.MAX_VALUE;
// 	var rankingFrom = req.query['ranking-from'] || 0;
// 	var rankingTo = req.query['ranking-to'] || Number.MAX_VALUE;
// 	var page = req.query.page || 1;
// 	if (page < 1) page = 1;
// 	var pageSize = 100;
// 	var skip = (page - 1) * pageSize;
//
//     // 当前结点信息
//     if (!id) {
//         var currentNode = amazonGenre.getRootGenre();
//     } else {
//         var currentNode = amazonGenre.findNode(id, true);
//     }
//     // 父结节列表
//     var parentNodes = amazonGenre.findParent(currentNode.BrowseNodeId, true);
//
//     if (currentNode.Children.length < 1) {
//         // TODO search book
//     }
//
//     require('../lib/mongo').db.collection('books', function(err, collection) {
//         if(err) throw err;
//
//         collection
// 			.find({
// 				SalesRank:{
// 					$exists: true
// 				//	,
// 				//	$gte: rankingFrom,
// 				//	$lt: rankingTo
// 				}
// 				// Price Cond
// 			})
// 			.sort({SalesRank: 1})
// 			.skip(skip)
// 			.limit(pageSize)
// 			.toArray(function(err, list) {
//             res.render('index', {
//                 currentNode: currentNode,
//                 parentNodes: parentNodes,
//                 books: list
//             });
//         });
//     });
// });

/**
 * 临时入口，仅用来演示一下使用bookApi存数据
 */
router.get('/createBook', function (req, res) {
    bookDao.create({
        name: "Book one",
        author: "Bill"
    }, function (err, record) {
        res.json({
            msg: "book created"
        });
    });
});

/**
 * 基本上通过GET http://localhost:3000/reload就能把所有数据登录到数据库了
 */
router.get('/reload', function (req, res) {
    //导入 aws node js

    var price = 1000;
    //later
    later.date.localTime();

    console.log("Now:" + new Date());
    var pageNum = 1;
    var i = 0;
    var currentBrowseId = 0;
    var totalpage = 0;

    var intervalTime = 5000;

    var t = setInterval(function(){

      currentBrowseId = amazonGenre.getLeafGenreList()[i].BrowseNodeId;

      console.log("current browse id: "+currentBrowseId);
      console.log("pageNum:" + pageNum);
      console.log("price:" + price);

      //get data from amazon
      prodAdv.call("ItemSearch", {
                              BrowseNode: currentBrowseId,
                              SearchIndex: "Books",
                              MinimumPrice: price,
                              MaximumPrice: price*10,
                              ResponseGroup: "SalesRank,ItemAttributes",
                              Sort: "salesrank",
                              ItemPage: parseInt(pageNum)
                          }, function(err, result){
                            try{
                              console.log(result.Items.Request.Errors);
                            } catch(e){
                              console.log("no error");
                            }
                            try{
                              totalpage = result.Items.TotalPages;
                              items = result.Items.Item;

                                bookDao.create(items, function(result){
                                    console.log("what the fuck error: "+result);
                                });

                                //loop control
                                //pageNum loop
                                if(pageNum < 10 && pageNum < parseInt(totalpage)){
                                  pageNum++;
                                  console.log(pageNum);
                                } else {
                                  //price loop
                                  if(price < 1000000){
                                    price = price * 10;
                                    console.log(price);
                                  } else {
                                    //browse loop
                                    i++;
                                    console.log(i);
                                  }
                                }
                                intervalTime = 1000;
                              } catch (e) {
                                console.log("早すぎ");
                                i++;
                                pageNum = 1;
                                price = 1000;
                              }
                          });
      //save to db
      //loop
      if(i == 3368){
        clearInterval(t);
      } else {

      }
    },intervalTime);
    return res.json({"data": "ok"});

});

/* GET test page. */
router.get('/test', function (req, res) {
});

/**
 * 获取所有叶子节点
 * e.g http://localhost:3000/rootGenre
 */
router.get('/rootGenre', function (req, res) {
    res.json(amazonGenre.getLeafGenreList());
});

/**
 * 获取给定nodeId的父节点
 * e.g. http://localhost:3000/getParent/507138
 */
router.get('/getParent/:id', function (req, res) {
    var nodeId = req.params.id;
    res.json(amazonGenre.findParent(nodeId, true));
});

/**
 * 获取给定nodeId的节点
 * e.g. http://localhost:3000/getNode/507138
 */
router.get('/getNode/:id', function (req, res) {
    var nodeId = req.params.id;
    res.json(amazonGenre.findNode(nodeId, false));
});

module.exports = router;
