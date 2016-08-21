'use strict';

/**
 * @ngdoc service
 * @name chatApp.service: sessionService
 * @description
 * # sessionService
 * Service in the chatApp.
 */

angular.module('chatApp')
        .service('sessionService', ['$http', '$q', '$localStorage', function($http, $q, $localStorage){
            return{
                setUsers: function (users) {
                    $localStorage.users = users;
                    return true;
                },
                getUsers: function () {
                    return $localStorage.users
                },
                deleteUser: function (id) {
                    delete ($localStorage.users[id]);
                    return true;
                },
                getUserMessageDump: function (id) {
                    return $localStorage.users[id].messageDump
                },
                updateUserMessageDump: function (id, messageDump) {
                    $localStorage.users[id].messageDump = messageDump;
                    return true;
                },
                clearUserMessageDump: function (id) {
                    $localStorage.users[id].messageDump = [];
                    return true;
                },
                destroy: function () {
                    $localStorage.$reset();
                }
            }
        }]);