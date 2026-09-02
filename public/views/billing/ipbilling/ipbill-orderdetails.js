(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipbillingorderdetailsController', ipbillingorderdetailsController);

    function ipbillingorderdetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.savehitcompleted = 0;
        $scope.DoctorClassId = -1;
        $scope.DrIncludeTax = false;
        $scope.DrShareDetailInfo = {};
        $scope.SerItmCalculateTax = false;
        $scope.SerItmGSTInfo = {};
        $scope.Lineitems = {};
        $scope.currentfilter = {};
        $scope.isCompleted = false;
        $scope.isCancelled = false;
        $scope.currentfilter.DiscountModeId = 2;
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.tabindexmap = {
            detailtabindex: 0
        };
        $scope.IsApproved = false;
        $scope.item = {
            BillDateTime: utl.Formatter.getCurrentDate(),
            BillPriorityId: 1,
            OrderStatusId: 1,
            OrderPriorityId: 1,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.blockduplicatealerts = 0;
        $scope.blockduplicatealerts =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'blockduplicatealerts');
        var guarantorId_ = 1000;
        var facilityId_ = utl.Session.getCurrentFacilityId();
        // $scope.item.OrderFromId = parseInt(utl.Session.getCurrentDepartmentId());
        $scope.item.OrderToId = 8;
        $scope.allowipdrshare = 0;
        $scope.allowipdrshare =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'allowipdrshare');
        $scope.currentcontext.isAutoBillLock = 0;
        $scope.currentcontext.isAutoBillLock = utl.FacilitySetting.getFacilitySettingValue('billing', 'isautobilllock');

        $scope.currentcontext.MaxLockCredit = 0;
        $scope.currentcontext.MaxLockCredit = utl.FacilitySetting.getFacilitySettingValue('billing', 'maxlockcredit');

        if (!facilityId_) facilityId_ = 1;
        guarantorId_ *= facilityId_;
        $scope.GuarantorMasterId = guarantorId_;
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];
        $scope.PatientBillInfoDetails = [];


        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.IsBedcontext = false;
        if (modalConfig && modalConfig.params.bedcontext)
            $scope.IsBedcontext = true;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.bid = parseInt(modalConfig.params.bid);
            $scope.currentcontext.BillTotal = parseFloat(modalConfig.params.billtotal);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.currentcontext.selecteddept = [];
        if (modalConfig.params.status && modalConfig.params.status == 3) {
            $scope.isCompleted = true;
        }
        if (modalConfig.params.status && modalConfig.params.status == 2) {
            $scope.isCancelled = true;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.selectedPatient.Id
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.CheckserviceDate = function (item) {
            // var crntdate = new Date(utl.Formatter.getCurrentDate());
            // var startdate = crntdate.getDate();
            // var orderDate = new Date(item.OrderRequestDate);
            // var enddate = orderDate.getDate();
            // if (startdate < enddate) {
            //     utl.Alert.showErrorMsg($translate.instant('Service Date Should not be a Future Date'));
            // }
            // var admsnDate = new Date($scope.Encounter.AdmissionDate);
            // var AdmDate = admsnDate.getDate();
            // var admhrs = admsnDate.getHours();
            // var orderDate = new Date(item.OrderRequestDate);
            // var enddate = orderDate.getDate();
            // var endhrs = orderDate.getHours();
            // if (AdmDate > enddate) {
            //     utl.Alert.showErrorMsg($translate.instant('Service Date Should not be a Before admission Date'));
            // }
            // if (endhrs > 0) {
            //     if (AdmDate <= enddate) {
            //         if (admhrs >= endhrs) {
            //             utl.Alert.showErrorMsg($translate.instant('Surgery End Date Should not be a Past Date'));
            //         }
            //     }
            // }
            var admsnDate = new Date($scope.Encounter.AdmissionDate);
            var dateformat = "YYYY-MM-DD";
            var from = new moment(moment(item.OrderRequestDate).format(dateformat));
            var to = new moment(moment(admsnDate).format(dateformat));

            var timecheck = from < to;
            console.log(timecheck);
            if (timecheck) {
                utl.Alert.showErrorMsg('Date Should not be less than Admission Date');
                item.OrderRequestDate = utl.Formatter.getCurrentDate();
            }
        }

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        };

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };

                utl.Http.doAction(options);
            }
        };

        $scope.calcAmt = function (index, item) {
            if (item.TestId > 0) {
                if (item.DiscountAmount > item.GrossAmount) {
                    item.DiscountAmount = $scope.ValidDiscount;
                }
                if (item.DoctorShare > item.GrossAmount) {
                    item.DoctorShare = $scope.ValidShareAmt;
                }
                item.TestPrice = item.Rate;
                item.Amount = item.Rate * item.Quantity;
                $scope.item.BillAmount = 0;
                $scope.item.BillDiscount = 0;
                $scope.TotalNet = 0;
                if (item.DiscountAmount == undefined || isNaN(item.DiscountAmount) || item.DiscountAmount == null) {
                    item.DiscountAmount = 0;
                }
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    if (item.SchemeDiscountRate > 0) {
                        var sdisamt = (item.SchemeDiscountRate / 100) * item.Amount;
                        item.SchemeDiscountAmt = sdisamt;
                        item.NetAmount = item.Amount - sdisamt;
                    }
                    if (item.AgreementDiscountRate > 0) {
                        var discamt = (item.AgreementDiscountRate / 100) * item.Amount;
                        item.AgreementDiscountAmt = discamt;
                        item.NetAmount = item.Amount - discamt;
                    }
                    if (item.DiscountAmount > 0) {
                        item.Discount = (item.DiscountAmount / 100) * item.Amount;
                        if (item.Discount > item.Amount) {
                            item.DiscountAmount = 0;
                            item.NetAmount = item.Amount;
                            utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                        } else {
                            item.NetAmount = item.Amount - item.Discount;
                        }
                    }
                    if (item.AgreementDiscountRate > 0 && item.DiscountAmount > 0) {
                        var agreediscamt = (item.AgreementDiscountRate / 100) * item.Amount;
                        item.AgreementDiscountAmt = agreediscamt;
                        item.Discount = (item.DiscountAmount / 100) * item.Amount;
                        var totdiscamt = parseFloat(agreediscamt) + parseFloat(item.Discount);
                        item.NetAmount = item.Amount - totdiscamt;
                    }
                    if (item.SchemeDiscountRate > 0 && item.DiscountAmount > 0) {
                        var sdisamt = (item.SchemeDiscountRate / 100) * item.Amount;
                        item.SchemeDiscountAmt = sdisamt;
                        var discamt = (item.DiscountAmount / 100) * item.Amount;
                        var totdiscamt = parseFloat(sdisamt) + parseFloat(discamt);
                        item.NetAmount = item.Amount - totdiscamt;
                    } else if ((!item.DiscountAmount && !item.AgreementDiscountRate && !item.SchemeDiscountAmt) ||
                        (item.DiscountAmount == 0 && item.AgreementDiscountRate == 0 && item.SchemeDiscountAmt == 0)) {
                        item.NetAmount = item.Amount;
                    }
                } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                    if (item.SchemeDiscountAmt > 0) {
                        item.NetAmount = item.Amount - item.SchemeDiscountAmt;
                    }
                    if (item.AgreementDiscountRate > 0) {
                        item.AgreementDiscountAmt = item.AgreementDiscountRate;
                        item.NetAmount = item.Amount - item.AgreementDiscountRate;
                    }
                    if (item.DiscountAmount > 0) {
                        if (item.DiscountAmount > item.Amount) {
                            item.DiscountAmount = 0;
                            item.NetAmount = item.Amount;
                            utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                        } else {
                            item.NetAmount = item.Amount - item.DiscountAmount;
                        }
                    }
                    if (item.AgreementDiscountRate > 0 && item.DiscountAmount > 0) {
                        item.AgreementDiscountAmt = item.AgreementDiscountRate;
                        var totdiscamt = parseFloat(item.AgreementDiscountRate) + parseFloat(item.DiscountAmount);
                        item.NetAmount = item.Amount - totdiscamt;
                    }
                    if (item.SchemeDiscountAmt > 0 && item.DiscountAmount > 0) {
                        var totdiscamt = parseFloat(item.SchemeDiscountAmt) + parseFloat(item.DiscountAmount);
                        item.NetAmount = item.Amount - totdiscamt;
                    } else if ((!item.DiscountAmount && !item.AgreementDiscountRate && !item.SchemeDiscountAmt) ||
                        (item.DiscountAmount == 0 && item.AgreementDiscountRate == 0 && item.SchemeDiscountAmt == 0)) {
                        item.NetAmount = item.Amount;
                    }
                }
                if ($scope.Encounter.GuarantorTypeId > 1) {
                    if ($scope.item.CoPayPercent) {
                        item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                        item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);
                    }
                    if (!$scope.item.CoPayPercent) {
                        item.InsNetAmount = parseFloat(item.NetAmount);
                    }
                }
                // item.DoctorShare = parseFloat(item.DoctorShare);
                // if (item.DoctorShare == undefined || isNaN(item.DoctorShare) || item.DoctorShare == null) {
                //     item.DoctorShare = parseFloat(0).toFixed(2);
                // }
                if (item.DoctorShareValue > 0) {
                    item.DoctorShare = item.NetAmount * item.DoctorShareValue / 100;
                }
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.item.BillAmount = $scope.item.BillAmount + $scope.PatientBillDetails[idx].NetAmount;
                        $scope.PatientBillDetails[idx].Amount = parseInt($scope.PatientBillDetails[idx].Quantity) *
                            parseInt($scope.PatientBillDetails[idx].Rate) -
                            parseInt($scope.PatientBillDetails[idx].DiscountAmount);
                        $scope.PatientBillDetails[idx].GrossAmount = parseInt($scope.PatientBillDetails[idx].Quantity) *
                            parseInt($scope.PatientBillDetails[idx].Rate);
                        $scope.TotalNet += parseFloat($scope.PatientBillDetails[idx].Amount || 0);
                        $scope.item.BillDiscount += parseInt($scope.PatientBillDetails[idx].DiscountAmount);
                    }
                }
                $scope.ValidDiscount = item.DiscountAmount;
                $scope.ValidShareAmt = item.DoctorShare;
                if (item.GrossAmount < item.DoctorShare || item.GrossAmount < item.DiscountAmount) {
                    utl.Alert.showErrorMsg('Enter a Valid Item Amount');
                }
                $scope.CalculateDoctorShare(item);
                $scope.item.BillAmount = 0;
                $scope.item.BillDiscount = 0;
                $scope.TotalNet = 0;
                $scope.item.NetPatientAmount = 0;
                $scope.item.NetInsuranceAmount = 0;
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.TotalNet += parseFloat($scope.PatientBillDetails[idx].NetAmount);
                        $scope.item.BillAmount = $scope.item.BillAmount + $scope.PatientBillDetails[idx].NetAmount;
                        $scope.item.BillDiscount += parseInt($scope.PatientBillDetails[idx].DiscountAmount);
                        $scope.item.NetPatientAmount += parseInt($scope.PatientBillDetails[idx].PatNetAmount);
                        $scope.item.NetInsuranceAmount += parseInt($scope.PatientBillDetails[idx].InsNetAmount);
                    }
                }
                $scope.item.OrderTotal = $scope.TotalNet;
            }
        };

        $scope.checkCashBalance = function () {
            if ($scope.currentcontext.eid > 0) {
                var inputData = {
                    Header:
                    {
                        EncounterId: $scope.currentcontext.eid,
                        PatientId: $scope.item.PatientId
                    }
                };

                var options = {
                    action: 'Billing/patientbills/checkBillCashAmount',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.CashBalanceCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.CashBalanceCallback = function (scope, res, options, hasError) {
            console.log(res);
            $scope.TotalDue = res;
            $scope.TotalDue = parseFloat($scope.TotalDue);
            // + parseFloat($scope.currentcontext.MaxLockCredit);
        };

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res;
            $scope.encGuarantorAgreements = [];
            $scope.item.DoctorId = $scope.Encounter.DoctorId;
            $scope.item.DoctorName = $scope.Encounter.DoctorName;
            $scope.item.OrderFromId = $scope.Encounter.DepartmentId;
            $scope.item.DepartmentId = $scope.Encounter.DepartmentId;
            $scope.item.ServiceRateCategoryId = $scope.Encounter.ServiceRateCategoryId;
            $scope.CanShowScheme = false;
            $scope.ItemPromotions = [];
            $scope.CategoryPromotions = [];
            if ($scope.Encounter.PromotionalSchemeId > 0) {
                $scope.CanShowScheme = true;
                $scope.currentfilter.PromotionalSchemeId = $scope.Encounter.PromotionalSchemeId;
                $scope.currentfilter.PromotionalScheme = $scope.Encounter.PromotionalScheme.PromotionSchemeName;
                $scope.PromotionalSchemeDetails = $scope.Encounter.PromotionalScheme.PromotionalSchemeDetails;
                for (var idx in $scope.PromotionalSchemeDetails) {
                    var schemeDetail = $scope.PromotionalSchemeDetails[idx];
                    if (schemeDetail.ServiceCategoryId > 0) {
                        $scope.CategoryPromotions.push(schemeDetail);
                    }
                    if (schemeDetail.ServiceItemId > 0) {
                        $scope.ItemPromotions.push(schemeDetail);
                    }
                }
            }
            if ($scope.Encounter.Guarantor) {
                if ($scope.Encounter.GuarantorTypeId > 1) {
                    $scope.item.CoPayPercent = $scope.Encounter.Guarantor.CoPayPercent;
                    if ($scope.Encounter.Guarantor.GuarantorAgreements.length > 0) {
                        $scope.encGuarantorAgreements = $scope.Encounter.Guarantor.GuarantorAgreements;
                    }
                }
            }
            $scope.loadPatientGuarantors();
            if ($scope.Encounter && $scope.Encounter.DoctorId) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.Encounter.DoctorId);
                $scope.calDoctorShareInfo(doctorObj);
            }
            if ($scope.currentcontext.isAutoBillLock == true) {
                if ($scope.Encounter && $scope.Encounter.GuarantorId == 1) {
                    $scope.checkCashBalance();
                }
            }
        };

        $scope.getEncounters = function () {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.currentcontext.eid
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getServiceItem = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.PatientBillDetails, {
                pivotkey: 'ServiceId',
                displaykey: 'ServiceName'
            });
            if (isDuplicate) {
                item.ServiceId = '';
                item.ServiceName = '';
                $scope.PatientBillDetails.splice(idx, 1)
                $scope.addNewLineItem();
                return;
            }
            var selectedItem = item.SelectedItem;
            item.ServiceCategoryId = selectedItem.CategoryId;
            item.ServiceGroupId = selectedItem.BillingGroupId;
            item.ServiceSubCategoryId = selectedItem.SubCategoryId;
            item.IsOrderable = selectedItem.IsOrderable;
            item.ServiceCategoryId = selectedItem.CategoryId;
            item.TestCode = selectedItem.ItemCode;
            item.TestName = selectedItem.Name;
            item.TestDescription = selectedItem.Name;
            item.MasterTypeId = selectedItem.MasterTypeId;
            item.TestId = selectedItem.MasterItemId;
            item.TestTypeId = selectedItem.OrderTypeId;
            item.MasterItemId = selectedItem.MasterItemId;
            item.MasterName = selectedItem.MasterName;
            item.IsPackageItem = selectedItem.IsPackage;
            item.IsPackage = selectedItem.IsPackage;
            item.DoctorId = $scope.Encounter.DoctorId;
            item.ServiceName = selectedItem.ServiceName;
            item.DepartmentId = selectedItem.DepartmentId;

            item.DrShareTaxId = -1;
            item.DrTaxPercentage = -1;
            if (selectedItem.GstMaster && selectedItem.GstMaster.Id)
                item.DrShareTaxId = selectedItem.GstMaster.Id;
            if (selectedItem.GstMaster && selectedItem.GstMaster.GstPercentage)
                item.DrTaxPercentage = selectedItem.GstMaster.GstPercentage;
            if (selectedItem.GstMaster && selectedItem.GstMaster.GstCode)
                item.TaxCode = selectedItem.GstMaster.GstCode;

            item.IsSupplementary = false;
            if (selectedItem.Supplementary && selectedItem.Supplementary.length > 0)
                item.IsSupplementary = true;
            var ServiceTraiffobj = $filter('filter')(selectedItem.ServiceItemTariffDetails, {
                ServiceRateCategoryId: $scope.Encounter.ServiceRateCategoryId
            }, true);
            if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                item.ServiceRateCategoryId = ServiceTraiffobj[0].ServiceRateCategoryId;
                item.ServiceRateCategoryName = ServiceTraiffobj[0].Text;
                item.UnitPrice = ServiceTraiffobj[0].Rate;
                item.Rate = ServiceTraiffobj[0].Rate;
                item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
            }
            var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.Encounter.GuarantorId);
            if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                var ServiceItemAliasobj = $filter('filter')(selectedItem.ServiceItemAliases, {
                    ExternalProviderId: selectedGuarantor.GuarantorId
                }, true);
                if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                    item.AliasId = ServiceItemAliasobj[0].AliasId;
                    item.AliasName = ServiceItemAliasobj[0].AliasName;
                }
            }
            $scope.calcAmt(idx, item);
            $scope.CalculateDoctorShare(item);
            $scope.addNewLineItem();

            if (selectedItem.IsPackage && selectedItem.IsSaveServiceDetails) {
                for (var packid in selectedItem.ServiceItemPackageMaps) {
                    var packitem = selectedItem.ServiceItemPackageMaps[packid];
                    if (packitem.Formula && packitem.DoctorId) {
                        var formulaobj = {
                            NetAmount: item.NetAmount,
                            SharePercentage: packitem.SharePercentage,
                        };
                        var computedValue = (math.eval(packitem.Formula, formulaobj));
                        computedValue = computedValue.toFixed(2);
                        var lastIndex = $scope.PatientBillDetails.length - 1;
                        var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, packitem.DoctorId);
                        $scope.PatientBillDetails[lastIndex].ServiceId = packitem.ServiceId;
                        $scope.PatientBillDetails[lastIndex].ServiceCategoryId = item.ServiceCategoryId;
                        $scope.PatientBillDetails[lastIndex].ServiceName = packitem.ServiceName;
                        $scope.PatientBillDetails[lastIndex].DoctorId = packitem.DoctorId;
                        $scope.PatientBillDetails[lastIndex].DoctorName = doctorObj.Text || null;
                        $scope.PatientBillDetails[lastIndex].DoctorShare = computedValue;
                        $scope.PatientBillDetails[idx].IsPackageItem = 1;
                        $scope.PatientBillDetails[lastIndex].PackageMasterServiceId = item.ServiceId;
                        $scope.addNewLineItem();
                    } else {
                        var computedValue = 0;
                        var lastIndex = $scope.PatientBillDetails.length - 1;
                        $scope.PatientBillDetails[lastIndex].ServiceId = packitem.ServiceId;
                        $scope.PatientBillDetails[lastIndex].ServiceCategoryId = item.ServiceCategoryId;
                        $scope.PatientBillDetails[lastIndex].ServiceName = packitem.ServiceName;
                        $scope.PatientBillDetails[lastIndex].DoctorId = packitem.DoctorId || -1;
                        $scope.PatientBillDetails[lastIndex].DoctorName = null;
                        $scope.PatientBillDetails[lastIndex].DoctorShare = computedValue;
                        $scope.PatientBillDetails[idx].IsPackageItem = 1;
                        $scope.PatientBillDetails[lastIndex].PackageMasterServiceId = item.ServiceId;
                        $scope.addNewLineItem();
                    }
                }
            }

            $scope.getBillInfoDetails(selectedItem);
        };

        $scope.EditPackageLineItem = function (item) {
            if (item.PackageDetails && item.PackageDetails.length > 0) {
                // for (var idx in data.items) {
                //     var item = data.items[idx];
                //     var idx = $scope.PatientBillDetails.indexOf(item);
                //     $scope.PatientBillDetails[idx].DiscountAmount = item.DiscountAmount;
                //     $scope.PatientBillDetails[idx].NetAmount = 0;
                //     $scope.PatientBillDetails[idx].IsPackageItem = 1;
                //     $scope.PatientBillDetails[idx].DoctorShare = item.DoctorShare;
                //     $scope.PatientBillDetails[idx].DoctorId = item.DoctorId;
                //     $scope.PatientBillDetails[idx].DoctorName = item.DoctorName;
                // }
                $scope.PatientBillDetails[idx].PackageDetails = item.PackageDetails;
            }
        };

        $scope.EditDocShareLineItem = function (item) {
            if (item.DocShareDetails && item.DocShareDetails.length > 0) {
                $scope.PatientBillDetails[idx].DocShareDetails = item.DocShareDetails;
            }
        };

        $scope.editDocShareInfo = function (idx, item) {
            var IsEditable = false;
            if ($scope.currentcontext.PatientBillStatusId == 1) {
                IsEditable = true;
            }
            utl.Modal.open('app.drshareSelection', {
                params: {
                    itemid: idx,
                    item: item,
                    patient: $scope.selectedPatient,
                    IsEditable,
                    patType: 2,
                    encId: $scope.Encounter.Id,
                    ratetype: $scope.Encounter.ServiceRateCategoryId
                },
                confirmCallback: $scope.EditDocShareLineItem
                // cancelCallback: $scope.initLookup
            });
        };

        $scope.editPatientBillDetails = function (idx, item) {
            if (item.IsPackageItem) {
                utl.Modal.open('app.obillingpackage', {
                    params: {
                        itemid: idx,
                        item: item,
                        items: $scope.PatientBillDetails,
                        patient: $scope.selectedPatient,
                        IsEditable: true,
                        ratetype: $scope.Encounter.ServiceRateCategoryId
                    },
                    confirmCallback: $scope.EditPackageLineItem
                });
            } else {
                utl.Modal.open('app.obillingmore', {
                    params: {
                        itemid: idx,
                        item: item,
                        patient: $scope.selectedPatient,
                        IsEditable: true,
                        ratetype: $scope.Encounter.ServiceRateCategoryId
                    },
                    confirmCallback: $scope.EditLineItem
                    // cancelCallback: $scope.initLookup
                });
            }
        };

        $scope.EditLineItem = function (item) {
            var idx = $scope.PatientBillDetails.indexOf(item);
            $scope.PatientBillDetails[idx].DoctorId = item.DoctorId;
            $scope.PatientBillDetails[idx].DiscountTypeId = item.DiscountTypeId;
            $scope.PatientBillDetails[idx].IsDoctorDiscount = item.IsDoctorDiscount;
            $scope.PatientBillDetails[idx].Comments = item.Comments;
            $scope.PatientBillDetails[idx].DoctorClassId = item.DoctorClassId;
            var DrIncludeTax = item.DrIncludeTax;
            $scope.PatientBillDetails[idx].DrTaxAmount = 0;
            $scope.PatientBillDetails[idx].GSTAmount = 0;
            var discamt = 0;
            //Line Item Discount
            if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) { // percentage
                discamt = (item.DiscountAmount / 100) * item.Amount;
            } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                discamt = item.DiscountAmount;
            }
            item.NetAmount = item.Amount - discamt;
            // item.DoctorShare = 0;
            if (!$scope.DrIdDrShareDetailInfo[item.DoctorId]) {
                $scope.DrIdDrShareDetailInfo[item.DoctorId] = item.DrShareDetailInfo;
            }
            if (!$scope.DrIdDoctorClassId[item.DoctorId]) {
                $scope.DrIdDoctorClassId[item.DoctorId] = item.DoctorClassId;
            }
            if (!$scope.DrIdDrIncludeTax[item.DoctorId]) {
                $scope.DrIdDrIncludeTax[item.DoctorId] = DrIncludeTax;
            }
            // $scope.DrShareChangeDr(item.DoctorClassId, item.DrShareDetailInfo, $scope.PatientBillDetails[idx], DrIncludeTax);
        };

        $scope.billingFilter = function (item) {
            if (item.Status == 1 && item.PackageMasterServiceId == 0) {
                return item;
            }
        };

        $scope.CalculateDoctorShare = function (item) {
            if ($scope.DoctorClassId > 0 && item.ServiceId > 0 && !item.IsPackageItem) {
                var itemwiseGrossAmt = 0;
                var discamt = 0;
                if (item.DiscountAmount) {
                    discamt = item.DiscountAmount;
                }
                var netamt = 0;
                var amt = item.Rate * item.Quantity;
                netamt = amt - discamt;
                item.NetAmount = netamt;
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
                                        ////// var per = (100 / EligiblePerAmount) * shareitem.ShareAmount;
                                        ////// if (per > 100) { per = 100; }
                                        ////// SharePerAmount = EligiblePerAmount * (per / 100);
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
                                } catch (ex) { }
                                break;
                            }
                        }
                    }
                }
            }
        };


        $scope.getBillDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientBillInfoDetails = res.Data || [];
            var bills = [];
            var billdetails = [];
            for (var idx in res.Data) {
                var bills = res.Data[idx];
                if (bills.PatientId == $scope.Encounter.PatientId) {
                    for (var iddx in bills.PatientBillDetails) {
                        var billdetails = bills.PatientBillDetails[iddx];
                        if (billdetails.ServiceId == $scope.vm.serviceitemcontrolconfig.selected.Id) {
                            utl.Alert.showErrorMsg($translate.instant('Item Already Ordered'));
                        }
                    }
                }
            }
        };

        $scope.getBillInfoDetails = function (selectedItem) {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            if ($scope.Encounter.PatientId) {
                var inputData = {
                    Params: [{
                        Key: 17,
                        Value: FromDate
                    },
                    {
                        Key: 18,
                        Value: ToDate
                    },
                    {
                        Key: 6,
                        Value: 3
                    }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) {
                    return primer(x[field])
                } :
                function (x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;

            if (!$scope.Encounter.GuarantorId) {
                $scope.Encounter.GuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            }
            forEach($scope.lookup.PatientGuarantor, function (v) {
                if (v.Id === $scope.Encounter.GuarantorId)
                    $scope.GuarantorMasterId = v.GuarantorId;
            });
        };

        $scope.loadPatientGuarantors = function () {
            if ($scope.Encounter.PatientId && $scope.Encounter.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: 2
                        }, {
                            Key: 2,
                            Value: $scope.Encounter.PatientId
                        }]
                    }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.Bedoccupancy = function () {
            if ($scope.Encounter.PatientId > 0) {
                utl.Modal.open('app.bedoccupancyhistory', {
                    params: {
                        pid: $scope.Encounter.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        };

        vm.wardbedmastercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Bed No',
                field: 'BedNo',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },],
            searchparams: {},
            result: {},
            api: 'generalmaster/WardRoomBedMaster/GetWardRoomBedMasters',
            formatdisplay: formatselectedward,
            presearch: presearchward,
            postsearch: postsearchward
        };

        function formatselectedward() {
            var selectedItem = vm.wardbedmastercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.WardMaster.WardName, selectedItem.WardRoomMaster.RoomNo, selectedItem.Code].join(' / ');
            } else if (vm.wardbedmastercontrolconfig.rowdata) {
                result = [vm.wardbedmastercontrolconfig.rowdata.WardMaster.WardName, vm.wardbedmastercontrolconfig.rowdata.WardRoomMaster.RoomNo, vm.wardbedmastercontrolconfig.rowdata.Code].join(' / ');
            }
            return result;
        }

        function presearchward() {
            var query = vm.wardbedmastercontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.wardbedmastercontrolconfig.searchbyid == true) {
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

            vm.wardbedmastercontrolconfig.searchparams = inputData;
        }

        function postsearchward() {
            for (var idx in vm.wardbedmastercontrolconfig.result) {
                var item = vm.wardbedmastercontrolconfig.result[idx];
                item.Code = item.Code;
                // $scope.Encounter.ServiceRateCategoryId = item.WardMaster.ServiceRateCategoryId;
            }
        }

        $scope.doctorChange = function (item) {
            $scope.Lineitems = item;
            if (item.DoctorId > 0) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, item.DoctorId);
                for (var idx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                        if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                            $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                        }
                    }
                }
                if ($scope.currentcontext.selecteddept.length > 0) {
                    $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
                }
                item.DoctorShare = 0;
                $scope.calDoctorShareInfo(doctorObj);
            }

        };

        $scope.calDoctorShareInfo = function (doctorObj) {
            if (doctorObj.DoctorClassId) {
                $scope.DoctorClassId = doctorObj.DoctorClassId;
                $scope.DrIncludeTax = doctorObj.IsIncludeTax;
                $scope.DrShareDetailInfo = {};
                $scope.SerItmCalculateTax = false;
                $scope.SerItmGSTInfo = {};
                if (doctorObj.DoctorClassId > 0) {
                    var inputData = {
                        Params: [{
                            Key: 2,
                            Value: doctorObj.DoctorClassId
                        },
                        {
                            Key: 4,
                            Value: 2
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
                        onComplete: $scope.getDoctorShareCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $scope.getDoctorShareCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    $scope.DrShareDetailInfo = item.DoctorShareDetails;
                }
            }
            if ($scope.Lineitems.ServiceId > 0) {
                $scope.CalculateDoctorShare($scope.Lineitems);
                $scope.Lineitems = {};
            }
        };

        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.getdepartment();
        };

        $scope.getdeptCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
            var dept = [];
            for (var idx in data) {
                dept.push(data[idx])
                for (var iddx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[iddx].Id == dept[idx].DepartmentId)
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[iddx]);
                }
            }
            $scope.doctorChange();
        };

        $scope.getdepartment = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.DoctorId
                }]
            };
            var options = {
                action: 'SystemSettings/User/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else { }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.savehitcompleted = 0;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveAndApprove();
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function () {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.open('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* Security IsValid */

        $scope.saveAndApprove = function () {

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            $scope.item.PatientBillStatusId = 3;
            $scope.item.BillTypeId = 3;
            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            if ($scope.selectedPatient.LastName != null) {
                $scope.item.PatientName = $scope.selectedPatient.Title.Description +
                    ' ' + $scope.selectedPatient.FirstName + ' ' +
                    $scope.selectedPatient.LastName;
            } else {
                $scope.item.PatientName = $scope.selectedPatient.Title.Description +
                    ' ' + $scope.selectedPatient.FirstName;
            }
            $scope.item.GuarantorId = $scope.Encounter.GuarantorId;
            $scope.item.DoctorId = $scope.Encounter.DoctorId;
            $scope.item.DepartmentId = $scope.Encounter.DepartmentId;
            $scope.item.ServiceRatecategoryId = $scope.Encounter.ServiceRatecategoryId;
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.saveItem();
        };

        $scope.completeBill = function () {

            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billing-details.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveAndApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);


            // $scope.saveAndApprove();
        };

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return;

            if (checkMandatoryFields()) {
                $scope.IsApproved = true;
                var lines = getLinesForSave();

                $scope.item.updateBillLock = 0;
                if ($scope.currentcontext.isAutoBillLock == true) {
                    if ($scope.Encounter && $scope.Encounter.GuarantorId == 1) {
                        if ($scope.Encounter.BillUnlockRequestStatusId != 2) {
                            var amount = parseFloat($scope.item.OrderTotal) + parseFloat($scope.TotalDue);
                            var diff = parseFloat(amount) - parseFloat($scope.currentcontext.MaxLockCredit);
                            console.log(diff);
                            if (diff > 100) {
                                utl.Alert.showErrorMsg('Please Check, Total Due should not Exceed ' + $scope.currentcontext.MaxLockCredit);
                                return;
                            } else if (diff >= 0 && diff <= 100) {
                                $scope.item.updateBillLock = 1;
                            }
                        }
                    }
                }
                var actionName = 'emr/patientorder/AddPatientOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/patientorder/UpdatePatientOrder';
                } else {
                    $scope.item.BillingStatusId = 1;
                }
                if ($scope.item.OrderStatusId == 1 && $scope.Encounter) {
                    $scope.item.WardId = $scope.Encounter.WardId;
                    $scope.item.RoomId = $scope.Encounter.RoomId;
                    $scope.item.BedId = $scope.Encounter.BedId;
                    if ($scope.Encounter.EncounterTypeId == 2)
                        $scope.item.BillingStatusId = 2;
                }
                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
                savehitcompleted = 1;
                $scope.savehitcompleted = 1;
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

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.PatientBillDetails, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.TestId > -1 && item.Quantity <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var ordertotal = 0;
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if (item.DocShareDetails) {
                    if (item.DocShareDetails.length > 0) {
                        for (var per = 0, perlen = item.DocShareDetails.length; per < perlen; per++) {
                            if (item.DocShareDetails[per].PerformDrShareValue > 0) {
                                item.DocShareDetails[per].PerformDrShare = item.NetAmount * (item.DocShareDetails[per].PerformDrShareValue / 100);
                            }
                        }
                    }
                }
                item.PatientId = $scope.item.PatientId;
                item.GuarantorId = $scope.item.GuarantorId;
                item.OrderStatusId = $scope.item.OrderStatusId;
                item.IsDirectBill = item.IsDirectBill || false;
                item.RequestDate = $scope.item.OrderRequestDate;
                item.DoctorShareValue = item.DoctorShareValue || 0;
                item.DoctorShare = item.DoctorShare || 0;
                item.AllowIPDocShare = $scope.allowipdrshare || 0;
                // item.PerformDoctorId = item.PerformDoctorId || 0;
                // item.PerformDoctorName = item.PerformDoctorName;
                // item.PerformDrShareValue = item.PerformDrShareValue || 0;
                // item.PerformDrShare = item.PerformDrShare || 0;
                item.DocShareDetails = item.DocShareDetails;
                if (item.TestId > -1 && item.Status == 1) {
                    result.push(item);
                    ordertotal += item.NetAmount;
                }
            }
            for (var didx in $scope.PatientBillDetails) {
                var ditem = $scope.PatientBillDetails[didx];
                if (ditem.Id > 0 && ditem.Status == 2) {
                    result.push(ditem);
                }
            }
            $scope.item.OrderTotal = ordertotal;
            return result;
        }


        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.PatientBillDetails) {
                if ($scope.PatientBillDetails[idx].Status == 1) {
                    $scope.PatientBillDetails[idx].Serviceididx = 'desc' + (SNo - 1);
                    $scope.PatientBillDetails[idx].Rateidx = 'rate' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientBillDetails[lastIndex].TestId == -1)
                    return false;
            }
            var PatientBillDetails = {
                RdoDiscountMode: true,
                RdoDiscount: true,
                Id: 0,
                TestId: -1,
                Serviceididx: null,
                Rateidx: null,
                RequestDate: null,
                TestId: -1,
                TestCode: '',
                TestName: '',
                TestDescription: '',
                DepartmentId: -1,
                SubDepartmentId: -1,
                RequestDate: utl.Formatter.getCurrentDate(),
                IsPackage: false,
                ServiceTypeId: -1,
                Quantity: 1,
                Rate: 0,
                Amount: 0.00,
                DiscountAmount: 0,
                DiscountModeId: -1,
                GSTAmount: 0,
                TaxCode: 'ES',
                NetAmount: 0.00,
                DiscountTypeId: -1,
                IsOrderable: 0,
                ServiceCategoryId: 0,
                ServiceGroupId: 0,
                ServiceSubCategoryId: 0,
                MasterTypeId: -1,
                MasterItemId: -1,
                MasterName: '',
                Status: 1,
                tabindex: 1,
                AliasId: null,
                AliasName: null,
                DoctorClassId: -1,
                EligiblePercentage: 0,
                SharePercentage: 0,
                ShareAmount: 0,
                DrShareTaxId: -1,
                DrTaxPercentage: 0,
                DrTaxAmount: 0,
                PackageSharePercentage: 0,
                PackageFormula: 0,
                PackageMasterServiceId: 0
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetails.PatientBillId = $scope.currentcontext.id;
            }

            $scope.PatientBillDetails.push(PatientBillDetails);

            if ($scope.currentcontext.isAutoBillLock == true) {
                if ($scope.Encounter && $scope.Encounter.GuarantorId == 1) {
                    if ($scope.Encounter.BillUnlockRequestStatusId != 2) {
                        var amount = parseFloat($scope.item.OrderTotal) + parseFloat($scope.TotalDue);
                        var diff = parseFloat(amount) - parseFloat($scope.currentcontext.MaxLockCredit);
                        console.log(diff);
                        if ((parseFloat($scope.item.OrderTotal) + parseFloat($scope.TotalDue)) > parseFloat($scope.currentcontext.MaxLockCredit)) {
                            utl.Alert.showErrorMsg('Please Check, Total Due should not Exceed ' + $scope.currentcontext.MaxLockCredit);
                            // return;
                        }
                    }
                }
            }
            $scope.SelectedIndex = $scope.PatientBillDetails.length;

            $scope.setIndexforTableIndex();
        };

        $scope.addNewLineItem();
        $scope.onDeleteConfirmed = function (item) {
            try {
                var packitemremove = [];
                for (var pkgidx in $scope.PatientBillDetails) {
                    var packitemmaster = $scope.PatientBillDetails[pkgidx];
                    if (packitemmaster.PackageMasterServiceId == item.ServiceId) {
                        packitemremove.push(packitemmaster);
                    }
                }
                for (var pkgidx in packitemremove) {
                    var packitem = packitemremove[pkgidx];
                    var index = $scope.PatientBillDetails.indexOf(packitem);
                    if (index >= 0) {
                        packitem.Status = 2;
                        $scope.DeletedPatientBills.push(packitem);
                        $scope.PatientBillDetails.splice(index, 1);
                    }
                }
            } catch (ex) { }
            item.Status = 2;
            $scope.calcAmt(0, item);
        };

        $scope.deleteDetail = function (idx, item) {
            item.index = idx;
            var lastindex = $scope.PatientBillDetails.length - 1;
            if (item.TestId != -1 || null) {
                var name = item.TestId || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Name',
                field: 'Name',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Department',
                field: 'Department',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            {
                header: 'Rate',
                field: 'Price',
                datatype: 'string',
                headercls: 'td-rate',
                fieldcls: 'td-rate'
            },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {
            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 8,
                    Value: {
                        'ServiceRateCategoryId': $scope.Encounter.ServiceRateCategoryId,
                        'FacilityId': utl.Session.getCurrentFacilityId()
                    }
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
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

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                var Tariff = {
                    Rate: 0,
                    DoctorShare: 0
                };
                var ServiceItem = item.ServiceItem;
                if (ServiceItem && ServiceItem.Id > 0 &&
                    ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                    Tariff = ServiceItem.ServiceItemTariffDetails[0];
                }
                item.Tariff = Tariff;
                item.Price = Tariff.Rate;
                item.UnitPrice = Tariff.Rate;
                if (item.Department) {
                    item.Department = item.Department.DepartmentName;
                }
            }
        }

        $scope.testChanged = function (idx, item) {
            if ($scope.blockduplicatealerts == 0 || !$scope.blockduplicatealerts) {
                var isDuplicate = utl.Common.isDuplicateRec($scope.PatientBillDetails, {
                    pivotkey: 'TestId',
                    displaykey: 'TestName'
                });
                if (isDuplicate) {
                    item.TestName = '';
                    item.TestId = '';
                    item.Status = 2;
                    $scope.addNewLineItem();
                    return;
                }
            }

            computeTestData(item, item.SelectedItem, idx);
            $scope.addNewLineItem();
        };

        function computeTestData(item, testMaster, idx) {
            item.DepartmentId = testMaster.DepartmentId;
            item.IsDirectBill = testMaster.IsDirectBill || false;
            item.TestTypeId = testMaster.TESTMASTERTYPId;
            if (testMaster.TESTMASTERTYP)
                item.TestType = testMaster.TESTMASTERTYP.Description;
            item.TestCode = testMaster.Code;
            item.TestName = testMaster.Name;
            item.TestDescription = testMaster.Description;
            item.SpecimanId = testMaster.SampletypeId;
            item.ResourceId = testMaster.ResourceId || 0;
            if ($scope.Encounter) {
                item.DoctorId = $scope.Encounter.DoctorId;
            }
            item.IsInsAgreementDiscount = false;
            if (testMaster.ServiceItem) {
                item.ServiceId = testMaster.ServiceItem.Id;
                item.CategoryId = testMaster.ServiceItem.CategoryId || 0;
                if (testMaster.ServiceItem.ParentCategory) {
                    item.CategoryName = testMaster.ServiceItem.ParentCategory.ServiceCategoryName || '';
                }
                if ($scope.Encounter.GuarantorTypeId > 1) {
                    if ($scope.encGuarantorAgreements && $scope.encGuarantorAgreements.length > 0) {
                        for (var encGAidx in $scope.encGuarantorAgreements) {
                            var agreementitem = $scope.encGuarantorAgreements[encGAidx];
                            if (agreementitem.ServiceCategoryId === item.CategoryId) {
                                if ($scope.currentfilter.DiscountModeId > 0) {
                                    item.IsInsAgreementDiscount = true;
                                    if ($scope.currentfilter.DiscountModeId == 2) {
                                        item.AgreementDiscountRate = parseFloat(agreementitem.IPDiscount).toFixed(2);
                                    } else if ($scope.currentfilter.DiscountModeId == 1) {
                                        item.AgreementDiscountRate = parseFloat(agreementitem.IPDiscountRate).toFixed(2);
                                    }
                                } else {
                                    utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                                }
                            }
                        }
                    }
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('Selected Test is not mapped with any Services.....'));
                document.getElementById("testid").value = '';
                console.log(testMaster);
                console.log(item);
                // $scope.item.TestId = 0;
                // $scope.item.TestName = '';
                // $scope.item.Quantity = 1;
                // $scope.item.ServicePrice = '';
                // $scope.item.OrderPriorityId = 1;
                // $scope.item.TestInstruction = '';
                // $scope.PatientBillDetails[idx].TestId = '';
                // $scope.PatientBillDetails[idx].TestName = '';
                // $scope.PatientBillDetails.splice(idx, 1);
                // item.TestId = 0;
                // item.TestName = '';
                // item.Quantity = 1;
                // item.ServicePrice = '';
                // item.OrderPriorityId = 1;
                // item.TestInstruction = '';
                return;
            }
            if (testMaster.ScheduleDate) {
                item.ScheduleDate = testMaster.ScheduleDate;
            } else
                item.ScheduleDate = $scope.item.OrderScheduleDate;

            var Tariff = {
                Rate: 0,
                DoctorShare: 0
            };
            var ServiceItem = testMaster.ServiceItem;
            if (ServiceItem && ServiceItem.Id > 0 &&
                ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                Tariff = ServiceItem.ServiceItemTariffDetails[0];
            }
            if ($scope.CategoryPromotions && $scope.CategoryPromotions.length > 0) {
                for (var ctsc in $scope.CategoryPromotions) {
                    var catescheme = $scope.CategoryPromotions[ctsc];
                    if (catescheme.ServiceCategoryId === item.CategoryId) {
                        if ($scope.currentfilter.DiscountModeId > 0) {
                            item.IsSchemeDiscount = true;
                            if ($scope.currentfilter.DiscountModeId == 2) {
                                if (catescheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                    item.SchemeDiscountRate = parseFloat(catescheme.Discount).toFixed(2);
                                }
                            } else if ($scope.currentfilter.DiscountModeId == 1) {
                                if (catescheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                    item.SchemeDiscountAmt = parseFloat(catescheme.Discount).toFixed(2);
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
                    if (itemScheme.ServiceItemId === ServiceItem.Id) {
                        if ($scope.currentfilter.DiscountModeId > 0) {
                            if ($scope.currentfilter.DiscountModeId == 2) {
                                item.IsSchemeDiscount = true;
                                if (itemScheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                    item.SchemeDiscountRate = parseFloat(itemScheme.Discount).toFixed(2);
                                }
                            } else if ($scope.currentfilter.DiscountModeId == 1) {
                                if (itemScheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                    item.SchemeDiscountAmt = parseFloat(itemScheme.Discount).toFixed(2);
                                }
                            }
                        } else {
                            utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                        }
                    }
                }
            }
            item.TestPrice = Tariff.Rate;
            $scope.item.TestPrice = Tariff.Rate;
            if (!$scope.allowipdrshare || $scope.allowipdrshare == 0) {
                item.DoctorShareValue = Tariff.DoctorShareValue;
                item.DoctorShare = Tariff.DoctorShare;
            }
            // item.DoctorShare = Tariff.DoctorShare || 0;
            $scope.computeNetAmount(item);
        }

        $scope.BillCalc = function () {
            $scope.BillAmount = 0;
            $scope.BillDiscount = 0;
            $scope.item.OrderTotal = 0;
            $scope.item.NetPatientAmount = 0;
            $scope.item.NetInsuranceAmount = 0;
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                $scope.BillAmount += parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                item.Rate = item.TestPrice;
                // item.UnitPrice = item.TestPrice;
                item.Quantity = item.Quantity;
                item.Amount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                item.GrossAmount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                if ($scope.currentfilter.DiscountModeId == 1) {
                    if (item.SchemeDiscountAmt > 0) {
                        item.NetAmount = item.Amount - item.SchemeDiscountAmt;
                    }
                    if (item.AgreementDiscountRate > 0) {
                        item.AgreementDiscountAmt = item.AgreementDiscountRate;
                        item.NetAmount = item.Amount - item.AgreementDiscountRate;
                    }
                    if (item.Discount > 0) {
                        item.DiscountAmount = item.Discount;
                        if (item.DiscountAmount > item.Amount) {
                            item.Discount = 0;
                            item.NetAmount = item.Amount;
                            utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                        } else {
                            item.NetAmount = item.Amount - item.DiscountAmount;
                        }
                    } else {
                        item.DiscountAmount = 0;
                    }
                }


                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    if (item.SchemeDiscountRate > 0) {
                        var sdisamt = (item.SchemeDiscountRate / 100) * item.Amount;
                        item.SchemeDiscountAmt = sdisamt;
                        item.NetAmount = item.Amount - sdisamt;
                    }
                    if (item.AgreementDiscountRate > 0) {
                        var discamt = (item.AgreementDiscountRate / 100) * item.Amount;
                        item.AgreementDiscountAmt = discamt;
                        item.NetAmount = item.Amount - discamt;
                    }
                    if (item.Discount > 0) {
                        item.DiscountAmount = (item.Discount / 100) * item.Amount;
                        if (item.DiscountAmount > item.Amount) {
                            item.Discount = 0;
                            item.NetAmount = item.Amount;
                            utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                        } else {
                            item.NetAmount = item.Amount - item.DiscountAmount;
                        }
                    } else {
                        item.DiscountAmount = 0;
                    }
                    if (item.AgreementDiscountRate > 0 && item.Discount > 0) {
                        var agreediscamt = (item.AgreementDiscountRate / 100) * item.Amount;
                        item.AgreementDiscountAmt = agreediscamt;
                        item.DiscountAmount = (item.Discount / 100) * item.Amount;
                        var totdiscamt = parseFloat(agreediscamt) + parseFloat(item.DiscountAmount);
                        item.NetAmount = item.Amount - totdiscamt;
                    }
                    if (item.SchemeDiscountRate > 0 && item.DiscountAmount > 0) {
                        var sdisamt = (item.SchemeDiscountRate / 100) * item.Amount;
                        item.SchemeDiscountAmt = sdisamt;
                        var discamt = (item.DiscountAmount / 100) * item.Amount;
                        var totdiscamt = parseFloat(sdisamt) + parseFloat(discamt);
                        item.NetAmount = item.Amount - totdiscamt;
                    } else if ((!item.DiscountAmount && !item.AgreementDiscountRate && !item.SchemeDiscountAmt) ||
                        (item.DiscountAmount == 0 && item.AgreementDiscountRate == 0 && item.SchemeDiscountAmt == 0)) {
                        item.NetAmount = item.Amount;
                    }
                }
                if ($scope.Encounter.GuarantorTypeId > 1) {
                    if ($scope.item.CoPayPercent) {
                        item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                        item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);
                    }
                    if (!$scope.item.CoPayPercent) {
                        item.InsNetAmount = parseFloat(item.NetAmount);
                    }
                }
                $scope.BillDiscount += parseFloat(item.Discount);
                $scope.item.OrderTotal += item.NetAmount;
                $scope.item.NetPatientAmount += item.PatNetAmount || 0;
                $scope.item.NetInsuranceAmount += item.InsNetAmount || 0;
            }
        };

        $scope.computeNetAmount = function (item) {
            if (item.TestPrice && item.Quantity) {
                item.NetAmount = item.TestPrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        vm.doctorcontrolconfig = {
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
            // api: 'SystemSettings/User/GetUsers',
            api: 'SystemSettings/User/GetMinUsers',
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
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                },
                {
                    Key: 5,
                    Value: 2
                },
                // {
                //     Key: 2,
                //     Value: [-1, utl.Session.getCurrentFacilityId()]
                // }
                {
                    Key: 33,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                },
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.patientChange();
            $scope.getEncounters();
            if ($scope.currentcontext.bid && $scope.currentcontext.bid > 0) {
                $scope.getDetails($scope.currentcontext.bid);
            }

            $timeout(function () {
                $('#desc0').focus();
            }, 1000);
        };

        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode != 32) {
                if (kCode == 113 && !$scope.IsApproved) { // F2  - SaveDraft
                    $scope.completeBill();
                }
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                },
                Default: false
            },
            {
                "Key": "Department"
            },
            {
                "Key": "DiscountMode"
            }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) { // right
                nextId = nextId + index;
                $('#' + nextId).select();
                $('#' + nextId).focus();
            } else if (event.keyCode == 37) { // left
                prevId = prevId + index;
                $('#' + prevId).focus();
            } else if (event.keyCode == 38) { // Up
                if (upId == 'rate') {
                    upId = upId + (index - 1);
                    $('#' + upId).focus();
                } else if (upId == 'desc') {
                    if ($scope.autosearchpopup == 0) {
                        upId = upId + (index - 1);
                        $('#' + upId).focus();
                    }
                }
            } else if (event.keyCode == 40) { // Down
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }
            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        var paytypedom = document.getElementById('btnsubmit');
                        $scope.setCmbFocus(paytypedom);
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                } else if (nextId == 'rate') {
                    nextId = nextId + index;
                    $timeout(function () {
                        $('#' + nextId).select();
                        $('#' + nextId).focus();
                    }, 100);
                }
            }
        };

        // ------------------------------------------------------------------
        // React bridge for this screen's three live <ui-select> controls
        // (Department, Tariff, Discount Mode). The Doctor select in this
        // template is inside an HTML comment -- the live Doctor control is the
        // existing <autosearch> directive, which is not part of this
        // conversion and is untouched. Nothing else on the screen changes:
        // the order grid and its repeat, the discount workflow, save/approve,
        // the focus chain, and every API call, payload and privilege check
        // stay exactly as they are.
        //
        // All three models are written from several asynchronous paths in this
        // 1860-line controller, so the props are rebuilt from $watchGroup
        // rather than from a fixed list of call sites. The watches read only
        // the lookup array reference, the model value and the two status
        // flags, so they are reference/primitive comparisons with no deep
        // traversal.
        //
        // Department (Encounter.DepartmentId) and Tariff
        // (Encounter.ServiceRateCategoryId):
        //   model            unchanged fields
        //   lookup           lookup.Department / lookup.ServiceRateCategory,
        //                    unreshaped
        //   id type          numeric Id ("lookupitem.Id as lookupitem in ...")
        //   full object      neither had an on-select or ng-change, so no
        //                    handler has ever received the selected object;
        //                    none invented
        //   required         neither is required. utl.Validator.validate(
        //                    $scope) is called elsewhere in this controller,
        //                    but neither control contributes a required
        //                    validator to item_form, so no shim is added and
        //                    form validity is unchanged.
        //   field names      "department" and "tariff", unchanged
        //   disabled         isCompleted||isCancelled, read off the scope
        //                    exactly as before
        //   allow-clear      not present; not added
        //   keyboard/focus   tabindex="-1" preserved on both, so they stay out
        //                    of the tab order as they do today
        //
        // Discount Mode (currentfilter.DiscountModeId):
        //   ng-change        DiscountModechange(), the same unchanged scope
        //                    function, called after the model is written --
        //                    the order ng-model then ng-change produced
        //   no name, no required, no ng-disabled in the original; none added
        //   class            "ui-select-grid" carried through, since the
        //                    stylesheet targets the control by that class
        function encounterSelectProps(field, lookupKey, name) {
            return {
                options: ($scope.lookup && $scope.lookup[lookupKey]) || [],
                value: $scope.Encounter ? $scope.Encounter[field] : null,
                disabled: !!($scope.isCompleted || $scope.isCancelled),
                name: name,
                tabIndex: -1
            };
        }

        function encounterSelectAction(field, refresh) {
            return function (actionType, payload) {
                if (actionType == 'change') {
                    // ng-model="Encounter.<field>" would have created the
                    // intermediate object on assignment.
                    if (!$scope.Encounter) { $scope.Encounter = {}; }
                    $scope.Encounter[field] = payload.id;
                    refresh();
                }
            };
        }

        $scope.refreshDepartmentProps = function () {
            $scope.reactPropsDepartmentContainer = {
                reactProps: encounterSelectProps('DepartmentId', 'Department', 'department'),
                onAction: encounterSelectAction('DepartmentId', $scope.refreshDepartmentProps)
            };
        };

        $scope.refreshTariffProps = function () {
            $scope.reactPropsTariffContainer = {
                reactProps: encounterSelectProps('ServiceRateCategoryId', 'ServiceRateCategory', 'tariff'),
                onAction: encounterSelectAction('ServiceRateCategoryId', $scope.refreshTariffProps)
            };
        };

        $scope.refreshDiscountModeProps = function () {
            $scope.reactPropsDiscountModeContainer = {
                reactProps: {
                    options: ($scope.lookup && $scope.lookup.DiscountMode) || [],
                    value: $scope.currentfilter.DiscountModeId,
                    className: 'ui-select-grid'
                },
                onAction: function (actionType, payload) {
                    if (actionType == 'change') {
                        $scope.currentfilter.DiscountModeId = payload.id;
                        $scope.DiscountModechange();
                        $scope.refreshDiscountModeProps();
                    }
                }
            };
        };

        $scope.refreshDepartmentProps();
        $scope.refreshTariffProps();
        $scope.refreshDiscountModeProps();

        $scope.$watchGroup([
            function () { return $scope.lookup && $scope.lookup.Department; },
            function () { return $scope.Encounter && $scope.Encounter.DepartmentId; },
            function () { return $scope.isCompleted; },
            function () { return $scope.isCancelled; }
        ], $scope.refreshDepartmentProps);

        $scope.$watchGroup([
            function () { return $scope.lookup && $scope.lookup.ServiceRateCategory; },
            function () { return $scope.Encounter && $scope.Encounter.ServiceRateCategoryId; },
            function () { return $scope.isCompleted; },
            function () { return $scope.isCancelled; }
        ], $scope.refreshTariffProps);

        $scope.$watchGroup([
            function () { return $scope.lookup && $scope.lookup.DiscountMode; },
            function () { return $scope.currentfilter.DiscountModeId; }
        ], $scope.refreshDiscountModeProps);

        $scope.initLookup();
    }

    ipbillingorderdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter', '$timeout'];

})();