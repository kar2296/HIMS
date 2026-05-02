(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findreturnListController', findreturnListController);

    function findreturnListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.lookup = {};
        $scope.currentcontext = {
            DefaultStoreId: 0,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //$scope.currentcontext.id = modalConfig.params.id;

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                PoStatusId: 2,
                PoTypeId: -1,
                VendorMasterId: -1,
                StoreMasterId: $scope.currentcontext.DefaultStoreId
                //ApprovedBy: utl.Session.getCurrentUserId(),
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'date', translate: 'inventory.findpo-list.fromdate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.findpo-list.todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'inventory.findpo-list.grnno.lbl', model: 'GrnNumber', position: { r: 0, c: 2 } },
                    { type: 'select', translate: 'inventory.findpo-list.returntype.lbl', model: 'PrnTypeId', options: $scope.lookup.PrnType, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.findpo-list.vendorname.lbl', model: 'VendorMasterId', options: $scope.lookup.VendorMaster, position: { r: 1, c:2 } },
                    { type: 'select', translate: 'inventory.findpo-list.returnreason.lbl', model: 'ReturnReasonId', options: $scope.lookup.ReturnReason, position: { r: 1, c: 2 } },
                    { type: 'text', translate: 'inventory.findpo-list.returnno.lbl', model: 'PrnNumber', position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'inventory.findpo-list.returnby.lbl', model: 'ReturnedBy', options: $scope.lookup.ReturnedUser, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'inventory.findpo-list.status.lbl', model: 'PrnStatusId', options: $scope.lookup.PrnStatus, position: { r: 2, c: 2 } },
                    //{ type: '', translate: '', model: '', position: { r: 4, c: 2 } }
                ],
                actions: [
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' },
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-success' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }

            $scope.getList();
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
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.modeldata.PrnNumber },
                    { Key: 2, Value: $scope.modeldata.PrnTypeId },
                    { Key: 3, Value: $scope.modeldata.VendorMasterId },
                    { Key: 5, Value: $scope.modeldata.PrnStatusId },
                    { Key: 12, Value: $scope.modeldata.GrnNumber },
                    { Key: 4, Value: $scope.modeldata.StoreMasterId },
                    { Key: 13, Value: $scope.modeldata.ReturnedBy },
                    { Key: 14, Value: $scope.modeldata.ReturnReasonId },
                    { Key: 8, Value: [FrmDate, ToDate] }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'pharmacy/purchasereturn/GetPurchaseReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "PrnDate",
                    displayName: $translate.instant('inventory.findpo-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.PrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.PrnDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.findreturn.vendor.lbl') },
                //{ field: "Return Date", displayName: $translate.instant('inventory.findreturn.returndate.lbl') },
                { field: "PrnNumber", displayName: $translate.instant('inventory.findreturn.returnno.lbl') },
                { field: "PrnType.Description", displayName: $translate.instant('inventory.findreturn.returntype.lbl') },
                { field: "GrnId", displayName: $translate.instant('inventory.findreturn.grnno.lbl') },
                { field: "PrnStatus.Description", displayName: $translate.instant('inventory.findreturn.status.lbl') },
                { field: "TotalNetAmount", displayName: $translate.instant('inventory.findreturn.amount.lbl') },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (row.entity.PoStatusId == 5) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status1.lbl'));
                    return false;
                } else if (row.entity.PoStatusId == 4) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status2.lbl'));
                    return false;
                }
                //console.log(row.entity.Id);
                $scope.confirmCallback({ Id: row.entity.Id });
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
                { "Key": "PrnType" },
                {
                    "Key": "VendorMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 1
                        }]
                    }
                },
                { "Key": "PrnStatus" },
                { "Key": "ReturnReason" },
                { "Key": "ReturnedUser" },
                // {
                //     "Key": "UserStores",
                //     Request: {
                //         Params: [{
                //             Key: 1,
                //             Value: utl.Session.getCurrentUserId()
                //         }]
                //     },
                //     Default: false
                // }
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

    findreturnListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();