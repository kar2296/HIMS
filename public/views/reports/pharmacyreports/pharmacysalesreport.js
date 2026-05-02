(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacysalesreportController', pharmacysalesreportController);

    function pharmacysalesreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {
            StoreMasterId: -1
        };
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = -1;
        // $scope.currentfilter.UserId = utl.Session.getCurrentUserId();
        $scope.lookup = {};
        $scope.PaymentOPSales = [];
        $scope.PaymentOPDueCollections = [];
        $scope.PaymentOPAdvanceCollections = [];
        $scope.PaymentOPReturn = [];

        $scope.PatientBills = false;
        $scope.PatientDueCollections = false;
        $scope.PatientAdvanceCollections = false;
        $scope.PatientReturns = false;

        $scope.TotCash = 0;
        $scope.TotCard = 0;
        $scope.TotChequeOthers = 0;
        $scope.TotSales = 0;

        $scope.TotCashDue = 0;
        $scope.TotCardDue = 0;
        $scope.TotChequeOthersDue = 0;
        $scope.TotDues = 0;

        $scope.TotCashAdvance = 0;
        $scope.TotCardAdvance = 0;
        $scope.TotChequeOthersAdvance = 0;
        $scope.TotAdvances = 0;

        $scope.TotCashReturn = 0;
        $scope.TotCardReturn = 0;
        $scope.TotChequeOthersReturn = 0;
        $scope.TotReturn = 0;


        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.getSaleWithReturnListCallback = function (scope, res, options, hasError) {
            $scope.PharSalewithReturns = [];
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBills = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientBill = res.Data[idx];
                    var billDt = PatientBill.BillDateTime;
                    var billnumber = PatientBill.BillNumber;
                    var PatientName = '';
                    var mrn = '';
                    var Billedby = '';
                    var Billamount = PatientBill.BillAmount;
                    var Discount = PatientBill.BillDiscount;
                    var RoundOff = PatientBill.RoundOffValue;
                    var PaidAmount = PatientBill.PaidAmount;
                    var NetSales = 0;
                    var ReturnAmount = 0;
                    var ReturnRoundOff = 0;
                    if (PatientBill.CreatedUser && PatientBill.CreatedUser.Title && PatientBill.CreatedUser.Title.Description)
                        Billedby += PatientBill.CreatedUser.Title.Description;

                    if (PatientBill.CreatedUser && PatientBill.CreatedUser.FirstName)
                        Billedby += ' ' + PatientBill.CreatedUser.FirstName;

                    if (PatientBill.CreatedUser && PatientBill.CreatedUser.LastName)
                        Billedby += ' ' + PatientBill.CreatedUser.LastName;

                    if (PatientBill.Patient && PatientBill.Patient.Title && PatientBill.Patient.Title.Description)
                        PatientName += PatientBill.Patient.Title.Description;

                    if (PatientBill.Patient && PatientBill.Patient.FirstName)
                        PatientName += ' ' + PatientBill.Patient.FirstName;

                    if (PatientBill.Patient && PatientBill.Patient.LastName)
                        PatientName += ' ' + PatientBill.Patient.LastName;

                    if (PatientBill.Patient && PatientBill.Patient.MRN)
                        mrn = PatientBill.Patient.MRN;

                    if (!PatientName) {
                        PatientName = PatientBill.PatientName;
                    }
                    NetSales = (parseFloat(Billamount) - parseFloat(Discount || 0)) + parseFloat(RoundOff);
                    if (PatientBill.PatientReturns.length > 0) {
                        for (var rdx in PatientBill.PatientReturns) {
                            var patreturns = PatientBill.PatientReturns[rdx];
                            ReturnAmount += patreturns.ReturnAmount;
                            ReturnRoundOff += patreturns.RoundOff;
                        }
                    }

                    let pharmacydetails = {
                        BillDate: billDt,
                        Billnumber: billnumber,
                        PatientName: PatientName,
                        Mrn: mrn,
                        Billedby: Billedby,
                        Billamount: Billamount,
                        Discount: Discount,
                        RoundOff: RoundOff,
                        PaidAmount: PaidAmount,
                        NetSales: NetSales,
                        ReturnAmount: ReturnAmount,
                        ReturnRoundOff: ReturnRoundOff,
                    };
                    $scope.PharSalewithReturns.push(pharmacydetails);
                }
            }
        };

        $scope.getSalesCollectionCallBack = function (scope, res, options, hasError) {
            $scope.SalesCollection = res
            $scope.TotSalesCash = 0;
            $scope.TotSalesCard = 0;
            $scope.TotSalesOther = 0;
            $scope.TotSalesUPI = 0;
            $scope.AllSalesTotal = 0;

            var totSalesCash = 0;
            var totSalesCard = 0;
            var totSalesOther = 0;
            var totSalesUPI = 0;
            var allSalesTotal = 0;

            for (var idx in $scope.SalesCollection) {
                var salescollect = $scope.SalesCollection[idx];
                totSalesCash = parseFloat(totSalesCash) + parseFloat(salescollect.Value.CashAmount || 0);
                totSalesCard = parseFloat(totSalesCard) + parseFloat(salescollect.Value.CardAmount || 0);
                totSalesOther = parseFloat(totSalesOther) + parseFloat(salescollect.Value.OtherAmount || 0);
                totSalesUPI = parseFloat(totSalesUPI) + parseFloat(salescollect.Value.UPIAmount || 0);
                allSalesTotal = parseFloat(allSalesTotal) + parseFloat(salescollect.Value.BillAmount || 0);
            }

            $scope.TotSalesCash = totSalesCash.toFixed(2);
            $scope.TotSalesCard = totSalesCard.toFixed(2);
            $scope.TotSalesOther = totSalesOther.toFixed(2);
            $scope.TotSalesUPI = totSalesUPI.toFixed(2);
            $scope.AllSalesTotal = allSalesTotal.toFixed(2);

        }
        $scope.getSalesCollection = function () {
            var From = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId:$scope.currentfilter.StoreMasterId
                },
            };

            var options = {
                action: 'billing/PatientPaymentDetails/GetPharmacySalesCollections',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSalesCollectionCallBack
            };
            utl.Http.doAction(options);
        }
        $scope.getReturnCollectionCallBack = function (scope, res, options, hasError) {
            $scope.ReturnCollection = res
            $scope.TotReturnCash = 0;
            $scope.TotReturnCard = 0;
            $scope.TotReturnOther = 0;
            $scope.TotReturnUPI = 0;
            $scope.AllReturnTotal = 0;

            var totReturnCash = 0;
            var totReturnCard = 0;
            var totReturnOther = 0;
            var totReturnUPI = 0;
            var allReturnTotal = 0;

            for (var idx in $scope.ReturnCollection) {
                var returncollect = $scope.ReturnCollection[idx];
                totReturnCash = parseFloat(totReturnCash) + parseFloat(returncollect.Value.CashAmount || 0);
                totReturnCard = parseFloat(totReturnCard) + parseFloat(returncollect.Value.CardAmount || 0);
                totReturnOther = parseFloat(totReturnOther) + parseFloat(returncollect.Value.OtherAmount || 0);
                totReturnUPI = parseFloat(totReturnUPI) + parseFloat(returncollect.Value.UPIAmount || 0);
                allReturnTotal = parseFloat(allReturnTotal) + parseFloat(returncollect.Value.BillAmount || 0);
            }

            $scope.TotReturnCash = totReturnCash.toFixed(2);
            $scope.TotReturnCard = totReturnCard.toFixed(2);
            $scope.TotReturnOther = totReturnOther.toFixed(2);
            $scope.TotReturnUPI = totReturnUPI.toFixed(2);
            $scope.AllReturnTotal = allReturnTotal.toFixed(2);

        }
        $scope.getReturnCollection = function () {
            var From = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId:$scope.currentfilter.StoreMasterId
                },
            };

            var options = {
                action: 'billing/patientrefund/GetPharmacyReturnCollections',
                data: inputData,
                type: 'post',
                onComplete: $scope.getReturnCollectionCallBack
            };
            utl.Http.doAction(options);
        }


        $scope.getSaleWithReturnList = function () {
            var inputData = {
                Params: [{
                        Key: 6,
                        Value: [4, 6]
                    }, {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 21,
                        Value: true
                    },
                    // {
                    //     Key: 39,
                    //     Value: $scope.currentfilter.UserId
                    // },
                    {
                        Key: 29,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    // {
                    //     Key: 41,
                    //     Value: $scope.currentfilter.PaymentTypeId
                    // },
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };

            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 68,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 69,
                    Value: $scope.currentfilter.ToBillDate
                });
            }

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSaleWithReturnListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromBillDate);
            var endTime = new Date($scope.currentfilter.ToBillDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromBillDate = new Date();
                $scope.currentfilter.ToBillDate = new Date();
                return false;
            }
            $scope.getSaleWithReturnList();
            $scope.getSalesCollection();
            $scope.getReturnCollection();
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.UserId = -1;
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'invoicecollectionreport') {
                $state.go('app.pharmacytabreport.invoicecollectionreport');
            }
            if ($scope.Context == 'pharmacyreport') {
                $state.go('app.financereporttab.pharmacyreport');
            }

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
        $scope.print = function () {
            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.FromBillDate,
                    ToDate: $scope.currentfilter.ToBillDate,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId,
                    UserId: $scope.currentfilter.UserId,
                    StoreMaster: $scope.currentfilter.StoreMaster,
                    UserName: $scope.currentfilter.UserName,
                },
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 33,
                    Value: 4
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintPharmacyCollectionAllCashier',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
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

        // $scope.initLookup = function () {
        //     $scope.lookup.PaymentType.push({ Id: -1, Text: "Please Select" });
        //     $scope.lookup.PaymentType.push({ Id: 1, Text: "CASH" });
        //     $scope.lookup.PaymentType.push({ Id: 2, Text: "CARD" });
        //     $scope.lookup.PaymentType.push({ Id: 3, Text: "OTHERS" });
        //     $scope.getList();
        // };

        $scope.initLookup();
    }

    pharmacysalesreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();