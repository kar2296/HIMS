(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceRequestListController', serviceRequestListController);

    function serviceRequestListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ServiceRequestStatusId: -1,
            ServiceTypeId: -1,
            FromDepartmentId: utl.Session.getCurrentDepartmentId(),
            PriorityId: -1,

        };
        function handleDynamicFormEvents(actionType, formData) {
            $scope.getList();
        }
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
                    { Key: 4, Value: $scope.currentfilter.ServiceRequestStatusId },
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

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.servicerequest', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/ServiceRequest/DeleteServiceRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        // Cancel Requests from List Screen Function
        $scope.cancelItem = function () {
            $scope.item.ServiceRequestStatusId = 5;
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

        // Cancel Requests from List Screen Function 

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.servicerequest', { id: row.entity.Id });
            }
             if (actionType == 'close') {
                $state.go('app.serviceexecutions', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AssetName);
            }
            else if (actionType == 'cancel') {
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, row.entity.Id, row.entity.ServiceRequestIdentifier);
            }

        }
        //Visibility rules starts
        $scope.canShowEdit = function () {
            return false;
        }

        //Visibility rules starts
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "CreatedAt", displayName: $translate.instant('assetmanagement.servicerequest.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "TicketNumberIdentifier", displayName: $translate.instant('assetmanagement.servicerequest.request#.lbl') },
                { field: "ServiceType.Description", displayName: $translate.instant('assetmanagement.servicerequest.type.lbl') },
                { field: "FromDepartment.Description", displayName: $translate.instant('assetmanagement.servicerequest.fromdepartment.lbl') },
                { field: "AssetName", displayName: $translate.instant('assetmanagement.servicerequest.assetname.lbl') },
                {
                    field: "CreatedUser", displayName: $translate.instant('assetmanagement.servicerequest.requestedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span>'
                    + "{{row.entity.CreatedUser.Title.Description}}</span>"
                    + "<span >&nbsp;{{row.entity.CreatedUser.FirstName}}</span>"
                    + "<span >&nbsp;{{row.entity.CreatedUser.LastName}}</span>"
                    + "</span></div>"
                },

                // {
                //     field: "Assigned", displayName: $translate.instant('housekeeprequests.assignedto.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>"
                //     + '<span>'
                //     + "{{row.entity.Assigned.Title.Description}}</span>"
                //     + "<span >&nbsp;{{row.entity.Assigned.FirstName}}</span>"
                //     + "<span >&nbsp;{{row.entity.Assigned.LastName}}</span>"
                //     + "</span></div>"
                // },
                { field: "ServiceRequestStatus.Description", displayName: $translate.instant('housekeeprequests.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.ServiceRequestStatusId ==5||row.entity.ServiceRequestStatusId == 8"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"   ng-hide="row.entity.ServiceRequestStatusId==4||row.entity.ServiceRequestStatusId == 5||row.entity.ServiceRequestStatusId ==8"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'close\',row)"  ng-show="row.entity.ServiceRequestStatusId==4"><a translate="Close"></a></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-show="row.entity.ServiceRequestStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-show="row.entity.ServiceRequestStatusId==2||row.entity.ServiceRequestStatusId==3"><a translate="Cancel"></a></span>\
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
                { "Key": "ServiceRequestStatus" },
                { "Key": "ServiceType" },
                { "Key": "Department" },
                { "Key": "User" },
            ]

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
    serviceRequestListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();