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
        /*----------  all constants used within the app  ----------*/
        .constant('_', window._)
        .constant('CONFIG', {
            toastPositionTR: "top right",
            toastPositionTL: "top left",
            toastPositionBL: "bottom left",
            toastPositionBR: "bottom right"
        })
        /*----------  loading icons used within the app  ----------*/
        .config(['$mdIconProvider', function($mdIconProvider){
            $mdIconProvider
                    .iconSet('avatars', 'app/images/icons/avatar-icons.svg', 24)
                    .iconSet('navigation', 'app/images/icons/svg-sprite-navigation.svg', 24)
                    .iconSet('content', 'app/images/icons/svg-sprite-content.svg', 24);
        }])
        .run(['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
            $rootScope.$on('$stateChangeStart', function (event, toState) {
                $rootScope.progressbar.start();
                /*----------  section below can be used is authentication is required. ----------*/
                // // if logged in, user cannot see login screen.
                // if (toState.name == "login") {
                //     if (authService.isLoggedIn()) {
                //         $state.transitionTo("dashboard");
                //         event.preventDefault();
                //     }
                // }

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

            /*----------  checks for online and offline state  ----------*/
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

            /*----------  attaches lodash to the window for use with angular. Read: http://stackoverflow.com/a/25086064  ----------*/
            $rootScope._ = window._;
        }])
        /*======================================
         =            App controller            =
         ======================================*/
        /*----------  Maintaining everything within one controller since no routing happens  ----------*/

        .controller("AppCtrl", ['$scope', '$rootScope', 'ngProgressFactory', '$mdMedia', '$mdDialog', '$mdSidenav', 'socket', 'sessionService', function ($scope, $rootScope, ngProgressFactory, $mdMedia, $mdDialog, $mdSidenav, socket, sessionService) {
            /*----------  initializing variables  ----------*/
            $rootScope.progressbar = ngProgressFactory.createInstance();
            $rootScope.progressbar.setColor('#f1582c');
            $scope.mdMedia = $mdMedia;
            $scope.user = {};
            var payloadID = 0;
            var originatorEvent;

            /*----------  initializing chat box and all variables used with it  ----------*/
            $scope.initChatHistory = function () {
                var users = [{
                    id: 0,
                    userName: "User 1",
                    selectedFlag: false,
                    avatar: 'svg-1',
                    messageDump: []
                }, {
                    id: 1,
                    userName: "User 2",
                    selectedFlag: false,
                    avatar: 'svg-2',
                    messageDump: []
                }, {
                    id: 2,
                    userName: "User 3",
                    selectedFlag: false,
                    avatar: 'svg-3',
                    messageDump: []
                }, {
                    id: 3,
                    userName: "User 4",
                    selectedFlag: false,
                    avatar: 'svg-4',
                    messageDump: []
                }, {
                    id: 4,
                    userName: "User 5",
                    selectedFlag: false,
                    avatar: 'svg-5',
                    messageDump: []
                }, {
                    id: 5,
                    userName: "User 6",
                    selectedFlag: false,
                    avatar: 'svg-6',
                    messageDump: []
                }];
                /*----------  get users from local storage to check if a previous list exists  ----------*/
                $scope.users = angular.copy(sessionService.getUsers() || []);
                if( $scope.users.length == 0 ){
                    /*----------  if list doesn't exist set the users list  ----------*/
                    sessionService.setUsers(users);
                    $scope.users = angular.copy(users);
                }
                /*----------  "activeMessageDump" is the variables that is used to render the list of users messages  ----------*/
                $scope.activeMessageDump = angular.copy([]);
            };
            $scope.initChatHistory();

            /**
             Section contains helper functions used within the app:
             - all functions below are used as helpers for either the UI or data manipulation within the app.
             **/

            $scope.closeSideBar = function () {
                $mdSidenav('left').toggle()
                        .then(function (retObj) {
                            console.log(retObj, 'done');
                        });
            };

            $scope.resetSelectedFlag = function(){
                _.map($scope.users, function(obj){ return obj.selectedFlag = false; });
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

            $scope.openOptionsMenu = function ($mdOpenMenu, event) {
                originatorEvent = event;
                $mdOpenMenu(event);
            };

            socket.on('Get:Message', function (retObj) {
                $scope.users[retObj.userId].messageDump.push(retObj);
                sessionService.updateUserMessageDump(retObj.userId, $scope.users[retObj.userId].messageDump);
            });

            /**
             Section contains functions used within the app:
             - selectUser: refreshes the selected user in the list of users.

             - postMessageToBoard: Posts a message to the backend and performs check to see is a user is selected.
             it also stores the messages in local storage for offline use.

             - clearHistory: used to clear either all or selected user's chat history.
             **/

            $scope.selectUser = function(user){
                $scope.resetSelectedFlag();
                user.selectedFlag = true;
                $scope.activeMessageDump = user.messageDump;
                $scope.filterUsers = "";
            };

            $scope.postMessageToBoard = function ($evt) {
                if( $scope.user.message == "" || (typeof $scope.user.message == 'undefined') ) return false;
                var selectedUser = $scope.getSelectedUserIndex();

                if( selectedUser != -1 ){
                    /*----------  since we are mimicking a backend DB, payloadID is used to maintain the last id of the message in the user's messageDump ----------*/
                    if( $scope.users[selectedUser].messageDump.length ){
                        payloadID = $scope.users[selectedUser].messageDump[$scope.users[selectedUser].messageDump.length - 1].id + 1;
                    }else{
                        payloadID = 0;
                    }
                    var postData = {id: payloadID, text: $scope.user.message, sentBy: 'me', createdAt: new Date(), userId: $scope.users[selectedUser].id };
                    $scope.users[selectedUser].messageDump.push( postData );

                    /*----------  postData, containing all message data, is emitted to the server ----------*/
                    socket.emit('Send:Message', postData);

                    /*----------  reset the message text field and update the localStorage. Incrementing the payloadID to mimic a DB. ----------*/
                    $scope.user = angular.copy({});
                    sessionService.updateUserMessageDump(postData.userId, $scope.users[postData.userId].messageDump);
                    payloadID++;
                }else{
                    $scope.noUserSelectedAlert($evt);
                }

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
        /*=====  End of App controller  ======*/
        /*===============================
         =            Routing            =
         ===============================*/
        /*----------  Routing is not needed within this app. However, it is placed if needed in the future. ----------*/

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

        /*=====  End of Routing  ======*/
