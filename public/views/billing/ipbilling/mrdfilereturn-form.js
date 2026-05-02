(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDFileReturnsFormController', MRDFileReturnsFormController);

    function MRDFileReturnsFormController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.eid = parseInt($stateParams.eid);

        $scope.saveAndApprove = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you Want to send the file to MRD?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function() {
            $scope.item.MRDIPFileStatusId = 1;
            $scope.item.ReturnBy = utl.Session.getCurrentUserId();
            $scope.item.ReturnDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };
        $scope.backToList = function() {
            $state.go('app.mrdfilereturns');
        };
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            var actionName = 'IPManagement/MRDFiles/AddMRDFiles';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/MRDFiles/UpdateMRDFiles';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.MRDIPFileStatusId == 1) {
                $scope.item.DisplayStatus = 'Return to MRD'
            }
            if ($scope.item.MRDIPFileStatusId == 2) {
                $scope.item.DisplayStatus = 'Received at MRD'
            }
            if ($scope.item.MRDIPFileStatusId == 3) {
                $scope.item.DisplayStatus = 'Requested'
            }
            if ($scope.item.MRDIPFileStatusId == 4) {
                $scope.item.DisplayStatus = 'Transfered'
            }
            if ($scope.item.MRDIPFileStatusId == 5) {
                $scope.item.DisplayStatus = 'Received at Dept'
            }
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'IPManagement/MRDFiles/GetMRDFilesById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getEncounterCallback = function(scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            $scope.item.EncounterId = $scope.Encounter.Id;
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.TypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.DoctorId = $scope.Encounter.DoctorId;
            $scope.item.AdmissionDate = $scope.Encounter.AdmissionDate;
            $scope.item.DischargeDate = $scope.Encounter.DischargeDate;
            $scope.item.VisitNo = $scope.Encounter.VisitIdentifier;
            $scope.item.PatientMrn = $scope.Encounter.PatientMrn;
            if ($scope.Encounter.MRDIpFileId) {
                $scope.item.MRDIpFileId = $scope.Encounter.MRDIpFileId;
                $scope.currentcontext.id = $scope.item.MRDIpFileId;
            }
            if ($scope.Encounter.Doctor.Title) {
                $scope.item.DoctorName = $scope.Encounter.Doctor.Title.Description;
                if ($scope.Encounter.Doctor.FirstName)
                    $scope.item.DoctorName += ' ' + $scope.Encounter.Doctor.FirstName;
                if ($scope.Encounter.Doctor.LastName)
                    $scope.item.DoctorName += ' ' + $scope.Encounter.Doctor.LastName;
            }
            if ($scope.Encounter.Patient.Title) {
                $scope.item.PatientName = $scope.Encounter.Patient.Title.Description;
                if ($scope.Encounter.Patient.FirstName)
                    $scope.item.PatientName += ' ' + $scope.Encounter.Patient.FirstName;
                if ($scope.Encounter.Patient.LastName)
                    $scope.item.PatientName += ' ' + $scope.Encounter.Patient.LastName;
            }
            if ($scope.Encounter.Patient) {
                $scope.item.Age = $scope.Encounter.Patient.Age;
                $scope.item.DOB = $scope.Encounter.Patient.DOB;
            }
            if ($scope.Encounter.Patient) {
                if ($scope.Encounter.Patient.Gender) {
                    $scope.item.Gender = $scope.Encounter.Patient.Gender.Description;
                }
            }
            if ($scope.Encounter.Guarantor) {
                $scope.item.GuarantorName = $scope.Encounter.Guarantor.GuarantorName;
            }
        };

        $scope.getEncounters = function() {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.eid
                }]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getEncounters();

    }

    MRDFileReturnsFormController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();