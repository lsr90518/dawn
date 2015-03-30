var router = require('express').Router();
var async = require('async');
var bookDao = require('../lib/bookDao');
var later = require('later');
var amazonGenre = require('../lib/amazonGenre.js');
var aws = require("aws-lib");
prodAdv = aws.createProdAdvClient('AKIAIT3AEIDR54CLXCAA', 'iA2hLHPySFIK9iJifAraJJOJrP5iDm01pjuBDdXZ', 'lb90518-22', {
    host: "ecs.amazonaws.jp"
});


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

    var price = 1000;
    //later
    later.date.localTime();

    console.log("Now:" + new Date());
    var pageNum = 1;
    var i = 0;
    var currentBrowseId = 0;
    var totalpage = 0;
    var sched = later.parse.recur().every(7).second(),
        t = later.setInterval(function () {
            async.waterfall([
                function (next) {
                    currentBrowseId = amazonGenre.getLeafGenreList()[i].BrowseNodeId;
                    console.log(currentBrowseId);
                    console.log("pageNum:" + pageNum);
                    console.log("price:" + price);
                    next();
                },
                function (next) {
                    prodAdv.call("ItemSearch", {
                        BrowseNode: currentBrowseId,
                        SearchIndex: "Books",
                        MinimumPrice: price,
                        MaximumPrice: price*10,
                        ResponseGroup: "SalesRank,ItemAttributes",
                        Sort: "salesrank",
                        ItemPage: pageNum
                    }, next);
                },
                function (result, next) {
                    // 第二个function, 查询到的信息登录到数据库
                    totalpage = result.Items.TotalPages;
                    console.log("total page:" + totalpage);
                    var items;
                    if(result.Items.Item) {
                        console.log("Result from amazon", result.Items.Item);
                        items = result.Items.Item;
                    }
                    if(result.Items.Request.Errors){
                        console.log(result.Items.Request.Errors);
                    }

                    bookDao.create(items, next);
                    if(i == 3368){
                        t.clear();
                    }
                    next();
                },
                function (next) {
                    pageNum++;
                    if (pageNum > totalpage || pageNum == 11) {
                        // 价格+1
                        pageNum = 1;
                        price = price * 10;
                    }
                    if(price == 100000){
                        i++;
                        price = 1000;
                    }
                }
            ], function (err, result) {
                if (err) {
                } else {
                    return res.json({
                        result: "OK"
                    });
                }
            });

        }, sched);
    return res.json({"data": "ok"});

});

/* GET test page. */
router.get('/test', function (req, res) {

    var price = 1000;
    //later
    later.date.localTime();

    console.log("Now:" + new Date());
    var pageNum = 1;
    var i = 0;
    var currentBrowseId = 0;
    var totalpage = 0;
    var sched = later.parse.recur().every(5).second(),
        t = later.setInterval(function () {
            async.waterfall([
                function (next) {
                    currentBrowseId = amazonGenre.getLeafGenreList()[i].BrowseNodeId;
                    console.log(currentBrowseId);
                    console.log("pageNum:" + pageNum);
                    console.log("price:" + price);
                    next();
                },
                function (next) {

                    // 第一个function, 查询信息
                    //根据关键字，暧昧搜索，获得搜索结果链接，详细内容。
                    prodAdv.call("ItemSearch", {
                        BrowseNode: currentBrowseId,
                        SearchIndex: "Books",
                        MinimumPrice: price,
                        MaximumPrice: price*10,
                        ResponseGroup: "SalesRank,ItemAttributes",
                        Sort: "salesrank",
                        ItemPage: pageNum
                    }, next);
                },
                function (result, next) {
                    // 第二个function, 查询到的信息登录到数据库
                    totalpage = result.Items.TotalPages;
                    console.log("total page:" + totalpage);
                    if(result.Items.Item) {
                        console.log("Result from amazon", result.Items.Item);
                    }
                    if(result.Items.Request.Errors){
                        console.log(result.Items.Request.Errors);
                    }

//                    bookDao.create(items, next);
                    if(i == 3368){
                        t.clear();
                    }
                    next();
                },
                function (next) {
                    pageNum++;
                    if (pageNum > totalpage || pageNum == 11) {
                        // 价格+1
                        pageNum = 1;
                        price = price * 10;
                    }
                    if(price == 100000){
                        i++;
                        price = 1000;
                    }
                }
            ], function (err, result) {
                if (err) {
//                    console.log(err)
//                    return res.json({
//                        error: err
//                    });
                } else {
                    return res.json({
                        result: "OK"
                    });
                }
            });

        }, sched);


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
