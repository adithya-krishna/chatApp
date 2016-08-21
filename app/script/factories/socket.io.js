'use strict';

/**
 * @ngdoc directive
 * @name chatApp.factory: socket.io
 * @description
 * # Used for Socket.IO events.
 * # Although Socket.IO exposes an io variable on the window, it's better to encapsulate it in AngularJS's Dependency Injection system. Read: http://goo.gl/hudViJ
 */

angular.module('chatApp')
    .factory('socket', function ($rootScope) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });