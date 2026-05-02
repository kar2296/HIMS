(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('allOrderProcessListController', allOrderProcessListController);

    function allOrderProcessListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTicketStatusId: 3,
            AssignTypeId: -1,
            FromDepartmentId: -1,
            PriorityId: -1,
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 2, Value: $scope.currentfilter.ServiceTypeId },
                    { Key: 3, Value: $scope.currentfilter.ExpectedDate },
                    { Key: 4, Value: $scope.currentfilter.AssetTicketStatusId },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 7, Value: $scope.currentfilter.AssignType },
                    { Key: 8, Value: $scope.currentfilter.PriorityId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // $scope.patientprofiledetails = function (patientId) {
        //     utl.Modal.open('registration.patientprofile', {
        //         params: { pid: patientId },
        //         confirmCallback: $scope.getList
        //     });
        // }


        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.workorderprocesstab.processmyorders', { id: row.entity.Id });
            }
            else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            }
        }



        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "TicketNumberIdentifier", displayName: $translate.instant('assetmanagement.myorder-list.workordernumber.lbl') },
                {
                    field: "ExpectedDate", displayName: $translate.instant('assetmanagement.myorder-list.workorderdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.ExpectedDate'></ngformatdate>"
                },
                { field: "Priority.Description", displayName: $translate.instant('assetmanagement.myorder-list.priority.lbl') },
                { field: "AssignType.Description", displayName: $translate.instant('assetmanagement.myorder-list.assigntype.lbl') },
                { field: "FromDepartment.DepartmentName", displayName: $translate.instant('assetmanagement.myorder-list.reqdepartment.lbl') },
                { field: "Remarks", displayName: $translate.instant('assetmanagement.myorder-list.remarks.lbl') },

                { field: "AssetTicketStatus.Description", displayName: $translate.instant('assetmanagement.myorder-list.workorderstatus.lbl') },
                {
                    field: "Assigned", displayName: $translate.instant('assetmanagement.myorder-list.assignedto.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + '<span>'
                        + "{{row.entity.Assigned.Title.Description}}&nbsp;</span>"
                        + "<span >&nbsp;{{row.entity.Assigned.FirstName}}&nbsp;</span>"
                        + "<span >&nbsp;{{row.entity.Assigned.LastName}}</span>"
                        + "</span></div>"
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.AssetTicketStatusId == 6 ||row.entity.AssetTicketStatusId == 5 || row.entity.AssetTicketStatusId == 8"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"   ng-hide="row.entity.AssetTicketStatusId == 6||row.entity.AssetTicketStatusId == 5||row.entity.AssetTicketStatusId ==8"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-show="row.entity.AssetTicketStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-show="row.entity.AssetTicketStatusId==2||row.entity.AssetTicketStatusId==3"><a translate="Cancel"></a></span>\
                                                </div>',
                    actions: [

                    ]
                }

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AssetTicketStatus" },
                { "Key": "ServiceType" },
                { "Key": "Department" },
                { "Key": "User" },
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

    allOrderProcessListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();