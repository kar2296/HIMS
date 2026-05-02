(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPCollectionSummaryByCashierController', IPCollectionSummaryByCashierController);

    function IPCollectionSummaryByCashierController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.GetBillingCollectionOptionsCallBack = function (scope, res, options, hasError) {
            $scope.BillingCollection = res;
            $scope.UserCollection = [];
            $scope.NetUserCollection = [];
            if ($scope.BillingCollection) {
                var billusercollection = [];
                var billuserrefund = [];
                var billcollection = [];
                var expensecollection = [];
                var vochercollection = [];
                if ($scope.BillingCollection.length > 0) {
                    billusercollection = $scope.BillingCollection[0].Value;
                }
                if ($scope.BillingCollection.length > 1) {
                    billuserrefund = $scope.BillingCollection[1].Value;
                }
                if ($scope.BillingCollection.length > 2) {
                    billcollection = $scope.BillingCollection[2].Value;
                }
                for (var idx in billusercollection) {
                    var usercol = billusercollection[idx];
                    var Key = '';
                    var CashAmt = 0;
                    var CardAmt = 0;
                    var OtherAmt = 0;
                    var NetBankingAmt = 0;
                    var UPIAmt = 0;
                    // var DueCollectAmt = 0;
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
                        if (usercol[ix].NetBankingAmount) {
                            NetBankingAmt = usercol[ix].NetBankingAmount;
                        }
                        if (usercol[ix].UPIAmount) {
                            UPIAmt = usercol[ix].UPIAmount;
                        }
                        Key = $scope.UserName;
                        CashAmt = CashAmt;
                        CardAmt = CardAmt;
                        OtherAmt = OtherAmt;
                        NetBankingAmt = NetBankingAmt;
                        UPIAmt = UPIAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': CashAmt,
                            'CardAmt': CardAmt,
                            'OtherAmt': OtherAmt,
                            'NetBankingAmt': NetBankingAmt,
                            'UPIAmt': UPIAmt,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'NetBankingRefundAmt': 0.00,
                            'UPIRefundAmt': 0.00,
                            'TotalBillAmt': 0.00,
                        }
                    })

                }
                for (var idx in billuserrefund) {
                    var usercol = billuserrefund[idx];
                    var Key = '';
                    var NetRefundAmt = 0;
                    var CashRefundAmt = 0;
                    var CardRefundAmt = 0;
                    var OtherRefundAmt = 0;
                    var NetBankingRefundAmt = 0;
                    var UPIRefundAmt = 0;
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
                            NetRefundAmt = usercol[ix].NetRefundAmount;
                        }
                        if (usercol[ix].CashRefundAmount) {
                            CashRefundAmt = usercol[ix].CashRefundAmount;
                        }
                        if (usercol[ix].CardRefundAmount) {
                            CardRefundAmt = usercol[ix].CardRefundAmount;
                        }
                        if (usercol[ix].OtherRefundAmount) {
                            OtherRefundAmt = usercol[ix].OtherRefundAmount;
                        }
                        if (usercol[ix].NetBankingRefundAmount) {
                            NetBankingRefundAmt = usercol[ix].NetBankingRefundAmount;
                        }
                        if (usercol[ix].UPIRefundAmount) {
                            UPIRefundAmt = usercol[ix].UPIRefundAmount;
                        }
                        Key = $scope.UserName;
                        NetRefundAmt = NetRefundAmt;
                        CashRefundAmt = CashRefundAmt;
                        CardRefundAmt = CardRefundAmt;
                        OtherRefundAmt = OtherRefundAmt;
                        NetBankingRefundAmt = NetBankingRefundAmt;
                        UPIRefundAmt = UPIRefundAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.NetRefundAmt = NetRefundAmt;
                            item.Value.CashRefundAmt = CashRefundAmt;
                            item.Value.CardRefundAmt = CardRefundAmt;
                            item.Value.OtherRefundAmt = OtherRefundAmt;
                            item.Value.NetBankingRefundAmt = NetBankingRefundAmt;
                            item.Value.UPIRefundAmt = UPIRefundAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': key,
                            'Value': {
                                'CashAmt': 0.00,
                                'CardAmt': 0.00,
                                'OtherAmt': 0.00,
                                'NetBankingAmt': 0.00,
                                'UPIAmt': 0.00,
                                'NetRefundAmt': NetRefundAmt,
                                'CashRefundAmt': CashRefundAmt,
                                'CardRefundAmt': CardRefundAmt,
                                'OtherRefundAmt': OtherRefundAmt,
                                'NetBankingRefundAmt': NetBankingRefundAmt,
                                'UPIRefundAmt': UPIRefundAmt,
                                'TotalBillAmt': 0.00,
                            }
                        });

                }
                for (var idx in billcollection) {
                    var usercol = billcollection[idx];
                    var Key = '';
                    var TotalBillAmt = 0;
                    // var DueBalance = 0;
                    // var IPSaleAmt = 0;
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
                        // if (usercol[ix].IPSaleAmount) {
                        //     IPSaleAmt = usercol[ix].IPSaleAmount;
                        // }
                        if (usercol[ix].TotalBillAmt) {
                            TotalBillAmt = usercol[ix].TotalBillAmt;
                        }
                        // if (usercol[ix].BalanceDue) {
                        //     DueBalance = usercol[ix].BalanceDue;
                        // }
                        Key = $scope.UserName;
                        // IPSaleAmt = IPSaleAmt;
                        TotalBillAmt = TotalBillAmt;
                        // DueBalance = DueBalance;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            // item.Value.IPSaleAmt = IPSaleAmt;
                            item.Value.TotalBillAmt = TotalBillAmt;
                            // item.Value.DueBalance = DueBalance;
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
                                'NetBankingAmt': 0.00,
                                'UPIAmt': 0.00,
                                'NetRefundAmt': 0.00,
                                'CashRefundAmt': 0.00,
                                'CardRefundAmt': 0.00,
                                'OtherRefundAmt': 0.00,
                                'NetBankingRefundAmt': 0.00,
                                'UPIRefundAmt': 0.00,
                                'TotalBillAmt': TotalBillAmt,
                            }
                        });

                }


                for (var idx in $scope.UserCollection) {
                    var Key = '';
                    var TotalBillAmt = 0;
                    // var DueBalance = 0;
                    // var DueCollectAmt = 0;
                    var NetRefundAmt = 0;
                    var CashAmt = 0;
                    var CashRefundAmt = 0;
                    var NetCash = 0;
                    var CardAmt = 0;
                    var CardRefundAmt = 0;
                    var NetCard = 0;
                    var OtherAmt = 0;
                    var OtherRefundAmt = 0;
                    var NetOther = 0;
                    var NetBankingAmt = 0;
                    var NetBankingRefundAmt = 0;
                    var NetNetBanking = 0;
                    var UPIAmt = 0;
                    var UPIRefundAmt = 0;
                    var NetUPI = 0;
                    var CashCollection = 0;
                    var Refund = 0;
                    var NetCollection = 0;

                    var collectiondetails = $scope.UserCollection[idx];
                    var usercollect = {
                        Key: collectiondetails.Key,
                        TotalBillAmt: collectiondetails.Value.TotalBillAmt,
                        // DueBalance: collectiondetails.Value.DueBalance,
                        // DueCollectAmt: collectiondetails.Value.DueCollectAmt,
                        CashAmt: collectiondetails.Value.CashAmt,
                        CashRefundAmt: collectiondetails.Value.CashRefundAmt,
                        NetCash: (collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt),
                        CardAmt: collectiondetails.Value.CardAmt,
                        CardRefundAmt: collectiondetails.Value.CardRefundAmt,
                        NetCard: (collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt),
                        OtherAmt: collectiondetails.Value.OtherAmt,
                        OtherRefundAmt: collectiondetails.Value.OtherRefundAmt,
                        NetOther: (collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt),
                        NetBankingAmt: collectiondetails.Value.NetBankingAmt,
                        NetBankingRefundAmt: collectiondetails.Value.NetBankingRefundAmt,
                        NetNetBanking: (collectiondetails.Value.NetBankingAmt) - (collectiondetails.Value.NetBankingRefundAmt),
                        UPIAmt: collectiondetails.Value.UPIAmt,
                        UPIRefundAmt: collectiondetails.Value.UPIRefundAmt,
                        NetUPI: (collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIRefundAmt),
                        CashCollection: ((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)),
                        Refund: (collectiondetails.Value.CashRefundAmt) + (collectiondetails.Value.CardRefundAmt) + (collectiondetails.Value.OtherRefundAmt),
                        NetCollection: (((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)) + ((collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt))
                            + ((collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt)) +
                            ((collectiondetails.Value.NetBankingAmt) - (collectiondetails.Value.NetBankingRefundAmt))+
                            ((collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIRefundAmt))),
                    };
                    $scope.NetUserCollection.push(usercollect);
                }
            }
            var TotCash = 0;
            var TotCard = 0;
            var TotOther = 0;
            var TotNetBanking = 0;
            var TotUPI = 0;
            var TotalCollection = 0;
            for (var jdx in $scope.NetUserCollection) {
                var netcollection = $scope.NetUserCollection[jdx];
                TotCash = TotCash + (netcollection.NetCash || 0);
                TotCard = TotCard + (netcollection.NetCard || 0);
                TotOther = TotOther + (netcollection.NetOther || 0);
                TotNetBanking = TotNetBanking + (netcollection.NetNetBanking || 0);
                TotUPI = TotUPI + (netcollection.NetUPI || 0);
                TotalCollection = TotalCollection + (netcollection.NetCollection || 0);
            }
            $scope.TotCash = TotCash;
            $scope.TotCard = TotCard;
            $scope.TotOther = TotOther;
            $scope.TotNetBanking = TotNetBanking;
            $scope.TotUPI = TotUPI;
            $scope.TotalCollection = TotalCollection;
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

            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    UserId: $scope.currentfilter.UserId || 0,
                },
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetIPBillingCollectionSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetBillingCollectionOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    UserId: $scope.currentfilter.UserId || 0,
                }
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintIPCollectionSummaryCashier',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
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
                    PageSize: -1,
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
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.UserId = 0;
                $scope.GetPharmacyOptions();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.ipinvoicebillingreport')
        };


        // $scope.LoadDashboard = function () {
        //     $scope.GetPharmacyOptions();
        // }

        // $scope.LoadDashboard();
    }
    IPCollectionSummaryByCashierController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();