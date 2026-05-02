(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorPaymentFormController', doctorPaymentFormController);

    function doctorPaymentFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {
            id: !isNaN(parseInt($stateParams.id)) ? parseInt($stateParams.id) : 0,
            TotNetAmount: 0,
            TotBalanceAmt: 0,
            TotGrossAmount: 0,
            OtherCharges: 0,
            Balance: 0,
            ReceiptAmount: '',
            AmountPaid: 0
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            DoctorName: '',
            PaymentDateTime: utl.Formatter.getCurrentDate(),
            PaymentAmount: 0,
            EquipmentUsage: 0,
            RoomRent: 0,
            BasicSalary: 0,
            Incentive: 0,
            PaymentTypeId: 1
        };
        $scope.IsCompleted = false;

        $scope.DoctorInvoiceList = [];

        $scope.currentfilter = {
            invoicefromdate: utl.Formatter.getCurrentDate(),
            invoicetodate: utl.Formatter.getCurrentDate(),
            doctorinvoiceno: '',
            doctorinvoicestatusid: 2
        };

        $scope.currentfilter.invoicefromdate =
            new Date($scope.currentfilter.invoicefromdate).setDate(
                new Date($scope.currentfilter.invoicefromdate).getDate() - 30);
        $scope.currentfilter.invoicefromdate = new Date($scope.currentfilter.invoicefromdate);

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup 
            var inputData = {
                Params: [{ Key: 3, Value: 2 }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.backToList = function () {
            $state.go('app.doctorpayments');
        };

        $scope.loadInvoiceInfo = function (doctorInvoice) {
            utl.Modal.open('app.doctorinvoiceinfo', {
                params: { id: doctorInvoice.DoctorInvoiceId },
                confirmCallback: $scope.getItem
            });
        };

        $scope.loadInvoicesCallBack = function (scope, res, options, hasError) {
            var details = [];
            if (res.Data.length > 0) {
                res.Data.forEach((v, i) => {
                    var item = {
                        DoctorInvoiceId: v.Id,
                        InvoiceIdentifier: v.DoctorInvoiceIdentifier,
                        InvoiceDateTime: v.InvoiceDateTime,
                        InvoiceAmount: v.InvoiceAmount,
                        TaxAmount: v.TaxAmount,
                        NetAmount: v.InvoiceAmount,
                        PaidAmount: v.AmountPaid,
                        ToBePaid: (isNaN(parseFloat(v.InvoiceAmount)) ? 0 : parseFloat(v.InvoiceAmount))
                        - (isNaN(parseFloat(v.AmountPaid)) ? 0 : parseFloat(v.AmountPaid)),
                        Comments: '',
                        PaymentDateTime: utl.Formatter.getCurrentDate(),
                        PaymentStatusId: 1,
                        Id: 0,
                        Status: 1,
                        IsFullyPaid: v.IsFullyPaid,
                    };
                    details.push(item);
                });
                $scope.DoctorInvoiceList = details;
                $scope.CalculateNetAmt();
            }
            //  vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.loadInvoices = function () {
            if ($scope.item.DoctorId != -1) {
                var FromDate = $filter('date')($scope.currentfilter.invoicefromdate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.invoicetodate, 'yyyy-MM-dd 23:59:59') || null;

                var inputParams = {
                    Params: [
                        { Key: 5, Value: [FromDate, ToDate] },
                        { Key: 2, Value: $scope.item.DoctorId },
                        { Key: 3, Value: $scope.currentfilter.doctorinvoiceno },
                        { Key: 6, Value: $scope.currentfilter.doctorinvoicestatusid },
                        { Key: 7, Value: '0' },
                    ],
                    PageContext: {
                        PageSize: 250,
                        PageNumber: 1
                    }
                };
                if ($scope.currentcontext.id || $scope.currentcontext.id <= 0) {
                    var options = {
                        action: 'doctorinvoice/doctorinvoice/GetDoctorInvoices',
                        data: inputParams,
                        type: 'post',
                        onComplete: $scope.loadInvoicesCallBack
                    };
                    utl.Http.doAction(options);
                } else
                    $scope.getItem();
            } else {
                utl.Alert.showErrorMsg('Please select Doctor');
            }
        };

        $scope.getItemCallBack = function (scope, res, options, hasError) {
            // $scope
            if (res.Data.length > 0) {
                var data = res.Data[0];
                $scope.item.DoctorPaymentIdentifier = data.DoctorPaymentIdentifier;
                $scope.item.PaymentDateTime = data.PaymentDateTime;
                $scope.item.DoctorId = data.DoctorId;
                $scope.item.BasicSalary = data.BasicSalary;
                $scope.item.RoomRent = data.RoomRent;
                $scope.item.EquipmentUsage = data.EquipmentUsage;
                $scope.item.PaymentStatusId = data.PaymentStatusId;
                $scope.item.CreatedUser = data.CreatedUser.Title ? data.CreatedUser.Title.Description + ' ' + data.CreatedUser.FirstName + '' + data.CreatedUser.LastName : data.CreatedUser.FirstName + '' + data.CreatedUser.LastName;
                $scope.item.DoctorPaymentAmount = data.DoctorPaymentAmount;
                $scope.item.TotalPayment = data.DoctorPaymentAmount;
                $scope.item.DcotorInvoiceAmount = data.DcotorInvoiceAmount;
                var details = [];
                data.DoctorPaymentDetails.forEach((v, i) => {
                    var item = {
                        Id: v.Id,
                        DoctorInvoiceId: v.DoctorInvoiceId,
                        InvoiceIdentifier: v.DoctorInvoice.DoctorInvoiceIdentifier,
                        InvoiceDateTime: v.DoctorInvoice.InvoiceDateTime,
                        InvoiceAmount: v.InvoiceAmount,
                        TaxAmount: v.DoctorInvoice.TaxAmount,
                        NetAmount: v.InvoiceAmount,
                        PaidAmount: v.PaymentAmount,
                        ToBePaid: (isNaN(parseFloat(v.InvoiceAmount)) ? 0 : parseFloat(v.InvoiceAmount))
                        - (isNaN(parseFloat(v.PaymentAmount)) ? 0 : parseFloat(v.PaymentAmount)),
                        Comments: v.Comments,
                        PaymentDateTime: v.PaymentDateTime,
                        PaymentStatusId: v.PaymentStatusId,
                        Status: 1,
                        IsFullyPaid: v.DoctorInvoice.IsFullyPaid
                    };
                    details.push(item);
                });
                $scope.DoctorInvoiceList = details;
                $scope.CalculateNetAmt();
                if (data.PaymentStatusId >= 2)
                    $scope.IsCompleted = true;
                if (data.PaymentStatusId == 1) {
                    $scope.item.DisplayPaymentStatus = 'Draft';
                }
                if (data.PaymentStatusId == 2) {
                    $scope.item.DisplayPaymentStatus = 'Partial';
                }
                if (data.PaymentStatusId == 3) {
                    $scope.item.DisplayPaymentStatus = 'Completed';
                }
                if (data.PaymentStatusId == 4) {
                    $scope.item.DisplayPaymentStatus = 'Cancelled';
                }
            }
            //    $scope.DoctorInvoiceList = res.Data.
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputParams = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'doctorinvoice/DoctorPayment/GetDoctorPayments',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getItemCallBack
                };
                utl.Http.doAction(options);
            }
        };

        $scope.CalculateNetAmt = function () {
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;
            $scope.currentcontext.TotGrossAmount = 0;
            $scope.item.RoomRent = 0;
            $scope.item.BasicSalary = 0;
            $scope.currentcontext.OtherCharges = 0;
            $scope.currentcontext.Balance = 0;
            $scope.item.PaymentAmount = 0;
            $scope.currentcontext.AmountPaid = 0;
            var Balance = 0;
            $scope.DoctorInvoiceList.forEach((v, i) => {
                $scope.currentcontext.TotGrossAmount = parseFloat($scope.currentcontext.TotGrossAmount) +
                    (isNaN(parseFloat(v.ToBePaid)) ? 0 : parseFloat(v.ToBePaid));

                $scope.currentcontext.AmountPaid = parseFloat($scope.currentcontext.AmountPaid) +
                    (isNaN(parseFloat(v.PaidAmount)) ? 0 : parseFloat(v.PaidAmount));
                Balance += (isNaN(parseFloat(v.ToBePaid)) ? 0 : parseFloat(v.ToBePaid));
            });
            $scope.currentcontext.Balance = parseFloat($scope.currentcontext.TotGrossAmount)
                - parseFloat($scope.item.RoomRent)
                + parseFloat($scope.item.BasicSalary)
                - parseFloat($scope.currentcontext.OtherCharges);
            $scope.currentcontext.TotNetAmount = $scope.currentcontext.Balance;
            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount)
                - (isNaN(parseFloat($scope.currentcontext.ReceiptAmount)) ? 0 : parseFloat($scope.currentcontext.ReceiptAmount));
            if ($scope.currentcontext.TotBalanceAmt < 0) {
                $scope.currentcontext.ReceiptAmount = '';
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount);
                utl.Alert.showErrorMsg('Amount should not exceed with to be paid amount...');
            }
            // else if ($scope.item.PaymentStatusId != 2) {
            $scope.item.TotalPayment = (isNaN(parseFloat($scope.item.DoctorPaymentAmount)) ? 0 : parseFloat($scope.item.DoctorPaymentAmount))
                + (isNaN(parseFloat($scope.currentcontext.ReceiptAmount)) ? 0 : parseFloat($scope.currentcontext.ReceiptAmount));
            // }
            if ($scope.currentcontext.id > 0 && Balance == 0) {
                $scope.currentcontext.TotNetAmount = $scope.currentcontext.AmountPaid;
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $state.go('app.doctorpayment', { id: $scope.currentcontext.id });
            }
            else if (typeof (data) == "boolean")
                if ($scope.item.PaymentStatusId != 4)
                    $state.reload();
                else
                    $scope.backToList();
        };

        $scope.saveItem = function (DoctorPaymentStatusId) {
            if (DoctorPaymentStatusId != 4)
                if (!utl.Validator.validate($scope)) {
                    return;
                }
            $scope.item.Details = [];
            var doctorPaymentAmount = 0;
            var ReceiptAmount = (isNaN(parseFloat($scope.currentcontext.ReceiptAmount)) ? 0 : parseFloat($scope.currentcontext.ReceiptAmount));

            $scope.DoctorInvoiceList.forEach((v, i) => {
                var item = {
                    DoctorInvoiceId: v.DoctorInvoiceId,
                    PaymentDateTime: utl.Formatter.getCurrentDate(),
                    InvoiceAmount: v.InvoiceAmount,
                    PaymentAmount: parseFloat(v.PaidAmount) + parseFloat(v.ToBePaid),
                    PaymentStatusId: DoctorPaymentStatusId,
                    Id: v.Id ? v.Id : 0,
                    PaidAmount: v.PaidAmount,
                    // Doctor Invoice Update Info
                    AmountPaid: v.ToBePaid,
                    DueAmount: 0,
                    IsFullyPaid: v.IsFullyPaid
                };
                if (DoctorPaymentStatusId != 4)
                    if (item.IsFullyPaid == 0) {
                        if (DoctorPaymentStatusId == 2 || DoctorPaymentStatusId == 3) {
                            if (ReceiptAmount >= v.ToBePaid) {
                                ReceiptAmount = ReceiptAmount - (isNaN(parseFloat(v.ToBePaid)) ? 0 : parseFloat(v.ToBePaid));
                                item.DueAmount = 0;
                                item.IsFullyPaid = 1;
                                item.AmountPaid = item.PaymentAmount;
                            }
                            else {
                                DoctorPaymentStatusId = 2;
                                item.DueAmount = (isNaN(parseFloat(v.ToBePaid)) ? 0 : parseFloat(v.ToBePaid)) - ReceiptAmount;
                                item.IsFullyPaid = 0;
                                item.AmountPaid = parseFloat(item.PaidAmount) + parseFloat(ReceiptAmount);
                                item.PaymentAmount = item.AmountPaid;
                                ReceiptAmount = 0;
                            }
                        }
                    }
                $scope.item.Details.push(item);
            });
            $scope.item.PaymentDateTime = utl.Formatter.getCurrentDate();
            $scope.item.DcotorInvoiceAmount = (!isNaN(parseFloat($scope.item.DcotorInvoiceAmount))
                ? parseFloat($scope.item.DcotorInvoiceAmount) :
                (isNaN(parseFloat($scope.currentcontext.TotGrossAmount)) ? 0
                    : parseFloat($scope.currentcontext.TotGrossAmount)));
            $scope.item.DoctorPaymentAmount = (isNaN(parseFloat($scope.item.TotalPayment)) ? 0 : parseFloat($scope.item.TotalPayment));

            $scope.item.PaymentStatusId = DoctorPaymentStatusId;
            var actionName = 'doctorinvoice/DoctorPayment/AddDoctorPayment';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var actionName = 'doctorinvoice/DoctorPayment/UpdateDoctorPayment';
                $scope.item.Id = $scope.currentcontext.id;
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'DoctorInvoice/DoctorPayment/PrintDoctorPayment',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.onSave = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.saveItem(1);
        };

        $scope.saveDraft = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Save This Payment?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSave,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.onSaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.saveItem(3);
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Approve This Payment?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.oncancel = function () {
            $scope.saveItem(4);
        }
        $scope.cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Cancel This Payment?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.oncancel,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DoctorInvoiceStatus" },
                { "Key": "PaymentType", Request: { Params: [{ Key: 6, Value: 2 }] } },
                { "Key": "Bank" },
                { "Key": "CardType" },
                { "Key": "Terminal" },
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
    doctorPaymentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();