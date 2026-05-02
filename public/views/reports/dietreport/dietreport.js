(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietreportController', dietreportController);

    function dietreportController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        //Timeout
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.dailysalesandrevenuedetails = function () {
            $state.go('app.dailysalesandrevenuedetails')
        }
        $scope.monthlysalesandrevenuedetails = function () {
            $state.go('app.monthlysalesandrevenuedetails')
        }


    }
    dietreportController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();