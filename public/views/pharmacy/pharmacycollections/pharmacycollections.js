(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacycollectionsController', pharmacycollectionsController);

    function pharmacycollectionsController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = utl.Session.getCurrentUserId();

        $scope.PaymentOPSales = [];
        $scope.PaymentOPDueCollections = [];
        $scope.PaymentOPReturn = [];

        $scope.PatientBills = false;
        $scope.PatientDueCollections = false;
        $scope.PatientReturns = false;

        $scope.TotCash = 0;
        $scope.TotCard = 0;
        $scope.TotChequeOthers = 0;
        $scope.TotSales = 0;

        $scope.TotCashDue = 0;
        $scope.TotCardDue = 0;
        $scope.TotChequeOthersDue = 0;
        $scope.TotDues = 0;

        $scope.TotCashReturn = 0;
        $scope.TotCardReturn = 0;
        $scope.TotChequeOthersReturn = 0;
        $scope.TotReturn = 0;

        /*
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
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
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            if (selectedItem && selectedItem.Id)
                $scope.currentfilter.UserId = selectedItem.Id;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 2, Value: utl.Session.getCurrentFacilityId() },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
            }
        }
        */

        $scope.getOPReturnListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPReturn = [];
            $scope.TotCashReturn = 0;
            $scope.TotCardReturn = 0;
            $scope.TotChequeOthersReturn = 0;
            $scope.TotReturn = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientReturns = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientReturnBill = res.Data[idx];
                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientReturnBill.CreatedBy) {
                        var returnDt = PatientReturnBill.ReturnDateTime;
                        var returnnumber = PatientReturnBill.ReturnNumber;
                        var billDt = null;
                        var billnumber = '';
                        var drname = '';
                        if (PatientReturnBill.PatientBill) {
                            billDt = PatientReturnBill.PatientBill.BillDateTime;
                            billnumber = PatientReturnBill.PatientBill.BillNumber;
                        }
                        var PatientName = '';
                        var Status = '';
                        var Cash = 0;
                        var Card = 0;
                        var ChequeOthers = 0;

                        if (PatientReturnBill.PatientReturnStatus && PatientReturnBill.PatientReturnStatus.Description) {
                            Status = PatientReturnBill.PatientReturnStatus.Description;
                        }

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.Title && PatientReturnBill.Patient.Title.Description)
                            PatientName += PatientReturnBill.Patient.Title.Description;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.FirstName)
                            PatientName += ' ' + PatientReturnBill.Patient.FirstName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.LastName)
                            PatientName += ' ' + PatientReturnBill.Patient.LastName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.MRN)
                            PatientName += ' ' + PatientReturnBill.Patient.MRN;

                        if (!PatientName)
                            PatientName = PatientReturnBill.PatientName;

                        if (PatientReturnBill.User && PatientReturnBill.User.Title && PatientReturnBill.User.Title.Description)
                            drname += PatientReturnBill.User.Title.Description;

                        if (PatientReturnBill.User && PatientReturnBill.User.FirstName)
                            drname += ' ' + PatientReturnBill.User.FirstName;

                        if (PatientReturnBill.User && PatientReturnBill.User.LastName)
                            drname += ' ' + PatientReturnBill.User.LastName;

                        Cash = PatientReturnBill.ReturnAmount;
                        $scope.TotCashReturn += PatientReturnBill.ReturnAmount;
                        $scope.TotReturn += PatientReturnBill.ReturnAmount;

                        if ($scope.TotCashReturn > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReturnDt: returnDt,
                                Returnnumber: returnnumber,
                                BillNumber: billnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                Status: Status,
                                MBillType: 2
                            };
                            SNo++;
                            $scope.PaymentOPReturn.push(PaymentCollectionModel);
                        }
                    }
                }
            }

            try {
                $scope.TotCashReturn = ($scope.TotCashReturn).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCardReturn = ($scope.TotCardReturn).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthersReturn = ($scope.TotChequeOthersReturn).toFixed(2);
            } catch (e) { }
            $scope.NetReturn = parseInt($scope.TotCashReturn);
            $scope.TotCardReturn = parseInt($scope.TotCardReturn);
            $scope.TotChequeOthersReturn = parseInt($scope.TotChequeOthersReturn);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getOPReturnList = function () {
            var inputData = {
                Params: [
                    { Key: 23, Value: [1, 2, 3, 4, 5] },
                    { Key: 4, Value: 3 },
                    {
                        Key: 22,
                        Value: $scope.currentfilter.UserId
                    },],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
            };

            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 24,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 25,
                    Value: $scope.currentfilter.ToBillDate
                });
            }

            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPReturnListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getOPSalesDueCollectionListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDueCollections = [];
            $scope.TotCashDue = 0;
            $scope.TotCardDue = 0;
            $scope.TotChequeOthersDue = 0;
            $scope.TotDues = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientDueCollections = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientDue = res.Data[idx];
                    var receiptDt = PatientDue.ReceiptDateTime;
                    var receiptnumber = PatientDue.ReceiptNumber;
                    var billnumber = '';
                    if (PatientDue.PatientBill) {
                        billnumber = PatientDue.PatientBill.BillNumber;
                    }
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;

                    if (PatientDue.User && PatientDue.User.Title && PatientDue.User.Title.Description)
                        drname += PatientDue.User.Title.Description;

                    if (PatientDue.User && PatientDue.User.FirstName)
                        drname += ' ' + PatientDue.User.FirstName;

                    if (PatientDue.User && PatientDue.User.LastName)
                        drname += ' ' + PatientDue.User.LastName;


                    if (PatientDue.Patient && PatientDue.Patient.Title && PatientDue.Patient.Title.Description)
                        PatientName += PatientDue.Patient.Title.Description;

                    if (PatientDue.Patient && PatientDue.Patient.FirstName)
                        PatientName += ' ' + PatientDue.Patient.FirstName;

                    if (PatientDue.Patient && PatientDue.Patient.LastName)
                        PatientName += ' ' + PatientDue.Patient.LastName;

                    if (PatientDue.Patient && PatientDue.Patient.MRN)
                        PatientName += ' ' + PatientDue.Patient.MRN;

                    if (!PatientName)
                        PatientName = PatientDue.PatientName;

                    if (PatientDue.ReceiptTypeId == 3 && PatientDue.PatientBill) {
                        if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientDue.CreatedBy) {
                            if (PatientDue.PaymentTypeId == 1 && PatientDue.ReceiptStatusId == 1) {
                                Cash = PatientDue.AmountPaid;
                                $scope.TotCashDue += PatientDue.AmountPaid;
                                $scope.TotDues += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6 && PatientDue.ReceiptStatusId == 1) {
                                Card = PatientDue.AmountPaid;
                                $scope.TotCardDue += PatientDue.AmountPaid;
                                $scope.TotDues += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId == 2 && PatientDue.PaymentTypeId == 3 && PatientDue.PaymentTypeId == 4 && PatientDue.ReceiptStatusId == 1) {
                                ChequeOthers = PatientDue.AmountPaid;
                                $scope.TotChequeOthersDue += PatientDue.AmountPaid;
                                $scope.TotDues += PatientDue.AmountPaid;
                            }

                            if (PatientDue.ReceiptStatus && PatientDue.ReceiptStatus.Description) {
                                Status = PatientDue.ReceiptStatus.Description;
                            }

                            if (PatientDue.PaymentTypeId == 1) { // CASH
                                Card = 0;
                                ChequeOthers = 0;
                                //$scope.TotCardDue = 0; 
                                //$scope.TotChequeOthersDue = 0;
                            } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6) { //CARD
                                Cash = 0;
                                ChequeOthers = 0;
                                //$scope.TotCashDue = 0; 
                                //$scope.TotChequeOthersDue = 0;
                            } else if (PatientDue.PaymentTypeId == 2 || PatientDue.PaymentTypeId == 3 || PatientDue.PaymentTypeId == 4) { // CHEQUE
                                Cash = 0;
                                Card = 0;
                                //$scope.TotCashDue = 0; 
                                //$scope.TotCardDue = 0;
                            }

                            if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                                //$scope.TotDues += (Cash + Card + ChequeOthers);
                                let PaymentCollectionModel = {
                                    SNo: SNo,
                                    ReceiptDt: receiptDt,
                                    Receiptnumber: receiptnumber,
                                    Billnumber: billnumber,
                                    Drname: drname,
                                    PatientName: PatientName,
                                    Cash: Cash,
                                    Card: Card,
                                    ChequeOthers: ChequeOthers,
                                    Status: Status,
                                    MBillType: 1,
                                };
                                SNo++;
                                $scope.PaymentOPDueCollections.push(PaymentCollectionModel);
                            }
                        }
                    }
                }
            }

            try {
                $scope.TotCashDue = ($scope.TotCashDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCardDue = ($scope.TotCardDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthersDue = ($scope.TotChequeOthersDue).toFixed(2);
            } catch (e) { }

        };
        $scope.getOPSalesDueCollectionList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 3 },
                    { Key: 5, Value: 1 },
                    { Key: 23, Value: $scope.currentfilter.PaymentTypeId },
                    { Key: 19, Value: $scope.currentfilter.UserId }
                    // { Key: 20, Value: 1 }
                ],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
            };

            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 27,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 28,
                    Value: $scope.currentfilter.ToBillDate
                });
            }

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPSalesDueCollectionListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getOPSalesListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPSales = [];
            $scope.TotCash = 0;
            $scope.TotCard = 0;
            $scope.TotChequeOthers = 0;
            $scope.TotSales = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBills = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientBill = res.Data[idx];
                    var billDt = PatientBill.BillDateTime;
                    var billnumber = PatientBill.BillNumber;
                    var receiptnumber = '';
                    var doctorid = PatientBill.DoctorId;
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;

                    var ChequeOthers = 0;
                    if (PatientBill.User && PatientBill.User.Title && PatientBill.User.Title.Description)
                        drname += PatientBill.User.Title.Description;

                    if (PatientBill.User && PatientBill.User.FirstName)
                        drname += ' ' + PatientBill.User.FirstName;

                    if (PatientBill.User && PatientBill.User.LastName)
                        drname += ' ' + PatientBill.User.LastName;

                    if (PatientBill.Patient && PatientBill.Patient.Title && PatientBill.Patient.Title.Description)
                        PatientName += PatientBill.Patient.Title.Description;

                    if (PatientBill.Patient && PatientBill.Patient.FirstName)
                        PatientName += ' ' + PatientBill.Patient.FirstName;

                    if (PatientBill.Patient && PatientBill.Patient.LastName)
                        PatientName += ' ' + PatientBill.Patient.LastName;

                    if (PatientBill.Patient && PatientBill.Patient.MRN)
                        PatientName += ' ' + PatientBill.Patient.MRN;

                    if (!PatientName)
                        PatientName = PatientBill.PatientName;

                    for (var payidx in PatientBill.PatientPaymentDetails) {
                        var PatientPaymentDetail = PatientBill.PatientPaymentDetails[payidx];
                        receiptnumber = PatientPaymentDetail.ReceiptNumber;
                        if (PatientPaymentDetail.ReceiptTypeId == 2) {
                            if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientPaymentDetail.CreatedBy) {
                                if (PatientPaymentDetail.PaymentTypeId == 1 && PatientPaymentDetail.ReceiptStatusId == 1) {
                                    Cash = PatientPaymentDetail.AmountPaid;
                                    $scope.TotCash += PatientPaymentDetail.AmountPaid;
                                    $scope.TotSales += PatientPaymentDetail.AmountPaid;
                                } else if ((PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) && PatientPaymentDetail.ReceiptStatusId == 1) {
                                    Card = PatientPaymentDetail.AmountPaid;
                                    $scope.TotCard += PatientPaymentDetail.AmountPaid;
                                    $scope.TotSales += PatientPaymentDetail.AmountPaid;
                                } else if ((PatientPaymentDetail.PaymentTypeId == 2 || PatientPaymentDetail.PaymentTypeId == 3 || PatientPaymentDetail.PaymentTypeId == 4) && PatientPaymentDetail.ReceiptStatusId == 1) {
                                    ChequeOthers = PatientPaymentDetail.AmountPaid;
                                    $scope.TotChequeOthers += PatientPaymentDetail.AmountPaid;
                                    $scope.TotSales += PatientPaymentDetail.AmountPaid;
                                }

                                if (PatientPaymentDetail.ReceiptStatus && PatientPaymentDetail.ReceiptStatus.Description) {
                                    Status = PatientPaymentDetail.ReceiptStatus.Description;
                                }

                                if (PatientPaymentDetail.PaymentTypeId == 1) { // CASH
                                    Card = 0;
                                    ChequeOthers = 0;
                                    //$scope.TotCard = 0; 
                                    //$scope.TotChequeOthers = 0;
                                } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) { //CARD
                                    Cash = 0;
                                    ChequeOthers = 0;
                                    //$scope.TotCash = 0; 
                                    //$scope.TotChequeOthers = 0;
                                } else if (PatientPaymentDetail.PaymentTypeId == 2 || PatientPaymentDetail.PaymentTypeId == 3 || PatientPaymentDetail.PaymentTypeId == 4) { // CHEQUE
                                    Cash = 0;
                                    Card = 0;
                                    //$scope.TotCash = 0; 
                                    //$scope.TotCard = 0;
                                }

                                if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                                    //$scope.TotSales += (Cash + Card + ChequeOthers);
                                    let PaymentCollectionModel = {
                                        SNo: SNo,
                                        BillDt: billDt,
                                        Billnumber: billnumber,
                                        Receiptnumber: receiptnumber,
                                        Drname: drname,
                                        PatientName: PatientName,
                                        Cash: Cash,
                                        Card: Card,
                                        ChequeOthers: ChequeOthers,
                                        Status: Status,
                                        MBillType: 1,
                                    };
                                    SNo++;
                                    $scope.PaymentOPSales.push(PaymentCollectionModel);
                                }
                            }
                        }
                    }
                }
            }

            try {
                $scope.TotCash = ($scope.TotCash).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCard = ($scope.TotCard).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthers = ($scope.TotChequeOthers).toFixed(2);
            } catch (e) { }

            $scope.NetCash = (parseInt($scope.TotCash) + parseInt($scope.TotCashDue));
            $scope.NetCard = (parseInt($scope.TotCard) + parseInt($scope.TotCardDue));
            $scope.NetCheque = (parseInt($scope.TotChequeOthers) + parseInt($scope.TotChequeOthersDue));

        };

        $scope.getOPSalesList = function () {
            var inputData = {
                Params: [{ Key: 6, Value: 4 }, { Key: 4, Value: 3 },
                { Key: 21, Value: true },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                { Key: 41, Value: $scope.currentfilter.PaymentTypeId }],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
            };

            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 17,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 18,
                    Value: $scope.currentfilter.ToBillDate
                });
            }

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPSalesListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList = function () {
            //var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:00');
            //var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:59');

            var startTime = new Date($scope.currentfilter.FromBillDate);
            var endTime = new Date($scope.currentfilter.ToBillDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            if (!(resultInHours >= 0 && resultInHours < 72)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
                $scope.currentfilter.FromBillDate = new Date();
                $scope.currentfilter.ToBillDate = new Date();
                return false;
            } else {
                $scope.getOPSalesList();
                $scope.getOPSalesDueCollectionList();
                $scope.getOPReturnList();
            }
        };

        $scope.initLookup = function () {
            $scope.lookup.PaymentType.push({ Id: -1, Text: "Please Select" });
            $scope.lookup.PaymentType.push({ Id: 1, Text: "CASH" });
            $scope.lookup.PaymentType.push({ Id: 2, Text: "CARD" });
            $scope.lookup.PaymentType.push({ Id: 3, Text: "OTHERS" });
            $scope.getList();
        };

        $scope.initLookup();
    }

    pharmacycollectionsController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();