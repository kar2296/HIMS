(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockMovementController', stockMovementController);

    function stockMovementController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.Items = {};
        $scope.item = {};
        $scope.lookup = {};

        $scope.currentcontext = {
            id: -1
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.currentfilter = {
            ItemMasterId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;

        $scope.backtoList = function () {
            if ($scope.Context == 'pharmacy') {
                $state.go('app.pharmacydashboard');
            } else if ($scope.Context == 'store') {
                $state.go('app.storedashboard');
            }
        }
        $scope.actionSearch = function (selecteditem) {
            // if ($scope.currentfilter.ItemMasterId > 0) {
            if (selecteditem.ItemMasterId && selecteditem.ItemMasterId > 0) {
                $scope.item.ItemMasterId = selecteditem.ItemMasterId;
                $scope.getList();
            } else {
                utl.Alert.showErrorMsg('Please Choose the Item First..!');
                return false;
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var mov = res.Data[idx];
                mov.TransactTo = '';
                if (mov.TransactionTypeId == 21) {
                    if (mov.ToStoreMaster) {
                        mov.TransactTo = mov.ToStoreMaster.StoreName;
                    }
                    if (mov.PatientBill) {
                        if (mov.PatientBill.PatientName) {
                            mov.TransactTo += '/' + mov.PatientBill.PatientName;
                        }
                        if (mov.PatientBill.PatientMrn) {
                            mov.TransactTo += '/' + mov.PatientBill.PatientMrn;
                        }
                    }
                } else if (mov.TransactionTypeId == 22) {
                    if (mov.ToStoreMaster) {
                        mov.TransactTo = mov.ToStoreMaster.StoreName;
                    }
                    if (mov.PatientReturn) {
                        if (mov.PatientReturn.PatientName) {
                            mov.TransactTo += '/' + mov.PatientReturn.PatientName;
                        }
                        if (mov.PatientReturn.PatientMRN) {
                            mov.TransactTo += '/' + mov.PatientReturn.PatientMRN;
                        }
                    }
                } else if (mov.TransactionTypeId == 19) {
                    if (mov.ToStoreMaster) {
                        mov.TransactTo = mov.ToStoreMaster.StoreName;
                    }
                    if (mov.PatientDispense) {
                        mov.PatName = '';
                        if (mov.PatientDispense.Patient) {
                            if (mov.PatientDispense.Patient.Title) {
                                mov.PatName = mov.PatientDispense.Patient.Title.Description;
                            }
                            if (mov.PatientDispense.Patient.FirstName) {
                                mov.PatName += ' ' + mov.PatientDispense.Patient.FirstName;
                            }
                            if (mov.PatientDispense.Patient.LastName) {
                                mov.PatName += ' ' + mov.PatientDispense.Patient.LastName;
                            }
                            if (mov.PatientDispense.Patient.MRN) {
                                mov.PatName += ' /' + mov.PatientDispense.Patient.MRN;
                            }
                        }
                        mov.TransactTo += '/' + mov.PatName;
                    }
                } else if (mov.TransactionTypeId == 20) {
                    if (mov.ToStoreMaster) {
                        mov.TransactTo = mov.ToStoreMaster.StoreName;
                    }
                    if (mov.PatientDispenseReturn) {
                        mov.PatName = '';
                        if (mov.PatientDispenseReturn.Patient) {
                            if (mov.PatientDispenseReturn.Patient.Title) {
                                mov.PatName = mov.PatientDispenseReturn.Patient.Title.Description;
                            }
                            if (mov.PatientDispenseReturn.Patient.FirstName) {
                                mov.PatName += ' ' + mov.PatientDispenseReturn.Patient.FirstName;
                            }
                            if (mov.PatientDispenseReturn.Patient.LastName) {
                                mov.PatName += ' ' + mov.PatientDispenseReturn.Patient.LastName;
                            }
                            if (mov.PatientDispenseReturn.Patient.MRN) {
                                mov.PatName += ' /' + mov.PatientDispenseReturn.Patient.MRN;
                            }
                        }
                        mov.TransactTo += '/' + mov.PatName;
                    }
                } else {
                    if (mov.ToStoreMaster) {
                        mov.TransactTo = mov.ToStoreMaster.StoreName;
                    }
                }
                vm.gridConfig.data.push(mov);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            if ($scope.item.ItemMasterId > 0) {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.item.ItemMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 5,
                        // Value: utl.Formatter.getFilterDate(From)
                        Value: From
                    },
                    {
                        Key: 6,
                        // Value: utl.Formatter.getFilterDate(To)
                        Value: To
                    }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                }
            } else {
                utl.Alert.showErrorMsg('Please Select Item First');
                return true;
            }

            var options = {
                action: 'pharmacy/StockMovement/GetStockMovements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                flag: 'IsMultiUse',
                // style:{
                //     field:'Status',
                //     value:{
                //         1:{'background':'red','color':'#fff'}
                //     }
                // }
            },
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "TransactionDate",
                displayName: $translate.instant('inventory.purchaseorder.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransactionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.TransactionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "TransactionType.Description",
                displayName: $translate.instant('inventory.stockmovement.type.lbl')
            },

            {
                field: "StoreMaster.StoreName",
                displayName: $translate.instant('inventory.stockmovement.store.lbl')
            },
            {
                field: "TransactionNumber",
                displayName: $translate.instant('inventory.stockmovement.ref#.lbl')
            },
            {
                field: "TransactTo",
                displayName: $translate.instant('inventory.stockmovement.transactionto.lbl'),
                // cellTemplate: "<ngformatdate date-val='entity.TransaFctionDate'></ngformatdate>"
            },
            {
                field: "CreatedUser",
                displayName: $translate.instant('inventory.stockmovement.createdby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedUser.Title.Description}}&nbsp;{{entity.CreatedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CreatedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "InQty",
                displayName: $translate.instant('inventory.stockmovement.inqty.lbl')
            },
            {
                field: "OutQty",
                displayName: $translate.instant('inventory.stockmovement.outqty.lbl')
            },
            {
                field: "TotalAFQty",
                displayName: $translate.instant('inventory.stockmovement.finalqty.lbl')
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };


        vm.movementitemcontrolconfig = {
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
            }
            ],
            searchparams: {},
            result: {},
            // api: 'pharmacy/itemmaster/GetItemMasters',
            api: 'pharmacy/itemstoremap/GetItemStoreMaps',
            formatdisplay: formatselectedmovementitem,
            presearch: presearchmovementitem,
            postsearch: postsearchmovementitem
        };

        function formatselectedmovementitem() {
            var selectedItem = vm.movementitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ItemmasterId = selectedItem.ItemmasterId;
                $scope.item.ItemCode = selectedItem.ItemCode;
                $scope.item.ItemName = selectedItem.ItemName;
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.movementitemcontrolconfig.rowdata) {
                result = [vm.movementitemcontrolconfig.rowdata.ItemCode, vm.movementitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchmovementitem() {
            var query = vm.movementitemcontrolconfig.query;
            // var inputData = {
            //     Params: [{
            //         Key: 3,
            //         Value: 2
            //     },
            //         // { Key: 26, Value: [-1, utl.Session.getCurrentFacilityId()] },
            //     ],
            //     PageContext: {
            //         PageSize: 25,
            //         PageNumber: 1
            //     }
            // };

            // if (vm.movementitemcontrolconfig.searchbyid === true) {
            //     inputData.Params.push({
            //         Key: 0,
            //         Value: query
            //     });
            // } else if (query && query.length > 2) {
            //     inputData.Params.push({
            //         Key: 1,
            //         Value: query
            //     });
            // }
            var inputData = {
                Params: [
                    {
                        Key: 13,//ActiveStatus
                        Value: 2
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.movementitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                if ($scope.itemexactsearch == true) {
                    inputData.Params.push({
                        Key: 24,
                        Value: query
                    });
                } else {
                    inputData.Params.push({
                        Key: 3,
                        Value: query
                    });
                }
            }

            vm.movementitemcontrolconfig.searchparams = inputData;
        }

        function postsearchmovementitem() {
            for (var idx in vm.movementitemcontrolconfig.result) {
                var item = vm.movementitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                // if (item.ProductType !== null) {
                //     item.ProductTypeName = item.ProductType.ProductTypeName;
                // } else {
                //     item.ProductTypeName = '';
                // }
                // if (item.GenericMaster !== null) {
                //     item.GenericName = item.GenericMaster.GenericName;
                // } else {
                //     item.GenericName = '';
                // }
                // if (item.VendorMaster !== null) {
                //     item.ManufacturerName = item.VendorMaster.VendorName;
                // } else {
                //     item.ManufacturerName = '';
                // }
                if (item.ProductType) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.ProductType) {
                            item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                        } else {
                            item.ProductTypeName = '';
                        }
                    } else {
                        item.ProductTypeName = '';
                    }
                }
                if (item.GenericMaster) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.GenericMaster) {
                            item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                        } else {
                            item.GenericName = '';
                        }
                    } else {
                        item.GenericName = '';
                    }
                }
                if (item.Manufacturer) {
                    item.ManufacturerName = item.Manufacturer.VendorName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.Manufacturer) {
                            item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                        } else {
                            item.ManufacturerName = '';
                        }
                    } else {
                        item.ManufacturerName = '';
                    }
                }
            }
        }

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/StockMovement/PrintStockMovement',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

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
                "Key": "StoreMaster"
            },
            {
                "Key": "UserStores",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    }, {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId(),
                    }, {
                        Key: 5,
                        Value: 2
                    }]
                },
                Default: false
            },
            {
                "Key": "Facility"
            },
            {
                "Key": "ActiveStatus"
            },
            {
                "Key": "TransactionType"
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

    stockMovementController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();