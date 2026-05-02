(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('myOrderProcessListController', myOrderProcessListController);

    function myOrderProcessListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTicketStatusId: 3,
            AssignedId: utl.Session.getCurrentUserId(),
            FromDepartmentId: utl.Session.getCurrentDepartmentId(),
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
                    { Key: 10, Value: $scope.currentfilter.AssignedId },
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
        $scope.cancelItem = function () {
            $scope.item.AssetTicketStatusId = 5;
            var options = {
                action: 'AssetManagement/ServiceRequest/UpdateServiceRequest',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function (pageNo) {

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequestById',
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


        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.serviceexecutions', { id: entity.Id });
            }
            else if (actionType == 'cancel') {
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity.Id, entity.TicketNumberIdentifierIdentifier);
            }

        }



        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "TicketNumberIdentifier", displayName: $translate.instant('assetmanagement.myorder-list.workordernumber.lbl') },
                {
                    field: "CreatedAt", displayName: $translate.instant('assetmanagement.myorder-list.workorderdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "Priority.Description", displayName: $translate.instant('assetmanagement.myorder-list.priority.lbl') },
                { field: "ServiceType.Description", displayName: $translate.instant('assetmanagement.myorder-list.assigntype.lbl') },
                { field: "FromDepartment.DepartmentName", displayName: $translate.instant('assetmanagement.myorder-list.reqdepartment.lbl') },
                { field: "Remarks", displayName: $translate.instant('assetmanagement.myorder-list.remarks.lbl') },

                { field: "AssetTicketStatus.Description", displayName: $translate.instant('assetmanagement.myorder-list.workorderstatus.lbl') },
                {
                    field: "Assigned", displayName: $translate.instant('assetmanagement.myorder-list.assignedto.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + '<span>'
                        + "{{.entity.Assigned.Title.Description}}&nbsp;</span>"
                        + "<span >&nbsp;{{entity.Assigned.FirstName}}&nbsp;</span>"
                        + "<span >&nbsp;{{entity.Assigned.LastName}}</span>"
                        + "</span></div>"
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.AssetTicketStatusId == 6 ||entity.AssetTicketStatusId == 5 || entity.AssetTicketStatusId == 8"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"   ng-hide="entity.AssetTicketStatusId == 6||entity.AssetTicketStatusId == 5||entity.AssetTicketStatusId ==8"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.AssetTicketStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-show="entity.AssetTicketStatusId==2||entity.AssetTicketStatusId==3"><a translate="Cancel"></a></span>\
                                                </div>',
                                                handleEvent: $scope.handleEvents,
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
                { "Key": "Priority" },
                { "Key": "AssignType" },
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

    myOrderProcessListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();