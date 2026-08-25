(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorreportController', doctorreportController);

    function doctorreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', { context: 'doctorreport' })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'doctorreport' })
        }
        $scope.doctorlistreport = function () {
            $state.go('app.doctorlistreport', { context: 'doctorreport' })
        }
        $scope.wardandbedlist = function () {
            $state.go('app.wardandbedlistreport', { context: 'doctorreport' })
        }
        $scope.ipoccupancyreport = function () {
            $state.go('app.ipoccupancyreport', { context: 'doctorreport' })
        }
        $scope.availablebeds = function () {
            $state.go('app.availablebedsreports', { context: 'doctorreport' })
        }
        $scope.bedtransferreport = function () {
            $state.go('app.bedtransferreport', { context: 'doctorreport' })
        }
        
        $scope.backtoList = function () {
                $state.go('app.doctordashboard');           
        }

        // ---------------------------------------------------------------
        // REACT BRIDGE (UI-modernization retrofit, Billing / Dashboard
        // Reports launcher page). This is a pure navigation menu -- no
        // data fetch, so no reactProps mirroring is needed. AngularJS
        // still owns every real $state.go navigation function below;
        // React only dispatches action names, which fall through to the
        // matching real $scope function unchanged.
        $scope.handleReactAction = function (actionName, payload) {
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };

    }
    doctorreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();