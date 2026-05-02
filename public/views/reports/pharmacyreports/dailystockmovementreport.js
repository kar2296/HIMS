(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dailystockmovementreportController', dailystockmovementreportController);

    function dailystockmovementreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0,
        };
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.CanShowPrint = false;

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Name", "Product Name", "Opening Qty", "InQty", "OutQty", "Closing Qty", "UCP", "MRP", "TotalUCP", "TotalMRP"]
            let csvContent = JsonFields.join(",") + "\n";

            $scope.StockDataMov = data;
            $scope.DailyStockDataMoves = [];
            $scope.NetStockDataMoves = [];
            if ($scope.StockDataMov) {
                var crntStkMov = [];
                var prevStkMov = [];
                if ($scope.StockDataMov.length > 0) {
                    crntStkMov = $scope.StockDataMov[0].Value;
                }
                if ($scope.StockDataMov.length > 1) {
                    prevStkMov = $scope.StockDataMov[1].Value;
                }
                if (crntStkMov) {
                    for (var idx in crntStkMov) {
                        var ItemName = '';
                        var ProductName = '';
                        var OpenQty = 0;
                        var Inqty = 0;
                        var OutQty = 0;
                        var ClosingQty = 0;
                        var Ucp = '';
                        var Mrp = '';
                        var crntmove = crntStkMov[idx];
                        for (var sdx in crntmove) {
                            var moveditems = crntmove[sdx];
                            ItemName = moveditems.ItemName
                            ProductName = moveditems.ProductName;
                            OpenQty = moveditems.Openingqty;
                            Inqty = moveditems.InQty;
                            OutQty = moveditems.OutQty;
                            ClosingQty = moveditems.closingQty;
                            Ucp = moveditems.Ucp;
                            Mrp = moveditems.Mrp;
                            let crntlength = moveditems.movlength;
                            var valappended = 0;
                            $scope.DailyStockDataMoves.forEach(function (item) {
                                if (ItemName == item.ItemName) {
                                    item.ItemName = moveditems.ItemName;
                                    item.ProductName = moveditems.ProductName;
                                    // item.OpenQty = moveditems.Openingqty;
                                    item.Inqty = moveditems.InQty;
                                    item.OutQty = moveditems.OutQty;
                                    item.ClosingQty = moveditems.closingQty;
                                    item.Ucp += moveditems.Ucp;
                                    item.Mrp += moveditems.Mrp || 0;
                                    item.crntlength = moveditems.crntlength || 0;
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0) {
                                $scope.DailyStockDataMoves.push({
                                    'ItemName': ItemName,
                                    'ProductName': ProductName,
                                    // 'OpenQty': OpenQty,
                                    'Inqty': Inqty,
                                    'OutQty': OutQty,
                                    'ClosingQty': ClosingQty,
                                    'Ucp': Ucp,
                                    'Mrp': Mrp,
                                    'crntlength': crntlength
                                })
                            }
                        }
                    }
                }
                if (prevStkMov) {
                    var OpenQty = 0;
                    for (var idx in prevStkMov) {
                        var ItemName = '';
                        var ProductName = '';
                        var Inqty = 0;
                        var OutQty = 0;
                        var ClosingQty = 0;
                        var Ucp = '';
                        var Mrp = '';
                        var prevmove = prevStkMov[idx];
                        for (var sdx in prevmove) {
                            var prevmoveditems = prevmove[sdx];
                            if (!crntStkMov) {
                                if (prevmoveditems.closingQty > 0) {
                                    ItemName = prevmoveditems.ItemName
                                    ProductName = prevmoveditems.ProductName;
                                    OpenQty = prevmoveditems.Openingqty;
                                    Inqty = prevmoveditems.Inqty;
                                    OutQty = prevmoveditems.OutQty;
                                    ClosingQty = prevmoveditems.closingQty;
                                    Ucp = prevmoveditems.Ucp;
                                    Mrp = prevmoveditems.Mrp;
                                    let prevlength = prevmoveditems.movlength;
                                    var valappended = 0;
                                    $scope.DailyStockDataMoves.forEach(function (item) {
                                        if (ItemName == item.ItemName) {
                                            item.ItemName = prevmoveditems.ItemName;
                                            item.ProductName = prevmoveditems.ProductName;
                                            item.OpenQty = prevmoveditems.Openingqty;
                                            item.Ucp += prevmoveditems.Ucp;
                                            item.Mrp += prevmoveditems.Mrp || 0;
                                            item.prevlength = prevmoveditems.movlength || 0;
                                            valappended = 1;
                                        }
                                    });
                                    if (valappended == 0) {
                                        $scope.DailyStockDataMoves.push({
                                            'ItemName': ItemName,
                                            'ProductName': ProductName,
                                            'OpenQty': OpenQty,
                                            'Inqty': Inqty,
                                            'OutQty': OutQty,
                                            'ClosingQty': ClosingQty,
                                            'Ucp': Ucp,
                                            'Mrp': Mrp,
                                            'prevlength': prevlength
                                        })
                                    }
                                }
                            } else {
                                ItemName = prevmoveditems.ItemName
                                ProductName = prevmoveditems.ProductName;
                                OpenQty = prevmoveditems.Openingqty;
                                Inqty = prevmoveditems.Inqty;
                                OutQty = prevmoveditems.OutQty;
                                ClosingQty = prevmoveditems.closingQty;
                                Ucp = prevmoveditems.Ucp;
                                Mrp = prevmoveditems.Mrp;
                                let prevlength = prevmoveditems.movlength;
                                var valappended = 0;
                                $scope.DailyStockDataMoves.forEach(function (item) {
                                    if (ItemName == item.ItemName) {
                                        item.ItemName = prevmoveditems.ItemName;
                                        item.ProductName = prevmoveditems.ProductName;
                                        item.OpenQty = prevmoveditems.Openingqty;
                                        item.Ucp += prevmoveditems.Ucp;
                                        item.Mrp += prevmoveditems.Mrp || 0;
                                        item.prevlength = prevmoveditems.movlength || 0;
                                        valappended = 1;
                                    }
                                });
                                if (valappended == 0) {
                                    $scope.DailyStockDataMoves.push({
                                        'ItemName': ItemName,
                                        'ProductName': ProductName,
                                        'OpenQty': OpenQty,
                                        'Inqty': Inqty,
                                        'OutQty': OutQty,
                                        'ClosingQty': ClosingQty,
                                        'Ucp': Ucp,
                                        'Mrp': Mrp,
                                        'prevlength': prevlength
                                    })
                                }
                            }
                        }
                    }
                } else {
                    $scope.DailyStockDataMoves.forEach(function () {
                        item.OpenQty = OpenQty;
                        item.prevlength = 0;
                    });
                }
            }

            for (var ldx in $scope.DailyStockDataMoves) {
                var allstkmoves = $scope.DailyStockDataMoves[ldx];
                allstkmoves.alllength = (allstkmoves.crntlength || 0) + (allstkmoves.prevlength || 0);
                allstkmoves.AvgUcp = parseFloat((allstkmoves.Ucp / allstkmoves.alllength)).toFixed(2);
                allstkmoves.AvgMrp = parseFloat((allstkmoves.Mrp / allstkmoves.alllength)).toFixed(2);
                allstkmoves.TotalUcp = parseFloat((allstkmoves.AvgUcp) * (allstkmoves.ClosingQty)).toFixed(2);
                allstkmoves.TotalMrp = parseFloat((allstkmoves.AvgMrp) * (allstkmoves.ClosingQty)).toFixed(2);
                $scope.NetStockDataMoves.push(allstkmoves);
            }

            $scope.NetUcp = 0;
            $scope.NetMrp = 0;
            $scope.NetTotalUcp = 0;
            $scope.NetTotalMrp = 0;
            var netucp = 0;
            var netmrp = 0;
            var nettotucp = 0;
            var nettotmrp = 0;
            for (var mdx in $scope.NetStockDataMoves) {
                var dailymove = $scope.NetStockDataMoves[mdx];
                netucp = netucp + dailymove.AvgUcp;
                netmrp = netmrp + dailymove.AvgMrp;
                nettotucp = nettotucp + dailymove.TotalUcp;
                nettotmrp = nettotmrp + dailymove.TotalMrp;
            }
            $scope.NetUcp = netucp;
            $scope.NetMrp = netmrp;
            $scope.NetTotalUcp = nettotucp;
            $scope.NetTotalMrp = nettotmrp;


            $scope.NetStockDataMoves.forEach(function (rowArray) {

                var itemname = '';
                var productname = '';
                var Openingqty = '';
                var inqty = '';
                var outqty = '';
                var closingqty = '';
                var ucp = '';
                var mrp = '';
                var totalucp = '';
                var totalmrp = '';

                if (rowArray.ItemName) {
                    itemname = rowArray.ItemName;
                    // returnDate = utl.Formatter.getDateTimeString(rowArray.ReturnDateTime);
                }
                if (rowArray.ProductName) {
                    productname = rowArray.ProductName;
                }
                if (rowArray.OpenQty) {
                    Openingqty = rowArray.OpenQty;
                }
                if (rowArray.Inqty) {
                    inqty = rowArray.Inqty;
                }
                if (rowArray.OutQty) {
                    outqty = rowArray.OutQty;
                }
                if (rowArray.ClosingQty) {
                    closingqty = rowArray.ClosingQty;
                }
                if (rowArray.AvgUcp) {
                    ucp = rowArray.AvgUcp;
                }
                if (rowArray.AvgMrp) {
                    mrp = rowArray.AvgMrp;
                }
                if (rowArray.TotalUcp) {
                    totalucp = rowArray.TotalUcp;
                }
                if (rowArray.TotalMrp) {
                    totalmrp = rowArray.TotalMrp;
                }


                csvContent += itemname + ',' + productname + ',' + Openingqty + ',' + inqty + ',' + outqty + ',' + closingqty + ',' + ucp + ',' + mrp + ',' + totalucp + ',' + totalmrp + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'dailystockmovement-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    ItemMasterId: $scope.currentfilter.ItemMasterId || 0
                },
            };

            var options = {
                action: 'pharmacy/StockMovement/GetStockDailyMovements',
                data: inputData,
                type: 'post',
                onComplete: $scope.excelDownloadCallbackExcel
            };

            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.StockMov = res;
            $scope.DailyStockMoves = [];
            $scope.NetStockMoves = [];
            if ($scope.StockMov) {
                var crntStkMov = [];
                var prevStkMov = [];
                if ($scope.StockMov.length > 0) {
                    crntStkMov = $scope.StockMov[0].Value;
                }
                if ($scope.StockMov.length > 1) {
                    prevStkMov = $scope.StockMov[1].Value;
                }
                if (crntStkMov) {
                    for (var idx in crntStkMov) {
                        var ItemName = '';
                        var ProductName = '';
                        var OpenQty = 0;
                        var Inqty = 0;
                        var OutQty = 0;
                        var ClosingQty = 0;
                        var Ucp = '';
                        var Mrp = '';
                        var crntmove = crntStkMov[idx];
                        for (var sdx in crntmove) {
                            var moveditems = crntmove[sdx];
                            ItemName = moveditems.ItemName
                            ProductName = moveditems.ProductName;
                            OpenQty = moveditems.Openingqty;
                            Inqty = moveditems.InQty;
                            OutQty = moveditems.OutQty;
                            ClosingQty = moveditems.closingQty;
                            Ucp = moveditems.Ucp;
                            Mrp = moveditems.Mrp;
                            let crntlength = moveditems.movlength;
                            var valappended = 0;
                            $scope.DailyStockMoves.forEach(function (item) {
                                if (ItemName == item.ItemName) {
                                    item.ItemName = moveditems.ItemName;
                                    item.ProductName = moveditems.ProductName;
                                    // item.OpenQty = moveditems.Openingqty;
                                    item.Inqty = moveditems.InQty;
                                    item.OutQty = moveditems.OutQty;
                                    item.ClosingQty = moveditems.closingQty;
                                    item.Ucp += moveditems.Ucp;
                                    item.Mrp += moveditems.Mrp || 0;
                                    item.crntlength = moveditems.crntlength || 0;
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0) {
                                $scope.DailyStockMoves.push({
                                    'ItemName': ItemName,
                                    'ProductName': ProductName,
                                    // 'OpenQty': OpenQty,
                                    'Inqty': Inqty,
                                    'OutQty': OutQty,
                                    'ClosingQty': ClosingQty,
                                    'Ucp': Ucp,
                                    'Mrp': Mrp,
                                    'crntlength': crntlength
                                })
                            }
                        }
                    }
                }
                if (prevStkMov) {
                    var OpenQty = 0;
                    for (var idx in prevStkMov) {
                        var ItemName = '';
                        var ProductName = '';
                        var Inqty = 0;
                        var OutQty = 0;
                        var ClosingQty = 0;
                        var Ucp = '';
                        var Mrp = '';
                        var prevmove = prevStkMov[idx];
                        for (var sdx in prevmove) {
                            var prevmoveditems = prevmove[sdx];
                            if (!crntStkMov) {
                                if (prevmoveditems.closingQty > 0) {
                                    ItemName = prevmoveditems.ItemName
                                    ProductName = prevmoveditems.ProductName;
                                    OpenQty = prevmoveditems.Openingqty;
                                    Inqty = prevmoveditems.Inqty;
                                    OutQty = prevmoveditems.OutQty;
                                    ClosingQty = prevmoveditems.closingQty;
                                    Ucp = prevmoveditems.Ucp;
                                    Mrp = prevmoveditems.Mrp;
                                    let prevlength = prevmoveditems.movlength;
                                    var valappended = 0;
                                    $scope.DailyStockMoves.forEach(function (item) {
                                        if (ItemName == item.ItemName) {
                                            item.ItemName = prevmoveditems.ItemName;
                                            item.ProductName = prevmoveditems.ProductName;
                                            item.OpenQty = prevmoveditems.Openingqty;
                                            item.Ucp += prevmoveditems.Ucp;
                                            item.Mrp += prevmoveditems.Mrp || 0;
                                            item.prevlength = prevmoveditems.movlength || 0;
                                            valappended = 1;
                                        }
                                    });
                                    if (valappended == 0) {
                                        $scope.DailyStockMoves.push({
                                            'ItemName': ItemName,
                                            'ProductName': ProductName,
                                            'OpenQty': OpenQty,
                                            'Inqty': Inqty,
                                            'OutQty': OutQty,
                                            'ClosingQty': ClosingQty,
                                            'Ucp': Ucp,
                                            'Mrp': Mrp,
                                            'prevlength': prevlength
                                        })
                                    }
                                }
                            } else {
                                ItemName = prevmoveditems.ItemName
                                ProductName = prevmoveditems.ProductName;
                                OpenQty = prevmoveditems.Openingqty;
                                Inqty = prevmoveditems.Inqty;
                                OutQty = prevmoveditems.OutQty;
                                ClosingQty = prevmoveditems.closingQty;
                                Ucp = prevmoveditems.Ucp;
                                Mrp = prevmoveditems.Mrp;
                                let prevlength = prevmoveditems.movlength;
                                var valappended = 0;
                                $scope.DailyStockMoves.forEach(function (item) {
                                    if (ItemName == item.ItemName) {
                                        item.ItemName = prevmoveditems.ItemName;
                                        item.ProductName = prevmoveditems.ProductName;
                                        item.OpenQty = prevmoveditems.Openingqty;
                                        item.Ucp += prevmoveditems.Ucp;
                                        item.Mrp += prevmoveditems.Mrp || 0;
                                        item.prevlength = prevmoveditems.movlength || 0;
                                        valappended = 1;
                                    }
                                });
                                if (valappended == 0) {
                                    $scope.DailyStockMoves.push({
                                        'ItemName': ItemName,
                                        'ProductName': ProductName,
                                        'OpenQty': OpenQty,
                                        'Inqty': Inqty,
                                        'OutQty': OutQty,
                                        'ClosingQty': ClosingQty,
                                        'Ucp': Ucp,
                                        'Mrp': Mrp,
                                        'prevlength': prevlength
                                    })
                                }
                            }
                        }
                    }
                } else {
                    $scope.DailyStockMoves.forEach(function () {
                        item.OpenQty = OpenQty;
                        item.prevlength = 0;
                    });
                }
            }

            for (var ldx in $scope.DailyStockMoves) {
                var allstkmoves = $scope.DailyStockMoves[ldx];
                allstkmoves.alllength = (allstkmoves.crntlength || 0) + (allstkmoves.prevlength || 0);
                allstkmoves.AvgUcp = parseFloat((allstkmoves.Ucp / allstkmoves.alllength)).toFixed(2);
                allstkmoves.AvgMrp = parseFloat((allstkmoves.Mrp / allstkmoves.alllength)).toFixed(2);
                allstkmoves.TotalUcp = parseFloat((allstkmoves.AvgUcp) * (allstkmoves.ClosingQty)).toFixed(2);
                allstkmoves.TotalMrp = parseFloat((allstkmoves.AvgMrp) * (allstkmoves.ClosingQty)).toFixed(2);
                $scope.NetStockMoves.push(allstkmoves);
            }

            $scope.NetUcp = 0;
            $scope.NetMrp = 0;
            $scope.NetTotalUcp = 0;
            $scope.NetTotalMrp = 0;
            var netucp = 0;
            var netmrp = 0;
            var nettotucp = 0;
            var nettotmrp = 0;
            for (var mdx in $scope.NetStockMoves) {
                var dailymove = $scope.NetStockMoves[mdx];
                netucp = netucp + dailymove.AvgUcp;
                netmrp = netmrp + dailymove.AvgMrp;
                nettotucp = nettotucp + dailymove.TotalUcp;
                nettotmrp = nettotmrp + dailymove.TotalMrp;
            }
            $scope.NetUcp = netucp;
            $scope.NetMrp = netmrp;
            $scope.NetTotalUcp = nettotucp;
            $scope.NetTotalMrp = nettotmrp;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    ItemMasterId: $scope.currentfilter.ItemMasterId || 0
                },
            };

            var options = {
                action: 'pharmacy/StockMovement/GetStockDailyMovements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ItemMasterId = 0;
                //                 $scope.getList();
            }
        };
        $scope.SelectedFromStore = function (selectedItem) {
            $scope.currentfilter.StoreMaster = selectedItem.StoreName;
        };
        // $scope.SelectedFromProducttype = function (selectedItem) {
        //     $scope.currentfilter.Producttype = selectedItem.ProducttypeName;
        // };
        $scope.backtoReport = function () {
            $state.go('app.pharmacytabreport.invoicecollectionreport')
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
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedmovementitem,
            presearch: presearchmovementitem,
            postsearch: postsearchmovementitem
        };

        function formatselectedmovementitem() {
            var selectedItem = vm.movementitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.movementitemcontrolconfig.rowdata) {
                result = [vm.movementitemcontrolconfig.rowdata.ItemCode, vm.movementitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            $scope.currentfilter.ItemName = result;
            return result;
        }

        function presearchmovementitem() {
            var query = vm.movementitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
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
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.movementitemcontrolconfig.searchparams = inputData;
        }

        function postsearchmovementitem() {
            for (var idx in vm.movementitemcontrolconfig.result) {
                var item = vm.movementitemcontrolconfig.result[idx];
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

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    StoreMaster: $scope.currentfilter.StoreMaster || 0,
                    ItemMasterId: $scope.currentfilter.ItemMasterId || 0,
                    ItemName: $scope.currentfilter.ItemName,
                    ProductTypeId: $scope.currentfilter.ProductTypeId,
                },
            };

            var options = {
                action: 'pharmacy/StockMovement/PrintDailyStockMovement',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };



        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    $scope.currentfilter.StoreMaster = value[0].Text;
                }
            });
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "UserStores",
                    Default: false,
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
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
        }

        $scope.initLookup();

    }

    dailystockmovementreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();