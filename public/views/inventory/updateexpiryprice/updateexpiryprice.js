(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('UpdateExpiryPriceController', UpdateExpiryPriceController);

    function UpdateExpiryPriceController($rootScope,$scope, $stateParams, $state, $translate, utl, $filter,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ItemMasterId: 0,
            ItemCode: null,
            ItemName: null,
            StoreMasterId: 0,
            Quantity: 0
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.StockSerialItems = [];
        $scope.addNewLineItem = function () {
            var serialitem = {
                Id: 0,
                StockItemId: 0,
                Ucp: 0.00,
                Mrp: 0.00,
                BatchId: null,
                ExpiryDate: null,
                Quantity: 0,
                GrnNumber: null
            };
            $scope.StockSerialItems.push(serialitem);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function () {
            if(!$scope.currentfilter.ItemMasterId){
                utl.Alert.showErrorMsg('Please Select Item First');
                return false;
            }
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.StoreMasterId
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.StockSerialItems = res.Data || [];
            for (var idx in $scope.StockSerialItems) {
                var serialitem = $scope.StockSerialItems[idx];
                if (serialitem.ItemMasterId > 0) {
                    serialitem.Id = serialitem.Id;
                    serialitem.StockItemId = serialitem.StockItemId;
                    serialitem.BatchId = serialitem.BatchId;
                    serialitem.ExpiryDate = serialitem.ExpiryDate;
                    serialitem.Ucp = serialitem.Ucp;
                    serialitem.Mrp = serialitem.Mrp;
                    if (serialitem.Grn === null) {
                        serialitem.GrnNumber = '';
                    } else {
                        serialitem.GrnNumber = serialitem.Grn.GrnNumber;
                    }
                }
            }
        };

        //     $scope.addNew = function(){
        //     $state.go('app.updateexpiryprice',{id :0})
        //    }
        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.updateexpiryprice', { id: 0 });
            else
                $state.reload();
        };
        $scope.Clear = function () {
            $scope.StockSerialItems = [];
            // $scope.item_form.$resetForm(true);
        };


        $scope.onUpdate = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.updateexpiryprice.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onUpdateConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onUpdateConfirmed = function () {
            $scope.UpdateSerialItems();
        };

        $scope.UpdateSerialItems = function () {
            var stockserialitems = getLinesToUpdate();
            var actionName = 'pharmacy/stockserialitem/UpdateStockSerialItems';
            var inputData = {
                Header: $scope.currentfilter,
                Details: stockserialitems
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            loadData();
        };

        function getLinesToUpdate() {
            var result = [];
            for (var idx in $scope.StockSerialItems) {
                var item = $scope.StockSerialItems[idx];
                if (item.ItemMasterId > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function getquantity() {
            for (var idx in $scope.stockserialitems) {
                if ($scope.Quantity === null) {
                    $scope.Quantity = 0;
                }
                $scope.Quantity = parseFloat(($scope.Quantity + $scope.stockserialitems[idx]));
            }
        }

        vm.stockitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                // { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                // { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Stock-In-Hand', field: 'StockInHand', datatype: 'string', headercls: 'td-stockinhand', fieldcls: 'td-stockinhand' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemStoreMaps',
            formatdisplay: formatselectedstockitem,
            presearch: presearchstockitem,
            postsearch: postsearchstockitem
        };

        function formatselectedstockitem() {
            var selectedItem = vm.stockitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.ItemMasterId = selectedItem.ItemMasterId;
                $scope.currentfilter.ItemCode = selectedItem.ItemCode;
                $scope.currentfilter.ItemName = selectedItem.ItemName;
                if(selectedItem.ItemMaster.StockItem)
                $scope.currentfilter.Quantity = selectedItem.ItemMaster.StockItem.Quantity;
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stockitemcontrolconfig.rowdata) {
                result = [vm.stockitemcontrolconfig.rowdata.ItemCode, vm.stockitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchstockitem() {
            var query = vm.stockitemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 4, Value: 1 },
                    { Key: 13, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.stockitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstockitem() {
            for (var idx in vm.stockitemcontrolconfig.result) {
                var item = vm.stockitemcontrolconfig.result[idx];
                item.ItemMasterId = item.ItemMasterId;
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                if (item.ItemMaster.StockItem !== null) {
                    item.StockInHand = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.StockInHand = 0;
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores') {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
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
        };

        $scope.initLookup();
    }

    UpdateExpiryPriceController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter','$timeout'];

})();