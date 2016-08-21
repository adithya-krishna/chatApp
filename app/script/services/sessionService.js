'use strict';

/**
 * @ngdoc service
 * @name chatApp.service: sessionService
 * @description
 * # sessionService
 * # We use the browsers local storage to maintain chat offline.
 * # localStorage is used in this app for simplicity. In a live app, message dump service which stores encrypted data in files could be used.
 * # a similar method of storage is used by whatsapp.
 * # This service contains functions to perform required CRUD operations on the localStorage.
 *
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