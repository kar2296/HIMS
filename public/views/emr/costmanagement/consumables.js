(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('consumablesListController', consumablesListController);

    function consumablesListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = []; // saved for bulk items 
        $scope.item = {
            Quantity: 1,
			 FacilityId:  utl.Session.getCurrentFacilityId(),
    
        }; // saved for individual item 
        $scope.currentcontext = {};
        $scope.TotalAmount = 0;
        $scope.currentcontext.costdetailid = parseInt($stateParams.id);
        // var TestCode = $state.params.TestCode;

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            var Amount = 0;
            for (var idx in res.Data) {
                Amount = Amount + res.Data[idx].UCP
            }
            $scope.TotalAmount = Amount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };

        $scope.getList = function(pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.costdetailid },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'CostManagement/Consumables/GetConsumabless',
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
            var actionName = 'CostManagement/Consumables/AddConsumables';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'CostManagement/Consumables/UpdateConsumables';
            }
            $scope.item.CostDetailId = $scope.currentcontext.costdetailid;
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
                action: 'CostManagement/Consumables/DeleteConsumables',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.backToForm = function() {
            $state.go('app.costtab.details');
        }


        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.open('app.itemmastertab.itemmaster', {
                    params: { id: entity.ItemId },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ItemName", displayName: $translate.instant('costmanagement.consumables-list.inventoryitems.lbl') },
                { field: "Quantity", displayName: $translate.instant('costmanagement.consumables-list.quantity.lbl') },
                { field: "CostType.Description", displayName: $translate.instant('costmanagement.consumables-list.type.lbl') },
                {
                    field: "UCP",
                    displayName: $translate.instant('costmanagement.consumables-list.ucp.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.UCP | displaycurrency}}</span>" + "</div>"
                },


                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                //     ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
       <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
    <span class="grid-action"  ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1 || entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
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
            } else if (vm.purchaseitemcontrolconfig.rowdata) {
                result = [vm.purchaseitemcontrolconfig.rowdata.ItemName, vm.purchaseitemcontrolconfig.rowdata.ItemCode].join(' ');
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
                if (item.ProductType)
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                if (item.GenericMaster)
                    item.GenericName = item.GenericMaster.GenericName;
                if (item.Manufacturer)
                    item.ManufacturerName = item.Manufacturer.VendorName;
            }
        }
        $scope.ItemMasterChanged = function(item) {
            // $scope.item.ItemId = $scope.item.ItemId;
            $scope.item.ItemCode = item.ItemCode;
            $scope.item.ItemName = item.ItemName;
        }


        $scope.computeAmount = function(item) {
            item.Amount = item.UCP * item.Quantity;
        }
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "CostType" },

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

    consumablesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();