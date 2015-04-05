var router = require('express').Router();
var async = require('async');
var bookDao = require('../lib/bookDao');


router.get('/', function (req, res) {
    bookDao.findAll({}, function (err, result) {

    });
});