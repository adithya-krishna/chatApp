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
        .controller("AppCtrl", ['$scope', '$rootScope', 'ngProgressFactory', '$mdMedia', '$mdDialog', '$mdSidenav', 'socket', function ($scope, $rootScope, ngProgressFactory, $mdMedia, $mdDialog, $mdSidenav, socket) {
            $rootScope.progressbar = ngProgressFactory.createInstance();
            $rootScope.progressbar.setColor('#f1582c');
            $scope.mdMedia = $mdMedia;
            $scope.user = {};
            var payloadID = 0;

            $scope.closeSideBar = function () {
                $mdSidenav('left').toggle()
                        .then(function (retObj) {
                            console.log(retObj, 'done');
                        });
            };

            $scope.users = [
                {
                    id: 0,
                    userName: "Adithya Krishna",
                    selectedFlag: false,
                    avatar: 'svg-1'
                },
                {
                    id: 1,
                    userName: "Swetha Ududpa",
                    selectedFlag: false,
                    avatar: 'svg-2'
                },
                {
                    id: 2,
                    userName: "Bhimeshwari",
                    selectedFlag: false,
                    avatar: 'svg-3'
                },
                {
                    id: 3,
                    userName: "Basanti Devendra",
                    selectedFlag: false,
                    avatar: 'svg-4'
                },
                {
                    id: 4,
                    userName: "Ben Dover",
                    selectedFlag: false,
                    avatar: 'svg-5'
                },
                {
                    id: 5,
                    userName: "P. Ness",
                    selectedFlag: false,
                    avatar: 'svg-6'
                }
            ];

            $scope.payload = [];

            $scope.resetSelectedFlag = function(){
                $scope.users.map(function(obj){
                    return obj.selectedFlag = false;
                });
            };

            $scope.selectUser = function(user){
                $scope.resetSelectedFlag();
                user.selectedFlag = true;
            };

            $scope.postMessageToBoard = function ($evt) {
                var selectedUser = $scope.users.filter(function(obj){ return obj.selectedFlag });

                if( selectedUser.length ){
                    $scope.payload.push( {id: payloadID, text: $scope.user.message, sentBy: 'me', createdAt: new Date() } );
                    socket.emit('Send:Message', {id: payloadID, text: $scope.user.message, sentBy: 'me', createdAt: new Date() });
                    $scope.user = angular.copy({});
                    payloadID++;
                }else{
                    var noUserSelectedAlter = $mdDialog.alert()
                            .title('No User Selected')
                            .textContent('Please select a user first')
                            .ariaLabel('select user')
                            .targetEvent($evt)
                            .ok('Ok');

                    $mdDialog.show(noUserSelectedAlter);
                }

            };

            socket.on('Get:Message', function (retObj) {
                $scope.payload.push(retObj);
            })

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