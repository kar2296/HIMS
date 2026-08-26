(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExecutableProceduresListController', ExecutableProceduresListController);

    function ExecutableProceduresListController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            BillDateTime: utl.Formatter.getCurrentDate(),
            ExecutableProcedureStatusId: 1,
            BillsRaisedFromId: 1
        };
        $scope.CurrentLogInUser = utl.Session.getCurrentUserId();
        $scope.currentcontext = {};

        $scope.getCurrentLogInUserDepartmentCallBack = function (scope, data, options, hasError) {
            $scope.selectedUser = data;
            if ($scope.selectedUser) {
                $scope.currentfilter.DepartmentId = $scope.selectedUser.DepartmentId;
            } else {
                $scope.currentfilter.DepartmentId = -1;
            }
            $scope.refreshReactProps();
        };

        $scope.getCurrentLogInUserDepartment = function () {
            if ($scope.CurrentLogInUser && $scope.CurrentLogInUser > 0) {
                var options = {
                    action: 'SystemSettings/User/GetUserById',
                    data: { Id: $scope.CurrentLogInUser },
                    type: 'post',
                    onComplete: $scope.getCurrentLogInUserDepartmentCallBack
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.currentfilter.PatientId = $scope.selectedPatient.Id;
            if ($scope.currentfilter.PatientId > 0) {
                $scope.getList();
            }
        };

        $scope.patientChange = function () {
            if ($scope.currentfilter.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentfilter.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.patientordergridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 13, Value: $scope.currentfilter.ExecutableProcedureStatusId },
                    { Key: 11, Value: $scope.currentfilter.DepartmentId },
                    { Key: 5, Value: $scope.currentfilter.EncounterId },
                    { Key: 6, Value: $scope.currentfilter.DoctorId },
                    { Key: 7, Value: $scope.currentfilter.PatientId },
                    { Key: 17, Value: $scope.currentfilter.BillsRaisedFromId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.BillDateTime && $scope.currentfilter.BillsRaisedFromId == 3) {
                var FromBillDateTime = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 00:00:00');
                var ToFromBillDateTime = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push(
                    { Key: 20, Value: [FromBillDateTime, ToFromBillDateTime] }
                );
            } else if ($scope.currentfilter.BillDateTime && $scope.currentfilter.BillsRaisedFromId != 3) {
                var FromBillDateTime = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 00:00:00');
                var ToFromBillDateTime = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push(
                    { Key: 16, Value: [FromBillDateTime, ToFromBillDateTime] }
                );
            }

            var options = {
                action: 'Billing/PatientExecutableProcedure/GetPatientExecutableProcedures',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Code);
            }
        }

        $scope.openExecutableProcedure = function (ExecutableProcedureId) {
            utl.Modal.open('app.executableprocedures', {
                params: { ExecutableProcedureId: ExecutableProcedureId },
                confirmCallback: $scope.getList
            });
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $scope.openExecutableProcedure(row.entity.Id);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.executableprocedureslist.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span >&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}</span>" +
                        "<span >&nbsp;</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "</a></div>"
                },
                { field: "PatientBill.BillNumber", displayName: $translate.instant('billing.executableprocedureslist.billnumber.lbl') },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('billing.executableprocedureslist.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
                },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('billing.executableprocedureslist.visitnumber.lbl') },
                { field: "ServiceName", displayName: $translate.instant('billing.executableprocedureslist.testname.lbl') },
                { field: "ServiceDepartment.DepartmentName", displayName: $translate.instant('billing.executableprocedureslist.department.lbl') },
                { field: "Executeduser.FirstName", displayName: $translate.instant('billing.executableprocedureslist.executedby.lbl') },
                { field: "ExecutableProcedureStatus.Description", displayName: $translate.instant('billing.executableprocedureslist.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        vm.patientordergridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.executableprocedureslist.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span >&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}</span>" +
                        "<span >&nbsp;</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "</a></div>"
                },
                { field: "PatientOrder.OrderNumber", displayName: $translate.instant('billing.executableprocedureslist.ordernumber.lbl') },
                {
                    field: "OrderRequestDate",
                    displayName: $translate.instant('billing.executableprocedureslist.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.OrderRequestDate'></ngformatdate>"
                },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('billing.executableprocedureslist.visitnumber.lbl') },
                { field: "TestName", displayName: $translate.instant('billing.executableprocedureslist.testname.lbl') },
                { field: "ServiceDepartment.DepartmentName", displayName: $translate.instant('billing.executableprocedureslist.department.lbl') },
                { field: "Executeduser.FirstName", displayName: $translate.instant('billing.executableprocedureslist.executedby.lbl') },
                { field: "ExecutableProcedureStatus.Description", displayName: $translate.instant('billing.executableprocedureslist.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "ExecutableProcedureStatus" },
                { "Key": "Department" },
                { "Key": "BillsRaisedFrom", Default: false }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                departmentId: $scope.currentfilter.DepartmentId,
                executableProcedureStatusId: $scope.currentfilter.ExecutableProcedureStatusId,
                billsRaisedFromId: $scope.currentfilter.BillsRaisedFromId,
                departmentOptions: ($scope.lookup && $scope.lookup.Department) || [],
                statusOptions: ($scope.lookup && $scope.lookup.ExecutableProcedureStatus) || [],
                raisedFromOptions: ($scope.lookup && $scope.lookup.BillsRaisedFrom) || []
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'departmentChange':
                    $scope.currentfilter.DepartmentId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'statusChange':
                    $scope.currentfilter.ExecutableProcedureStatusId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'raisedFromChange':
                    $scope.currentfilter.BillsRaisedFromId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
            }
        };

        $scope.initLookup();
        if ($scope.CurrentLogInUser && $scope.CurrentLogInUser > 0) {
            $scope.getCurrentLogInUserDepartment();
        }
    }

    ExecutableProceduresListController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();