(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargesummaryFormController', dischargesummaryFormController);

    function dischargesummaryFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }

        $scope.item = {
            NoteTypeId: 1
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.encounterid = parseInt($stateParams.eid);
        $scope.currentcontext.patientid = parseInt($stateParams.pid);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.encounterid = modalConfig.params.eid;
            $scope.currentcontext.patientid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else
                $state.go('patientportal.dischargesummary');

        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: loadData
            });
        };

        //Print
        $scope.print = function () {
            var inputData = {
                Id: $scope.item.EncounterId
            };
            var options = {
                action: 'DischargeSummary/patientcertificate/PrintPatientCertificate',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                $scope.item.EncounterId = encounter.Id
                $scope.currentcontext.patientid = encounter.PatientId;
                $scope.item.PatientId = encounter.PatientId
                $scope.item.WardId = encounter.WardId
                $scope.item.AdmissionStatusId = encounter.AdmissionStatusId
                $scope.item.VisitIdentifier = encounter.VisitIdentifier
                $scope.item.DoctorId = encounter.DoctorId
                $scope.item.DepartmentId = encounter.DepartmentId
                $scope.item.RoomId = encounter.RoomId
                $scope.item.BedId = encounter.BedId
                $scope.item.AdmissionDate = encounter.AdmissionDate;
                $scope.item.DischargeDate = encounter.DischargeDate;
                $scope.item.Patient = encounter.Patient;
            }
        };

        $scope.getEncounterById = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.encounterid },
                ]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };


        //get item
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            var dischargeTypeObj = utl.Lookup.getObject($scope.lookup.DischargeType, $scope.item.DischargeTypeId);
            var noteTemplateObj = utl.Lookup.getObject($scope.lookup.NoteTemplate, $scope.item.NoteTemplateId);
            var noteTypeObj = utl.Lookup.getObject($scope.lookup.NoteType, $scope.item.NoteTypeId);
            var deptObj = utl.Lookup.getObject($scope.lookup.Department, $scope.item.DepartmentId);
            var docObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DischargeTypeId = dischargeTypeObj.Text;
            $scope.item.NoteTemplateId = noteTemplateObj.TemplateName;
            $scope.item.NoteTypeId = noteTypeObj.Text;
            $scope.item.DepartmentId = deptObj.DepartmentName;
            $scope.item.DoctorId = docObj.Title.Description + ' ' + docObj.FirstName + ' ' + docObj.LastName;
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'DischargeSummary/PatientCertificate/GetPatientCertificateById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadData() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.getItem();
            } else {
                $scope.getEncounterById();
            }
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DischargeType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "NoteType" },
                { "Key": "Department" },
                { "Key": "AdmissionStatus" },
                { "Key": "NoteTemplate", Request: { Params: [{ Key: 1, Value: $scope.item.NoteTypeId }] } }
            ]
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

    dischargesummaryFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();