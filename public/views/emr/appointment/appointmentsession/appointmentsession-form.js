(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentSessionFormController', appointmentSessionFormController);

    function appointmentSessionFormController($scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id) || 0;

        if (!$scope.currentcontext.id && $scope.$parent && $scope.$parent.currentcontext && $scope.$parent.currentcontext.id) {
            $scope.currentcontext.id = $scope.$parent.currentcontext.id;
        }

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            StartDate: new Date()
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                sessionId: $scope.currentcontext.id,
                item: $scope.item,
                lookup: $scope.lookup || {}
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            $timeout(function () {
                if (actionName === 'backToList') {
                    $scope.backToList();
                } else if (actionName === 'saveComplete') {
                    if (payload && payload.id) {
                        $scope.currentcontext.id = payload.id;
                        if ($scope.$parent && $scope.$parent.currentcontext) {
                            $scope.$parent.currentcontext.id = payload.id;
                        }
                    }
                    $scope.refreshReactProps();
                } else if (actionName === 'addNew') {
                    $scope.currentcontext.id = 0;
                    $scope.refreshReactProps();
                }
            });
        };

        $scope.backToList = function () {
            $state.go('app.appointmentsessions');
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (!hasError && data) {
                $scope.item = data;
                if ($scope.$parent && $scope.$parent.currentcontext && data.DoctorId) {
                    $scope.$parent.currentcontext.selecteddocid = data.DoctorId;
                }
            }
            $scope.refreshReactProps();
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
            } else {
                $scope.refreshReactProps();
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AppointmentSessionType" },
                { "Key": "SessionType" },
                { "Key": "Facility" },
                { "Key": "Clinic" },
                { "Key": "Speciality" },
                { "Key": "Resource" },
                { "Key": "AppointmentSlotType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    appointmentSessionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();