(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientImmunizationScheduleController', patientImmunizationScheduleController);

    function patientImmunizationScheduleController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            patientid: parseInt(utl.Session.getEMRPatientId())
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
        }

        //print chart code starts
        $scope.setChartDelegate = function (cmp) {
            $scope.chartcmp = cmp;
        };

        $scope.printChart = function () {
            if ($scope.chartcmp) {
                $scope.chartcmp.printchart();
            }
        }
        //print chart code ends
    }

    patientImmunizationScheduleController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();