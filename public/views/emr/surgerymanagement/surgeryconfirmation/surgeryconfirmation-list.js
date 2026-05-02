(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryconfirmListController', SurgeryconfirmListController);

    function SurgeryconfirmListController($rootScope, $timeout, $scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            OTScheduleStatusId: 2,
            OTRoomId: -1,
            OTScheduledOn: utl.Formatter.getCurrentDate(),

        };
        $scope.items = {};
        $scope.currentcontext = {};
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                vm.gridConfig.data = res.Data;
                $scope.items.PatientId = vm.gridConfig.data[0].PatientId;
                $scope.items.EncounterId = vm.gridConfig.data[0].EncounterId;
                vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            }
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 17,
                        Value: $scope.currentfilter.OTRoomId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.OTScheduleStatusId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if ($scope.context == 'emr')
            //     inputData.Params.push({ Key: 6, Value: $scope.currentcontext.pid });
            var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.OTScheduleStatusId
                    },
                ],
            };
            var options = {
                action: 'OtManagement/OtSchedule/PrintOtSchedule',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
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
                controls: [{
                        type: 'select',
                        translate: 'otschedule-list.unit.lbl',
                        model: 'TeamId',
                        options: $scope.lookup.Team,
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'otschedule-list.type.lbl',
                        model: 'SurgeryTypeId',
                        options: $scope.lookup.SurgeryType,
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'otschedule-list.procedurename.lbl',
                        model: 'ProcedureId',
                        options: $scope.lookup.Procedure,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'otschedule-form.priority.lbl',
                        model: 'PriorityId',
                        options: $scope.lookup.Priority,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'otschedule-form.department.lbl',
                        model: 'DepartmentId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        position: {
                            r: 2,
                            c: 1
                        }
                    },

                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-success'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
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
            // if ($scope.context == 'main') {
            utl.Modal.open('app.surgeryconfirmationentry', {
                params: {
                    sid: Id,
                    eid: $scope.items.EncounterId,
                    pid: $scope.items.PatientId
                },
                // confirmCallback: $state.go('app.surgeryentries',{
                confirmCallback: $scope.getList
                // })
            });
            // }
            // if ($scope.context == 'emr') {
            //     utl.Modal.open('patientemr.otschedule', {
            //         params: { id: Id }, confirmCallback: $scope.initLookup
            //     }
            //     );
            // }
        }

        $scope.addNew = function () {
            $state.go('app.surgeryconfirmationform', {
                id: 0
            });
            // $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'OtManagement/OtSchedule/DeleteOtSchedule',
                data: {
                    Id: deleteId
                },
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
                data: {
                    Id: $scope.CancelId
                },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function (cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }
        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.surgeryconfirmationform', {
                    id: entity.Id,
                    pid: entity.PatientId,
                    eid: entity.EncouterId
                });
                // $scope.openModal(entity.Id, entity.PatientId);
            }
            if (actionType == 'surgeryentry') {
                // $state.go('app.surgeryconfirmationform', { id: entity.Id, pid: entity.PatientId, eid: entity.EncouterId });
                $scope.openModal(entity.Id, entity.PatientId, entity.EncounterId);
            } else if (actionType == 'cancel') {
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity.Id, entity.SurgeryName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            }
        }
        $scope.cancelItem = function () {
            $scope.item.OTScheduleStatusId = 3;
            var options = {
                action: 'OtManagement/OtSchedule/UpdateOtSchedule',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }

        $scope.backtoList = function () {
            $state.go('app.surgerydashboard');
        }

        function setDefaults() {
            var ScheduledId = utl.Lookup.getDefault($scope.lookup.OTScheduleStatus, 'Scheduled');
            var confirmedId = utl.Lookup.getDefault($scope.lookup.OTScheduleStatus, 'Confirmed');
            // var CancelledId = utl.Lookup.getDefault($scope.lookup.OTScheduleStatus, 'Cancelled');
            $scope.currentfilter.OTScheduleStatusId = ScheduledId + "," + confirmedId;
        }

        var entitytpl = '<div ng-class="{\'released\':entity.PriorityId==1 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-entity-header-cell\': col.isentityHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            enableColumnResizing: true,
            entityTemplate: entitytpl,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "OTScheduledOn",
                    displayName: $translate.instant('otschedule-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OTScheduledOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.OTScheduledOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Encounter.VisitIdentifier",
                    displayName: $translate.instant('otschedule-list.visit#.lbl')
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)">'
                        +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "{{entity.Patient.Title.Description}} &nbsp</span>" +
                        "<span >{{entity.Patient.FirstName}}&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                // { field: "OTRoom.RoomNo", displayName: $translate.instant('otschedule-list.roomdetails.lbl') },
                {
                    field: "Doctor",
                    displayName: $translate.instant('otschedule-list.surgeon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Doctor.Title.Description}}&nbsp;</span>" + "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" + "<span >{{entity.Doctor.LastName}}</span>" + "</div>"
                },
                {
                    field: "SurgeryRoomMaster.Name",
                    displayName: $translate.instant('otschedule-list.otroom.lbl')
                },

                // { field: "Procedure.ProcedureName", displayName: $translate.instant('otschedule-list.procedurename.lbl') },
                {
                    field: "Diagnosis.DiagnosisName",
                    displayName: $translate.instant('Diagnosis')
                },
                {
                    field: "StartTime",
                    displayName: $translate.instant('Start Time')
                },
                {
                    field: "EndTime",
                    displayName: $translate.instant('EndTime')
                },
                // { field: "Priority.Description", displayName: $translate.instant('otschedule-form.priority.lbl') },
                // { field: "Diagnosis.DiagnosisName", displayName: $translate.instant('otschedule-list.dignosis.lbl') },
                // { field: "Team.Description", displayName: $translate.instant('otschedule-list.unit.lbl') },
                // { field: "SurgeryType.Description", displayName: $translate.instant('otschedule-list.type.lbl') },
                // //{ field: "Doctor.DoctoName", displayName: $translate.instant('otschedule-list.surgeon.lbl') },
                {
                    field: "OTScheduleStatus.Description",
                    displayName: $translate.instant('otschedule-list.status.lbl')
                },
                //     {
                //         field: "Id",
                //         displayName: $translate.instant('common.actions_col.lbl'),
                //         cellTemplate: '<div class="ui-grid-cell-contents">\
                //                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',entity)" ng-show="entity.OTScheduleStatusId ==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                // \
                //                                                 \
                //                                                 <span class="grid-action"  ng-click="grid.appScope.handleEvents(\'edit\',entity)" ng-hide="entity.OTScheduleStatusId ==3"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //                                                \
                //                                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',entity)" ng-hide="entity.OTScheduleStatusId==3" > <i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"> </i> </span>\
                //                                                                                </div>',

                //     }
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //  <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.OTScheduleStatusId ==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                //  <span class="grid-action"  ng-click="handleEvents(\'edit\',entity)" ng-hide="entity.OTScheduleStatusId ==3"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //  <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-hide="entity.OTScheduleStatusId==3" > <i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"> </i> </span>\
                // </div>',
                //     handleEvent: $scope.handleEvents,
                //     actions: []
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                 <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.OTScheduleStatusId ==2||entity.OTScheduleStatusId ==4||entity.OTScheduleStatusId ==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                 <span class="grid-action"  ng-click="handleEvents(\'edit\',entity)" ng-show="entity.OTScheduleStatusId ==1||entity.OTScheduleStatusId ==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                 <span class="grid-action"  ng-click="handleEvents(\'surgeryentry\',entity)" ng-show="entity.OTScheduleStatusId ==3||entity.OTScheduleStatusId ==5">Surgery Entry</span>\
                 <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-show="entity.OTScheduleStatusId==1"> <i class=" fa fa-times icon" aria-hidden="true"> </i> </span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        //autosearch related code starts for SurgeryName
        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Procedure Name',
                    field: 'ProcedureName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
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
            } else if (vm.procedurecontrolconfig.entitydata) {
                result = [vm.procedurecontrolconfig.entitydata.Code, vm.procedurecontrolconfig.entitydata.ProcedureName].join(' ');
            }
            $scope.item.SurgeryName = result;

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            //Search only nurse
            var inputData = {
                Params: [
                    {
                        Key: 9,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
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

        $scope.doctorFilterChange = function () {
            var selectedDoctor = [];
            var doctorList = $scope.currentfilter.DoctorId.split(",");
            for (var idx in doctorList) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, doctorList[idx]);
                if (doctorObj) {
                    selectedDoctor.push(doctorObj.Text);
                }
            }
            $scope.currentcontext.selectedDoctor = selectedDoctor.toString();
            $scope.getList();
        };


        //autosearch related code ends
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'DiagnosisName',
                    field: 'DiagnosisName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Version',
                    field: 'Version',
                    datatype: 'string',
                    headercls: 'td-Version',
                    fieldcls: 'td-Version'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-Speciality',
                    fieldcls: 'td-Speciality'
                },
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
            } else if (vm.diagnosiscontrolconfig.entitydata) {
                result = [vm.diagnosiscontrolconfig.entitydata.Code, vm.diagnosiscontrolconfig.entitydata.DiagnosisName,
                    vm.diagnosiscontrolconfig.entitydata.DiagnosisVersionId, vm.diagnosiscontrolconfig.entitydata.Speciality
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
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
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
            // $scope.doctorFilterChange ();
            $scope.getList();
            // setDefaults();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "OTScheduleStatus"
                },
                // {
                //     "Key": "Procedure"
                // },
                // {
                //     'Key': 'Ward'
                // },
                // {
                //     "Key": "Facility"
                // },
                {
                    "Key": "SurgeryType"
                },
                // {
                //     "Key": "Priority"
                // },
                // {
                //     "Key": "Department"
                // },
                // {
                //     "Key": "Room"
                // },
                {
                    "Key": "SurgeryRoom"
                },
                // { "Key": "Doctor" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                                Key: 3,
                                Value: 2
                            },
                            {
                                Key: 5,
                                Value: 2
                            },
                            {
                                Key: 2,
                                Value: [-1, $scope.currentfilter.FacilityId]
                            }
                        ]
                    }
                },
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

    SurgeryconfirmListController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();