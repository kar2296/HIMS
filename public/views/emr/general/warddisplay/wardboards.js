(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('wardboardController', wardboardController);
    function wardboardController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        // $scope.addNew = function (Id) {
        //     utl.Modal.open('app.wardfilter', {
        //         params: { id: Id }, confirmCallback: $scope.initLookup
        //     }
        //     );
        // }
        
        $scope.Items = [];
        $scope.currentfilter = {
            WardId: -1
        };
        $scope.addNew = function () {
            $scope.openModal($scope.currentfilter.WardId);
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.warddisplay', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Ward" },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.initLookup();

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
    }
    wardboardController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];
})();