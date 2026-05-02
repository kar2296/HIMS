(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PerformingDoctorInvoicePaymentFormController', PerformingDoctorInvoicePaymentFormController);

    function PerformingDoctorInvoicePaymentFormController($rootScope,$scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig,$timeout) {
        var vm = this;
        $scope.currentcontext = {
            ReceiptAmount: '',
            AmountPaid: 0
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            DoctorName: '',
            PaymentDateTime: utl.Formatter.getCurrentDate(),
            PaymentAmount: 0,
            PaymentTypeId: 1
        };
        // $scope.IsCompleted = false;

        $scope.DoctorInvoiceList = [];

        $scope.currentfilter = {
            // invoicefromdate: utl.Formatter.getCurrentDate(),
            // invoicetodate: utl.Formatter.getCurrentDate(),
            doctorinvoiceno: '',
            doctorinvoicestatusid: 2
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.DrInvId = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.DoctorInvoiceId = $scope.currentcontext.DrInvId;

        $scope.currentfilter.invoicefromdate =
            new Date($scope.currentfilter.invoicefromdate).setDate(
                new Date($scope.currentfilter.invoicefromdate).getDate() - 30);
        $scope.currentfilter.invoicefromdate = new Date($scope.currentfilter.invoicefromdate);

        $scope.loadInvoicesCallBack = function (scope, res, options, hasError) {
            var details = [];
            var data = res.Data[0];
            $scope.item.DoctorInvoiceIdentifier = data.DoctorInvoiceIdentifier;
            $scope.item.InvoiceDateTime = data.InvoiceDateTime;
            $scope.item.DoctorId = data.DoctorId;
            $scope.item.Doctor = '';
            if (data.Doctor.Title)
                $scope.item.Doctor = data.Doctor.Title.Description;
            if (data.Doctor.FirstName)
                $scope.item.Doctor += ' ' + data.Doctor.FirstName;
            if (data.Doctor.LastName)
                $scope.item.Doctor += ' ' + data.Doctor.LastName;
            // data.Doctor.Title ? data.Doctor.Title.Description + ' ' + data.Doctor.FirstName + '' + data.Doctor.LastName : data.CreatedUser.FirstName + '' + data.CreatedUser.LastName;
            $scope.item.DcotorInvoiceAmount = data.InvoiceAmount;
            $scope.item.DoctorInvoiceStatusId = data.DoctorInvoiceStatusId;
            $scope.item.DoctorInvoiceStatus = data.DoctorInvoiceStatus.Description;
            $scope.item.TDSId = data.TDSId;
            $scope.item.TDSAmount = data.TDSAmount;
            $scope.item.TDSPercentage = data.TDSPercentage;
            $scope.item.ReceiptAmount = ($scope.item.DcotorInvoiceAmount - $scope.item.TDSAmount)

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
                        ToBePaid: (isNaN(parseFloat(v.InvoiceAmount)) ? 0 : parseFloat(v.InvoiceAmount)) -
                            (isNaN(parseFloat(v.AmountPaid)) ? 0 : parseFloat(v.AmountPaid)),
                        Comments: '',
                        // PaymentDateTime: utl.Formatter.getCurrentDate(),
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
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.loadInvoices = function () {
            var inputParams = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.DrInvId
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            // if (!$scope.currentcontext.id || $scope.currentcontext.id <= 0) {
            var options = {
                action: 'doctorinvoice/doctorinvoice/GetDoctorInvoices',
                data: inputParams,
                type: 'post',
                onComplete: $scope.loadInvoicesCallBack
            };
            utl.Http.doAction(options);
            // } else
            //     $scope.getItem();

        };

        $scope.getItemCallBack = function (scope, res, options, hasError) {
            // $scope
            if (res.Data.length > 0) {
                var data = res.Data[0];
                var DrPaymentData = data.DoctorPayment
                $scope.item.DoctorPaymentIdentifier = DrPaymentData.DoctorPaymentIdentifier;
                $scope.item.PaymentDateTime = DrPaymentData.PaymentDateTime;
                $scope.item.DoctorId = DrPaymentData.DoctorId;
                if (DrPaymentData.Doctor.Title)
                    $scope.item.Doctor = DrPaymentData.Doctor.Title.Description;
                if (DrPaymentData.Doctor.FirstName)
                    $scope.item.Doctor += ' ' + DrPaymentData.Doctor.FirstName;
                if (DrPaymentData.Doctor.LastName)
                    $scope.item.Doctor += ' ' + DrPaymentData.Doctor.LastName;
                // $scope.item.BasicSalary = DrPaymentData.BasicSalary;
                // $scope.item.RoomRent = DrPaymentData.RoomRent;
                // $scope.item.EquipmentUsage = DrPaymentData.EquipmentUsage;
                $scope.item.PaymentStatusId = DrPaymentData.PaymentStatusId;
                $scope.item.DoctorPaymentAmount = DrPaymentData.DoctorPaymentAmount;
                $scope.item.TotalPayment = DrPaymentData.DoctorPaymentAmount;
                $scope.item.DcotorInvoiceAmount = DrPaymentData.DcotorInvoiceAmount;
                $scope.item.InvoiceDateTime=data.DoctorInvoice.InvoiceDateTime;
                $scope.item.DoctorInvoiceIdentifier = data.DoctorInvoice.DoctorInvoiceIdentifier;
                $scope.item.TDSId = data.TDSId;
                $scope.item.TDSAmount = data.DoctorInvoice.TDSAmount;
                $scope.item.TDSPercentage = data.DoctorInvoice.TDSPercentage;
                $scope.item.DoctorInvoiceStatus = data.DoctorInvoice.DoctorInvoiceStatus.Description;
                if (DrPaymentData.PaymentStatusId >= 2)
                    $scope.IsCompleted = true;
                if (DrPaymentData.PaymentStatusId == 1) {
                    $scope.item.DisplayPaymentStatus = 'Draft';
                }
                if (DrPaymentData.PaymentStatusId == 2) {
                    $scope.item.DisplayPaymentStatus = 'Partial';
                }
                if (DrPaymentData.PaymentStatusId == 3) {
                    $scope.item.DisplayPaymentStatus = 'Completed';
                }
                if (DrPaymentData.PaymentStatusId == 4) {
                    $scope.item.DisplayPaymentStatus = 'Cancelled';
                }
            } else {
                $scope.loadInvoices();
            }
            //    $scope.DoctorInvoiceList = res.Data.
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.DrInvId && $scope.currentcontext.DrInvId > 0) {
                var inputParams = {
                    Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.DrInvId
                    }],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'doctorinvoice/DoctorPaymentDetails/GetDoctorPaymentDetails',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getItemCallBack
                };
                utl.Http.doAction(options);
            }
        };

        $scope.CalculateNetAmt = function () {
            $scope.currentcontext.ReceiptAmount = ($scope.item.DcotorInvoiceAmount - $scope.item.TDSAmount);
            $scope.item.DoctorPaymentAmount = $scope.currentcontext.ReceiptAmount;
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
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
                                // item.DueAmount = 0;
                                // item.IsFullyPaid = 1;
                                item.AmountPaid = item.PaymentAmount;
                            } else {
                                // DoctorPaymentStatusId = 2;
                                // item.DueAmount = (isNaN(parseFloat(v.ToBePaid)) ? 0 : parseFloat(v.ToBePaid)) - ReceiptAmount;
                                // item.IsFullyPaid = 0;
                                item.AmountPaid = parseFloat(item.PaidAmount) + parseFloat(ReceiptAmount);
                                item.PaymentAmount = item.AmountPaid;
                                ReceiptAmount = 0;
                            }
                        }
                    }
                $scope.item.Details.push(item);
            });

            $scope.item.PaymentStatusId = DoctorPaymentStatusId;
            var actionName = 'doctorinvoice/DoctorPayment/AddDoctorPayment';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var actionName = 'doctorinvoice/DoctorPayment/UpdateDoctorPayment';
                $scope.item.Id = $scope.currentcontext.id;
            }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
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
            var inputData = [{
                "Key": "DoctorInvoiceStatus"
            },
            {
                "Key": "PaymentType",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: 2
                    }]
                }
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "CardType"
            },
            {
                "Key": "Terminal"
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
    PerformingDoctorInvoicePaymentFormController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig','$timeout'];

})();