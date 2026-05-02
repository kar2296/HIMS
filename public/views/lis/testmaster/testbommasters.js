(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('testBOMFormController', testBOMFormController);

    function testBOMFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = []; // saved for bulk items 

        $scope.item = {
            Quantity: 1,
            BOMType: 1,
            Wastage: 1
        }; // saved for individual item 

        var testmasterid = parseInt($stateParams.id);
        var TestCode = $state.params.TestCode;

        $scope.getListCallback = function(scope, res, options, hasError) {
            console.log(res.Data);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function(pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: testmasterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/testmaster/GetTestmasterBOMs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item = {};
           
            $scope.getList();
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.TestmasterId = testmasterid;
            var actionName = 'lis/testmaster/AddTestmasterBOM';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'lis/testmaster/UpdateTestmasterBOM';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'lis/testmaster/DeleteTestmasterBOM',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('app.itemmastertab.itemmaster', {
                    params: { id: row.ItemId },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "ItemName",
                    displayName: $translate.instant('lis.testbom.items.lbl'),
                    // cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    //     "<span >{{ItemName }}</span>" +
                    //     "<span >(</span>" +
                    //     "<span >{{row.ItemCode}}</span>" + "<span >)</span>" +
                    //     "</div>"
                },
                {
                    field: "Quantity",
                    displayName: $translate.instant('lis.testbom.qty.lbl'),

                },
                {
                    field: "Wastage",
                    displayName: $translate.instant('lis.testbom.wastage.lbl'),
                },
                {
                    field: "QC",
                    displayName: $translate.instant('lis.testbom.qc.lbl'),
                },
                {
                    field: "NoOfTests",
                    displayName: $translate.instant('lis.testbom.tests.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: ' <div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"> <img class="drhms-edit-button" src="assets/svg/edit.svg" alt="" uib-tooltip="View" tooltip-placement="bottom"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="" uib-tooltip="Delete" tooltip-placement="bottom"></span>\
                     </div>',
                     handleEvent: $scope.handleEvents,
                   
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                    //     { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    // ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

      vm.purchaseitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'UCP', field: 'CostPrice', datatype: 'string', headercls: 'td-ucp', fieldcls: 'td-ucp' },
                { header: 'Product Type Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer Name', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },

            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedgrnitem,
            presearch: presearchgrnitem,
            postsearch: postsearchgrnitem
        };

        function formatselectedgrnitem() {
            var selectedItem = vm.purchaseitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
                $scope.item.CostPrice = selectedItem.CostPrice;
            } else if (vm.purchaseitemcontrolconfig.rowdata) {
                result = [vm.purchaseitemcontrolconfig.rowdata.ItemName, vm.purchaseitemcontrolconfig.rowdata.ItemCode,
                    vm.purchaseitemcontrolconfig.rowdata.CostPrice,].join(' ');
            }
            return result;
        }

        function presearchgrnitem() {
            var query = vm.purchaseitemcontrolconfig.query;
            var inputData = {
                Params: [
                    // { Key: 4, Value: $scope.item.StoreMasterId },
                    //  { Key: 1, Value: $scope.item.VendorMasterId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.purchaseitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.purchaseitemcontrolconfig.searchparams = inputData;
        }

        function postsearchgrnitem() {
            for (var idx in vm.purchaseitemcontrolconfig.result) {
                var item = vm.purchaseitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.CostPrice = item.CostPrice;
                if (item.ProductType)
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                if (item.GenericMaster)
                    item.GenericName = item.GenericMaster.GenericName;
                if (item.Manufacturer)
                    item.ManufacturerName = item.Manufacturer.VendorName;
            }
        }
        $scope.ItemMasterChanged = function (item) {
            // $scope.item.ItemId = $scope.item.ItemId;
            $scope.item.ItemCode = item.ItemCode;
            $scope.item.ItemName = item.ItemName;
            $scope.item.CostPrice = item.CostPrice;
            $scope.item.ItemCategoryId = item.ItemMaster.CategoryId;
            $scope.item.ItemSubCategoryId = item.ItemMaster.SubCategoryId;
            $scope.item.ProductTypeId = item.ItemMaster.ProductTypeId;
            $scope.item.ProductSubTypeId = item.ItemMaster.SubProductTypeId;

        }
          $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ActiveStatus" },

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

    testBOMFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();