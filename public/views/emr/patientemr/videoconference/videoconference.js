(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VideoConferenceController', VideoConferenceController);

    function VideoConferenceController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            ScheduleDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        if ($stateParams.pid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        $scope.getvideoDataCallback = function (scope, res, options, hasError) {
            $scope.Conferences = res.Data;
        };

        $scope.getvideoData = function () {
            var From = $filter('date')($scope.currentfilter.ScheduleDate, 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')($scope.currentfilter.ScheduleDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.VirtualOrderStatusId
                    },
                ],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualConference/GetVirtualConferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvideoDataCallback
            };

            utl.Http.doAction(options);
        };

        $scope.videoconferenceCallback = function (scope, data, options, hasError) {
            $scope.conferenceId = options.data.conferenceId;
            $scope.moderateJoin();
        };

        $scope.videoconference = function (item) {
            var inputData = {
                conferenceId: item.Id,
            };
            var options = {
                action: 'VirtualHealthcare/VirtualConference/createRoom',
                data: inputData,
                type: 'post',
                onComplete: $scope.videoconferenceCallback
            };
            utl.Http.doAction(options);
        };

        $scope.moderateJoinCallback = function (scope, data, options, hasError) {
            $scope.ModerateData = data;
            window.open(data);
        };

        $scope.moderateJoin = function () {
            var inputData = {
                conferenceId: $scope.conferenceId,
            };
            var options = {
                action: 'VirtualHealthcare/VirtualConference/getModeratorJoinUrl',
                data: inputData,
                type: 'post',
                onComplete: $scope.moderateJoinCallback
            };
            utl.Http.doAction(options);
        };

        $scope.completecallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.virtual_dashboard();
        };

        $scope.checkoutorder = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to Complete this Order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnCompleteConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.OnCompleteConfirmed = function () {
            $scope.trackdata = {
                AppointmentId: $scope.vodata.AppointmentId,
                PatientId: $scope.currentcontext.pid,
                oid: $scope.orderid,
                DoctorId: $scope.vodata.DoctorId
            }
            var actionName = 'appointment/patienttracker/CheckoutPatient';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.trackdata
                },
                type: 'post',
                onComplete: $scope.completecallback
            };
            utl.Http.doAction(options);

        };

        $scope.doctor_dashboard = function () {
            $state.go('app.virtualdashboard');
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getvideoData();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "VirtualOrderStatus"
                },
                {
                    "Key": "VirtualCategory",
                },
                {
                    "Key": "VirtualSubCategory",
                }
            ]
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

    VideoConferenceController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();