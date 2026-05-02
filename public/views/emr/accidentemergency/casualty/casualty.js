
(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('massCasualtyController', massCasualtyController);

function massCasualtyController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   

    $scope.item = {
        IsEnabled : true
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);    

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: '',
                data: { Id : $scope.currentcontext.id},
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        $scope.getItem();
    }
    
    $scope.initLookup();
}

massCasualtyController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();