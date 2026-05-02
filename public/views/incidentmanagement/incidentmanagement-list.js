(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('incidentmanagementlistController', incidentmanagementlistController);

    function incidentmanagementlistController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.currentfilter = {
            IncidentStatusId: -1,
            IncidentDate: utl.Formatter.getCurrentDate(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.IncidentStatusId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.PriorityId
                    },
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'TaskManagement/IncidentManagement/GetIncidentManagements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'TaskManagement/Incident/DeleteIncident',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            utl.Modal.openFixedDialog('app.incidentmanagementform', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        };

        $scope.openModal = function (Id) {
            utl.Modal.openFixedDialog('app.incidentmanagementform', {
                params: { id: Id },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
            else if (actionType == 'view') {
                $scope.openModal(entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "IncidentDate",
                    displayName: $translate.instant('taskmanagement.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.IncidentDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "</div>"
                },
                { field: "IncidentNo", displayName: $translate.instant('taskmanagement.incidentno.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('Department') },
                { field: "IncidentType.Description", displayName: $translate.instant('taskmanagement.type.lbl') },
                {
                    field: "AssignedToUser",
                    displayName: $translate.instant('taskmanagement.assignto.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AssignedToUser.Title.Description}}&nbsp;</span>" + "<span class='pl-3'>{{entity.AssignedToUser.FirstName}}&nbsp;</span>" + "<span class='pl-3'>{{entity.AssignedToUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('Patient'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Patient.Title.Description}}&nbsp;</span>" + "<span class='pl-3'>{{entity.Patient.firstname}}&nbsp;</span>" + "<span class='pl-3'>{{entity.Patient.lastname}}</span>" + "</div>"
                },
                { field: "IncidentDescription", displayName: $translate.instant('taskmanagement.description.lbl') },
                { field: "Priority.Description", displayName: $translate.instant('taskmanagement.priority.lbl') },

                { field: "IncidentStatus.Description", displayName: $translate.instant('taskmanagement.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Priority" },
                { "Key": "IncidentStatus" },
                {
                    "Key": "IncidentType"
                },
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
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

    incidentmanagementlistController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();