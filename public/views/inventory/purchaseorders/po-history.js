(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pohistoryController', pohistoryController);

    function pohistoryController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            AvailableQuantity: 'Available Quantity ',
            TotalAvailableQuantity: 0,
            TotalPoQuantity: 0,
            TotalReceivedQuantity: 0
        };
        $scope.currentfilter = {
            title: 'Purchase History of ',
            vendormasterid: 0,
            itemmasterid: 0,
            storemasterid: 0,
            itemcode: null,
            itemname: null,
            item: null,
            FromDate: utl.Formatter.getThirtyDaysBackDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentfilter.vendormasterid = parseInt(modalConfig.params.vendormasterid);
            $scope.currentfilter.itemmasterid = parseInt(modalConfig.params.itemmasterid);
            $scope.currentfilter.itemcode = modalConfig.params.itemcode;
            $scope.currentfilter.itemname = modalConfig.params.itemname;
            $scope.currentfilter.item = modalConfig.params.item;
            $scope.currentfilter.storemasterid = parseInt(modalConfig.params.storemasterid);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item.TotalAvailableQuantity = 0;
            $scope.item.TotalPoQuantity = 0;
            $scope.item.TotalReceivedQuantity = 0;
            $scope.historyDetails = res.Data || [];
            if ($scope.historyDetails.length > 0) {
                for (var idx in $scope.historyDetails) {
                    var historyitem = $scope.historyDetails[idx];
                    if (historyitem.ItemMasterId > 0) {
                        if (historyitem.ItemMaster) {
                            if (historyitem.ItemMaster.StockItem) {
                                $scope.item.TotalAvailableQuantity = historyitem.ItemMaster.StockItem.Quantity;
                            }
                        }

                        $scope.item.TotalPoQuantity = $scope.item.TotalPoQuantity + historyitem.PoQuantity;
                        $scope.item.TotalReceivedQuantity = $scope.item.TotalReceivedQuantity + historyitem.ReceivedQuantity;
                    }
                }
            } else {
                $scope.item.TotalAvailableQuantity = 0;
                var selecteditem = $scope.currentfilter.item;
                if (selecteditem.SelectedItem) {
                    if (selecteditem.SelectedItem.ItemMaster) {
                        if (selecteditem.SelectedItem.ItemMaster.StockItem) {
                            $scope.item.TotalAvailableQuantity = selecteditem.SelectedItem.ItemMaster.StockItem.Quantity;
                        }
                    }
                } else if (selecteditem.ItemMaster) {
                    if (selecteditem.ItemMaster.StockItem) {
                        $scope.item.TotalAvailableQuantity = selecteditem.ItemMaster.StockItem.Quantity;
                    }
                }
            }

            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.actionSearch = function () {
            $scope.getList();
        };

        $scope.getList = function () {
            var fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            if (!$scope.currentfilter.ToDate) {
                toDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59');
            }
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.itemmasterid
                    },
                    {
                        Key: 3,
                        Value: [fromDate, toDate]
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.storemasterid
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/purchaseorderdetail/GetPurchaseOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.purchaseorder', {
                itemmasterid: 0
            });
        };

        vm.gridConfig = {
            columnDefs: [{
                    field: "VendorMaster.VendorName",
                    displayName: $translate.instant('inventory.po-history.vendor.lbl')
                },
                /* { field: "DeliveryStore.StoreName", displayName: $translate.instant('inventory.po-history.store.lbl') }, */
                {
                    field: "PurchaseOrder.PoNumber",
                    displayName: $translate.instant('inventory.po-history.ponumber.lbl')
                },
                // {
                //     field: "PurchaseOrder.PoDate",
                //     displayName: $translate.instant('inventory.po-history.podate.lbl'),
                //     cellTemplate: "<ngformatdate date-val='row.entity.PurchaseOrder.PoDate'></ngformatdate>"
                // },
                {
                    field: "PoDate",
                    displayName: $translate.instant('inventory.purchaseorder.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PurchaseOrder.PoDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PurchaseOrder.PoDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PurchaseUom.UomCode",
                    displayName: $translate.instant('inventory.po-history.uom.lbl')
                },
                {
                    field: "ConversionQuantity",
                    displayName: $translate.instant('inventory.po-history.conversionqty.lbl')
                },
                {
                    field: "PoQuantity",
                    displayName: $translate.instant('inventory.po-history.poquantity.lbl')
                },
                {
                    field: "TotalQuantity",
                    displayName: $translate.instant('inventory.po-history.grnquantity.lbl')
                },
                {
                    field: "UomPrice",
                    displayName: $translate.instant('inventory.po-history.uomcostprice.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UomPrice | displaycurrency}}</span>" + "</div>"
                },
                // {
                //     field: "UomCostPrice",
                //     displayName: $translate.instant('inventory.po-history.uomcostprice.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.UomCostPrice | displaycurrency}}</span>" + "</div>"
                // },
                {
                    field: "DiscountAmount",
                    displayName: $translate.instant('inventory.po-history.uomdiscountamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DiscountAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "UomMrPrice",
                    displayName: $translate.instant('inventory.po-history.uommrprice.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UomMrPrice | displaycurrency}}</span>" + "</div>"
                    
                },

                // {
                //     field: "ItemMaster.MrPrice",
                //     displayName: $translate.instant('inventory.po-history.uommrprice.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.UomMrPrice | displaycurrency}}</span>" + "</div>"
                // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "FromStore"
                },
                {
                    "Key": "ToStore"
                },
                {
                    "Key": "VendorMaster"
                }
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

    pohistoryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();