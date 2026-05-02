(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientImmunizationScheduleController', patientImmunizationScheduleController);

    function patientImmunizationScheduleController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;


        $scope.currentcontext = {
            PatientId: parseInt(utl.Session.getPatientPortalPatientId())
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
        }
        $scope.Home = function () {
            $state.go('patientportal.portaldashboard');
        }
        $scope.back = function () {
            $state.go('patientportal.portalmyhealthrecord');
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

    patientImmunizationScheduleController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();