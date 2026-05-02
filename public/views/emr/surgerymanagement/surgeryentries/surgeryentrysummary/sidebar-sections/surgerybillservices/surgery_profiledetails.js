(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgerybillProfiledetailsController', SurgerybillProfiledetailsController);

    function SurgerybillProfiledetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        $scope.DoctorClassId = -1;
        $scope.DrIncludeTax = false;
        $scope.DrShareDetailInfo = {};
        $scope.SerItmCalculateTax = false;
        $scope.SerItmGSTInfo = {};
        $scope.Lineitems = {};

        $scope.isCompleted = false;
        $scope.isCancelled = false;

        $scope.tabindexmap = {
            detailtabindex: 0
        };
        $scope.currentfilter = {};
        $scope.item = {
            BillDateTime: utl.Formatter.getCurrentDate(),
            BillPriorityId: 1
        };
        $scope.currentfilter.DiscountModeId = 2;
        var guarantorId_ = 1000;
        var facilityId_ = utl.Session.getCurrentFacilityId();

        if (!facilityId_) facilityId_ = 1;
        guarantorId_ *= facilityId_;
        $scope.GuarantorMasterId = guarantorId_;
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];
        $scope.PatientBillInfoDetails = [];
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.sentryid = parseInt(modalConfig.params.id);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.bid = parseInt(modalConfig.params.bid);
            $scope.currentcontext.BillTotal = parseFloat(modalConfig.params.billtotal);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.IsBedcontext = false;
        $scope.IsBedcontext = true;
        $scope.allowipdrshare = 0;
        $scope.allowipdrshare =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'allowipdrshare');

        $scope.currentcontext.selecteddept = [];
        $scope.item.PatientId = $scope.currentcontext.pid;


        $scope.getsurgeryEntryCallback = function (scope, data, options, hasError) {
            $scope.item.PatientId = data.PatientId;
            $scope.item.EncounterId = data.EncounterId;
            $scope.item.OTRegisterId = data.Id;
            $scope.item.OTIdentifier = data.SurgeryIdentifier;
        };

        $scope.getSurgeryEntryData = function () {
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntryById',
                data: {
                    Id: $scope.currentcontext.sentryid
                },
                type: 'post',
                onComplete: $scope.getsurgeryEntryCallback
            };

            utl.Http.doAction(options);
        };



        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.selectedPatient.Id
                },
                confirmCallback: $scope.getItem
            });
        };

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
            if (item.ServiceId > 0) {
                item.Amount = item.Quantity * item.Rate;
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
                        item.NetAmount = item.Amount - item.DiscountAmount;
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
                } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                    if (item.SchemeDiscountAmt > 0) {
                        item.NetAmount = item.Amount - item.SchemeDiscountAmt;
                    }
                    if (item.AgreementDiscountRate > 0) {
                        item.AgreementDiscountAmt = item.AgreementDiscountRate;
                        item.NetAmount = item.Amount - item.AgreementDiscountRate;
                    }
                    if (item.Discount > 0) {
                        item.DiscountAmount = item.Discount;
                        item.NetAmount = item.Amount - item.DiscountAmount;
                    } else {
                        item.DiscountAmount = 0;
                    }
                    if (item.AgreementDiscountRate > 0 && item.Discount > 0) {
                        item.AgreementDiscountAmt = item.AgreementDiscountRate;
                        item.DiscountAmount = item.Discount;
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
                if (item.DiscountAmount > item.GrossAmount) {
                    item.DiscountAmount = $scope.ValidDiscount;
                }
                if (item.DoctorShare > item.GrossAmount) {
                    item.DoctorShare = $scope.ValidShareAmt;
                }
                item.NetAmount = item.Rate * item.Quantity;
                $scope.item.BillAmount = 0;
                $scope.item.BillDiscount = 0;
                $scope.TotalNet = 0;
                if (item.DiscountAmount == undefined || isNaN(item.DiscountAmount) || item.DiscountAmount == null) {
                    item.DiscountAmount = 0;
                }
                item.DoctorShare = parseFloat(item.DoctorShare);
                // if (item.DoctorShare == undefined || isNaN(item.DoctorShare) || item.DoctorShare == null) {
                //     item.DoctorShare = parseFloat(0).toFixed(2);
                // }

                if (item.GSTPercentage) {
                    item.UnitGSTAmount = (item.GSTPercentage / 100) * item.Rate;
                }
                if (item.UnitGSTAmount > 0) {
                    item.GSTAmount = item.UnitGSTAmount * item.Quantity;
                    item.NetAmount = ((item.Rate * item.Quantity) + item.GSTAmount) - item.DiscountAmount;
                }
                if (item.DoctorShareValue > 0) {
                    item.DoctorShare = item.NetAmount * item.DoctorShareValue / 100;
                }
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.item.BillAmount = $scope.item.BillAmount + $scope.PatientBillDetails[idx].NetAmount;
                        $scope.PatientBillDetails[idx].Amount = parseFloat($scope.PatientBillDetails[idx].Quantity) *
                            parseFloat($scope.PatientBillDetails[idx].Rate) -
                            parseFloat($scope.PatientBillDetails[idx].DiscountAmount);
                        if ($scope.PatientBillDetails[idx].AgreementDiscountAmt) {
                            $scope.PatientBillDetails[idx].Amount = parseFloat($scope.PatientBillDetails[idx].Quantity) *
                                parseFloat($scope.PatientBillDetails[idx].Rate) -
                                parseFloat($scope.PatientBillDetails[idx].AgreementDiscountAmt);
                        }
                        if ($scope.PatientBillDetails[idx].UnitGSTAmount) {
                            $scope.PatientBillDetails[idx].Amount = parseFloat($scope.PatientBillDetails[idx].Quantity) *
                                parseFloat($scope.PatientBillDetails[idx].Rate) +
                                parseFloat($scope.PatientBillDetails[idx].GSTAmount);
                        }
                        $scope.PatientBillDetails[idx].GrossAmount = parseFloat($scope.PatientBillDetails[idx].Quantity) *
                            parseFloat($scope.PatientBillDetails[idx].Rate);
                        $scope.TotalNet += parseFloat($scope.PatientBillDetails[idx].Amount);
                        $scope.item.BillDiscount += parseFloat($scope.PatientBillDetails[idx].DiscountAmount);
                        $scope.PatientBillDetails[idx].NetAmount = $scope.PatientBillDetails[idx].Amount;
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
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.TotalNet += parseFloat($scope.PatientBillDetails[idx].NetAmount);
                        $scope.item.BillAmount = $scope.item.BillAmount + $scope.PatientBillDetails[idx].NetAmount;
                        $scope.item.BillDiscount += parseInt($scope.PatientBillDetails[idx].DiscountAmount);
                    }
                }
            }
        };

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res;
            $scope.encGuarantorAgreements = [];
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
            item.IsInsAgreementDiscount = false;
            if ($scope.CategoryPromotions && $scope.CategoryPromotions.length > 0) {
                for (var ctsc in $scope.CategoryPromotions) {
                    var catescheme = $scope.CategoryPromotions[ctsc];
                    if (catescheme.ServiceCategoryId === item.ServiceCategoryId) {
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
                    if (itemScheme.ServiceItemId === item.ServiceId) {
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
            if ($scope.Encounter.GuarantorTypeId > 1) {
                if ($scope.encGuarantorAgreements && $scope.encGuarantorAgreements.length > 0) {
                    for (var encGAidx in $scope.encGuarantorAgreements) {
                        var agreementitem = $scope.encGuarantorAgreements[encGAidx];
                        if (agreementitem.ServiceCategoryId === item.ServiceCategoryId) {
                            if ($scope.currentfilter.DiscountModeId > 0) {
                                item.IsInsAgreementDiscount = true;
                                if ($scope.currentfilter.DiscountModeId == 2) {
                                    item.AgreementDiscountRate = parseFloat(agreementitem.DiscountRate).toFixed(2);
                                }
                                // else if ($scope.currentfilter.DiscountModeId == 1) {
                                //     item.AgreementDiscountRate = parseFloat(agreementitem.DiscountRate).toFixed(2);
                                // }
                            } else {
                                utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                            }
                        }
                    }
                }
            }
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
                item.Rate = ServiceTraiffobj[0].Rate;
                if (!$scope.allowipdrshare || $scope.allowipdrshare == 0) {
                    item.DoctorShareValue = ServiceTraiffobj[0].DoctorShareValue;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                }
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
            $scope.DiscountModechange();
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
                    ratetype: $scope.Encounter.ServiceRateCategoryId,
                    filterData: $scope.currentfilter
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
                                } catch (ex) {}
                                try {
                                    if ($scope.DrIncludeTax && item.DrTaxPercentage > 0) {
                                        TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                        item.GSTAmount = TaxPerAmount;
                                        item.DrTaxAmount = TaxPerAmount;
                                        item.DoctorShare += item.GSTAmount;
                                        item.NetAmount += item.GSTAmount;
                                    }
                                    item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                } catch (ex) {}
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
                                } catch (ex) {}
                                try {
                                    if ($scope.DrIncludeTax && item.DrTaxPercentage > 0) {
                                        TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                        item.GSTAmount = TaxPerAmount;
                                        item.DrTaxAmount = TaxPerAmount;
                                        item.DoctorShare += item.GSTAmount;
                                        item.NetAmount += item.GSTAmount;
                                    }
                                    item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                } catch (ex) {}
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
            }, ],
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
            $scope.confirmCallback();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
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
            /*
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
            */

            $scope.saveAndApprove();
        };

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return;

            var DetailsInfo = getLinesForSave();
            if (DetailsInfo.isValid) {
                utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
                return;
            }

            if (!$scope.item.FacilityId)
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

            $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();
            $scope.item.IsFromOT = true;
            var lines = DetailsInfo.Details;

            var paymentlines = getpaymentsLinesForSave();
            $scope.item.Id = $scope.item.Id || 0;
            var actionName = 'billing/patientbills/AddPatientBills';
            if ($scope.currentcontext.bid && $scope.currentcontext.bid > 0) {
                actionName = 'billing/patientbills/UpdatePatientBills';
            }
            var inputData = {
                Header: $scope.item,
                Details: lines,
                paymentDetail: paymentlines
            };
            savehitcompleted = 1;
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getpaymentsLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientPaymentDetails) {
                var item = $scope.PatientPaymentDetails[idx];
                if (item.AmountPaid > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function getLinesForSave() {
            var result = [];
            var isValid = true;
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if ((item.Quantity > 0 && item.Status == 1) || item.PackageMasterServiceId > 0) {
                    if (item.ServiceId > 0) {
                        if (item.DocShareDetails) {
                            if (item.DocShareDetails.length > 0) {
                                for (var per = 0, perlen = item.DocShareDetails.length; per < perlen; per++) {
                                    if (item.DocShareDetails[per].PerformDrShareValue > 0) {
                                        item.DocShareDetails[per].PerformDrShare = item.NetAmount * (item.DocShareDetails[per].PerformDrShareValue / 100);
                                    }
                                }
                            }
                        }
                        item.BillDateTime = $scope.item.BillDateTime;
                        item.Amount = item.Amount;
                        item.GrossAmount = item.GrossAmount;
                        item.EncounterId = $scope.item.EncounterId;
                        item.DepartmentId = item.DepartmentId;
                        item.DoctorDiscountAmount = 0;
                        item.GSTId = item.GSTId;
                        item.TaxId = item.GSTId;
                        item.TaxCode = item.TaxCode;
                        item.TaxCost = item.GSTAmount;
                        item.IsPackageItem = item.IsPackageItem;
                        item.IsPackage = item.IsPackage;
                        item.PackageId = 0;
                        item.PackageName = '';
                        item.OrderId = 0;
                        item.OrderDetailId = 0;
                        item.OrderDateTime = utl.Formatter.getCurrentDate();
                        item.RequestDate = utl.Formatter.getCurrentDate();
                        item.IsModified = 0;
                        item.IsSupplementary = item.IsSupplementary;
                        item.IsBillable = 0;
                        item.IsDoctorDiscount = 0;
                        item.IsGstDoctor = 0;
                        item.StartDateTime = null;
                        item.EndDateTime = null;
                        item.DiscountTypeId = item.DiscountTypeId;
                        item.DiscountAuthorizedBy = 0;
                        item.DoctorId = item.DoctorId;
                        item.DoctorShareValue = item.DoctorShareValue || 0;
                        item.DoctorShare = item.DoctorShare || 0;
                        item.AllowIPDocShare = $scope.allowipdrshare || 0;
                        // item.PerformDoctorId = item.PerformDoctorId || 0;
                        // item.PerformDoctorName = item.PerformDoctorName;
                        // item.PerformDrShareValue = item.PerformDrShareValue || 0;
                        // item.PerformDrShare = item.PerformDrShare || 0;
                        item.Quantity = item.Quantity;
                        item.ServiceCategoryId = item.ServiceCategoryId;
                        item.ServiceGroupId = item.ServiceGroupId;
                        item.ServiceSubCategoryId = item.ServiceSubCategoryId;
                        item.ReferalShare = 0;
                        item.CancelReason = 0;
                        item.CancelledBy = 0;
                        item.Comments = '';
                        item.PatientBillStatusId = $scope.item.PatientBillStatusId;
                        item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
                        item.AliasId = item.AliasId || null;
                        item.AliasName = item.AliasName || null;
                        item.DocShareDetails = item.DocShareDetails;
                        result.push(item);
                    } else
                        isValid = false;
                }
            }
            if (result.length == 0) {
                utl.Alert.showErrorMsg('Rate Should not be zero');
                return;
            }
            return {
                Details: result,
                isValid: isValid
            };
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
                if ($scope.PatientBillDetails[lastIndex].ServiceId == -1)
                    return false;
            }
            var PatientBillDetails = {
                RdoDiscountMode: true,
                RdoDiscount: true,
                Id: 0,
                ServiceId: -1,
                Serviceididx: null,
                Rateidx: null,
                ServiceCode: '',
                ServiceName: '',
                RequestDate: null,
                TestId: -1,
                TestCode: '',
                TestName: '',
                TestDescription: '',
                DepartmentId: -1,
                SubDepartmentId: -1,
                BillDateTime: utl.Formatter.getCurrentDate(),
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
                PackageMasterServiceId: 0,
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetails.PatientBillId = $scope.currentcontext.id;
            }

            $scope.PatientBillDetails.push(PatientBillDetails);

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
            } catch (ex) {}
            item.Status = 2;
            $scope.calcAmt(0, item);
        };

        $scope.DiscountModechange = function () {
            for (var idx in $scope.PatientBillDetails) {
                $scope.ItemwiseDiscountModechange(idx, $scope.PatientBillDetails[idx]);
            }
        };

        $scope.ItemwiseDiscountModechange = function (idx, item) {
            $scope.calcAmt(idx, item);
        };

        $scope.deleteDetail = function (idx, item) {
            item.index = idx;
            var lastindex = $scope.PatientBillDetails.length - 1;
            if (item.ServiceId != -1 || null) {
                var name = item.ServiceId || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Billing Service',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Rate',
                    field: 'ServiceItemRate',
                    datatype: 'string',
                    headercls: 'td-rate',
                    fieldcls: 'td-rate'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        };

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 6,
                        Value: $scope.GuarantorMasterId
                    },
                    {
                        Key: 15,
                        Value: false
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                var otherservicemiddlesearch =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'otherservicemiddlesearch');
                if (otherservicemiddlesearch) {
                    inputData.Params.push({
                        Key: 1,
                        Value: query
                    });
                } else {
                    inputData.Params.push({
                        Key: 26,
                        Value: query
                    });
                }
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        };

        function postsearchserviceitem() {
            if ($scope.Encounter) {
                for (var idx in vm.serviceitemcontrolconfig.result) {
                    var item = vm.serviceitemcontrolconfig.result[idx];
                    item.ServiceCode = item.ItemCode;
                    item.ServiceName = item.Name;
                    var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                        ServiceRateCategoryId: $scope.Encounter.ServiceRateCategoryId
                    }, true);
                    if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                        item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                        item.DoctorShareValue = ServiceTraiffobj[0].DoctorShareValue;
                        item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                    }
                    var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.Encounter.GuarantorId);
                    if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                        var ServiceItemAliasobj = $filter('filter')(item.ServiceItemAliases, {
                            ExternalProviderId: selectedGuarantor.GuarantorId
                        }, true);
                        if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                            item.AliasId = ServiceItemAliasobj[0].AliasId;
                            item.AliasName = ServiceItemAliasobj[0].AliasName;
                        }
                    }
                }
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
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
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
            $scope.getSurgeryEntryData();
            if ($scope.currentcontext.bid && $scope.currentcontext.bid > 0) {
                $scope.getDetails($scope.currentcontext.bid);
            }

            $timeout(function () {
                $('#desc0').focus();
            }, 1000);
        };

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
                            Value: utl.Session.getCurrentFacilityId()
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

        $scope.initLookup();
    }

    SurgerybillProfiledetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter', '$timeout'];

})();