(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('apnmttokenController', apnmttokenController);

    function apnmttokenController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = [];

        $scope.item = {
            // TokenStatusId:1,
            TokenNo: '',
            IsAudioRaised: false,
            OrganizationId: utl.Session.getCurrentOrgId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            EncounterId: utl.Session.getEncounterId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };
        $scope.currentcontext = {
            id: 0
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.aptid = parseInt(modalConfig.params.id);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.doctid = parseInt(modalConfig.params.doctid);
            $scope.currentcontext.room = parseInt(modalConfig.params.room);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.locid = parseInt(modalConfig.params.locid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.AppointmentId = $scope.currentcontext.aptid;
        $scope.item.DoctorId = $scope.currentcontext.doctid;
        $scope.item.RoomNoId = $scope.currentcontext.room;
        $scope.item.LocationId = $scope.currentcontext.locid;


        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.TokenNo = res.Data[0].TokenNo;
                $scope.item.DisplayNo = res.Data[0].DisplayNo;
                $scope.item.TokenStatusId = res.Data[0].TokenStatusId;
                $scope.item.RoomNoId = res.Data[0].RoomNoId;
                $scope.item.LocationId = res.Data[0].LocationId;
                $scope.currentcontext.id = res.Data[0].Id
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.aptid }
                ]
            };
            var options = {
                action: 'Appointment/AppointmentDisplay/GetAppointmentDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.save = function () {
            $scope.item.TokenStatusId = 1;
            $scope.saveItem();
        }
        $scope.onCall = function () {
            $scope.item.TokenStatusId = 2;
            $scope.saveItem();
        }
        $scope.call = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Call This Number?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCall,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.onReceive = function () {
            $scope.item.TokenStatusId = 3;
            $scope.saveItem();
        }
        $scope.receive = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Receive This Token?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onReceive,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.onMissed = function () {
            $scope.item.IsAudioRaised= true,
            $scope.item.TokenStatusId = 4;
            $scope.saveItem();
        }
        $scope.missed = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Mark it as Missed Token?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onMissed,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {
            $scope.item.TokenStatusId == 1 && $scope.item.TokenNo == 0
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'Appointment/AppointmentDisplay/AddAppointmentDisplay';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Appointment/AppointmentDisplay/UpdateAppointmentDisplay';
            }
            $scope.item.Id = $scope.currentcontext.id;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "QmsLocation" },
                { "Key": "TokenStatus" },
                { "Key": "Department" },
                { "Key": "DisplayNo" },
                { "Key": "OPDRoom" },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
    }
    apnmttokenController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();