var router = require('express').Router();
var async = require('async');
var bookDao = require('../lib/bookDao');
var later = require('later');


/* 显示主页. */
router.get('/', function (req, res) {
    res.render('index', {
        title: "Dawn"
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
    var aws = require("aws-lib");

    prodAdv = aws.createProdAdvClient('AKIAIT3AEIDR54CLXCAA', 'iA2hLHPySFIK9iJifAraJJOJrP5iDm01pjuBDdXZ', 'lb90518-22' ,{
        host:"ecs.amazonaws.jp"
    });

    // async.waterfall, function挨个执行，一旦有一个function出错，直接跳到最后一个汇总用的function
    // return只是强到一下到此为止, 怕后面忘了再写个res.render什么的
    var pageNum = 0;

    async.waterfall([
//        function(next) {
//            pageNum++;
//            // 第一个function, 查询信息
//            //根据关键字，暧昧搜索，获得搜索结果链接，详细内容。
//            prodAdv.call("ItemSearch", {
//                BrowseNode: "548206",
//                SearchIndex: "Books",
//                MinimumPrice: "1000",
//                MaximumPrice: "1000",
//                ResponseGroup: "SalesRank,ItemAttributes",
//                Sort: "salesrank",
//                ItemPage: pageNum
//            }, next);
//        },
        function(next) {
            pageNum++;
            prodAdv.call("BrowseNodeLookup", {
                BrowseNodeId: "466284"
            }, next);
        },
        function(result, next) {
            // 第二个function, 查询到的信息登录到数据库
            console.log("pageNum:"+pageNum);
            console.log("Result from amazon", result);
            console.log(result.BrowseNodes.BrowseNode.Children);
            console.log(result.BrowseNodes.BrowseNode.Ancestors);

//            var items = result.Items.Item;
//            if(!items) {
//                return next("No Item"); // 别忘return
//            }

//            console.log(result.BrowseNodes.BrowseNode.TopSellers);
//            console.log(result.BrowseNodes.BrowseNode.TopItemSet);

            //for (var i = 0; i < items.length; i++) {
            //    console.log(items[i]);
            //}

            // 把数据填进数据库，因为mongodb保存数据用的都是异步回调，这里用async来解决
            // async文档: https://github.com/caolan/async
            // each有三个方法, async.each全异步并发，async.eachSeries一个一个执行，async.eachLimit可以设定并发数
            // 查询得到的数据可能存在排序问题，所以先用async.eachSeries来填到数据库里

//            async.eachSeries(items, function (item, next) {
//                console.log("pageNum:"+pageNum);
//                bookDao.create(item, next);
//            }, next)
        }
    ], function(err, result) {
        if (err) {
            return res.json({
                error: err
            });
        } else {
            return res.json({
                result: "OK"
            });
        }
    });
    return res.json({"data":"ok"});


    //根据ID 搜索详细，获取单个商品详细内容。
//    prodAdv.call("ItemLookup", {ItemId: "4121023005", ResponseGroup:"SalesRank"}, function(err, result) {
//
//        console.log(err);
//        console.log(result.Items.Item);
//    });
});

/* GET test page. */
router.get('/test', function (req, res) {

    //later
    var aws = require("aws-lib");

    prodAdv = aws.createProdAdvClient('AKIAIT3AEIDR54CLXCAA', 'iA2hLHPySFIK9iJifAraJJOJrP5iDm01pjuBDdXZ', 'lb90518-22');
    later.date.localTime();

    var minimumPrice = 950;
    var interval = 50;

    var pageNum = 1;

    var priceSched = later.parse.recur().every(30).second(),
        priceTimer = later.setInterval(function(){
            minimumPrice = minimumPrice + interval;
            if(minimumPrice == 100100){
                console.log("minnimumPrice>"+minimumPrice);
                interval = 100000;
            } else if(minimumPrice == 500000){
                console.log("minnimumPrice>"+minimumPrice);
                priceTimer.clear();
                return res.json({data:"ok"});
            } else {

                var pageSched = later.parse.recur().every(2).second(),
                    t = later.setInterval(function () {
                        async.waterfall([
                            function (next) {


                                // 第一个function, 查询信息
                                prodAdv.call("ItemSearch", {
                                    BrowseNode: "465610",
                                    SearchIndex: "Books",
                                    MinimumPrice: minimumPrice,
                                    MaximumPrice: minimumPrice+interval,
                                    ResponseGroup: "SalesRank,ItemAttributes",
                                    Sort: "salesrank",
                                    ItemPage: pageNum
                                }, next);
                            },
                            function (result, next) {
                                // 第二个function, 查询到的信息登录到数据库
                                console.log("pageNum:" + pageNum);
                                console.log("Result from amazon", result);
                                var items = result.Items.Item;
                                if (!items) {
                                    return next("No Item"); // 别忘return
                                }

                                bookDao.create(items, next);
                                var totalPage = parseInt(result.Items.TotalPages);

                                if (pageNum == 10) {
                                    t.clear();
                                    console.log("page timer Clear");
                                    pageNum = 1;
                                } else if(pageNum == totalPage){
                                        t.clear();
                                        console.log("page timer Clear");
                                        pageNum = 1;
                                } else {
                                    pageNum++;
                                }

                            }
                        ], function (err, result) {
                            console.log("err:",err);
                            console.log("minimumPrice:"+minimumPrice)
//                            if (err) {
//                                return res.json({
//                                    error: err
//                                });
//                            } else {
//                                return res.json({
//                                    result: "OK"
//                                });
//                            }
                        });
                    }, pageSched);
            }

        },priceSched);
});

module.exports = router;
