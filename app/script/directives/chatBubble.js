'use strict';

/**
 * @ngdoc directive
 * @name chatApp.directive: chatBubble
 * @description
 * # leftbar
 */
angular.module('chatApp')
    .directive('chatBubble', function () {
        return {
            restrict: 'AE',
            scope: {
                payload: '='
            },
            template: '<div class="messageWrapper {{payload.sentBy}}">' +
                '<div class="textWrapper"><p>{{payload.text}}</p></div>' +
            '</div>',
            link: function (scope, elems, attrs) {
                console.log(scope.payload);
            }
        }
    });