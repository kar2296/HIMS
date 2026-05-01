(function() {
  'use strict';

  angular.module('angular-focus-first-field', [])
    .directive('focusFirstField', function($timeout, $parse) {
      return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
          var inputs = $element.find('input');
          var attemptsLeft = parseInt($attrs.focusFirstFieldTimeoutAttempts);
          if (isNaN(attemptsLeft)) attemptsLeft = 5;

          function go() {
            var stop = false;
            var first = null;
            angular.forEach(inputs, function(input) {
              if (!first) {
                first = input;
              }

              var jqLiteInput = angular.element(input);
              var val = jqLiteInput.val();
              if (!stop && !val.length) {
                input.focus();
                stop = true;
              }
            });

            if (!stop && first) {
              first.focus();
            }
          }

          function attempt() {
            $timeout(function() {
              inputs = $element.find('input');
              if (--attemptsLeft >= 0) {
                check();
              }
            });
          }

          function check() {
            if (inputs.length) {
              go();
            }
            else {
              attempt();
            }
          }

          if ($parse($attrs.focusFirstFieldTrigger).assign) {
            $scope.$watch($attrs.focusFirstFieldTrigger, function(newValue) {
              if (newValue) {
                check();
              }
            });
          }
          else {
            $timeout(check);
          }
        }
      };
    });
})();
