(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findgrnListController', findgrnListController);

    function findgrnListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookup = {};

        $scope.currentcontext = {
            DefaultStoreId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.id = modalConfig.params.id;

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                StoreMasterId: $scope.currentcontext.DefaultStoreId,
                GrnStatusId: 2,
                FacilityId: utl.Session.getCurrentFacilityId(),
                VendorMasterId: -1,
                GrnTypeId: -1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'date', translate: 'inventory.findpo-list.fromdate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.findpo-list.todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'inventory.findpo-list.grnno.lbl', model: 'GrnNumber', position: { r: 0, c: 2 } },
                    { type: 'select', translate: 'inventory.findpo-list.vendorname.lbl', model: 'VendorMasterId', options: $scope.lookup.VendorMaster, position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'inventory.findpo-list.invno.lbl', model: 'InvoiceNumber', position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'inventory.findpo-list.gatepassno.lbl', model: 'GpNo', position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'inventory.findpo-list.grntype.lbl', model: 'GrnTypeId', options: $scope.lookup.PoType, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'inventory.findpo-list.store.lbl', model: 'StoreMasterId', options: $scope.lookup.UserStores, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'inventory.findpo-list.status.lbl', model: 'GrnStatusId', options: $scope.lookup.PoStatus, position: { r: 2, c: 2 } },
                    { type: '', translate: '', model: '', position: { r: 4, c: 2 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }

            $scope.getList();
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "GrnDate",
                    displayName: $translate.instant('inventory.grns.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.GrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.GrnDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "GrnNumber", displayName: $translate.instant('inventory.grns.grnno.lbl') },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.grns.grnstore.lbl') },
                { field: "GrnType.Description", displayName: $translate.instant('inventory.grns.type.lbl') },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.grns.vendorname.lbl') },
                { field: "InvoiceNumber", displayName: $translate.instant('inventory.grns.po/invoiceno.lbl') },
                {
                    field: "TotalGrossAmount", displayName: $translate.instant('inventory.grns.amount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGrossAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.TotalGrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalDiscountAmount", displayName: $translate.instant('inventory.grns.discount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalDiscountAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.TotalDiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalGstAmount", displayName: $translate.instant('inventory.grns.tax.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGstAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalNetAmount", displayName: $translate.instant('inventory.grns.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "GrnStatus.Description", displayName: $translate.instant('inventory.grns.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.GrnStatusId==2||row.entity.GrnStatusId==3||row.entity.GrnStatusId==4||row.entity.GrnStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.GrnStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.GrnStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.modeldata.GrnNumber },
                    { Key: 2, Value: $scope.modeldata.GrnTypeId },
                    { Key: 3, Value: $scope.modeldata.StoreMasterId },
                    { Key: 4, Value: $scope.modeldata.VendorMasterId },
                    { Key: 5, Value: $scope.modeldata.InvoiceNumber },
                    { Key: 6, Value: $scope.modeldata.GrnStatusId },
                    { Key: 7, Value: [FrmDate, ToDate] },
                    { Key: 11, Value: $scope.modeldata.GpNo },
                    { Key: 14, Value: $scope.currentcontext.FacilityId }
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'pharmacy/grn/GetGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "GrnDate",
                    displayName: $translate.instant('inventory.findpo-list.grndate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.GrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.GrnDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "GrnNumber", displayName: $translate.instant('inventory.findpo-list.grnno.lbl'), },
                { field: "InvoiceNumber", displayName: $translate.instant('inventory.findpo-list.invno.lbl'), },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.findpo-list.vendorname.lbl'), },
                { field: "GrnStatus.Description", displayName: $translate.instant('inventory.findpo-list.grnstatus.lbl'), },
                { field: "ApprovedUser.FirstName", displayName: $translate.instant('inventory.findpo-list.createdby.lbl') },
                {
                    field: "TotalNetAmount", displayName: $translate.instant('inventory.findpo-list.netamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (row.entity.GrnStatusId == 5) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status1.lbl'));
                    return false;
                }
                console.log(row.entity.Id);
                $scope.confirmCallback({ grnId: row.entity.Id });
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores') {
                    $scope.currentcontext.DefaultStoreId = value[0].Id;
                }
            });

            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PoType" },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentcontext.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                { "Key": "PoStatus" },
                {
                    "Key": "VendorMaster",
                    Request: {
                        Params: [{ Key: 3, Value: 1 }]
                    }
                },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
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

    findgrnListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();