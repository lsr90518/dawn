/**
 * 直接用Node运行，重新生成AmazonGenreData.json
 */

var async = require('async');
var path = require('path');
var jsonfile = require('jsonfile');
var aws = require('aws-lib');
var debug = require('debug')('dawn');

var accessKeyId = 'AKIAIT3AEIDR54CLXCAA';
var secretAccessKey = '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';
var associateTag = 'lb90518-22';
var host = 'ecs.amazonaws.jp';

var client = aws.createProdAdvClient(accessKeyId, secretAccessKey, associateTag, {
    host: host
});

function loadGenreChildren(node, callback) {
    var nodeId;
    if (node.BrowseNodeId) {
        nodeId = node.BrowseNodeId;
    } else {
        nodeId = node;
        node = {
            BrowseNodeId: nodeId
        }
    }

    async.retry(20, function(retryCallback) {
        setTimeout(function () {
            debug("BrowseNodeLookup...");
            client.call("BrowseNodeLookup", {
                BrowseNodeId: nodeId
            }, function (err, result) {
                debug('loadGenre', {
                    err: err,
                    result: result
                });

                if (result && result.BrowseNodes && result.BrowseNodes.BrowseNode && result.BrowseNodes.BrowseNode.Children && result.BrowseNodes.BrowseNode.Children.BrowseNode) {

                    node.Children = result.BrowseNodes.BrowseNode.Children.BrowseNode;

                    debug('Find a node and its children', node);

                    if (node.Children.length === 0) {
                        debug('Children length == 0, return node', node);
                        return retryCallback(null, node);
                    } else {
                        debug('Loading children');
                        async.mapSeries(node.Children, function (n, next) {
                            debug('Loading child', n);
                            loadGenreChildren(n, function (err, r) {
                                debug('Child loaded', r);
                                return next(err, r);
                            });
                        }, function (err, results) {
                            debug("!!!!!!!!!All children loaded", results);
                            node.Children = results;
                            debug('Node changed to ', node);
                            return retryCallback(null, node);
                        });
                    }
                } else {
                    if(result.Error) {
                        debug("!!!!!!!!Error, retry................");
                        return retryCallback(result.Error);
                    } else {
                        debug('!!!!!!!!No children, skip', result);
                        node.Children = [];
                        return retryCallback(null, node);
                    }
                }
            });
        }, 3000);
    }, function(err, result) {
        callback(err, result);
    });
}

/**
 * Run
 */
(function () {
    var BOOK_ROOT_NODE_ID = 465610;
    loadGenreChildren(BOOK_ROOT_NODE_ID, function (err, root) {
        if (err) {
            return console.log(err);
        } else {
            var file = path.join(__dirname, './AmazonGenreData.json');
            jsonfile.writeFile(file, root, function (err) {
                console.log(err);
            });
            console.log(err, root);
        }
    });
})();
