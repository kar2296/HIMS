(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('nursingreportController', nursingreportController);

    function nursingreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.ipadmissionreport', { context: 'nursingreport' })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'nursingreport' })
        }
        $scope.doctorlistreport = function () {
            $state.go('app.doctorlistreport', { context: 'nursingreport' })
        }
        $scope.wardandbedlist = function () {
            $state.go('app.wardandbedlistreport', { context: 'nursingreport' })
        }
        $scope.ipoccupancyreport = function () {
            $state.go('app.ipoccupancyreport', { context: 'nursingreport' })
        }
        $scope.availablebeds = function () {
            $state.go('app.availablebedsreports', { context: 'nursingreport' })
        }
        $scope.bedtransferreport = function () {
            $state.go('app.bedtransferreport', { context: 'nursingreport' })
        }
        
        $scope.backtoList = function () {
                $state.go('app.nursingdashboard');           
        }

    }
    nursingreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();