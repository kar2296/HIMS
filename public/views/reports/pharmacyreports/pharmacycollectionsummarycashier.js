(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyCollectionSummaryCashierController', PharmacyCollectionSummaryCashierController);

    function PharmacyCollectionSummaryCashierController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
            StoreMasterId: -1
        }
        $scope.currentfilter.UserId = -1;

        $scope.lookup = {};
        $scope.GetPharmacyCollectionOptionsCallBack = function (scope, res, options, hasError) {
            $scope.PharmacyCollection = res;
            $scope.UserCollection = [];
            $scope.NetUserCollection = [];
            if ($scope.PharmacyCollection) {
                var pharmausersales = [];
                var pharmauserreturns = [];
                var ippharmacysales = [];
                var ippharmacyreturns = [];
                if ($scope.PharmacyCollection.length > 0) {
                    pharmausersales = $scope.PharmacyCollection[0].Value;
                }
                if ($scope.PharmacyCollection.length > 1) {
                    pharmauserreturns = $scope.PharmacyCollection[1].Value;
                }
                if ($scope.PharmacyCollection.length > 2) {
                    ippharmacysales = $scope.PharmacyCollection[2].Value;
                }
                if ($scope.PharmacyCollection.length > 3) {
                    ippharmacyreturns = $scope.PharmacyCollection[3].Value;
                }
                for (var idx in pharmausersales) {
                    var usercol = pharmausersales[idx];
                    var Key = '';
                    var CashAmt = 0;
                    var CardAmt = 0;
                    var OtherAmt = 0;
                    var UPIAmt = 0;
                    var DueCollectAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].CashAmount) {
                            CashAmt = usercol[ix].CashAmount;
                        }
                        if (usercol[ix].CardAmount) {
                            CardAmt = usercol[ix].CardAmount;
                        }
                        if (usercol[ix].OtherAmount) {
                            OtherAmt = usercol[ix].OtherAmount;
                        }
                        if (usercol[ix].UPIAmount) {
                            UPIAmt = usercol[ix].UPIAmount;
                        }
                        if (usercol[ix].DueCollection) {
                            DueCollectAmt = usercol[ix].DueCollection;
                        }
                        if (usercol[ix].AdvanceCollection) {
                            AdvanceCollectAmt = usercol[ix].AdvanceCollection;
                        }
                        Key = $scope.UserName;
                        CashAmt = CashAmt;
                        CardAmt = CardAmt;
                        OtherAmt = OtherAmt;
                        UPIAmt = UPIAmt;
                        DueCollectAmt = DueCollectAmt;
                        AdvanceCollectAmt = AdvanceCollectAmt;
                    }
                    $scope.UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': CashAmt,
                            'CardAmt': CardAmt,
                            'OtherAmt': OtherAmt,
                            'UPIAmt': UPIAmt,
                            'DueCollectAmt': DueCollectAmt,
                            'AdvanceCollectAmt': AdvanceCollectAmt,
                            'NetReturnAmt': 0.00,
                            'CashReturnAmt': 0.00,
                            'CardReturnAmt': 0.00,
                            'OtherReturnAmt': 0.00,
                            'UPIReturnAmt': 0.00,
                            'TotalBillAmt': 0.00,
                            'DueBalance': 0.00,
                            'IPSaleAmt': 0.00,
                            'IPReturnAmt': 0.00
                        }
                    })

                }
                for (var idx in pharmauserreturns) {
                    var usercol = pharmauserreturns[idx];
                    var Key = '';
                    var NetReturnAmt = 0;
                    var CashReturnAmt = 0;
                    var CardReturnAmt = 0;
                    var OtherReturnAmt = 0;
                    var UPIReturnAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].NetRefundAmount) {
                            NetReturnAmt = usercol[ix].NetRefundAmount;
                        }
                        if (usercol[ix].CashRefundAmount) {
                            CashReturnAmt = usercol[ix].CashRefundAmount;
                        }
                        if (usercol[ix].CardRefundAmount) {
                            CardReturnAmt = usercol[ix].CardRefundAmount;
                        }
                        if (usercol[ix].OtherRefundAmount) {
                            OtherReturnAmt = usercol[ix].OtherRefundAmount;
                        }
                        if (usercol[ix].UPIRefundAmount) {
                            UPIReturnAmt = usercol[ix].UPIRefundAmount;
                        }
                        Key = $scope.UserName;
                        NetReturnAmt = NetReturnAmt;
                        CashReturnAmt = CashReturnAmt;
                        CardReturnAmt = CardReturnAmt;
                        OtherReturnAmt = OtherReturnAmt;
                        UPIReturnAmt = UPIReturnAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.NetReturnAmt = NetReturnAmt;
                            item.Value.CashReturnAmt = CashReturnAmt;
                            item.Value.CardReturnAmt = CardReturnAmt;
                            item.Value.OtherReturnAmt = OtherReturnAmt;
                            item.Value.UPIReturnAmt = UPIReturnAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'CashAmt': 0.00,
                                'CardAmt': 0.00,
                                'OtherAmt': 0.00,
                                'UPIAmt': 0.00,
                                'DueCollectAmt': 0.00,
                                'AdvanceCollectAmt': 0.00,
                                'NetReturnAmt': NetReturnAmt,
                                'CashReturnAmt': CashReturnAmt,
                                'CardReturnAmt': CardReturnAmt,
                                'OtherReturnAmt': OtherReturnAmt,
                                'UPIReturnAmt': UPIReturnAmt,
                                'TotalBillAmt': 0.00,
                                'DueBalance': 0.00,
                                'IPSaleAmt': 0.00,
                                'IPReturnAmt': 0.00
                            }
                        });

                }
                for (var idx in ippharmacysales) {
                    var usercol = ippharmacysales[idx];
                    var Key = '';
                    var TotalBillAmt = 0;
                    var DueBalance = 0;
                    var IPSaleAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].IPSaleAmount) {
                            IPSaleAmt = usercol[ix].IPSaleAmount;
                        }
                        if (usercol[ix].TotalBillAmt) {
                            TotalBillAmt = usercol[ix].TotalBillAmt;
                        }
                        if (usercol[ix].BalanceDue) {
                            DueBalance = usercol[ix].BalanceDue;
                        }
                        Key = $scope.UserName;
                        IPSaleAmt = IPSaleAmt;
                        TotalBillAmt = TotalBillAmt;
                        DueBalance = DueBalance;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.IPSaleAmt = IPSaleAmt;
                            item.Value.TotalBillAmt = TotalBillAmt;
                            item.Value.DueBalance = DueBalance;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'CashAmt': 0.00,
                                'CardAmt': 0.00,
                                'OtherAmt': 0.00,
                                'UPIAmt': 0.00,
                                'DueCollectAmt': 0.00,
                                'AdvanceCollectAmt': 0.00,
                                'NetReturnAmt': 0.00,
                                'CashReturnAmt': 0.00,
                                'CardReturnAmt': 0.00,
                                'OtherReturnAmt': 0.00,
                                'UPIReturnAmt': 0.00,
                                'TotalBillAmt': TotalBillAmt,
                                'DueBalance': DueBalance,
                                'IPSaleAmt': IPSaleAmt,
                                'IPReturnAmt': 0.00
                            }
                        });

                }
                for (var idx in ippharmacyreturns) {
                    var usercol = ippharmacyreturns[idx];
                    var Key = '';
                    var IPReturnAmt = 0;
                    for (var ix in usercol) {
                        $scope.UserName = '';
                        if (usercol[ix].UserName) {
                            if (usercol[ix].UserName.Title)
                                $scope.UserName = usercol[ix].UserName.Title.Description;
                            if (usercol[ix].UserName.FirstName)
                                $scope.UserName += ' ' + usercol[ix].UserName.FirstName;
                            if (usercol[ix].UserName.LastName)
                                $scope.UserName += ' ' + usercol[ix].UserName.LastName;
                        }
                        if (usercol[ix].IPReturnAmount) {
                            IPReturnAmt = usercol[ix].IPReturnAmount;
                        }
                        Key = $scope.UserName;
                        IPReturnAmt = IPReturnAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.IPReturnAmt = IPReturnAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'CashAmt': 0.00,
                                'CardAmt': 0.00,
                                'OtherAmt': 0.00,
                                'UPIAmt': 0.00,
                                'DueCollectAmt': 0.00,
                                'AdvanceCollectAmt': 0.00,
                                'NetReturnAmt': 0.00,
                                'CashReturnAmt': 0.00,
                                'CardReturnAmt': 0.00,
                                'OtherReturnAmt': 0.00,
                                'UPIReturnAmt': 0.00,
                                'TotalBillAmt': 0.00,
                                'DueBalance': 0.00,
                                'IPSaleAmt': 0.00,
                                'IPReturnAmt': IPReturnAmt
                            }
                        });

                }
            }
            for (var idx in $scope.UserCollection) {
                var Key = '';
                var TotalBillAmt = 0;
                var DueBalance = 0;
                var DueCollectAmt = 0;
                var AdvanceCollectAmt = 0;
                var NetReturnAmt = 0;
                var CashAmt = 0;
                var CashReturnAmt = 0;
                var NetCash = 0
                var CardAmt = 0;
                var CardReturnAmt = 0;
                var NetCard = 0
                var OtherAmt = 0;
                var UPIAmt = 0;
                var OtherReturnAmt = 0;
                var UPIReturnAmt = 0;
                var NetOther = 0;
                var NetUPI = 0;
                var IPSaleAmt = 0;
                var IPReturnAmt = 0;
                var NetIP = 0;
                var Sales = 0;
                var Return = 0;
                var NetSales = 0;

                var collectiondetails = $scope.UserCollection[idx];
                var usercollect = {
                    Key: collectiondetails.Key,
                    TotalBillAmt: collectiondetails.Value.TotalBillAmt,
                    DueBalance: collectiondetails.Value.DueBalance,
                    DueCollectAmt: collectiondetails.Value.DueCollectAmt,
                    AdvanceCollectAmt: collectiondetails.Value.AdvanceCollectAmt,
                    CashAmt: collectiondetails.Value.CashAmt,
                    CashReturnAmt: collectiondetails.Value.CashReturnAmt,
                    NetCash: (collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashReturnAmt),
                    CardAmt: collectiondetails.Value.CardAmt,
                    CardReturnAmt: collectiondetails.Value.CardReturnAmt,
                    NetCard: (collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardReturnAmt),
                    OtherAmt: collectiondetails.Value.OtherAmt,
                    OtherReturnAmt: collectiondetails.Value.OtherReturnAmt,
                    NetUPI: (collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIReturnAmt),
                    UPIAmt: collectiondetails.Value.UPIAmt,
                    UPIReturnAmt: collectiondetails.Value.UPIReturnAmt,
                    NetUPI: (collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIReturnAmt),
                    IPSaleAmt: collectiondetails.Value.IPSaleAmt,
                    IPReturnAmt: collectiondetails.Value.IPReturnAmt,
                    NetIP: (collectiondetails.Value.IPSaleAmt) - (collectiondetails.Value.IPReturnAmt),
                    Sales: (collectiondetails.Value.CashAmt) + (collectiondetails.Value.CardAmt)
                        + (collectiondetails.Value.OtherAmt) + (collectiondetails.Value.UPIAmt) +
                        (collectiondetails.Value.IPSaleAmt),
                    Return: (collectiondetails.Value.CashReturnAmt) + (collectiondetails.Value.CardReturnAmt)
                        + (collectiondetails.Value.OtherReturnAmt) + (collectiondetails.Value.UPIReturnAmt) +
                        (collectiondetails.Value.IPReturnAmt),
                    NetSales: ((collectiondetails.Value.CashAmt) + (collectiondetails.Value.CardAmt)
                        + (collectiondetails.Value.OtherAmt) + (collectiondetails.Value.UPIAmt) +
                        (collectiondetails.Value.IPSaleAmt)) - ((collectiondetails.Value.CashReturnAmt) + (collectiondetails.Value.CardReturnAmt)
                            + (collectiondetails.Value.OtherReturnAmt) + (collectiondetails.Value.UPIReturnAmt) +
                            (collectiondetails.Value.IPReturnAmt)),
                };
                $scope.NetUserCollection.push(usercollect);
            }
            var TotBillAmt = 0;
            var TotDueBl = 0;
            var TotDueCol = 0;
            var TotAdvanceCol = 0;
            var TotalCashAmt = 0;
            var TotalCashRetAmt = 0;
            var TotalNetCash = 0;
            var TotalCardAmt = 0;
            var TotalCardRetAmt = 0;
            var TotalNetCard = 0;
            var TotalOtherAmt = 0;
            var TotalOtherRetAmt = 0;
            var TotalNetOther = 0;
            var TotalUPIAmt = 0;
            var TotalUPIRetAmt = 0;
            var TotalNetUPI = 0;
            var TotalIPSale = 0;
            var TotalIPRet = 0;
            var TotalNetIP = 0;
            var TotalSales = 0;
            var TotalReturn = 0;
            var TotalNetSales = 0;
            for (var jdx in $scope.NetUserCollection) {
                var netcollection = $scope.NetUserCollection[jdx];
                TotBillAmt = TotBillAmt + (netcollection.TotalBillAmt || 0);
                TotDueBl = TotDueBl + (netcollection.DueBalance || 0);
                TotDueCol = TotDueCol + (netcollection.DueCollectAmt || 0);
                TotAdvanceCol = TotAdvanceCol + (netcollection.AdvanceCollectAmt || 0);
                TotalCashAmt = TotalCashAmt + (netcollection.CashAmt || 0);
                TotalCashRetAmt = TotalCashRetAmt + (netcollection.CashReturnAmt || 0);
                TotalNetCash = TotalNetCash + (netcollection.NetCash || 0);
                TotalCardAmt = TotalCardAmt + (netcollection.CardAmt || 0);
                TotalCardRetAmt = TotalCardRetAmt + (netcollection.CardReturnAmt || 0);
                TotalNetCard = TotalNetCard + (netcollection.NetCard || 0);
                TotalOtherAmt = TotalOtherAmt + (netcollection.OtherAmt || 0);
                TotalOtherRetAmt = TotalOtherRetAmt + (netcollection.OtherReturnAmt || 0);
                TotalNetOther = TotalNetOther + (netcollection.NetOther || 0);
                TotalUPIAmt = TotalUPIAmt + (netcollection.UPIAmt || 0);
                TotalUPIRetAmt = TotalUPIRetAmt + (netcollection.UPIReturnAmt || 0);
                TotalNetUPI = TotalNetUPI + (netcollection.NetUPI || 0);
                TotalIPSale = TotalIPSale + (netcollection.IPSaleAmt || 0);
                TotalIPRet = TotalIPRet + (netcollection.IPReturnAmt || 0);
                TotalNetIP = TotalNetIP + (netcollection.NetIP || 0);
                TotalSales = TotalSales + (netcollection.Sales || 0);
                TotalReturn = TotalReturn + (netcollection.Return || 0);
                TotalNetSales = TotalNetSales + (netcollection.NetSales || 0);
            }
            $scope.TotBillAmt = TotBillAmt;
            $scope.TotDueBl = TotDueBl;
            $scope.TotDueCol = TotDueCol;
            $scope.TotAdvanceCol = TotAdvanceCol;
            $scope.TotalCashAmt = TotalCashAmt;
            $scope.TotalCashRetAmt = TotalCashRetAmt;
            $scope.TotalNetCash = TotalNetCash;
            $scope.TotalCardAmt = TotalCardAmt;
            $scope.TotalCardRetAmt = TotalCardRetAmt;
            $scope.TotalNetCard = TotalNetCard;
            $scope.TotalOtherAmt = TotalOtherAmt;
            $scope.TotalOtherRetAmt = TotalOtherRetAmt;
            $scope.TotalNetOther = TotalNetOther;
            $scope.TotalUPIAmt = TotalUPIAmt;
            $scope.TotalUPIRetAmt = TotalUPIRetAmt;
            $scope.TotalNetUPI = TotalNetUPI;
            $scope.TotalIPSale = TotalIPSale;
            $scope.TotalIPRet = TotalIPRet;
            $scope.TotalNetIP = TotalNetIP;
            $scope.TotalSales = TotalSales;
            $scope.TotalReturn = TotalReturn;
            $scope.TotalNetSales = TotalNetSales;
        }

        $scope.GetPharmacyOptions = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }

            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId,
                    UserId: $scope.currentfilter.UserId,
                },
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPharmacyCollectionSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetPharmacyCollectionOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId,
                }
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintPharmacyCollectionSummaryCashier',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };
        $scope.SelectedFromStore = function (selectedItem) {
            $scope.currentfilter.StoreMaster = selectedItem.StoreName;
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.currentfilter.UserName = result;
            // $scope.currentfilter.UserId = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === -1) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.currentfilter.StoreMaster = $scope.lookup.UserStores[usidx].Text;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === -1) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                        $scope.currentfilter.StoreMaster = value[0].Text;
                    }
                }
            });
            // $scope.getList();
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
            },];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();


        // $scope.LoadDashboard = function () {
        //     $scope.GetPharmacyOptions();
        // }

        // $scope.LoadDashboard();
    }
    PharmacyCollectionSummaryCashierController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();