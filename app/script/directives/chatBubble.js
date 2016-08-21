'use strict';

/**
 * @ngdoc directive
 * @name chatApp.directive: chatBubble
 * @description
 * # chatBubble directive is used in the app to display a user texts.
 * # Its scope is isolated and a link function can be added to perform actions on every chatBubble directive individually.
 */
angular.module('chatApp')
    .directive('chatBubble', function () {
        return {
            restrict: 'AE',
            scope: {
                payload: '='
            },
            template: '<div class="messageWrapper {{payload.sentBy}} animated fadeInUp">' +
                '<div class="textWrapper">' +
                    '<p>{{payload.text}}</p>' +
                    '<small class="timeText">{{payload.createdAt | date:"mediumTime"}}</small>' +
                '</div>' +
            '</div>',
        }
    });