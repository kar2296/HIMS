(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('billingcollectionsController', billingcollectionsController);

    function billingcollectionsController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = utl.Session.getCurrentUserId();

        $scope.PaymentOPDGSales = [];
        $scope.PaymentOPDGCancels = [];

        $scope.PatientBills = false;
        $scope.PatientBillCancellations = false;
        $scope.PatientRefunds = false;

        $scope.TotalCashSales = 0;
        $scope.TotalCardSales = 0;
        $scope.TotalChequeOtherSales = 0;
        $scope.TotalSales = 0;

        $scope.TotalCashCancels = 0;
        $scope.TotalCardCancels = 0;
        $scope.TotalChequeOtherCancels = 0;
        $scope.TotalCancels = 0;

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

        $scope.getOPDGRefundsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGRefunds = [];
            $scope.TotalCashRefunds = 0;
            $scope.TotalCardRefunds = 0;
            $scope.TotalChequeOtherRefunds = 0;
            $scope.TotalRefunds = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientRefunds = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientRefund = res.Data[idx];
                    var refundDt = PatientRefund.RefundDateTime;
                    var refundnumber = PatientRefund.RefundIdentifier;
                    var billDt = null;
                    var billnumber = null;
                    var drname = null;
                    var referralName = null;
                    if (PatientRefund.PatientBill) {
                        billDt = PatientRefund.PatientBill.BillDateTime;
                        billnumber = PatientRefund.PatientBill.BillNumber;
                        drname = PatientRefund.PatientBill.DoctorName;
                        if (PatientRefund.PatientBill.Referral)
                            referralName = PatientRefund.PatientBill.Referral.ReferralName;
                    }

                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    if (PatientRefund.Patient && PatientRefund.Patient.Title && PatientRefund.Patient.Title.Description) {
                        PatientName += PatientRefund.Patient.Title.Description;
                    }
                    if (PatientRefund.Patient && PatientRefund.Patient.FirstName) {
                        PatientName += ' ' + PatientRefund.Patient.FirstName;
                    }
                    if (PatientRefund.Patient && PatientRefund.Patient.LastName) {
                        PatientName += ' ' + PatientRefund.Patient.LastName;
                    }
                    if (PatientRefund.Patient && PatientRefund.Patient.MRN) {
                        PatientName += ' ' + PatientRefund.Patient.MRN;
                    }
                    if (!PatientName) {
                        PatientName = PatientRefund.PatientName;
                    }

                    // if ($scope.currentfilter.UserId == -1) {
                    if (PatientRefund.PaymentTypeId == 1 && PatientRefund.RefundStatusId == 1) {
                        Cash = PatientRefund.RefundAmount;
                        $scope.TotalCashRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6 && PatientRefund.RefundStatusId == 1) {
                        Card = PatientRefund.RefundAmount;
                        $scope.TotalCardRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId == 2 || PatientRefund.PaymentTypeId == 3 || PatientRefund.PaymentTypeId == 4 && PatientRefund.RefundStatusId == 1) {
                        ChequeOthers = PatientRefund.RefundAmount;
                        $scope.TotalChequeOtherRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    }

                    if (PatientRefund.RefundStatus && PatientRefund.RefundStatus.Description) {
                        Status = PatientRefund.RefundStatus.Description;
                    }

                    if (PatientRefund.PaymentTypeId == 1) { // CASH
                        Card = 0;
                        ChequeOthers = 0;
                        //$scope.TotalCardRefunds = 0;
                        //$scope.TotalChequeOtherRefunds = 0;
                    } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6) { //CARD
                        Cash = 0;
                        ChequeOthers = 0;
                        //$scope.TotalCashRefunds = 0;
                        //$scope.TotalChequeOtherRefunds = 0;
                    } else if (PatientRefund.PaymentTypeId == 2 || PatientRefund.PaymentTypeId == 3 || PatientRefund.PaymentTypeId == 4) { // CHEQUE
                        Cash = 0;
                        Card = 0;
                        //$scope.TotalCashRefunds = 0;
                        //$scope.TotalCardRefunds = 0;
                    }

                    if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                        //$scope.TotalRefunds += (Cash + Card + ChequeOthers);
                        let PatientRefundModel = {
                            SNo: SNo,
                            BillDt: billDt,
                            Billnumber: billnumber,
                            RefundDt: refundDt,
                            Refundnumber: refundnumber,
                            Drname: drname,
                            ReferralName: referralName,
                            PatientName: PatientName,
                            Cash: Cash,
                            Card: Card,
                            ChequeOthers: ChequeOthers,
                            Status: Status
                        };
                        SNo++;
                        $scope.PaymentOPDGRefunds.push(PatientRefundModel);
                    }
                    // }
                }
            }

            try {
                $scope.TotalCashRefunds = ($scope.TotalCashRefunds).toFixed(2);
            } catch (e) {}
            try {
                $scope.TotalCardRefunds = ($scope.TotalCardRefunds).toFixed(2);
            } catch (e) {}
            try {
                $scope.TotalChequeOtherRefunds = ($scope.TotalChequeOtherRefunds).toFixed(2);
            } catch (e) {}

        };

        $scope.getOPDGRefundsList = function () {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: 1
                    },
                    // {
                    //     Key: 14,
                    //     Value: $scope.currentfilter.UserId
                    // },
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 3,
                    Value: [$scope.currentfilter.FromBillDate, $scope.currentfilter.ToBillDate]
                })
            }
            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDGRefundsListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getOPDGCancelsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGCancels = [];
            $scope.TotalCashCancels = 0;
            $scope.TotalCardCancels = 0;
            $scope.TotalChequeOtherCancels = 0;
            $scope.TotalCancels = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBillCancellations = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientBill = res.Data[idx];
                    var billDt = PatientBill.BillDateTime;
                    var billnumber = PatientBill.BillNumber;
                    var receiptnumber = '';
                    var drname = PatientBill.DoctorName;
                    if (PatientBill.Referral)
                        var referralName = PatientBill.Referral.ReferralName;
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    if (PatientBill.Patient && PatientBill.Patient.Title && PatientBill.Patient.Title.Description) {
                        PatientName += PatientBill.Patient.Title.Description;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.FirstName) {
                        PatientName += ' ' + PatientBill.Patient.FirstName;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.LastName) {
                        PatientName += ' ' + PatientBill.Patient.LastName;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.MRN) {
                        PatientName += ' ' + PatientBill.Patient.MRN;
                    }
                    if (!PatientName) {
                        PatientName = PatientBill.PatientName;
                    }

                    for (var payidx in PatientBill.PatientPaymentDetails) {
                        var PatientPaymentDetail = PatientBill.PatientPaymentDetails[payidx];
                        receiptnumber = PatientPaymentDetail.ReceiptNumber;
                        // if ($scope.currentfilter.UserId == -1) {
                        if (PatientPaymentDetail.PaymentTypeId == 1 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            Cash = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCashCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            Card = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCardCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 2 || PatientPaymentDetail.PaymentTypeId == 3 || PatientPaymentDetail.PaymentTypeId == 4 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            ChequeOthers = PatientPaymentDetail.AmountPaid;
                            $scope.TotalChequeOtherCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        }

                        if (PatientPaymentDetail.ReceiptStatus && PatientPaymentDetail.ReceiptStatus.Description) {
                            Status = PatientPaymentDetail.ReceiptStatus.Description;
                        }

                        if (PatientPaymentDetail.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            //$scope.TotalCardSales = 0;
                            //$scope.TotalChequeOtherSales = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) { //CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            //$scope.TotalCashSales = 0;
                            //$scope.TotalChequeOtherSales = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 2 || PatientPaymentDetail.PaymentTypeId == 3 || PatientPaymentDetail.PaymentTypeId == 4) { // CHEQUE
                            Cash = 0;
                            Card = 0;
                            //$scope.TotalCashSales = 0;
                            //$scope.TotalCardSales = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                            //$scope.TotalCancels += (Cash + Card + ChequeOthers);
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                BillDt: billDt,
                                Billnumber: billnumber,
                                Receiptnumber: receiptnumber,
                                Drname: drname,
                                ReferralName: referralName,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                Status: Status
                            };
                            SNo++;
                            $scope.PaymentOPDGCancels.push(PaymentCollectionModel);
                        }
                        // }

                    }
                }
            }

            try {
                $scope.TotalCashCancels = ($scope.TotalCashCancels).toFixed(2);
            } catch (e) {}
            try {
                $scope.TotalCardCancels = ($scope.TotalCardCancels).toFixed(2);
            } catch (e) {}
            try {
                $scope.TotalChequeOtherCancels = ($scope.TotalChequeOtherCancels).toFixed(2);
            } catch (e) {}

        };

        $scope.getOPDGCancelsList = function () {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 33,
                        Value: [1, 5]
                    },
                    // {
                    //     Key: 39,
                    //     Value: $scope.currentfilter.UserId
                    // }
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };

            //var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            //var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 1,
                    Value: [$scope.currentfilter.FromBillDate, $scope.currentfilter.ToBillDate]
                })
            }
            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDGCancelsListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getOPDGSalesListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGSales = [];
            $scope.TotalCashSales = 0;
            $scope.TotalCardSales = 0;
            $scope.TotChequeOtherSales = 0;
            $scope.TotalSales = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBills = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientBill = res.Data[idx];
                    var billDt = PatientBill.BillDateTime;
                    var billnumber = PatientBill.BillNumber;
                    var receiptnumber = '';
                    var drname = PatientBill.DoctorName;
                    if (PatientBill.Referral)
                        var referralName = PatientBill.Referral.ReferralName;
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    if (PatientBill.Patient && PatientBill.Patient.Title && PatientBill.Patient.Title.Description) {
                        PatientName += PatientBill.Patient.Title.Description;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.FirstName) {
                        PatientName += ' ' + PatientBill.Patient.FirstName;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.LastName) {
                        PatientName += ' ' + PatientBill.Patient.LastName;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.MRN) {
                        PatientName += ' ' + PatientBill.Patient.MRN;
                    }
                    if (!PatientName) {
                        PatientName = PatientBill.PatientName;
                    }

                    for (var payidx in PatientBill.PatientPaymentDetails) {
                        var PatientPaymentDetail = PatientBill.PatientPaymentDetails[payidx];
                        receiptnumber = PatientPaymentDetail.ReceiptNumber;
                        // if ($scope.currentfilter.UserId == -1) {
                        if (PatientPaymentDetail.PaymentTypeId == 1 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            Cash = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCashSales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            Card = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCardSales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 2 || PatientPaymentDetail.PaymentTypeId == 3 || PatientPaymentDetail.PaymentTypeId == 4 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            ChequeOthers = PatientPaymentDetail.AmountPaid;
                            $scope.TotalChequeOtherSales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        }

                        if (PatientPaymentDetail.ReceiptStatus && PatientPaymentDetail.ReceiptStatus.Description) {
                            Status = PatientPaymentDetail.ReceiptStatus.Description;
                        }

                        if (PatientPaymentDetail.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            //$scope.TotalCardSales = 0;
                            //$scope.TotalChequeOtherSales = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) { //CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            //$scope.TotalCashSales = 0;
                            //$scope.TotalChequeOtherSales = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 2 || PatientPaymentDetail.PaymentTypeId == 3 || PatientPaymentDetail.PaymentTypeId == 4) { // CHEQUE
                            Cash = 0;
                            Card = 0;
                            //$scope.TotalCashSales = 0;
                            //$scope.TotalCardSales = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                            //$scope.TotalSales += (Cash + Card + ChequeOthers);
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                BillDt: billDt,
                                Billnumber: billnumber,
                                Receiptnumber: receiptnumber,
                                Drname: drname,
                                ReferralName: referralName,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                Status: Status
                            };
                            SNo++;
                            $scope.PaymentOPDGSales.push(PaymentCollectionModel);
                        }
                        // }
                    }
                }
            }

            try {
                $scope.TotalCashSales = ($scope.TotalCashSales).toFixed(2);
            } catch (e) {}
            try {
                $scope.TotalCardSales = ($scope.TotalCardSales).toFixed(2);
            } catch (e) {}
            try {
                $scope.TotalChequeOtherSales = ($scope.TotalChequeOtherSales).toFixed(2);
            } catch (e) {}

        };

        $scope.getOPDGSalesList = function () {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 33,
                        Value: [1, 5]
                    },
                    // {
                    //     Key: 39,
                    //     Value: $scope.currentfilter.UserId
                    // }
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };

            //var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            //var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 17,
                    Value: $scope.currentfilter.FromBillDate
                    // Key: 1,
                    // Value: [$scope.currentfilter.FromBillDate, $scope.currentfilter.ToBillDate]
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
                onComplete: $scope.getOPDGSalesListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList = function () {
            //var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            //var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

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
                $scope.getOPDGSalesList();
                $scope.getOPDGCancelsList();
                $scope.getOPDGRefundsList();
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.initLookup = function () {
            $scope.lookup.PaymentType.push({
                Id: -1,
                Text: "Please Select"
            });
            $scope.lookup.PaymentType.push({
                Id: 1,
                Text: "CASH"
            });
            $scope.lookup.PaymentType.push({
                Id: 2,
                Text: "CARD"
            });
            $scope.lookup.PaymentType.push({
                Id: 3,
                Text: "OTHERS"
            });
            $scope.getList();
        };

        $scope.initLookup();
    }

    billingcollectionsController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();