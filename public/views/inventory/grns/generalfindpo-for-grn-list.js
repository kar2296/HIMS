(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('generalfindpoforgrnListController', generalfindpoforgrnListController);

    function generalfindpoforgrnListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.lookup = {
            StoreUsers: []
        };
        $scope.currentcontext = {
            DefaultStoreId: 0,
            LoggedInUserId: 0,
            PoStatusId: [2, 3],
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
                PoStatusId: [2, 3],
                StoreMasterId: $scope.currentcontext.DefaultStoreId,
                FromStoreMasterId: -1,
                ApprovedBy: utl.Session.getCurrentUserId(),
                PoTypeId: -1,
                VendorMasterId: -1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [

                    {
                        type: 'date',
                        translate: 'inventory.findpo-list.fromdate.lbl',
                        model: 'FromDate',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'inventory.findpo-list.todate.lbl',
                        model: 'ToDate',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'inventory.findpo-list.pono.lbl',
                        model: 'PoNumber',
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.potype.lbl',
                        model: 'PoTypeId',
                        options: $scope.lookup.PoType,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    // { type: 'select', translate: 'inventory.findpo-list.raisedby.lbl', model: 'ApprovedBy', options: $scope.lookup.StoreUsers, position: { r: 1, c: 1 } },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.vendorname.lbl',
                        model: 'VendorMasterId',
                        options: $scope.lookup.VendorMaster,
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.mystore.lbl',
                        model: 'StoreMasterId',
                        options: $scope.lookup.UserStores,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    // { type: 'select', translate: 'inventory.findpo-list.fromstore.lbl', model: 'FromStoreMasterId', options: $scope.lookup.FromStore, position: { r: 2, c: 1 } },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.status.lbl',
                        model: 'PoStatusId',
                        options: $scope.lookup.PoStatus,
                        position: {
                            r: 2,
                            c: 2
                        }
                    },
                    // { type: '', translate: '', model: '', position: { r: 4, c: 2 } }
                ],
                actions: [
                    // { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' },
                    {
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-success'
                    }
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
            // $scope.gridData = res.Data;
            // var items = $scope.gridData;
            // vm.gridConfig.data = items;
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var items = res.Data[idx];
                if ($scope.modeldata.PoStatusId == -1) {
                    if (items.PoStatusId != 1) {
                        vm.gridConfig.data.push(items);
                    }
                }
                if ($scope.modeldata.PoStatusId != -1) {
                    if (items.PoStatusId != 1) {
                        vm.gridConfig.data.push(items);
                    }
                }
            }

            // vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.modeldata.PoNumber },
                    { Key: 2, Value: $scope.modeldata.PoTypeId },
                    { Key: 3, Value: $scope.modeldata.VendorMasterId },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.PoStatusId
                    },
                    { Key: 8, Value: FrmDate },
                    { Key: 9, Value: ToDate },
                    { Key: 20, Value: true },
                    // { Key: 7, Value: [FrmDate, ToDate] },
                    // { Key: 16, Value: $scope.currentcontext.FacilityId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'pharmacy/purchaseorder/GetPurchaseOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                if (entity.PoStatusId == 5) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status1.lbl'));
                    return false;
                } else if (entity.PoStatusId == 4) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status2.lbl'));
                    return false;
                } else {
                    $scope.confirmCallback({
                        poId: entity.Id,
                        PoStatusId: entity.PoStatusId
                    });
                }
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                field: "Id",
                displayName: $translate.instant('Select'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="btn btn-check btn-rounded fa fa-check" aria-hidden="true"></i></span>\
                                </div>',
                handleEvent: $scope.handleEvents,
            },
            {
                field: "PoDate",
                displayName: $translate.instant('inventory.findpo-list.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PoDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PoDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            //{ field: "PurchaseOrderDetail.ItemCode", displayName: $translate.instant('inventory.findpo-list.item.lbl') },
            //{ field: "PoDate", displayName: $translate.instant('inventory.findpo-list.date.lbl') },
            {
                field: "FromStore.StoreName",
                displayName: $translate.instant('inventory.findpo-list.fromstore.lbl')
            },
            {
                field: "PoNumber",
                displayName: $translate.instant('inventory.findpo-list.pono.lbl')
            },
            {
                field: "VendorMaster.VendorName",
                displayName: $translate.instant('inventory.findpo-list.vendor.lbl')
            },
            {
                field: "PoStatus.Description",
                displayName: $translate.instant('inventory.findpo-list.postatus.lbl')
            },
            //{ field: "GrnStatus.Description", displayName: $translate.instant('inventory.findpo-list.grnstatus.lbl') },
            //{ field: "TotalGrossAmount", displayName: $translate.instant('inventory.findpo-list.gross.lbl') },
            {
                field: "TotalGrossAmount",
                displayName: $translate.instant('inventory.findpo-list.gross.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            //{ field: "TotalDiscountAmount", displayName: $translate.instant('inventory.findpo-list.discount.lbl') },
            {
                field: "TotalDiscountAmount",
                displayName: $translate.instant('inventory.findpo-list.discount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalDiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            //{ field: "OtherCharges", displayName: $translate.instant('inventory.findpo-list.othercost.lbl') },
            {
                field: "OtherCharges",
                displayName: $translate.instant('inventory.findpo-list.othercost.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.OtherCharges | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            //{ field: "TotalGstAmount", displayName: $translate.instant('inventory.findpo-list.tax.lbl') },
            {
                field: "TotalGstAmount",
                displayName: $translate.instant('inventory.findpo-list.tax.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            //{ field: "TotalNetAmount", displayName: $translate.instant('inventory.findpo-list.netamount.lbl') },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('inventory.findpo-list.netamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
                //{ field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.findpo-list.vendor.lbl') }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true
        };

        // vm.gridConfig.enableRowSelection = true;
        // vm.gridConfig.multiSelect = false;
        // vm.gridConfig.onRegisterApi = function (gridApi) {
        //     $scope.gridApi = gridApi;
        //     gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        //         if (entity.PoStatusId == 5) {
        //             utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status1.lbl'));
        //             return false;
        //         } else if (entity.PoStatusId == 4) {
        //             utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status2.lbl'));
        //             return false;
        //         }
        //         //console.log(entity.Id);
        //         $scope.confirmCallback({
        //             poId: entity.Id
        //         });
        //     });
        // };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores') {
                    $scope.currentcontext.DefaultStoreId = value[0].Id;
                    $scope.SelectedStoreUsers();
                }
            });
            initDynamicForm();
            $scope.getList();
        };
        $scope.SelectedStoreUsers = function () {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.DefaultStoreId
                }],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'pharmacy/storeusermap/GetStoreUserMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getStoreUserCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getStoreUserCallback = function (scope, res, options, hasError) {
            var StoreUser = {};
            var StoreUserData = res.Data || [];
            for (var suidx in StoreUserData) {
                StoreUser = {
                    Id: StoreUserData[suidx].UserId,
                    UserId: StoreUserData[suidx].UserId,
                    Text: StoreUserData[suidx].User.FirstName
                }
                $scope.lookup.StoreUsers.push(StoreUser);
            }
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PoType"
            },
            {
                "Key": "FromStore",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 7,
                        Value: 2
                    }
                    ]
                }
            },
            {
                "Key": "VendorMaster",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }]
                }
            },
            {
                "Key": "PoStatus"
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
                        Value: $scope.currentcontext.FacilityId
                    }
                    ]
                },
                Default: false
            },
            {
                "Key": "ApprovedUser",
                Request: {
                    Params: [{
                        Key: 0,
                        Value: utl.Session.getCurrentUserId()
                    }]
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
        };

        $scope.initLookup();
    }

    generalfindpoforgrnListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();