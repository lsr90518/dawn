(function(angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name dawnApp
     * @description
     *
     * # dawnApp
     *
     * Main module of the application.
     */
    //'ngAnimate',
    //    'ngCookies',
    //    'ngResource',
    //    'ngRoute'
    angular
        .module('dawnApp', ['ngRoute'
        ]).config(['$routeProvider', '$locationProvider',
            function($routeProvider, $locationProvider) {

                $routeProvider.when('/', {
                    templateUrl: 'views/MainView.html',
                    controller: 'MainController'
                });

                $routeProvider.otherwise({
                    redirectTo: '/'
                });
            }
        ]);
}(angular));
