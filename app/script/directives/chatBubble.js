'use strict';

/**
 * @ngdoc directive
 * @name chatApp.directive: chatBubble
 * @description
 * # chatBubble
 */
angular.module('chatApp')
    .directive('chatBubble', function () {
        return {
            restrict: 'AE',
            scope: {
                payload: '='
            },
            template: '<div class="messageWrapper {{payload.sentBy}}">' +
                '<div class="textWrapper animated bounceInUp">' +
                    '<p>{{payload.text}}</p>' +
                    '<small class="timeText">{{payload.createdAt | date:"mediumTime"}}</small>' +
                '</div>' +
            '</div>',
            link: function (scope, elems, attrs) {
            }
        }
    });