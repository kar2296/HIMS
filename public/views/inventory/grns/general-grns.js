(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GeneralGRNsListController', GeneralGRNsListController);

    function GeneralGRNsListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = {};
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.item = {
            TotalQuantity: 0
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.backtoList = function () {
            $state.go('app.storedashboard');
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            GrnTypeId: 1,
            StoreMasterId: 0,
            VendorFacilityMapId: -1,
            VendorMasterId: -1,
            GrnNumber: '',
            PoNumber: '',
            InvoiceNumber: '',
            ActiveStatusId: 2,
            GrnStatusId: 2,
            FromDate: new Date(),
            ToDate: utl.Formatter.getCurrentDate(),
            CreatedBy: utl.Session.getCurrentUserId()
        };
        $scope.currentfilter.FromDate.setDate($scope.currentfilter.FromDate.getDate() - 7);
        vm.purchaseorderitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Product Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                {
                    header: 'Generic',
                    field: 'GenericName',
                    datatype: 'string',
                    headercls: 'td-genericname',
                    fieldcls: 'td-genericname'
                },
                {
                    header: 'Manufacturer',
                    field: 'ManufacturerName',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                },

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
                Params: [{
                    Key: 7,
                    Value: $scope.currentfilter.CategoryId
                }, {
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.purchaseorderitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
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

        $scope.currentcontext.grnid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.CanAmend = $scope.HasAccess('GRN_Buttons', 'Amend');

        function initDynamicForm() {
            $scope.advancedfilterDefault = {};
            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'inventory.grn.fromdate.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'inventory.grn.todate.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'inventory.grn.gpno.lbl',
                        model: 'GpNumber',
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'inventory.grns.invoice_filter.lbl',
                        model: 'InvoiceNumber',
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.grn.createdby.lbl',
                        model: 'CreatedBy',
                        options: $scope.lookup.CreatedUser,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.grn.approvedby.lbl',
                        model: 'ApprovedBy',
                        options: $scope.lookup.ApprovedUser,
                        position: {
                            r: 2,
                            c: 1
                        }
                    }
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-success'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
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
                item.showAmend = $scope.currentcontext.CanAmend ? 1 : 0;

                totalnetamount = totalnetamount + (item.TotalNetAmount)

                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetamount = totalnetamount;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.defaultgetList = function () {
            $scope.currentfilter.GrnNumber = '';
            $scope.currentfilter.FromDate = '';
            $scope.currentfilter.ToDate = '';
            $scope.currentfilter.VendorMasterId = -1;
            $scope.currentfilter.GrnStatusId = -1;

            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.GrnNumber
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.GrnStatusId
                    },
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 24,
                        Value: false
                    },
                    {
                        Key: 25,
                        Value: false
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/grn/GetGrnList',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.VendorMasterId = -1;
                $scope.getList();
            }
        };
        $scope.getList = function () {
            if ($scope.currentfilter.GrnNumber) {
                $scope.currentfilter.FromDate = '';
                $scope.currentfilter.ToDate = '';
                $scope.currentfilter.VendorMasterId = -1;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.GrnNumber
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.GrnStatusId
                    },
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 24,
                        Value: false
                    },
                    {
                        Key: 25,
                        Value: false
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/grn/GetGrnList',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.generalgrn', {
                id: 0,
                grnid: $scope.currentcontext.grnid
            });
        };
        $scope.addamend = function () {
            $state.go('app.grnamendment', {
                id: 0,
                // grnid: $scope.currentcontext.grnid
            });
        };


        $scope.findGrn = function () {
            $state.go('app.grn.find', {
                findid: 0
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/grn/DeleteGrn',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.generalgrn', {
                    id: entity.Id,
                    filter_facilityid: $scope.currentfilter.FacilityId,
                    filter_grntypeid: $scope.currentfilter.GrnTypeId,
                    filter_storemasterid: $scope.currentfilter.StoreMasterId,
                    filter_vendormasterid: $scope.currentfilter.VendorMasterId,
                    filter_grnnumber: $scope.currentfilter.GrnNumber,
                    filter_ponumber: $scope.currentfilter.PoNumber,
                    filter_invoicenumber: $scope.currentfilter.InvoiceNumber,
                    filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                    filter_grnstatusid: $scope.currentfilter.GrnStatusId,
                    filter_grndate: $scope.currentfilter.GrnDate,
                    filter_from: $scope.currentfilter.From,
                    filter_to: $scope.currentfilter.To
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GrnNumber);
            } else if (actionType == 'view') {
                $state.go('app.generalgrn', {
                    id: entity.Id,
                    filter_facilityid: $scope.currentfilter.FacilityId,
                    filter_grntypeid: $scope.currentfilter.GrnTypeId,
                    filter_storemasterid: $scope.currentfilter.StoreMasterId,
                    filter_vendormasterid: $scope.currentfilter.VendorMasterId,
                    filter_grnnumber: $scope.currentfilter.GrnNumber,
                    filter_ponumber: $scope.currentfilter.PoNumber,
                    filter_invoicenumber: $scope.currentfilter.InvoiceNumber,
                    filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                    filter_grnstatusid: $scope.currentfilter.GrnStatusId,
                    filter_grndate: $scope.currentfilter.GrnDate,
                    filter_from: $scope.currentfilter.From,
                    filter_to: $scope.currentfilter.To
                });
            } else if (actionType == 'amend') {
                $state.go('app.grnamendment', {
                    id: entity.Id,
                    filter_facilityid: $scope.currentfilter.FacilityId,
                    filter_grntypeid: $scope.currentfilter.GrnTypeId,
                    filter_storemasterid: $scope.currentfilter.StoreMasterId,
                    filter_vendormasterid: $scope.currentfilter.VendorMasterId,
                    filter_grnnumber: $scope.currentfilter.GrnNumber,
                    filter_ponumber: $scope.currentfilter.PoNumber,
                    filter_invoicenumber: $scope.currentfilter.InvoiceNumber,
                    filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                    filter_grnstatusid: $scope.currentfilter.GrnStatusId,
                    filter_grndate: $scope.currentfilter.GrnDate,
                    filter_from: $scope.advancedfilter.From,
                    filter_to: $scope.advancedfilter.To
                });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "GrnNumber",
                    displayName: $translate.instant('GRN No')
                },
                {

                    field: "GrnDate",
                    displayName: $translate.instant('inventory.grns.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.GrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.GrnDate| date: 'HH:mm'}}</span>" + "</div>"
                },

                // { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.grns.grnstore.lbl') },
                // { field: "GrnType.Description", displayName: $translate.instant('inventory.grns.type.lbl') },
                {
                    field: "VendorMaster.VendorName",
                    displayName: $translate.instant('inventory.grns.vendorname.lbl')
                },
                {
                    field: "InvoiceNumber",
                    displayName: $translate.instant('Invoice#')
                },
                {
                    field: "TotalGrossAmount",
                    displayName: $translate.instant('Gross'),
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
                    displayName: $translate.instant('Tax or GST'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGstAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalNetAmount",
                    displayName: $translate.instant('inventory.grns.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "GrnStatus.Description",
                    displayName: $translate.instant('inventory.grns.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.GrnStatusId==2||entity.GrnStatusId==3||entity.GrnStatusId==4||entity.GrnStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                     <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.GrnStatusId==1"><i class="fas fa-calendar-plus"></i></span>\
                                                    <span class="grid-action" uib-tooltip="Amend" tooltip-placement="bottom" ng-click="handleEvents(\'amend\',entity)" ng-show="entity.showAmend==1&&entity.GrnStatusId==2"><span class=\"amend"\><i class="fas fa-user-edit"></i></span></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.GrnStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 50
            }
        };
        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [{
                    header: 'Supplier Code',
                    field: 'VendorCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Supplier Name',
                    field: 'VendorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Supplier Contact',
                    field: 'MobileNumber',
                    datatype: 'string',
                    headercls: 'td-phoneno',
                    fieldcls: 'td-phoneno'
                }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendorfacilitymap/GetVendorFacilityMaps',
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
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 1
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                    // {
                    //     Key: 13,
                    //     Value: $scope.item.StoreTypeId
                    // },
                    {
                        Key: 12,
                        Value: [-1, $scope.currentfilter.FacilityId]
                    }
                ],
                PageContext: {
                    PageSize: -1,
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
                // item.VendorMasterId = item.Id;
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }
        // vm.vendorcontrolconfig = {
        //     query: '',
        //     searchbyid: false,
        //     options: [{
        //         header: 'Supplier Code',
        //         field: 'VendorCode',
        //         datatype: 'string',
        //         headercls: 'td-code',
        //         fieldcls: 'td-code'
        //     },
        //     {
        //         header: 'Supplier Name',
        //         field: 'VendorName',
        //         datatype: 'string',
        //         headercls: 'td-name',
        //         fieldcls: 'td-name'
        //     },
        //     {
        //         header: 'Supplier Contact',
        //         field: 'MobileNumber',
        //         datatype: 'string',
        //         headercls: 'td-phoneno',
        //         fieldcls: 'td-phoneno'
        //     }
        //     ],
        //     searchparams: {},
        //     result: {},
        //     api: 'pharmacy/vendormaster/GetVendorMasters',
        //     formatdisplay: formatselectedvendor,
        //     presearch: presearchvendor,
        //     postsearch: postsearchvendor
        // };

        // function formatselectedvendor() {
        //     var selectedItem = vm.vendorcontrolconfig.selected;
        //     var result = '';
        //     if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //         $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
        //         result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
        //     } else if (vm.vendorcontrolconfig.rowdata) {
        //         result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
        //     }

        //     $scope.getList();

        //     return result;
        // }

        // function presearchvendor() {
        //     var query = vm.vendorcontrolconfig.query;

        //     var inputData = {
        //         Params: [
        //             { Key: 3, Value: 1 },
        //             { Key: 4, Value: 2 },
        //             { Key: 13, Value: [-1,$scope.currentfilter.FacilityId] }
        //         ],
        //         PageContext: {
        //             PageSize: -1,
        //             PageNumber: 1
        //         }
        //     };

        //     if (vm.vendorcontrolconfig.searchbyid === true) {
        //         inputData.Params.push({
        //             Key: 0,
        //             Value: query
        //         });
        //     } else if (query && query.length > 2) {
        //         inputData.Params.push({
        //             Key: 2,
        //             Value: query
        //         });
        //     }

        //     vm.vendorcontrolconfig.searchparams = inputData;
        // }

        // function postsearchvendor() {
        //     for (var idx in vm.vendorcontrolconfig.result) {
        //         var item = vm.vendorcontrolconfig.result[idx];

        //         item.VendorCode = item.VendorCode;
        //         item.VendorName = item.VendorName;
        //         item.PhoneNumber = item.PhoneNumber;
        //     }
        // }

        function setDefaults() {
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.GrnStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.GrnStatus, 'Authorized');
            //var CompletedId = utl.Lookup.getDefault($scope.lookup.GrnStatus, 'Completed');
            $scope.currentfilter.GrnStatusId = ApprovedId + "," + AuthorizedId + ",";
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
            $scope.getList();
            // initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.FacilityId = $stateParams.filter_facilityid;
                $scope.currentfilter.GrnTypeId = $stateParams.filter_grntypeid;
                $scope.currentfilter.StoreMasterId = $stateParams.filter_storemasterid;
                $scope.currentfilter.VendorMasterId = $stateParams.filter_vendormasterid;
                $scope.currentfilter.GrnNumber = $stateParams.filter_grnnumber;
                $scope.currentfilter.PoNumber = $stateParams.filter_ponumber;
                $scope.currentfilter.InvoiceNumber = $stateParams.filter_invoicenumber;
                $scope.currentfilter.ActiveStatusId = $stateParams.filter_activestatusid;
                $scope.currentfilter.GrnStatusId = $stateParams.filter_grnstatusid;
                // $scope.currentfilter.GrnDate = $stateParams.filter_grndate;
                $scope.currentfilter.FromDate = $stateParams.filter_from;
                $scope.currentfilter.ToDate = $stateParams.filter_to;
                $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();

                $scope.getList();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ToStore",
                    Request: {
                        Params: [{
                                Key: 6,
                                Value: $scope.currentfilter.FacilityId
                            },
                            {
                                Key: 7,
                                Value: 2
                            }
                        ]
                    }
                },
                {
                    "Key": "GrnType"
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "GrnStatus",
                    Default: false
                },
                {
                    "Key": "ActiveStatus"
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
                                Value: $scope.currentfilter.FacilityId
                            },
                            {
                                Key: 5,
                                Value: 2
                            }
                        ]
                    },
                    Default: false
                },
            ]
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

    GeneralGRNsListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();