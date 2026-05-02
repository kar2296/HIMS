(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('billunlockrequestlistController', billunlockrequestlistController);

    function billunlockrequestlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.DBDate = null;
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        const today = new Date();
        $scope.currentfilter =
        {
            UserId: -1,
            PatientId: -1,
            ReceiptNumber: null,
            BillingRequestTypeId: 3,
            BillUnlockRequestStatusId: 1,
            FromBillDate: $filter('date')(new Date(today.setDate(today.getDate() - 30)), 'yyyy-MM-dd 00:00:00'),
            ToBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
            VisitIdentifier: ''
        };


        // $scope.getPaymentDetailListCallback = function(scope, res, options, hasError) {
        //     $scope.PaymentDetails = [];
        //     if (res && res.Data && res.Data.length > 0) {
        //         $scope.PaymentDetails = res.Data;
        //     }
        // };

        // $scope.getPaymentDetailList = function() {
        //     var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
        //     var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
        //     var inputData = {
        //         Params: [
        //             {
        //                 Key: 8,
        //                 Value: $scope.currentfilter.BillingRequestTypeId
        //             }, // receipt completed
        //             {
        //                 Key: 9,
        //                 Value: $scope.currentfilter.BillingRequestStatusId
        //             }, // OP
        //             // {
        //             //     Key: 1,
        //             //     Value: FrmDate
        //             // }, // From
        //             // {
        //             //     Key: 2,
        //             //     Value: ToDate
        //             // }, // To
        //             {
        //                 Key: 18,
        //                 Value: FrmDate
        //             }, // From
        //             {
        //                 Key: 19,
        //                 Value: ToDate
        //             }, // To
        //             {
        //                 Key: 17,
        //                 Value: 2
        //             },
        //             {
        //                 Key: 6,
        //                 Value: utl.Session.getCurrentFacilityId()
        //             },
        //             {
        //                 Key: 17,
        //                 Value: 2
        //             },
        //             {
        //                 Key: 20,
        //                 Value: false
        //             },
        //         ],
        //         PageContext: {
        //             PageSize: 1000000000,
        //             PageNumber: 1
        //         }
        //     };

        //     var options = {
        //         action: 'billing/BillingRequest/GetBillingRequests',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getPaymentDetailListCallback
        //     };

        //     utl.Http.doAction(options);
        // };

        $scope.custom_sort = function (a, b) {
            return new Date(b.AdmissionDate).getTime() - new Date(a.AdmissionDate).getTime();
        };

        $scope.getbillUnlockListCallback = function (scope, data, options, hasError) {
            $scope.billUnlockDetails = [];
            // if (data && data.Data && data.Data.length > 0) {
            //     $scope.billUnlockDetails = data.Data;
            // }
            // vm.gridConfig.data = [];
            if (data.Data.length > 0) {
                data.Data.sort($scope.custom_sort);
            }

            for (var idx in data.Data) {
                var item = data.Data[idx];
                // item.NoOfDays = '';
                // var admDate = new Date(item.AdmissionDate);
                // var crntDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                // var date2 = new Date(crntDate);
                // var difference_ms = date2.getTime() - admDate.getTime();
                // difference_ms = difference_ms / 1000;
                // var seconds = Math.floor(difference_ms % 60);
                // difference_ms = difference_ms / 60;
                // var minutes = Math.floor(difference_ms % 60);
                // difference_ms = difference_ms / 60;
                // var hours = Math.floor(difference_ms % 24);
                // var days = Math.floor(difference_ms / 24);
                // item.NoOfDays = days + 1;

                if (item.FinalBills.length > 0) {
                    var FinalBill = item.FinalBills[0];
                    item.BillDate = FinalBill.BillDateTime;
                    item.BillNumber = FinalBill.BillNumber;
                }
                var BillDiscount = 0;
                var isFinalize = false;
                if (FinalBill) {
                    isFinalize = true;
                    BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount)) ? 0 : parseFloat(FinalBill.BillDiscount);
                }
                var TotBillAmt = parseFloat(item.ActualAmount || 0) + parseFloat(item.RoundOffValue || 0);
                var Debit =
                    (isNaN(parseFloat(item.Disallowance)) ? 0 : parseFloat(item.Disallowance)) +
                    ((isNaN(parseFloat(item.TDS)) ? 0 : parseFloat(item.TDS))) +
                    (isNaN(parseFloat(item.Debit)) ? (0) : parseFloat(item.Debit));
                item.Debit = Debit;
                var Credit = (!item.IsPackageAssigned ?
                    (isNaN(parseFloat(TotBillAmt)) ? 0 : parseFloat(TotBillAmt)) :
                    (isNaN(parseFloat(item.InclusionAmount)) ? (0) : parseFloat(item.InclusionAmount)) +
                    (isNaN(parseFloat(item.ExclusionAmount)) ? (0) : parseFloat(item.ExclusionAmount))) -
                    (isFinalize ? BillDiscount :
                        (!item.IsPackageAssigned ?
                            (isNaN(parseFloat(item.DiscountAmount)) ? 0 : parseFloat(item.DiscountAmount)) :
                            (isNaN(parseFloat(item.PackageDiscountAmount)) ? 0 : parseFloat(item.PackageDiscountAmount))));

                item.Credit = (isNaN(parseFloat(Credit)) ? 0 : parseFloat(Credit));
                item.Balance = (Credit - (isNaN(parseFloat(item.Debit)) ? 0 : parseFloat(item.Debit)));
                if (item.FinalBills.length > 0)
                    item.Balance = item.Balance + (isNaN(parseFloat(item.FinalBills[0].RefundAmount)) ?
                        0 : parseFloat(item.FinalBills[0].RefundAmount));
                if (item.FinalBills.length > 0) {
                    if (item.FinalBills[0].OTRegisterId)
                        item.SurgeryEntryId = item.FinalBills[0].OTRegisterId;
                }

                const admission_array = [4, 5, 6]; //4-Clinical Discharge, 5-Financial Discharge, 6-Physical Discharge

                if (item.IsBillLock && !admission_array.includes(item.AdmissionStatusId)) {
                    item.ColorCode = 6;
                } else {
                    item.ColorCode = item.AdmissionStatusId;
                }

                if (item.IsPackageAssigned == true) {
                    item.ColorCode = 7;
                }

                if (item.BillingRequest.length > 0) {
                    item.BillingRequest = item.BillingRequest[0];
                }
                $scope.billUnlockDetails.push(item);
            }
            // // $scope.getPagination();
            // vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;

        };

        $scope.getbillUnlockList = function (val) {
            // var FrmDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;
            // var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            // var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 17,
                    Value: FrmDate
                },
                {
                    Key: 18,
                    Value: ToDate
                },
                // {
                //     Key: 2,
                //     Value: $scope.currentfilter.WardId
                // },
                {
                    Key: 15,//EncounterType
                    Value: 2
                },
                // {
                //     Key: 5,
                //     Value: $scope.advancedfilter.DoctorId
                // },
                {
                    Key: 4,
                    Value: $scope.currentfilter.PatientId
                },
                // {
                //     Key: 11,
                //     Value: $scope.currentfilter.PatientMRN
                // },
                {
                    Key: 13,
                    Value: $scope.currentfilter.VisitIdentifier
                },
                // {
                //     Key: 3,
                //     Value: $scope.currentfilter.AdmissionStatusId
                // },
                // {
                //     Key: 19,
                //     Value: $scope.advancedfilter.GuarantorId
                // },
                // {
                //     Key: 19,
                //     Value: $scope.currentfilter.GuarantorId
                // },
                // {
                //     Key: 23,
                //     Value: $scope.advancedfilter.GuarantorTypeId
                // },
                {
                    Key: 22,
                    Value: true
                },
                {
                    Key: 67,
                    Value: true
                },
                // {
                //     Key: 37,
                //     Value: $scope.currentfilter.IsBillLock
                // },
                // {
                //     Key: 58,
                //     Value: $scope.currentfilter.IsPackageAssigned
                // },
                // {
                //     Key: 46,
                //     Value: $scope.currentfilter.IsEstimatedBill
                // },
                // {
                //     Key: 17,
                //     Value: FromAdm
                // },
                // {
                //     Key: 18,
                //     Value: ToAdm
                // },
                {
                    Key: 82,
                    Value: $scope.currentfilter.BillUnlockRequestStatusId
                },
                {
                    Key: 69,
                    Value: false
                },
                ],
                PageContext: {
                    PageSize: 1000000000,
                    PageNumber: 1
                }
            };

            // if ($scope.currentfilter.DischargeDate)
            // inputData.Params.push({
            //     Key: 80,
            //     Value: $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 00:00:00') || null
            // }, {
            //     Key: 81,
            //     Value: $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 23:59:59') || null
            // }
            // )

            // if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1) {
            //     inputData.Params.push({
            //         Key: 31,
            //         Value: [2, 3, 4, 5]
            //     })
            // } else {
            //     inputData.Params.push({
            //         Key: 31,
            //         Value: $scope.currentfilter.AdmissionStatusId
            //     });
            // }
            var options = {
                action: 'Visit/Visit/GetMINIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getbillUnlockListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSystemDBDateCallback = function (scope, data, options, hasError) {
            if (data) {
                $scope.DBDate = data;
            }
            $scope.getbillUnlockList();
            // $scope.getList();
        };

        $scope.getSystemDBDate = function () {
            var options = {
                action: 'billing/patientpaymentdetails/GetSystemDatetime',
                data: null,
                type: 'post',
                onComplete: $scope.getSystemDBDateCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDateDiffInHours = function (Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

        $scope.EditBillingRequest = function (item) {
            if (item.Id) {
                utl.Modal.open('app.editunlockbillingrequest', {
                    params: {
                        id: item.EncounterId,
                        data: item,
                        // pid: PaymentDetail.PatientId,
                        // billnumber: PaymentDetail.BillNumber,
                        // patientbillid: PaymentDetail.PatientBillId
                    },
                    confirmCallback: $scope.getbillUnlockList
                });
            }
        };



        $scope.getList = function () {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromBillDate,
                $scope.currentfilter.ToBillDate
            );
            // if (!(resultInHours >= 0 && resultInHours <= 168)) {
            //     utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
            //     $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
            //     $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
            //     return false;
            // } else {
            //     $scope.getSystemDBDate();
            // }
            $scope.getSystemDBDate();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [

                {
                    "Key": "ReceiptType"
                },
                // {
                //     "Key": "User"
                // },
                // {
                //     "Key": "PaymentType"
                // },

                // {
                //     "Key": "PrivateDueApprover"
                // },
                // {
                //     "Key": "SettlementType"
                // },
                // {
                //     "Key": "Terminal"
                // },
                // {
                //     "Key": "BillingRequestStatus"
                // },
                {
                    "Key": "BillingRequestType"
                },
                {
                    "Key": "BillUnlockRequestStatus"
                },

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

    billunlockrequestlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();