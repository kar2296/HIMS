(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssignmentListController', AssignmentListController);

    function AssignmentListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTicketStatusId: 2,
            AssignTypeId: -1,
            FromDepartmentId: utl.Session.getCurrentDepartmentId(),
            PriorityId: -1,
              AssignedId: -1,

        };
        function handleDynamicFormEvents(actionType, formData) {
            $scope.getList();
        }
                $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        // $scope.getListCallback = function (scope, data, options, hasError) {
        //     // vm.gridConfig.data = res.Data;
        //     // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        //     vm.gridConfig.data = [];
        //     for (var idx in data.Data) {
        //         var list = {};

        //         if (data.Data[idx].AssetTicketStatusId == 2) {
        //             list = data.Data[idx];
        //             vm.gridConfig.data.push(list);
        //         }
        //     }
        //     vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        // };
        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 2, Value: $scope.currentfilter.RequestTypeId },
                    { Key: 3, Value: $scope.currentfilter.ExpectedDate },
                    { Key: 4, Value: $scope.currentfilter.AssetTicketStatusId },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },

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

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.open('app.assignmentform', {
                    params: { id: entity.Id },
                    confirmCallback: $scope.getList
                }
                );
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
                { field: "TicketNumberIdentifier", displayName: $translate.instant('assetmanagement.assignment-list.ticketno.lbl') },
                {
                    field: "ExpectedDate", displayName: $translate.instant('assetmanagement.assignment-list.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.ExpectedDate '></ngformatdate>"
                },
                { field: "Priority.Description", displayName: $translate.instant('assetmanagement.assignment-list.priority.lbl') },
                { field: "ServiceType.Description", displayName: $translate.instant('assetmanagement.assignment-list.type.lbl') },
                { field: "AssetName", displayName: $translate.instant('assetmanagement.assignment-list.assetname.lbl') },
                { field: "FromDepartment.Description", displayName: $translate.instant('assetmanagement.assignment-list.department.lbl') }, {
                    field: "CreatedUser", displayName: $translate.instant('assetmanagement.assignment-list.requestedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span>'
                    + "{{entity.CreatedUser.Title.Description}}&nbsp;</span>"
                    + "<span >&nbsp;{{entity.CreatedUser.FirstName}}&nbsp;</span>"
                    + "<span >&nbsp;{{entity.CreatedUser.LastName}}</span>"
                    + "</span></div>"
                },
                //   {
                //     field: "Created", displayName: $translate.instant('admissionrequests.requestedby.lbl'),
                //     cellTemplate: "<span class='pl-3'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>"
                //     + "<span class='pl-3'>{{entity.CreatedUser.FirstName}}&nbsp;</span>"
                //     + "<span class='pl-3'>{{entity.CreatedUser.LastName}}&nbsp;</span>"
                // },
                { field: "AssetTicketStatus.Description", displayName: $translate.instant('assetmanagement.assignment-list.orderstatus.lbl') },
                {
                    field: "Assigned", displayName: $translate.instant('assetmanagement.assignment-list.assignedto.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span>'
                    + "{{entity.Assigned.Title.Description}}&nbsp;</span>"
                    + "<span >&nbsp;{{entity.Assigned.FirstName}}&nbsp;</span>"
                    + "<span >&nbsp;{{entity.Assigned.LastName}}</span>"
                    + "</span></div>"
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    handleEvent: $scope.handleEvents,
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AssetTicketStatus" },
                { "Key": "RequestType" },
                { "Key": "Department" },
                { "Key": "User" },
                { "Key": "Priority" },
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
    AssignmentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();