(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('apptmultiSessionListController', apptmultiSessionListController);

    function apptmultiSessionListController($scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            AppointmentSessionTypeId: -1,
            DoctorId: -1,
            SpecialityId: -1,
            ActiveStatusId: 2
        };

        if ($scope.$parent && $scope.$parent.currentcontext && $scope.$parent.currentcontext.selecteddocid) {
            $scope.currentfilter.DoctorId = $scope.$parent.currentcontext.selecteddocid;
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                doctorId: $scope.currentfilter.DoctorId,
                parentSessionId: $scope.$parent && $scope.$parent.currentcontext ? $scope.$parent.currentcontext.id : 0,
                currentfilter: $scope.currentfilter
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            $timeout(function () {
                if (actionName === 'backToList') {
                    $state.go('app.appointmentsessions');
                } else if (actionName === 'getList') {
                    $scope.refreshReactProps();
                }
            });
        };

        $scope.refreshReactProps();
    }

    apptmultiSessionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();