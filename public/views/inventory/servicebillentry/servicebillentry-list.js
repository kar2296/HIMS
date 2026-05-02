(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceBillEntryListController', ServiceBillEntryListController);

    function ServiceBillEntryListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            ServiceBillStatusId: 2,
            ServiceBillDate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            //     vm.gridConfig.data = res.Data;
            //     vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            vm.gridConfig.data = [];
            var totalnetamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.TotalNetAmount = isNaN(parseFloat(item.Amount)) ? (0) : parseFloat(item.TotalNetAmount);
                totalnetamount = totalnetamount + (item.Amount)

                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetamount = totalnetamount;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.ServiceBillDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ServiceBillDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DepartmentId },
                    // { Key: 2, Value: [From, To] },
                    { Key: 5, Value: $scope.currentfilter.ServiceBillTypeId },
                    { Key: 7, Value: $scope.currentfilter.ServiceBillNo },
                    { Key: 6, Value: $scope.currentfilter.ServiceBillStatusId },
                    { Key: 3, Value: From },
                    { Key: 4, Value: To },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/ServiceBillEntry/GetServiceBillEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onEnter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ProcedureId = -1;
                $scope.getList();
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/ServiceBillEntry/DeleteServiceBillEntry',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            utl.Modal.open('app.servicebillentryform', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                utl.Modal.open('app.servicebillentryform', {
                    params: { id: row.entity.Id },
                    confirmCallback: $scope.getList
                });
            }
            if (actionType == 'edit') {
                utl.Modal.open('app.servicebillentryform', {
                    params: { id: row.entity.Id },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('inventory.inventoryworkorder.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{rowRenderIndex+ 1}} </span> </div>"
                },
                {
                    field: "ServiceBillDate",
                    displayName: $translate.instant('inventory.inventoryworkorder.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.ServiceBillDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.ServiceBillDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "ServiceBillNo", displayName: $translate.instant('inventory.inventoryworkorder.billno.lbl') },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.inventoryworkorder.vendor.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('inventory.inventoryworkorder.department.lbl') },
                // { field: "NetAmount", displayName: $translate.instant('inventory.inventoryworkorder.amount.lbl') },
                {
                    field: "Amount", displayName: $translate.instant('inventory.inventoryworkorder.amount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.Amount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "ServiceBillStatus.Description", displayName: $translate.instant('inventory.inventoryworkorder.status.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"  uib-tooltip="View"  tooltip-placement="bottom"   ng-show="row.entity.ServiceBillStatusId==2||row.entity.ServiceBillStatusId==4||row.entity.ServiceBillStatusId==5||row.entity.ServiceBillStatusId==6"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  uib-tooltip="Edit"  tooltip-placement="bottom"   ng-show="row.entity.ServiceBillStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  uib-tooltip="Delete"  tooltip-placement="bottom"  ng-show="row.entity.ServiceBillStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    </div>',
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
                { "Key": "VendorMaster" },
                { "Key": "Department" },
                { "Key": "ServiceBillStatus" },
                { "Key": "ServiceBillType" },

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

    ServiceBillEntryListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();