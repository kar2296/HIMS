(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newreportsController', newreportsController);

    function newreportsController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.SelectedAssetManageId = 1
        $scope.items = [];
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }  
        $scope.mrdfilesubmitdetailsreport = function () {
            $state.go('app.mrdfilesubmitdetailsreport', { context: 'mrdreports' })
        }


        
        $scope.backtoList = function () {
            $state.go('app.frontdashboard');
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
    }
    newreportsController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();