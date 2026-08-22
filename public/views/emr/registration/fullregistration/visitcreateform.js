(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VisitCreateController', VisitCreateController);

    function VisitCreateController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        var savehitcompleted = 0;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.patientid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.DoctorClassId = 0;
        $scope.DrIncludeTax = false;
        $scope.DrShareDetailInfo = {};
        $scope.SerItmCalculateTax = false;
        $scope.SerItmGSTInfo = {};
        $scope.item = {};
        $scope.Checkout = {};
        $scope.ScheduledAppointment = {};
        $scope.IsMRDFileCreation = 0;
        $scope.IsMRDFileRequest = 0;
        $scope.NoofPrintPatientLabel = 1;
        $scope.NoofPrintMRDLabel = 1;
        $scope.EncounterStatus = '';
        $scope.BillInfo = [];
        $scope.DrTeam = [];
        $scope.LastVisitDate = null;
        $scope.IsLastSurgeryVisit = false;
        $scope.PatGuarantorNoofFreeVisit = 0;
        $scope.PatientGuarantor = 0;
        // $scope.currentcontext = {};
        $scope.pastvisitinfo = [];
        $scope.DefaultServiceTotalAmt = 0;
        $scope.DefaultServiceInfo = [];
        $scope.DrDefaultServiceInfo = [];
        $scope.PatientPaymentDetails = [];
        $scope.lookup = {};
        $scope.currentcontext.PatientStatusId = 1;
        $scope.currentcontext.DiscountModeId = 2;
        $scope.currentcontext.id = 0;
        $scope.currentcontext.RdoBillDiscount = true;
        $scope.currentcontext.RdoReceiptAmt = true;
        $scope.currentcontext.RdoBillDiscountMode = true;
        $scope.currentcontext.BillDiscount = 0;
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.TotNetAmount = 0;
        $scope.currentcontext.DiscountApprovedBy = -1;
        $scope.currentcontext.TotDiscAmount = 0;
        $scope.currentcontext.PaidAmt = 0;
        $scope.currentcontext.ReceiptAmt = null;
        $scope.currentcontext.TotBalanceAmt = 0;
        $scope.currentcontext.TotDueAmt = 0;
        $scope.currentcontext.GuarantorTypeId = 1;
        $scope.currentcontext.GrossAmount = 0;
        $scope.currentcontext.file = null;
        $scope.currentcontext.Photo = null;
        $scope.requirefreevisitalert = 0;
        $scope.currentcontext.StartDate = utl.Formatter.getCurrentDate();
        $scope.DisableReferral = false;
        $scope.requirefreevisitalert = utl.FacilitySetting.getFacilitySettingValue('billing', 'freevisitalert');

        $scope.IsDiscountApproved = false;
        $scope.BillWithComeReceipt = true;
        $scope.NooFVisitFreeDisabled = false;
        $scope.pastvisitinfo = [];
        $scope.fillDefaultValues = function () {
            var currentdate = utl.Formatter.getCurrentDate();
            $scope.pastvisitinfo = [];
            $scope.PatientGuarantor = 0;
            $scope.DefaultServiceTotalAmt = 0;
            $scope.PatientPaymentDetails = [];
            $scope.DefaultServiceInfo = [];
            $scope.lookup = {};
            $scope.currentcontext.PatientStatusId = 1;
            $scope.currentcontext.id = 0;
            $scope.currentcontext.RdoBillDiscount = true;
            $scope.currentcontext.RdoReceiptAmt = true;
            $scope.currentcontext.RdoBillDiscountMode = true;
            $scope.currentcontext.BillDiscount = 0;
            $scope.currentcontext.PaymentTypeId = 1;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.DiscountApprovedBy = -1;
            $scope.currentcontext.TotDiscAmount = 0;
            $scope.currentcontext.PaidAmt = 0;
            $scope.currentcontext.ReceiptAmt = null;
            $scope.currentcontext.TotBalanceAmt = 0;
            $scope.currentcontext.TotDueAmt = 0;
            $scope.currentcontext.GrossAmount = 0;
            $scope.IsDiscountApproved = false;
            $scope.BillWithComeReceipt = true;
            $scope.tabindexmap = {
                patienttabindex: 1,
                detailtabindex: 2
            };
            $scope.item.NoDraftBill = 1; // will not create draft bill
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.DoctorId = -1;
            $scope.item.DiagnosisId = -1;
            $scope.item.OtherDiagnosis = '';
            $scope.item.DepartmentId = -1;
            $scope.item.Id = 0;
            $scope.currentcontext.GuarantorTypeId = 1;
            $scope.item.GuarantorId = -1;
            $scope.item.AppointmentCategoryId = 5;
            $scope.item.AcutalGuarantorId = 0;
            $scope.item.VisitTypeId = 1;
            $scope.item.IsOPD = true;
            $scope.item.RegisteredDate = utl.Formatter.getDateStringForAppointment(currentdate);
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.IsPaidVisit = 0;
            $scope.item.FreeVisit = 0;
            $scope.item.LastFreeVisit = 0;
            $scope.item.IsNoBill = false;
            $scope.item.IsEmergency = false;
            $scope.GetGuarantor();
        };
        $scope.backToList = function () {
            $state.go('app.appointments');
        }

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }


        $scope.openPastVisit = function () {
            utl.Modal.openFixedDialog('app.previousappointment', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId || 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.CalculateNetAmt = function () {

            // $scope.CalculateDoctorShare();

            if ($scope.currentcontext.PaymentTypeId == 6) {
                $scope.currentcontext.PaymentTypeId = 1;
            }
            var itemwiseGrossAmt = 0
            var itemwiseSchDiscAmt = 0
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            var itemnetAmount = 0;
            var itemGrossAmount = 0;
            var itemDiscountAmount = 0;
            var itemSchemeDiscAmt = 0;
            for (var i = 0, len = $scope.DefaultServiceInfo.length; i < len; i++) {
                itemGrossAmount = isNaN(parseFloat($scope.DefaultServiceInfo[i].Amount)) ? 0 : parseFloat($scope.DefaultServiceInfo[i].Amount);
                itemnetAmount = isNaN(parseFloat($scope.DefaultServiceInfo[i].NetAmount)) ? 0 : parseFloat($scope.DefaultServiceInfo[i].NetAmount);
                itemSchemeDiscAmt = isNaN(parseFloat($scope.DefaultServiceInfo[i].SchemeDiscountAmt)) ? 0 : parseFloat($scope.DefaultServiceInfo[i].SchemeDiscountAmt);
                itemDiscountAmount = 0;
                itemwiseSchDiscAmt += itemSchemeDiscAmt;
                itemwiseGrossAmt += itemGrossAmount;
                itemwiseNetAmt += itemnetAmount;
                itemwiseDiscountAmt += itemDiscountAmount;
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : $scope.currentcontext.PaidAmt;
            $scope.currentcontext.TotNetAmount = itemwiseNetAmt;
            $scope.currentcontext.TotBalanceAmt = 0;
            $scope.currentcontext.GrossAmount = itemwiseGrossAmt;
            $scope.currentcontext.SchemeDiscAmount = itemwiseSchDiscAmt;
            $scope.currentcontext.TotDiscAmount = 0;
            $scope.DefaultServiceGrossAmt = $scope.currentcontext.GrossAmount;
            $scope.DefaultServiceTotalAmt = $scope.currentcontext.TotNetAmount;
            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : $scope.currentcontext.ReceiptAmt;
            $scope.currentcontext.TotBalanceAmt = parseFloat((parseFloat($scope.DefaultServiceTotalAmt) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt)).toFixed(2));
            if (parseFloat($scope.currentcontext.BillDiscount) > 0) {
                if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.currentcontext.GrossAmount;

                } else if ($scope.currentcontext.DiscountModeId == 1) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
            }
            if ($scope.currentcontext.SchemeDiscAmount > 0) {
                $scope.currentcontext.TotDiscAmount += $scope.currentcontext.SchemeDiscAmount;
            }
            if ($scope.currentcontext.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit != null && $scope.currentcontext.TotDiscAmount > $scope.DiscountLimit) {
                        $scope.currentcontext.BillDiscount = 0;
                        $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                        utl.Alert.showErrorMsg($scope.DiscountAlert);
                        $scope.IsDiscountApproved = false;
                    }
                } else {
                    //                     $scope.currentcontext.BillDiscount = 0;
                    $scope.DiscountAlert = 'Please Select Discount Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }

            // if (!$scope.currentcontext.ReceiptAmt) {
            //     // $scope.currentcontext.ReceiptAmt = 0;
            //     $scope.currentcontext.ReceiptAmt = parseFloat($scope.DefaultServiceGrossAmt) - parseFloat($scope.currentcontext.TotDiscAmount || 0);
            //     if ($scope.currentcontext.SchemeDiscAmount > 0) {
            //         $scope.currentcontext.ReceiptAmt = parseFloat($scope.DefaultServiceTotalAmt) - parseFloat($scope.currentcontext.SchemeDiscAmount || 0);
            //     }
            // }
            if ($scope.currentcontext.ReceiptAmt > 0 && $scope.currentcontext.TotDiscAmount > 0) {
                $scope.DefaultServiceTotalAmt = parseFloat($scope.DefaultServiceGrossAmt) -
                    parseFloat($scope.currentcontext.TotDiscAmount || 0);
                if ($scope.currentcontext.ReceiptAmt > $scope.DefaultServiceTotalAmt) {
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.DefaultServiceGrossAmt) - parseFloat($scope.currentcontext.TotDiscAmount || 0);
                }
            }
            // if ($scope.currentcontext.ReceiptAmt) {
            $scope.DefaultServiceTotalAmt = parseFloat($scope.DefaultServiceGrossAmt) -
                parseFloat($scope.currentcontext.TotDiscAmount || 0);
            // }
            if ($scope.currentcontext.SchemeDiscAmount > 0) {
                $scope.DefaultServiceTotalAmt = parseFloat($scope.DefaultServiceGrossAmt) -
                    parseFloat($scope.currentcontext.SchemeDiscAmount || 0);
                // $scope.currentcontext.ReceiptAmt = parseFloat($scope.DefaultServiceTotalAmt) - parseFloat($scope.currentcontext.SchemeDiscAmount);
            }
            if ($scope.currentcontext.ReceiptAmt < 0) $scope.currentcontext.ReceiptAmt = 0;


            $scope.currentcontext.Received = $scope.currentcontext.ReceiptAmt != 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.PaidAmt != 0 ? $scope.currentcontext.PaidAmt : 0;
            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? null : $scope.currentcontext.ReceiptAmt;

            var NetNaturalValue = getNatural(Number($scope.currentcontext.Received).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.Received).toFixed(2));
            var NetRoundOffValue = 0;
            $scope.currentcontext.RoundOffValue = 0;
            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.ReceiptAmt = NetNaturalValue;
                $scope.currentcontext.Received = NetNaturalValue;
                NetRoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.ReceiptAmt = NetNaturalValue + 1;
                $scope.currentcontext.Received = NetNaturalValue + 1;
                NetRoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else {
                NetRoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.DefaultServiceGrossAmt) - parseFloat($scope.currentcontext.TotDiscAmount);
            $scope.currentcontext.TotBalanceAmt = (parseFloat($scope.DefaultServiceTotalAmt) + $scope.currentcontext.RoundOffValue || 0) - parseFloat($scope.currentcontext.ReceiptAmt || 0) - parseFloat($scope.currentcontext.PaidAmt || 0);
            var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.PaidAmt);
            $scope.item.Received = $scope.currentcontext.ReceiptAmt;
            if (!$scope.SaveCompleted) {
                try {
                    $scope.currentcontext.TotBalanceAmt = $scope.currentcontext.TotBalanceAmt.toFixed(2);
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt);
                } catch (ex) { }
                if ($scope.currentcontext.TotDiscAmount > 0) {
                    if ($scope.currentcontext.ReceiptAmt > $scope.DefaultServiceGrossAmt || $scope.currentcontext.TotBalanceAmt < 0) {
                        $scope.currentcontext.ReceiptAmt = null;
                        $scope.currentcontext.BillDiscount = 0;
                        $scope.currentcontext.TotBalanceAmt = billBalance;
                        utl.Alert.showErrorMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
                    }
                }
                if ($scope.currentcontext.TotDiscAmount > $scope.DefaultServiceGrossAmt) {
                    // if ($scope.currentcontext.TotDiscAmount > $scope.DefaultServiceGrossAmt || $scope.currentcontext.TotBalanceAmt < 0) {
                    $scope.currentcontext.dBillDiscount = 0;
                    $scope.currentcontext.ReceiptAmt = null;
                    $scope.currentcontext.BillDiscount = 0;
                    $scope.currentcontext.TotBalanceAmt = 0;
                    utl.Alert.showErrorMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
                }
            }
            if ($scope.BillInfo && $scope.BillInfo.length > 0) {
                $scope.setDispBillinfo();
            }
        };

        $scope.updateReceiptAmt = function () {
            if ($scope.currentcontext.TotNetAmount == ($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue)) {
                if ($scope.currentcontext.TotNetAmount !== 0.00) {
                    if ($scope.currentcontext.id === 0 || $scope.item.PatientBillStatusId === 1) {
                        if (!$scope.item.Received) {
                            $scope.item.Received = 0;
                        }
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.item.Received) + parseFloat($scope.currentcontext.TotNetAmount);
                    } else {
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotNetAmount);
                    }
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
                }
                $scope.currentcontext.TotBalanceAmt = 0.00;
            } else {
                if (($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue) !== 0.00) {
                    if ($scope.currentcontext.id === 0 || $scope.item.PatientBillStatusId === 1) {
                        if (!$scope.item.Received) {
                            $scope.item.Received = 0;
                        }
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.item.Received) + parseFloat(($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue));
                    } else {
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat(($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue));
                    }
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
                }
                $scope.currentcontext.TotBalanceAmt = 0.00;
            }
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.setDefaultServiceCallback = function (scope, data, options, hasError) {
            $scope.DefaultServiceTotalAmt = 0;
            $scope.DefaultServiceGrossAmt = 0;
            if (data) {
                $scope.DefaultServiceInfo = data;
            }
            for (var idx in $scope.DefaultServiceInfo) {
                var item = $scope.DefaultServiceInfo[idx];
                if ($scope.CategoryPromotions && $scope.CategoryPromotions.length > 0) {
                    for (var ctsc in $scope.CategoryPromotions) {
                        var catescheme = $scope.CategoryPromotions[ctsc];
                        if (catescheme.ServiceCategoryId == item.ServiceCategoryId) {
                            if ($scope.currentcontext.DiscountModeId > 0) {
                                $scope.DefaultServiceInfo[idx].IsSchemeDiscount = true;
                                if ($scope.currentcontext.DiscountModeId == 2) {
                                    if (catescheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                        item.Amount = item.Quantity * parseFloat(item.Rate);
                                        $scope.DefaultServiceInfo[idx].SchemeDiscountRate = parseFloat(catescheme.Discount).toFixed(2);
                                        $scope.DefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(item.Amount) *
                                            (parseFloat(catescheme.Discount) / 100);
                                    }
                                } else if ($scope.currentcontext.DiscountModeId == 1) {
                                    if (catescheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                        $scope.DefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(catescheme.Discount).toFixed(2);
                                    }
                                }
                            } else {
                                utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                            }
                        }
                    }
                }

                if ($scope.ItemPromotions && $scope.ItemPromotions.length > 0) {
                    for (var itsc in $scope.ItemPromotions) {
                        var itemScheme = $scope.ItemPromotions[itsc];
                        if (itemScheme.ServiceItemId === item.ServiceId) {
                            if ($scope.currentcontext.DiscountModeId > 0) {
                                if ($scope.currentcontext.DiscountModeId == 2) {
                                    $scope.DefaultServiceInfo[idx].IsSchemeDiscount = true;
                                    if (itemScheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                        item.Amount = item.Quantity * parseFloat(item.Rate);
                                        $scope.DefaultServiceInfo[idx].SchemeDiscountRate = parseFloat(itemScheme.Discount).toFixed(2);
                                        $scope.DefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(item.Amount) *
                                            (parseFloat(catescheme.Discount) / 100);
                                    }
                                } else if ($scope.currentcontext.DiscountModeId == 1) {
                                    if (itemScheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                        $scope.DefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(itemScheme.Discount).toFixed(2);
                                    }
                                }
                            } else {
                                utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                            }
                        }
                    }
                }
                if (parseFloat(item.SchemeDiscountAmt) > 0) {
                    item.NetAmount = parseFloat(item.Amount) - parseFloat(item.SchemeDiscountAmt);
                }
                if ($scope.item.IsEmergency)
                    $scope.DefaultServiceInfo[idx].Amount = item.EmergencyRate;

                $scope.DefaultServiceGrossAmt += item.GrossAmount;
                $scope.DefaultServiceTotalAmt += item.NetAmount;
            }

            if (!$scope.SaveCompleted)
                $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;

            if ($scope.DefaultServiceTotalAmt > 0) {
                $scope.currentcontext.RdoBillDiscount = false;
                $scope.currentcontext.RdoReceiptAmt = false;
                $scope.currentcontext.RdoBillDiscountMode = false;
            } else {
                $scope.currentcontext.RdoBillDiscount = true;
                $scope.currentcontext.RdoReceiptAmt = true;
                $scope.currentcontext.RdoBillDiscountMode = true;
            }
            $scope.CalculateNetAmt();

            if ($scope.item.IsNoBill)
                $scope.NoBill();

            $scope.getDoctorDefaultService();

            $scope.getPaidVisitInfo();

        };

        $scope.EligibleDaysforPaidVisit = function () {
            var CurrentServerDate = null;

            if (!$scope.item.LastFreeVisit)
                $scope.item.LastFreeVisit = 0;

            if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                try {
                    $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].DischargeDate);
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }
            if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                try {
                    $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].AdmissionDate);
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }

            if ($scope.item.VisitTypeId > 1 && $scope.LastVisitDate) {
                var SelectedDefaultService = $scope.DefaultServiceInfo;
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                for (var idx in SelectedDefaultService) {
                    var defaultserviceitem = SelectedDefaultService[idx];
                    try {
                        CurrentServerDate = utl.Formatter.getDate(defaultserviceitem.CurrentDate);
                    } catch (ex) {
                        CurrentServerDate = null;
                    }
                    var vEligibledaysfrom = defaultserviceitem.DefaultFacilityEligibleDaysFrom;
                    var vEligibledays = defaultserviceitem.DefaultFacilityEligibleDays;
                    var vSurgeryNoofVisitFree = defaultserviceitem.DefaultFacilityNoofVisitFree;
                    var date1 = $scope.LastVisitDate;
                    var date2 = CurrentServerDate;
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (vEligibledaysfrom <= diffDays && diffDays <= vEligibledays) {
                        $scope.DefaultServiceInfo.push(defaultserviceitem);
                        if ($scope.IsLastSurgeryVisit) {
                            if (vSurgeryNoofVisitFree) { // Last Surgery Visit Free
                                if (vEligibledays >= diffDays &&
                                    vSurgeryNoofVisitFree >= $scope.item.LastFreeVisit) {
                                    $scope.DefaultServiceInfo = [];
                                    $scope.DefaultServiceTotalAmt = 0;
                                    $scope.CalculateNetAmt();
                                }
                            }
                        } else { // Last Guarantor Visit Free
                            if ($scope.PatGuarantorNoofFreeVisit) {
                                if (vEligibledays >= diffDays &&
                                    $scope.PatGuarantorNoofFreeVisit >= $scope.item.LastFreeVisit) {
                                    $scope.DefaultServiceInfo = [];
                                    $scope.DefaultServiceTotalAmt = 0;
                                    $scope.CalculateNetAmt();
                                }
                            }
                        }
                    } else if (diffDays > vEligibledays) {
                        $scope.DefaultServiceInfo.push(defaultserviceitem);
                        $scope.item.NewVisitFree = 0;
                    }
                }
                $scope.currentcontext.ReceiptAmt = 0;
                for (var idx in $scope.DefaultServiceInfo) {
                    var item = $scope.DefaultServiceInfo[idx];
                    $scope.DefaultServiceGrossAmt += item.GrossAmount;
                    $scope.DefaultServiceTotalAmt += item.NetAmount;
                }
                if (!$scope.SaveCompleted) {
                    $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;
                    $scope.CalculateNetAmt();
                }
            }

            if ($scope.SaveCompleted) {
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                $scope.CalculateNetAmt();
            }
        };

        $scope.getPaidVisitInfoCallback = function (scope, res, options, hasError) {
            var PaidVisitInfo = []
            if (res.Data.length > 0) {
                PaidVisitInfo = res.Data;
            }
            try {
                if (PaidVisitInfo.length > 0) {
                    var vDischargeDate = PaidVisitInfo[0].DischargeDate;
                    $scope.LastVisitDate = utl.Formatter.getDate(vDischargeDate);
                }
            } catch (ex) {
                $scope.LastVisitDate = null;
            }
            if (!$scope.LastVisitDate) {
                try {
                    if (PaidVisitInfo.length > 0) {
                        var vAdmissionDate = PaidVisitInfo[0].AdmissionDate;
                        $scope.LastVisitDate = utl.Formatter.getDate(vAdmissionDate);
                    }
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }
            $scope.EligibleDaysforPaidVisit();
        };

        $scope.getPaidVisitInfo = function () {
            if ($scope.item && $scope.item.PatientId) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    {
                        Key: 44,
                        Value: 1
                    },
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPaidVisitInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.calculatefreevisit = function () {
            if ($scope.pastvisitinfo.length > 0) {
                $scope.item.LastFreeVisit = $scope.pastvisitinfo[0].FreeVisit;
                $scope.item.LastFreeVisit++;
                $scope.item.FreeVisit = $scope.item.LastFreeVisit;
            } else {
                $scope.item.LastFreeVisit = 0;
                $scope.item.FreeVisit = 0;
            }
        }

        $scope.setDefaultService = function () {
            $scope.DefaultServiceInfo = [];
            var GuarantorId_ = 0;
            var ServiceRateCategoryId_ = 0;
            if ($scope.item.GuarantorId > 0) {
                var GuarantorId = $scope.item.GuarantorId;
                var SelectedGuarantor = utl.Lookup.getObject($scope.lookup.Guarantor, GuarantorId);
                if ($scope.lookup.Guarantor.length == 0 && $scope.item.PromotionalSchemeId > 0) {
                    var SelectedGuarantor = $scope.SelectedGuarantor;
                }
                if ($scope.lookup.Guarantor.length > 0) {
                    $scope.SelectedGuarantor = SelectedGuarantor;
                }
                if (SelectedGuarantor) {
                    if ($scope.PatientGuarantor == 0) {
                        GuarantorId_ = SelectedGuarantor.Id;
                        $scope.item.AcutalGuarantorId = GuarantorId_;
                        ServiceRateCategoryId_ = SelectedGuarantor.ServiceRateCategoryId;
                        $scope.item.ServiceRateCategoryId_ = ServiceRateCategoryId_;
                        $scope.item.GuarantorName = SelectedGuarantor.Text;
                    } else {
                        GuarantorId_ = SelectedGuarantor.Id;
                        $scope.item.AcutalGuarantorId = GuarantorId_;
                        $scope.currentcontext.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
                        ServiceRateCategoryId_ = SelectedGuarantor.ServiceRateCategoryId;
                        $scope.item.ServiceRateCategoryId_ = ServiceRateCategoryId_;
                        $scope.item.GuarantorName = SelectedGuarantor.Text;
                    }
                    var NewVisit = 1;
                    if ($scope.pastvisitinfo.length > 0) NewVisit = 2;
                    var Data = {
                        'NewVisit': NewVisit,
                        'FacilityId': utl.Session.getCurrentFacilityId(),
                        'GuarantorTypeId': $scope.currentcontext.GuarantorTypeId,
                        'GuarantorId': GuarantorId_,
                        'GuarantorServiceRateCategoryId': ServiceRateCategoryId_,
                    };
                    var options = {
                        action: 'Visit/Visit/GetOPDefaultServices',
                        data: {
                            Data
                        },
                        type: 'post',
                        onComplete: $scope.setDefaultServiceCallback
                    };
                    utl.Http.doAction(options);
                }
            }

            $scope.calculatefreevisit();
            $scope.CalculateNetAmt();
        };

        $scope.getDoctorDefaultServiceCallback = function (scope, data, options, hasError) {
            $scope.DrDefaultServiceInfo = [];
            var CurrentServerDate = null;

            // if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
            //     try {
            //         $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].DischargeDate);
            //     } catch (ex) { $scope.LastVisitDate = null; }
            // }

            if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                try {
                    $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].AdmissionDate);
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }



            if (data) {
                $scope.DrDefaultServiceInfo = data;
                for (var idx in $scope.DrDefaultServiceInfo) {
                    var defaultserviceitem = $scope.DrDefaultServiceInfo[idx];
                    if ($scope.CategoryPromotions && $scope.CategoryPromotions.length > 0) {
                        for (var ctsc in $scope.CategoryPromotions) {
                            var catescheme = $scope.CategoryPromotions[ctsc];
                            if (catescheme.ServiceCategoryId == defaultserviceitem.ServiceCategoryId) {
                                if ($scope.currentcontext.DiscountModeId > 0) {
                                    $scope.DrDefaultServiceInfo[idx].IsSchemeDiscount = true;
                                    if ($scope.currentcontext.DiscountModeId == 2) {
                                        if (catescheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                            defaultserviceitem.Amount = defaultserviceitem.Quantity * parseFloat(defaultserviceitem.Rate);
                                            $scope.DrDefaultServiceInfo[idx].SchemeDiscountRate = parseFloat(catescheme.Discount).toFixed(2);
                                            $scope.DrDefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(defaultserviceitem.Amount) *
                                                (parseFloat(catescheme.Discount) / 100);
                                        } else if (catescheme.DiscountModeId == 1) {
                                            utl.Alert.showErrorMsg($translate.instant('Selected Scheme not mapped for this Discount Mode'));
                                            // $scope.currentcontext.DiscountModeId = 1;
                                        }
                                    } else if ($scope.currentcontext.DiscountModeId == 1) {
                                        if (catescheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                            $scope.DrDefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(catescheme.Discount).toFixed(2);
                                        } else if (catescheme.DiscountModeId == 2) {
                                            utl.Alert.showErrorMsg($translate.instant('Selected Scheme not mapped for this Discount Mode'));
                                            // $scope.currentcontext.DiscountModeId = 2;
                                        }
                                    }
                                } else {
                                    utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                                }
                            }
                        }
                    }

                    if ($scope.ItemPromotions && $scope.ItemPromotions.length > 0) {
                        for (var itsc in $scope.ItemPromotions) {
                            var itemScheme = $scope.ItemPromotions[itsc];
                            if (itemScheme.ServiceItemId === defaultserviceitem.ServiceId) {
                                if ($scope.currentcontext.DiscountModeId > 0) {
                                    if ($scope.currentcontext.DiscountModeId == 2) {
                                        $scope.DrDefaultServiceInfo[idx].IsSchemeDiscount = true;
                                        if (itemScheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                            defaultserviceitem.Amount = defaultserviceitem.Quantity * parseFloat(defaultserviceitem.Rate);
                                            $scope.DrDefaultServiceInfo[idx].SchemeDiscountRate = parseFloat(itemScheme.Discount).toFixed(2);
                                            $scope.DrDefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(defaultserviceitem.Amount) *
                                                (parseFloat(catescheme.Discount) / 100);
                                        }
                                    } else if ($scope.currentcontext.DiscountModeId == 1) {
                                        if (itemScheme.DiscountModeId == $scope.currentcontext.DiscountModeId) {
                                            $scope.DrDefaultServiceInfo[idx].SchemeDiscountAmt = parseFloat(itemScheme.Discount).toFixed(2);
                                        }
                                    }
                                } else {
                                    utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                                }
                            }
                        }
                    }
                    if (parseFloat($scope.DrDefaultServiceInfo[idx].SchemeDiscountAmt) > 0) {
                        $scope.DrDefaultServiceInfo[idx].NetAmount = parseFloat($scope.DrDefaultServiceInfo[idx].Amount) - parseFloat($scope.DrDefaultServiceInfo[idx].SchemeDiscountAmt);
                    }
                }

            }
            if ($scope.item.VisitTypeId > 1 && $scope.LastVisitDate) {
                for (var idx in $scope.DrDefaultServiceInfo) {
                    var item = $scope.DrDefaultServiceInfo[idx];

                    if ($scope.item.IsEmergency)
                        $scope.DrDefaultServiceInfo[idx].Amount = item.EmergencyRate;
                }
                var drdeftserviceinfo = $scope.DrDefaultServiceInfo;
                // $scope.DrDefaultServiceInfo = [];
                for (var idx in drdeftserviceinfo) {
                    var defaultserviceitem = drdeftserviceinfo[idx];
                    try {
                        CurrentServerDate = utl.Formatter.getDate(defaultserviceitem.CurrentDate);
                    } catch (ex) {
                        CurrentServerDate = null;
                    }
                    var vEligibledaysfrom = defaultserviceitem.DefaultFacilityEligibleDaysFrom;
                    var vEligibledays = defaultserviceitem.DefaultFacilityEligibleDays;
                    var vNoOfConsultationFree = defaultserviceitem.DefaultFacilityNoofVisitFree;
                    var date1 = $scope.LastVisitDate;
                    var date2 = CurrentServerDate;
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (vEligibledaysfrom <= diffDays && diffDays <= vEligibledays) {
                        $scope.DrDefaultServiceInfo = [];
                        $scope.DrDefaultServiceInfo.push(defaultserviceitem);
                        if (vNoOfConsultationFree > 0 && // No of Consultation free
                            vNoOfConsultationFree > ($scope.item.FreeVisit - 1)) {
                            $scope.DrDefaultServiceInfo = [];
                        }
                    } else if (diffDays > vEligibledays) {
                        $scope.DrDefaultServiceInfo = [];
                        $scope.DrDefaultServiceInfo.push(defaultserviceitem);
                        $scope.item.NewVisitFree = 0;
                    }
                }
            }


            if (!$scope.SaveCompleted) {
                $scope.currentcontext.ReceiptAmt = 0;
                for (var idx in $scope.DrDefaultServiceInfo) {
                    var item = $scope.DrDefaultServiceInfo[idx];
                    item.DoctorShareValue = item.DoctorShareValue;
                    if (item.SchemeDiscountAmt > 0) {
                        item.DoctorShare = item.NetAmount * (item.DoctorShareValue / 100);
                    } else {
                        item.DoctorShare = item.DoctorShareAmount;
                    }
                    if (item.DoctorShare > 0) {
                        item.IsInvoicedDoctorShare = true;
                    }
                    if ($scope.item.IsOPD) {
                        $scope.DefaultServiceInfo.push(item);
                    } else {
                        $scope.DefaultServiceInfo = $scope.DrDefaultServiceInfo;
                        $scope.DefaultServiceTotalAmt = 0;
                    }

                    $scope.DefaultServiceTotalAmt += item.NetAmount;
                    $scope.DefaultServiceGrossAmt += item.GrossAmount;
                    if (!$scope.item.NewVisitFree && !$scope.LastVisitDate) {
                        var vNoOfConsultationFree = item.DefaultFacilityNoofVisitFree;
                        $scope.item.NewVisitFree = vNoOfConsultationFree;
                    }
                }
                $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;
                $scope.CalculateNetAmt();
                $scope.CalculateDoctorShare();
            }

            if ($scope.SaveCompleted) {
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                $scope.CalculateNetAmt();
            }


        };

        $scope.getDoctorDefaultService = function () {
            $scope.autochargebasedondoctor =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'autochargebasedondoctor');
            if ($scope.autochargebasedondoctor) {
                if ($scope.item.DoctorId && $scope.item.DoctorId > 0) {
                    var NewVisit = $scope.item.VisitTypeId;
                    if (!NewVisit) NewVisit = 1;
                    var Data = {
                        'NewVisit': NewVisit,
                        'DoctorId': $scope.item.DoctorId,
                        'FacilityId': utl.Session.getCurrentFacilityId(),
                        'GuarantorTypeId': $scope.currentcontext.GuarantorTypeId,
                        'GuarantorId': $scope.item.AcutalGuarantorId,
                        'GuarantorServiceRateCategoryId': $scope.item.ServiceRateCategoryId_,
                    };
                    var options = {
                        action: 'SystemSettings/userdefaultservice/GetDoctorDefaultServices',
                        data: {
                            Data
                        },
                        type: 'post',
                        onComplete: $scope.getDoctorDefaultServiceCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            if ($scope.lookup.Guarantor && $scope.lookup.Guarantor.length > 1) {
                $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
                $scope.PatGuarantorNoofFreeVisit = 0;
                $scope.setDefaultService();
            }
        };

        $scope.GetGuarantor = function () {
            $scope.DefaultServiceTotalAmt = 0;
            $scope.currentcontext.ReceiptAmt = 0;
            $scope.DefaultServiceInfo = [];
            $scope.item.GuarantorId = -1;
            if (!$scope.currentcontext.GuarantorTypeId) {
                $scope.item.GuarantorId = -1;
                $scope.CalculateNetAmt();
            } else if ($scope.currentcontext.GuarantorTypeId <= 0) {
                $scope.item.GuarantorId = -1;
                $scope.CalculateNetAmt();
            } else {
                $scope.item.GuarantorId = 1;
                // if ($scope.PatientGuarantor == 0) {
                var inputData = [{
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.GuarantorTypeId
                        },
                        {
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }
                        ]
                    }
                }];
                $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
                // } else {
                //     $scope.getPatientGuarantor();
                // }
            }

        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                // {
                //     header: 'Doctor Id',
                //     field: 'DoctorId',
                //     datatype: 'string',
                //     headercls: 'td-code',
                //     fieldcls: 'td-code'
                // },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                // {
                //     header: 'Qualification',
                //     field: 'Qualification',
                //     datatype: 'string',
                //     headercls: 'td-Qualification',
                //     fieldcls: 'td-Qualification'
                // },
                {
                    header: 'Department',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-Department',
                    fieldcls: 'td-Department'
                },
                // {
                //     header: 'Speciality',
                //     field: 'Speciality',
                //     datatype: 'string',
                //     headercls: 'td-dept',
                //     fieldcls: 'td-dept'
                // },
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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.DepartmentName = selectedItem.UserDept.DepartmentName;
                if (selectedItem.Department) {
                    if (selectedItem.Department.IsEmergency == true)
                        $scope.item.IsEmergencyPatient = selectedItem.Department.IsEmergency;
                }
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.UserDept.DepartmentName, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            /* Doctor Share */
            $scope.DoctorClassId = selectedItem.DoctorClassId;
            $scope.DrIncludeTax = selectedItem.IsIncludeTax;
            $scope.DrShareDetailInfo = {};
            $scope.SerItmCalculateTax = false;
            $scope.SerItmGSTInfo = {};
            /* Doctor Share */

            $scope.item.ScheduleApptId = null;
            $scope.item.ScheduleApptTime = null;
            $scope.item.IsCheckedInAppt = false;
            $scope.item.DoctorName = result;
            $scope.DrDefaultServiceInfo = [];
            $scope.getDoctorTeam();
            $scope.getFollowupDeptwise();
            $scope.calDoctorShareInfo();
            return result;
        }

        $scope.getFollowupDeptwiseCallback = function (scope, res, options, hasError) {
            $scope.item.VisitTypeId = 1;
            if (res && res.Data && res.Data.length > 0 && !$scope.item.EncounterId) $scope.item.VisitTypeId = 2;
            else if (res && res.Data && res.Data.length > 1 && $scope.item.EncounterId) $scope.item.VisitTypeId = 2;
        }

        $scope.getFollowupDeptwise = function () {
            $scope.followupdeptwise =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'followupdeptwise');
            if ($scope.followupdeptwise) {
                if ($scope.item && $scope.item.PatientId) {
                    var inputData = {
                        Params: [{
                            Key: 4,
                            Value: $scope.item.PatientId
                        },
                        {
                            Key: 6,
                            Value: $scope.item.DepartmentId
                        },
                        {
                            Key: 15,
                            Value: 1
                        },
                        ],
                        PageContext: {
                            PageSize: 3,
                            PageNumber: 1
                        }
                    };
                    var options = {
                        action: 'Visit/Visit/GetEncounters',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getFollowupDeptwiseCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        }

        $scope.getDoctorTeamCallback = function (scope, res, options, hasError) {
            //console.log(res);
            $scope.lookup.Team = [];
            $scope.item.TeamId = -1;
            if (res && res.length > 0) {
                for (var idx in res) {
                    var SelectedTeamId = res[idx].TeamId;
                    $scope.lookup.Team.push(utl.Lookup.getObject($scope.DrTeam, SelectedTeamId));
                    if ($scope.lookup.Team.length > 0 && res[idx].IsDefault)
                        $scope.item.TeamId = SelectedTeamId;
                }
            }
        };

        $scope.getDoctorTeam = function () {
            if ($scope.item.DoctorId) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.DoctorId
                    },
                        // { Key: 3, Value: true },
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'SystemSettings/UserTeam/GetUserTeams',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDoctorTeamCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.calDoctorShareInfo = function () {
            $scope.DrShareDetailInfo = {};
            $scope.SerItmCalculateTax = false;
            $scope.SerItmGSTInfo = {};
            if ($scope.DoctorClassId > 0) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.DoctorClassId
                    },
                    {
                        Key: 4,
                        Value: 1
                    }, // EncounterTypeId
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/doctorshare/GetDoctorShare',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDoctorShareinfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.GetGuarantor();
            }
        }

        $scope.getDoctorShareinfoCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    $scope.DrShareDetailInfo = item.DoctorShareDetails;
                }
            }
            $scope.GetGuarantor();
        };


        $scope.CalculateDoctorShare = function () {
            try {
                if ($scope.DoctorClassId > 0 && $scope.DefaultServiceInfo.length > 0) {
                    var itemwiseGrossAmt = 0;
                    for (var i = 0, len = $scope.DefaultServiceInfo.length; i < len; i++) {
                        if ($scope.item.IsEmergency)
                            $scope.DefaultServiceInfo[i].Rate = $scope.DefaultServiceInfo[i].EmergencyRate;
                        $scope.DefaultServiceInfo[i].Amount = $scope.DefaultServiceInfo[i].Rate * $scope.DefaultServiceInfo[i].Quantity;
                        var itemGrossAmount = 0;
                        itemGrossAmount = isNaN(parseFloat($scope.DefaultServiceInfo[i].Amount)) ? 0 : parseFloat($scope.DefaultServiceInfo[i].Amount);
                        itemwiseGrossAmt += itemGrossAmount;
                    }
                    for (var idx1 in $scope.DefaultServiceInfo) {
                        var item = $scope.DefaultServiceInfo[idx1];
                        var discamt = 0;
                        var netamt = 0;
                        var amt = item.Amount;

                        //Line Item Discount
                        if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) { // percentage
                            discamt = (item.DiscountAmount / 100) * item.Amount;
                        } else if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 1) {
                            discamt = item.DiscountAmount;
                        }
                        netamt = amt - discamt;
                        item.NetAmount = netamt;
                        // Bill Level - Proportionate Discount
                        if ($scope.currentcontext.BillDiscount > 0) {
                            if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) {
                                discamt = $scope.currentcontext.BillDiscount / 100 * item.Amount;
                            } else if ($scope.currentcontext.DiscountModeId == 1) {
                                var disc_ = $scope.currentcontext.BillDiscount;
                                var linepercentage = (100 / itemwiseGrossAmt) * item.Amount;
                                var netdiscountrupees = disc_ / 100 * linepercentage;
                                discamt = netdiscountrupees;
                            }
                            netamt = amt - discamt;
                        }

                        if ($scope.DoctorClassId) {
                            for (var idx in $scope.DrShareDetailInfo) {
                                var shareitem = $scope.DrShareDetailInfo[idx];
                                if (shareitem.SharingTypeId == 1) { // Category wise share
                                    if (item.ServiceCategoryId == shareitem.ServiceCategoryId) {
                                        var EligiblePerAmount = 0;
                                        var SharePerAmount = 0;
                                        var TaxPerAmount = 0;
                                        item.DoctorClassId = $scope.DoctorClassId;
                                        item.EligiblePercentage = shareitem.EligiblePercentage;
                                        item.SharePercentage = shareitem.SharePercentage;
                                        item.ShareAmount = shareitem.ShareAmount;
                                        try {
                                            EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                            SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                            item.DoctorShare = SharePerAmount;
                                        } catch (ex) { }
                                        try {
                                            if ($scope.DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                item.GSTAmount = TaxPerAmount;
                                                item.DrTaxAmount = TaxPerAmount;
                                                item.DoctorShare += item.GSTAmount;
                                                item.NetAmount += item.GSTAmount;
                                            }
                                            item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                            item.NetAmount = parseFloat(item.NetAmount).toFixed(2);
                                            item.DoctorShare = parseFloat(item.DoctorShare);
                                            item.NetAmount = parseFloat(item.NetAmount);
                                        } catch (ex) { }
                                        break;
                                    }

                                } else if (shareitem.SharingTypeId == 2) { // Doctor wise share
                                    if (item.ServiceId == shareitem.ServiceId) {
                                        var EligiblePerAmount = 0;
                                        var SharePerAmount = 0;
                                        var TaxPerAmount = 0;
                                        item.DoctorClassId = $scope.DoctorClassId;
                                        item.EligiblePercentage = shareitem.EligiblePercentage;
                                        item.SharePercentage = shareitem.SharePercentage;
                                        item.ShareAmount = shareitem.ShareAmount;
                                        try {
                                            EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                            if (shareitem.SharePercentage == 0) {
                                                SharePerAmount = (EligiblePerAmount / 100) * shareitem.ShareAmount;
                                            } else {
                                                SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                            }
                                            item.DoctorShare = SharePerAmount;
                                        } catch (ex) { }
                                        try {
                                            if ($scope.DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                item.GSTAmount = TaxPerAmount;
                                                item.DrTaxAmount = TaxPerAmount;
                                                item.DoctorShare += item.GSTAmount;
                                                item.NetAmount += item.GSTAmount;
                                            }
                                            item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                            item.NetAmount = parseFloat(item.NetAmount).toFixed(2);
                                            item.DoctorShare = parseFloat(item.DoctorShare);
                                            item.NetAmount = parseFloat(item.NetAmount);
                                        } catch (ex) { }
                                        break;
                                    }
                                }
                            }
                        }

                    }
                }

            } catch (ex) { }

            $scope.currentcontext.ReceiptAmt = 0;
            $scope.DefaultServiceTotalAmt = 0;
            $scope.DefaultServiceGrossAmt = 0;
            if ($scope.item.NewVisitFree > 0 && $scope.item.VisitTypeId != 1) {
                $scope.DefaultServiceInfo = [];
            }
            for (var idx in $scope.DefaultServiceInfo) {
                var item = $scope.DefaultServiceInfo[idx];
                $scope.DefaultServiceGrossAmt += item.GrossAmount;
                $scope.DefaultServiceTotalAmt += item.NetAmount;
            }
            if (!$scope.SaveCompleted) {
                $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;
            }

        };



        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                },
                {
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 2,
                    Value: utl.Session.getCurrentFacilityId()
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
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

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }


        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Referral Code',
                field: 'ReferralCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Referral Name',
                field: 'ReferralName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Referral Type',
                field: 'ReferralType',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            },
            {
                header: 'PhoneNo',
                field: 'PhoneNo',
                datatype: 'string',
                headercls: 'td-phone',
                fieldcls: 'td-phone'
            },
            {
                header: 'Area',
                field: 'Area',
                datatype: 'string',
                headercls: 'td-area',
                fieldcls: 'td-area'
            }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };

        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.item.ReferTypeId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ReferralId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }

        $scope.addReferral = function () {
            utl.Modal.openFixedDialog('app.referraltab.details', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.referralChange = function () {
            var refObj = utl.Lookup.getObject($scope.lookup.Referral, $scope.item.ReferrerId);
            $scope.item.ReferTypeId = refObj.ReferralTypeId;
            $scope.item.ReferralName = refObj.Text;
        };


        $scope.getDefaultReferralCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var refObj = res.Data[0];
                $scope.item.ReferrerId = refObj.Id;
                $scope.item.ReferTypeId = 9;
                $scope.item.ReferralName = refObj.Text;
                $scope.item.ReferrerNumber = refObj.PhoneNo;
                $scope.item.ReferrerEmail = refObj.Email;
            }
        };


        $scope.getDefaultReferral = function () {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 6,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/referral/GetReferrals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDefaultReferralCallback
            };

            utl.Http.doAction(options);
        };

        $scope.referralTypeChangeCallback = function (scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        };

        $scope.referralTypeChange = function () {
            var inputData = [{
                Key: "Referral",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: $scope.item.ReferTypeId
                    }]
                }
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.referralTypeChangeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookupCall = function (inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };

        $scope.getPastVisitInfoCallback = function (scope, res, options, hasError) {
            $scope.item.LastFreeVisit = 0;
            if (res.Data.length > 0) {
                $scope.pastvisitinfo = res.Data;
            }
            $scope.pastvisitinfo = _.orderBy($scope.pastvisitinfo, 'CreatedAt', 'desc');
            for (var idx in $scope.pastvisitinfo) {
                $scope.pastvisitinfo[idx].visitno = $scope.pastvisitinfo.length - idx;
            }
            try {
                if ($scope.pastvisitinfo.length > 0) {
                    $scope.getSurgeryVisitInfo($scope.pastvisitinfo[0].Id);

                    if ($scope.pastvisitinfo.length > 0) {
                        $scope.item.LastFreeVisit = $scope.pastvisitinfo[0].FreeVisit;
                    }
                    $scope.item.LastFreeVisit++;
                    $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                    if (!$scope.item.NooFVisitFree) {
                        $scope.item.NooFVisitFree = 0;
                        $scope.NooFVisitFreeDisabled = false;
                    } else $scope.NooFVisitFreeDisabled = true;
                }
            } catch (ex) {
                $scope.item.LastFreeVisit = 0;
            }

            $scope.item.VisitTypeId = 1;
            if ($scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                if ((!$scope.item.EncounterId && $scope.pastvisitinfo.length > 0) ||
                    ($scope.item.EncounterId && $scope.pastvisitinfo.length > 1) ||
                    ($scope.pastvisitinfo.length > 1)) {
                    $scope.item.VisitTypeId = 2;
                    $scope.getFollowupDeptwise();
                }
                $scope.MRDRequest = true;
            }
        };

        $scope.getPastVisitInfo = function () {
            if ($scope.item && $scope.item.PatientId) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    ],
                    PageContext: {
                        PageSize: 3,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPastVisitInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.afterSave = function (data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
            // if (window.clientcode.toLowerCase() == 'gloom') {
            //     $timeout(function () {
            //         //$scope.printOPBill();
            //         //$scope.printVisitSlip();
            //     }, 1000);
            // } else {
            //     $timeout(function () {
            //         $scope.printOPBill();
            //     }, 1000);
            // }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            if (data < 0) {
                handlePatientExists(data);
                $scope.EnableSave = true;
                $scope.currentcontext.canDisableApprove = false;
            } else {
                if (typeof (data) == 'number') {
                    $scope.EnableSave = true;
                    $scope.currentcontext.id = data;
                    $scope.afterSave(data, options);
                }
            }
        };

        $scope.errorItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
        };

        /* - Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveItem();
        };

        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };

        $scope.securitypincheck = function () {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.openFixedDialog('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* - Security IsValid */

        $scope.AlertForFreeVisit = function () {
            var msg = 'Now, Number of Free Visit is closed, can you continue Another guarantor';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: null,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return;

            if ($scope.IsOpenEncounter) {
                utl.Alert.showErrorMsg($translate.instant('registration.registrationcumvisit.exapp.lbl'));
                return false;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }


            if ($scope.currentcontext.GuarantorTypeId > 1 &&
                $scope.requirefreevisitalert) {
                try {
                    var noofvisitfree = 0;
                    noofvisitfree = parseInt($scope.item.NooFVisitFree);
                    $scope.item.NooFVisitFree = noofvisitfree;
                } catch (ex) { }

                if (!$scope.item.NooFVisitFree) {
                    $scope.AlertForFreeVisit();
                    return;
                } else if ($scope.item.NooFVisitFree == 0) {
                    $scope.AlertForFreeVisit();
                    return;
                }

            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */


            // if (!$scope.EnableSave) {
            var actionName = 'registration/patient/RegCumVisitWithBill';
            if ($scope.isSaveAndApprove) {
                $scope.currentcontext.canDisableApprove = true;
            }

            // if ($scope.item.FirstName.indexOf(' ') >= 0) {
            //     $scope.item.FirstName = $scope.item.FirstName.trim();
            // }
            $scope.item.QMSId = $scope.item.QMSId;
            $scope.item.MRNTypeId = 2;
            if ($scope.AppointmentId > 0) {
                $scope.item.AppointmentId = $scope.AppointmentId;
            }
            $scope.item.PatientStatus = 'Active';
            $scope.item.Id = $scope.currentcontext.patientid;
            $scope.item.NoDraftBill = 1; // will not create draft bill
            $scope.item.IsRegCumBill = 1;
            $scope.item.GuarantorTypeId = $scope.currentcontext.GuarantorTypeId;
            $scope.item.IsPaidVisit = 0;
            if (!$scope.item.IsNoBill) {
                if ($scope.DefaultServiceTotalAmt > 0) {
                    $scope.item.IsPaidVisit = 1;
                    $scope.item.FreeVisit = 0;
                } else {
                    $scope.item.IsPaidVisit = 0;
                    $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                }
            }

            if ($scope.currentcontext.GuarantorTypeId > 1 &&
                $scope.requirefreevisitalert) {
                if ($scope.item.NooFVisitFree) {

                    $scope.item.NooFVisitFree--;

                    if (!$scope.item.FreeVisit) $scope.item.FreeVisit++;
                    else $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                }
            }

            if ($scope.item.VisitTypeId != 1 && $scope.item.NewVisitFree) {
                $scope.item.NewVisitFree--;
            }

            savehitcompleted = 1;
            var options = {
                action: actionName,
                data: {
                    Data: {
                        Reg: {
                            Data: $scope.item,
                            file: null
                        },
                        Bill: {
                            Data: $scope.getBillDataforSave()
                        }
                    }
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
            // }
            $scope.CanShow = 1;
        };

        $scope.AddPaymentDetails = function () {
            $scope.PatientPaymentDetails = [];
            if (!$scope.PatientPaymentDetails || $scope.PatientPaymentDetails.length == 0) {
                if ($scope.currentcontext.ReceiptAmt > 0) {
                    $scope.currentcontext.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                    $scope.currentcontext.ReceiptTypeId = 2;
                    $scope.currentcontext.ReceiptStatusId = 1;
                }
            }
            var PatientPaymentDetail = {
                Id: 0,
                ReceiptDateTime: utl.Formatter.getCurrentDate(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                OrganizationId: utl.Session.getCurrentOrgId(),
                PatientId: $scope.item.PatientId,
                ReceiptTypeId: $scope.currentcontext.ReceiptTypeId,
                EncounterId: null,
                EncounterTypeId: 1,
                PatientName: $scope.item.PatientName,
                AmountPaid: $scope.currentcontext.ReceiptAmt,
                DepartmentID: $scope.item.DepartmentId,
                PaymentcounterID: 0,
                GuarantorId: null, // Bo Need to Update PatientGuarantor Id
                GuarantorTypeId: $scope.currentcontext.GuarantorTypeId,
                ReceiptGeneratedById: utl.Session.getCurrentUserId(),
                ReceiptApprovedById: utl.Session.getCurrentUserId(),
                PaymentTypeId: $scope.currentcontext.PaymentTypeId,
                DoctorId: $scope.item.DoctorId,
                PatientBillId: null,
                CardHolderName: null,
                AuthorizedCode: $scope.item.AuthorizeNumber,
                GurantorName: null,
                Comments: $scope.item.Comments,
                CancelReason: null,
                ReceiptStatusId: $scope.currentcontext.ReceiptStatusId,
                TDSAmount: 0.00,
                Disallowance: 0.00,
                RoundOffValue: null,
                CreditNoteId: null,
                PaymentStatusId: 3,
                CollectedOn: utl.Formatter.getCurrentDate(),
                CardNumber: '',
                CardDateTime: null,
                CardExpiryDate: null,
                TerminalNoId: $scope.item.TerminalNoId,
                BankId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1,
                PrivateDueId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.PrivateDueId : -1,
                CardTypeId: $scope.currentcontext.PaymentTypeId == 5 ? $scope.item.CardTypeId : -1,
                ChequeNo: $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '',
                UPIRefNumber: $scope.currentcontext.PaymentTypeId == 11 ? $scope.item.UPIRefNumber : '',
                ChequeDate: $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null,
                DDNumber: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null,
                DDDate: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null,
                WireTransferId: $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null,
                WireTransferDate: $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null,
            }

            $scope.PatientPaymentDetails.push(PatientPaymentDetail);
        };

        $scope.CalProportinateDiscount = function () {
            if ($scope.currentcontext.BillDiscount > 0) {
                var billingitem = null;
                if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) {
                    for (var per = 0, perlen = $scope.DefaultServiceInfo.length; per < perlen; per++) {
                        billingitem = $scope.DefaultServiceInfo[per];
                        billingitem.DiscountModeId = $scope.currentcontext.DiscountModeId;
                        billingitem.DiscountPercentage = $scope.currentcontext.BillDiscount;
                        billingitem.ProportionateDiscount = $scope.currentcontext.BillDiscount / 100 * $scope.DefaultServiceInfo[per].Amount;
                        billingitem.NetAmount = billingitem.Amount - billingitem.ProportionateDiscount;
                        if (billingitem.DoctorShareValue > 0) {
                            billingitem.DoctorShare = billingitem.NetAmount * (billingitem.DoctorShareValue / 100);
                        }
                    }
                } else if ($scope.currentcontext.DiscountModeId == 1) {
                    $scope.currentcontext.DiscountAmount = $scope.currentcontext.BillDiscount;
                    for (var inr = 0, inrlen = $scope.DefaultServiceInfo.length; inr < inrlen; inr++) {
                        billingitem = $scope.DefaultServiceInfo[inr];
                        var linepercentage = (100 / $scope.DefaultServiceGrossAmt) * $scope.DefaultServiceInfo[inr].NetAmount;
                        var netdiscountrupees = $scope.currentcontext.DiscountAmount / 100 * linepercentage;
                        billingitem.DiscountModeId = $scope.currentcontext.DiscountModeId;
                        billingitem.DiscountPercentage = 0;
                        billingitem.ProportionateDiscount = netdiscountrupees;
                        billingitem.NetAmount = billingitem.Amount - billingitem.ProportionateDiscount;
                        if (billingitem.DoctorShareValue > 0) {
                            billingitem.DoctorShare = billingitem.NetAmount * (billingitem.DoctorShareValue / 100);
                        }
                    }
                }
            } else {
                for (var idx in $scope.DefaultServiceInfo) {
                    var item = $scope.DefaultServiceInfo[idx];
                    item.DiscountAmount = 0;
                    item.DiscountModeId = 0;
                    item.DiscountPercentage = 0;
                    item.ProportionateDiscount = 0;
                }
            }
        };

        $scope.getBillDataforSave = function () {
            var Data = {};
            for (var idx in $scope.DefaultServiceInfo) {
                var item = $scope.DefaultServiceInfo[idx];
                item.ReceivedAmount = item.NetAmount;
            }

            if ($scope.DefaultServiceInfo.length > 0) {
                $scope.CalProportinateDiscount();
                $scope.AddPaymentDetails();
                var BillDiscount = 0;
                var totamt = $scope.DefaultServiceGrossAmt || 0;
                var receiptamt = $scope.currentcontext.ReceiptAmt || 0;
                BillDiscount = $scope.currentcontext.TotDiscAmount || 0;
                var Outstandingamt = 0;
                if (!$scope.currentcontext.RoundOffValue) $scope.currentcontext.RoundOffValue = 0;
                var RoundOffValue = $scope.currentcontext.RoundOffValue;
                try {
                    if (BillDiscount > 0) {
                        BillDiscount = BillDiscount.toFixed(2);
                        BillDiscount = parseFloat(BillDiscount);
                    }
                } catch (ex) { }
                try {
                    Outstandingamt = ((parseFloat(totamt) + parseFloat(RoundOffValue)) - (parseFloat(receiptamt)));
                } catch (ex) { }

                Data = {
                    Header: {
                        Id: 0,
                        BillTypeId: 1, // OP
                        BillDateTime: new Date(),
                        BillDiscount: BillDiscount,
                        BillAmount: totamt || 0,
                        DiscountApprovedBy: $scope.currentcontext.DiscountApprovedBy,
                        BillDiscountModeId: $scope.currentcontext.DiscountModeId,
                        BillGeneratedBy: utl.Session.getCurrentUserId(),
                        PaidAmount: $scope.currentcontext.ReceiptAmt || 0,
                        OutStandingAmount: Outstandingamt,
                        CreditVocher: Outstandingamt,
                        PatientId: $scope.item.PatientId,
                        EncounterId: null, // Bo Need to Update
                        EncounterTypeId: 1, //OP Encounter
                        GuarantorId: null, // Bo Need to Update PatientGuarantor Id
                        GuarantorTypeId: $scope.currentcontext.GuarantorTypeId,
                        ServiceRateCategoryId: null,
                        DoctorId: $scope.item.DoctorId,
                        DoctorName: $scope.item.DoctorName,
                        PatientBillStatusId: 3,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        DepartmentId: $scope.item.DepartmentId,
                        OrganizationId: utl.Session.getCurrentOrgId(),
                        IsRegCumBill: 1,
                        RoundOffValue: $scope.currentcontext.RoundOffValue,
                        // LoadFrom : 'Bills',
                    },
                    paymentDetail: $scope.PatientPaymentDetails,
                    Details: $scope.DefaultServiceInfo,
                    adjustmentDetail: []
                };
            }

            return Data;
        };

        $scope.NoBill = function () {
            if ($scope.item.IsNoBill) {
                $scope.item.IsEmergency = false;
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.CalculateNetAmt();
            } else {
                $scope.GetGuarantor();
            }
        };
        $scope.IsOPD = function () {
            if ($scope.item.IsOPD) {
                $scope.setDefaultServiceIsOPD();
            } else {
                $scope.getDoctorDefaultService();
                // $scope.GetGuarantor();
            }
        };

        $scope.EmergencyCharge = function () {
            if ($scope.item.IsEmergency) {
                $scope.item.IsNoBill = false;
            }
            $scope.GetGuarantor();
        };

        $scope.getTokenDispCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.currentcontext.TokenNo = res.Data[0].TokenNo;
            }
        };

        $scope.getTokenDisplay = function () {
            if ($scope.AppointmentId) {
                var inputData = {
                    Params: [{
                        Key: 3,
                        Value: $scope.AppointmentId
                    }],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Appointment/AppointmentDisplay/GetAppointmentDisplays',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getTokenDispCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.PatInfoCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.PatientName = '';
            $scope.item.PatientId = data.Id;
            if (data.Title) {
                $scope.item.PatientName = data.Title.Description;
            }
            if (data.FirstName) {
                $scope.item.PatientName += ' ' + data.FirstName;
            }
            if (data.LastName) {
                $scope.item.PatientName += ' ' + data.LastName;
            }
            if ($scope.item.Encounters && $scope.item.Encounters.length > 0) {
                var encounteritem = $scope.item.Encounters[0];
                $scope.item.VisitTypeId = encounteritem.VisitTypeId;
                $scope.item.IsNoBill = encounteritem.IsNoBill;
                $scope.item.ReferredById = encounteritem.ReferralId;
                $scope.item.ReferralId = encounteritem.ReferralId;
                $scope.item.DepartmentId = encounteritem.DepartmentId;
                $scope.item.DoctorId = encounteritem.DoctorId;
                $scope.item.DiagnosisId = encounteritem.DiagnosisId;
                $scope.item.OtherDiagnosis = encounteritem.OtherDiagnosis;
                $scope.item.TeamId = encounteritem.TeamId;
                $scope.item.Comments = encounteritem.Comments;
                $scope.item.EncounterId = encounteritem.Id;
                $scope.item.IsMLC = encounteritem.IsMLC;
                $scope.item.PromotionalSchemeId = encounteritem.PromotionalSchemeId;
                $scope.AppointmentId = encounteritem.AppointmentId;
                $scope.item.InsuranceNumber = encounteritem.InsuranceNumber;

                if (encounteritem.EncounterTypeId == 2) {
                    utl.Alert.showErrorMsg($translate.instant('Already Admitted Patient !...'));
                    return false;
                }

                if (encounteritem.EncounterStatusId == 1) {
                    $scope.EncounterStatus = 'Checked-In';
                } else {
                    $scope.EncounterStatus = 'Checked-Out';
                }

                $scope.SaveCompleted = true;
                $scope.IsOpenEncounter = true;
                $scope.EnableSave = true;
            } else {
                $scope.EncounterStatus = 'Checked-Out';
                $scope.EnableSave = false;
            }
            $scope.getPatientBillInfo();
        };

        $scope.getPatInfo = function (pageNo) {
            if ($scope.currentcontext.patientid && $scope.currentcontext.patientid > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.patientid
                    },
                    type: 'post',
                    onComplete: $scope.PatInfoCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.checkout = function () {
            if ($scope.AppointmentId && $scope.item.PatientId) {
                var msg = 'Do You Want to Checkout for ' + $scope.item.FirstName;
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msg,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.confirmcheckout,
                };
                utl.Dialog.confirmMessage(confirmOptions);
                // utl.Modal.openFixedDialog('app.patienttracker', {
                //     params: {
                //         pid: $scope.item.PatientId,
                //         aid: $scope.AppointmentId,
                //         assignto: 3
                //     },
                //     confirmCallback: $scope.addNew
                // });
            }
        };
        $scope.confirmcheckout = function () {
            $scope.Checkout.AssignTo = 4;
            $scope.Checkout.AppointmentId = $scope.AppointmentId;
            $scope.Checkout.PatientId = $scope.item.PatientId;
            var options = {
                action: 'appointment/patienttracker/CheckoutPatient',
                data: {
                    Data: $scope.Checkout
                },
                type: 'post',
                onComplete: $scope.checkoutCallback
            };
            utl.Http.doAction(options);
        }
        $scope.checkoutCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // var data = options.data ? options.data : null;
            // // if (options.data && options.data.Data) {
            // //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 4 && options.data.Data.Duration) {
            // //         openAppointmentForm(options.data.Data.FollowupAppointmentOn);
            // //     }
            // //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 3) {
            // //         $scope.doctor_dashboard();
            // //     }
            // // }

            //  $scope.confirmCallback();
        };


        $scope.getPatientBillInfoCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var billinfo = {
                    'BillId': res.Data[0].Id,
                    'BillAmt': res.Data[0].BillAmount,
                    'DiscAmt': res.Data[0].BillDiscount,
                    'RecdAmt': res.Data[0].PaidAmount,
                    'BalaAmt': res.Data[0].OutStandingAmount,
                    'PatientBillDetails': res.Data[0].PatientBillDetails,
                };
                // $scope.BillId = billinfo.Id;
                $scope.BillInfo.push(billinfo);
                if ($scope.SaveCompleted == true) {
                    if ($scope.OpBillPrint == true) {
                        $scope.printOPBill();
                    }
                }

            }
        };

        $scope.getPatientBillInfo = function () {
            if ($scope.item.PatientId && $scope.item.EncounterId) {
                var inputData = {
                    Params: [{
                        Key: 12,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 16,
                        Value: $scope.item.EncounterId
                    },
                    {
                        Key: 40,
                        Value: true
                    },
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientBillInfoCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.DrTeam = $scope.lookup.Team;
            $scope.lookup.Team = [];
            $scope.lookup.Guarantor = [];
            // $scope.getPrintNoOfCopies();
            // $scope.getMRDFlowRequired();
            // var facilitydata = $scope.lookup.Facility;
            // for (var idx in facilitydata) {
            //     if (facilitydata[idx].Id > 0) {
            //         $scope.item.DistrictId = facilitydata[idx].DistrictId;
            //         $scope.item.CityId = facilitydata[idx].CityId;
            //         $scope.item.StateId = facilitydata[idx].StateId;
            //         $scope.item.CountryId = facilitydata[idx].CountryId;
            //         $scope.swosthaintegration = facilitydata[idx].IsSwosthaIntegration;
            //     }
            // }
            $scope.getPastVisitInfo();
            $scope.getDefaultReferral();
            $scope.getPatInfo();
            // $scope.getFacility();
        };

        $scope.initLookup = function () {
            // var To = $filter('date')($scope.currentcontext.StartDate, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentcontext.StartDate, 'yyyy-MM-dd 23:59:59');
            var inputData = [{
                "Key": "Title"
            },
            {
                "Key": "Gender"
            },
            {
                "Key": "VisitType"
            },
            {
                "Key": "VipType"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    } // Clinical Dept Only
                    ]
                }
            },
            {
                "Key": "Nationality"
            },
            {
                "Key": "Referral"
            },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "Religion"
            },
            {
                "Key": "Terminal"
            },
            {
                "Key": "CardType"
            },
            {
                "Key": "GuardianType"
            },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "Team"
            },
            {
                "Key": "MaritalStatus"
            },
            {
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "ReferralType"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "DiscountApprover"
            },
            {
                "Key": "PrivateDueApprover"
            },
            {
                "Key": "Remark",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }]
                }
            },
            {
                "Key": "EncounterStatus"
            },
            {
                "Key": "BloodGroup"
            },
            {
                "Key": "PatientType"
            },
            {
                "Key": "CovidVaccineDose"
            },
            {
                "Key": "PromotionalScheme",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: 2
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.item.From
                    // },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.StartDate
                    },
                    ]
                }
            },
            {
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 0,
                        Value: utl.Session.getCurrentFacilityId()
                    }]
                }
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

        // -----------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to VisitCreateFormScreen.tsx).
        // All API calls/business logic above are untouched. See the
        // disclosure comment block at the top of VisitCreateFormScreen.tsx
        // for the full list of pre-existing defects (undefined handlers,
        // dead ng-disabled bindings, mislabeled columns, etc.) preserved
        // here exactly, NOT fixed.
        // -----------------------------------------------------------------
        $scope.reactProps = {
            item: $scope.item,
            currentcontext: $scope.currentcontext,
            lookup: $scope.lookup,
            defaultServiceInfo: $scope.DefaultServiceInfo,
            defaultServiceGrossAmt: $scope.DefaultServiceGrossAmt,
            defaultServiceTotalAmt: $scope.DefaultServiceTotalAmt,
            saveCompleted: $scope.SaveCompleted,
            disableReferral: $scope.DisableReferral
        };

        function refreshReactProps() {
            $scope.reactProps.item = $scope.item;
            $scope.reactProps.currentcontext = $scope.currentcontext;
            $scope.reactProps.lookup = $scope.lookup;
            $scope.reactProps.defaultServiceInfo = $scope.DefaultServiceInfo;
            $scope.reactProps.defaultServiceGrossAmt = $scope.DefaultServiceGrossAmt;
            $scope.reactProps.defaultServiceTotalAmt = $scope.DefaultServiceTotalAmt;
            $scope.reactProps.saveCompleted = $scope.SaveCompleted;
            $scope.reactProps.disableReferral = $scope.DisableReferral;
        }

        var origCalculateNetAmt = $scope.CalculateNetAmt;
        $scope.CalculateNetAmt = function () {
            origCalculateNetAmt();
            refreshReactProps();
        };

        var origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            origLookupCallback(scope, data, options, hasError);
            refreshReactProps();
        };

        var origGetGuarantorCallback = $scope.GetGuarantorCallback;
        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            origGetGuarantorCallback(scope, data, options, hasError);
            refreshReactProps();
        };

        var origSetDefaultServiceCallback = $scope.setDefaultServiceCallback;
        $scope.setDefaultServiceCallback = function (scope, data, options, hasError) {
            origSetDefaultServiceCallback(scope, data, options, hasError);
            refreshReactProps();
        };

        var origGetDoctorDefaultServiceCallback = $scope.getDoctorDefaultServiceCallback;
        $scope.getDoctorDefaultServiceCallback = function (scope, data, options, hasError) {
            origGetDoctorDefaultServiceCallback(scope, data, options, hasError);
            refreshReactProps();
        };

        var origEligibleDaysforPaidVisit = $scope.EligibleDaysforPaidVisit;
        $scope.EligibleDaysforPaidVisit = function () {
            origEligibleDaysforPaidVisit();
            refreshReactProps();
        };

        var origPatInfoCallback = $scope.PatInfoCallback;
        $scope.PatInfoCallback = function (scope, data, options, hasError) {
            origPatInfoCallback(scope, data, options, hasError);
            refreshReactProps();
        };

        var origGetPastVisitInfoCallback = $scope.getPastVisitInfoCallback;
        $scope.getPastVisitInfoCallback = function (scope, res, options, hasError) {
            origGetPastVisitInfoCallback(scope, res, options, hasError);
            refreshReactProps();
        };

        var origGetFollowupDeptwiseCallback = $scope.getFollowupDeptwiseCallback;
        $scope.getFollowupDeptwiseCallback = function (scope, res, options, hasError) {
            origGetFollowupDeptwiseCallback(scope, res, options, hasError);
            refreshReactProps();
        };

        var origGetDefaultReferralCallback = $scope.getDefaultReferralCallback;
        $scope.getDefaultReferralCallback = function (scope, res, options, hasError) {
            origGetDefaultReferralCallback(scope, res, options, hasError);
            refreshReactProps();
        };

        var origSaveItemCallback = $scope.saveItemCallback;
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            origSaveItemCallback(scope, data, options, hasError);
            refreshReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'itemFieldChange':
                    // Plain ng-model, no ng-change in the original: VisitTypeId,
                    // IsMLC, InsuranceNumber, Comments, PrivateDueId, BankId,
                    // ChequeNo, UPIRefNumber, DDNumber, WireTransferId,
                    // AuthorizeNumber, CardTypeId, CardNumber.
                    $scope.item[payload.field] = payload.value;
                    refreshReactProps();
                    break;
                case 'itemDateFieldChange':
                    // ChequeDate/DDDate/WireTransferDate/CollectedOn -- originally
                    // bound via ng-date-object + uib-datepicker-popup, which stores
                    // a real JS Date object on $scope.item.
                    $scope.item[payload.field] = payload.value ? new Date(payload.value) : null;
                    refreshReactProps();
                    break;
                case 'currentContextFieldChange':
                    // PaymentTypeId -- plain ng-model, no ng-change in the original.
                    $scope.currentcontext[payload.field] = payload.value;
                    refreshReactProps();
                    break;
                case 'guarantorTypeChange':
                    // currentcontext.GuarantorTypeId, ng-change="GetGuarantor()"
                    $scope.currentcontext.GuarantorTypeId = payload.value;
                    $scope.GetGuarantor();
                    refreshReactProps();
                    break;
                case 'guarantorChange':
                    // item.GuarantorId, ng-change="setDefaultService()"
                    $scope.item.GuarantorId = payload.value;
                    $scope.setDefaultService();
                    refreshReactProps();
                    break;
                case 'referTypeChange':
                    // item.ReferTypeId, ng-change="referralTypeChange()"
                    $scope.item.ReferTypeId = payload.value;
                    $scope.referralTypeChange();
                    refreshReactProps();
                    break;
                case 'promotionalSchemeChange':
                    // item.PromotionalSchemeId, ng-change="getSelectedSchemeInfo(item)" --
                    // getSelectedSchemeInfo is never defined on this controller (see
                    // disclosure comment in VisitCreateFormScreen.tsx); only the
                    // field itself is updated, matching the original's silent no-op.
                    $scope.item.PromotionalSchemeId = payload.value;
                    refreshReactProps();
                    break;
                case 'discountModeChange':
                    // currentcontext.DiscountModeId, ng-change="BillDiscountModechange($select.selected)" --
                    // undefined on this controller; field-only update, no recompute.
                    $scope.currentcontext.DiscountModeId = payload.value;
                    refreshReactProps();
                    break;
                case 'billDiscountChange':
                    // currentcontext.BillDiscount, ng-change="HeaderDiscountValueChange()" --
                    // undefined on this controller; field-only update, no recompute.
                    $scope.currentcontext.BillDiscount = payload.value;
                    refreshReactProps();
                    break;
                case 'discountApprovedByChange':
                    // currentcontext.DiscountApprovedBy, ng-change="setDiscountLimit($select.selected)" --
                    // undefined on this controller; field-only update, DiscountLimit
                    // is never set (see disclosure comment).
                    $scope.currentcontext.DiscountApprovedBy = payload.value;
                    refreshReactProps();
                    break;
                case 'emergencyChargeToggle':
                    // item.IsEmergency, ng-click="EmergencyCharge()"
                    $scope.item.IsEmergency = payload.value;
                    $scope.EmergencyCharge();
                    refreshReactProps();
                    break;
                case 'noBillToggle':
                    // item.IsNoBill, ng-click="NoBill()"
                    $scope.item.IsNoBill = payload.value;
                    $scope.NoBill();
                    refreshReactProps();
                    break;
                case 'isOpdToggle':
                    // item.IsOPD, ng-click="IsOPD()" -- see disclosure comment: the
                    // true-branch calls the undefined setDefaultServiceIsOPD().
                    $scope.item.IsOPD = payload.value;
                    $scope.IsOPD();
                    refreshReactProps();
                    break;
                case 'receiptAmtChange':
                    // currentcontext.ReceiptAmt, ng-change="CalculateNetAmt()" -- kept
                    // for bridge fidelity, though the field is rendered permanently
                    // disabled (see disclosure comment: the original had a literal
                    // `disabled` HTML attribute alongside its ng-disabled binding).
                    $scope.currentcontext.ReceiptAmt = payload.value;
                    $scope.CalculateNetAmt();
                    break;
                case 'updateReceiptAmt':
                    // ng-focus="updateReceiptAmt()" -- see note above, unreachable
                    // through the UI in the original too.
                    $scope.updateReceiptAmt();
                    refreshReactProps();
                    break;
                case 'save':
                    $scope.saveItem();
                    break;
                case 'checkout':
                    $scope.checkout();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    VisitCreateController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();