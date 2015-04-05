(function(angular) {
    'use strict';

    /**
     * @ngdoc function
     * @name reactionApp.controller:MainCtrl
     * @description
     * # MainCtrl
     * Controller of the dawnApp
     */
    angular.module('dawnApp')
        .controller('MainController', ['$rootScope', '$scope', '$location',
            function($rootScope, $scope, $location) {

                //$rootScope.$on('$routeChangeStart', function() {
                //    if (!$rootScope.me) {
                //        socket.emit('user:info', function(err, user) {
                //            if (err || !user) {
                //                location.href='/login';
                //                return;
                //            }
                //
                //            $rootScope.me = user;
                //        });
                //    }
                //    $rootScope.loading = true;
                //});
                //
                //$rootScope.$on('$routeChangeSuccess', function() {
                //    $rootScope.loading = false;
                //});
                //
                //
                //socket.on('unauthorized', function() {
                //    $location.path('/login');
                //});
                //
                //var scrollItems = [];
                //
                //for (var i = 1; i <= 100; i++) {
                //    scrollItems.push('Item ' + i);
                //}
                //
                //$scope.scrollItems = scrollItems;
                //$scope.invoice = {
                //    payed: true
                //};
                //
                //$scope.userAgent = navigator.userAgent;
                //
                //$scope.rooms = Room.roomStore;
            }
        ]);
}(angular));
