(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('editdetipbillingrequestController', editdetipbillingrequestController);

    function editdetipbillingrequestController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        var vm = this;
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.Context = modalConfig.params.context;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontextedit = {};
        $scope.currentfilter = {};
        $scope.currentcontext.billrequestid = modalConfig.params.id;
        $scope.currentcontext.id = modalConfig.params.patientbillid;
        $scope.item = {};
        $scope.items = {};

        $scope.item.BillNumber = modalConfig.params.billnumber;
        $scope.item.PatientBillId = modalConfig.params.patientbillid;
        $scope.currentfilter.PatientId = modalConfig.params.pid;
        $scope.currentfilter.EncounterId = modalConfig.params.eid;
        $scope.item.PatientId = $scope.currentfilter.PatientId;

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                BillDetails: $scope.BillDetails,
                IsDisabled: $scope.IsDisabled
            };
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.PatientMrn = $scope.selectedPatient.MRN;
        }


        $scope.patientChange = function () {
            $scope.chkfindBill = 0;
            if ($scope.currentfilter.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentfilter.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.item.IsFromIPBill = 0;
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.isSaving = true;
                $scope.outstanding = false;
                $scope.IsDue = false;
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.item.BillGeneratedBy = patientbills.BillGeneratedBy;
                    $scope.item.BillAmount = patientbills.BillAmount;
                    $scope.item.PaidAmount = patientbills.PaidAmount;

                    $scope.currentfilter.PatientId = patientbills.PatientId;
                    $scope.patientChange();
                    if (patientbills.OutStandingAmount > 0) {
                        $scope.IsDue = true
                    } else {
                        $scope.item.TotalDueAmount = patientbills.OutStandingAmount;
                        $scope.item.TotalPaidAmount = patientbills.PaidAmount;
                        $scope.canShowAdvanceBtn = true;
                    }
                    $scope.currentfilter.PatientId = patientbills.PatientId;
                    $scope.currentcontext.FacilityId = patientbills.FacilityId;
                    $scope.currentcontext.DiscountApprovedBy = patientbills.DiscountApprovedBy;
                    $scope.currentcontext.id = patientbills.Id;
                    $scope.currentcontext.ReceiptAmt = null;
                    $scope.currentcontext.PaidAmt = patientbills.PaidAmount;
                    $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;
                    $scope.currentcontext.billdate = patientbills.BillDateTime;
                    $scope.currentcontext.BillDiscount = patientbills.BillDiscount;
                    $scope.currentcontext.CNAmount = patientbills.CNAmount;
                    $scope.currentcontext.RefundAmount = patientbills.RefundAmount;
                    $scope.currentcontext.CancelReason = patientbills.CancelReason;
                    $scope.currentfilter.DiscountModeId = patientbills.BillDiscountModeId;
                    $scope.item.BillNumber = patientbills.BillNumber;
                    $scope.item.DepartmentId = patientbills.DepartmentId;
                    $scope.item.DoctorId = patientbills.DoctorId;
                    $scope.currentfilter.GuarantorId = patientbills.GuarantorId;
                    $scope.currentfilter.GuarantorName = patientbills.GuarantorName;
                    $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;
                    $scope.currentfilter.ServiceRateCategoryId = patientbills.ServiceRateCategoryId;
                    $scope.item.IsMultiplePayment = patientbills.IsMultiplePayment;

                    if ($scope.currentfilter.DiscountModeId == 2) {
                        $scope.currentcontext.BillDiscount = patientbills.DiscountPercentage;
                    }
                    $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                    $scope.item.PatientTypeId = patientbills.PatientTypeId;
                    $scope.item.IsEmergency = patientbills.IsEmergency;
                    $scope.item.EncounterId = patientbills.EncounterId;
                    $scope.item.PatientName = patientbills.PatientName;
                    $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                    $scope.item.GuarantorDueId = patientbills.GuarantorDueId || null;
                    $scope.item.PrivateDueId = patientbills.PrivateDueId || null;
                    $scope.item.IsManualBill = patientbills.IsManualBill;
                    $scope.item.ManualBillNumber = patientbills.ManualBillNumber;
                    $scope.item.ManualBillDate = patientbills.ManualBillDate;
                    $scope.item.ManualBillComments = patientbills.ManualBillComments;
                    $scope.isSaveandApprove = true;
                });
            }
        };

        // $scope.canAdjust = function (index, item, ismodified) {
        //     if (item) {
        //         item.IsAutoBillModified = ismodified;
        //     }
        //     if (index == 'line') {
        //         // $scope.item.isadjustRate = false;
        //         // $scope.calcAmt();
        //     }
        //     else {
        //         // $scope.PatientBillDetails.forEach((val, idx) => {
        //         //     val.isEditable = $scope.item.isEditable;
        //         // });
        //     }
        // };

        $scope.getRequestBillDetailsCallback = function (scope, res, options, hasError) {
            $scope.BillDetails = [];
            if (res && res.Data && res.Data.length > 0) {
                $scope.BillDetails = res.Data;
                $scope.BillDetails.forEach(patientbill => {
                    console.log(patientbill);
                    // patientbill.PatientBillDetail = patientbill.PatientBillDetail;
                });
            }
            $scope.refreshReactProps();
        };


        $scope.getRequestBillDetails = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    {
                        Key: 8,
                        Value: $scope.currentfilter.BillingRequestTypeId
                    }, // receipt completed
                    {
                        Key: 9,
                        Value: $scope.currentfilter.BillingRequestStatusId
                    }, // OP
                    // {
                    //     Key: 1,
                    //     Value: FrmDate
                    // }, // From
                    // {
                    //     Key: 2,
                    //     Value: ToDate
                    // }, // To
                    // {
                    //     Key: 18,
                    //     Value: FrmDate
                    // }, // From
                    // {
                    //     Key: 19,
                    //     Value: ToDate
                    // }, // To
                    {
                        Key: 17,
                        Value: 2
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 20,
                        Value: true
                    },
                    {
                        Key: 21,
                        Value: $scope.currentfilter.EncounterId
                    },
                ],
                PageContext: {
                    PageSize: 1000000000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/BillingRequest/GetBillingRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRequestBillDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.UpdatePatientBillsForCancelCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.UpdatePatientBillsForCancel = function () {

            if ($scope.items.BillingRequestStatusId == 2) {
                $scope.items.CancelReqRaisedStatusId = 2;
            } else if ($scope.items.BillingRequestStatusId == 3) {
                $scope.items.CancelReqRaisedStatusId = 3;
            }

            $scope.items.Id = $scope.item.PatientBillId;
            // var lines = getLinesForSaveCancel();
            var actionName = 'Billing/PatientBills/AddPatientBills';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/PatientBills/UpdatePatientBillsFromCancel';
            }
            var inputData = {
                Header: $scope.items,
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.UpdatePatientBillsForCancelCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getLinesForSaveCancel = function () {
            $scope.PatientBillDetailslines = [];
            for (var idx in $scope.BillDetails) {
                var items = $scope.BillDetails[idx];
                if (items.isSelected == true && items.PatientBillDetail.DetCancelReqRaisedStatusId == 1 ) {
                    items.IsDetailBill = true;
                    $scope.PatientBillDetailslines.push(items);
                }
            }
            return $scope.PatientBillDetailslines;
        }

        $scope.CancelApprovedCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
            // $scope.UpdatePatientBillsForCancel();
        };


        $scope.CancelApproved = function () {

            $scope.items.BillingRequestStatusId = 2;
            $scope.items.Id = $scope.currentcontext.billrequestid;
            var lines = $scope.getLinesForSaveCancel();
            if(lines.length <= 0) {
                utl.Alert.showErrorMsg($translate.instant('No items Selected'));
                return;
            }
            var actionName = '';
            if ($scope.items.Id && $scope.items.Id > 0) {
                actionName = 'Billing/BillingRequest/UpdateBillingRequest';
            }
            var options = {
                action: actionName,
                data: {
                    Data: {
                        Header: {IsDetailBill: true, StatusId: 2},
                        Details: lines
                    }
                },
                type: 'post',
                onComplete: $scope.CancelApprovedCallback
            };
            utl.Http.doAction(options);
        };
        $scope.CancelRejectedCallback = function (scope, data, options, hasError) {
             utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
             $scope.confirmCallback();
            // $scope.UpdatePatientBillsForCancel();
        };
        $scope.CancelRejected = function () {

            $scope.items.BillingRequestStatusId = 3;
            $scope.items.Id = $scope.currentcontextedit.billrequestid;
            var lines = $scope.getLinesForSaveCancel();
            var actionName = 'Billing/BillingRequest/UpdateBillingRequest';
            // var actionName = 'Billing/BillingRequest/AddBillingRequest';
            // if ($scope.items.Id && $scope.items.Id > 0) {
            //     actionName = 'Billing/BillingRequest/UpdateBillingRequest';
            // }
            var options = {
                action: actionName,
                data: {
                    Data: {
                        Header: {IsDetailBill: true, StatusId: 3},
                        Details: lines
                    }
                },
                type: 'post',
                onComplete: $scope.CancelRejectedCallback
            };
            utl.Http.doAction(options);
        };
        $scope.patientChange();
        $scope.getRequestBillDetails();
        $scope.refreshReactProps();

        // React bridge dispatcher: EditDetailIpBillingRequestHeaderScreen
        // (mounted before the native <ippatientbanner>) and
        // EditDetailIpBillingRequestListScreen (mounted after it).
        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'toggleSelect':
                    for (var idx in $scope.BillDetails) {
                        if ($scope.BillDetails[idx].Id == payload.id) {
                            $scope.BillDetails[idx].isSelected = payload.value;
                            break;
                        }
                    }
                    $scope.refreshReactProps();
                    break;
                case 'approve':
                    $scope.CancelApproved();
                    break;
                case 'reject':
                    $scope.CancelRejected();
                    break;
                case 'close':
                    $scope.cancelCallback();
                    break;
            }
            $scope.$applyAsync();
        };
    }
    editdetipbillingrequestController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();