(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StaffCreditPaymentFormController', StaffCreditPaymentFormController);

    function StaffCreditPaymentFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {
            id: !isNaN(parseInt($stateParams.id)) ? parseInt($stateParams.id) : 0
        };
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StaffId: -1,
            StaffCreditPaymentStatusId: -1,
            StaffName: '',
            ReceiptAmount: 0,
            TotalOutstandingAmount: 0,
            StaffCreditPaymentTypeId: 0,
            StaffCreditPaymentDate: utl.Formatter.getCurrentDate(),
            // BillDate: utl.Formatter.getCurrentDate(),
            StaffCreditPaymentIdentifier: ''

        };

        $scope.currentfilter = {
            billingfromdate: utl.Formatter.getCurrentDate(),
            billingtodate: utl.Formatter.getCurrentDate(),
            // EncounterTypeId: 1,
            // billno: '',
            // patientname: '',
            // visitidentifier: '',
        };
        $scope.currentcontext = {};
        if ($stateParams.id)
            $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt($stateParams.pid);

        $scope.item.StaffCreditPaymentTypeId = 1;

        $scope.StaffCreditBillDetail = [];
        $scope.backToList = function () {
            $state.go('app.staffcreditpaymentlist');
        };
        $scope.Dashboard = function () {
            $state.go('app.pharmacydashboard');
        }
        $scope.clear = function () {
            $state.reload();
            savehitcompleted = 0;
        };

        $scope.addNew = function () {
            $state.go('app.staffcreditpayment', {
                id: 0
            });
        };
        // $scope.payment = function () {
        //     utl.Modal.openFixedDialog('app.billingpayment', {
        //         params: { id: $scope.currentcontext.id },
        //         confirmCallback: $scope.getItem
        //     });
        // };

        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Title',
                    field: 'Title',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'Name',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Age/Gender',
                    field: 'Age',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'DOB',
                    field: 'DOB',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'MRN',
                    field: 'MRN',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
            ],
            searchparams: {},
            result: {},
            api: 'Registration/Patient/GetPatients',
            presearch: presearchStaffpatient,
            formatdisplay: formatselectedStaffpatient,
            postsearch: postsearchStaffpatient
        };

        function formatselectedStaffpatient() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            var strTitle = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.PatientId = selectedItem.Id;
                strTitle = selectedItem.Title ? selectedItem.Title.Description : '';
                result = [strTitle, selectedItem.FirstName, selectedItem.LastName].join(' ');
            } else if (vm.patientcontrolconfig.rowdata) {
                if (vm.patientcontrolconfig.rowdata) {
                    result = [
                        vm.patientcontrolconfig.rowdata.FirstName,
                        vm.patientcontrolconfig.rowdata.LastName
                    ].join(' ');
                } else {
                    return '';
                }
            }
            $scope.patientChange();
            return result;
        }

        function presearchStaffpatient() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 35,
                        Value: true
                    },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.patientcontrolconfig.searchbyid === true) {
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

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchStaffpatient() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Title ? item.Title.Description : '';
                item.Name = [item.FirstName, item.LastName].join(' ');
                // item.Age = item.Age + ' / ' + item.Gender.Description;
                item.DOB = $filter('date')(item.DOB, 'yyyy-MMM-dd');
                item.MRN = item.MRN;
            }
        }

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.item.StaffId = data.Id;
            $scope.item.StaffName = data.PatientName;
            $scope.item.PatientMrn = data.MRN;
            $scope.item.TitleId = data.TitleId || 0;
            $scope.item.GenderId = data.GenderId;
            $scope.item.Age = data.Age;
            $scope.item.DOB = data.DOB;
            $scope.item.Mobile = data.Mobile;
            $scope.item.FacilityId = data.FacilityId;
            $scope.item.GuarantorId = data.GuarantorId;
            $scope.item.PrivateDueId = data.UserId;
            $scope.item.Staff = data.Staff;
            $scope.item.OutStandingAmount = data.OutStandingAmount;
            $scope.item.BillAmount = data.BillAmount;
            $scope.loadBills();
        };


        $scope.patientChange = function () {
            if ($scope.item.StaffId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.StaffId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        function getstaffcredibillDetails() {
            var billDetails = [];
            for (var idx in $scope.StaffCreditPayment) {
                var BillData = $scope.StaffCreditPayment[idx];
                if (BillData.IsSelected == true) {
                    var vdetail = {
                        Id: 0,
                        PatientBillId: BillData.PatientBillId,
                        StaffId: BillData.StaffId,
                        BillNumber: BillData.BillNumber,
                        BillDate: BillData.BillDateTime,
                        BillAmount: BillData.BillAmount,
                        BalanceAmount: (BillData.OutStandingAmount) - parseInt(BillData.ReceivedAmount),
                        PaidAmount: BillData.ReceivedAmount,
                        ReceiptAmount: BillData.ReceivedAmount,

                    }
                    billDetails.push(vdetail);
                }

            }
            return billDetails;
        }
        $scope.selectAllItems = function () {
            for (var idx in $scope.StaffCreditPayment) {
                var item = $scope.StaffCreditPayment[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllPaymentSelected = $scope.currentcontext.selectall;
                }
            }
        }

        $scope.LineItemSelect = function (list, item) {

            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllPaymentSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllPaymentSelected && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                }
            }
        }


        $scope.getBillItemCallBack = function (scope, res, options, hasError) {
            $scope.StaffCreditPaymentDetails = [];
            $scope.StaffCreditPaymentDetails = res.Data;
        };

        $scope.getBillItem = function () {
            if ($scope.currentcontext.id) {
                var inputParams = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/StaffCreditPaymentDetails/GetStaffCreditPaymentDetails',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getBillItemCallBack
                };
                utl.Http.doAction(options);
            }
        };



        $scope.loadBillsCallBack = function (scope, res, options, hasError) {
            var details = [];
            var data = res.Data[0];
            // $scope.item.DoctorInvoiceIdentifier = data.DoctorInvoiceIdentifier;
            // $scope.item.InvoiceDateTime = data.InvoiceDateTime;
            $scope.item.StaffId = data.PatientId;
            $scope.item.StaffName = data.PatientName;
            $scope.item.ContactNo = data.Mobile;
            $scope.item.BillAmount = data.BillAmount;
            $scope.item.OutStandingAmount = data.OutStandingAmount;
            $scope.item.PaidAmount = data.PaidAmount;
            // $scope.item.ReceiptAmount = ($scope.item.OutStandingAmount - $scope.item.PaidAmount);
            var Dueamount = 0;
            var TotalOutStandingAmount = 0;
            // $scope.item.TotalOutStandingAmount = isNaN(parseFloat($scope.item.OutStandingAmount)) ? (0) : parseFloat(($scope.item.OutStandingAmount);
            TotalOutStandingAmount = ($scope.item.OutStandingAmount);
            Dueamount = Dueamount + (TotalOutStandingAmount);


            if (res.Data.length > 0) {
                res.Data.forEach((selectitem, i) => {
                    var item = {
                        Id: 0,
                        PatientBillId: selectitem.Id,
                        StaffId: selectitem.PatientId,
                        BillDateTime: selectitem.BillDateTime,
                        BillNumber: selectitem.BillNumber,
                        BillAmount: selectitem.BillAmount,
                        BillDiscount: selectitem.BillDiscount,
                        PaidAmount: selectitem.PaidAmount,
                        OutStandingAmount: selectitem.OutStandingAmount,
                        RoundOffValue: selectitem.RoundOffValue,
                        IsPaidFully: false,
                        IsReadOnly: false,
                        IsSelected: false,

                    };

                    details.push(item);
                });
                $scope.StaffCreditPayment = details;
            }
            $scope.computeamount();
        };

        $scope.loadBills = function () {
            if ($scope.item.StaffId != -1) {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputParams = {
                    Params: [{
                            Key: 56,
                            Value: true
                        },
                        {
                            Key: 12,
                            Value: $scope.item.StaffId
                        },
                        {
                            Key: 50,
                            Value: false
                        }
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var Data = {
                    Data: {
                        StaffId: $scope.item.StaffId,
                        apiRequest: inputParams
                    }
                };
                if ($scope.currentcontext.id || $scope.currentcontext.id <= 0) {
                    var options = {
                        action: 'billing/PatientBills/GetPatientBills',
                        data: inputParams,
                        type: 'post',
                        onComplete: $scope.loadBillsCallBack
                    };
                    utl.Http.doAction(options);
                }
            } else {
                utl.Alert.showErrorMsg('Please select Staff Name');
            }
        };


        $scope.computeamount = function () {
            var totalbillamt = 0;
            var totaldiscount = 0;
            var totalpaidamount = 0;
            var totaloutstandingamount = 0;
            var totalreceivedamount = 0;
            var totoutstanding = 0;
            var totroundoff = 0;
            for (var idx in $scope.StaffCreditPayment) {
                var paymentdata = $scope.StaffCreditPayment[idx];
                paymentdata.BillAmount = isNaN(parseFloat(paymentdata.BillAmount)) ? (0) : parseFloat(paymentdata.BillAmount);
                paymentdata.DiscountAmount = isNaN(parseFloat(paymentdata.BillDiscount)) ? (0) : parseFloat(paymentdata.BillDiscount);
                paymentdata.RoundOff = isNaN(parseFloat(paymentdata.RoundOffValue)) ? (0) : parseFloat(paymentdata.RoundOffValue);
                paymentdata.PaidAmount = isNaN(parseFloat(paymentdata.PaidAmount)) ? (0) : parseFloat(paymentdata.PaidAmount);
                paymentdata.ReceivedAmount = isNaN(parseFloat(paymentdata.ReceivedAmount)) ? (0) : parseFloat(paymentdata.ReceivedAmount);
                paymentdata.OutStandingAmount = isNaN(parseFloat(paymentdata.OutStandingAmount)) ? (0) : parseFloat(paymentdata.OutStandingAmount);

                totalbillamt = totalbillamt + (paymentdata.BillAmount);
                totaldiscount = totaldiscount + (paymentdata.DiscountAmount);
                totroundoff = totroundoff + (paymentdata.RoundOff);
                totalpaidamount = totalpaidamount + (paymentdata.PaidAmount);
                // totaltdsamount = totaltdsamount + (paymentdata.TDSAmount);
                totalreceivedamount = totalreceivedamount + (paymentdata.ReceivedAmount);
                totaloutstandingamount = totaloutstandingamount + (paymentdata.OutStandingAmount);
                totoutstanding = (totalbillamt - totaldiscount + totroundoff) - totalreceivedamount;
            }
            $scope.item.TotalPaidAmount = totalpaidamount;
            $scope.item.TotalReceivedAmount = totalreceivedamount;
            $scope.item.TotalBillAmount = totalbillamt;
            $scope.item.TotalOutstandingAmount = totoutstanding;
        }
        $scope.CalculateNetAmt = function (item) {
            $scope.currentcontext.ReceiptAmt = 0;
            if (parseInt(item.ReceivedAmount) > 0) {
                for (var paydx in $scope.StaffCreditPayment) {
                    var staffpayment = $scope.StaffCreditPayment[paydx];
                    if (staffpayment.IsAllPaymentSelected == true) {
                        $scope.currentcontext.ReceiptAmt = $scope.currentcontext.ReceiptAmt + parseInt(staffpayment.ReceivedAmount);
                        if (staffpayment.ReceivedAmount == staffpayment.OutStandingAmount) {
                            staffpayment.IsPaidFully = true;
                        }
                        if (staffpayment.ReceivedAmount > staffpayment.OutStandingAmount) {
                            utl.Alert.showErrorMsg('Receipt Amount Should Not be greater than Due Amount...');
                        }

                    }
                }
            }
            $scope.computeamount();
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

        };

        // $scope.getItemCallback = function (scope, res, options, hasError) {
        //     $scope.StaffCreditBillDetail = res.Data || [];
        //     if ($scope.StaffCreditBillDetail && $scope.StaffCreditBillDetail.length > 0) {

        //     // $scope.StaffCreditBillDetail = res.Data || [];
        //     // if (res.StaffCreditBillDetail.length > 0) {
        //         // var data = res.Data[0];
        //         $scope.item.BillNumber = data.BillNumber;
        //         $scope.item.BillDate = data.BillDate;
        //         $scope.item.ReceiptAmount = data.ReceiptAmount;
        //         $scope.item.PaidAmount = data.PaidAmount;
        //         $scope.item.BalanceAmount = data.BalanceAmount;
        //         var details = [];
        //         data.StaffCreditBillDetail.forEach((val, i) => {
        //             var item = {
        //                 Id: val.Id,
        //                 StaffCreditPaymentId: val.StaffCreditPayment.StaffCreditPaymentId,
        //                 StaffCreditPaymentIdentifier: val.StaffCreditPayment.StaffCreditPaymentIdentifier,
        //                 StaffCreditPaymentDate: val.StaffCreditPayment.StaffCreditPaymentDate,
        //                 BillAmount: val.BillAmount,
        //                 PaidAmount: val.PaidAmount,
        //                 BalanceAmount: val.BalanceAmount,
        //                 PaidAmount: val.PaymentAmount,
        //                 ToBePaid: (isNaN(parseFloat(val.BillAmount)) ? 0 : parseFloat(val.BillAmount))
        //                     - (isNaN(parseFloat(val.PaidAmount)) ? 0 : parseFloat(val.PaidAmount)),
        //                 Comments: val.Comments,
        //                 // PaymentDateTime: val.PaymentDateTime,
        //                 // PaymentStatusId: val.PaymentStatusId,
        //                 Status: 1,
        //             };
        //             details.push(item);
        //         });

        //     }
        // };
        $scope.getItem = function () {
            if ($scope.currentcontext.id > 0) {

                var options = {
                    action: 'billing/StaffCreditPayment/GetStaffCreditPaymentById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            for (var idx in $scope.StaffCreditPayment) {
                var item = $scope.StaffCreditPayment[idx];
                if ((item.IsSelected == true) && (!item.ReceivedAmount)) {
                    utl.Alert.showErrorMsg('Please Enter Receipt Amount...');
                    return false;
                }
            }
            return true;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {
                var staffdetails = getstaffcredibillDetails();

                var actionName = 'billing/StaffCreditPayment/AddStaffCreditPayment';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/StaffCreditPayment/UpdateStaffCreditPayment';
                    $scope.item.Id = $scope.currentcontext.id;
                }
                $scope.item.StaffId = $scope.item.PatientId;
                $scope.item.UserpayAmount = $scope.currentcontext.ReceiptAmt;
                $scope.item.TotBillAmount = $scope.item.BillAmount;
                $scope.item.ReceiptAmount = $scope.currentcontext.ReceiptAmt;


                var inputData = {
                    Header: $scope.item,
                    Details: staffdetails,
                };
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.onSave = function () {
            $scope.item.StaffCreditPaymentStatusId = 1; // Draft
            $scope.saveItem();
        }
        $scope.save = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Save This Invoice?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSave,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.onSaveandApprove = function () {
            $scope.item.StaffCreditPaymentStatusId = 2; // Draft
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Approve This Invoice?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        // $scope.cancel = function () {
        //     if (!utl.Validator.validate($scope)) {
        //         return;
        //     }
        //     $scope.saveItem(3);
        // };
        $scope.oncancel = function () {
            $scope.item.StaffCreditPaymentStatusId = 3; // Draft
            $scope.saveItem();
        }
        $scope.cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Cancel This Invoice?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.oncancel,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }



        $scope.getSelectionRows = function () {
            $scope.SelectedRows = [];
            for (var idx in $scope.StaffCreditPayment) {
                var item = $scope.StaffCreditPayment[idx];
                if (item.IsSelected == true) {
                    $scope.SelectedRows.push(item);
                }
            }
        }

        function getpaymentsLinesForSave() {
            var result = [];
            for (var idx in $scope.StaffCreditPayment) {
                var item = $scope.StaffCreditPayment[idx];
                //                 if (item.AmountPaid > 0) {
                result.push(item);
                //                 }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getBillItem();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.patientChange();
            if ($scope.currentcontext.id > 0) {
                loadData();
            }
            // $scope.getItem();
        };
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "PaymentType"
                },
                {
                    "Key": "PatientBillStatus"
                },
                {
                    "Key": "CurrencyType"
                },
                {
                    "Key": "CardType"
                },
                {
                    "Key": 'Bank'
                },
                {
                    "Key": "ReceiptType"
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

    StaffCreditPaymentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();