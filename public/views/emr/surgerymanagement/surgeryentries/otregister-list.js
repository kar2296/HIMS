(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otregisterListController', otregisterListController);

    function otregisterListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            pid: parseInt(utl.Session.getEMRPatientId())
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            wardid: -1,
            ChiefSurgeonId: -1,
            statusid: 1,
            namemrn: '',
            OTRegisterStatusId: 2,
			otregisteredon: utl.Formatter.getCurrentDate(),
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'otregister-form.otstarttime.lbl', model: 'OTStartedate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'otregister-form.otendtime.lbl', model: 'OTEndDate', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'otrequest-list.otno.lbl', model: 'OTIdentifier', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'IP No.', model: 'PatientNameMRN', position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'otregister-form.chiefsurgeon.lbl', model: 'ChiefSurgeonId', options: $scope.lookup.Doctor, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'otregister-form.assistantsurgeon.lbl', model: 'AssistantSurgeonId', options: $scope.lookup.Doctor, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'otregister-form.anesthetist.lbl', model: 'AnaesthesistId', options: $scope.lookup.Doctor, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'otregister-form.otroom.lbl', model: 'OTRoomId', options: $scope.lookup.Room, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'otrequest-list.surgeryname.lbl', model: 'ProcedureId', options: $scope.lookup.Procedure, position: { r: 4, c: 0 } },
                    { position: { r: 4, c: 1 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.OTDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.OTDate, 'yyyy-MM-dd 23:59:59');
			var From = $filter('date')($scope.currentfilter.otregisteredon, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.otregisteredon, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 3, Value: $scope.currentfilter.OTRegisterStatusId },
                    { Key: 9, Value: FrmDate },
                    { Key: 10, Value: ToDate },
                    { Key: 4, Value: $scope.currentfilter.OTIdentifier },
                    { Key: 7, Value: $scope.currentfilter.ProcedureId },
                    { Key: 5, Value: $scope.currentfilter.ChiefSurgeonId },
                    { Key: 1, Value: $scope.advancedfilter.PatientNameMRN },
                    { Key: 4, Value: $scope.advancedfilter.OTIdentifier },
                    { Key: 5, Value: $scope.advancedfilter.ChiefSurgeonId },
                    { Key: 6, Value: $scope.advancedfilter.AssistantSurgeonId },
                    { Key: 7, Value: $scope.advancedfilter.ProcedureId },
                    { Key: 8, Value: $scope.advancedfilter.AnaesthesistId },
                    { Key: 9, Value: $scope.advancedfilter.OTStartedate },
                    { Key: 10, Value: $scope.advancedfilter.OTEndDate },
                    { Key: 11, Value: $scope.advancedfilter.OTRoomId },
					        { Key: 16, Value: From },
                    { Key: 17, Value: To },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if ($scope.context == 'emr' || $scope.currentcontext.ismodal == true)
                inputData.Params.push({ Key: 2, Value: $scope.currentcontext.pid });

            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.addNew = function () {
            $state.go('app.otregistertab.otregister', { id: 0 });
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };

        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        };

        function patientPickerCallback(patientdata) {
            $state.go('app.otregistertab.otregister', { id: patientdata.pid });
        }

        $scope.pickPatient = function () {
            utl.Modal.open('app.patientpicker', {
                params: {},
                confirmCallback: patientPickerCallback
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'OtManagement/otregister/DeleteOtRegister',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                if ($scope.currentcontext.ismodal) {
                    utl.Modal.open('patientemr.otregister', {
                        params: { id: row.entity.Id, pid: row.entity.PatientId }
                    }
                    );
                } else if ($scope.context == 'emr') {
                    $state.go('patientemr.otregister', { id: row.entity.Id, pid: row.entity.PatientId });
                } else if ($scope.context == 'main') {
                    $state.go('app.otregistertab.otregister',
                        {
                            id: row.entity.Id,
                            eid: row.entity.EncounterId,
                            pid: row.entity.PatientId,
                            otidentifier: row.entity.OTIdentifier,
                            doctorid: row.entity.AdmissionDoctorId,
                            doctorname: row.entity.DoctorName,
                            wardid: row.entity.WardId,
                            roomid: row.entity.RoomId,
                            bedid: row.entity.BedId,
                            otroomid: row.entity.OTRoomId
                        });
                }
            }
            if (actionType == 'view') {
                if ($scope.currentcontext.ismodal) {
                    utl.Modal.open('patientemr.otregister', {
                        params: { id: row.entity.Id, pid: row.entity.PatientId }
                    }
                    );
                } else if ($scope.context == 'emr') {
                    $state.go('patientemr.otregister', { id: row.entity.Id, pid: row.entity.PatientId });
                } else if ($scope.context == 'main') {
                    $state.go('app.otregistertab.otregister', { id: row.entity.Id, eid: row.entity.EncounterId, pid: row.entity.PatientId });
                }
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.GuarantorName);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            }
        };

        var OTStartedate = {
            field: "OTStartedate",
            displayName: $translate.instant('otrequest-list.requestedon.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span>{{row.entity.OTStartedate | date:'dd-MMM-yyyy'}}</span>" + " " + "<span>{{row.entity.OTStartedate| date:'HH:mm'}}</span>" +
                "</div>"
        };

        var OTIdentifier = { field: "OTIdentifier", displayName: $translate.instant('otrequest-list.otno.lbl') };

        var Patient = {
            field: "Patient",
            displayName: $translate.instant('admissions.patientname.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                +
                "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                "{{row.entity.Patient.Title.Description}}</span>" +
                "<span >{{row.entity.Patient.FirstName}}</span>" +
                "<span >{{row.entity.Patient.LastName}}</span>" +
                "<span >/</span>" +
                "<span >{{row.entity.Patient.MRN}}</span>" +
                "<span >/<span>" +
                "<span >{{row.entity.Patient.Age}}</span>" +
                "<span >/</span>" +
                "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                "</a></div>"
        };
        var Surgeon = {
            field: "Surgeon",
            displayName: $translate.instant('otregister-form.chiefsurgeon.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.ChiefSurgeon.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{row.entity.ChiefSurgeon.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{row.entity.ChiefSurgeon.LastName}}</span>' + '</div>'
        };
        var AnaesthesiaType = {
            field: "AnaesthesiaType.Description",
            displayName: $translate.instant('otregister-form.anesthesiatype.lbl')
        };
        var Anaesthesist = {
            field: "Anaesthesist",
            displayName: $translate.instant('otregister-form.anesthetist.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.Anaesthesist.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{row.entity.Anaesthesist.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{row.entity.Anaesthesist.LastName}}</span>' + '</div>'
        };
        var OTRoom = { field: "OTRoom.RoomNo", displayName: $translate.instant('otrequest-list.otroom.lbl'), };

        var Procedure = { field: "Procedure1.ProcedureName", displayName: $translate.instant('otrequest-list.surgeryname.lbl'), };

        var OTRegisterStatus = { field: "OTRegisterStatus.Description", displayName: $translate.instant('otrequest-list.status.lbl') };

        var action = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.OTRegisterStatusId==4 || row.entity.OTRegisterStatusId==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.OTRegisterStatusId==1 || row.entity.OTRegisterStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.OTRegisterStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [OTStartedate, OTIdentifier, Patient, Surgeon, Anaesthesist, OTRoom, Procedure, OTRegisterStatus, action],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        if ($scope.context == 'emr' || $scope.currentcontext.ismodal) {
            vm.gridConfig.columnDefs = [];
            vm.gridConfig.columnDefs.push(OTStartedate, OTIdentifier, Surgeon, AnaesthesiaType, Anaesthesist, OTRoom, Procedure, OTRegisterStatus, action);
        }

        function setDefaults() {
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.OTRegisterStatus, 'Approved');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.OTRegisterStatus, 'Completed');
            $scope.currentfilter.OTRegisterStatusId = ApprovedId + "," + "," + CompletedId;
        }

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
            $scope.item.ProcedureName = result;

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [],
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

        $scope.onEnter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ProcedureId = -1;
                $scope.getList();
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            setDefaults();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { 'Key': 'Facility' },
                { 'Key': 'OTRegisterStatus', Default: false },
                { 'Key': 'Ward' },
                { "Key": "Room", Request: { Params: [{ Key: 6, Value: 3 }] } },
                { "Key": "Doctor", Request: { Params: [{ Key: 12, Value: true }] } },
                { "Key": "Procedure" }
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

    otregisterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();