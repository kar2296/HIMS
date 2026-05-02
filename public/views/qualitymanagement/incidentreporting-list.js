(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IncidentReportingListController', IncidentReportingListController);

    function IncidentReportingListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            IncidentReportingTypeId: -1,
            incidentstatusid: 2,
            FromDate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), -7),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.incidentstatusid },
                    { Key: 3, Value: $scope.currentfilter.IncidentReportingTypeId },
                    { Key: 4, Value: From },
                    { Key: 5, Value: To },
                    { Key: 6, Value: $scope.currentfilter.ReportedBy },
                    { Key: 7, Value: $scope.currentfilter.EmpId },
                    { Key: 8, Value: $scope.currentfilter.UHID },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/IncidentReporting/GetIncidentReportings',
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
                action: 'emr/IncidentReporting/DeleteIncidentReporting',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.incidentreporting-form', { id: 0 });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.incidentreporting-form', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'view') {
                $state.go('app.incidentreporting-form', { id: entity.Id });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "IncidentReportingTime",
                displayName: $translate.instant('taskmanagement.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.IncidentReportingTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "</div>"
            },
            {
                field: "Name",
                displayName: $translate.instant('Reported By'),
                cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                    '<p class="grid-action">' +
                    "{{entity.ReportedBy}}&nbsp;</span>" +
                    "</p></div>",
            },
            { field: "IncidentReportingType.Description", displayName: $translate.instant('taskmanagement.type.lbl') },
            {
                field: "Name",
                displayName: $translate.instant('Created By'),
                cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                    '<p class="grid-action">' +
                    "{{entity.CreatedUser.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" +
                    "<span ><b>{{entity.CreatedUser.LastName}}</b>&nbsp;</span>" +
                    "</p></div>",
            },
            {
                field: "Name",
                displayName: $translate.instant('Approved By'),
                cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                    '<p class="grid-action">' +
                    "{{entity.ApprovedUser.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.ApprovedUser.FirstName}}&nbsp;</span>" +
                    "<span ><b>{{entity.ApprovedUser.LastName}}</b>&nbsp;</span>" +
                    "</p></div>",
            },
            { field: "IncidentReportingStatus.Description", displayName: $translate.instant('taskmanagement.status.lbl') },
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
                { "Key": "IncidentReportingStatus" },
                { "Key": "IncidentReportingType" },
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

    IncidentReportingListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();