var NodeCache = require('node-cache');
var jsonfile = require('jsonfile');
var path = require('path');
var _ = require('underscore');

var rootNode = jsonfile.readFileSync(path.join(__dirname, './AmazonGenreData.json'));

/**
 * 获取所有叶分类节点
 * @returns {Array}
 */
var getLeafGenreList = exports.getLeafGenreList = function () {
    var result = [];

    (function () {
        var currentNode = arguments[0];
        if (!currentNode.Children || currentNode.Children.length === 0) {
            result.push(currentNode);
        } else {
            for (var index = 0; index < currentNode.Children.length; index++) {
                arguments.callee(currentNode.Children[index]);
            }
        }
    })(rootNode);

    return result;
};

/**
 * 获取根节点
 * @type {Object}
 */
var getRootGenre = exports.getRootGenre = function () {
    return rootNode;
};

/**
 * 查找节点
 * @param nodeId 节点ID
 * @param includeChildren 是否包含子结点，default is false
 * @return 该节点
 */
var findNode = exports.findNode = function (nodeId, includeChildren) {

    var result = null;
    var finder = function(node) {
        if (node.BrowseNodeId == nodeId) {
            result = node;
            return false;
        }
        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(function (e) {
                return finder.call(this, e);
            });
        }
    };

    finder.call(this, rootNode);

    if (!includeChildren && result.Children) {
        result = _.omit(result, 'Children');
    }
    return result;
};

/**
 * 给定一个节点，返回父节点
 * @param nodeId
 * @param includeChildren 是否包含子结点，default is false
 * @return 父节点
 */
var findParent = exports.findParent = function (nodeId) {

    var paths = [];

    var found = false;
    var finder = function(node) {
        if(paths.length < 1) {
            paths.push(_.omit(node, 'Children'));
        }

        if(node.BrowseNodeId == nodeId) {
            result = node;
            found = true;
            return false;
        }
        if (node.Children && node.Children.length > 0) {
            for (var i = 0; i < node.Children.length; i++) {
                paths.push(_.omit(node.Children[i], 'Children'));
                finder.call(this, node.Children[i]);
                if (!found) {
                    paths.pop();
                } else {
                    break;
                }
            }
        }
    };

    finder.call(this, rootNode);
    return paths;
};