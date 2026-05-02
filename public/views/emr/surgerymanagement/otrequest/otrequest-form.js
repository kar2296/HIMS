(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otrequestFormController', otrequestFormController);

    function otrequestFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.context = 'main';
        $scope.item = {
            isRequested: false,
            OTRequestedOn: utl.Formatter.getCurrentDate(),
            DisplayCertificateStatus: null,
            AnaesthesiaTypeId: 1,
            NoteTypeId: 1,
            EncounterId: utl.Session.getEncounterId()

        };
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.lookup = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.EncounterId = modalConfig.params.encounterid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.lookup = {};
        $scope.currentcontext = {
            patientAlertsCount: 0
        };
        $scope.currentcontext = {};
        $scope.currentcontext.patientid = parseInt($stateParams.pid);
        $scope.currentcontext.encounterid = parseInt($stateParams.eid);
        $scope.currentcontext.id = parseInt($stateParams.id);
        if ($scope.context == 'emr') {
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
            if ($scope.currentcontext.encounter) {
                $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            }
        }
        if ($stateParams.context) {
            $scope.currentcontext.context = $stateParams.context;
        }
        $scope.userid = utl.Session.getUserTypeId()
        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.item.ChiefSurgeonId = utl.Session.getCurrentUserId();
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.getEncounters()

        }
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }
        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };
        //Visibility rules starts

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.OTRequestStatusId == 2 || data.OTRequestStatusId == 3 || data.OTRequestStatusId == 4)
                $scope.item.isRequested = true;
            $scope.getCreatedUser();
            $scope.buttonVisiblity();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'OtManagement/OtRequest/GetOtRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else
                $scope.buttonVisiblity();
        };

        $scope.backToList = function () {
            if ($scope.context == 'main')
                $state.go('app.otrequests');
            if ($scope.context == 'emr')
                $state.go('patientemr.otrequests');
        }
        $scope.getCreatedUserCallback = function (scope, res, options, hasError) {
            $scope.CreatedUser = res.Data[0];
        };
        $scope.getCreatedUser = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.id }
                ]
            };
            var options = {
                action: 'OtManagement/OtRequest/GetOtRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCreatedUserCallback
            };

            utl.Http.doAction(options);
        };
        $scope.save = function () {
            $scope.saveItem(1); // Draft
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                itemId: 2,
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'otrequest-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions); // Created
        }
        $scope.onCancelConfirmed = function () {
            $scope.saveItem(4);// Completed
        }
        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'otrequest-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                // placeholder: $scope.item.ReceiptNumber,
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions, $scope.item.ReceiptNumber);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'OtManagement/OtRequest/DeleteOtRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.backToList();
        };
        $scope.saveDeleteRpt = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id);
            // Deleted
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            loadData();
        };
        $scope.addNew = function () {
            if ($scope.context == 'main')
                $state.go('app.otrequest', { id: 0 });
            else
                $state.reload();
            if ($scope.context == 'emr')
                $state.go('patientemr.otrequest', { id: 0 });
            else
                $state.reload();

        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }
        //  End
        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.Encounters = data.Data[0];
                $scope.item.EncounterId = $scope.Encounters.Id
                $scope.item.DoctorId = $scope.Encounters.DoctorId
                $scope.item.DepartmentId = $scope.Encounters.DepartmentId
                $scope.item.PatientId = $scope.Encounters.PatientId;
                // $scope.item.WardId = $scope.Encounters.WardId
                // $scope.item.AdmissionStatusId = $scope.Encounters.AdmissionStatusId
                // $scope.item.VisitIdentifier = $scope.Encounters.VisitIdentifier
                // $scope.item.RoomId = $scope.Encounters.RoomId
                // $scope.item.BedId = $scope.Encounters.BedId
                // $scope.item.AdmissionDate = $scope.Encounters.AdmissionDate
            }
        };
        $scope.getEncounters = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId },
                    // { Key: 15, Value: 2 }
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

        $scope.clear = function () {
            $state.reload();
        }
        // $scope.clear = function () {
        //     $scope.item = {};
        // }
        $scope.saveItem = function (status) {
            if ($scope.item.PatientId <= 0) {
                utl.Alert.showSuccessMsg($translate.instant('admission.selectthepatient.lbl'));
                return;
            }
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.OTRequestStatusId = status;
            var actionName = 'OtManagement/OtRequest/AddOtRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'OtManagement/OtRequest/UpdateOtRequest';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.buttonVisiblity = function () {
            if ($scope.currentcontext.id == 0) {
                $scope.CanShowSave = true;
                $scope.CanShowApprove = true;
                $scope.CanShowClear = true;
                $scope.CanShowCancel = false;
            }
            else if ($scope.currentcontext.id > 0) {
                $scope.CanShowClear = false;
                if ($scope.item.OTRequestStatusId == 1) {
                    $scope.CanShowSave = true;
                    $scope.CanShowApprove = true;
                    $scope.CanShowCancel = false;
                }
                if ($scope.item.OTRequestStatusId == 2) {
                    $scope.CanShowSave = true;
                    $scope.CanShowApprove = true;
                    $scope.CanShowCancel = true;
                }
                if ($scope.item.OTRequestStatusId == 3) {
                    $scope.CanShowSave = true;
                    $scope.CanShowApprove = true;
                    $scope.CanShowCancel = false;
                }
                if ($scope.item.OTRequestStatusId == 4) {
                    $scope.CanShowSave = false;
                    $scope.CanShowApprove = false;
                    $scope.CanShowCancel = false;
                }
                if ($scope.item.OTRequestStatusId == 4) {
                    $scope.CanShowSave = false;
                    $scope.CanShowApprove = false;
                    $scope.CanShowCancel = false;
                }
            }
        }
        function loadData() {
            $scope.getItem();
        }
        //autosearch related code starts for Doctors
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
            $scope.item.DoctorName = result;

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
        //autosearch related code ends for Doctors


        //autosearch related code starts for Anaesthisist
        vm.usercontrolconfig = {
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
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 11, Value: 1 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Anaesthisist

        //autosearch related code starts for Surgeons
        vm.surgeoncontrolconfig = {
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
            formatdisplay: formatselectedsurgeon,
            presearch: presearchsurgeon,
            postsearch: postsearchsurgeon
        };

        function formatselectedsurgeon() {
            var selectedItem = vm.surgeoncontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.surgeoncontrolconfig.rowdata) {
                result = [vm.surgeoncontrolconfig.rowdata.DoctorId, vm.surgeoncontrolconfig.rowdata.DoctorName,
                vm.surgeoncontrolconfig.rowdata.Qualification, vm.surgeoncontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchsurgeon() {
            var query = vm.surgeoncontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 12, Value: 1 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.surgeoncontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.surgeoncontrolconfig.searchparams = inputData;
        }

        function postsearchsurgeon() {
            for (var idx in vm.surgeoncontrolconfig.result) {
                var item = vm.surgeoncontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Surgeons

        //autosearch related code starts for SurgeryName
        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Procedure Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            $scope.item.SurgeryName = result;

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            //Search only nurse
            var inputData = {
                Params: [
                    // { Key: 3, Value: 10 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
            }
        }
        //autosearch related code ends for SurgeryName

        $scope.getSurgeryName = function () {
            $scope.Surgery = vm.procedurecontrolconfig.selected;
            $scope.item.SurgeryName = $scope.Surgery.ProcedureName;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ProcedureCategory" },
                { "Key": "SurgeryType" },
                { "Key": "Remark" },
                { "Key": "Priority" },
                // { "Key": "OTRoom" },
                { "Key": "Room", Request: { Params: [{ Key: 6, Value: 3 }] } },
                { "Key": "OTTechnician" },
                // { "Key": "Equipment" },
                { "Key": "RoomType" },
                { "Key": "Procedure" },
                { "Key": "Instruments" },
                {
                    Key: 'Nurse',
                    Request: {
                        Params: [{ Key: 5, Value: 2 }]

                    }
                },
                {
                    "Key": "ServiceItem",
                    Request: {
                        Params: [{
                            Key: 13,
                            Value: true
                        }]
                    },
                },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 11,
                            Value: true
                        }]
                    },
                },
                { "Key": "AnaesthesiaType" } // become slow put text box
            ];
            $scope.getLookUp(inputData);
        }
        $scope.getLookUp = function (inputData) {
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
        // $scope.getFacilityUsers = function () {
        //     var inputData = [{
        //         "Key": "User",
        //         Request: {
        //             Params: [{ Key: 3, Value: 10 }]
        //         }
        //     }];
        //     $scope.getLookUp(inputData);
        // }
    }

    otrequestFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();