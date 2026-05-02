(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cssdpreparationsListController', cssdpreparationsListController);

    function cssdpreparationsListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.lookup = {};
        // $scope.currentcontext = {
        //     id: -1
        // };
        $scope.currentfilter = {
            Id: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            CategoryId: -1,
            ItemMasterId: -1,
            StoreMasterId: 0
        };




        $scope.IsDisabled = false;




        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var TotalQty = 0;

            console.log(data.Data);

            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.Ucp = isNaN(parseFloat(item.Ucp)) ? (0) : parseFloat(item.Ucp);
                item.Mrp = isNaN(parseFloat(item.Mrp)) ? (0) : parseFloat(item.Mrp);

                //item.Ucp = parseFloat(item.Ucp).toFixed(2);
                //item.Mrp = parseFloat(item.Mrp).toFixed(2);

                TotalQty = TotalQty + data.Data[idx].Quantity;

                vm.gridConfig.data.push(item);
            }

            $scope.TotalQuantity = TotalQty;

            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };
        $scope.getList = function (pageNo) {

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
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
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


        $scope.washing = function () {
            utl.Modal.open('app.cssdwashing', {
                params: {
                    id: $scope.currentfilter.Id,
                    storeMasterId: $scope.currentfilter.StoreMasterId,
                    itemMasterId: $scope.currentfilter.ItemMasterId
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.cleaning = function () {
            utl.Modal.open('app.cssdcleaning', {
                params: {
                    id: $scope.currentfilter.Id,
                    storeMasterId: $scope.currentfilter.StoreMasterId,
                    itemMasterId: $scope.currentfilter.ItemMasterId
                },
                confirmCallback: $scope.initLookup
            });
        };

        // $scope.packing = function () {
        //     utl.Modal.open('app.cssdpacking', {
        //         params: {
        //             id: $scope.currentfilter.Id, storeMasterId: $scope.currentfilter.StoreMasterId,
        //             itemMasterId: $scope.currentfilter.ItemMasterId
        //         },
        //         confirmCallback: $scope.initLookup
        //     });
        // };

        $scope.packing = function () {
            utl.Modal.open('app.cssdpacking', {
                params: {
                    id: $scope.currentfilter.Id,
                    storeMasterId: $scope.currentfilter.StoreMasterId,
                    itemMasterId: $scope.currentfilter.ItemMasterId
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.sterile = function () {
            utl.Modal.open('app.cssdsterile', {
                params: {
                    id: $scope.currentfilter.Id,
                    storeMasterId: $scope.currentfilter.StoreMasterId,
                    itemMasterId: $scope.currentfilter.ItemMasterId
                },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.movetostore = function () {
            utl.Modal.open('app.cssdmovetostore', {
                params: {
                    id: $scope.currentfilter.Id,
                    storeMasterId: $scope.currentfilter.StoreMasterId,
                    itemMasterId: $scope.currentfilter.ItemMasterId
                },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'kitchenworklist.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.Cancelled,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.cancelorderCallback = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.Cancelled = function () {

            // if ($scope.currentfilter.MRDFileStatusId == 2) {
            //     utl.Alert.showErrorMsg(" Cannot change the status");
            //     return;
            // }
            if ($scope.currentfilter.OrderStatusId == 1 || $scope.currentfilter.OrderStatusId == 16 || $scope.currentfilter.OrderStatusId == 11) {
                $scope.currentfilter.OrderStatusId = 2;
            }

            var inputData = { Header: $scope.currentfilter };
            var inputArr = getDetailsForCancel(true);
            var options = {
                action: 'emr/patientdietorder/UpdatePatientDietOrder',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.cancelorderCallback
            };
            utl.Http.doAction(options);

        };

        function getDetailsForCancel() {
            var inputArr = [];
            var selectedRows = getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }
        $scope.completedorderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.completed = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'kitchenworklist.comletemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.CompletedOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.CompletedOrder = function () {

            // if ($scope.currentfilter.OrderStatusId == 16) {
            //     utl.Alert.showErrorMsg(" Cannot change the status");
            //     return;
            // }
            if ($scope.currentfilter.OrderStatusId == 16) {
                $scope.currentfilter.OrderStatusId = 11;
            }
            // if ($scope.currentfilter.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED')) {
            //     $scope.currentfilter.OrderStatusId =  utl.Lookup.getDefault($scope.lookup.OrderStatus, 'COMPLETED');
            // }
            var inputData = { Header: $scope.currentfilter };
            var inputArr = getDetailsForOrder(true);
            var options = {
                action: 'emr/patientdietorder/UpdatePatientDietOrder',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.completedorderCallback
            };
            utl.Http.doAction(options);

        };

        function getDetailsForOrder() {
            var inputArr = [];
            var selectedRows = getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }

        $scope.excuteorderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.excute = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'kitchenworklist.executemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.ExcutedOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.ExcutedOrder = function () {

            // if ($scope.currentfilter.OrderStatusId == 16) {
            //     utl.Alert.showErrorMsg(" Cannot change the status");
            //     return;
            // }
            if ($scope.currentfilter.OrderStatusId == 1) {
                $scope.currentfilter.OrderStatusId = 16;
            }
            // if ($scope.currentfilter.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED')) {
            //     $scope.currentfilter.OrderStatusId =  utl.Lookup.getDefault($scope.lookup.OrderStatus, 'COMPLETED');
            // }
            var inputData = { Header: $scope.currentfilter };
            var inputArr = getDetailsForExcute(true);
            var options = {
                action: 'emr/patientdietorder/UpdatePatientDietOrder',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.excuteorderCallback
            };
            utl.Http.doAction(options);

        };

        function getDetailsForExcute() {
            var inputArr = [];
            var selectedRows = getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }



        // $scope.handleEvents = function (actionType, row) {

        //     if (actionType == 'edit') {
        //         $state.go(formState, { id: row.entity.Id, pid: row.entity.PatientId });
        //     }
        //     else if (actionType == 'delete') {
        //         utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
        //     }
        //     else if (actionType == 'view') {
        //         $state.go(formState, { id: row.entity.Id, pid: row.entity.PatientId });
        //     } else if (actionType == 'patientinfo') {
        //         $scope.patientprofiledetails(row.entity.PatientId);
        //     }
        // }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "StoreMaster.StoreName",
                displayName: $translate.instant('inventory.stockstatus.store.lbl')
            },
            {
                field: "ItemMaster.ItemCode",
                displayName: $translate.instant('inventory.stockstatus.itemcode.lbl')
            },
            {
                field: "ItemMaster.ItemName",
                displayName: $translate.instant('inventory.stockstatus.itemname.lbl')
            },
            {
                field: "BatchId",
                displayName: $translate.instant('inventory.stockstatus.batch.lbl')
            },
            {
                field: "Quantity",
                displayName: $translate.instant('inventory.stockstatus.quantity.lbl')
            },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                //         { actiontype: 'emr', display: 'appointment.appointment-list.emraction.lbl' },

                //     ]
                // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.currentfilter.Id = row.entity.Id;
                $scope.currentfilter.StoreMasterId = row.entity.StoreMasterId;
                $scope.currentfilter.ItemMasterId = row.entity.ItemMasterId;


            });
        };

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        };
        vm.stockitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedstockitem,
            presearch: presearchstockitem,
            postsearch: postsearchstockitem
        };

        function formatselectedstockitem() {
            var selectedItem = vm.stockitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stockitemcontrolconfig.rowdata) {
                result = [vm.stockitemcontrolconfig.rowdata.ItemCode, vm.stockitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchstockitem() {
            var query = vm.stockitemcontrolconfig.query;
            var inputData = {
                Params: [{ Key: 7, Value: $scope.currentfilter.CategoryId },
                    // { Key: 13, Value: 1 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.stockitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstockitem() {
            for (var idx in vm.stockitemcontrolconfig.result) {
                var item = vm.stockitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ProductType !== null) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.GenericMaster !== null) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.VendorMaster !== null) {
                    item.ManufacturerName = item.VendorMaster.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
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
            {
                "Key": "Facility"
            },
            {
                "Key": "ItemCategory"
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

    cssdpreparationsListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();