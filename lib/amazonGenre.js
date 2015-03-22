var NodeCache = require('node-cache');
var jsonfile = require('jsonfile');
var path = require('path');

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
    includeChildren = includeChildren || false;

    (function () {
        var currentNode = arguments[0];

        if (!currentNode) return;

        if (currentNode.BrowseNodeId === nodeId) {
            if (!includeChildren) {
                delete currentNode.Children;
            }
            result = currentNode;
            return;
        }

        if (currentNode.Children && currentNode.Children.length > 0) {
            for (var j = 0; j < currentNode.Children.length; j++) {
                arguments.callee(currentNode.Children[j]);
            }
        }
    })(rootNode);

    return result;
};

/**
 * 给定一个节点，返回父节点
 * @param nodeId
 * @param includeChildren 是否包含子结点，default is false
 * @return 父节点
 */
var findParent = exports.findParent = function (nodeId, includeChildren) {

    var result = null;
    includeChildren = includeChildren || false;

    (function () {
        var currentNode = arguments[0];

        if (!currentNode || currentNode.BrowseNodeId === nodeId) {
            return;
        }

        if (currentNode.Children && currentNode.Children.length > 0) {
            for (var i = 0; i < currentNode.Children.length; i++) {
                var n = currentNode.Children[i];
                if (n && n.BrowseNodeId === nodeId) {
                    if (!includeChildren) {
                        delete currentNode.Children;
                    }
                    result = currentNode;
                    return;
                }
            }

            for (var j = 0; j < currentNode.Children.length; j++) {
                arguments.callee(currentNode.Children[j]);
            }
        }
    })(rootNode);

    return result;
};