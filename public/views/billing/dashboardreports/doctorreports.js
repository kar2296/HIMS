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

    }
    doctorreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();