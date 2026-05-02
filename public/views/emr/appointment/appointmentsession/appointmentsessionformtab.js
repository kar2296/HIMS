(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('apptSessionFormTabController', apptSessionFormTabController);

    function apptSessionFormTabController($scope, $stateParams, $state, $translate, utl) {

        $scope.tabs = [
            { title: $translate.instant('appointment.appointmentsessionformtab.appointments.lbl'), state: 'app.appointmentsessionformtab.appointmentsession', canDisable: false },
            { title: $translate.instant('appointment.appointmentsessionformtab.multiappointments.lbl'), state: 'app.appointmentsessionformtab.appointmentmultisession', canDisable: false }
        ];
        $scope.item = {};
        $scope.currentcontext = {
            childstate: $state.current.name,
            selecteddocid: -1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.canActive = function (tab) {
            return tab.state == $scope.currentcontext.childstate;
        };

        $scope.switchTab = function (tab) {
            $state.go(tab.state, { id: $scope.currentcontext.id });
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data && data.DoctorId) {
                $scope.currentcontext.selecteddocid = data.DoctorId;
            }
            $scope.switchTab($scope.tabs[0]);
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'appointment/AppointmentSession/GetAppointmentSessionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.switchTab($scope.tabs[0]);
            }
        };

        $scope.getItem();

    }

    apptSessionFormTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();