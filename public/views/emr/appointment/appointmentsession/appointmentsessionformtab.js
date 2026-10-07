(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('apptSessionFormTabController', apptSessionFormTabController);

    function apptSessionFormTabController($scope, $stateParams, $state, $translate, utl, $timeout) {
        var sessionId = parseInt($stateParams.id) || 0;

        $scope.tabs = [
            {
                title: $translate.instant('appointment.appointmentsessionformtab.appointments.lbl'),
                state: 'app.appointmentsessionformtab.appointmentsession',
                canDisable: false
            },
            {
                title: $translate.instant('appointment.appointmentsessionformtab.multiappointments.lbl'),
                state: 'app.appointmentsessionformtab.appointmentmultisession',
                canDisable: sessionId === 0
            }
        ];

        $scope.currentcontext = {
            id: sessionId,
            childstate: $state.current.name,
            selecteddocid: -1
        };

        $scope.reactProps = {
            id: sessionId,
            activeState: $state.current.name,
            selectedDoctorId: -1,
            tabs: $scope.tabs
        };

        $scope.handleReactAction = function (actionName, payload) {
            $timeout(function () {
                if (actionName === 'backToList') {
                    $state.go('app.appointmentsessions');
                } else if (actionName === 'addNew') {
                    $state.go('app.appointmentsessionformtab', { id: 0 });
                } else if (actionName === 'switchTab') {
                    if (payload && payload.state) {
                        $state.go(payload.state, { id: sessionId });
                    }
                }
            });
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (!hasError && data && data.DoctorId) {
                $scope.currentcontext.selecteddocid = data.DoctorId;
                $scope.reactProps.selectedDoctorId = data.DoctorId;
            }
            $scope.$applyAsync();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'appointment/AppointmentSession/GetAppointmentSessionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItem();
    }

    apptSessionFormTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();