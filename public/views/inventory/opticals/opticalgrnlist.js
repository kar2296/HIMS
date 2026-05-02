(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalGRNListController', OpticalGRNListController);

    function OpticalGRNListController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = {};
        $scope.item = {};

        $scope.item = {
            TotalQuantity: 0
        };

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            OpticalGrnTypeId: 1,
            StoreMasterId: 0,
            VendorFacilityMapId: -1,
            VendorMasterId: -1,
            OpticalGrnNumber: '',
            OpticalPoNumber: '',
            InvoiceNumber: '',
            ActiveStatusId: 2,
            OpticalGrnStatusId: 2,
            OpticalGrnDate: utl.Formatter.getCurrentDate(),
            CreatedBy: utl.Session.getCurrentUserId()
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
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
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

        $scope.advancedfilter = {
            From: '',
            To: '',
            ApprovedUserId: utl.Session.getCurrentUserId(),
            CreatedUserId: -1
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.currentcontext.opticalgrnid = parseInt(utl.Session.getEMRPatientId());
        // $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew');

        function initDynamicForm() {
            $scope.advancedfilterDefault = {};
            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.grn.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.grn.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'inventory.grn.gpno.lbl', model: 'GpNumber', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'inventory.grns.invoice_filter.lbl', model: 'InvoiceNumber', position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.grn.createdby.lbl', model: 'CreatedBy', options: $scope.lookup.CreatedUser, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'inventory.grn.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 2, c: 1 } }
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
            var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.OpticalGrnDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OpticalGrnDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.OpticalGrnNumber },
                    { Key: 2, Value: $scope.currentfilter.OpticalGrnTypeId },
                    { Key: 3, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 4, Value: $scope.currentfilter.VendorMasterId },
                    { Key: 5, Value: $scope.advancedfilter.InvoiceNumber },
                    { Key: 6, Value: $scope.currentfilter.OpticalGrnStatusId },
                    { Key: 8, Value: From },
                    { Key: 9, Value: To },
                    { Key: 8, Value: FromReq },
                    { Key: 9, Value: ToReq },
                    { Key: 10, Value: $scope.currentfilter.OpticalPoNumber },
                    { Key: 11, Value: $scope.advancedfilter.OpticalGpNumber },
                    { Key: 12, Value: $scope.advancedfilter.CreatedBy },
                    { Key: 13, Value: $scope.advancedfilter.ApprovedBy },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 15, Value: $scope.currentfilter.VendorFacilityMapId },
                    { Key: 16, Value: $scope.currentfilter.OpticalItemMasterId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/opticalgrn/GetOpticalGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.opticalgrn', { id: 0, grnid: $scope.currentcontext.grnid });
        };

        $scope.findGrn = function () {
            $state.go('app.opticalgrn.find', { findid: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/opticalgrn/DeleteOpticalGrn',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.opticalgrn',
                    {
                        id: entity.Id,
                        filter_facilityid: $scope.currentfilter.FacilityId,
                        filter_opticalgrntypeid: $scope.currentfilter.OpticalGrnTypeId,
                        filter_storemasterid: $scope.currentfilter.StoreMasterId,
                        filter_vendormasterid: $scope.currentfilter.VendorMasterId,
                        filter_opticalgrnnumber: $scope.currentfilter.OpticalGrnNumber,
                        filter_opticalponumber: $scope.currentfilter.OpticalPoNumber,
                        filter_invoicenumber: $scope.currentfilter.InvoiceNumber,
                        filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                        filter_opticalgrnstatusid: $scope.currentfilter.OpticalGrnStatusId,
                        filter_opticalgrndate: $scope.currentfilter.OpticalGrnDate,
                        filter_from: $scope.advancedfilter.From,
                        filter_to: $scope.advancedfilter.To
                    });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.OpticalGrnNumber);
            } else if (actionType == 'view') {
                $state.go('app.opticalgrn',
                    {
                        id: entity.Id,
                        filter_facilityid: $scope.currentfilter.FacilityId,
                        filter_opticalgrntypeid: $scope.currentfilter.OpticalGrnTypeId,
                        filter_storemasterid: $scope.currentfilter.StoreMasterId,
                        filter_vendormasterid: $scope.currentfilter.VendorMasterId,
                        filter_opticalgrnnumber: $scope.currentfilter.OpticalGrnNumber,
                        filter_opticalponumber: $scope.currentfilter.OpticalPoNumber,
                        filter_invoicenumber: $scope.currentfilter.InvoiceNumber,
                        filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                        filter_opticalgrnstatusid: $scope.currentfilter.OpticalGrnStatusId,
                        filter_opticalgrndate: $scope.currentfilter.OpticalGrnDate,
                        filter_from: $scope.advancedfilter.From,
                        filter_to: $scope.advancedfilter.To
                    });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{

                field: "OpticalGrnDate",
                displayName: $translate.instant('inventory.grns.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OpticalGrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.OpticalGrnDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "OpticalGrnNumber", displayName: $translate.instant('inventory.grns.grnno.lbl') },
            { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.grns.grnstore.lbl') },
            { field: "OpticalGrnType.Description", displayName: $translate.instant('inventory.grns.type.lbl') },
            { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.grns.vendorname.lbl') },
            { field: "InvoiceNumber", displayName: $translate.instant('inventory.grns.po/invoiceno.lbl') },
            {
                field: "TotalGrossAmount",
                displayName: $translate.instant('inventory.grns.amount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGrossAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalDiscountAmount",
                displayName: $translate.instant('inventory.grns.discount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalDiscountAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalDiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalGstAmount",
                displayName: $translate.instant('inventory.grns.tax.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGstAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('inventory.grns.netamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            { field: "OpticalGrnStatus.Description", displayName: $translate.instant('inventory.grns.status.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.OpticalGrnStatusId==2||entity.OpticalGrnStatusId==3||entity.OpticalGrnStatusId==4||entity.OpticalGrnStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.OpticalGrnStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.OpticalGrnStatusId==1"><i class=" fa fa-times icon" aria-hidden="true"> </i></span>\
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

            $scope.getList();

            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [
                    // { Key: 3, Value: 1 },
                    // { Key: 4, Value: 2 },
                    // { Key: 12, Value: $scope.currentfilter.FacilityId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
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
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.GrnStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.GrnStatus, 'Authorized');
            //var CompletedId = utl.Lookup.getDefault($scope.lookup.GrnStatus, 'Completed');
            $scope.currentfilter.OpticalGrnStatusId = ApprovedId + "," + 0/* + AuthorizedId + "," + CompletedId*/;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
                if (key == 'ApprovedUser' && $scope.advancedfilter.ApprovedBy === 0) {
                    $scope.advancedfilter.ApprovedBy = value[0].Id;
                }
                if (key == 'CreatedUser' && $scope.advancedfilter.CreatedBy === 0) {
                    $scope.advancedfilter.CreatedBy = value[0].Id;
                }
            });
            setDefaults();
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.FacilityId = $stateParams.filter_facilityid;
                $scope.currentfilter.OpticalGrnTypeId = $stateParams.filter_opticalgrntypeid;
                $scope.currentfilter.StoreMasterId = $stateParams.filter_storemasterid;
                $scope.currentfilter.VendorMasterId = $stateParams.filter_vendormasterid;
                $scope.currentfilter.OpticalGrnNumber = $stateParams.filter_opticalgrnnumber;
                $scope.currentfilter.OpticalPoNumber = $stateParams.filter_opticalponumber;
                $scope.currentfilter.InvoiceNumber = $stateParams.filter_invoicenumber;
                $scope.currentfilter.ActiveStatusId = $stateParams.filter_activestatusid;
                $scope.currentfilter.OpticalGrnStatusId = $stateParams.filter_opticalgrnstatusid;
                $scope.currentfilter.OpticalGrnDate = $stateParams.filter_opticalgrndate;
                $scope.advancedfilter.From = $stateParams.filter_from;
                $scope.advancedfilter.To = $stateParams.filter_to;

                $scope.getList();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Organization" },
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
                            { Key: 8, Value: 1 }
                        ]
                    }
                }, {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 8, Value: 1 }
                        ]
                    }
                },
                { "Key": "OpticalGrnType" },
                { "Key": "GrnStatus", Default: false },
                { "Key": "ActiveStatus" },
                // {
                //     "Key": "UserStores",
                //     Request: {
                //         Params: [
                //             { Key: 1, Value: utl.Session.getCurrentUserId() },
                //             { Key: 2, Value: $scope.currentfilter.FacilityId },
                //             { Key: 8, Value: 1 }
                //         ]
                //     },
                //     Default: false
                // },
                {
                    "Key": "CreatedUser",
                    Request: {
                        Params: [{ Key: 0, Value: utl.Session.getCurrentUserId() }]
                    },
                    Default: false
                },
                {
                    "Key": "ApprovedUser",
                    Request: {
                        Params: [{ Key: 0, Value: utl.Session.getCurrentUserId() }]
                    },
                    Default: false
                }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.initLookup();
    }

    OpticalGRNListController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();