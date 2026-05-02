(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ConsignmentPOController', ConsignmentPOController);

    function ConsignmentPOController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            VendorMasterId: -1,
            VendorFacilityMapId: -1,
            PoTypeId: 1,
            PONumber: '',
            StoreMasterId: 0,
            PoStatusId: 1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            // PoDate: null,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.CanPurchaseOrder_Amend = utl.Privilege.hasAccess('CanPurchaseOrder_Amend')
        $scope.item = {
            TotalQuantity: 0
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.backtoList = function () {
            $state.go('app.storedashboard');
        }
        $scope.advancedfilter = {
            From: '',
            To: '',
            FromFacilityId: 1,
            ApprovedBy: -1,
            StoreId: 0,
            ToStoreId: -1,
            AuthorizedBy: -1,
            ToFacilityId: -1
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1,
            poid: -1
        };

        function initDynamicForm() {
            $scope.advancedfilterDefault = {
                FromFacility: utl.Session.getCurrentUserId(),
                ApprovedBy: utl.Session.getCurrentUserId()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.purchaserequest.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.purchaserequest.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.purchaserequest.fromstore.lbl', model: 'StoreId', options: $scope.lookup.UserStores, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.purchaserequest.tostore.lbl', model: 'ToStoreId', options: $scope.lookup.ToStore, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'inventory.purchaserequest.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'inventory.purchaserequest.authorizedby.lbl', model: 'AuthorizedBy', options: $scope.lookup.AuthorizedUser, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'inventory.purchaseorder.fromfacility.lbl', model: 'FromFacilityId', options: $scope.lookup.FromFacility, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'inventory.purchaseorder.tofacility.lbl', model: 'ToFacilityId', options: $scope.lookup.ToFacility, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'inventory.purchaseorders.type.lbl', model: 'PoTypeId', options: $scope.lookup.PoType, position: { r: 4, c: 0 } },
                    { position: { r: 4, c: 1 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-success' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        vm.purchaseorderitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },

            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedstockitem,
            presearch: presearchstockitem,
            postsearch: postsearchstockitem
        };

        function formatselectedstockitem() {
            var selectedItem = vm.purchaseorderitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.purchaseorderitemcontrolconfig.rowdata) {
                result = [vm.purchaseorderitemcontrolconfig.rowdata.ItemCode, vm.purchaseorderitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchstockitem() {
            var query = vm.purchaseorderitemcontrolconfig.query;
            var inputData = {
                Params: [{ Key: 7, Value: $scope.currentfilter.CategoryId }, { Key: 3, Value: 2 }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.purchaseorderitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.purchaseorderitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstockitem() {
            for (var idx in vm.purchaseorderitemcontrolconfig.result) {
                var item = vm.purchaseorderitemcontrolconfig.result[idx];
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

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var totalnetamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);
                item.TotalGrossAmount = isNaN(parseFloat(item.TotalGrossAmount)) ? (0) : parseFloat(item.TotalGrossAmount);
                item.TotalDiscountAmount = isNaN(parseFloat(item.TotalDiscountAmount)) ? (0) : parseFloat(item.TotalDiscountAmount);
                item.TotalGstAmount = isNaN(parseFloat(item.TotalGstAmount)) ? (0) : parseFloat(item.TotalGstAmount);

                totalnetamount = totalnetamount + (item.TotalNetAmount)

                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetamount = totalnetamount;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.PoNumber },
                    // { Key: 2, Value: $scope.advancedfilter.PoTypeId },
                    // { Key: 3, Value: $scope.currentfilter.VendorMasterId },
                    { Key: 4, Value: $scope.currentfilter.PoStatusId },
                    { Key: 24, Value: $scope.currentfilter.DcNumber },

                    { Key: 8, Value: From },
                    { Key: 9, Value: To },
                    // { Key: 8, Value: FromReq },
                    // { Key: 9, Value: ToReq },
                    // { Key: 6, Value: $scope.advancedfilter.ToStoreId },
                    // { Key: 11, Value: $scope.advancedfilter.FromFacility },
                    // { Key: 12, Value: $scope.advancedfilter.ToFacility },
                    // { Key: 13, Value: $scope.advancedfilter.ApprovedBy },
                    // { Key: 14, Value: $scope.advancedfilter.AuthorizedBy },
                    { Key: 16, Value: $scope.currentfilter.FacilityId },
                    // { Key: 17, Value: $scope.currentfilter.VendorFacilityMapId },
                    // { Key: 18, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 21, Value: true }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.VendorMasterId > 0) {
                inputData.Params.push({ Key: 3, Value: $scope.currentfilter.VendorMasterId });
            }
            if ($scope.currentfilter.StoreMasterId > 0) {
                inputData.Params.push({ Key: 5, Value: $scope.currentfilter.StoreMasterId });
            }
            var options = {
                action: 'pharmacy/purchaseorder/GetPurchaseOrderList',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.consignmentpoform', { id: 0, poid: $scope.currentcontext.poid });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/purchaseorder/DeletePurchaseOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            console.log(entity);
            if (actionType == 'edit') {
                $state.go('app.consignmentpoform',
                    {
                        id: entity.Id,
                        filter_potype: $scope.currentfilter.PoTypeId,
                        filter_postatus: $scope.currentfilter.PoStatusId,
                        filter_fromstore: $scope.currentfilter.StoreMasterId,
                        filter_vendor: $scope.currentfilter.VendorMasterId,
                        filter_from: $scope.currentfilter.From,
                        filter_to: $scope.currentfilter.To
                    });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.PoNumber);
            } else if (actionType == 'view') {
                $state.go('app.consignmentpoform',
                    {
                        id: entity.Id,
                        poid: 0
                        // filter_potype: $scope.currentfilter.PoTypeId,
                        // filter_postatus: $scope.currentfilter.PoStatusId,
                        // filter_fromstore: $scope.currentfilter.StoreMasterId,
                        // filter_vendor: $scope.currentfilter.VendorMasterId,
                        // filter_from: $scope.currentfilter.From,
                        // filter_to: $scope.currentfilter.To
                    });
            } else if (actionType == 'amend') {
                $state.go('app.consignmentpurchaseorder-amendment', { id: entity.Id, poid: entity.Id });
            }
        };

        var rowtpl = '<div ng-class="{\'status\':entity.PoStatusId==4 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                { field: "PoNumber", displayName: $translate.instant('inventory.purchaseorders.po#.lbl') },

                {
                    field: "PoDate",
                    displayName: $translate.instant('inventory.purchaseorder.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PoDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PoDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                // { field: "FromStore.StoreName", displayName: $translate.instant('inventory.purchaseorders.fromstore.lbl') },
                // { field: "ToStore.StoreName", displayName: $translate.instant('inventory.purchaseorders.tostore.lbl') },
                // { field: "PoType.Description", displayName: $translate.instant('inventory.purchaseorders.type.lbl') },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.purchaseorders.vendorname.lbl') },
                {
                    field: "DcNumber",
                    displayName: $translate.instant('DC#')
                },
                {
                    field: "TotalGrossAmount",
                    displayName: $translate.instant('inventory.purchaseorders.amount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGrossAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalDiscountAmount",
                    displayName: $translate.instant('inventory.purchaseorders.discount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalDiscountAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalDiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalGstAmount",
                    displayName: $translate.instant('inventory.purchaseorders.taxorgst.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGstAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalNetAmount",
                    displayName: $translate.instant('inventory.purchaseorders.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Created By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a uib-tooltip="{{entity.CreatedUser.FirstName}}" tooltip-placement="left" >' +
                        "<span ><b>{{entity.CreatedUser.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.CreatedUser.FirstName}}</b>&nbsp;</span>" +
                        "<span >{{entity.CreatedUser.LastName}}&nbsp;</span>" +
                        "</a></div>"
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Approved By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a uib-tooltip="{{entity.AuthorizedUser.FirstName}}" tooltip-placement="left" >' +
                        "<span ><b>{{entity.AuthorizedUser.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.AuthorizedUser.FirstName}}</b>&nbsp;</span>" +
                        "<span >{{entity.AuthorizedUser.LastName}}&nbsp;</span>" +
                        "</a></div>"
                },
                // {
                //     field: "TotalSaleAmount",
                //     displayName: $translate.instant('inventory.purchaseorders.mrp.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalSaleAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                // },
                // {
                //     field: "TotalProfitAmount",
                //     displayName: $translate.instant('inventory.purchaseorders.profit.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalProfitAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                // },
                {
                    field: "PoStatus.Description",
                    cellTemplate: '<span style="color:{{entity.PoStatus.ColorCode}}"><b>{{entity.PoStatus.Description}}</b></span>',
                    displayName: $translate.instant('inventory.purchaseorders.status.lbl')
                },
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //                                     <span class="grid-action" uib-tooltip="View" tooltip-placement="bottom" ng-click="handleEvents(\'view\',entity)"  ng-show="entity.PoStatusId==2||entity.PoStatusId==3||entity.PoStatusId==4||entity.PoStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                //                                     <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)" ng-if="HasPrivilege(\'PurchaseOrder\', \'Edit\')"   ng-show="entity.PoStatusId==1"><i class="fas fa-calendar-plus"></i></span>\
                //                                     <span class="grid-action" uib-tooltip="Amend" tooltip-placement="bottom" ng-click="handleEvents(\'amend\',entity)" ng-show="entity.PoStatusId==2||entity.PoStatusId==3"><i class="fas fa-calendar-plus"></i></button></span>\
                //                                     <span class="grid-action" uib-tooltip="Delete" tooltip-placement="bottom" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.PoStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                //                                 </div>',
                //     handleEvent: $scope.handleEvents,
                //     actions: []
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" uib-tooltip="View" tooltip-placement="bottom" ng-click="handleEvents(\'view\',entity)"  ng-show="entity.PoStatusId==2||entity.PoStatusId==3||entity.PoStatusId==4||entity.PoStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)"  ng-show="entity.PoStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" uib-tooltip="Amend" tooltip-placement="bottom" ng-click="handleEvents(\'amend\',entity)" ng-show="entity.PoStatusId==2||entity.PoStatusId==3"><i class="fas fa-calendar-plus"></i></button></span>\
                                                    <span class="grid-action" uib-tooltip="Delete" tooltip-placement="bottom" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.PoStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Supplier Code', field: 'VendorCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Supplier Name', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Supplier Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }

            return result;

            if ($scope.currentfilter.VendorMasterId > 0) {
                $scope.getList();
            }
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {
                var item = vm.vendorcontrolconfig.result[idx];
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        function setDefaults() {
            var DraftId = utl.Lookup.getDefault($scope.lookup.PoStatus, 'Draft');
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.PoStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PoStatus, 'Authorized');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.PoStatus, 'Completed');
            //$scope.currentfilter.PoStatusId = ApprovedId + "," + AuthorizedId + "," + CompletedId;
            // $scope.currentfilter.PoStatusId = ApprovedId + "," + AuthorizedId;
            $scope.currentfilter.PoStatusId = DraftId + "," + ApprovedId + "," + AuthorizedId;
        }

        $scope.print = function () {
            var inputData = {
                Data: {
                    PoNumber: $scope.currentfilter.PoNumber
                },
                Params: [
                    //  { Key: 2, Value: $scope.currentfilter.PoNumber },
                ],
            };
            var options = {
                action: 'pharmacy/purchaseorder/PrintPurchaseOrderList',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    if (key == 'UserStores' && $scope.advancedfilter.StoreId === 0) {
                        $scope.advancedfilter.StoreId = value[0].Id;
                        if (key == 'ApprovedUser' && $scope.advancedfilter.ApprovedBy === 0) {
                            $scope.advancedfilter.ApprovedBy = value[0].Id;
                        }
                    }
                }
            });
            setDefaults();
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.VendorMasterId = $stateParams.filter_vendor;
                $scope.currentfilter.PoTypeId = $stateParams.filter_potype;
                $scope.currentfilter.PoStatusId = $stateParams.filter_postatus;
                $scope.currentfilter.StoreMasterId = $stateParams.filter_fromstore;
                $scope.advancedfilter.From = $stateParams.filter_from;
                $scope.advancedfilter.To = $stateParams.filter_to;

                $scope.getList();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "FromStore",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentfilter.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentfilter.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentfilter.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                { "Key": "ActiveStatus" },
                { "Key": "PoType" },
                { "Key": "PoStatus", Default: false },
                // { "Key": "AuthorizedUser" },
                { "Key": "ToFacility" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [
                            { Key: 1, Value: utl.Session.getCurrentUserId() },
                            { Key: 2, Value: $scope.currentfilter.FacilityId },
                            { Key: 5, Value: 2 }
                        ]
                    },
                    Default: false
                },
                // {
                //     "Key": "ApprovedUser",
                //     Request: {
                //         Params: [{
                //             Key: 0,
                //             Value: utl.Session.getCurrentUserId()
                //         }]
                //     },
                //     Default: false
                // },
                {
                    "Key": "FromFacility",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    },
                    Default: false
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

    ConsignmentPOController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();