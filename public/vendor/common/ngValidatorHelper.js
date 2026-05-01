(function() {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngValidatorHelper', function (toastr) {
        
        var validateForm = function ($scope, item_form) {
            $scope.item_form.$triedSubmit = true;
            var result = $scope.item_form.$valid;
            return result;
        }

        return {
            validate : validateForm,
        };
    });

})();