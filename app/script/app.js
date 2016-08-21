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
            'ngMessages',
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
        .run(['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
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

            $rootScope.online = navigator.onLine;
            $window.addEventListener("offline", function() {
                $rootScope.$apply(function() {
                    $rootScope.online = false;
                });
            }, false);

            $window.addEventListener("online", function() {
                $rootScope.$apply(function() {
                    $rootScope.online = true;
                });
            }, false);

            $rootScope._ = window._;
        }])
        .controller("AppCtrl", ['$scope', '$rootScope', 'ngProgressFactory', '$mdMedia', '$mdDialog', '$mdSidenav', 'socket', 'sessionService', function ($scope, $rootScope, ngProgressFactory, $mdMedia, $mdDialog, $mdSidenav, socket, sessionService) {
            $rootScope.progressbar = ngProgressFactory.createInstance();
            $rootScope.progressbar.setColor('#f1582c');
            $scope.mdMedia = $mdMedia;
            $scope.user = {};
            var payloadID = 0;
            var originatorEvent;

            $scope.initChatHistory = function () {
                var users = [
                    {
                        id: 0,
                        userName: "Adithya Krishna",
                        selectedFlag: false,
                        avatar: 'svg-1',
                        messageDump: []
                    },
                    {
                        id: 1,
                        userName: "Swetha Ududpa",
                        selectedFlag: false,
                        avatar: 'svg-2',
                        messageDump: []
                    },
                    {
                        id: 2,
                        userName: "Bhimeshwari",
                        selectedFlag: false,
                        avatar: 'svg-3',
                        messageDump: []
                    },
                    {
                        id: 3,
                        userName: "Basanti Devendra",
                        selectedFlag: false,
                        avatar: 'svg-4',
                        messageDump: []
                    },
                    {
                        id: 4,
                        userName: "Ben Dover",
                        selectedFlag: false,
                        avatar: 'svg-5',
                        messageDump: []
                    },
                    {
                        id: 5,
                        userName: "P. Ness",
                        selectedFlag: false,
                        avatar: 'svg-6',
                        messageDump: []
                    }
                ];
                // get users from local storage to check if a previous entry exists
                $scope.users = angular.copy(sessionService.getUsers()) || [];
                if( $scope.users.length == 0 ){
                    // if entry doesn't exist set and get the users
                    sessionService.setUsers(users);
                    $scope.users = users;
                }
                $scope.activeMessageDump = angular.copy([]);
            };
            $scope.initChatHistory();
            
            $scope.closeSideBar = function () {
                $mdSidenav('left').toggle()
                        .then(function (retObj) {
                            console.log(retObj, 'done');
                        });
            };

            $scope.resetSelectedFlag = function(){
                _.map($scope.users, function(obj){ return obj.selectedFlag = false; });
            };

            $scope.selectUser = function(user){
                $scope.resetSelectedFlag();
                user.selectedFlag = true;
                $scope.activeMessageDump = user.messageDump;
            };

            $scope.getSelectedUserIndex = function(){
                return _.findIndex($scope.users, function (obj) { return obj.selectedFlag });
            };

            $scope.noUserSelectedAlert = function ($evt) {
                var noUserSelectedAlter = $mdDialog.alert()
                        .title('No User Selected')
                        .textContent('Please select a user first')
                        .ariaLabel('select user')
                        .targetEvent($evt)
                        .ok('Ok');

                $mdDialog.show(noUserSelectedAlter);
            };

            $scope.postMessageToBoard = function ($evt) {
                if( $scope.user.message == "" || (typeof $scope.user.message == 'undefined') ) return false;
                var selectedUser = $scope.getSelectedUserIndex();

                if( selectedUser != -1 ){
                    if( $scope.users[selectedUser].messageDump.length ){
                        payloadID = $scope.users[selectedUser].messageDump[$scope.users[selectedUser].messageDump.length - 1].id + 1;
                    }else{
                        payloadID = 0;
                    }
                    var postData = {id: payloadID, text: $scope.user.message, sentBy: 'me', createdAt: new Date(), userId: $scope.users[selectedUser].id };
                    $scope.users[selectedUser].messageDump.push( postData );
                    socket.emit('Send:Message', postData);
                    $scope.user = angular.copy({});
                    sessionService.updateUserMessageDump(postData.userId, $scope.users[postData.userId].messageDump);
                    payloadID++;
                }else{
                    $scope.noUserSelectedAlert($evt);
                }

            };

            socket.on('Get:Message', function (retObj) {
                $scope.users[retObj.userId].messageDump.push(retObj);
                sessionService.updateUserMessageDump(retObj.userId, $scope.users[retObj.userId].messageDump)
            });

            $scope.openOptionsMenu = function ($mdOpenMenu, event) {
                originatorEvent = event;
                $mdOpenMenu(event);
            };

            $scope.clearHistory = function (mode, $evt) {
                if( mode === "all" ){
                    sessionService.destroy();
                    $scope.initChatHistory();
                }else{
                    var userId = $scope.getSelectedUserIndex();
                    if( userId != -1 ){
                        sessionService.clearUserMessageDump(userId);
                        $scope.users[userId].messageDump = angular.copy([]);
                        $scope.selectUser($scope.users[userId])
                    }else{
                        $scope.noUserSelectedAlert($evt);
                    }
                }
            };

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