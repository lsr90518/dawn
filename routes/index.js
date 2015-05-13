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

router.get('/:id?', function(req, res) {
    var id = req.params.id || '';
	var priceFrom = req.query['price-from'] || 0;
	var priceTo = req.query['price-to'] || Number.MAX_VALUE;
	var rankingFrom = req.query['ranking-from'] || 0;
	var rankingTo = req.query['ranking-to'] || Number.MAX_VALUE;
	var page = req.query.page || 1;
	if (page < 1) page = 1;
	var pageSize = 100;
	var skip = (page - 1) * pageSize;

    // 当前结点信息
    if (!id) {
        var currentNode = amazonGenre.getRootGenre();
    } else {
        var currentNode = amazonGenre.findNode(id, true);
    }
    // 父结节列表
    var parentNodes = amazonGenre.findParent(currentNode.BrowseNodeId, true);
 
    if (currentNode.Children.length < 1) {
        // TODO search book
    }

    require('../lib/mongo').db.collection('books', function(err, collection) {
        if(err) throw err;

        collection
			.find({
				SalesRank:{
					$exists: true
				//	,
				//	$gte: rankingFrom,
				//	$lt: rankingTo
				}
				// Price Cond
			})
			.sort({SalesRank: 1})
//			.skip(skip)
			.limit(pageSize)
			.toArray(function(err, list) {
            res.render('index', {
                currentNode: currentNode,
                parentNodes: parentNodes,
                books: list
            });
        });
    });
});

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

    //for
    // while(1){
    //   console.log(i++);
    //   if( i == 3368){
    //     break;
    //   } else {
    //     setTimeout(function(){},7000);
    //   }
    // }
    var t = setInterval(function(){

      //get data from amazon
      pa();
      //save to db
      //loop
      if(i == 5){
        clearInterval(t);
      } else {

      }
    },7000);

//     var sched = later.parse.recur().every(7).second(),
//         t = later.setInterval(function () {
//             async.waterfall([
//                 function (next) {
//                     countDao.findFirst(function(record){
//                         if(record){
//                             i = record.count;
//                         }
//                         console.log("i: "+i);
//                     });
//                     next();
//                 },
//                 function (next) {
//                     currentBrowseId = amazonGenre.getLeafGenreList()[i].BrowseNodeId;
//                     console.log("currentBrowseId:" + currentBrowseId);
//                     console.log("pageNum:" + pageNum);
//                     console.log("price:" + price);
//                     next();
//                 },
//                 function (next) {
//                     countDao.update(i);
//                     next();
//                 },
//                 function (next) {
//                     prodAdv.call("ItemSearch", {
//                         BrowseNode: currentBrowseId,
//                         SearchIndex: "Books",
//                         MinimumPrice: price,
//                         MaximumPrice: price*10,
//                         ResponseGroup: "SalesRank,ItemAttributes",
//                         Sort: "salesrank",
//                         ItemPage: pageNum
//                     }, next);
//                 },
//                 function (result, next) {
//                     // 第二个function, 查询到的信息登录到数据库
//                     try {
//                     if(result.Items.TotalPages) {
//
//                         totalpage = result.Items.TotalPages;
//                         console.log("total page:" + totalpage);
//                     } else {
//                         console.log("error:  " + result);
//                     }
//                     var items;
//                     if(result.Items.Item) {
// //                        console.log("Result from amazon", result.Items.Item);
//                         items = result.Items.Item;
//                         bookDao.create(items, next);
//                     }
//                     if(result.Items.Request.Errors){
//                         console.log(result.Items.Request.Errors);
//                     }
//
//                     if(i == 3368){
//                         //change book zone
// //                        bookDao.changeCollection("",function(err,data){
// //
// //                        });
// //                        i = 0;
//                         t.clear();
//                     }
//                              } catch (e) {
//                              console.log(e);
//                              }
//                     next();
//                 },
//                 function (next) {
//                     pageNum++;
//                     if (pageNum > totalpage || pageNum == 11) {
//                         // 价格+1
//                         pageNum = 1;
//                         price = price * 10;
//                     }
//                     if(price == 100000){
//                         i++;
//                         price = 1000;
//                     }
//                 }
//             ], function (err, result) {
//                 if (err) {
//                 } else {
//                     return res.json({
//                         result: "OK"
//                     });
//                 }
//             });
//
//         }, sched);
//     return res.json({"data": "ok"});

});

/* GET test page. */
router.get('/test', function (req, res) {

//    var price = 1000;
//    //later
//    later.date.localTime();
//
//    console.log("Now:" + new Date());
//    var pageNum = 1;
//    var i = 0;
//    var currentBrowseId = 0;
//    var totalpage = 0;
//    var sched = later.parse.recur().every(5).second(),
//        t = later.setInterval(function () {
//            async.waterfall([
//                function (next) {
//                    currentBrowseId = amazonGenre.getLeafGenreList()[i].BrowseNodeId;
//                    console.log(currentBrowseId);
//                    console.log("pageNum:" + pageNum);
//                    console.log("price:" + price);
//                    next();
//                },
//                function (next) {
//
//                    // 第一个function, 查询信息
//                    //根据关键字，暧昧搜索，获得搜索结果链接，详细内容。
//                    prodAdv.call("ItemSearch", {
//                        BrowseNode: currentBrowseId,
//                        SearchIndex: "Books",
//                        MinimumPrice: price,
//                        MaximumPrice: price*10,
//                        ResponseGroup: "SalesRank,ItemAttributes",
//                        Sort: "salesrank",
//                        ItemPage: pageNum
//                    }, next);
//                },
//                function (result, next) {
//                    // 第二个function, 查询到的信息登录到数据库
//                    totalpage = result.Items.TotalPages;
//                    console.log("total page:" + totalpage);
//                    if(result.Items.Item) {
//                        console.log("Result from amazon", result.Items.Item);
//                    }
//                    if(result.Items.Request.Errors){
//                        console.log(result.Items.Request.Errors);
//                    }
//
////                    bookDao.create(items, next);
//                    if(i == 3368){
//                        t.clear();
//                    }
//                    next();
//                },
//                function (next) {
//                    pageNum++;
//                    if (pageNum > totalpage || pageNum == 11) {
//                        // 价格+1
//                        pageNum = 1;
//                        price = price * 10;
//                    }
//                    if(price == 100000){
//                        i++;
//                        price = 1000;
//                    }
//                }
//            ], function (err, result) {
//                if (err) {
////                    console.log(err)
////                    return res.json({
////                        error: err
////                    });
//                } else {
//                    return res.json({
//                        result: "OK"
//                    });
//                }
//            });
//
//        }, sched);

//    amazonGenre.getLeafGenreList()



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

function pa(){
  prodAdv.call("ItemSearch", {
                          BrowseNode: 507140,
                          SearchIndex: "Books",
                          MinimumPrice: 1000,
                          MaximumPrice: 1000*10,
                          ResponseGroup: "SalesRank,ItemAttributes",
                          Sort: "salesrank",
                          ItemPage: 1
                      }, function(err, result){
                        // console.log(result);
                        console.log(i++);
                      });
}

module.exports = router;
