(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OverallCollectionCashierController', OverallCollectionCashierController);

    function OverallCollectionCashierController($scope, $filter, $stateParams, $state, $translate, utl) {
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
                var doctorshare = [];
                if ($scope.BillingCollection.length > 0) {
                    billusercollection = $scope.BillingCollection[0].Value;
                }
                if ($scope.BillingCollection.length > 1) {
                    billuserrefund = $scope.BillingCollection[1].Value;
                }
                if ($scope.BillingCollection.length > 2) {
                    billcollection = $scope.BillingCollection[2].Value;
                }
                if ($scope.BillingCollection.length > 3) {
                    doctorshare = $scope.BillingCollection[3].Value;
                }
                for (var idx in billusercollection) {
                    var usercol = billusercollection[idx];
                    var Key = '';
                    var CashAmt = 0;
                    var CardAmt = 0;
                    var OtherAmt = 0;
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
                        Key = $scope.UserName;
                        CashAmt = CashAmt;
                        CardAmt = CardAmt;
                        OtherAmt = OtherAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': CashAmt,
                            'CardAmt': CardAmt,
                            'OtherAmt': OtherAmt,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
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
                        Key = $scope.UserName;
                        NetRefundAmt = NetRefundAmt;
                        CashRefundAmt = CashRefundAmt;
                        CardRefundAmt = CardRefundAmt;
                        OtherRefundAmt = OtherRefundAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.NetRefundAmt = NetRefundAmt;
                            item.Value.CashRefundAmt = CashRefundAmt;
                            item.Value.CardRefundAmt = CardRefundAmt;
                            item.Value.OtherRefundAmt = OtherRefundAmt;
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
                                'NetRefundAmt': NetRefundAmt,
                                'CashRefundAmt': CashRefundAmt,
                                'CardRefundAmt': CardRefundAmt,
                                'OtherRefundAmt': OtherRefundAmt,
                                'TotalBillAmt': 0.00,
                            }
                        });

                }
                for (var idx in billcollection) {
                    var usercol = billcollection[idx];
                    var Key = '';
                    var TotalBillAmt = 0;
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
                        if (usercol[ix].TotalBillAmt) {
                            TotalBillAmt = usercol[ix].TotalBillAmt;
                        }
                        Key = $scope.UserName;
                        TotalBillAmt = TotalBillAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.TotalBillAmt = TotalBillAmt;
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
                                'NetRefundAmt': 0.00,
                                'CashRefundAmt': 0.00,
                                'CardRefundAmt': 0.00,
                                'OtherRefundAmt': 0.00,
                                'TotalBillAmt': TotalBillAmt,
                            }
                        });

                }
                for (var idx in doctorshare) {
                    var usercol = doctorshare[idx];
                    var Key = '';
                    var DocAmt = 0;
                    var DocCashAmt = 0;
                    var DocCardAmt = 0;
                    var DocOtherAmt = 0;
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
                        if (usercol[ix].CashVocAmt) {
                            DocCashAmt = usercol[ix].CashVocAmt;
                        }
                        if (usercol[ix].OtherVocAmt) {
                            DocOtherAmt = usercol[ix].OtherVocAmt;
                        }
                        Key = $scope.UserName;
                        DocCashAmt = DocCashAmt;
                        DocOtherAmt = DocOtherAmt;
                    }
                    var valappended = 0;
                    $scope.UserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.Value.DocCashAmt = DocCashAmt;
                            item.Value.DocOtherAmt = DocOtherAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.UserCollection.push({
                            'Key': Key,
                            'Value': {
                                'DocCashAmt': DocCashAmt,
                                'DocOtherAmt': DocOtherAmt
                            }
                        });

                }

                for (var idx in $scope.UserCollection) {
                    var Key = '';
                    var TotalBillAmt = 0;
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
                    var CashCollection = 0;
                    var Refund = 0;
                    var NetCollection = 0;
                    var OverallCollection = 0;

                    var collectiondetails = $scope.UserCollection[idx];
                    var usercollect = {
                        Key: collectiondetails.Key,
                        TotalBillAmt: collectiondetails.Value.TotalBillAmt,
                        CashAmt: collectiondetails.Value.CashAmt,
                        CashRefundAmt: collectiondetails.Value.CashRefundAmt,
                        NetCash: (collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt),
                        CardAmt: collectiondetails.Value.CardAmt,
                        CardRefundAmt: collectiondetails.Value.CardRefundAmt,
                        NetCard: (collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt),
                        OtherAmt: collectiondetails.Value.OtherAmt,
                        OtherRefundAmt: collectiondetails.Value.OtherRefundAmt,
                        NetOther: (collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt),
                        CashCollection: ((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)),
                        Refund: (collectiondetails.Value.CashRefundAmt) + (collectiondetails.Value.CardRefundAmt) + (collectiondetails.Value.OtherRefundAmt),
                        NetCollection: (((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)) + ((collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt))
                            + ((collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt))),
                        DocCashAmt: collectiondetails.Value.DocCashAmt,
                        DocOtherAmt: collectiondetails.Value.DocOtherAmt,
                        DocAmt: (collectiondetails.Value.DocCashAmt + collectiondetails.Value.DocOtherAmt),
                        OverallCollection: (((collectiondetails.Value.CashAmt || 0) - (collectiondetails.Value.CashRefundAmt || 0)) + ((collectiondetails.Value.CardAmt || 0) - (collectiondetails.Value.CardRefundAmt || 0))
                            + ((collectiondetails.Value.OtherAmt || 0) - (collectiondetails.Value.OtherRefundAmt || 0))) - ((collectiondetails.Value.DocCashAmt || 0) + (collectiondetails.Value.DocOtherAmt || 0)),
                    };
                    $scope.NetUserCollection.push(usercollect);
                }
            }

            var TotCashAmt = 0;
            var TotCardAmt = 0;
            var TotOtherAmt = 0;
            var TotCollectionAmt = 0;
            var TotalDocCashAmt = 0;
            var TotalDocOtherAmt = 0;
            var TotalDocAmt = 0;
            var TotalNetCollection = 0;

            for (var jdx in $scope.NetUserCollection) {
                var netcollection = $scope.NetUserCollection[jdx];
                TotCashAmt = TotCashAmt + (netcollection.NetCash || 0);
                TotCardAmt = TotCardAmt + (netcollection.NetCard || 0);
                TotOtherAmt = TotOtherAmt + (netcollection.NetOther || 0);
                TotCollectionAmt = TotCollectionAmt + (netcollection.NetCollection || 0);
                TotalDocCashAmt = TotalDocCashAmt + (netcollection.DocCashAmt || 0);
                TotalDocOtherAmt = TotalDocOtherAmt + (netcollection.DocOtherAmt || 0);
                TotalDocAmt = TotalDocAmt + (netcollection.DocAmt || 0);
                TotalNetCollection = TotalNetCollection + (netcollection.OverallCollection || 0);
            }
            $scope.TotCashAmt = TotCashAmt;
            $scope.TotCardAmt = TotCardAmt;
            $scope.TotOtherAmt = TotOtherAmt;
            $scope.TotCollectionAmt = TotCollectionAmt;
            $scope.TotalDocCashAmt = TotalDocCashAmt;
            $scope.TotalDocOtherAmt = TotalDocOtherAmt;
            $scope.TotalDocAmt = TotalDocAmt;
            $scope.TotalNetCollection = TotalNetCollection;

            $scope.OverallCollection = $scope.TotCollectionAmt - $scope.TotalDocAmt;
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
                action: 'Billing/PatientPaymentDetails/GetOverallCollectionCashier',
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
                action: 'billing/PatientPaymentDetails/PrintOverallCollectionSummaryCashier',
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
                    { Key: 5, Value: 2 }
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
                item.DoctorName = item.FirstName; 
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.GetPharmacyOptions();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.opinvoicebillingreport')
        };


        // $scope.LoadDashboard = function () {
        //     $scope.GetPharmacyOptions();
        // }

        // $scope.LoadDashboard();
    }
    OverallCollectionCashierController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();