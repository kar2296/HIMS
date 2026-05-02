(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtcnMLCSectionController', discasshtcnMLCSectionController);

    function discasshtcnMLCSectionController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {};
        $scope.item.IncidentDate = new Date();
        $scope.consultlist = [];
        $scope.mlcOfficerDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter)
            $scope.currentcontext.doctid = $scope.currentcontext.encounter.DoctorId;

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.ConsultationId = $scope.currentcontext.cid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.DoctorId = $scope.currentcontext.doctid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var data = data.Data[0];
                $scope.item = data;
                $scope.currentcontext.id = $scope.item.Id;
                $scope.mlcOfficerDetails = data.EncounterMLCOfficers;
                vm.gridConfig.data = $scope.mlcOfficerDetails;
            }
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.cid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'Visit/EncounterMLC/GetEncounterMLCs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.EncounterId
            };
            var options = {
                action: 'Visit/EncounterMLC/PrintEncounterMLC',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.populateGrid
            });
        }
        $scope.openattachments = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.item.PatientId, itemid: $scope.item.Id, objecttypeid: 2 },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }
        $scope.referredBy = function () {
            $scope.openModal('app.admissiontab.admissionreferral', { admissionreferralid: 0 });
        }
        $scope.guarantor = function () {
            $scope.openModal('app.admissiontab.admissionguarantor', { admissionguarantorid: 0 });
        }
        $scope.diagnosis = function () {
            $scope.openModal('app.admissiontab.admissiondiagnosis', { admissiondiagnosisid: 0 });
        }

        $scope.addNewMLCOfficer = function () {
            $scope.openModal('app.admissiontab.mlcofficer', { mlcoffid: 0 });
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        $scope.saveItem = function () {

            var actionName = 'encounter/encountermlc/AddEncounterMLC';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'encounter/encountermlc/UpdateEncounterMLC';
            }
            var inputData = {
                Data: $scope.item,
            };
            inputData.Data.Details = $scope.mlcOfficerDetails;
            $scope.item.MLCStatusId = 1;

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.backToList = function () {
            $state.go('patientemr.dischargecasesheets', { pid: $scope.currentcontext.pid });
        }
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getItem();
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getItem();
        }

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            if (item.Id || item.Id > 0) {
                var options = {
                    action: 'Visit/EncounterMLCOfficer/DeleteEncounterMLCOfficer',
                    data: { Id: item.Id },
                    type: 'post',
                    onComplete: $scope.deleteItemCallback
                };
                utl.Http.doAction(options);
            } else {
                var idx = $scope.mlcOfficerDetails.indexOf(item);
                $scope.mlcOfficerDetails.splice(idx, 1);
            }
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == "delete")
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity, row.entity.OfficerName);
        }

        $scope.populateGrid = function (data) {
            if (data.OfficerName && data.OfficerName.length > 0) {
                $scope.mlcOfficerDetails.push(data);
            }
            vm.gridConfig.data = $scope.mlcOfficerDetails;
            // vm.gridConfig.pagerObj.totalItems = $scope.mlcOfficerDetails.length;
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "OfficerName", displayName: $translate.instant('mlc-list.officername.lbl') },
                { field: "Designation", displayName: $translate.instant('mlc-list.designation.lbl') },
                { field: "ContactNo", displayName: $translate.instant('mlc-list.contactnumber.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ]
        };
        //viewConsultation
        $scope.viewConsultation = function (item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: { cid: item.Id, pid: $scope.currentcontext.pid }
            });
        }
        //previousnotes
        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.consultlist = res.Data;
            // consultlist = res.Data;
        };
        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.pid },
                    { Key: 11, Value: 2 },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };
        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
            //loadSectionData();
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {

                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: $scope.currentcontext.cid },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "EscortType" },
                { "Key": "EscortUser" },
                { "Key": "AccidentType" },
                {
                    "Key": 'Doctor',
                    Request: {
                        Params: [{ Key: 5, Value: 2 }]

                    }
                },
                { "Key": "PatientStatus" },
                { "Key": "MlcType" }
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
        $scope.getItem();
        $scope.getCurrentConsultation();
    }
    discasshtcnMLCSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();