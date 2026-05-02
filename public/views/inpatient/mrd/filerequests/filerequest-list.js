(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('filerequestController', filerequestController);

    function filerequestController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: -1,
            MRDMovementStatusId: 1,
            ToDepartmentId: -1,
            RequestDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                DoctorId: -1,
                MRDTypeId: -1,
                FromDepartmentId: -1,
                ToDepartmentId: -1,
                MRDMovementStatusId: -1,

                // PatientId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'frequest.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'frequest.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    // { type: 'text', translate: 'frequest.patientname.lbl', model: 'PatientNameMRN', position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'frequest.requesttedby.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'inventory.stockrequests.requestnumber.lbl', model: 'RequestIdentifier', position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'frequest.type.lbl', model: 'MRDTypeId', options: $scope.lookup.EncounterType, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'frequest.filelocation.lbl', model: 'FromDepartmentId', options: $scope.lookup.Department, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'frequest.mrdlocation.lbl', model: 'ToDepartmentId', options: $scope.lookup.Department, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'frequest.status.lbl', model: 'MRDMovementStatusId', options: $scope.lookup.MRDMovementStatus, position: { r: 3, c: 1 } },
                    // { position: { r: 4, c: 1 } },
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
        }
        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
            var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.RequestDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.RequestDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.RequestIdentifier },
                    { Key: 2, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 3, Value: $scope.currentfilter.ToDepartmentId },
                    { Key: 4, Value: $scope.currentfilter.DoctorId },
                    { Key: 5, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 12, Value: $scope.currentfilter.MRDMovementStatusId },
                    { Key: 1, Value: $scope.advancedfilter.RequestIdentifier },
                    { Key: 2, Value: $scope.advancedfilter.FromDepartmentId },
                    { Key: 3, Value: $scope.advancedfilter.ToDepartmentId },
                    { Key: 4, Value: $scope.advancedfilter.DoctorId },
                    { Key: 5, Value: $scope.advancedfilter.PatientNameMRN },
                    { Key: 7, Value: From },
                    { Key: 8, Value: To },
                    { Key: 7, Value: FromReq },
                    { Key: 8, Value: ToReq },
                    { Key: 12, Value: $scope.advancedfilter.MRDMovementStatusId },
                    { Key: 11, Value: $scope.advancedfilter.MRDTypeId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/filerequest/GetFileRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.filedetail', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }

        $scope.openModal1 = function (Id) {
            utl.Modal.open('app.appointmentrequest', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.appointmentlist = function () {
            $scope.openModal1(0);
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/filerequest/DeleteFileRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                utl.Modal.open('app.filedetail', {
                    params: { id: row.entity.Id, pid: row.entity.PatientId },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'view') {
                utl.Modal.open('app.filedetail', {
                    params: { id: row.entity.Id, pid: row.entity.PatientId },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.RequestIdentifier);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }
        $scope.getPatientInfo = function (row) {
            console.log(row);
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "RequestDate",
                    displayName: $translate.instant('frequest.requesteon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.RequestDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.RequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "RequestIdentifier",
                    displayName: $translate.instant('inventory.stockrequests.requestnumber.lbl')
                },
                {
                    field: "PatientId",
                    displayName: $translate.instant('frequest.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="right">'
                        // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                        +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" + "<span>&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" + "<span ng-if='row.entity.Patient.LastName>&nbsp;&nbsp;</span>" +
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
                    field: "ParentDepartment.DepartmentName",
                    displayName: $translate.instant('frequest.filelocation.lbl')
                },
                {
                    field: "SubDepartment.DepartmentName",
                    displayName: $translate.instant('frequest.mrdlocation.lbl')
                },
                {
                    field: "PRIORITY.Description",
                    displayName: $translate.instant('frequest.priority.lbl')
                },
                {
                    field: "DoctorId",
                    displayName: $translate.instant('frequest.requesttedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        // + '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                        +
                        "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "MRDMovementStatus.Description",
                    displayName: $translate.instant('frequest.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-hide="row.entity.MRDMovementStatusId == 1||row.entity.MRDMovementStatusId == 2||row.entity.MRDMovementStatusId == 3||row.entity.MRDMovementStatusId == 4"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"ng-show="row.entity.MRDMovementStatusId == 1||row.entity.MRDMovementStatusId == 2||row.entity.MRDMovementStatusId == 3||row.entity.MRDMovementStatusId == 4"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                          <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-hide="row.entity.MRDMovementStatusId == 1||row.entity.MRDMovementStatusId == 2||row.entity.MRDMovementStatusId == 3||row.entity.MRDMovementStatusId == 4"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                          </div>',
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                // { "Key": "Doctor" },
                { "Key": "User" },
                { "Key": "EncounterType" },
                { "Key": "Priority" },
                { "Key": "MRDFileStatus" },
                { "Key": "MRDMovementStatus" },
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
    filerequestController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();