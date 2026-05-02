(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OtScheduleController', OtScheduleController);

    function OtScheduleController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            OTScheduledOn: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            patient: '',
            OTScheduleStatusId: 1
        };
        if (utl.Session.getUserTypeId() == 2) {
            //$scope.currentfilter.DoctorId = utl.Session.getUserTypeId();
        }

        $scope.item = {}
        $scope.currentcontext = {};
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId())

        $scope.InfectionControl = function () {
            $state.go('app.infectioncontrols', { id: 0 });
        };
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.currentfilter.patient },
                    { Key: 7, Value: $scope.currentfilter.DoctorId },
                    { Key: 2, Value: $scope.currentfilter.OTScheduleStatusId },
                    { Key: 8, Value: $scope.currentfilter.surgeryname },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 10, Value: From },
                    { Key: 11, Value: To }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        //Grid Actions
        $scope.addNew = function () {
            $scope.openModal(0);
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.otschedule', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'schedule') {
                $scope.openModal(row.entity.Id, row.entity.PatientId);
            } else if (actionType == 'otnotes') {
                $state.go('app.otregistertab.otregister', { id: 0, eid: row.entity.EncounterId });
            }
        };
        var entitytpl = '<div ng-class="{\'released\':entity.PriorityId==1 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-entity-header-cell\': col.isentityHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            enableColumnResizing: true,
            entityTemplate: entitytpl,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "OTScheduledOn", displayName: $translate.instant('otschedule-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OTScheduledOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.OTScheduledOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('otschedule-list.visit#.lbl') },
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
                { field: "SurgeryRoomMaster.Name", displayName: $translate.instant('otschedule-list.otroom.lbl') },

                { field: "Procedure.ProcedureName", displayName: $translate.instant('otschedule-list.procedurename.lbl') },
                // { field: "Priority.Description", displayName: $translate.instant('otschedule-form.priority.lbl') },
                // { field: "Diagnosis.DiagnosisName", displayName: $translate.instant('otschedule-list.dignosis.lbl') },
                // { field: "Team.Description", displayName: $translate.instant('otschedule-list.unit.lbl') },
                // { field: "SurgeryType.Description", displayName: $translate.instant('otschedule-list.type.lbl') },
                // //{ field: "Doctor.DoctoName", displayName: $translate.instant('otschedule-list.surgeon.lbl') },
                { field: "OTScheduleStatus.Description", displayName: $translate.instant('otschedule-list.status.lbl') },
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
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                 <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.OTScheduleStatusId ==2||entity.OTScheduleStatusId ==4||entity.OTScheduleStatusId ==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                 <span class="grid-action"  ng-click="handleEvents(\'edit\',entity)" ng-show="entity.OTScheduleStatusId ==1||entity.OTScheduleStatusId ==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                 <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-show="entity.OTScheduleStatusId==1" > <i class=" fa fa-times icon" aria-hidden="true"> </i> </span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        // vm.gridConfig = {
        //     columnDefs: [
        //         { field: "Id", name: 'OT Schedules', cellTemplate: 'prescriptionTemplate.html' }
        //     ],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OTScheduleStatus" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
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
        };
        $scope.initLookup();
    }
    OtScheduleController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();