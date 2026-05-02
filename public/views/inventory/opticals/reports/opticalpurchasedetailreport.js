(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalPurchaseReportController', OpticalPurchaseReportController);

    function OpticalPurchaseReportController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = {};
        $scope.item = {};
        $scope.currentcontext = {};
        // $scope.currentcontext.CanAmend = utl.Privilege.hasAccess('CanAmend');

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
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

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
                    PageSize: 25,
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

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "GRN No", "Invoice", "Invoice Date", "Supplier Name", "Invoice Amt", "Discount", "Tax or GST", "Net Amount"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var grn = '';
                var invoice = '';
                var invoiceDate = '';
                var supplier = '';
                var invoiceAmt = '';
                var discount = '';
                var tax = '';
                var netAmt = '';
                
        
             
                if (rowArray.OpticalGrnDate) {
                    date = rowArray.OpticalGrnDate;
                }
                if (rowArray.OpticalGrnNumber) {
                    grn = rowArray.OpticalGrnNumber;
                }
                if (rowArray.InvoiceNumber) {
                    invoice = rowArray.InvoiceNumber;
                }
                if (rowArray.InvoiceDate) {
                    invoiceDate = rowArray.InvoiceDate;
                }
                if (rowArray.VendorMaster.VendorName) {
                    supplier = rowArray.VendorMaster.VendorName;
                }
                if (rowArray.TotalGrossAmount) {
                    invoiceAmt = rowArray.TotalGrossAmount;
                }
                if (rowArray.TotalDiscountAmount) {
                    discount = rowArray.TotalDiscountAmount;
                }
                if (rowArray.TotalGstAmount) {
                    tax = rowArray.TotalGstAmount;
                }
                if (rowArray.TotalNetAmount) {
                    netAmt = rowArray.TotalNetAmount;
                }
                csvContent += date + ',' + grn + ',' + invoice + ',' + invoiceDate + ',' + supplier + ',' + invoiceAmt + ',' + discount + ',' + tax + ',' + netAmt + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'opticalpurchasedetailreport.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
           var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 1,
                    //     Value: $scope.currentfilter.GrnNumber
                    // },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.VendorMasterId
                    // },
                    // {
                    //     Key: 6,
                    //     Value: $scope.currentfilter.GrnStatusId
                    // },
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                ],
        
            };
            var options = {
                action: "pharmacy/opticalgrn/GetOpticalGrns",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
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
        $scope.backtoReport = function() {
            $state.go('app.opticalreports')
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 1,
                    //     Value: $scope.currentfilter.GrnNumber
                    // },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.VendorMasterId
                    // },
                    // {
                    //     Key: 6,
                    //     Value: $scope.currentfilter.GrnStatusId
                    // },
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action:  'pharmacy/opticalgrn/GetOpticalGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {

                field: "OpticalGrnDate",
                displayName: $translate.instant('inventory.grns.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OpticalGrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.OpticalGrnDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "OpticalGrnNumber",
                displayName: $translate.instant('GRN No')
            },
            {
                field: "InvoiceNumber",
                displayName: $translate.instant('Invoice#')
            },
            {

                field: "InvoiceDate",
                displayName: $translate.instant('Invoice Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.InvoiceDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.InvoiceDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            // { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.grns.grnstore.lbl') },
            // { field: "GrnType.Description", displayName: $translate.instant('inventory.grns.type.lbl') },
            {
                field: "VendorMaster.VendorName",
                displayName: $translate.instant('inventory.grns.vendorname.lbl')
            },
            
            {
                field: "TotalGrossAmount",
                displayName: $translate.instant('Invoice Amt'),
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
                // {
                //     field: "GrnStatus.Description",
                //     displayName: $translate.instant('inventory.grns.status.lbl')
                // },
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //                                         <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.GrnStatusId==2||entity.GrnStatusId==3||entity.GrnStatusId==4||entity.GrnStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                //                                          <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.GrnStatusId==1"><i class="fas fa-calendar-plus"></i></span>\
                //                                         <span class="grid-action" uib-tooltip="Amend" tooltip-placement="bottom" ng-click="handleEvents(\'amend\',entity)" ng-show="entity.GrnStatusId==2"><span class=\"amend"\>Amend</span></span>\
                //                                         <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.GrnStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                //                                     </div>',
                //     handleEvent: $scope.handleEvents,
                //     actions: []
                // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
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
            // setDefaults();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "VendorMaster",
                    Request: {
                        Params: [{
                            Key: 13,
                            Value: utl.Session.getCurrentFacilityId()
                        }],

                    }
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

    OpticalPurchaseReportController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();