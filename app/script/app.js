'use strict';

/**
 * @ngdoc overview
 * @name chatApp
 * @description
 * # chatApp
 *
 * Main module of the application.
 */

angular.module('chatApp',
        ['ui.router',
            'ngMaterial',
            'ngProgress.provider',
            'ngStorage'
        ])
        .constant('_', window._)
        .constant('CONFIG', {
            toastPositionTR: "top right",
            toastPositionTL: "top left",
            toastPositionBL: "bottom left",
            toastPositionBR: "bottom right"
        })
        .config(['$mdIconProvider', function($mdIconProvider){
            $mdIconProvider
                    .iconSet('avatars', 'app/images/icons/avatar-icons.svg', 24)
                    .iconSet('navigation', 'app/images/icons/svg-sprite-navigation.svg', 24)
                    .iconSet('content', 'app/images/icons/svg-sprite-content.svg', 24);
        }])
        .run(['$rootScope', '$state', function ($rootScope, $state) {
            $rootScope.$on('$stateChangeStart', function (event, toState) {
                $rootScope.progressbar.start();
                // if authentication is required
                // // if logged in, user cannot see login screen.
                // if (toState.name == "login") {
                //     if (authService.isLoggedIn()) {
                //         $state.transitionTo("dashboard");
                //         event.preventDefault();
                //     }
                // }
                //
                // // check if logged in
                // if (toState.authenticate && !authService.isLoggedIn()) {
                //     // here you can set states which can be viewed without logging in.
                //     $state.transitionTo("login");
                //     event.preventDefault();
                // }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, data) {
                $rootScope.progressbar.complete();
                $rootScope.currentState = $state.current.name;
            });

            $rootScope._ = window._;
        }])
        .controller("AppCtrl", ['$scope', '$rootScope', 'ngProgressFactory', '$mdMedia', '$mdSidenav', function ($scope, $rootScope, ngProgressFactory, $mdMedia, $mdSidenav) {
            $rootScope.progressbar = ngProgressFactory.createInstance();
            $rootScope.progressbar.setColor('#f1582c');
            $scope.mdMedia = $mdMedia;

            $scope.closeSideBar = function () {
                $mdSidenav('left').toggle()
                        .then(function (retObj) {
                            console.log(retObj, 'done');
                        });
            };

            $scope.payload = [
                {
                    id: 0,
                    text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto asperiores doloribus ea eaque eveniet obcaecati sit. Beatae, eligendi hic ipsam odio quae repellat ullam voluptatum? Aliquam autem dignissimos quis veniam?",
                    sentBy: "them",
                    createdAt: "2016-08-19T17:30:03.730Z"
                },
                {
                    id: 1,
                    text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto asperiores doloribus ea eaque eveniet obcaecati sit. Beatae, eligendi hic ipsam odio quae repellat ullam voluptatum? Aliquam autem dignissimos quis veniam?",
                    sentBy: "me",
                    createdAt: "2016-08-19T17:30:10.730Z"
                }
            ];

            $scope.users = [
                {
                    id: 0,
                    name: "Adithya Krishna",
                    avatar: 'svg-1'
                },
                {
                    id: 1,
                    name: "Swetha Ududpa",
                    avatar: 'svg-2'
                },
                {
                    id: 2,
                    name: "Bhimeshwari",
                    avatar: 'svg-3'
                },
                {
                    id: 3,
                    name: "Basanti Devendra",
                    avatar: 'svg-4'
                },
                {
                    id: 4,
                    name: "Ben Dover",
                    avatar: 'svg-5'
                },
                {
                    id: 5,
                    name: "P. Ness",
                    avatar: 'svg-6'
                }
            ]
        }])
        .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $locationProvider.html5Mode(false);
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('main', {
                    url: '/',
                    templateUrl: 'app/views/main.html',
                    controller: 'AppCtrl',
                    authenticate: false // if authentication is required
                });
        }]);