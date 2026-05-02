(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('AppttokenController', AppttokenController);
    function AppttokenController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            TokenStatusId: 2
        };
        // $scope.addNew = function (Id) {
        //     utl.Modal.open('app.appttokenfilter', {
        //         params: { id: Id }, confirmCallback: $scope.initLookup
        //     }
        //     );
        // }
        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }
        $scope.addNew = function () {
            $scope.openModal($scope.currentfilter.LocationId);
        }
        // $scope.backToList = function () {
        //     $scope.confirmCallback();
        // }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.appnmttokendisplay', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }
        $scope.initLookup = function () {
            var inputData = [
               { "Key": "DisplayNo" },
               { "Key": "QmsLocation" },
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
    AppttokenController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];
})();