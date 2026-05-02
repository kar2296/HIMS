(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilitycssdgroupitemsController', facilitycssdgroupitemsController);

    function facilitycssdgroupitemsController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.serviceitemid = parseInt($stateParams.id);

        $scope.addNewLineItem = function() {
            var lineItem = {
                Id: 0,
                Status: 1,
                Quantity: 1,
                StatusId: true
            };
            vm.items.push(lineItem);
        }

          vm.initialstockitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Stock-In-Hand', field: 'StockInHand', datatype: 'string', headercls: 'td-stockinhand', fieldcls: 'td-stockinhand' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetStoreItemsForOpeningStockEntry',
            formatdisplay: formatselectedinitialstockitem,
            presearch: presearchinitialstockitem,
            postsearch: postsearchinitialstockitem
        };

        function formatselectedinitialstockitem() {
            var selectedItem = vm.initialstockitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.initialstockitemcontrolconfig.rowdata) {
                result = [vm.initialstockitemcontrolconfig.rowdata.ItemCode, vm.initialstockitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchinitialstockitem() {
            var query = vm.initialstockitemcontrolconfig.query;
            var inputData = {
                Params: [{ Key: 1, Value: $scope.item.StoreMasterId }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.initialstockitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.initialstockitemcontrolconfig.searchparams = inputData;
        }

        function postsearchinitialstockitem() {
            for (var idx in vm.initialstockitemcontrolconfig.result) {
                var item = vm.initialstockitemcontrolconfig.result[idx];
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

        //getlist
        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.items = res.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function() {

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/CssdGroupItem/GetCssdGroupItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function() {
            vm.items = [];
            $scope.addNewLineItem();
        }
        $scope.backToList = function() {
            $state.go('app.serviceitemtab.details', { id: $scope.currentcontext.serviceitemid });
        }
        $scope.back = function() {
            $state.go('app.serviceitems', { id: $scope.currentcontext.serviceitemid });
        }
        $scope.addNew = function() {
            $scope.addNewLineItem();
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function(idx, item) {
            var name = item.AliasName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        //Save Item
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        // $scope.saveItem = function() {
        //     if (validateGrid()) {
        //         var lines = getLinesForSave();
        //         var options = {
        //             action: 'pharmacy/CssdGroupItem/AddCssdGroupItem',
        //             data: { Data: lines },
        //             type: 'post',
        //             onComplete: $scope.saveItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

          $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/CssdGroupItem/AddCssdItemSetUp';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/CssdGroupItem/UpdateCssdItemSetUp';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [
                { search: 1, fields: ['Status'] }
            ]);

            return true;
        }

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.ServiceId) {
                    item.ServiceItemId = $scope.currentcontext.serviceitemid;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.computeNetAmount = function(item) {
                if (item.Quantity && item.Amount) {
                    item.NetAmount = item.Quantity * item.Amount;
                }
            }
            //lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "TestMaster" },
                { "Key": "ServiceItemDiscountType" }
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

    facilitycssdgroupitemsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();