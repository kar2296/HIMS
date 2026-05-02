(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findotscheduleListController', findotscheduleListController);

    function findotscheduleListController($scope, $filter, $stateParams, $state,
        $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            OTScheduleStatusId: 1,
            OTScheduledOn: utl.Formatter.getCurrentDate(),

        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.Context = modalConfig.params.context;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.advancedfilter.SurgeryTypeId },
                    { Key: 2, Value: [1,2] },
                    { Key: 3, Value: $scope.advancedfilter.DepartmentId },
                    { Key: 5, Value: $scope.currentfilter.patientnamemrn },
                    { Key: 12, Value: $scope.advancedfilter.TeamId },
                    { Key: 13, Value: $scope.currentfilter.DiagnosisId },
                    { Key: 14, Value: $scope.advancedfilter.ProcedureId },
                    { Key: 15, Value: $scope.advancedfilter.PriorityId },
                    { Key: 10, Value: From },
                    { Key: 11, Value: To },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr')
                inputData.Params.push({ Key: 6, Value: $scope.currentcontext.pid });
            var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.advancedfilter = {

        };

        $scope.lookup = {};
        function initDynamicForm() {
            $scope.advancedfilterDefault = {
                FromFacility: utl.Session.getCurrentUserId(),
                ApprovedBy: utl.Session.getCurrentUserId()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'select', translate: 'otschedule-list.unit.lbl', model: 'TeamId', options: $scope.lookup.Team, position: { r: 0, c: 0 } },
                    { type: 'select', translate: 'otschedule-list.type.lbl', model: 'SurgeryTypeId', options: $scope.lookup.SurgeryType, position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'otschedule-list.procedurename.lbl', model: 'ProcedureId', options: $scope.lookup.Procedure, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'otschedule-form.priority.lbl', model: 'PriorityId', options: $scope.lookup.Priority, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'otschedule-form.department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    { position: { r: 2, c: 1 } },

                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-success' },
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

        $scope.openModal = function (Id) {
            if ($scope.context == 'main') {
                utl.Modal.open('app.otschedule', {
                    params: { id: Id }, confirmCallback: $scope.initLookup
                }
                );
            }
            if ($scope.context == 'emr') {
                utl.Modal.open('patientemr.otschedule', {
                    params: { id: Id }, confirmCallback: $scope.initLookup
                }
                );
            }
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'OtManagement/OtSchedule/DeleteOtSchedule',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function (pageNo) {

            var options = {
                action: 'OtManagement/OtSchedule/GetOtScheduleById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function (cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                $scope.confirmCallback(row.entity);
            }
        }

        $scope.cancelItem = function () {
            $scope.item.OTScheduleStatusId = 3;
            var options = {
                action: 'OtManagement/OtSchedule/UpdateOtSchedule',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }
        var rowtpl = '<div ng-class="{\'released\':row.entity.PriorityId==1 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [
                {
                    field: "OTScheduledOn", displayName: $translate.instant('otschedule-list.schedule.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.OTScheduledOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.OTScheduledOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                        +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('otschedule-list.surgeon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" + "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" + "<span >{{row.entity.Doctor.LastName}}</span>" + "</div>"
                },

                { field: "SurgeryName", displayName: $translate.instant('otschedule-list.procedurename.lbl') },
                // { field: "Priority.Description", displayName: $translate.instant('otschedule-form.priority.lbl') },
                { field: "Diagnosis.DiagnosisName", displayName: $translate.instant('otschedule-list.dignosis.lbl') },
                { field: "Team.Description", displayName: $translate.instant('otschedule-list.unit.lbl') },
                { field: "SurgeryType.Description", displayName: $translate.instant('otschedule-list.type.lbl') },
                // { field: "OTRoom.RoomNo", displayName: $translate.instant('otschedule-list.otroom.lbl') },
                //{ field: "Doctor.DoctoName", displayName: $translate.instant('otschedule-list.surgeon.lbl') },
                { field: "OTScheduleStatus.Description", displayName: $translate.instant('otschedule-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> \
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.OTScheduleStatusId ==1 || row.entity.OTScheduleStatusId ==2"><i class="fas fa-eye" aria-hidden="true"></i></span> \
                    </span>  </div> ',
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
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

        //autosearch related code ends
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DiagnosisName', field: 'DiagnosisName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Version', field: 'Version', datatype: 'string', headercls: 'td-Version', fieldcls: 'td-Version' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-Speciality', fieldcls: 'td-Speciality' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {

            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')' + selectedItem.Version].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                item.Version = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OTScheduleStatus" },
                { "Key": "Procedure" },
                { 'Key': 'Ward' },
                { "Key": "Facility" },
                { "Key": "SurgeryType" },
                { "Key": "Priority" },
                { "Key": "Department" },
                { "Key": "Room" },
                { "Key": "Team" },
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

    findotscheduleListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();