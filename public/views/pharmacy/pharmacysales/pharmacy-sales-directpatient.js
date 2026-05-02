(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacydirectsalesController', pharmacydirectsalesController);

    function pharmacydirectsalesController($rootScope, $scope, $interval, $stateParams, $state, $translate, utl, $filter, modalConfig, $timeout) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.autosearchpopup = 0;
        $scope.separatePaymentCounter = 0;
        $scope.lookup = {};
        $scope.WantListItem = {};
        $scope.WantedListData = {};
        $scope.CanShowLineItemDiscount = false;
        $scope.ShowHeaderDisc = true;
        $scope.CanShowQtyFields = true;
        $scope.IslineDisc = false;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));
        $scope.backtoList = function () {
            $state.go('app.pharmacydashboard');
        }
        $scope.currentcontext = {};

        $scope.zerostocksales = 0;
        $scope.enableroundoff = 0;
        $scope.requirewantedlist = 0;
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        $scope.IsMomentPay = 0;
        $scope.IsMomentPay = utl.FacilitySetting.getFacilitySettingValue('billing', 'isMomentPay');
        $scope.zerostocksales =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'zerostocksales');
        $scope.enableroundoff =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'enableroundoff');
        $scope.requirewantedlist =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'requirewantedlist');
        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;


        var guarantorId_ = 1000;
        var facilityId_ = utl.Session.getCurrentFacilityId();
        if (!facilityId_) facilityId_ = 1;
        guarantorId_ *= facilityId_;
        $scope.IsDueAllowed = utl.Session.getIsDueCheck();
        $scope.disallowMultiplePay = false;

        function initPharmacy() {
            $scope.SelectedIndex = -1;
            $scope.LastTransactionData = '';
            $scope.isSaveandApprove = true;
            $scope.isSaving = false;
            $scope.outstanding = true;
            $scope.RdoPatientId = false;
            $scope.RdoBillnumber = false;
            $scope.IsDue = false;
            $scope.IsDisabled = true;
            $scope.RdoPharmacySaleType = false;
            $scope.RdoStoreMasterId = false;
            $scope.dmprintpreferences = 0;
            $scope.separatePaymentCounter = 0;
            $scope.printpreferences = 1;
            $scope.PrescriptionInfo = [];
            $scope.PatientBillInfo = [];
            $scope.DeletedPatientBills = [];
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];
            $scope.PaymentAdjustmentDetails = [];
            $scope.StoreStaffDiscounts = [];
            $scope.encounter = {};
            $scope.selectedPatient = {};
            $scope.itemUsedBatches = {};
            $scope.CanDelete = false;
            $scope.FindOldBillFlag = 0;
            $scope.SaveImdDMPrint = 0;

            $scope.tabindexmap = {
                patienttabindex: 1,
                detailtabindex: 2
            };

            $scope.originalprint = function () {

                var inputData = {
                    Id: $scope.currentcontext.id,
                    Data: {
                        Reason: $scope.currentcontext.printreason
                    }
                };
                var options = {
                    action: 'billing/patientbills/PrintPharmacyBills',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };

            $scope.item = {
                PatientId: -1,
                BillWithComeReceipt: true,
                StaffCheck: false,
                WithHeader: true,
                WithoutHeader: false,
                PatientTypeId: -1,
                StaffDiscountId: -1,
                StaffId: -1,
                StaffDiscountPercentage: 0,
                StaffDiscountTypeId: 0,
                PatientBillStatusId: 1,
                CollectedOn: utl.Formatter.getCurrentDate(),
                ChequeDate: utl.Formatter.getCurrentDate(),
                DDDate: utl.Formatter.getCurrentDate(),
                WireTransferDate: utl.Formatter.getCurrentDate(),
                TotDiscAmount: 0,
                GrossAmount: 0,
                ToBeRefunded: 0,
                TotRndoffAmt: 0,
                PreferedRoundOff: 0,
                PharmacySaleTypeId: 4,
                PrivateDueId: 0,
                GuarantorDueId: 0,
                GSTAmount: 0,
                InGstAmount: 0,
                CGstAmount: 0,
                SGstAmount: 0,
                RefundAmount: 0,
                IsPharmacyBill: 1,
                PrescriptionId: 0,
                IsPrescription: 0,
                Comments: '',
                pendingPrescriptions: 0,
                DrugServiceCategoryId: 0,
                DrugServiceGroupId: 0,
                NonDrugServiceCategoryId: 0,
                NonDrugServiceGroupId: 0,
                TotalDueAmount: 0,
                TotalPaidAmount: 0,
                TotalAvailableAmount: 0,
                OPBillsAmount: 0,
                OPBillsDiscountAmount: 0,
                OPBillsRoundedAmount: 0,
                IPBillsAmount: 0,
                IPBillsDiscountAmount: 0,
                IPBillsRoundedAmount: 0,
                AmountReceived: 0,
                AmountRefunded: 0,
                canShowFinanceBtn: false,
                canShowAdvanceBtn: false,
                IsGenericSearch: false,
                IsPharmacyDueAllowed: utl.Session.getIsPharmacyDueAllowed()
            };

            $scope.newPatient = {
                PatientName: '',
                DoctorName: '',
                Mobile: '',
                TitleId: -1,
                GenderId: -1,
                DOB: null,
                Age: 0
            };

            $scope.currentcontext = {
                id: 0,
                RdoBillDiscount: true,
                RdoBillDiscountMode: true,
                Rdobilldate: true,
                BillDiscountTypeId: -1,
                BillDiscount: 0,
                BillDiscountModeId: -1,
                DiscountModeValue: 0,
                DiscountApprovedBy: -1,
                ApprovedById: -1,
                PaymentTypeId: 1,
                TotNetAmount: 0,
                TotDiscountAmt: 0,
                ReturnedAmount: 0,
                PaidAmt: 0,
                ReceiptAmt: 0,
                TotBalanceAmt: 0,
                TotDueAmt: 0,
                PatientBillStatusId: 1,
                PharmacyBillStatusId: 0,
                PatientStatusId: 1,
                CNAmount: 0,
                PendingAmt: 0,
                isnewpatient: false,
                IsAdjustAgainstAdvance: false,
                ismodal: modalConfig && modalConfig.params ? true : false
            };


            $scope.currentfilter = {
                billdate: utl.Formatter.getCurrentDate(),
                billnumber: '',
                PatientId: -1,
                patientname: '',
                DoctorId: -1,
                DoctorName: '',
                DepartmentId: -1,
                PayScenarioId: -1,
                GuarantorId: -1,
                GuarantorTypeId: -1,
                GuarantorName: '',
                StoreMasterId: 0,
                StoreTypeId: 0,
                StoreSubTypeId: 0,
                SequenceOptionId: 1,
                ExpiryWarningDays: 0,
                ExpiryPriorStopDays: 0,
                DiscountModeId: 2
            };
        }

        initPharmacy();

        $scope.EnableBillWithComeReceipt = function () {
            var flag = !$scope.item.BillWithComeReceipt;
            $scope.currentcontext.RdoReceiptAmt = flag;
            $scope.RdoPaymentTypeId = flag;
        };

        $scope.EnableDisableDropdown = function (flag) {
            $scope.RdoPatientId = !flag;
            $scope.RdoDoctorId = flag;
            $scope.RdoDepartmentId = flag;
            $scope.RdoPayScenarioId = flag;
            $scope.RdoGuarantorId = flag;
            $scope.RdoItemMasterId = flag;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                $scope.PatientBillDetails[i].RdoItemMasterId = flag;
                $scope.PatientBillDetails[i].RdoDiscountMode = flag;
                $scope.PatientBillDetails[i].RdoDiscountTypeId = flag;
            }

            $scope.currentcontext.RdoBillDiscount = flag;
            $scope.RdoBillDiscountTypeId = flag;
            $scope.RdoApprovedById = flag;
            $scope.currentcontext.RdoBillDiscountMode = flag;

            $scope.EnableBillWithComeReceipt();
        };

        $scope.EnableDisableDropdown($scope.isSaving);

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            if ($scope.selectedPatient.OutStandingAmount && $scope.selectedPatient.OutStandingAmount > 0) {
                $scope.currentcontext.TotDueAmt = $scope.selectedPatient.OutStandingAmount;
            }
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.FacilityId = $scope.selectedPatient.FacilityId;

            $scope.item.OPBillsAmount = $scope.selectedPatient.OPBillsAmount || 0;
            $scope.item.OPBillsDiscountAmount = $scope.selectedPatient.OPBillsDiscountAmount || 0;
            $scope.item.OPBillsRoundedAmount = $scope.selectedPatient.OPBillsRoundedAmount || 0;

            $scope.item.IPBillsAmount = $scope.selectedPatient.IPBillsAmount || 0;
            $scope.item.IPBillsDiscountAmount = $scope.selectedPatient.IPBillsDiscountAmount || 0;
            $scope.item.IPBillsRoundedAmount = $scope.selectedPatient.IPBillsRoundedAmount || 0;

            $scope.item.AmountReceived = $scope.selectedPatient.AmountPaid || 0;
            $scope.item.AmountRefunded = $scope.selectedPatient.AmountRefunded || 0;

            var AvialbleBalance = 0;
            AvialbleBalance = $scope.item.AmountReceived - ((
                (($scope.item.OPBillsAmount + $scope.item.OPBillsRoundedAmount) - $scope.item.OPBillsDiscountAmount) +
                (($scope.item.IPBillsAmount + $scope.item.IPBillsRoundedAmount) - $scope.item.IPBillsDiscountAmount)
            ) + $scope.item.AmountRefunded);
            if (AvialbleBalance > 0) {
                $scope.item.TotalAvailableAmount = AvialbleBalance;
            }
            /* $scope.item.TotalAvailableAmount = $scope.selectedPatient.AmountPaid - ($scope.selectedPatient.OPBillsAmount + $scope.selectedPatient.IPBillsAmount); */
            $scope.canShowFinanceBtn = true;
            $scope.canShowAdvanceBtn = true;
            if ($scope.selectedPatient.Encounters &&
                $scope.selectedPatient.Encounters.length > 0) {
                $scope.item.GuarantorId = $scope.selectedPatient.Encounters[0].GuarantorId;
                var opencounter = $filter('filter')($scope.selectedPatient.Encounters, {
                    EncounterTypeId: 1,
                    IsLatest: true
                })[0];
                if (opencounter && opencounter.Id > 0) {
                    $scope.item.EncounterId = opencounter.Id;
                    $scope.item.DepartmentId = opencounter.DepartmentId;
                    $scope.item.DoctorId = opencounter.DoctorId;
                    $scope.item.DoctorName = opencounter.DoctorName;
                    $scope.item.GuarantorId = opencounter.GuarantorId;
                    $scope.item.Comments = opencounter.Comments;
                    $scope.item.PatientLocation = opencounter.PatientLocation;
                }
            }
            // if (!$scope.currentfilter.GuarantorId || $scope.currentfilter.GuarantorId < 0)
            //     $scope.setPatientGuarantors();
            // $scope.fnencounter();
            // $scope.getPatientPendingPrescriptions();
            if ($scope.currentfilter.PatientId > 0 && !$scope.item.BillNumber) {
                $scope.isSaving = false;
                $scope.outstanding = false;
                $scope.EnableDisableDropdown($scope.isSaving);
            }
            $scope.addNewLineItem();
        };

        $scope.itemdataInfo = function (idx, item) {
            utl.Modal.open('app.itemdataInfo', {
                params: {
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                    lineindex: idx
                },
                // confirmCallback: replaceAlternate
            });
        };

        $scope.alertInfo = function (idx, item) {
            utl.Modal.open('app.itemalertinfo', {
                params: {
                    genericid: item.GenericId,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                    lineindex: idx
                },
                // confirmCallback: replaceAlternate
            });
        };

        $scope.alternateDetails = function (idx, item) {
            utl.Modal.open('app.pharmacyalternates', {
                params: {
                    genericid: item.GenericId,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                    lineindex: idx
                },
                confirmCallback: replaceAlternate
            });
        };

        function replaceAlternate(alternatedata) {
            var ActualItem = {};
            var AlternateItemDetail = {};
            ActualItem.ItemMasterId = alternatedata.itemid;
            $scope.CleanItemBatches(ActualItem);
            var scheduletype = '';
            if (alternatedata.ItemData.ScheduleType) {
                scheduletype = alternatedata.ItemData.ScheduleType.Description;
            }
            AlternateItemDetail = {
                Id: 0,
                BillDateTime: utl.Formatter.getCurrentDate(),
                ServiceId: alternatedata.ItemData.Id,
                ServiceCode: alternatedata.ItemData.ItemCode,
                ServiceName: alternatedata.ItemData.ItemName,
                ItemMasterId: alternatedata.ItemData.Id,
                ItemCode: alternatedata.ItemData.ItemCode,
                ItemName: alternatedata.ItemData.ItemName,
                itemidxdesc: null,
                ScheduleTypeId: alternatedata.ItemData.ScheduleTypeId,
                ScheduleTypeDescription: scheduletype,
                StoreMasterId: 0,
                ItemTypeId: 0,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: '',
                MasterItemId: 0,
                EncounterId: 0,
                PatientBillStatusId: 0,
                MasterTypeId: 0,
                StockSerialItemId: 0,
                StockItemId: 0,
                StockItemRev: alternatedata.ItemData.StockItem.Rev,
                Quantity: 0,
                itemidxqty: null,
                BatchQuantity: 0,
                TotalQuantity: alternatedata.ItemData.StockItem.Quantity,
                BatchId: '',
                SelectedBatchId: '',
                ExpiryDate: null,
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                Ucp: 0,
                Mrp: 0,
                Rate: 0,
                Amount: 0.00,
                GrossAmount: 0.00,
                GrossGSTAmount: 0.00,
                DiscountPercentage: 0.00,
                DiscountAmount: 0.00,
                DoctorDiscountAmount: 0.00,
                EducationCess: 0.00,
                NetAmountBeforeGST: 0.00,
                NetAmount: 0.00,
                TaxCode: '',
                DoctorId: 0,
                DoctorName: '',
                IsPackageItem: 0,
                PackageId: 0,
                PackageName: '',
                OrderId: 0,
                OrderDetailId: 0,
                OrderTypeId: 0,
                OrderDateTime: null,
                ServiceRateCategoryId: 0,
                ServiceRateCategoryName: '',
                IsModified: 0,
                IsSupplimentary: 0,
                IsBillable: 0,
                IsPharmacySale: 1,
                IsDoctorDiscount: 0,
                IsGstDoctor: 0,
                StartDateTime: null,
                EndDateTime: null,
                DiscountTypeId: 0,
                DiscountModeId: 2,
                DiscountAuthorizedBy: 0,
                DoctorShare: 0.00,
                ReferalShare: 0.00,
                CNAmount: 0.00,
                CancelReason: 0,
                CancelledBy: 0,
                Comments: '',
                DepartmentId: 0,
                GenericId: alternatedata.ItemData.GenericId,
                GenericName: alternatedata.ItemData.GenericName,
                ManufacturerId: alternatedata.ItemData.ManufacturerId,
                ManufacturerName: alternatedata.ItemData.ManufacturerName,
                IsNonClaimable: alternatedata.ItemData.IsNonClaimable,
                UnitCostPrice: 0,
                MrPrice: 0,
                UnitPrice: 0.00,
                GSTId: 0,
                InGstId: 0,
                CGstId: 0,
                SGstId: 0,
                GSTPercentage: 0.00,
                InGstPercentage: 0.00,
                CGstPercentage: 0.00,
                SGstPercentage: 0.00,
                UnitGSTAmount: 0.00,
                UnitInGstAmount: 0.00,
                UnitCGstAmount: 0.00,
                UnitSGstAmount: 0.00,
                GSTAmount: 0.00,
                InGstAmount: 0.00,
                CGstAmount: 0.00,
                SGstAmount: 0.00,
                RdoDiscountMode: true,
                RdoDiscount: true,
                PrescriptionDetailId: 0,
                IsThisPrescription: false,
                Status: 1,
                IsAlternate: true
            };
            AlternateItemDetail.BatchDetails = alternatedata.ItemData.StockItem.StockSerialItems;
            $scope.PatientBillDetails.push(AlternateItemDetail);
            $scope.currentcontext.BillDiscount = 0;
        }


        if ($stateParams.id && $stateParams.id > 0) {
            $scope.item.PatientId = parseInt($stateParams.id);
            $scope.currentfilter.PatientId = parseInt($stateParams.id);
        }

        $scope.ReturnData = function (patData) {
            $scope.currentfilter.PatientId = patData.PatientId;
            // $scope.patientChange();
        };

        $scope.addnewpatient = function () {
            utl.Modal.openFixedDialog('app.newpatientregister', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.ReturnData
            });
        };

        $scope.addReferralCallback = function (data) {
            $scope.newPatient.ReferralId = data;
            $scope.initLookup();
        };

        $scope.addReferral = function () {
            utl.Modal.open('app.referral', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.addReferralCallback
            });
        };

        function defaultReferral() {
            for (var idx in $scope.lookup.Referral) {
                var item = $scope.lookup.Referral[idx];
                if (item.Id == $scope.newPatient.ReferralId) {
                    $scope.newPatient.ReferralName = item.Text;
                }
            }
        }
        $scope.getBillInfoByPatientID = function () {
            if ($scope.currentfilter.PatientId && $scope.currentcontext.id <= 0) {
                var inputData = {
                    Params: [{
                        Key: 3,
                        Value: $scope.currentfilter.PatientId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.GuarantorTypeChange = function (SelectedGuarantorType) {
            $scope.lookup.SelectedGuarantor = [];
            $scope.currentfilter.GuarantorId = -1;
            $scope.currentfilter.GuarantorName = "";
            var len = $scope.lookup.Guarantor.length;
            for (var i = 0; i < len; i++) {
                if ($scope.lookup.Guarantor[i].Id > 0) {
                    if (SelectedGuarantorType.Id == $scope.lookup.Guarantor[i].GuarantorTypeId) {
                        $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                    }
                } else {
                    $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                }
            }

            if ($scope.lookup.SelectedGuarantor && $scope.lookup.SelectedGuarantor.length > 1) {
                $scope.currentfilter.GuarantorId = $scope.lookup.SelectedGuarantor[1].Id;
                if ($scope.currentfilter.GuarantorId == guarantorId_) {
                    $scope.currentfilter.GuarantorName = $scope.lookup.SelectedGuarantor[1].Text;
                } else {
                    $scope.currentfilter.GuarantorId = -1;
                    $scope.currentfilter.GuarantorName = "";
                }

            }
        };

        $scope.getStorePrintPreferenceCallback = function (scope, data, options, hasError) {
            if (data) {
                if (data.PrinterOptionId == 1) {
                    $scope.printpreferences = 1;
                    $scope.dmprintpreferences = 0;
                } else if (data.PrinterOptionId == 2) {
                    $scope.dmprintpreferences = 1;
                    $scope.printpreferences = 0;
                }
                if ($scope.dmprintpreferences <= 0) $('#btndmprint').hide();
                else $('#btndmprint').show();

                if ($scope.printpreferences <= 0) $('#btnprint').hide();
                else $('#btnprint').show();

                if (data.ISSeparatePayCounter) $scope.separatePaymentCounter = 1;
                else $scope.separatePaymentCounter = 0;
                $scope.IsSeparatePharmacyCounter();
            }
        };

        $scope.getStorePrintPreference = function () {
            var storemasterid = $scope.currentfilter.StoreMasterId;
            if (storemasterid > 0) {
                var options = {
                    action: 'pharmacy/storemaster/GetStoreMasterById',
                    data: {
                        Id: storemasterid
                    },
                    type: 'post',
                    onComplete: $scope.getStorePrintPreferenceCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getStaffDiscountsCallback = function (scope, res, options, hasError) {
            $scope.StoreStaffDiscounts = [];
            if (res.Data && res.Data.length > 0) {
                $scope.StoreStaffDiscounts = res.Data;
            }
        };

        $scope.getStoreStaffDiscounts = function () {
            var storemasterid = $scope.currentfilter.StoreMasterId;
            if (storemasterid > 0) {
                var inputData = {
                    Params: [{
                        Key: 3,
                        Value: storemasterid
                    }],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'pharmacy/staffdiscount/GetStaffDiscounts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStaffDiscountsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.StoreChange = function (SelectedStore) {
            $scope.currentfilter.StoreTypeId = SelectedStore.StoreMaster.StoreTypeId;
            $scope.currentfilter.StoreSubTypeId = SelectedStore.StoreMaster.StoreSubTypeId;
            $scope.currentfilter.SequenceOptionId = SelectedStore.StoreMaster.SequenceOptionId;

            $scope.item.StaffCheck = false;
            $scope.item.StaffDiscountId = -1;
            $scope.item.StaffId = -1;
            $scope.item.StaffDiscountTypeId = 0;
            $scope.item.StaffDiscountPercentage = 0;

            $scope.getStorePrintPreference();
            /* $scope.getStoreStaffDiscounts(); */

            if ($scope.PatientBillDetails.length > 1) {
                $scope.clear();
            }
        };

        $scope.fillGenderInfo = function () {
            if ($scope.newPatient.TitleId == 10) {
                $scope.newPatient.GenderId = 1;
            } else if ($scope.newPatient.TitleId == 11 || $scope.newPatient.TitleId == 12 || $scope.newPatient.TitleId == 5) {
                $scope.newPatient.GenderId = 2;
            }
        };

        $scope.ItemwiseDiscountTypechange = function (selecteditem) {
            if (selecteditem.DiscountTypeId > 0) {
                selecteditem.RdoDiscountMode = false;
            } else {
                selecteditem.Discount = 0;
                selecteditem.RdoDiscount = true;
                selecteditem.RdoDiscountMode = true;
            }

            $scope.CalcualteAmt(selecteditem);
        };

        $scope.DiscountModechange = function () {
            $scope.currentcontext.DiscountModeValue = 0;
            for (var idx in $scope.PatientBillDetails) {
                $scope.ItemwiseDiscountModechange($scope.PatientBillDetails[idx]);
            }
        };

        $scope.ItemwiseDiscountModechange = function (selecteditem) {
            if (selecteditem.DiscountModeId > 0) {
                selecteditem.RdoDiscount = false;
            } else {
                selecteditem.RdoDiscount = true;
            }
            $scope.CalcualteAmt(selecteditem);
        };

        $scope.BillDiscountTypechange = function (billwisedisselectedtype) {
            if (!$scope.currentcontext.ReceiptAmt) {
                $scope.currentcontext.ReceiptAmt = 0;
            }
            if (billwisedisselectedtype.Id > 0) {
                $scope.currentcontext.RdoBillDiscount = false;
                $scope.currentcontext.RdoBillDiscountMode = false;
            } else {
                $scope.currentcontext.BillDiscountId = -1;
                $scope.currentcontext.RdoBillDiscountMode = true;
            }
            $scope.CalcualteNetAmt();
        };

        $scope.BillDiscountModechange = function (selecteditem) {
            if (!$scope.currentcontext.ReceiptAmt) {
                $scope.currentcontext.ReceiptAmt = 0;
            }
            $scope.currentcontext.DiscountModeValue = 0;
            var LastIndex = $scope.PatientBillDetails.length - 1;
            if (selecteditem.Id > 0) {
                for (var idx in $scope.PatientBillDetails) {
                    $scope.PatientBillDetails[idx].RdoDiscountMode = true;
                    $scope.PatientBillDetails[idx].RdoDiscount = true;
                    $scope.PatientBillDetails[idx].DiscountModeId = -1;
                    $scope.PatientBillDetails[idx].DiscountAmount = 0;
                    $scope.ItemwiseDiscountModechange($scope.PatientBillDetails[idx]);
                }
            } else {
                for (var idx1 in $scope.PatientBillDetails) {
                    if (idx1 != LastIndex) {
                        $scope.PatientBillDetails[idx1].RdoDiscountMode = false;
                        $scope.PatientBillDetails[idx1].RdoDiscount = false;
                    }
                }
            }
            $scope.CalculateNetAmt();
        };

        // $scope.doctorChange = function (item) {
        //     $scope.item.DepartmentId = item.DepartmentId;
        //     $scope.currentfilter.DoctorName = item.DoctorName;
        // };

        $scope.saleTypeChanged = function (item) {
            if (item.Text.toLowerCase() == "direct-sale") {
                $scope.currentcontext.isnewpatient = true;
                $scope.isSaving = false;
                $scope.outstanding = true;
                $scope.isSaveandApprove = true;
                $scope.IsDue = false;

                $scope.PatientBillDetails = [];
                $scope.PatientPaymentDetails = [];
                $scope.PatientBillInfo = [];
                $scope.StoreStaffDiscounts = [];

                $scope.selectedPatient = {};
                $scope.encounter = {};
                $scope.itemUsedBatches = {};

                $scope.currentfilter.billdate = utl.Formatter.getCurrentDate();
                $scope.currentfilter.billnumber = '';
                $scope.currentfilter.PatientId = -1;
                $scope.currentfilter.PatientName = '';
                $scope.currentfilter.DoctorId = -1;
                $scope.currentfilter.DoctorName = '';
                $scope.currentfilter.DepartmentId = -1;
                $scope.currentfilter.PayScenarioId = -1;
                $scope.currentfilter.GuarantorTypeId = 1;

                $scope.lookup.SelectedGuarantor = [];
                var len = $scope.lookup.Guarantor.length;
                for (var i = 0; i < len; i++) {
                    if ($scope.lookup.Guarantor[i].Id > 0) {
                        if ($scope.lookup.Guarantor[i].GuarantorTypeId == 1) {
                            $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                        }
                    } else {
                        $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                    }
                }

                if ($scope.lookup.SelectedGuarantor && $scope.lookup.SelectedGuarantor.length > 1) {
                    $scope.currentfilter.GuarantorId = guarantorId_;
                    $scope.currentfilter.GuarantorName = 'SELF';
                }

                $scope.item.PatientId = -1;
                $scope.item.DoctorId = -1;
                $scope.item.DoctorName = '';
                $scope.item.PatientBillStatusId = 1;
                $scope.item.BillWithComeReceipt = true;
                $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                $scope.item.DDDate = utl.Formatter.getCurrentDate();
                $scope.item.WireTransferDate = utl.Formatter.getCurrentDate();
                $scope.item.TotDiscAmount = 0;
                $scope.item.GrossAmount = 0;
                $scope.item.ToBeRefunded = 0;
                $scope.item.TotRndoffAmt = 0;
                $scope.item.PharmacySaleTypeId = 4;
                $scope.item.StaffCheck = false;
                $scope.item.StaffDiscountId = -1;
                $scope.item.StaffId = -1;
                $scope.item.StaffDiscountTypeId = 0;
                $scope.item.StaffDiscountPercentage = 0;

                $scope.currentcontext.id = 0;
                $scope.currentcontext.RdoBillDiscount = false;
                $scope.currentcontext.RdoBillDiscountMode = false;
                $scope.RdoApprovedById = false;
                $scope.currentcontext.Rdobilldate = true;
                $scope.currentcontext.BillDiscountTypeId = -1;
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.ApprovedById = -1;
                $scope.currentcontext.PaymentTypeId = 1;
                $scope.currentcontext.TotNetAmount = 0;
                $scope.currentcontext.TotDiscountAmt = 0;
                $scope.currentcontext.PaidAmt = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                $scope.currentcontext.PatientBillStatusId = 1;
                $scope.currentcontext.PatientBillStatusId = 1;
                $scope.currentcontext.CNAmount = 0;

                $scope.RdoPayScenarioId = true;
                $scope.RdoGuarantorId = true;

                $scope.addNewLineItem();
                /* $scope.getStoreStaffDiscounts(); */
                $scope.applyVisibilityRules();
            } else if (item.Text.toLowerCase() == "a&e-patient") {
                $scope.currentcontext.isnewpatient = false;
                $scope.isSaving = true;
                $scope.RdoPayScenarioId = true;
                $scope.RdoGuarantorId = true;
                $scope.outstanding = true;
                $scope.isSaveandApprove = true;
                $scope.IsDue = false;

                $scope.PatientBillDetails = [];
                $scope.PatientPaymentDetails = [];
                $scope.PatientBillInfo = [];
                $scope.StoreStaffDiscounts = [];

                $scope.selectedPatient = {};
                $scope.encounter = {};
                $scope.itemUsedBatches = {};

                $scope.currentfilter.billdate = utl.Formatter.getCurrentDate();
                $scope.currentfilter.billnumber = '';
                $scope.currentfilter.PatientId = -1;
                $scope.currentfilter.PatientName = '';
                $scope.currentfilter.DoctorId = -1;
                $scope.currentfilter.DoctorName = '';
                $scope.currentfilter.DepartmentId = -1;
                $scope.currentfilter.PayScenarioId = -1;
                $scope.currentfilter.GuarantorId = -1;
                $scope.currentfilter.GuarantorTypeId = -1;
                $scope.currentfilter.GuarantorName = '';

                $scope.item.PatientId = -1;
                $scope.item.DoctorId = -1;
                $scope.item.DoctorName = '';
                $scope.item.PatientBillStatusId = 1;
                $scope.item.BillWithComeReceipt = true;
                $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                $scope.item.DDDate = utl.Formatter.getCurrentDate();
                $scope.item.WireTransferDate = utl.Formatter.getCurrentDate();
                $scope.item.TotDiscAmount = 0;
                $scope.item.GrossAmount = 0;
                $scope.item.ToBeRefunded = 0;
                $scope.item.TotRndoffAmt = 0;
                $scope.item.PharmacySaleTypeId = 3;
                $scope.item.StaffCheck = false;
                $scope.item.StaffDiscountId = -1;
                $scope.item.StaffId = -1;
                $scope.item.StaffDiscountTypeId = 0;
                $scope.item.StaffDiscountPercentage = 0;

                $scope.currentcontext.id = 0;
                $scope.currentcontext.RdoBillDiscount = true;
                $scope.currentcontext.RdoBillDiscountMode = true;
                $scope.currentcontext.Rdobilldate = true;
                $scope.currentcontext.BillDiscountTypeId = -1;
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.ApprovedById = -1;
                $scope.currentcontext.PaymentTypeId = 1;
                $scope.currentcontext.TotNetAmount = 0;
                $scope.currentcontext.TotDiscountAmt = 0;
                $scope.currentcontext.PaidAmt = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                $scope.currentcontext.PatientBillStatusId = 1;
                $scope.currentcontext.CNAmount = 0;

                /* $scope.getStoreStaffDiscounts(); */
                $scope.applyVisibilityRules();
            } else if (item.Text.toLowerCase() == "in-patient") {
                $scope.currentcontext.isnewpatient = false;
                $scope.isSaving = true;
                $scope.RdoPayScenarioId = true;
                $scope.RdoGuarantorId = true;
                $scope.outstanding = true;
                $scope.isSaveandApprove = true;
                $scope.IsDue = false;

                $scope.PatientBillDetails = [];
                $scope.PatientPaymentDetails = [];
                $scope.PatientBillInfo = [];
                $scope.StoreStaffDiscounts = [];

                $scope.selectedPatient = {};
                $scope.encounter = {};
                $scope.itemUsedBatches = {};

                $scope.currentfilter.billdate = utl.Formatter.getCurrentDate();
                $scope.currentfilter.billnumber = '';
                $scope.currentfilter.PatientId = -1;
                $scope.currentfilter.PatientName = '';
                $scope.currentfilter.DoctorId = -1;
                $scope.currentfilter.DoctorName = '';
                $scope.currentfilter.DepartmentId = -1;
                $scope.currentfilter.PayScenarioId = -1;
                $scope.currentfilter.GuarantorId = -1;
                $scope.currentfilter.GuarantorTypeId = -1;
                $scope.currentfilter.GuarantorName = '';

                $scope.item.PatientId = -1;
                $scope.item.DoctorId = -1;
                $scope.item.DoctorName = '';
                $scope.item.PatientBillStatusId = 1;
                $scope.item.BillWithComeReceipt = true;
                $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                $scope.item.DDDate = utl.Formatter.getCurrentDate();
                $scope.item.WireTransferDate = utl.Formatter.getCurrentDate();
                $scope.item.TotDiscAmount = 0;
                $scope.item.GrossAmount = 0;
                $scope.item.ToBeRefunded = 0;
                $scope.item.TotRndoffAmt = 0;
                $scope.item.PharmacySaleTypeId = 2;
                $scope.item.StaffCheck = false;
                $scope.item.StaffDiscountId = -1;
                $scope.item.StaffId = -1;
                $scope.item.StaffDiscountTypeId = 0;
                $scope.item.StaffDiscountPercentage = 0;

                $scope.currentcontext.id = 0;
                $scope.currentcontext.RdoBillDiscount = true;
                $scope.currentcontext.RdoBillDiscountMode = true;
                $scope.currentcontext.Rdobilldate = true;
                $scope.currentcontext.BillDiscountTypeId = -1;
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.ApprovedById = -1;
                $scope.currentcontext.PaymentTypeId = 1;
                $scope.currentcontext.TotNetAmount = 0;
                $scope.currentcontext.TotDiscountAmt = 0;
                $scope.currentcontext.PaidAmt = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                $scope.currentcontext.PatientBillStatusId = 1;
                $scope.currentcontext.CNAmount = 0;

                /* $scope.getStoreStaffDiscounts(); */
                $scope.applyVisibilityRules();
            } else if (item.Text.toLowerCase() == "out-patient") {
                $scope.currentcontext.isnewpatient = false;
                $scope.isSaving = true;
                $scope.RdoPayScenarioId = true;
                $scope.RdoGuarantorId = true;
                $scope.outstanding = true;
                $scope.isSaveandApprove = true;
                $scope.IsDue = false;

                $scope.PatientBillDetails = [];
                $scope.PatientPaymentDetails = [];
                $scope.PatientBillInfo = [];
                $scope.StoreStaffDiscounts = [];

                $scope.selectedPatient = {};
                $scope.encounter = {};
                $scope.itemUsedBatches = {};

                $scope.currentfilter.billdate = utl.Formatter.getCurrentDate();
                $scope.currentfilter.billnumber = '';
                $scope.currentfilter.PatientId = -1;
                $scope.currentfilter.PatientName = '';
                $scope.currentfilter.DoctorId = -1;
                $scope.currentfilter.DoctorName = '';
                $scope.currentfilter.DepartmentId = -1;
                $scope.currentfilter.PayScenarioId = -1;
                $scope.currentfilter.GuarantorId = -1;
                $scope.currentfilter.GuarantorTypeId = -1;
                $scope.currentfilter.GuarantorName = '';

                $scope.item.PatientId = -1;
                $scope.item.DoctorId = -1;
                $scope.item.DoctorName = '';
                $scope.item.PatientBillStatusId = 1;
                $scope.item.BillWithComeReceipt = true;
                $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                $scope.item.DDDate = utl.Formatter.getCurrentDate();
                $scope.item.WireTransferDate = utl.Formatter.getCurrentDate();
                $scope.item.TotDiscAmount = 0;
                $scope.item.GrossAmount = 0;
                $scope.item.ToBeRefunded = 0;
                $scope.item.TotRndoffAmt = 0;
                $scope.item.PharmacySaleTypeId = 1;
                $scope.item.StaffCheck = false;
                $scope.item.StaffDiscountId = -1;
                $scope.item.StaffId = -1;
                $scope.item.StaffDiscountTypeId = 0;
                $scope.item.StaffDiscountPercentage = 0;

                $scope.currentcontext.id = 0;
                $scope.currentcontext.RdoBillDiscount = true;
                $scope.currentcontext.RdoBillDiscountMode = true;
                $scope.currentcontext.Rdobilldate = true;
                $scope.currentcontext.BillDiscountTypeId = -1;
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.ApprovedById = -1;
                $scope.currentcontext.PaymentTypeId = 1;
                $scope.currentcontext.TotNetAmount = 0;
                $scope.currentcontext.TotDiscountAmt = 0;
                $scope.currentcontext.PaidAmt = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                $scope.currentcontext.PatientBillStatusId = 1;
                $scope.currentcontext.CNAmount = 0;

                /* $scope.getStoreStaffDiscounts(); */
                $scope.applyVisibilityRules();
            }
        };
        $scope.calculateAge = function () {
            $scope.newPatient.Age = utl.Formatter.getAgeFromDOB($scope.newPatient.DOB);
        };

        $scope.calculateDOB = function () {
            $scope.newPatient.DOB = utl.Formatter.getDOBFromAge($scope.newPatient.Age);
        };

        $scope.applyVisibilityRules = function () {
            if ($scope.item.PatientBillStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowPrescribeBtn = true;
                $scope.canShowPrescribeOrderBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowViewReceipt = false;
            }
            if ($scope.item.PatientBillStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
            }
            if ($scope.item.PatientBillStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
            }
            if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount > 0 &&
                $scope.item.PatientBillStatusId != 2) {
                $scope.canShowSaveapproveBtn = true;
                $scope.RdoPaymentTypeId = true;
                $scope.item.BillWithComeReceipt = true;
                if ($scope.item.IsMultiplePayment)
                    $scope.HidePrintBtn = true;
            } else if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount === 0) {
                $scope.canShowSaveapproveBtn = false;
                $scope.RdoPaymentTypeId = false;
                $scope.item.BillWithComeReceipt = false;
            }

            if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount > 0 &&
                $scope.item.IsMultiplePayment == true) {
                $scope.disallowMultiplePay = true;
            }
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.PatientBillDetails) {
                if ($scope.PatientBillDetails[idx].Status == 1) {
                    $scope.PatientBillDetails[idx].SNo = SNo;
                    $scope.PatientBillDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.PatientBillDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientBillDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }
            var PatientBillDetail = {
                Id: 0,
                SNo: 0,
                BillDateTime: utl.Formatter.getCurrentDate(),
                ServiceId: -1,
                ServiceCode: null,
                ServiceName: null,
                ItemMasterId: -1,
                ItemCode: null,
                ItemName: null,
                AllowStaffDiscount: false,
                itemidxdesc: null,
                ScheduleTypeId: 0,
                ScheduleTypeDescription: null,
                StoreMasterId: 0,
                ItemTypeId: 0,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: '',
                MasterItemId: 0,
                EncounterId: 0,
                PatientBillStatusId: 0,
                MasterTypeId: 0,
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                MinQty: 0,
                Quantity: 0,
                MaxQty: 0,
                ReturnedQuantity: 0,
                itemidxqty: null,
                BatchQuantity: 0,
                TotalQuantity: 0,
                Batch: false,
                BatchId: '',
                SelectedBatchId: '',
                // BatchDetails: [],
                // BatchDetail: {
                //     Id: 0,
                //     StockItemId: 0,
                //     ItemMasterId: 0,
                //     StoreMasterId: 0,
                //     BatchId: '',
                //     SelectedBatchId: '',
                //     Quantity: 0,
                //     ExpiryDate: null,
                //     Ucp: 0,
                //     Mrp: 0,
                //     GSTId: 0,
                //     GSTPercentage: 0,
                //     InGstId: 0,
                //     InGstPercentage: 0,
                //     CGstId: 0,
                //     CGstPercentage: 0,
                //     SGstId: 0,
                //     SGstPercentage: 0,
                //     Rev: 0,
                //     SerialDetails: null,
                //     ExpiryAlert: false,
                //     ExpiryStop: false,
                //     ExpiryProceed: false
                // },
                // PurchaseUomId: 0,
                // BaseUomId: 0,
                // SaleUomId: 0,
                // ExpiryDate: null,
                // ExpiryAlert: false,
                // ExpiryStop: false,
                // ExpiryProceed: false,
                // Ucp: 0.00,
                // Mrp: 0.00,
                // Rate: 0.00,
                // Amount: 0.00,
                // GrossAmount: 0.00,
                // GrossGSTAmount: 0.00,
                // DiscountPercentage: 0.00,
                // UnitDiscountAmount: 0.00,
                // DiscountAmount: 0.00,
                // UnitProportionateDiscount: 0.00,
                // ProportionateDiscount: 0.00,
                // DoctorDiscountAmount: 0.00,
                // EducationCess: 0.00,
                // UnitGSTAmount: 0.00,
                // GSTAmount: 0.00,
                // NetAmountBeforeGST: 0.00,
                // NetAmount: 0.00,
                // GSTId: 0,
                // GSTPercentage: 0,
                // TaxCode: '',
                // DoctorId: 0,
                // DoctorName: '',
                // IsPrescribed: false,
                // IsPackageItem: 0,
                // PackageId: 0,
                // PackageName: '',
                // OrderId: 0,
                // OrderDetailId: 0,
                // OrderTypeId: 0,
                // OrderDateTime: null,
                // ServiceRateCategoryId: 0,
                // ServiceRateCategoryName: '',
                // IsModified: 0,
                // IsSupplimentary: 0,
                // IsBillable: 0,
                // IsPharmacySale: 1,
                // IsDoctorDiscount: 0,
                // IsGstDoctor: 0,
                // StartDateTime: null,
                // EndDateTime: null,
                // DiscountTypeId: 0,
                // DiscountModeId: 0,
                // DiscountAuthorizedBy: 0,
                // Discount: 0,
                // DoctorShare: 0,
                // ReferalShare: 0,
                // CNAmount: 0,
                // CancelReason: 0,
                // CancelledBy: 0,
                // Comments: '',
                // DepartmentId: 0,
                // SubCategoryId: 0,
                // DrugId: 0,
                // DrugName: '',
                // GenericId: 0,
                // GenericName: null,
                // RackId: 0,
                // RackName: '',
                // Shelf: '',
                // Tray: '',
                // RST: '',
                // VendorMasterId: 0,
                // ManufacturerId: 0,
                // ManufacturerName: null,
                // UnitCostPrice: 0.00,
                // MrPrice: 0.00,
                // UnitPrice: 0.00,
                // InGstId: 0,
                // CGstId: 0,
                // SGstId: 0,
                // InGstPercentage: 0,
                // CGstPercentage: 0,
                // SGstPercentage: 0,
                // UnitInGstAmount: 0,
                // UnitCGstAmount: 0,
                // UnitSGstAmount: 0,
                // InGstAmount: 0,
                // CGstAmount: 0,
                // SGstAmount: 0,
                // RdoDiscountMode: true,
                // RdoDiscount: true,
                // RdoItemSearch: false,
                // PrescriptionDetailId: 0,
                // IsThisPrescription: false,
                // IsFallUnderMinQty: false,
                // GrnId: 0,
                // GrnDetailId: 0,
                // StockEntryId: 0,
                // StockEntryDetailId: 0,
                // IsNonClaimable: false,
                tabindex: $scope.tabindexmap.detailtabindex++,
                Status: 1
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetail.PatientBillId = $scope.currentcontext.id;
            }
            $scope.PatientBillDetails.push(PatientBillDetail);

            $scope.SelectedIndex = $scope.PatientBillDetails.length;
            $scope.item.IsGenericSearch = false;
            $scope.setIndexforTableIndex();
        };

        $scope.batchDetails = function (idx, item) {
            utl.Modal.open('app.pharmacybatch-details', {
                params: {
                    current_index: idx,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    current_item: item,
                    grid_items: $scope.PatientBillDetails
                },
                confirmCallback: $scope.onBatchChange
            });
        };

        $scope.onBatchChange = function (UpdatedItemData) {
            var ExpiryDays = null;
            $scope.currentcontext.ReceiptAmt = 0;
            var item = [];
            item = UpdatedItemData.UpdatedItem;

            for (var count = 0; count < $scope.PatientBillDetails.length; count++) {
                var cllitem = $scope.PatientBillDetails[count];
                if (cllitem.ItemMasterId == UpdatedItemData.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.DeletedPatientBills.push(cllitem);
                    var index1 = $scope.PatientBillDetails.indexOf(cllitem);
                    $scope.PatientBillDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.PatientBillDetails) {
                var clsitem = $scope.PatientBillDetails[clsidx];
                if (clsitem.ServiceId == -1) {
                    clsitem.Status = 2;
                    $scope.DeletedPatientBills.push(clsitem);
                    var index2 = $scope.PatientBillDetails.indexOf(clsitem);
                    $scope.PatientBillDetails.splice(index2, 1);
                }
            }

            for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                if (item.BatchDetails[batid].IsMultiUse) {
                    var Mrp = parseFloat((item.BatchDetails[batid].ConversionMrp).toFixed(2));
                } else
                    var Mrp = parseFloat((item.BatchDetails[batid].Mrp).toFixed(2));

                var PatientBillDetail = {
                    Id: 0,
                    BillDateTime: utl.Formatter.getCurrentDate(),
                    ServiceId: item.ItemMasterId,
                    ServiceCode: item.ItemCode,
                    ServiceName: item.ItemName,
                    ItemMasterId: item.ItemMasterId,
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    itemidxdesc: null,
                    ScheduleTypeId: item.ScheduleTypeId,
                    ScheduleTypeDescription: item.ScheduleTypeDescription,
                    StoreMasterId: item.StoreMasterId,
                    ItemTypeId: 0,
                    ServiceTypeId: item.ServiceTypeId,
                    SubCategoryId: item.SubCategoryId,
                    ServiceGroupId: item.ServiceGroupId,
                    ServiceCategoryId: item.ServiceCategoryId,
                    MasterName: item.MasterName,
                    MasterItemId: item.MasterItemId,
                    EncounterId: 0,
                    PatientBillStatusId: 0,
                    MasterTypeId: item.MasterTypeId,
                    StockSerialItemId: item.BatchDetails[batid].Id,
                    StockSerialItemRev: item.BatchDetails[batid].Rev,
                    StockItemId: item.BatchDetails[batid].StockItemId,
                    Quantity: item.BatchDetails[batid].IssueQty,
                    itemidxqty: null,
                    BatchQuantity: item.BatchDetails[batid].Quantity,
                    MinQty: item.MinQty,
                    TotalQuantity: item.TotalQuantity,
                    MaxQty: item.MaxQty,
                    Batch: true,
                    BatchId: item.BatchDetails[batid].BatchId,
                    SelectedBatchId: item.BatchDetails[batid].BatchId,
                    ExpiryDate: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false,
                    Ucp: item.BatchDetails[batid].Ucp,
                    Mrp: Mrp,
                    Rate: Mrp,
                    Amount: 0.00,
                    GrossAmount: 0.00,
                    GrossGSTAmount: 0.00,
                    DiscountPercentage: 0.00,
                    UnitDiscountAmount: 0.00,
                    DiscountAmount: 0.00,
                    UnitProportionateDiscount: 0.00,
                    ProportionateDiscount: 0.00,
                    DoctorDiscountAmount: 0.00,
                    EducationCess: 0.00,
                    NetAmountBeforeGST: 0.00,
                    NetAmount: 0.00,
                    TaxCode: '',
                    DoctorId: 0,
                    DoctorName: '',
                    IsPrescribed: false,
                    IsPackageItem: 0,
                    PackageId: 0,
                    PackageName: '',
                    OrderId: 0,
                    OrderDetailId: 0,
                    OrderTypeId: 0,
                    OrderDateTime: null,
                    ServiceRateCategoryId: 0,
                    ServiceRateCategoryName: '',
                    IsModified: 0,
                    IsSupplimentary: 0,
                    IsBillable: 0,
                    IsPharmacySale: 1,
                    IsDoctorDiscount: 0,
                    IsGstDoctor: 0,
                    StartDateTime: null,
                    EndDateTime: null,
                    DiscountTypeId: 0,
                    DiscountModeId: 0,
                    DiscountAuthorizedBy: 0,
                    DoctorShare: 0.00,
                    ReferalShare: 0.00,
                    CNAmount: 0.00,
                    CancelReason: 0,
                    CancelledBy: 0,
                    Comments: '',
                    DepartmentId: 0,
                    GenericId: item.GenericId,
                    GenericName: item.GenericName,
                    VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                    ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                    ManufacturerName: item.ManufacturerName,
                    UnitCostPrice: item.BatchDetails[batid].Ucp,
                    MrPrice: Mrp,
                    UnitPrice: 0.00,
                    GSTId: item.BatchDetails[batid].GstId,
                    InGstId: item.BatchDetails[batid].InGstId,
                    CGstId: item.BatchDetails[batid].CGstId,
                    SGstId: item.BatchDetails[batid].SGstId,
                    GSTPercentage: item.BatchDetails[batid].GstPercentage,
                    InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                    CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                    SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                    PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                    BaseUomId: item.BatchDetails[batid].BaseUomId,
                    SaleUomId: item.BatchDetails[batid].SaleUomId,
                    GrnId: item.BatchDetails[batid].GrnId,
                    GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                    StockEntryId: item.BatchDetails[batid].StockEntryId,
                    StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                    UnitGSTAmount: 0.00,
                    UnitInGstAmount: 0.00,
                    UnitCGstAmount: 0.00,
                    UnitSGstAmount: 0.00,
                    GSTAmount: 0.00,
                    InGstAmount: 0.00,
                    CGstAmount: 0.00,
                    SGstAmount: 0.00,
                    RdoDiscountMode: true,
                    RdoDiscount: true,
                    PrescriptionDetailId: 0,
                    IsThisPrescription: false,
                    Status: 1,
                    IsMultiUse: item.BatchDetails[batid].IsMultiUse,
                    // NoOfTransactions: item.SelectedItem.ItemMaster.NoOfTransactions,
                    ConsumedTransactions: (parseFloat(item.BatchDetails[batid].ConsumedTransactions)) + parseFloat(item.Quantity),
                    TotalTransactions: item.BatchDetails[batid].TotalTransactions,
                    PendingTransactions: (parseFloat(item.BatchDetails[batid].PendingTransactions)) - (parseFloat(item.Quantity))
                };

                if (item.SelectedItem) {
                    if (item.SelectedItem.ItemMaster) {
                        var ItemMasterData = item.SelectedItem.ItemMaster;
                        PatientBillDetail.NoOfTransactions = ItemMasterData.NoOfTransactions;
                        PatientBillDetail.ItemPossibleTransactions = ItemMasterData.NoOfTransactions;
                    }
                }

                ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                if (ExpiryDays <= $scope.currentfilter.ExpiryPriorStopDays) {
                    PatientBillDetail.ExpiryStop = true;
                } else if (ExpiryDays > $scope.currentfilter.ExpiryPriorStopDays && ExpiryDays <= $scope.currentfilter.ExpiryWarningDays) {
                    PatientBillDetail.ExpiryAlert = true;
                    utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                } else {
                    PatientBillDetail.ExpiryProceed = true;
                    // utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                }

                if (PatientBillDetail.ExpiryAlert) {
                    PatientBillDetail.ExpiryDate = null;
                    PatientBillDetail.ExpiryAlert = true;
                    utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                    PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                } else if (PatientBillDetail.ExpiryStop) {
                    PatientBillDetail.ExpiryDate = null;
                    PatientBillDetail.ExpiryStop = true;
                    utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                    PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                } else {
                    PatientBillDetail.ExpiryDate = null;
                    PatientBillDetail.ExpiryProceed = true;
                    PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                }

                if (PatientBillDetail.TotalQuantity <= PatientBillDetail.MinQty) {
                    PatientBillDetail.IsFallUnderMinQty = true;
                } else {
                    PatientBillDetail.IsFallUnderMinQty = false;
                }

                PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Mrp * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
                PatientBillDetail.UnitCGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.CGstPercentage).toFixed(2));
                PatientBillDetail.UnitSGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.SGstPercentage).toFixed(2));
                PatientBillDetail.GSTAmount = parseFloat((PatientBillDetail.UnitGSTAmount * PatientBillDetail.Quantity).toFixed(2));
                PatientBillDetail.InGstAmount = parseFloat((PatientBillDetail.UnitInGstAmount * PatientBillDetail.Quantity).toFixed(2));
                PatientBillDetail.CGstAmount = parseFloat((PatientBillDetail.UnitCGstAmount * PatientBillDetail.Quantity).toFixed(2));
                PatientBillDetail.SGstAmount = parseFloat((PatientBillDetail.UnitSGstAmount * PatientBillDetail.Quantity).toFixed(2));
                PatientBillDetail.NetAmount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                PatientBillDetail.NetAmountBeforeGST = parseFloat((PatientBillDetail.NetAmount - PatientBillDetail.GSTAmount).toFixed(2));

                PatientBillDetail.BatchDetails = item.AllBatchDetails;
                $scope.PatientBillDetails.push(PatientBillDetail);
                $scope.currentcontext.BillDiscount = 0;
                savehitcompleted = 0;
            }

            $scope.CalculateNetAmt();
            $scope.updateReceiptAmt();
            $scope.addNewLineItem();

            var nxtidx = $scope.PatientBillDetails.length - 1;
            var nextId = "desc" + '' + nxtidx;
            $timeout(function () {
                $('#' + nextId).focus();
            }, 100);
        };

        $scope.alternatetable = function () {
            utl.Modal.open('app.pharmacyalternatestables', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.onBatchSelected = function (pharmacyItem, selectedMasterItem, idx) {
            var existing = $scope.itemUsedBatches[pharmacyItem.ItemMasterId].indexOf(pharmacyItem.BatchId);
            var modified = $scope.itemUsedBatches[pharmacyItem.ItemMasterId].indexOf(pharmacyItem.SelectedBatchId);
            if (modified == -1) {
                pharmacyItem.StockSerialItemId = selectedMasterItem.Id;
                pharmacyItem.StockItemId = selectedMasterItem.StockItemId;
                pharmacyItem.BatchId = selectedMasterItem.BatchId;
                pharmacyItem.SelectedBatchId = selectedMasterItem.BatchId;
                pharmacyItem.BatchQuantity = selectedMasterItem.Quantity;
                pharmacyItem.UnitCostPrice = parseFloat((selectedMasterItem.Ucp).toFixed(2));
                pharmacyItem.MrPrice = parseFloat((selectedMasterItem.Mrp).toFixed(2));
                pharmacyItem.UnitPrice = parseFloat(((pharmacyItem.MrPrice * 100) / (100 + selectedMasterItem.GstPercentage)).toFixed(4));
                pharmacyItem.Quantity = 0.00;
                pharmacyItem.Amount = 0.00;
                pharmacyItem.GrossAmount = 0.00;
                pharmacyItem.DiscountAmount = 0.00;
                pharmacyItem.GSTAmount = 0.00;
                pharmacyItem.InGstAmount = 0.00;
                pharmacyItem.CGstAmount = 0.00;
                pharmacyItem.SGstAmount = 0.00;
                pharmacyItem.NetAmount = 0.00;

                pharmacyItem.GSTId = selectedMasterItem.GstId;
                pharmacyItem.GSTPercentage = selectedMasterItem.GstPercentage;
                pharmacyItem.UnitGSTAmount = parseFloat(((pharmacyItem.UnitPrice / 100) * selectedMasterItem.GstPercentage).toFixed(2));

                pharmacyItem.InGstId = selectedMasterItem.InGstId;
                pharmacyItem.InGstPercentage = selectedMasterItem.InGstPercentage;
                pharmacyItem.UnitInGstAmount = parseFloat(((pharmacyItem.UnitPrice / 100) * selectedMasterItem.InGstPercentage).toFixed(2));

                pharmacyItem.CGstId = selectedMasterItem.CGstId;
                pharmacyItem.CGstPercentage = selectedMasterItem.CGstPercentage;
                pharmacyItem.UnitCGstAmount = parseFloat(((pharmacyItem.UnitPrice / 100) * selectedMasterItem.CGstPercentage).toFixed(2));

                pharmacyItem.SGstId = selectedMasterItem.SGstId;
                pharmacyItem.SGstPercentage = selectedMasterItem.SGstPercentage;
                pharmacyItem.UnitSGstAmount = parseFloat(((pharmacyItem.UnitPrice / 100) * selectedMasterItem.SGstPercentage).toFixed(2));

                if (selectedMasterItem.ExpiryAlert) {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = true;
                    pharmacyItem.ExpiryStop = false;
                    pharmacyItem.ExpiryProceed = false;
                    pharmacyItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                } else if (selectedMasterItem.ExpiryStop) {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = false;
                    pharmacyItem.ExpiryStop = true;
                    pharmacyItem.ExpiryProceed = false;
                    pharmacyItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                } else {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = false;
                    pharmacyItem.ExpiryStop = false;
                    pharmacyItem.ExpiryProceed = true;
                    pharmacyItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                }

                if (existing > -1) {
                    $scope.itemUsedBatches[pharmacyItem.ItemMasterId].splice(existing, 1);
                }
                $scope.itemUsedBatches[pharmacyItem.ItemMasterId].push(pharmacyItem.BatchId);
            } else if (modified > -1) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.batch.lbl') + pharmacyItem.ItemName);

                pharmacyItem.SelectedBatchId = pharmacyItem.BatchId;
            }

            $scope.CalculateNetAmt();
        };

        $scope.ServiceItemChanged = function (idx, selectedItem) {
            var SelectedMasterItem = null;
            var stockserialitems = null;
            var serialitem = [];
            var batid = 0;
            if (selectedItem.IsThisPrescription) {
                SelectedMasterItem = selectedItem.SelectedItem;
                selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                selectedItem.ItemName = SelectedMasterItem.ItemName;
                selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                selectedItem.RST = '';
                selectedItem.RackId = SelectedMasterItem.RackId || 0;
                selectedItem.RackName = SelectedMasterItem.RackName || '';
                selectedItem.Shelf = SelectedMasterItem.Self || '';
                selectedItem.Tray = SelectedMasterItem.Tray || '';
                selectedItem.DiscountModeId = 2;
                selectedItem.Discount = 0;
                if (SelectedMasterItem.RackName) {
                    selectedItem.RST = SelectedMasterItem.RackName;
                }
                if (SelectedMasterItem.Self) {
                    selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Self;
                }
                if (SelectedMasterItem.Tray) {
                    selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Tray;
                }
                selectedItem.IsNonClaimable = SelectedMasterItem.IsNonClaimable;
                if (SelectedMasterItem.GenericMaster) {
                    selectedItem.GenericId = SelectedMasterItem.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.GenericMaster.GenericName;
                }
                if (SelectedMasterItem.Manufacturer) {
                    selectedItem.ManufacturerId = SelectedMasterItem.ManufacturerId;
                    selectedItem.ManufacturerName = SelectedMasterItem.Manufacturer.VendorName;
                }
                if (SelectedMasterItem.ScheduleType) {
                    selectedItem.ScheduleTypeId = SelectedMasterItem.ScheduleTypeId;
                    selectedItem.ScheduleTypeDescription = SelectedMasterItem.ScheduleType.Description;
                }
                if (SelectedMasterItem.SubCategoryId == 1) {
                    selectedItem.SubCategoryId = 1;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                    selectedItem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                    selectedItem.MasterName = SelectedMasterItem.DrugName;
                    selectedItem.MasterItemId = SelectedMasterItem.DrugId;
                    selectedItem.DrugName = SelectedMasterItem.DrugName;
                    selectedItem.DrugId = SelectedMasterItem.DrugId;
                    selectedItem.MasterTypeId = SelectedMasterItem.SubCategoryId;
                } else if (SelectedMasterItem.SubCategoryId == 2) {
                    selectedItem.SubCategoryId = 2;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                    selectedItem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                    selectedItem.MasterName = SelectedMasterItem.DrugName;
                    selectedItem.MasterItemId = SelectedMasterItem.DrugId;
                    selectedItem.DrugName = SelectedMasterItem.DrugName;
                    selectedItem.DrugId = SelectedMasterItem.DrugId;
                    selectedItem.MasterTypeId = SelectedMasterItem.SubCategoryId;
                } else {
                    selectedItem.SubCategoryId = 0;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = 0;
                    selectedItem.ServiceCategoryId = 0;
                    selectedItem.MasterName = '';
                    selectedItem.MasterItemId = 0;
                    selectedItem.DrugName = 0;
                    selectedItem.DrugId = 0;
                    selectedItem.MasterTypeId = 0;
                }

                if (SelectedMasterItem.StockItem &&
                    SelectedMasterItem.StockItem.StockSerialItems.length > 0) {
                    selectedItem.MinQty = SelectedMasterItem.MinQty;
                    selectedItem.TotalQuantity = SelectedMasterItem.StockItem.Quantity;
                    selectedItem.MaxQty = SelectedMasterItem.MaxQty;
                    if (selectedItem.TotalQuantity <= selectedItem.MinQty) {
                        selectedItem.IsFallUnderMinQty = true;
                    }
                    selectedItem.StockItemRev = SelectedMasterItem.StockItem.Rev;
                    stockserialitems = SelectedMasterItem.StockItem.StockSerialItems;
                    for (batid = 0; batid < stockserialitems.length; batid++) {
                        serialitem = stockserialitems[batid];
                        if (serialitem.Quantity > 0) {
                            selectedItem.BatchDetails.push(serialitem);
                        }
                    }

                    $scope.ChooseBatches(idx, selectedItem);
                    if ($scope.separatePaymentCounter == 1) {
                        $scope.IsSeparatePharmacyCounter();
                    } else {
                        $scope.updateReceiptAmt();
                    }
                }
            } else {
                if (selectedItem.SelectedItem.StockInHand <= 0) {
                    SelectedMasterItem = selectedItem.SelectedItem;
                    utl.Alert.showErrorMsg('Stock Not Available');
                    selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                    selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                    selectedItem.ItemName = SelectedMasterItem.ItemName;
                    selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                    selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
                    selectedItem.IsMultiUse = SelectedMasterItem.ItemMaster.IsMultiUse;
                    selectedItem.IsNarcotic = SelectedMasterItem.ItemMaster.IsNarcotic;
                    selectedItem.BatchQuantity = 0;
                    selectedItem.TotalQuantity = 0;
                    selectedItem.Quantity = 0;
                    selectedItem.ExpiryDate = '';
                    selectedItem.MrPrice = 0.00;
                    selectedItem.GSTPercentage = 0.00;
                    selectedItem.DiscountAmount = 0;
                    selectedItem.DiscountAmount = 0.00;
                    selectedItem.SelectedBatchId = -1;
                    selectedItem.BatchDetails = [];
                    if ($scope.requirewantedlist == 1) {
                        $scope.WantedListData = selectedItem.SelectedItem;
                        var msg = 'Do you Want to add the' + selectedItem.SelectedItem.ItemName + 'to wanted List?'
                        var confirmOptions = {
                            headingKey: 'common.confirm-modal-header.lbl',
                            messageKey: msg,
                            yesKey: 'common.yeskey.lbl',
                            noKey: 'common.nokey.lbl',
                            onSuccessMethod: $scope.addWantList,
                        };
                        utl.Dialog.confirmMessage(confirmOptions);
                    }
                } else {
                    SelectedMasterItem = selectedItem.SelectedItem;
                    selectedItem.IsThisPrescription = false;
                    selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                    selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                    selectedItem.ItemName = SelectedMasterItem.ItemName;
                    selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                    selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
                    selectedItem.IsMultiUse = SelectedMasterItem.ItemMaster.IsMultiUse;
                    selectedItem.IsNarcotic = SelectedMasterItem.ItemMaster.IsNarcotic;
                    selectedItem.NoOfTransactions = SelectedMasterItem.ItemMaster.NoOfTransactions;
                    selectedItem.RST = '';
                    selectedItem.RackId = SelectedMasterItem.RackId || 0;
                    selectedItem.RackName = SelectedMasterItem.RackName || '';
                    selectedItem.Shelf = SelectedMasterItem.Self || '';
                    selectedItem.Tray = SelectedMasterItem.Tray || '';
                    if (SelectedMasterItem.RackName) {
                        selectedItem.RST = SelectedMasterItem.RackName;
                    }
                    if (SelectedMasterItem.Self) {
                        selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Self;
                    }
                    if (SelectedMasterItem.Tray) {
                        selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Tray;
                    }
                    selectedItem.AllowStaffDiscount = SelectedMasterItem.ItemMaster.AllowStaffDiscount;
                    selectedItem.IsNonClaimable = SelectedMasterItem.ItemMaster.IsNonClaimable;
                    selectedItem.ManufacturerId = SelectedMasterItem.ItemMaster.ManufacturerId;
                    selectedItem.ManufacturerName = SelectedMasterItem.ItemMaster.ManufacturerName;
                    selectedItem.ScheduleTypeId = SelectedMasterItem.ItemMaster.ScheduleTypeId;
                    // selectedItem.DiscountModeId = SelectedMasterItem.ItemMaster.DiscountModeId || 2;
                    // selectedItem.Discount = SelectedMasterItem.ItemMaster.Discount || 0;
                    if (SelectedMasterItem.ItemMaster.ScheduleType) {
                        selectedItem.ScheduleTypeDescription = SelectedMasterItem.ItemMaster.ScheduleType.Description;
                    }
                    if (SelectedMasterItem.ItemMaster.GenericMaster) {
                        selectedItem.IsPrescribed = SelectedMasterItem.ItemMaster.GenericMaster.IsPrescribed;
                    }
                    if (SelectedMasterItem.ItemMaster.SubCategoryId == 1) {
                        selectedItem.SubCategoryId = 1;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                        selectedItem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                        selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
                    } else if (SelectedMasterItem.ItemMaster.SubCategoryId == 2) {
                        selectedItem.SubCategoryId = 2;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                        selectedItem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                        selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
                    } else {
                        selectedItem.SubCategoryId = 0;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = 0;
                        selectedItem.ServiceCategoryId = 0;
                        selectedItem.MasterName = '';
                        selectedItem.MasterItemId = 0;
                        selectedItem.DrugName = 0;
                        selectedItem.DrugId = 0;
                        selectedItem.MasterTypeId = 0;
                    }

                    selectedItem.BatchDetails = [];
                    selectedItem.BatchDetail = {};
                    selectedItem.BatchId = '';
                    selectedItem.SelectedBatchId = '';
                    selectedItem.ExpiryDate = '';
                    selectedItem.BatchQuantity = 0;
                    selectedItem.Quantity = 0;
                    selectedItem.MrPrice = 0.00;
                    selectedItem.Amount = 0.00;
                    selectedItem.GrossAmount = 0.00;
                    selectedItem.UnitDiscountAmount = 0.00;
                    selectedItem.DiscountAmount = 0.00;
                    selectedItem.GSTPercentage = 0.00;
                    selectedItem.GSTAmount = 0.00;
                    selectedItem.InGstPercentage = 0.00;
                    selectedItem.InGstAmount = 0.00;
                    selectedItem.CGstPercentage = 0.00;
                    selectedItem.CGstAmount = 0.00;
                    selectedItem.SGstPercentage = 0.00;
                    selectedItem.SGstAmount = 0.00;
                    selectedItem.NetAmount = 0.00;

                    if (SelectedMasterItem.ItemMaster.StockItem &&
                        SelectedMasterItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                        var SumOfSerialQuantity = 0;
                        stockserialitems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
                        for (batid = 0; batid < stockserialitems.length; batid++) {
                            serialitem = stockserialitems[batid];
                            if (serialitem.Quantity > 0) {
                                if (serialitem.IsMultiUse) {
                                    var SumOfQty = parseInt(serialitem.PendingTransactions);
                                    SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity
                                } else {
                                    SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity;
                                }
                                selectedItem.BatchDetails.push(serialitem);
                            }
                        }

                        selectedItem.MinQty = SelectedMasterItem.MinQty;
                        selectedItem.SumOfQty = SumOfQty;
                        selectedItem.TotalQuantity = SumOfSerialQuantity;
                        selectedItem.MaxQty = SelectedMasterItem.MaxQty;
                        if (selectedItem.TotalQuantity <= selectedItem.MinQty) {
                            selectedItem.IsFallUnderMinQty = true;
                        }
                        selectedItem.StockItemRev = SelectedMasterItem.ItemMaster.StockItem.Rev;
                    }
                }
            }
        };

        $scope.CleanItemBatches = function (item) {
            for (var count = 0; count < $scope.PatientBillDetails.length; count++) {
                var cllitem = $scope.PatientBillDetails[count];
                if (cllitem.ItemMasterId == item.ItemMasterId) {
                    if (!cllitem.IsAlternate) {
                        cllitem.Status = 2;
                        $scope.DeletedPatientBills.push(cllitem);
                        var index1 = $scope.PatientBillDetails.indexOf(cllitem);
                        $scope.PatientBillDetails.splice(index1, 1);
                        count = count - 1;
                    }
                }
            }

            for (var clsidx in $scope.PatientBillDetails) {
                var clsitem = $scope.PatientBillDetails[clsidx];
                if (clsitem.ServiceId == -1) {
                    clsitem.Status = 2;
                    $scope.DeletedPatientBills.push(clsitem);
                    var index2 = $scope.PatientBillDetails.indexOf(clsitem);
                    $scope.PatientBillDetails.splice(index2, 1);
                }
            }
        };

        $scope.ChooseBatches = function (idx, item) {
            var currentitem = item;
            var PatientBillDetail = {};
            var ExpiryDays = null;
            $scope.currentcontext.ReceiptAmt = 0;
            if (item.IsMultiUse) {
                var QtyCheck = (item.SumOfQty);
            } else {
                var QtyCheck = item.TotalQuantity;
            }
            if (item.Quantity > QtyCheck) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.stock.lbl'));
                item.Quantity = 0;
            } else if (item.Quantity === null || item.Quantity === 0) {
                /* utl.Alert.showErrorMsg('Quantity should be Greater Than Zero'); */
                /* item.Quantity = 0; */
            } else {
                $scope.CleanItemBatches(item);
                item.BatchDetails.sort($scope.custom_multi_sort);
                for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                    if (item.Quantity > 0) {
                        if (item.BatchDetails[batid].Quantity >= item.Quantity) {
                            if (item.IsMultiUse) {
                                var Mrp = parseFloat((item.BatchDetails[batid].ConversionMrp).toFixed(2));
                            } else
                                var Mrp = parseFloat((item.BatchDetails[batid].Mrp).toFixed(2));

                            PatientBillDetail = {
                                Id: 0,
                                BillDateTime: utl.Formatter.getCurrentDate(),
                                ServiceId: item.ItemMasterId,
                                ServiceCode: item.ItemCode,
                                ServiceName: item.ItemName,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                AllowStaffDiscount: item.AllowStaffDiscount,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                StoreMasterId: item.StoreMasterId,
                                ItemTypeId: 0,
                                ServiceTypeId: 0,
                                ServiceGroupId: 0,
                                ServiceCategoryId: 0,
                                MasterName: '',
                                MasterItemId: 0,
                                EncounterId: 0,
                                PatientBillStatusId: 0,
                                MasterTypeId: 0,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                Quantity: item.Quantity,
                                itemidxqty: null,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                MinQty: item.MinQty,
                                TotalQuantity: item.TotalQuantity,
                                MaxQty: item.MaxQty,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                SelectedBatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                Ucp: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                Mrp: Mrp,
                                Rate: Mrp,
                                Amount: 0.00,
                                GrossAmount: 0.00,
                                GrossGSTAmount: 0.00,
                                DiscountPercentage: 0.00,
                                UnitDiscountAmount: 0.00,
                                DiscountAmount: 0.00,
                                UnitProportionateDiscount: 0.00,
                                ProportionateDiscount: 0.00,
                                DoctorDiscountAmount: 0.00,
                                EducationCess: 0.00,
                                NetAmountBeforeGST: 0.00,
                                NetAmount: 0.00,
                                TaxCode: '',
                                DoctorId: 0,
                                DoctorName: '',
                                IsPrescribed: false,
                                IsPackageItem: 0,
                                PackageId: 0,
                                PackageName: '',
                                OrderId: 0,
                                OrderDetailId: 0,
                                OrderTypeId: 0,
                                OrderDateTime: null,
                                ServiceRateCategoryId: 0,
                                ServiceRateCategoryName: '',
                                IsModified: 0,
                                IsSupplimentary: 0,
                                IsBillable: 0,
                                IsPharmacySale: 1,
                                IsDoctorDiscount: 0,
                                IsGstDoctor: 0,
                                StartDateTime: null,
                                EndDateTime: null,
                                DiscountTypeId: 0,
                                DiscountModeId: item.DiscountModeId,
                                Discount: item.Discount,
                                DiscountAuthorizedBy: 0,
                                DoctorShare: 0.00,
                                ReferalShare: 0.00,
                                CNAmount: 0.00,
                                CancelReason: 0,
                                CancelledBy: 0,
                                Comments: '',
                                DepartmentId: 0,
                                GenericId: item.GenericId,
                                GenericName: item.GenericName,
                                IsNonClaimable: item.IsNonClaimable,
                                RackId: item.RackId,
                                RackName: item.RackName,
                                Shelf: item.Shelf,
                                Tray: item.Tray,
                                RST: item.RST,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                UnitCostPrice: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                MrPrice: Mrp,
                                UnitPrice: 0.00,
                                GSTId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GSTPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                UnitGSTAmount: 0.00,
                                UnitInGstAmount: 0.00,
                                UnitCGstAmount: 0.00,
                                UnitSGstAmount: 0.00,
                                GSTAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                RdoDiscountMode: true,
                                RdoDiscount: true,
                                PrescriptionDetailId: 0,
                                IsThisPrescription: item.IsThisPrescription,
                                Status: 1,
                                IsMultiUse: item.BatchDetails[batid].IsMultiUse,
                                IsNarcotic: item.IsNarcotic,
                                // NoOfTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedTransactions: (parseFloat(item.BatchDetails[batid].ConsumedTransactions)) + parseFloat(item.Quantity),
                                TotalTransactions: item.BatchDetails[batid].TotalTransactions,
                                PendingTransactions: (parseFloat(item.BatchDetails[batid].PendingTransactions)) - (parseFloat(item.Quantity)),
                                // ItemPossibleTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedPerTransactions: item.Quantity
                            };

                            if (item.SelectedItem) {
                                if (item.SelectedItem.ItemMaster) {
                                    var ItemMasterData = item.SelectedItem.ItemMaster;
                                    PatientBillDetail.NoOfTransactions = ItemMasterData.NoOfTransactions;
                                    PatientBillDetail.ItemPossibleTransactions = ItemMasterData.NoOfTransactions;
                                }
                            }

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.currentfilter.ExpiryPriorStopDays) {
                                PatientBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.currentfilter.ExpiryPriorStopDays && ExpiryDays <= $scope.currentfilter.ExpiryWarningDays) {
                                PatientBillDetail.ExpiryAlert = true;
                                utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                            } else {
                                PatientBillDetail.ExpiryProceed = true;
                                // utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                            }

                            if (PatientBillDetail.ExpiryAlert) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryAlert = true;
                                utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (PatientBillDetail.ExpiryStop) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryStop = true;
                                utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryProceed = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            if (PatientBillDetail.TotalQuantity <= PatientBillDetail.MinQty) {
                                PatientBillDetail.IsFallUnderMinQty = true;
                            } else {
                                PatientBillDetail.IsFallUnderMinQty = false;
                            }

                            PatientBillDetail.IsPrescribed = item.IsPrescribed;
                            if ($scope.item.StaffCheck) {
                                if (PatientBillDetail.AllowStaffDiscount) {
                                    if ($scope.item.StaffDiscountTypeId === 2) {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    } else {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.MrPrice = PatientBillDetail.UnitCostPrice;
                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.UnitCostPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    }
                                } else {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = 0;
                                    PatientBillDetail.UnitDiscountAmount = 0;
                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            } else {
                                if (item.DiscountModeId == 2 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = item.Discount;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitDiscountAmount = parseFloat((item.Discount / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else if (item.DiscountModeId == 1 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice - item.Discount;
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - item.Discount;

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else {
                                    //                                     PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.Rate / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            }
                            PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                            //PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                            //PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitCGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.CGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitSGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.SGstPercentage).toFixed(2));
                            PatientBillDetail.GSTAmount = parseFloat((PatientBillDetail.UnitGSTAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.InGstAmount = parseFloat((PatientBillDetail.UnitInGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.CGstAmount = PatientBillDetail.GSTAmount / 2;
                            PatientBillDetail.SGstAmount = PatientBillDetail.GSTAmount / 2;
                            //PatientBillDetail.CGstAmount = parseFloat((PatientBillDetail.UnitCGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.SGstAmount = parseFloat((PatientBillDetail.UnitSGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmount = parseFloat((PatientBillDetail.Rate * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmountBeforeGST = parseFloat((PatientBillDetail.NetAmount - PatientBillDetail.GSTAmount).toFixed(2));

                            if (item.SubCategoryId == 1) {
                                PatientBillDetail.SubCategoryId = 1;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.DrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else if (item.SubCategoryId == 2) {
                                PatientBillDetail.SubCategoryId = 2;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else {
                                PatientBillDetail.SubCategoryId = 0;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = 0;
                                PatientBillDetail.ServiceCategoryId = 0;
                                PatientBillDetail.MasterName = '';
                                PatientBillDetail.MasterItemId = 0;
                                PatientBillDetail.MasterTypeId = 0;
                            }

                            PatientBillDetail.BatchDetails = item.BatchDetails;
                            $scope.PatientBillDetails.push(PatientBillDetail);
                            item.Quantity = 0;
                            $scope.currentcontext.BillDiscount = 0;
                            savehitcompleted = 0;
                        } else if (item.BatchDetails[batid].Quantity < item.Quantity) {
                            if (item.IsMultiUse) {
                                var Qty = item.Quantity;
                                var Mrp = parseFloat((item.BatchDetails[batid].ConversionMrp).toFixed(2));
                            } else {
                                var Qty = item.BatchDetails[batid].Quantity;
                                var Mrp = parseFloat((item.BatchDetails[batid].Mrp).toFixed(2));
                            }
                            PatientBillDetail = {
                                Id: 0,
                                BillDateTime: utl.Formatter.getCurrentDate(),
                                ServiceId: item.ItemMasterId,
                                ServiceCode: item.ItemCode,
                                ServiceName: item.ItemName,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                AllowStaffDiscount: item.AllowStaffDiscount,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                StoreMasterId: item.StoreMasterId,
                                ItemTypeId: 0,
                                ServiceTypeId: 0,
                                ServiceGroupId: 0,
                                ServiceCategoryId: 0,
                                MasterName: '',
                                MasterItemId: 0,
                                EncounterId: 0,
                                PatientBillStatusId: 0,
                                MasterTypeId: 0,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                Quantity: Qty,
                                itemidxqty: null,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                MinQty: item.MinQty,
                                TotalQuantity: item.TotalQuantity,
                                MaxQty: item.MaxQty,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                SelectedBatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                Ucp: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                Mrp: Mrp,
                                Rate: Mrp,
                                Amount: 0.00,
                                GrossAmount: 0.00,
                                GrossGSTAmount: 0.00,
                                DiscountPercentage: 0.00,
                                UnitDiscountAmount: 0.00,
                                DiscountAmount: 0.00,
                                UnitProportionateDiscount: 0.00,
                                ProportionateDiscount: 0.00,
                                DoctorDiscountAmount: 0.00,
                                EducationCess: 0.00,
                                NetAmountBeforeGST: 0.00,
                                NetAmount: 0.00,
                                TaxCode: '',
                                DoctorId: 0,
                                DoctorName: '',
                                IsPrescribed: false,
                                IsPackageItem: 0,
                                PackageId: 0,
                                PackageName: '',
                                OrderId: 0,
                                OrderDetailId: 0,
                                OrderTypeId: 0,
                                OrderDateTime: null,
                                ServiceRateCategoryId: 0,
                                ServiceRateCategoryName: '',
                                IsModified: 0,
                                IsSupplimentary: 0,
                                IsBillable: 0,
                                IsPharmacySale: 1,
                                IsDoctorDiscount: 0,
                                IsGstDoctor: 0,
                                StartDateTime: null,
                                EndDateTime: null,
                                DiscountTypeId: 0,
                                DiscountModeId: item.DiscountModeId,
                                // Discount: parseFloat((item.Discount).toFixed(2)),
                                Discount: (item.Discount) ? parseFloat((item.Discount).toFixed(2)) : 0,
                                DiscountAuthorizedBy: 0,
                                DoctorShare: 0.00,
                                ReferalShare: 0.00,
                                CNAmount: 0.00,
                                CancelReason: 0,
                                CancelledBy: 0,
                                Comments: '',
                                DepartmentId: 0,
                                GenericId: item.GenericId,
                                GenericName: item.GenericName,
                                IsNonClaimable: item.IsNonClaimable,
                                RackId: item.RackId,
                                RackName: item.RackName,
                                Shelf: item.Shelf,
                                Tray: item.Tray,
                                RST: item.RST,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                UnitCostPrice: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                MrPrice: Mrp,
                                UnitPrice: 0.00,
                                GSTId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GSTPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                UnitGSTAmount: 0.00,
                                UnitInGstAmount: 0.00,
                                UnitCGstAmount: 0.00,
                                UnitSGstAmount: 0.00,
                                GSTAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                RdoDiscountMode: true,
                                RdoDiscount: true,
                                PrescriptionDetailId: 0,
                                IsThisPrescription: item.IsThisPrescription,
                                Status: 1,
                                IsMultiUse: item.BatchDetails[batid].IsMultiUse,
                                IsNarcotic: item.IsNarcotic,
                                // NoOfTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedTransactions: (parseFloat(item.BatchDetails[batid].ConsumedTransactions)) + parseFloat(item.Quantity),
                                TotalTransactions: item.BatchDetails[batid].TotalTransactions,
                                PendingTransactions: (parseFloat(item.BatchDetails[batid].PendingTransactions)) - (parseFloat(item.Quantity)),
                                // ItemPossibleTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedPerTransactions: item.Quantity
                            };

                            if (item.SelectedItem) {
                                if (item.SelectedItem.ItemMaster) {
                                    var ItemMasterData = item.SelectedItem.ItemMaster;
                                    PatientBillDetail.NoOfTransactions = ItemMasterData.NoOfTransactions;
                                    PatientBillDetail.ItemPossibleTransactions = ItemMasterData.NoOfTransactions;
                                }
                            }

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.currentfilter.ExpiryPriorStopDays) {
                                PatientBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.currentfilter.ExpiryPriorStopDays && ExpiryDays <= $scope.currentfilter.ExpiryWarningDays) {
                                PatientBillDetail.ExpiryAlert = true;
                            } else {
                                PatientBillDetail.ExpiryProceed = true;
                            }

                            if (PatientBillDetail.ExpiryAlert) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryAlert = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (PatientBillDetail.ExpiryStop) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryStop = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryProceed = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            if (PatientBillDetail.TotalQuantity <= PatientBillDetail.MinQty) {
                                PatientBillDetail.IsFallUnderMinQty = true;
                            } else {
                                PatientBillDetail.IsFallUnderMinQty = false;
                            }

                            PatientBillDetail.IsPrescribed = item.IsPrescribed;
                            if ($scope.item.StaffCheck) {
                                if (PatientBillDetail.AllowStaffDiscount) {
                                    if ($scope.item.StaffDiscountTypeId === 2) {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    } else {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.MrPrice = PatientBillDetail.UnitCostPrice;
                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.UnitCostPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    }
                                } else {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = 0;
                                    PatientBillDetail.UnitDiscountAmount = 0;
                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            } else {
                                if (item.DiscountModeId == 2 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = item.Discount;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitDiscountAmount = parseFloat((item.Discount / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else if (item.DiscountModeId == 1 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice - item.Discount;
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - item.Discount;

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else {
                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            }
                            PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                            //PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                            //PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitCGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.CGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitSGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.SGstPercentage).toFixed(2));
                            PatientBillDetail.GSTAmount = parseFloat((PatientBillDetail.UnitGSTAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.InGstAmount = parseFloat((PatientBillDetail.UnitInGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.CGstAmount = PatientBillDetail.GSTAmount / 2;
                            PatientBillDetail.SGstAmount = PatientBillDetail.GSTAmount / 2;
                            //PatientBillDetail.CGstAmount = parseFloat((PatientBillDetail.UnitCGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.SGstAmount = parseFloat((PatientBillDetail.UnitSGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmount = parseFloat((PatientBillDetail.Rate * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmountBeforeGST = parseFloat((PatientBillDetail.NetAmount - PatientBillDetail.GSTAmount).toFixed(2));

                            if (item.SubCategoryId == 1) {
                                PatientBillDetail.SubCategoryId = 1;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.DrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else if (item.SubCategoryId == 2) {
                                PatientBillDetail.SubCategoryId = 2;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else {
                                PatientBillDetail.SubCategoryId = 0;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = 0;
                                PatientBillDetail.ServiceCategoryId = 0;
                                PatientBillDetail.MasterName = '';
                                PatientBillDetail.MasterItemId = 0;
                                PatientBillDetail.MasterTypeId = 0;
                            }

                            PatientBillDetail.BatchDetails = item.BatchDetails;
                            $scope.PatientBillDetails.push(PatientBillDetail);
                            item.Quantity = item.Quantity - item.BatchDetails[batid].Quantity;
                            $scope.currentcontext.BillDiscount = 0;
                            savehitcompleted = 0;
                        }
                    }
                }

                $scope.CalculateNetAmt();
                $scope.addNewLineItem();
            }
        };

        $scope.custom_sort = function (a, b) {
            if (a.ExpiryDate < b.ExpiryDate)
                return -1;
            if (a.ExpiryDate > b.ExpiryDate)
                return 1;
            return 0;
        };

        $scope.custom_multi_sort = function (a, b) {
            var aExpiryDate = a.ExpiryDate;
            var bExpiryDate = b.ExpiryDate;
            var aQuantity = a.Quantity;
            var bQuantity = b.Quantity;

            if (aExpiryDate == bExpiryDate) {
                return (aQuantity < bQuantity) ? -1 : (aQuantity > bQuantity) ? 1 : 0;
            } else {
                return (aExpiryDate < bExpiryDate) ? -1 : 1;
            }
        };

        $scope.CheckBatchQty = function (item) {
            if (item.BatchQuantity > 0) {
                if (item.IsMultiUse) {
                    var OtyCheck = item.PendingTransactions;
                } else
                    var OtyCheck = item.BatchQuantity;
                if (parseInt(item.Quantity) > OtyCheck) {
                    utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.quantityalert.lbl'));
                    item.Quantity = 0;
                    item.Amount = 0;
                    item.GSTAmount = 0;
                    item.InGstAmount = 0;
                    item.CGstAmount = 0;
                    item.SGstAmount = 0;
                    item.NetAmount = 0;
                    item.NetAmountBeforeGST = 0;
                } else if (item.Quantity === null) {
                    item.Amount = 0;
                    item.DiscountPercentage = 0;
                    item.DiscountAmount = 0;
                    item.GSTAmount = 0;
                    item.InGstAmount = 0;
                    item.CGstAmount = 0;
                    item.SGstAmount = 0;
                    item.NetAmount = 0;
                    item.NetAmountBeforeGST = 0;
                } else {
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.currentcontext.BillDiscount = 0;
                    item.Amount = parseFloat((parseInt(item.Quantity) * item.Rate).toFixed(2));
                    item.GSTAmount = parseFloat((item.UnitGSTAmount * parseInt(item.Quantity)).toFixed(2));
                    item.InGstAmount = parseFloat((item.UnitInGstAmount * parseInt(item.Quantity)).toFixed(2));
                    item.CGstAmount = parseFloat((item.UnitCGstAmount * parseInt(item.Quantity)).toFixed(2));
                    item.SGstAmount = parseFloat((item.UnitSGstAmount * parseInt(item.Quantity)).toFixed(2));
                    if (item.DiscountModeId > 0 && item.DiscountModeId == 2) {
                        item.DiscountPercentage = parseFloat(item.DiscountAmount);
                        var discamt = parseFloat(((parseFloat(item.DiscountAmount) / 100) * item.Amount).toFixed(2));
                        item.NetAmount = parseFloat((item.Amount - discamt).toFixed(2));
                    } else if (item.DiscountModeId > 0 && item.DiscountModeId == 1) {
                        item.NetAmount = parseFloat((item.Amount - parseFloat(item.DiscountAmount)).toFixed(2));
                    } else {
                        item.DiscountAmount = 0;
                        item.NetAmount = item.Amount;
                    }

                    item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;
                }

                $scope.CalculateNetAmt();
                $scope.updateReceiptAmt();
            }
        };

        $scope.CalcualteAmt = function (item) {
            if (!$scope.currentcontext.ReceiptAmt) {
                $scope.currentcontext.ReceiptAmt = 0;
            }
            if (item.IsMultiUse) {
                var OtyCheck = item.TotalTransactions;
            } else
                var OtyCheck = item.BatchQuantity;
            if (item.Quantity > OtyCheck) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.availqty.lbl'));
                item.Quantity = 0;
            } else if (item.Quantity === null) { } else {
                $scope.currentcontext.BillDiscount = 0;
                item.Rate = item.MrPrice;
                item.Amount = parseFloat((item.Quantity * item.Rate).toFixed(2));
                item.GSTAmount = parseFloat((item.UnitGSTAmount * item.Quantity).toFixed(2));
                item.InGstAmount = parseFloat((item.UnitInGstAmount * item.Quantity).toFixed(2));
                item.CGstAmount = parseFloat((item.UnitCGstAmount * item.Quantity).toFixed(2));
                item.SGstAmount = parseFloat((item.UnitSGstAmount * item.Quantity).toFixed(2));
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    item.DiscountPercentage = parseFloat(item.DiscountAmount);
                    if (item.DiscountAmount > 0) {
                        $scope.IslineDisc = true;
                    }
                    var discamt = parseFloat(((parseFloat(item.DiscountAmount) / 100) * item.Amount).toFixed(2));
                    var unitdiscamt = parseFloat(((parseFloat(item.DiscountAmount) / 100) * item.Rate).toFixed(2));
                    if (discamt > item.Amount) {
                        item.DiscountAmount = 0;
                        item.NetAmount = item.Amount;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                    } else {
                        item.NetAmount = parseFloat((item.Amount - discamt).toFixed(2));
                        var RateAfterDiscount = parseFloat(item.Rate) - parseFloat(unitdiscamt);
                        // var UnitPriceAfterDiscount = parseFloat(RateAfterDiscount);
                        item.GSTAmount = parseFloat((RateAfterDiscount / 100 * item.GSTPercentage).toFixed(2));
                        item.InGstAmount = parseFloat((RateAfterDiscount / 100 * item.InGstPercentage).toFixed(2));
                        item.CGstAmount = parseFloat((RateAfterDiscount / 100 * item.CGstPercentage).toFixed(2));
                        item.SGstAmount = parseFloat((RateAfterDiscount / 100 * item.SGstPercentage).toFixed(2));
                        item.UnitGSTAmount = (parseFloat(item.GSTAmount) / parseFloat(item.Quantity)).toFixed(2);
                        item.UnitInGstAmount = (parseFloat(item.InGstAmount) / parseFloat(item.Quantity)).toFixed(2);
                        item.UnitCGstAmount = (parseFloat(item.CGstAmount) / parseFloat(item.Quantity)).toFixed(2);
                        item.UnitSGstAmount = (parseFloat(item.SGstAmount) / parseFloat(item.Quantity)).toFixed(2);
                    }
                } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                    item.NetAmount = parseFloat((item.Amount - parseFloat(item.DiscountAmount)).toFixed(2));
                    if (item.DiscountAmount > 0) {
                        $scope.IslineDisc = true;
                    }
                    if (item.DiscountAmount > item.Amount) {
                        item.DiscountAmount = 0;
                        item.NetAmount = item.Amount;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                    } else {
                        var AmtAfterDiscount = parseFloat(item.Amount) - parseFloat(item.DiscountAmount);
                        // var UnitPriceAfterDiscount = parseFloat(RateAfterDiscount);
                        item.GSTAmount = parseFloat((AmtAfterDiscount / 100 * item.GSTPercentage).toFixed(2));
                        item.InGstAmount = parseFloat((AmtAfterDiscount / 100 * item.InGstPercentage).toFixed(2));
                        item.CGstAmount = parseFloat((AmtAfterDiscount / 100 * item.CGstPercentage).toFixed(2));
                        item.SGstAmount = parseFloat((AmtAfterDiscount / 100 * item.SGstPercentage).toFixed(2));
                        item.UnitGSTAmount = (parseFloat(item.GSTAmount) / parseFloat(item.Quantity)).toFixed(2);
                        item.UnitInGstAmount = (parseFloat(item.InGstAmount) / parseFloat(item.Quantity)).toFixed(2);
                        item.UnitCGstAmount = (parseFloat(item.CGstAmount) / parseFloat(item.Quantity)).toFixed(2);
                        item.UnitSGstAmount = (parseFloat(item.SGstAmount) / parseFloat(item.Quantity)).toFixed(2);
                    }
                    // item.DiscountAmount = item.DiscountValue;
                } else {
                    item.DiscountAmount = 0;
                    item.NetAmount = item.Amount;
                }

                item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;

                if (item.NetAmount >= 0) {
                    $scope.CalculateNetAmt();
                } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.discountamt.lbl'));

                    item.NetAmount = item.Amount;
                    item.DiscountAmount = 0;
                }
            }
            if ($scope.IslineDisc == true) {
                $scope.ShowHeaderDisc = false;
            }
        };

        $scope.HeaderDiscountValueChange = function () {
            if (!$scope.currentcontext.ReceiptAmt) {
                $scope.currentcontext.ReceiptAmt = 0;
            }
            if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId != -1) {
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.PatientBillDetails[idx].DiscountAmount = 0;
                        $scope.PatientBillDetails[idx].DiscountPercentage = 0;
                        $scope.PatientBillDetails[idx].NetAmount = parseFloat(($scope.PatientBillDetails[idx].Quantity * $scope.PatientBillDetails[idx].MrPrice).toFixed(2));
                    }
                }
                $scope.CalculateNetAmt();
                $scope.updateReceiptAmt();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
                $scope.currentcontext.BillDiscount = 0;
            }
        };

        $scope.IsSeparatePharmacyCounter = function () {
            if ($scope.separatePaymentCounter == 1) {
                if (!$scope.currentcontext.ReceiptAmt) {
                    $scope.currentcontext.ReceiptAmt = 0;
                }
                $scope.item.BillWithComeReceipt = true;
                $scope.currentcontext.PaymentTypeId = 1;
                if (!$scope.item.PrivateDueId) {
                    $scope.item.PrivateDueId = -1;
                }
                $scope.setDefaultPrivateDueId();
            } else {
                $scope.setDefaultPrivateDueId();
            }
        };

        $scope.setDefaultPrivateDueId = function () {
            if ($scope.lookup && $scope.lookup.PrivateDueApprover) {
                //var iFirstCreditor = -1;
                if (!$scope.item.PrivateDueId) {
                    var iDefaultCreditor = -1;
                    for (var idx in $scope.lookup.PrivateDueApprover) {
                        var approver = $scope.lookup.PrivateDueApprover[idx];
                        if (approver && approver.Id) {

                            if (approver.Id > 0 && $scope.item.PrivateDueId <= 0 && approver.IsDefaultPrivateDue)
                                iDefaultCreditor = approver.Id;
                        }
                    }

                    if (iDefaultCreditor > 0) {
                        $scope.item.PrivateDueId = iDefaultCreditor;
                    } else {
                        $scope.item.PrivateDueId = -1;
                    }
                }
            }
        };

        $scope.CalculateNetAmt = function () {
            $scope.IsSeparatePharmacyCounter();

            if ($scope.currentcontext.PaymentTypeId == 7) {
                $scope.currentcontext.PaymentTypeId = 1;
                $scope.PaymentAdjustmentDetails = [];
                $scope.currentcontext.IsAdjustAgainstAdvance = false;
            }

            var itemwiseGrossAmt = 0;
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            var itemtotaldiscountallpercent = 0;

            var itemwiseGstAmt = 0;
            var itemwiseInGstAmt = 0;
            var itemwiseCGstAmt = 0;
            var itemwiseSGstAmt = 0;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                if ($scope.PatientBillDetails[i].Status == 1) {
                    var itemnetAmount = 0;
                    var itemGrossAmount = 0;
                    var itemDiscountAmount = 0;
                    var itemtotaldiscountpercent = 0;
                    var itemGstAmount = 0;
                    var itemInGstAmount = 0;
                    var itemCGstAmount = 0;
                    var itemSGstAmount = 0;

                    if ($scope.PatientBillDetails[i].NetAmount)
                        itemnetAmount = parseFloat(($scope.PatientBillDetails[i].NetAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].Amount)
                        itemGrossAmount = parseFloat(($scope.PatientBillDetails[i].Amount).toFixed(2));
                    if ($scope.PatientBillDetails[i].DiscountAmount)
                        itemDiscountAmount = parseFloat($scope.PatientBillDetails[i].DiscountAmount);
                    // if ($scope.PatientBillDetails[i].GSTAmount)
                    //     itemGstAmount = parseFloat(($scope.PatientBillDetails[i].GSTAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].InGstAmount)
                        itemInGstAmount = parseFloat(($scope.PatientBillDetails[i].InGstAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].CGstPercentage)
                        itemCGstAmount = parseFloat(($scope.PatientBillDetails[i].NetAmount * $scope.PatientBillDetails[i].CGstPercentage) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2);
                    // itemCGstAmount = parseFloat(($scope.PatientBillDetails[i].CGstAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].SGstPercentage)
                        itemSGstAmount = parseFloat(($scope.PatientBillDetails[i].NetAmount * $scope.PatientBillDetails[i].SGstPercentage) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2);
                    // itemSGstAmount = parseFloat(($scope.PatientBillDetails[i].SGstAmount).toFixed(2));
                    itemGstAmount = parseFloat(itemCGstAmount) + parseFloat(itemSGstAmount);
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        itemDiscountAmount = parseFloat((itemDiscountAmount / 100 * itemGrossAmount).toFixed(2));
                    }
                    if ($scope.PatientBillDetails[i].DiscountAmount)
                        itemtotaldiscountpercent = parseFloat($scope.PatientBillDetails[i].DiscountAmount);

                    if ($scope.currentfilter.GuarantorTypeId == 9) { // Free type
                        if ($scope.PatientBillDetails[i].Amount) { // FreeNetAmount
                            $scope.PatientBillDetails[i].FreeNetAmount = $scope.PatientBillDetails[i].Amount;
                        }
                        $scope.PatientBillDetails[i].NetAmount = 0;
                        $scope.PatientBillDetails[i].DoctorShare = 0;
                        $scope.PatientBillDetails[i].GSTAmount = 0;
                        itemGrossAmount = 0;
                        itemnetAmount = 0;
                        itemDiscountAmount = 0;
                    }

                    itemwiseGrossAmt += itemGrossAmount;
                    itemwiseNetAmt += itemnetAmount;
                    itemwiseDiscountAmt += itemDiscountAmount;
                    itemtotaldiscountallpercent += itemtotaldiscountpercent;

                    itemwiseGstAmt += itemGstAmount;
                    itemwiseInGstAmt += itemInGstAmount;
                    itemwiseCGstAmt += parseFloat(itemCGstAmount);
                    itemwiseSGstAmt += parseFloat(itemSGstAmount);
                }
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : parseFloat(($scope.currentcontext.PaidAmt).toFixed(2));
            $scope.item.TotDiscAmount = 0;
            $scope.item.GrossAmount = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.item.GrossAmount = itemwiseGrossAmt;
            $scope.item.GSTAmount = itemwiseGstAmt;
            $scope.item.InGstAmount = itemwiseInGstAmt;
            $scope.item.CGstAmount = itemwiseCGstAmt;
            $scope.item.SGstAmount = itemwiseSGstAmt;
            $scope.item.DiscountPercentage = itemtotaldiscountallpercent;

            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : parseFloat($scope.currentcontext.ReceiptAmt);
            // if ($scope.item.DiscountPercentage > 0) {
            //     $scope.currentcontext.BillDiscount = parseFloat($scope.item.DiscountPercentage);
            // }
            $scope.currentcontext.DiscountModeValue = parseFloat($scope.currentcontext.BillDiscount);
            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.item.TotDiscAmount = parseFloat(($scope.currentcontext.BillDiscount / 100 * $scope.item.GrossAmount).toFixed(2));
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.item.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
                $scope.item.DiscountPercentage = $scope.currentcontext.BillDiscount;
            } else if (itemwiseDiscountAmt > 0) {
                $scope.item.TotDiscAmount = itemwiseDiscountAmt;
            }

            // if (itemwiseDiscountAmt > 0) {
            //     $scope.item.TotDiscAmount = itemwiseDiscountAmt;
            // } else if ($scope.currentcontext.DiscountModeValue > 0) {
            //     if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
            //         $scope.item.TotDiscAmount = parseFloat(($scope.currentcontext.DiscountModeValue / 100 * $scope.item.GrossAmount).toFixed(2));
            //     } else if ($scope.currentfilter.DiscountModeId == 1) {
            //         $scope.item.TotDiscAmount = parseFloat($scope.currentcontext.DiscountModeValue);
            //     }
            // }

            $scope.currentcontext.TotNetAmount = parseFloat((parseFloat($scope.item.GrossAmount) - (parseFloat($scope.item.TotDiscAmount) + $scope.currentcontext.ReturnedAmount)).toFixed(2));
            $scope.currentcontext.TotBalanceAmt = parseFloat((parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt)).toFixed(2));

            var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var PreferedRoundOff = parseFloat($scope.item.PreferedRoundOff);
            var NetRoundOffValue = 0;
            if ($scope.enableroundoff == 1) {
                if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = -1 * (NetDecimalValue / 100);
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else {
                    NetRoundOffValue = 0;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                }
            }
            var billBalance = parseFloat(((parseFloat($scope.currentcontext.TotNetAmount)) - parseFloat($scope.currentcontext.PaidAmt)).toFixed(2));
            if (parseFloat(($scope.currentcontext.ReceiptAmt).toFixed(2)) > math.round(billBalance)) {
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = billBalance;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));

            }
            if (parseFloat(($scope.item.TotDiscAmount).toFixed(2)) > parseFloat(($scope.item.GrossAmount).toFixed(2)) /* || $scope.currentcontext.TotBalanceAmt < 0*/) {
                $scope.currentcontext.dBillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));

                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.TotNetAmount = parseFloat((parseFloat($scope.item.GrossAmount)).toFixed(2));
            }

            /*
            if (NetDecimalValue > 0 && NetDecimalValue <= 50) {
                if (PreferedRoundOff > 0 && PreferedRoundOff <= 0.50) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 0.50;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (50 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else if (PreferedRoundOff > 0.50 && PreferedRoundOff <= 1) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                }
            } else if (NetDecimalValue > 50 && NetDecimalValue < 100) {
                if (PreferedRoundOff > 0 && PreferedRoundOff <= 0.50) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else if (PreferedRoundOff > 0.50 && PreferedRoundOff <= 1) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                }
            } else {
                NetRoundOffValue = 0;
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            }
            */

            $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.PaidAmt !== 0 ? $scope.currentcontext.PaidAmt : 0;
            if ($scope.currentcontext.id !== 0 && $scope.item.PatientBillStatusId !== 1)
                $scope.item.Received = parseFloat($scope.currentcontext.PaidAmt) + parseFloat($scope.currentcontext.ReceiptAmt);

            if (vm.DueApprover) {
                $scope.DueLimit = vm.DueApprover.PrivateDueLimit;
                $scope.LimitDue = parseFloat($scope.currentcontext.TotBalanceAmt);
            }
            if ($scope.currentcontext.TotBalanceAmt > 0) {
                $scope.DueAlert = '';
                $scope.IsDueApproved = true;
                if ($scope.item.PrivateDueId > 0) {
                    if ($scope.DueLimit !== null && $scope.currentcontext.TotBalanceAmt > $scope.DueLimit) {
                        $scope.DueAlert = 'Maximum Due of ' + vm.DueApprover.PrivateDueLimit + ' Only Can be Given For the Selected Credit Approver';
                        utl.Alert.showErrorMsg($scope.DueAlert);
                        $scope.IsDueApproved = false;
                    }
                }
                // else {
                //     $scope.DueAlert = 'Please Select Credit Approver';
                //     utl.Alert.showErrorMsg($scope.DueAlert);
                //     $scope.IsDiscountApproved = false;
                // }
            }
            // Discount Limit Validation
            if (vm.DiscountApprover) {
                $scope.DiscountLimit = vm.DiscountApprover.DiscountLimit;
                if (vm.DiscountApprover.DiscountMode) {
                    if (vm.DiscountApprover.DiscountMode.Description == "%") {
                        $scope.DiscountLimit = (parseFloat($scope.item.GrossAmount) * vm.DiscountApprover.DiscountLimit) / 100;
                    }
                }
            }
            if ($scope.item.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit !== null && $scope.item.TotDiscAmount > $scope.DiscountLimit) {
                        if (vm.DiscountApprover.DiscountMode.Description == "RS")
                            $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                        if (vm.DiscountApprover.DiscountMode.Description == "%")
                            $scope.DiscountAlert = 'Maximum Discount of ' + vm.DiscountApprover.DiscountLimit + '% Only Can be Given For the Selected Discount Approver';
                        utl.Alert.showErrorMsg($scope.DiscountAlert);
                        $scope.IsDiscountApproved = false;
                    }
                } else {
                    $scope.DiscountAlert = 'Please Select Discount Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }

            if (!$scope.currentcontext.ReceiptAmt && $scope.currentfilter.GuarantorTypeId <= 1) {
                $scope.setDefaultPrivateDueId();
            } else if (!$scope.currentcontext.ReceiptAmt && $scope.currentfilter.GuarantorTypeId > 1) {
                $scope.item.GuarantorDueId = $scope.currentfilter.GuarantorId;
            }
            $scope.setupPaymentDetails();
        };

        $scope.setDueLimit = function (item) {
            vm.DueApprover = item;
            $scope.CalculateNetAmt();
        };

        $scope.setDiscountLimit = function (item) {
            vm.DiscountApprover = item;
            $scope.CalculateNetAmt();
        };

        $scope.setPaymentType = function (selected) {
            if (selected.Id == 6 || selected.Id == 5)
                $scope.item.TerminalNoId = 3;
            else $scope.item.TerminalNoId = 0;
        };

        $scope.getStoreAssosiatedStaffCallback = function (scope, res, options, hasError) {
            $scope.lookup.StaffDiscount = [];
            if (res.Data && res.Data.length > 0) {
                var PleaseSelect = {};
                PleaseSelect.Id = -1;
                PleaseSelect.StaffDiscountId = -1;
                PleaseSelect.StaffDiscountTypeId = 0;
                PleaseSelect.StaffDiscountPercentage = 0;
                PleaseSelect.FacilityId = 0;
                PleaseSelect.StoreTypeId = 0;
                PleaseSelect.StoreMasterId = 0;
                PleaseSelect.UserTypeId = 0;
                PleaseSelect.UserId = 0;
                PleaseSelect.UserName = 'Please Select';
                PleaseSelect.Text = 'Please Select';
                PleaseSelect.StaffId = 0;
                $scope.lookup.StaffDiscount.push(PleaseSelect);
                for (var sidx in res.Data) {
                    var sitem = res.Data[sidx];
                    var StaffDiscount = {};
                    StaffDiscount.Id = sitem.Id;
                    StaffDiscount.StaffDiscountId = sitem.Id;
                    StaffDiscount.StaffDiscountTypeId = sitem.StaffDiscountTypeId;
                    StaffDiscount.StaffDiscountPercentage = sitem.StaffDiscountPercentage;
                    StaffDiscount.FacilityId = sitem.FacilityId;
                    StaffDiscount.StoreTypeId = sitem.StoreTypeId;
                    StaffDiscount.StoreMasterId = sitem.StoreMasterId;
                    StaffDiscount.UserTypeId = sitem.UserTypeId;
                    StaffDiscount.UserId = sitem.UserId;
                    StaffDiscount.UserName = '';
                    if (sitem.User) {
                        if (sitem.User.Title) {
                            StaffDiscount.UserName = sitem.User.Title.Description;
                        }
                        if (sitem.User.FirstName) {
                            StaffDiscount.UserName = StaffDiscount.UserName + ' ' + sitem.User.FirstName;
                        }
                        if (sitem.User.LastName) {
                            StaffDiscount.UserName = StaffDiscount.UserName + ' ' + sitem.User.LastName;
                        }
                    }
                    StaffDiscount.StaffId = sitem.UserId;
                    StaffDiscount.Text = '';
                    if (sitem.User) {
                        if (sitem.User.Title) {
                            StaffDiscount.Text = sitem.User.Title.Description;
                        }
                        if (sitem.User.FirstName) {
                            StaffDiscount.Text = StaffDiscount.Text + ' ' + sitem.User.FirstName;
                        }
                        if (sitem.User.LastName) {
                            StaffDiscount.Text = StaffDiscount.Text + ' ' + sitem.User.LastName;
                        }
                    }
                    $scope.lookup.StaffDiscount.push(StaffDiscount);
                }
            }
        };

        $scope.getStoreAssosiatedStaff = function () {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 9,
                    Value: 2
                }
                ]
            };
            var options = {
                action: 'pharmacy/StaffDiscount/GetStaffDiscounts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getStoreAssosiatedStaffCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onStaffCheck = function () {
            if (!$scope.item.StaffCheck) {
                $scope.lookup.StaffDiscount = [];
                var PleaseSelect = {};
                PleaseSelect.Id = -1;
                PleaseSelect.StaffDiscountId = -1;
                PleaseSelect.StaffDiscountTypeId = 0;
                PleaseSelect.StaffDiscountPercentage = 0;
                PleaseSelect.FacilityId = 0;
                PleaseSelect.StoreTypeId = 0;
                PleaseSelect.StoreMasterId = 0;
                PleaseSelect.UserTypeId = 0;
                PleaseSelect.UserId = 0;
                PleaseSelect.UserName = 'Please Select';
                PleaseSelect.Text = 'Please Select';
                PleaseSelect.StaffId = 0;
                $scope.lookup.StaffDiscount.push(PleaseSelect);
                $scope.item.StaffDiscountId = -1;
                $scope.item.StaffId = -1;
                if ($scope.PatientBillDetails.length > 0) {
                    for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                        if ($scope.PatientBillDetails[i].Status == 1) {
                            $scope.PatientBillDetails[i].DiscountPercentage = 0;
                            $scope.PatientBillDetails[i].DiscountAmount = 0;

                            $scope.PatientBillDetails[i].MrPrice = $scope.PatientBillDetails[i].Mrp;

                            $scope.PatientBillDetails[i].UnitPrice = parseFloat((($scope.PatientBillDetails[i].MrPrice * 100) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2));
                            $scope.PatientBillDetails[i].UnitDiscountAmount = 0;
                            $scope.PatientBillDetails[i].UnitPrice = $scope.PatientBillDetails[i].UnitPrice - parseFloat($scope.PatientBillDetails[i].UnitDiscountAmount);

                            $scope.PatientBillDetails[i].UnitGSTAmount = parseFloat((($scope.PatientBillDetails[i].UnitPrice / 100) * $scope.PatientBillDetails[i].GSTPercentage).toFixed(2));
                            $scope.PatientBillDetails[i].UnitInGstAmount = 0;
                            $scope.PatientBillDetails[i].UnitCGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                            $scope.PatientBillDetails[i].UnitSGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;

                            $scope.PatientBillDetails[i].Rate = $scope.PatientBillDetails[i].MrPrice;
                            $scope.PatientBillDetails[i].Amount = parseFloat(($scope.PatientBillDetails[i].MrPrice * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].GSTAmount = parseFloat(($scope.PatientBillDetails[i].UnitGSTAmount * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].InGstAmount = parseFloat(($scope.PatientBillDetails[i].UnitInGstAmount * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].CGstAmount = $scope.PatientBillDetails[i].GSTAmount / 2;
                            $scope.PatientBillDetails[i].SGstAmount = $scope.PatientBillDetails[i].GSTAmount / 2;
                            $scope.PatientBillDetails[i].NetAmount = parseFloat(($scope.PatientBillDetails[i].Rate * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].NetAmountBeforeGST = parseFloat(($scope.PatientBillDetails[i].NetAmount - $scope.PatientBillDetails[i].GSTAmount).toFixed(2));
                        }
                    }

                    $scope.CalculateNetAmt();
                    $scope.updateReceiptAmt();
                }
            } else {
                $scope.getStoreAssosiatedStaff();
            }
        };

        $scope.addWantList = function () {
            $scope.WantListItem.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.WantListItem.RequestedDate = utl.Formatter.getCurrentDate();
            $scope.WantListItem.ItemMasterId = $scope.WantedListData.ItemMasterId;
            $scope.WantListItem.ItemCode = $scope.WantedListData.ItemCode;
            $scope.WantListItem.ItemName = $scope.WantedListData.ItemName;
            $scope.WantListItem.StoreMasterId = $scope.currentfilter.StoreMasterId;
            $scope.WantListItem.RequestedBy = utl.Session.getCurrentUserId();
            var options = {
                action: 'pharmacy/ItemWantedList/AddItemWantedList',
                data: {
                    Data: $scope.WantListItem
                },
                type: 'post',
                onComplete: $scope.addWantItemCallback,
            };
            utl.Http.doAction(options);
        };

        $scope.addWantItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('Item Added to WantedList'));
        };

        $scope.onStaffSelected = function (selected) {
            if (selected.Id > 0) {
                $scope.item.StaffDiscountId = selected.Id;
                $scope.item.StaffDiscountPercentage = selected.StaffDiscountPercentage;
                $scope.item.StaffDiscountTypeId = selected.StaffDiscountTypeId;
                if ($scope.PatientBillDetails.length > 0) {
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.currentcontext.BillDiscount = 0;

                    for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                        if ($scope.PatientBillDetails[i].ItemMasterId > 0 &&
                            parseInt($scope.PatientBillDetails[i].Quantity) > 0 &&
                            $scope.PatientBillDetails[i].Status == 1) {
                            if ($scope.item.StaffCheck) {
                                if ($scope.PatientBillDetails[i].AllowStaffDiscount) {
                                    if ($scope.item.StaffDiscountTypeId === 2) {
                                        $scope.PatientBillDetails[i].DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        $scope.PatientBillDetails[i].DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        $scope.PatientBillDetails[i].MrPrice = $scope.PatientBillDetails[i].Mrp;
                                        $scope.PatientBillDetails[i].UnitPrice = parseFloat((($scope.PatientBillDetails[i].MrPrice * 100) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2));
                                        $scope.PatientBillDetails[i].UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * $scope.PatientBillDetails[i].UnitPrice).toFixed(2));
                                        $scope.PatientBillDetails[i].UnitPrice = $scope.PatientBillDetails[i].UnitPrice - parseFloat($scope.PatientBillDetails[i].UnitDiscountAmount);

                                        $scope.PatientBillDetails[i].UnitGSTAmount = parseFloat((($scope.PatientBillDetails[i].UnitPrice / 100) * $scope.PatientBillDetails[i].GSTPercentage).toFixed(2));
                                        $scope.PatientBillDetails[i].UnitInGstAmount = 0;
                                        $scope.PatientBillDetails[i].UnitCGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                        $scope.PatientBillDetails[i].UnitSGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;

                                        $scope.PatientBillDetails[i].Rate = $scope.PatientBillDetails[i].UnitPrice + parseFloat($scope.PatientBillDetails[i].UnitGSTAmount);
                                    } else {
                                        $scope.PatientBillDetails[i].DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        $scope.PatientBillDetails[i].DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        $scope.PatientBillDetails[i].MrPrice = $scope.PatientBillDetails[i].UnitCostPrice;
                                        $scope.PatientBillDetails[i].UnitPrice = parseFloat((($scope.PatientBillDetails[i].UnitCostPrice * 100) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2));
                                        $scope.PatientBillDetails[i].UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * $scope.PatientBillDetails[i].UnitPrice).toFixed(2));
                                        $scope.PatientBillDetails[i].UnitPrice = $scope.PatientBillDetails[i].UnitPrice - parseFloat($scope.PatientBillDetails[i].UnitDiscountAmount);

                                        $scope.PatientBillDetails[i].UnitGSTAmount = parseFloat((($scope.PatientBillDetails[i].UnitPrice / 100) * $scope.PatientBillDetails[i].GSTPercentage).toFixed(2));
                                        $scope.PatientBillDetails[i].UnitInGstAmount = 0;
                                        $scope.PatientBillDetails[i].UnitCGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                        $scope.PatientBillDetails[i].UnitSGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;

                                        $scope.PatientBillDetails[i].Rate = $scope.PatientBillDetails[i].UnitPrice + parseFloat($scope.PatientBillDetails[i].UnitGSTAmount);
                                    }
                                } else {
                                    $scope.PatientBillDetails[i].DiscountPercentage = 0;
                                    $scope.PatientBillDetails[i].DiscountAmount = 0;
                                    $scope.PatientBillDetails[i].UnitDiscountAmount = 0;
                                    $scope.PatientBillDetails[i].UnitPrice = parseFloat((($scope.PatientBillDetails[i].MrPrice * 100) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2));
                                    $scope.PatientBillDetails[i].UnitGSTAmount = parseFloat((($scope.PatientBillDetails[i].UnitPrice / 100) * $scope.PatientBillDetails[i].GSTPercentage).toFixed(2));
                                    $scope.PatientBillDetails[i].UnitInGstAmount = 0;
                                    $scope.PatientBillDetails[i].UnitCGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                    $scope.PatientBillDetails[i].UnitSGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                    $scope.PatientBillDetails[i].Rate = $scope.PatientBillDetails[i].MrPrice;
                                }
                            }
                            $scope.PatientBillDetails[i].Amount = parseFloat(($scope.PatientBillDetails[i].MrPrice * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].GSTAmount = parseFloat(($scope.PatientBillDetails[i].UnitGSTAmount * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].InGstAmount = parseFloat(($scope.PatientBillDetails[i].UnitInGstAmount * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].CGstAmount = $scope.PatientBillDetails[i].GSTAmount / 2;
                            $scope.PatientBillDetails[i].SGstAmount = $scope.PatientBillDetails[i].GSTAmount / 2;
                            $scope.PatientBillDetails[i].NetAmount = parseFloat(($scope.PatientBillDetails[i].Rate * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                            $scope.PatientBillDetails[i].NetAmountBeforeGST = parseFloat(($scope.PatientBillDetails[i].NetAmount - $scope.PatientBillDetails[i].GSTAmount).toFixed(2));
                        }
                    }

                    $scope.CalculateNetAmt();
                    $scope.updateReceiptAmt();
                }
            }
            /*
            if (selected.Id > 0) {
                if ($scope.StoreStaffDiscounts && $scope.StoreStaffDiscounts.length > 0) {
                    for (var idx in $scope.StoreStaffDiscounts) {
                        var staff = $scope.StoreStaffDiscounts[idx];
                        if (staff.UserId === selected.Id) {
                            $scope.item.StaffDiscountId = staff.Id;
                            $scope.item.StaffDiscountPercentage = staff.StaffDiscountPercentage;
                            $scope.item.StaffDiscountTypeId = staff.StaffDiscountTypeId;
                            if ($scope.PatientBillDetails.length > 0) {
                                for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                                    if ($scope.PatientBillDetails[i].ItemMasterId > 0 &&
                                        parseInt($scope.PatientBillDetails[i].Quantity) > 0 &&
                                        $scope.PatientBillDetails[i].Status == 1) {
                                        if ($scope.item.StaffCheck) {
                                            if ($scope.PatientBillDetails[i].AllowStaffDiscount) {
                                                if ($scope.item.StaffDiscountTypeId === 2) {
                                                    $scope.PatientBillDetails[i].DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                                    $scope.PatientBillDetails[i].DiscountAmount = $scope.item.StaffDiscountPercentage;

                                                    $scope.PatientBillDetails[i].UnitPrice = parseFloat((($scope.PatientBillDetails[i].MrPrice * 100) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2));
                                                    $scope.PatientBillDetails[i].UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * $scope.PatientBillDetails[i].UnitPrice).toFixed(2));
                                                    $scope.PatientBillDetails[i].UnitPrice = $scope.PatientBillDetails[i].UnitPrice - parseFloat($scope.PatientBillDetails[i].UnitDiscountAmount);

                                                    $scope.PatientBillDetails[i].UnitGSTAmount = parseFloat((($scope.PatientBillDetails[i].UnitPrice / 100) * $scope.PatientBillDetails[i].GSTPercentage).toFixed(2));
                                                    $scope.PatientBillDetails[i].UnitInGstAmount = 0;
                                                    $scope.PatientBillDetails[i].UnitCGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                                    $scope.PatientBillDetails[i].UnitSGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;

                                                    $scope.PatientBillDetails[i].Rate = $scope.PatientBillDetails[i].UnitPrice + parseFloat($scope.PatientBillDetails[i].UnitGSTAmount);
                                                } else {
                                                    $scope.PatientBillDetails[i].DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                                    $scope.PatientBillDetails[i].DiscountAmount = $scope.item.StaffDiscountPercentage;

                                                    $scope.PatientBillDetails[i].MrPrice = $scope.PatientBillDetails[i].UnitCostPrice;
                                                    $scope.PatientBillDetails[i].UnitPrice = parseFloat((($scope.PatientBillDetails[i].UnitCostPrice * 100) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2));
                                                    $scope.PatientBillDetails[i].UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * $scope.PatientBillDetails[i].UnitPrice).toFixed(2));
                                                    $scope.PatientBillDetails[i].UnitPrice = $scope.PatientBillDetails[i].UnitPrice - parseFloat($scope.PatientBillDetails[i].UnitDiscountAmount);

                                                    $scope.PatientBillDetails[i].UnitGSTAmount = parseFloat((($scope.PatientBillDetails[i].UnitPrice / 100) * $scope.PatientBillDetails[i].GSTPercentage).toFixed(2));
                                                    $scope.PatientBillDetails[i].UnitInGstAmount = 0;
                                                    $scope.PatientBillDetails[i].UnitCGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                                    $scope.PatientBillDetails[i].UnitSGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;

                                                    $scope.PatientBillDetails[i].Rate = $scope.PatientBillDetails[i].UnitPrice + parseFloat($scope.PatientBillDetails[i].UnitGSTAmount);
                                                }
                                            } else {
                                                $scope.PatientBillDetails[i].DiscountPercentage = 0;
                                                $scope.PatientBillDetails[i].DiscountAmount = 0;
                                                $scope.PatientBillDetails[i].UnitDiscountAmount = 0;
                                                $scope.PatientBillDetails[i].UnitPrice = parseFloat((($scope.PatientBillDetails[i].MrPrice * 100) / (100 + $scope.PatientBillDetails[i].GSTPercentage)).toFixed(2));
                                                $scope.PatientBillDetails[i].UnitGSTAmount = parseFloat((($scope.PatientBillDetails[i].UnitPrice / 100) * $scope.PatientBillDetails[i].GSTPercentage).toFixed(2));
                                                $scope.PatientBillDetails[i].UnitInGstAmount = 0;
                                                $scope.PatientBillDetails[i].UnitCGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                                $scope.PatientBillDetails[i].UnitSGstAmount = $scope.PatientBillDetails[i].UnitGSTAmount / 2;
                                                $scope.PatientBillDetails[i].Rate = $scope.PatientBillDetails[i].MrPrice;
                                            }
                                        }
                                        $scope.PatientBillDetails[i].Amount = parseFloat(($scope.PatientBillDetails[i].MrPrice * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                                        $scope.PatientBillDetails[i].GSTAmount = parseFloat(($scope.PatientBillDetails[i].UnitGSTAmount * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                                        $scope.PatientBillDetails[i].InGstAmount = parseFloat(($scope.PatientBillDetails[i].UnitInGstAmount * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                                        $scope.PatientBillDetails[i].CGstAmount = $scope.PatientBillDetails[i].GSTAmount / 2;
                                        $scope.PatientBillDetails[i].SGstAmount = $scope.PatientBillDetails[i].GSTAmount / 2;
                                        $scope.PatientBillDetails[i].NetAmount = parseFloat(($scope.PatientBillDetails[i].Rate * $scope.PatientBillDetails[i].Quantity).toFixed(2));
                                        $scope.PatientBillDetails[i].NetAmountBeforeGST = parseFloat(($scope.PatientBillDetails[i].NetAmount - $scope.PatientBillDetails[i].GSTAmount).toFixed(2));
                                    }
                                }

                                $scope.CalculateNetAmt();
                            }
                        }
                    }
                } else {
                    $scope.item.StaffDiscountId = 0;
                    $scope.item.StaffDiscountPercentage = 0;
                    $scope.item.StaffDiscountTypeId = 0;
                }
            } else {
                $scope.item.StaffDiscountId = 0;
                $scope.item.StaffDiscountPercentage = 0;
                $scope.item.StaffDiscountTypeId = 0;
            }
            */
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        function GetExpiryDays(ExpiryDate) {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var CurDate = new Date(TodayDate);

            var FutureDate = ExpiryDate.slice(0, 10);
            var ExpDate = new Date(FutureDate);

            var ExpiryDays = Math.round((ExpDate - CurDate) / (1000 * 60 * 60 * 24));
            return ExpiryDays;
        }

        $scope.updateReceiptAmt = function () {
            if ($scope.currentcontext.TotBalanceAmt !== 0.00) {
                if ($scope.currentcontext.id === 0 || $scope.item.PatientBillStatusId === 1) {
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.item.Received) + parseFloat($scope.currentcontext.TotBalanceAmt);
                    $scope.item.Received = $scope.currentcontext.ReceiptAmt;
                } else {
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotBalanceAmt);
                    $scope.item.Received = ($scope.currentcontext.TotNetAmount);
                }
                $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
                $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
            }
            $scope.currentcontext.TotBalanceAmt = 0.00;
        };

        $scope.clear = function () {
            $scope.SaveImdDMPrint = 0;
            $scope.isSaving = false;
            $timeout(function () {
                $state.reload();
                savehitcompleted = 0;
            }, 1000);
        };

        $scope.addPay = function () {
            utl.Modal.open('app.opbilling-form', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.editInfo = function () {
            utl.Modal.open('app.opbillinginfo-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };


        function PatientPharmacyBillPickerCallback(patientbilldata) {
            $scope.FindOldBillFlag = 1;
            $scope.currentcontext.id = patientbilldata.BillId;
            $scope.currentcontext.PharmacyBillStatusId = patientbilldata.BillStatusId;
            $scope.currentfilter.StoreMasterId = patientbilldata.StoreId;
            $scope.getBillInfoByBillId();
            $scope.PatPaymentDetails($scope.currentcontext.id);
        }

        $scope.findBill = function () {
            $scope.SaveImdDMPrint = 0;
            savehitcompleted = 0;
            utl.Modal.open('app.find-pharmacy-directsales', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: PatientPharmacyBillPickerCallback
            });
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.pendingBill = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.pending-directpharmacy-sale', {
                params: {
                    id: 0
                },
                confirmCallback: PatientPharmacyBillPickerCallback
            });
        };

        $scope.outstandingBill = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.pharmacydirectoutstandings-list', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: PatientPharmacyBillPickerCallback
            });
        };

        $scope.pendingPrescription = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.pendingprescriptions', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getpendingprescription
            });
        };

        $scope.getpendingprescription = function (pendingData) {
            if (pendingData.Id && pendingData.Id > 0) {
                $scope.item.PrescriptionId = pendingData.Id;

                var options = {
                    action: 'emr/prescription/GetPendingPrescriptions',
                    data: {
                        Id: pendingData.Id
                    },
                    type: 'post',
                    onComplete: $scope.getPendingData
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getPendingData = function (scope, data, options, hasError) {
            $scope.PrescriptionDetails = [];
            data.forEach((item, idx) => {
                var DrugDetail = {
                    Id: 0,
                    BillDateTime: utl.Formatter.getCurrentDate(),
                    ServiceId: -1,
                    ServiceCode: null,
                    ServiceName: null,
                    ItemMasterId: -1,
                    ItemCode: null,
                    ItemName: null,
                    ScheduleTypeId: 0,
                    ScheduleTypeDescription: null,
                    StoreMasterId: 0,
                    ItemTypeId: 0,
                    ServiceTypeId: 0,
                    ServiceGroupId: 0,
                    ServiceCategoryId: 0,
                    MasterName: '',
                    MasterItemId: 0,
                    EncounterId: 0,
                    PatientBillStatusId: 0,
                    MasterTypeId: 0,
                    StockSerialItemId: 0,
                    StockSerialItemRev: 0,
                    StockItemId: 0,
                    StockItemRev: 0,
                    Quantity: 0,
                    BatchQuantity: 0,
                    TotalQuantity: 0,
                    BatchId: '',
                    SelectedBatchId: '',
                    BatchDetails: [],
                    BatchDetail: {
                        Id: 0,
                        StockItemId: 0,
                        ItemMasterId: 0,
                        StoreMasterId: 0,
                        BatchId: '',
                        SelectedBatchId: '',
                        Quantity: 0,
                        ExpiryDate: null,
                        Ucp: 0,
                        Mrp: 0,
                        GSTId: 0,
                        GSTPercentage: 0,
                        InGstId: 0,
                        InGstPercentage: 0,
                        CGstId: 0,
                        CGstPercentage: 0,
                        SGstId: 0,
                        SGstPercentage: 0,
                        Rev: 0,
                        SerialDetails: null,
                        ExpiryAlert: false,
                        ExpiryStop: false,
                        ExpiryProceed: false
                    },
                    ExpiryDate: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false,
                    Ucp: 0.00,
                    Mrp: 0.00,
                    Rate: 0.00,
                    Amount: 0.00,
                    GrossAmount: 0.00,
                    GrossGSTAmount: 0.00,
                    DiscountPercentage: 0.00,
                    DiscountAmount: 0.00,
                    DoctorDiscountAmount: 0.00,
                    EducationCess: 0.00,
                    UnitGSTAmount: 0.00,
                    GSTAmount: 0.00,
                    NetAmountBeforeGST: 0.00,
                    NetAmount: 0.00,
                    GSTId: 0,
                    GSTPercentage: 0,
                    TaxCode: '',
                    DoctorId: 0,
                    DoctorName: '',
                    IsPackageItem: 0,
                    PackageId: 0,
                    PackageName: '',
                    OrderId: 0,
                    OrderDetailId: 0,
                    OrderTypeId: 0,
                    OrderDateTime: null,
                    ServiceRateCategoryId: 0,
                    ServiceRateCategoryName: '',
                    IsModified: 0,
                    IsSupplimentary: 0,
                    IsBillable: 0,
                    IsDoctorDiscount: 0,
                    IsGstDoctor: 0,
                    StartDateTime: null,
                    EndDateTime: null,
                    DiscountTypeId: 0,
                    DiscountModeId: 0,
                    DiscountAuthorizedBy: 0,
                    DoctorShare: 0,
                    ReferalShare: 0,
                    CNAmount: 0,
                    CancelReason: 0,
                    CancelledBy: 0,
                    Comments: '',
                    DepartmentId: 0,
                    GenericId: 0,
                    GenericName: null,
                    ManufacturerId: 0,
                    ManufacturerName: null,
                    UnitCostPrice: 0.00,
                    MrPrice: 0.00,
                    InGstId: 0,
                    CGstId: 0,
                    SGstId: 0,
                    InGstPercentage: 0,
                    CGstPercentage: 0,
                    SGstPercentage: 0,
                    UnitInGstAmount: 0,
                    UnitCGstAmount: 0,
                    UnitSGstAmount: 0,
                    InGstAmount: 0,
                    CGstAmount: 0,
                    SGstAmount: 0,
                    RdoDiscountMode: true,
                    RdoDiscount: true,
                    PrescriptionDetailId: 0,
                    IsThisPrescription: true,
                    tabindex: $scope.tabindexmap.detailtabindex++,
                    Status: 1
                };
                DrugDetail.ItemMasterId = item.Id;
                DrugDetail.PrescriptionDetailId = item.StorageConditionId;
                DrugDetail.StoreMasterId = $scope.currentfilter.StoreMasterId;
                DrugDetail.Quantity = item.Min;
                DrugDetail.SelectedItem = item;
                DrugDetail.SelectedItem.ItemMasterId = item.Id;
                DrugDetail.SelectedItem.StoreMasterId = $scope.currentfilter.StoreMasterId;
                $scope.PrescriptionDetails.push(DrugDetail);
            });

            $scope.item.IsPrescription = 1;

            for (var idx in $scope.PrescriptionDetails) {
                var item = $scope.PrescriptionDetails[idx];
                item.IsThisPrescription = true;
                $scope.ServiceItemChanged(idx, item);
            }
        };

        $scope.billHistory = function () {
            utl.Modal.open('app.billhistory-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.add_new = function () {
            $scope.SaveImdDMPrint = 0;
            $state.go('app.pharmacy-sales', {
                id: 0,
                poid: $scope.currentcontext.poid
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.ManualBillCallback = function (item) {
            $scope.item.ManualBillNumber = item.ManualBillNumber;
            $scope.item.ManualBillDate = item.ManualBillDate;
            $scope.item.ManualBillComments = item.ManualBillComments;
        };

        $scope.OpenManualBill = function () {
            var IsEditable = false;
            if ($scope.currentcontext.PatientBillStatusId == 1) {
                IsEditable = true;
            }
            utl.Modal.open('app.opmanualbill', {
                params: {
                    item: $scope.item,
                    patient: $scope.selectedPatient,
                    IsEditable: IsEditable
                },
                confirmCallback: $scope.ManualBillCallback
            });
        };

        $scope.originalprint = function () {
            if ($scope.printpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));

                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id,
                    Data: {
                        Reason: $scope.currentcontext.printreason,
                        EncId: $scope.item.EncounterId || 0
                    }
                };
                var options = {
                    action: 'billing/patientbills/PrintPharmacyBills',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.print = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                if ($scope.printpreferences != 1) {
                    utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));
                    return false;
                } else {
                    var inputData = {
                        Id: $scope.currentcontext.id,
                        Data: {
                            isprint: false,
                            withHeader: $scope.item.WithHeader,
                            withoutHeader: $scope.item.WithoutHeader,
                            EncId: $scope.item.EncounterId || 0
                        }
                    };
                    var actionName = 'billing/patientbills/PrintPharmacyBills';
                    if (window.printcode.toLowerCase() == 'bewell') {
                        var actionName = 'billing/patientbills/PrintPharmacyBills1';
                    }
                    var options = {
                        action: actionName,
                        data: inputData,
                        type: 'post'
                    };
                    utl.Http.doPrint(options);
                }
            }
        };

        $scope.printconsumer = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: true,
                    Reason: $scope.currentcontext.printreason,
                    EncId: $scope.item.EncounterId || 0
                }
            };
            var options = {
                action: 'billing/patientbills/PrintconsumerBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: true,
                    Reason: $scope.currentcontext.printreason,
                    EncId: $scope.item.EncounterId || 0
                }
            };
            var options = {
                action: 'billing/patientbills/PrintPharmacyBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        // $scope.backToList = function () {
        //     $state.go('app.pharmacy-sales', $scope.currentcontext.id);
        // };

        $scope.EditLineItem = function (item) {
            $scope.PatientBillDetails[item.Id].DoctorId = item.DoctorId;
            $scope.PatientBillDetails[item.Id].DiscountTypeId = item.DiscountTypeId;
        };

        $scope.deletePatientBillDetails = function (idx, item) {
            var lastIndex = 0;
            var index = 0;
            if (item.ItemMasterId != -1) {
                $scope.currentcontext.ReceiptAmt = 0;
                lastIndex = $scope.PatientBillDetails.length - 1;
                index = $scope.PatientBillDetails.indexOf(item);
                item.Status = 2;
                $scope.DeletedPatientBills.push(item);
                $scope.PatientBillDetails.splice(index, 1);
                if (lastIndex < 0 || lastIndex == idx) {
                    $scope.addNewLineItem();
                }
            } else {
                $scope.currentcontext.ReceiptAmt = 0;
                lastIndex = $scope.PatientBillDetails.length - 1;
                index = $scope.PatientBillDetails.indexOf(item);
                item.Status = 2;
                $scope.DeletedPatientBills.push(item);
                $scope.PatientBillDetails.splice(index, 1);
                if (lastIndex < 0 || lastIndex == idx) {
                    $scope.addNewLineItem();
                }
            }

            $scope.setIndexforTableIndex();
            $scope.CalculateNetAmt();
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $state.reload();
        };

        $scope.onBillDeleteConfirmed = function (deleteid) {
            var options = {
                action: 'billing/patientbills/DeletePatientBills',
                data: {
                    Id: deleteid
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.DeleteCompleteBill = function () {
            utl.Dialog.confirmDelete($scope.onBillDeleteConfirmed, $scope.currentcontext.id, 'this Bill');
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.CanShowQtyFields = false;
            $scope.currentcontext.ReceiptAmt = 0;
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {

                // $scope.patientChange();

                $scope.isSaving = true;
                $scope.outstanding = false;
                $scope.IsDue = false;
                $scope.RdoStoreMasterId = true;
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PharmacySaleTypeId = patientbills.PharmacySaleTypeId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.item.TotRndoffAmt = patientbills.RoundOffValue;
                    $scope.item.IsMultiplePayment = patientbills.IsMultiplePayment;
                    $scope.RdoStoreMasterId = true;
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.item.RefundAmount = patientbills.RefundAmount;
                    if (patientbills.PatientBillStatusId == 1) {
                        $scope.CanDelete = true;
                        $scope.canShowFinanceBtn = true;
                        $scope.canShowAdvanceBtn = true;
                    }
                    if ($scope.item.PharmacySaleTypeId == 4) {
                        $scope.currentcontext.isnewpatient = true;
                        if (patientbills.OutStandingAmount === 0) {
                            $scope.IsDue = true;
                            $scope.canShowFinanceBtn = true;
                        } else {
                            $scope.item.TotalDueAmount = patientbills.OutStandingAmount;
                            $scope.item.TotalPaidAmount = patientbills.PaidAmount;

                            $scope.canShowFinanceBtn = true;
                            $scope.canShowAdvanceBtn = true;
                        }
                        if ($scope.item.PatientBillStatusId == 3) {
                            $scope.IsDisabled = true;
                            $scope.RdoPharmacySaleType = true;
                            $scope.currentcontext.PharmacyBillStatusId = 3;
                        }

                        $scope.newPatient.PatientName = patientbills.PatientName;
                        $scope.newPatient.DoctorName = patientbills.DoctorName;
                        $scope.newPatient.Mobile = patientbills.Mobile;
                        $scope.newPatient.TitleId = patientbills.TitleId;
                        $scope.newPatient.GenderId = patientbills.GenderId;
                        $scope.newPatient.ReferralId = patientbills.ReferralId;
                        $scope.newPatient.DOB = patientbills.DOB;
                        $scope.newPatient.Age = patientbills.Age;

                        $scope.currentfilter.PatientId = patientbills.PatientId;
                        $scope.currentcontext.DiscountApprovedBy = patientbills.DiscountApprovedBy;
                        $scope.currentcontext.id = patientbills.Id;
                        $scope.currentcontext.ReceiptAmt = 0;
                        $scope.currentcontext.PaidAmt = patientbills.PaidAmount;
                        $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;
                        $scope.currentcontext.billdate = patientbills.BillDateTime;
                        $scope.currentcontext.BillDiscount = patientbills.BillDiscount;
                        $scope.currentcontext.CNAmount = patientbills.CNAmount;
                        $scope.currentcontext.ReturnedAmount = patientbills.ReturnedAmount;
                        $scope.currentcontext.DiscountModeValue = patientbills.DiscountModeValue;
                        $scope.currentfilter.DiscountModeId = patientbills.BillDiscountModeId;
                        if ($scope.currentfilter.DiscountModeId == 2) {
                            $scope.currentcontext.BillDiscount = patientbills.DiscountPercentage;
                        }
                        $scope.item.BillNumber = patientbills.BillNumber;
                        $scope.item.DepartmentId = patientbills.DepartmentId;
                        $scope.item.DoctorId = patientbills.DoctorId;
                        $scope.currentfilter.GuarantorId = patientbills.GuarantorId;
                        $scope.currentfilter.GuarantorName = patientbills.GuarantorName;
                        $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;
                        $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                        $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                        $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                        $scope.item.GuarantorDueId = patientbills.GuarantorDueId || null;
                        $scope.item.PrivateDueId = patientbills.PrivateDueId || null;
                        $scope.isSaveandApprove = true;
                    } else {
                        $scope.currentcontext.isnewpatient = false;
                        $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                        $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                        if (patientbills.OutStandingAmount === 0) {
                            $scope.IsDue = true;
                            $scope.canShowFinanceBtn = true;
                        } else {
                            $scope.canShowFinanceBtn = true;
                            $scope.canShowAdvanceBtn = true;
                        }
                        if ($scope.item.PatientBillStatusId == 3) {
                            $scope.IsDisabled = true;
                            $scope.RdoPharmacySaleType = true;
                            $scope.currentcontext.PharmacyBillStatusId = 3;
                        }

                        $scope.currentfilter.PatientId = patientbills.PatientId;
                        $scope.currentcontext.DiscountApprovedBy = patientbills.DiscountApprovedBy;
                        $scope.currentcontext.id = patientbills.Id;
                        $scope.currentcontext.ReceiptAmt = 0;
                        $scope.currentcontext.PaidAmt = patientbills.PaidAmount;
                        $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;
                        $scope.currentcontext.billdate = patientbills.BillDateTime;
                        $scope.currentcontext.BillDiscount = patientbills.BillDiscount;
                        $scope.currentcontext.CNAmount = patientbills.CNAmount;
                        $scope.currentcontext.ReturnedAmount = patientbills.ReturnedAmount;
                        $scope.currentcontext.DiscountModeValue = patientbills.DiscountModeValue;
                        $scope.currentfilter.DiscountModeId = patientbills.BillDiscountModeId;
                        if ($scope.currentfilter.DiscountModeId == 2) {
                            $scope.currentcontext.BillDiscount = patientbills.DiscountPercentage;
                        }
                        $scope.item.BillNumber = patientbills.BillNumber;
                        $scope.item.DepartmentId = patientbills.DepartmentId;
                        $scope.item.DoctorId = patientbills.DoctorId;
                        $scope.item.FacilityId = patientbills.FacilityId;
                        $scope.item.EncounterId = patientbills.EncounterId;
                        $scope.item.EncounterTypeId = patientbills.EncounterTypeId;
                        $scope.item.PatientName = patientbills.PatientName;

                        $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;

                        $scope.GuarantorTypeChange({
                            Id: patientbills.GuarantorTypeId
                        });
                        $scope.currentfilter.GuarantorId = patientbills.GuarantorId;

                        $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                        $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                        $scope.item.GuarantorDueId = patientbills.GuarantorDueId || null;
                        $scope.item.PrivateDueId = patientbills.PrivateDueId || null;
                        $scope.isSaveandApprove = true;
                    }

                    $scope.PatientBillDetails = [];
                    $scope.PatientBillDetails = patientbills.PatientBillDetails;

                    for (var saledidx in $scope.PatientBillDetails) {
                        var saleditem = $scope.PatientBillDetails[saledidx];
                        saleditem.BatchDetails = [];
                        if (saleditem.ItemMasterId > 0) {
                            // if ($scope.currentfilter.DiscountModeId == 2) {
                            // if (saleditem.DiscountPercentage) {
                            //     saleditem.DiscountAmount = saleditem.DiscountPercentage;
                            // }
                            // if (saleditem.DiscountAmount) {
                            //     saleditem.DiscountAmount = saleditem.DiscountAmount;
                            // }
                            // }
                            if (saleditem.DiscountAmount > 0) {
                                $scope.CanShowLineItemDiscount = true;
                            }
                            saleditem.SelectedBatchId = saleditem.BatchId;
                            saleditem.ExpiryProceed = true;
                            saleditem.ExpiryAlert = false;
                            saleditem.ExpiryStop = false;
                            saleditem.Ucp = 0;
                            saleditem.Mrp = saleditem.Rate;
                            saleditem.UnitCostPrice = 0;
                            saleditem.MrPrice = saleditem.Rate;
                            saleditem.UnitPrice = parseFloat(((saleditem.MrPrice * 100) / (100 + saleditem.GSTPercentage)).toFixed(2));
                            saleditem.PrescriptionDetailId = 0;
                            if (saleditem.PrescriptionDetailId > 0) {
                                saleditem.IsThisPrescription = true;
                            } else {
                                saleditem.IsThisPrescription = false;
                            }
                            saleditem.RST = '';
                            if (saleditem.RackName) {
                                saleditem.RST = saleditem.RackName;
                            }
                            if (saleditem.Shelf) {
                                saleditem.RST = saleditem.RST + ' / ' + saleditem.Shelf;
                            }
                            if (saleditem.Tray) {
                                saleditem.RST = saleditem.RST + ' / ' + saleditem.Tray;
                            }
                            if ($scope.item.PatientBillStatusId == 1) {
                                saleditem.RdoDiscountMode = false;
                                saleditem.RdoDiscount = false;
                                saleditem.RdoItemSearch = true;
                            } else {
                                saleditem.RdoDiscountMode = true;
                                saleditem.RdoDiscount = true;
                                saleditem.RdoItemSearch = true;
                            }

                            if (saleditem.ItemMaster.StockItem) {
                                if (saleditem.ItemMaster.StockItem.StockSerialItems) {
                                    saleditem.BatchDetails = saleditem.ItemMaster.StockItem.StockSerialItems;
                                    saleditem.TotalQuantity = saleditem.ItemMaster.StockItem.Quantity;
                                    saleditem.StockItemRev = saleditem.ItemMaster.StockItem.Rev;

                                    var serialitems = saleditem.BatchDetails;
                                    for (var sbid = 0; sbid < serialitems.length; sbid++) {
                                        var sbitem = serialitems[sbid];
                                        if (saleditem.BatchId == sbitem.BatchId) {
                                            saleditem.BatchQuantity = sbitem.Quantity;
                                            saleditem.StockSerialItemRev = sbitem.Rev;
                                        }
                                    }
                                } else {
                                    saleditem.BatchDetails = null;
                                }
                            } else {
                                saleditem.BatchDetails = null;
                            }
                        }

                        if (saleditem.ItemMaster) {
                            if (saleditem.ItemMaster.DrugMaster) {
                                saleditem.IsPrescribed = saleditem.ItemMaster.DrugMaster.IsEssentialDrug;
                            }
                            $scope.ItemMasterDetails = [];
                            $scope.ItemMasterDetails = saleditem.ItemMaster;
                            if ($scope.ItemMasterDetails.Id > 0) {
                                $scope.item.ProductRegNo = $scope.ItemMasterDetails.ProductRegNo;
                            }
                        }
                    }

                    $scope.PatientPaymentDetails = [];

                    $scope.setIndexforTableIndex();
                    $scope.applyVisibilityRules();
                    $scope.CalculateNetAmt();

                    $scope.currentcontext.PendingAmt = patientbills.OutStandingAmount;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.UPIRefNumber = '';
                    $scope.item.DDNumber = '';
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = '';
                });

                if ($scope.item.PatientBillStatusId <= 1) {
                    $scope.EnableDisableDropdown(false);
                } else {
                    $scope.EnableDisableDropdown($scope.isSaving);
                }
                $scope.RdoPatientId = true;
                $scope.RdoBillnumber = true;

                if ($scope.item.PatientBillStatusId == 1) {
                    $scope.addNewLineItem();
                }
            }

            if ($scope.item.BillNumber) {
                $scope.LastTransactionData = 'Bill No# / Amount :' + $scope.item.BillNumber + ' / ' + $scope.currentcontext.TotNetAmount;
            }

            if ($scope.SaveImdDMPrint == 1) {
                $scope.SaveImdDMPrint = 0;
                if ($scope.dmprintpreferences == 1) {
                    $scope.dmPrint();
                }
            }

            $scope.getStorePrintPreference();
        };

        $scope.getBillInfoByBillNumber = function () {
            var SearchBillnumber = $scope.item.BillNumber;
            if ($scope.currentcontext.id <= 0 && (SearchBillnumber && SearchBillnumber.length > 0)) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: SearchBillnumber
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getBillInfoByBillId = function () {
            var SearchBillId = $scope.currentcontext.id;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchBillId
                    },
                    {
                        Key: 29,
                        Value: $scope.currentfilter.StoreMasterId
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
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.addGuarantor = function () {
            utl.Modal.open('app.patientguarantorlist', {
                params: {
                    id: 0,
                    pid: $scope.currentfilter.PatientId,
                    parent: 'txn'
                },
                confirmCallback: $scope.loadPatientGuarantors
            });
        };

        $scope.loadPatientGuarantors = function (data) {
            $scope.currentfilter.GuarantorTypeId = data.GuarantorTypeId;
            $scope.currentfilter.GuarantorId = data.GuarantorId;
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

        $scope.setPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;
            $scope.lookup['SelectedGuarantor'] = data.PatientGuarantor;
            if (!$scope.currentfilter.GuarantorId || $scope.currentfilter.GuarantorId == -1) {
                $scope.currentfilter.GuarantorTypeId = $scope.lookup.PatientGuarantor[1].GuarantorTypeId;
                $scope.currentfilter.GuarantorId = $scope.lookup.PatientGuarantor[1].Id;
            }
        };

        $scope.setPatientGuarantors = function () {
            //Get only active guarantors - 2
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: 2
                        }, {
                            Key: 2,
                            Value: $scope.item.PatientId
                        }]
                    }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.setPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.EncounterTypeId = $scope.encounter.EncounterTypeId;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                $scope.item.DoctorName = $scope.encounter.DoctorName;
                $scope.currentfilter.DoctorId = $scope.encounter.DoctorId;
                $scope.currentfilter.DoctorName = $scope.encounter.DoctorName;
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;
                //$scope.item.TotalAvailableAmount = $scope.encounter.PaidAmount - $scope.encounter.AmountAdjusted;
            } else {
                $scope.encounter.Id = 0;
                $scope.item.EncounterId = 0;
                $scope.item.EncounterTypeId = 0;
                $scope.item.DoctorId = 0;
                $scope.item.DoctorName = '';
                $scope.currentfilter.DoctorId = 0;
                $scope.currentfilter.DoctorName = '';
                $scope.item.DepartmentId = 0;
                $scope.item.IsEncounter = true;
                //$scope.item.TotalAvailableAmount = 0;
                /* utl.Alert.showErrorMsg('No Visit Created For The Selected Patient'); */
            }
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [{
                    Key: 14,
                    Value: 1
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.PatientId
                },
                {
                    Key: 40,
                    Value: 1
                }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVisitIndentifier
            };

            utl.Http.doAction(options);
        };

        $scope.getPatientPendingPrescriptions = function () {

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.PatientId
                },
                {
                    Key: 11,
                    Value: 1
                },
                {
                    Key: 6,
                    Value: 3
                }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientPendingPrescriptionsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPatientPendingPrescriptionsCallback = function (scope, res, options, hasError) {
            $scope.item.pendingPrescriptions = res.Data.length;
        };

        $scope.getPatPaymentDetailscallback = function (scope, data, options, hasError) {
            $scope.PaymentInfoDetails = [];
            for (var pdx in data.Data) {
                var payData = data.Data[pdx];
                var TransDetails = '';
                if (payData.PaymentTypeId == 1) {
                    TransDetails = payData.PaymentType.Description;
                }
                if (payData.PaymentTypeId == 2) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    TransDetails += '/' + payData.ChequeNo;
                    var ChequeDate = $filter('date')(payData.ChequeDate, 'yyyy-MM-dd');
                    TransDetails += '/' + ChequeDate;
                }
                if (payData.PaymentTypeId == 3) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    TransDetails += '/' + payData.DDNumber;
                    var DDDate = $filter('date')(payData.DDDate, 'yyyy-MM-dd');
                    TransDetails += '/' + DDDate;
                }
                if (payData.PaymentTypeId == 4) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    TransDetails += '/' + payData.WireTransferId;
                    var WireTransferDate = $filter('date')(payData.WireTransferDate, 'yyyy-MM-dd');
                    TransDetails += '/' + WireTransferDate;
                }
                if (payData.PaymentTypeId == 5) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    // TransDetails += '/' + payData.CardType.Description;
                    TransDetails += '/' + payData.AuthorizedCode;
                }
                if (payData.PaymentTypeId == 6) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    // TransDetails += '/' + payData.CardType.Description;
                    TransDetails += '/' + payData.AuthorizedCode;
                }
                var payDetaildata = {
                    PaymentInfo: TransDetails,
                    ReceiptType: payData.ReceiptType.Description,
                    ReceiptNumber: payData.ReceiptNumber,
                    ReceiptDateTime: payData.ReceiptDateTime,
                    AmountPaid: payData.AmountPaid,
                };
                $scope.PaymentInfoDetails.push(payDetaildata);
            }
            if (data.Data.length > 0) {
                var PaymentDatas = data.Data[0];
                $scope.currentcontext.PaymentTypeId = PaymentDatas.PaymentTypeId;
                $scope.item.BankId = PaymentDatas.BankId;
                $scope.item.ChequeNo = PaymentDatas.ChequeNo;
                $scope.item.UPIRefNumber = PaymentDatas.UPIRefNumber;
                $scope.item.DDNumber = PaymentDatas.DDNumber;
                $scope.item.WireTransferId = PaymentDatas.WireTransferId;
                $scope.item.AuthorizeNumber = PaymentDatas.AuthorizedCode;
                $scope.item.ChequeDate = PaymentDatas.ChequeDate;
                $scope.item.DDDate = PaymentDatas.DDDate;
                $scope.item.WireTransferDate = PaymentDatas.WireTransferDate;
                $scope.item.CardTypeId = PaymentDatas.CardTypeId;
                $scope.item.CollectedOn = PaymentDatas.CollectedOn;
            }
        };

        $scope.PatPaymentDetails = function (billid) {
            if (billid && billid > 0) {
                var inputData = {
                    Params: [{
                        Key: 9,
                        Value: billid
                    }]
                };
                var options = {
                    action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatPaymentDetailscallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.errorItemCallback = function (data, options) {
            console.log(data);
            if (data.Error.Message) {
                var message = data.Error.Message;


                // var message = 'Stock not available for 1103:5FLUCIL 500MG INJ';
                if (message == "Error in Generating Receipt") {
                    if ($scope.currentcontext.id > 0)
                        $scope.getBillInfoByBillId();
                } else {
                    message = message.replace("Stock Changes Happened for ", "");
                    let error_items = message.split("$,$");
                    for (var idx in error_items) {
                        let item = error_items[idx];
                        let item_det = item.split(":");
                        var itemid = Number(item_det[0]);

                        $scope.PatientBillDetails.forEach(function(elem, index, array) {
                            if (elem.ItemMasterId === itemid) {
                                $scope.PatientBillDetails[index].removeEntry = true;
                            }
                            // return indexesOf12
                        });

                    }
                    console.log($scope.PatientBillDetails); //return;
                }
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;
            $scope.currentcontext.PaymentTypeId = 1;
            $scope.getBillInfoByBillId();
            $scope.PatPaymentDetails(data);
            $scope.applyVisibilityRules();
            if (options.data.Data.Header.PatientBillStatusId == 3) {
                if ($scope.printpreferences == 1) {
                    if (!options.data.Data.Header.IsMultiplePayment || options.data.Data.Header.IsMultiplePayment == false) {
                        $scope.print();
                        $scope.clear();
                    }
                }
            }
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.SaveImdDMPrint = 1;

        };

        $scope.saveDraft = function () {
            if ($scope.item.TotDiscAmount > 0 && !$scope.IsDiscountApproved) {
                utl.Alert.showErrorMsg($scope.DiscountAlert);
                return false;
            }
            if ($scope.currentcontext.TotBalanceAmt > 0 && !$scope.IsDueApproved) {
                utl.Alert.showErrorMsg($scope.DueAlert);
                return false;
            }
            if ((!$scope.item.PrivateDueId) && $scope.currentcontext.TotBalanceAmt != 0 && $scope.currentfilter.GuarantorTypeId == 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.dueapprover.lbl'));
                $scope.item.PrivateDueId = -1;
                $('#creditapprover').focus();
                return false;
            }
            $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem(1);
        };

        /* - Security IsValid */
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
        /* - Security IsValid */

        $scope.saveAndApprove = function () {
            if ($scope.item.TotDiscAmount > 0 && !$scope.IsDiscountApproved) {
                utl.Alert.showErrorMsg($scope.DiscountAlert);
                return false;
            }
            if ($scope.currentcontext.TotBalanceAmt > 0 && !$scope.IsDueApproved) {
                utl.Alert.showErrorMsg($scope.DueAlert);
                return false;
            }
            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber === null) {
                //$scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            }

            if ((!$scope.item.PrivateDueId) && $scope.currentcontext.TotBalanceAmt != 0 && $scope.currentfilter.GuarantorTypeId == 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.dueapprover.lbl'));

                $scope.item.PrivateDueId = -1;
                $('#creditapprover').focus();
                return false;
            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            if ($scope.currentcontext.TotBalanceAmt === 0) {
                $scope.item.IsPaidFully = true;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to approve this Sale?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.saveItem(3);
        };
        $scope.OnApproveConfirmed = function () {
            $scope.saveItem(3);
        };

        $scope.onCancelConfirmed = function (reason) {
            $scope.item.CancelReason = reason;
            $scope.saveItem(2);
        };

        $scope.saveBillCancelled = function () {
            $scope.saveItem(3);
        };

        $scope.updateamt = function () {
            $scope.currentcontext.ReceiptAmt = $scope.currentcontext.TotBalanceAmt;
            $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
            $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
        };

        $scope.AdjustAgainstAdvance = function () {
            $scope.openAdvanceModal($scope.currentfilter.PatientId)
        };

        $scope.openAdvanceModal = function (patientid) {
            $scope.currentcontext.TotBalanceAmt_forAdvanceAdjust = 0;
            if ($scope.currentcontext.TotBalanceAmt > 0) {
                $scope.currentcontext.TotBalanceAmt_forAdvanceAdjust = $scope.currentcontext.TotBalanceAmt;
            } else {
                $scope.currentcontext.TotBalanceAmt_forAdvanceAdjust = $scope.currentcontext.TotNetAmount;
            }
            if ($scope.currentcontext.TotBalanceAmt_forAdvanceAdjust > 0) {
                utl.Modal.open('app.adjustagainstadvance', {
                    params: {
                        id: patientid,
                        balanceamount: $scope.currentcontext.TotBalanceAmt_forAdvanceAdjust
                    },
                    confirmCallback: $scope.onAdjustConfirmed
                });
            } else {
                utl.Alert.showErrorMsg('Bill Amount must not be zero');
                return false;
            }
        };

        $scope.onAdjustConfirmed = function (AdjRecData) {
            var AdjAmount = 0;
            var PaymentAdjustmentDetail = {};
            $scope.PaymentAdjustmentDetails = [];

            for (var idx in AdjRecData.AdjustedData) {
                var adjdata = AdjRecData.AdjustedData[idx];
                if (parseFloat(adjdata.AdjustAmount) > 0) {
                    AdjAmount = AdjAmount + parseFloat(adjdata.AdjustAmount);

                    PaymentAdjustmentDetail = {
                        Id: 0,
                        ParentReceiptId: adjdata.Id,
                        PaymentAdjustNumber: null,
                        //AvailedAdvance: parseFloat(adjdata.AdjustAmount),
                        //AmountAdjusted: parseFloat(adjdata.AmountAdjusted) + parseFloat(adjdata.AdjustAmount),
                        AvailedAdvance: parseFloat(adjdata.AmountPaid) - parseFloat(adjdata.AmountAdjusted),
                        AdvanceAdjusted: parseFloat(adjdata.AdjustAmount),
                        BalanceAdvance: (parseFloat(adjdata.AmountPaid) - parseFloat(adjdata.AmountAdjusted)) - parseFloat(adjdata.AdjustAmount),
                        RoundOffValue: 0,
                        PatientId: $scope.item.PatientId,
                        PatientName: $scope.item.PatientName,
                        EncounterId: $scope.item.EncounterId,
                        EncounterTypeId: vm.Context == 'OP' ? 1 : 4,
                        PatientBillId: 0,
                        BillTypeId: 0,
                        DepartmentId: 0,
                        LocationId: 0,
                        FacilityId: 1,
                        OrganizationId: 0,
                        AdjustedById: utl.Session.getCurrentUserId(),
                        ApprovedById: utl.Session.getCurrentUserId()
                    }

                    $scope.PaymentAdjustmentDetails.push(PaymentAdjustmentDetail);
                }
            }

            $scope.currentcontext.TotBalanceAmt_forAdjust = 0;
            if ($scope.currentcontext.TotBalanceAmt > 0) {
                $scope.currentcontext.TotBalanceAmt_forAdjust = $scope.currentcontext.TotBalanceAmt;
            } else {
                $scope.currentcontext.TotBalanceAmt_forAdjust = $scope.currentcontext.TotNetAmount;
            }

            if (AdjAmount > $scope.currentcontext.TotBalanceAmt_forAdjust) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.adjustingamount.lbl'));

                AdjAmount = 0;
                PaymentAdjustmentDetail = {};
                $scope.PaymentAdjustmentDetails = [];
                return false;
            } else {
                $scope.currentcontext.ReceiptAmt = AdjAmount;
                $scope.item.Received = AdjAmount;
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.PaidAmt) - AdjAmount;
                $scope.currentcontext.PaymentTypeId = 7;
                $scope.currentcontext.IsAdjustAgainstAdvance = true;
            }
        };

        $scope.GetPatientFinanceInfo = function () {
            $scope.openFinanceInfoModal($scope.currentfilter.PatientId)
        };

        $scope.openFinanceInfoModal = function (patientid) {
            utl.Modal.open('app.patientfinanceinfo', {
                params: {
                    id: patientid
                },
                confirmCallback: $scope.onCloseConfirmed
            });
        };

        $scope.AddPaymentDetails = function () {
            if ($scope.item.IsMultiplePayment == true) {
                $scope.currentcontext.ReceiptTypeId = 2;
            }
            var PatientPaymentDetail = {
                Id: 0,
                ReceiptDateTime: utl.Formatter.getCurrentDate(),
                FacilityId: $scope.item.FacilityId,
                OrganizationId: $scope.item.OrganizationId,
                PatientId: $scope.item.PatientId,
                ReceiptTypeId: $scope.currentcontext.ReceiptTypeId,
                EncounterId: $scope.item.EncounterId,
                EncounterTypeId: $scope.item.EncounterTypeId,
                IsMultiplePayment: $scope.item.IsMultiplePayment,
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                PharmacyReceiptTypeId: $scope.item.PharmacySaleTypeId,
                PatientName: $scope.item.PatientName,
                OutStandingAmount: $scope.currentcontext.PendingAmt,
                AmountPaid: $scope.currentcontext.ReceiptAmt,
                DueAmount: $scope.currentcontext.PendingAmt - $scope.currentcontext.ReceiptAmt,
                DepartmentID: $scope.item.DepartmentId,
                PaymentcounterID: 0,
                GuarantorId: $scope.currentfilter.GuarantorId,
                GuarantorTypeId: $scope.currentfilter.GuarantorTypeId,
                ReceiptGeneratedById: $scope.item.ReceiptGeneratedById,
                ReceiptApprovedById: $scope.currentcontext.ApprovedById,
                PaymentTypeId: $scope.currentcontext.PaymentTypeId,
                DoctorId: $scope.item.DoctorId,
                ServiceId: 0,
                ServiceName: '',
                PatientBillId: null,
                CardNumber: '',
                CardDateTime: null,
                CardExpiryDate: null,
                BankId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1,
                CardTypeId: $scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ? $scope.item.CardTypeId : -1,
                TerminalNoId: $scope.item.TerminalNoId,
                CardHolderName: null,
                AuthorizeNumber: 0,
                AuthorizedCode: $scope.item.AuthorizeNumber,
                GurantorName: $scope.currentfilter.GuarantorName,
                ChequeNo: $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '',
                UPIRefNumber: $scope.currentcontext.PaymentTypeId == 11 || $scope.currentcontext.PaymentTypeId == 12 ? $scope.item.UPIRefNumber : '',
                ChequeDate: $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null,
                CollectedOn: utl.Formatter.getCurrentDate(),
                DDNumber: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null,
                DDDate: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null,
                WireTransferId: $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null,
                WireTransferDate: $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null,
                Comments: $scope.item.Remarks,
                CancelReason: null,
                ReceiptStatusId: $scope.currentcontext.ReceiptStatusId,
                TDSAmount: 0,
                Disallowance: 0,
                RoundOffValue: 0,
                CreditNoteId: 0,
                CurrencyTypeId: 0,
                PaymentStatusId: 3
            };

            if ($scope.currentcontext.id > 0) {
                PatientPaymentDetail.PatientBillId = $scope.currentcontext.id;
            }

            $scope.PatientPaymentDetails.push(PatientPaymentDetail);
        };

        $scope.saveItem = function (StatusId) {

            if (!$scope.newPatient.PatientName || $scope.newPatient.PatientName == '' || !$scope.newPatient.GenderId ||
                !$scope.newPatient.Age || $scope.newPatient.Age == '' || !$scope.newPatient.Mobile || $scope.newPatient.Mobile == '') {
                utl.Alert.showErrorMsg($translate.instant('Please Enter All required fields'));
                return;
            }

            if ($scope.currentcontext.DiscountApprovedBy > 0) {
                if (!$scope.currentfilter.GuarantorTypeId || $scope.currentfilter.GuarantorTypeId == -1) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select Discount Category'));
                    return;
                }
            }

            if ($scope.item.IsMultiplePayment == false) {
                if (savehitcompleted == 1) return false;
            }
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ||
                    $scope.currentcontext.PaymentTypeId == 11) {
                    if (!$scope.item.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                    // if (!$scope.item.CardTypeId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select CardType!...'));
                    //     return;
                    // }
                    // if (!$scope.item.TerminalNoId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select TerminalNo!...'));
                    //     return;
                    // }
                }
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizeNumber || $scope.item.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 11 || $scope.currentcontext.PaymentTypeId == 12) {
                    if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
            }

            $scope.item.PatientBillStatusId = StatusId;
            $scope.item.IsDirectDGBill = true;

            var dTotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            var dPaidAmt = parseFloat($scope.currentcontext.PaidAmt);
            var dReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);

            if ($scope.item.PatientBillStatusId == 1 && dReceiptAmt > 0) {
                $scope.currentcontext.ReceiptAmt = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.approvallevel.lbl'));

                $scope.currentcontext.ReceiptAmt = 0;
                dReceiptAmt = 0;
                $scope.CalculateNetAmt();
                return false;
            } else if (($scope.item.PatientBillStatusId == 3) && dReceiptAmt <= 0 && $scope.item.PrivateDueId <= 0 &&
                (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                if ($scope.currentfilter.DiscountModeId == 2 && parseFloat($scope.currentcontext.BillDiscount) < 100) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                } else if ($scope.currentfilter.DiscountModeId == 1 &&
                    parseFloat($scope.currentcontext.BillDiscount) < parseFloat($scope.currentcontext.TotNetAmount) &&
                    (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                }
            } else if (($scope.item.PatientBillStatusId == 3) && $scope.item.PrivateDueId <= 0 && $scope.currentcontext.TotBalanceAmt > 0 &&
                (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                if ($scope.currentfilter.DiscountModeId == 2 && parseFloat($scope.currentcontext.BillDiscount) < 100) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                } else if ($scope.currentfilter.DiscountModeId == 1 &&
                    parseFloat($scope.currentcontext.BillDiscount) < parseFloat($scope.currentcontext.TotNetAmount) &&
                    (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                }
            }

            if (!$scope.PatientBillDetails || $scope.PatientBillDetails.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

                $('#pid').focus();
                return false;
            } else {
                var ItemCount = 0;
                var ItemCheck = 0;
                var CheckExpiry = 0;
                var ItemName = null;
                if ($scope.PatientBillDetails.length === 1) {
                    for (var idx1 in $scope.PatientBillDetails) {
                        var item1 = $scope.PatientBillDetails[idx1];
                        if (item1 && item1.ItemMasterId < 0) {
                            ItemCount = 1;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && item1.Quantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else if (item1.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    for (var idx in $scope.PatientBillDetails) {
                        var item = $scope.PatientBillDetails[idx];
                        if (item && item.ItemMasterId >= 0 && item.Quantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item.ItemName;
                            break;
                        } else if (item.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                }

                if ($scope.currentcontext.DiscountModeValue > 0) {
                    $scope.item.GSTAmount = 0;
                    $scope.item.InGstAmount = 0;
                    $scope.item.CGstAmount = 0;
                    $scope.item.SGstAmount = 0;
                    var billingitem = null;
                    var itemwiseGstAmt = 0;
                    var itemwiseInGstAmt = 0;
                    var itemwiseCGstAmt = 0;
                    var itemwiseSGstAmt = 0;
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        for (var per = 0, perlen = $scope.PatientBillDetails.length; per < perlen; per++) {
                            billingitem = $scope.PatientBillDetails[per];
                            if (billingitem.ItemMasterId > 0) {
                                if ($scope.PatientBillDetails[per].DiscountAmount == 0) {
                                    $scope.PatientBillDetails[per].DiscountModeId = $scope.currentfilter.DiscountModeId;
                                    $scope.PatientBillDetails[per].DiscountPercentage = 0;
                                    $scope.PatientBillDetails[per].UnitProportionateDiscount = parseFloat(($scope.currentcontext.DiscountModeValue / 100 * $scope.PatientBillDetails[per].Rate));
                                    $scope.PatientBillDetails[per].ProportionateDiscount = parseFloat(($scope.currentcontext.DiscountModeValue / 100 * $scope.PatientBillDetails[per].Amount));

                                    var RateAfterDiscount = parseFloat($scope.PatientBillDetails[per].Amount) - parseFloat($scope.PatientBillDetails[per].ProportionateDiscount);
                                    var UnitPriceAfterDiscount = parseFloat($scope.PatientBillDetails[per].Rate) - parseFloat($scope.PatientBillDetails[per].UnitProportionateDiscount);

                                    $scope.PatientBillDetails[per].UnitGSTAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].GSTPercentage).toFixed(2));
                                    $scope.PatientBillDetails[per].UnitInGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].InGstPercentage).toFixed(2));
                                    $scope.PatientBillDetails[per].UnitCGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].CGstPercentage).toFixed(2));
                                    $scope.PatientBillDetails[per].UnitSGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].SGstPercentage).toFixed(2));

                                    $scope.PatientBillDetails[per].GSTAmount = parseFloat(($scope.PatientBillDetails[per].UnitGSTAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));
                                    $scope.PatientBillDetails[per].InGstAmount = parseFloat(($scope.PatientBillDetails[per].UnitInGstAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));
                                    $scope.PatientBillDetails[per].CGstAmount = parseFloat(($scope.PatientBillDetails[per].UnitCGstAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));
                                    $scope.PatientBillDetails[per].SGstAmount = parseFloat(($scope.PatientBillDetails[per].UnitSGstAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));

                                    $scope.PatientBillDetails[per].NetAmount = parseFloat((parseFloat(UnitPriceAfterDiscount) * parseInt($scope.PatientBillDetails[per].Quantity)).toFixed(2));
                                    $scope.PatientBillDetails[per].NetAmountBeforeGST = parseFloat(($scope.PatientBillDetails[per].NetAmount - $scope.PatientBillDetails[per].GSTAmount).toFixed(2));
                                    itemwiseInGstAmt += $scope.PatientBillDetails[per].InGstAmount || 0;
                                    itemwiseCGstAmt = parseFloat(($scope.PatientBillDetails[per].NetAmount * $scope.PatientBillDetails[per].CGstPercentage) / parseFloat(100 + $scope.PatientBillDetails[per].GSTPercentage)).toFixed(2);
                                    itemwiseSGstAmt = parseFloat(($scope.PatientBillDetails[per].NetAmount * $scope.PatientBillDetails[per].SGstPercentage) / (100 + $scope.PatientBillDetails[per].GSTPercentage)).toFixed(2);
                                    itemwiseGstAmt = parseFloat(itemwiseCGstAmt) + parseFloat(itemwiseSGstAmt);

                                    $scope.item.GSTAmount += parseFloat(itemwiseGstAmt);
                                    $scope.item.InGstAmount += parseFloat(itemwiseInGstAmt);
                                    $scope.item.CGstAmount += parseFloat(itemwiseCGstAmt);
                                    $scope.item.SGstAmount += parseFloat(itemwiseSGstAmt);
                                } else {
                                    $scope.PatientBillDetails[per].DiscountModeId = $scope.currentfilter.DiscountModeId;
                                    $scope.PatientBillDetails[per].DiscountPercentage = 0;
                                    $scope.PatientBillDetails[per].UnitProportionateDiscount = parseFloat(($scope.PatientBillDetails[per].DiscountAmount / 100 * $scope.PatientBillDetails[per].Rate));
                                    $scope.PatientBillDetails[per].ProportionateDiscount = parseFloat(($scope.PatientBillDetails[per].DiscountAmount / 100 * $scope.PatientBillDetails[per].Amount));

                                    var RateAfterDiscount = parseFloat($scope.PatientBillDetails[per].Amount) - parseFloat($scope.PatientBillDetails[per].ProportionateDiscount);
                                    var UnitPriceAfterDiscount = parseFloat($scope.PatientBillDetails[per].Rate) - parseFloat($scope.PatientBillDetails[per].UnitProportionateDiscount);

                                    $scope.PatientBillDetails[per].UnitGSTAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].GSTPercentage).toFixed(2));
                                    $scope.PatientBillDetails[per].UnitInGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].InGstPercentage).toFixed(2));
                                    $scope.PatientBillDetails[per].UnitCGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].CGstPercentage).toFixed(2));
                                    $scope.PatientBillDetails[per].UnitSGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[per].SGstPercentage).toFixed(2));

                                    $scope.PatientBillDetails[per].GSTAmount = parseFloat(($scope.PatientBillDetails[per].UnitGSTAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));
                                    $scope.PatientBillDetails[per].InGstAmount = parseFloat(($scope.PatientBillDetails[per].UnitInGstAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));
                                    $scope.PatientBillDetails[per].CGstAmount = parseFloat(($scope.PatientBillDetails[per].UnitCGstAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));
                                    $scope.PatientBillDetails[per].SGstAmount = parseFloat(($scope.PatientBillDetails[per].UnitSGstAmount * $scope.PatientBillDetails[per].Quantity).toFixed(2));

                                    $scope.PatientBillDetails[per].NetAmount = parseFloat((parseFloat(UnitPriceAfterDiscount) * parseInt($scope.PatientBillDetails[per].Quantity)).toFixed(2));
                                    $scope.PatientBillDetails[per].NetAmountBeforeGST = parseFloat(($scope.PatientBillDetails[per].NetAmount - $scope.PatientBillDetails[per].GSTAmount).toFixed(2));
                                    itemwiseInGstAmt += $scope.PatientBillDetails[per].InGstAmount || 0;
                                    itemwiseCGstAmt = parseFloat($scope.PatientBillDetails[per].NetAmount * parseFloat($scope.PatientBillDetails[per].CGstPercentage)) / (100 + $scope.PatientBillDetails[per].GSTPercentage);
                                    itemwiseSGstAmt = parseFloat($scope.PatientBillDetails[per].NetAmount * parseFloat($scope.PatientBillDetails[per].SGstPercentage)) / (100 + $scope.PatientBillDetails[per].GSTPercentage)
                                    itemwiseGstAmt = parseFloat(itemwiseCGstAmt) + parseFloat(itemwiseSGstAmt);

                                    $scope.item.GSTAmount += parseFloat(itemwiseGstAmt);
                                    $scope.item.InGstAmount += parseFloat(itemwiseInGstAmt);
                                    $scope.item.CGstAmount += parseFloat(itemwiseCGstAmt);
                                    $scope.item.SGstAmount += parseFloat(itemwiseSGstAmt);
                                }
                            }
                        }

                    } else if ($scope.currentfilter.DiscountModeId == 1) {
                        $scope.currentcontext.DiscountAmount = $scope.currentcontext.DiscountModeValue;
                        for (var inr = 0, inrlen = $scope.PatientBillDetails.length; inr < inrlen; inr++) {
                            billingitem = $scope.PatientBillDetails[inr];
                            if (billingitem.ItemMasterId > 0) {
                                var linepercentage = (100 / $scope.item.GrossAmount) * $scope.PatientBillDetails[inr].Amount;
                                var netdiscountrupees = $scope.currentcontext.DiscountAmount / 100 * linepercentage;
                                $scope.PatientBillDetails[inr].DiscountModeId = $scope.currentfilter.DiscountModeId;
                                $scope.PatientBillDetails[inr].DiscountPercentage = 0;
                                $scope.PatientBillDetails[inr].ProportionateDiscount = parseFloat((netdiscountrupees).toFixed(2));
                                $scope.PatientBillDetails[inr].UnitProportionateDiscount = parseFloat(($scope.PatientBillDetails[inr].ProportionateDiscount / $scope.PatientBillDetails[inr].Quantity).toFixed(2));

                                var UnitPriceAfterDiscount = parseFloat($scope.PatientBillDetails[inr].Rate) - parseFloat($scope.PatientBillDetails[inr].UnitProportionateDiscount);
                                var RateAfterDiscount = parseFloat(((parseFloat(UnitPriceAfterDiscount)) * (parseFloat($scope.PatientBillDetails[inr].Quantity))).toFixed(2));

                                $scope.PatientBillDetails[inr].UnitGSTAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[inr].GSTPercentage).toFixed(2));
                                $scope.PatientBillDetails[inr].UnitInGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[inr].InGstPercentage).toFixed(2));
                                $scope.PatientBillDetails[inr].UnitCGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[inr].CGstPercentage).toFixed(2));
                                $scope.PatientBillDetails[inr].UnitSGstAmount = parseFloat(((UnitPriceAfterDiscount / 100) * $scope.PatientBillDetails[inr].SGstPercentage).toFixed(2));

                                $scope.PatientBillDetails[inr].GSTAmount = parseFloat(($scope.PatientBillDetails[inr].UnitGSTAmount * $scope.PatientBillDetails[inr].Quantity).toFixed(2));
                                $scope.PatientBillDetails[inr].InGstAmount = parseFloat(($scope.PatientBillDetails[inr].UnitInGstAmount * $scope.PatientBillDetails[inr].Quantity).toFixed(2));
                                $scope.PatientBillDetails[inr].CGstAmount = parseFloat(($scope.PatientBillDetails[inr].UnitCGstAmount * $scope.PatientBillDetails[inr].Quantity).toFixed(2));
                                $scope.PatientBillDetails[inr].SGstAmount = parseFloat(($scope.PatientBillDetails[inr].UnitSGstAmount * $scope.PatientBillDetails[inr].Quantity).toFixed(2));

                                $scope.PatientBillDetails[inr].NetAmount = parseFloat((parseFloat(RateAfterDiscount)).toFixed(2));
                                $scope.PatientBillDetails[inr].NetAmountBeforeGST = parseFloat(($scope.PatientBillDetails[inr].NetAmount - $scope.PatientBillDetails[inr].GSTAmount).toFixed(2));
                                itemwiseInGstAmt += $scope.PatientBillDetails[inr].InGstAmount;
                                itemwiseCGstAmt = parseFloat(($scope.PatientBillDetails[inr].NetAmount * $scope.PatientBillDetails[inr].CGstPercentage) / (100 + $scope.PatientBillDetails[inr].GSTPercentage)).toFixed(2);
                                itemwiseSGstAmt = parseFloat(($scope.PatientBillDetails[inr].NetAmount * $scope.PatientBillDetails[inr].SGstPercentage) / (100 + $scope.PatientBillDetails[inr].GSTPercentage)).toFixed(2);
                                itemwiseGstAmt = parseFloat(itemwiseCGstAmt) + parseFloat(itemwiseSGstAmt);
                            }
                        }
                        $scope.item.GSTAmount += parseFloat(itemwiseGstAmt);
                        $scope.item.InGstAmount += parseFloat(itemwiseInGstAmt);
                        $scope.item.CGstAmount += parseFloat(itemwiseCGstAmt);
                        $scope.item.SGstAmount += parseFloat(itemwiseSGstAmt);
                    }
                } else {
                    for (var disidx in $scope.PatientBillDetails) {
                        var disitem = $scope.PatientBillDetails[disidx];
                        if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                            if (disitem.DiscountPercentage > 0 || disitem.DiscountAmount > 0) {
                                disitem.DiscountAmount = disitem.DiscountPercentage / 100 * disitem.Amount;
                                disitem.UnitDiscountAmount = disitem.DiscountAmount / parseInt(disitem.Quantity);
                            } else {
                                disitem.UnitDiscountAmount = 0;
                            }
                        }
                        if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                            if (disitem.DiscountPercentage > 0 || disitem.DiscountAmount > 0) {
                                disitem.UnitDiscountAmount = parseFloat(disitem.DiscountAmount) / parseInt(disitem.Quantity);
                            } else {
                                disitem.UnitDiscountAmount = 0;
                            }
                        }
                    }
                }

                if (ItemCount == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

                    return false;
                }

                if (ItemCheck == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.qtyalert.lbl') + ItemName);

                    return false;
                }
                /*
                if (CheckExpiry == 1) {
                    utl.Alert.showErrorMsg('Expiry Alert for ' + ItemName);
                    return false;
                }
                */
            }



            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.NetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            $scope.item.BillTypeId = 4;
            $scope.item.BillPriorityId = 1;
            $scope.item.BillAmount = $scope.item.GrossAmount;
            $scope.item.BillDiscount = $scope.item.TotDiscAmount;
            $scope.item.DiscountPercentage = $scope.item.DiscountPercentage;
            $scope.item.BillDiscountTypeId = $scope.currentcontext.BillDiscountTypeId;
            $scope.item.DiscountApprovedBy = $scope.currentcontext.DiscountApprovedBy;
            $scope.item.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
            $scope.item.DiscountModeValue = $scope.currentcontext.DiscountModeValue;
            $scope.item.PharmacyBillStatusId = $scope.currentcontext.PharmacyBillStatusId;
            $scope.item.RoundOffValue = $scope.item.TotRndoffAmt;
            $scope.item.BilledCounter = 0;
            if ($scope.item.PatientBillStatusId == 3)
                $scope.item.PaidAmount = dPaidAmt + dReceiptAmt;
            else
                $scope.item.PaidAmount = 0;
            $scope.item.OutStandingAmount = (dTotNetAmount - (dPaidAmt + dReceiptAmt));
            if ($scope.item.OutStandingAmount === 0)
                $scope.item.IsPaidFully = 1;
            else
                $scope.item.IsPaidFully = 0;
            $scope.item.ServiceTax = 0;
            $scope.item.EducationCess = 0;
            $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();
            $scope.item.IsIntermediateBill = 0;
            $scope.item.ParentBillId = 0;
            $scope.item.IsPackageBill = 0;
            $scope.item.PackageDiscount = 0;
            $scope.item.OrganizationId = 0;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.DepartmentId = $scope.item.DepartmentId;
            $scope.item.StoreMasterId = $scope.currentfilter.StoreMasterId;
            $scope.item.StoreTypeId = $scope.currentfilter.StoreTypeId;
            $scope.item.StoreSubTypeId = $scope.currentfilter.StoreSubTypeId;
            $scope.item.SequenceOptionId = $scope.currentfilter.SequenceOptionId;
            if ($scope.item.PharmacySaleTypeId === 4) {
                $scope.item.PatientId = 0;
                $scope.item.PatientName = $scope.newPatient.PatientName;
                $scope.item.TitleId = $scope.newPatient.TitleId;
                $scope.item.Age = $scope.newPatient.Age;
                $scope.item.DOB = $scope.newPatient.DOB;
                $scope.item.GenderId = $scope.newPatient.GenderId;
                $scope.item.Mobile = $scope.newPatient.Mobile;
                $scope.item.ReferralId = $scope.newPatient.ReferralId;
                // $scope.item.PatientTypeId = 0;
                $scope.item.EncounterId = 0;
                $scope.item.EncounterTypeId = 0;
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            } else {
                $scope.item.PatientId = $scope.currentfilter.PatientId;
                // $scope.item.PatientTypeId = 0;
                if ($scope.item.IsEncounter) {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.EncounterTypeId = $scope.encounter.EncounterTypeId;
                }
            }

            // if (!$scope.item.DoctorId) {
            //     utl.Alert.showErrorMsg('Again Select the Doctor Name...');
            //     return false;
            // }

            $scope.item.GuarantorId = $scope.currentfilter.GuarantorId;
            $scope.item.GuarantorTypeId = $scope.currentfilter.GuarantorTypeId;
            $scope.item.GuarantorName = $scope.currentfilter.GuarantorName;
            $scope.item.ServiceRateCategoryId = 0;
            $scope.item.ServiceRateCategoryName = '';
            $scope.item.TpaId = 0;
            $scope.item.RateCategoryId = 0;
            $scope.item.DoctorId = $scope.item.DoctorId;
            $scope.item.DoctorName = $scope.item.DoctorName;
            if (!$scope.item.ReferralId) {
                $scope.item.ReferralId = 0;
            }
            $scope.item.ReferralName = '';
            $scope.item.CancelReason = '';
            if ($scope.item.CancelReason)
                $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            else
                $scope.item.CancelledBy = 0;
            $scope.item.Comments = $scope.item.Comments || '';
            $scope.item.ToBeRefunded = 0;
            $scope.item.CNAmount = 0;
            $scope.item.FSTypeId = 0;
            $scope.item.ReceiptGeneratedById = utl.Session.getCurrentUserId();

            if (parseFloat($scope.currentcontext.ReceiptAmt) > 0 && $scope.item.PatientBillStatusId == 3) {
                var billitem = null;
                var totalbillpayment = 0;
                totalbillpayment = parseFloat($scope.currentcontext.PaidAmt) + parseFloat($scope.currentcontext.ReceiptAmt);
                for (var pay = 0, paylen = $scope.PatientBillDetails.length; pay < paylen; pay++) {
                    billitem = $scope.PatientBillDetails[pay];
                    var linenetamount = billitem.Amount || 0;
                    var linediscountamount = billitem.DiscountAmount || 0;
                    var lineproportionatediscountamount = billitem.ProportionateDiscount || 0;
                    var actuallinenetamount = 0;
                    if (billitem.DiscountModeId == 1) {
                        actuallinenetamount = linenetamount - parseFloat(linediscountamount);
                    }
                    if (billitem.DiscountModeId == 2) {
                        actuallinenetamount = linenetamount - (lineproportionatediscountamount);
                    }
                    if (!billitem.DiscountModeId || billitem.DiscountModeId == -1) {
                        actuallinenetamount = linenetamount;
                    }
                    //var actuallinenetamount = $scope.PatientBillDetails[pay].NetAmount - ($scope.PatientBillDetails[pay].DiscountAmount + $scope.PatientBillDetails[pay].ProportionateDiscount);
                    var linepercentage = (100 / parseFloat($scope.currentcontext.TotNetAmount)) * actuallinenetamount;
                    var netpaidrupees = totalbillpayment / 100 * linepercentage;
                    $scope.PatientBillDetails[pay].ReceivedAmount = parseFloat(netpaidrupees).toFixed(2);
                }
            }

            if (!$scope.PatientPaymentDetails || $scope.PatientPaymentDetails.length === 0) {
                if ($scope.currentcontext.ReceiptAmt > 0) {
                    $scope.currentcontext.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                    if ($scope.currentcontext.id > 0 && $scope.currentcontext.PaidAmt >= 0) {
                        $scope.currentcontext.ReceiptTypeId = 3;
                    } else {
                        $scope.currentcontext.ReceiptTypeId = 2;
                    }
                    $scope.currentcontext.ReceiptStatusId = 1;

                    $scope.AddPaymentDetails();
                }
            } else {
                if ($scope.currentcontext.ReceiptAmt > 0) {
                    if ($scope.PatientPaymentDetails && $scope.PatientPaymentDetails.length > 0) {
                        for (var pi = 0, len = $scope.PatientPaymentDetails.length; pi < len; pi++) {
                            if ($scope.PatientPaymentDetails[pi].Id == 0 && $scope.PatientPaymentDetails[pi].ReceiptTypeId == 2 && $scope.PatientPaymentDetails[pi].ReceiptStatusId == 1) {
                                $scope.PatientPaymentDetails[pi].AmountPaid = $scope.currentcontext.ReceiptAmt;
                            }
                        }
                    }
                }
            }

            if (checkMandatoryFields()) {
                var pharmacyitemlines = getLinesForSave();
                //var pharmacyclaimlines = getClaimLinesForSave();
                //var pharmacynonclaimlines = getNonClaimLinesForSave();

                /*
                var paymentlines = [];
                if (!$scope.currentcontext.IsAdjustAgainstAdvance) {
                    paymentlines = getpaymentsLinesForSave();
                }

                var adjustments = [];
                if ($scope.currentcontext.IsAdjustAgainstAdvance) {
                    adjustments = $scope.PaymentAdjustmentDetails;
                }
                */


                // if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                //     var itemwiseNetAmt = 0;
                //     for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                //         if ($scope.PatientBillDetails[i].Status == 1) {
                //             var itemnetAmount = 0;
                //             itemnetAmount = isNaN(parseFloat($scope.PatientBillDetails[i].FreeNetAmount)) ?
                //                 0 : parseFloat($scope.PatientBillDetails[i].FreeNetAmount);
                //             itemwiseNetAmt += itemnetAmount;
                //         }
                //     }
                //     $scope.item.FreeBillAmount = itemwiseNetAmt;
                //     $scope.item.BillAmount = 0;
                //     $scope.item.PaidAmount = 0;
                // }

                var paymentlines = getpaymentsLinesForSave();
                var adjustments = $scope.PaymentAdjustmentDetails;

                var actionName = 'billing/patientbills/AddPatientPharmacyBills';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientbills/UpdatePatientPharmacyBills';
                }

                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: pharmacyitemlines,
                    //ClaimDetails: pharmacyclaimlines,
                    paymentDetail: paymentlines,
                    adjustmentDetail: adjustments
                };
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: $scope.errorItemCallback
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
                if (item.ItemMasterId) {
                    if (item.ItemMasterId != -1 && (item.Quantity <= 0 || !item.BatchId)) {
                        utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                        return false;
                    }
                }
                if (!item.DoctorId) {
                    item.DoctorId = $scope.item.DoctorId;
                }
            }
            return true;
        }

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
            for (var piidx in $scope.PatientBillDetails) {
                var pharmacyitem = $scope.PatientBillDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseInt(pharmacyitem.Quantity) > 0) {
                    //pharmacyitem.BillDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ServiceId = pharmacyitem.ItemMasterId || 0;
                    pharmacyitem.ServiceCode = pharmacyitem.ItemCode;
                    pharmacyitem.ServiceName = pharmacyitem.ItemName;
                    pharmacyitem.ServiceTypeId = pharmacyitem.ServiceTypeId || 0;
                    pharmacyitem.ServiceGroupId = pharmacyitem.ServiceGroupId || 0;
                    pharmacyitem.ServiceCategoryId = pharmacyitem.ServiceCategoryId || 0;
                    pharmacyitem.MasterName = pharmacyitem.MasterName;
                    pharmacyitem.MasterItemId = pharmacyitem.MasterItemId || 0;
                    pharmacyitem.EncounterId = $scope.item.EncounterId;
                    pharmacyitem.PatientBillStatusId = $scope.item.PatientBillStatusId;
                    pharmacyitem.MasterTypeId = pharmacyitem.MasterTypeId || 0;
                    pharmacyitem.Quantity = parseInt(pharmacyitem.Quantity);
                    pharmacyitem.StockItemId = pharmacyitem.StockItemId;
                    pharmacyitem.StockSerialItemId = pharmacyitem.StockSerialItemId;
                    pharmacyitem.BatchId = pharmacyitem.BatchId;
                    pharmacyitem.ExpiryDate = pharmacyitem.ExpiryDate;
                    pharmacyitem.Rate = pharmacyitem.MrPrice;
                    pharmacyitem.Amount = pharmacyitem.Amount;
                    pharmacyitem.GrossAmount = pharmacyitem.Amount;
                    pharmacyitem.GrossGSTAmount = pharmacyitem.GrossGSTAmount;
                    pharmacyitem.DiscountAmount = pharmacyitem.DiscountAmount;
                    pharmacyitem.DoctorDiscountAmount = pharmacyitem.DoctorDiscountAmount;
                    pharmacyitem.EducationCess = pharmacyitem.EducationCess;
                    pharmacyitem.NetAmount = pharmacyitem.NetAmount;
                    pharmacyitem.GSTId = pharmacyitem.GSTId;
                    pharmacyitem.GSTPercentage = pharmacyitem.GSTPercentage;
                    // pharmacyitem.GSTAmount = pharmacyitem.GSTAmount;
                    // pharmacyitem.UnitGSTAmount = pharmacyitem.UnitGSTAmount;
                    pharmacyitem.TaxCode = pharmacyitem.TaxCode;
                    pharmacyitem.InGstId = pharmacyitem.InGstId;
                    pharmacyitem.InGstPercentage = pharmacyitem.InGstPercentage;
                    pharmacyitem.InGstAmount = pharmacyitem.InGstAmount;
                    pharmacyitem.UnitInGstAmount = pharmacyitem.UnitInGstAmount;
                    pharmacyitem.CGstId = pharmacyitem.CGstId;
                    pharmacyitem.CGstPercentage = pharmacyitem.CGstPercentage;
                    pharmacyitem.CGstAmount = parseFloat((pharmacyitem.NetAmount * pharmacyitem.CGstPercentage) / (100 + pharmacyitem.GSTPercentage)).toFixed(2);
                    pharmacyitem.UnitCGstAmount = parseFloat(pharmacyitem.CGstAmount / pharmacyitem.Quantity).toFixed(2);
                    pharmacyitem.SGstId = pharmacyitem.SGstId;
                    pharmacyitem.SGstPercentage = pharmacyitem.SGstPercentage;
                    pharmacyitem.SGstAmount = parseFloat((pharmacyitem.NetAmount * pharmacyitem.SGstPercentage) / (100 + pharmacyitem.GSTPercentage)).toFixed(2);;
                    pharmacyitem.UnitSGstAmount = parseFloat(pharmacyitem.SGstAmount / pharmacyitem.Quantity).toFixed(2);
                    pharmacyitem.NetAmountBeforeGST = parseFloat(pharmacyitem.NetAmount - (parseFloat(pharmacyitem.CGstAmount) + parseFloat(pharmacyitem.SGstAmount))).toFixed(2);
                    pharmacyitem.GSTAmount = parseFloat(pharmacyitem.CGstAmount) + parseFloat(pharmacyitem.SGstAmount);
                    pharmacyitem.UnitGSTAmount = parseFloat(pharmacyitem.UnitCGstAmount) + parseFloat(pharmacyitem.UnitSGstAmount);
                    pharmacyitem.DoctorId = $scope.item.DoctorId;
                    pharmacyitem.DoctorName = $scope.item.DoctorName;
                    pharmacyitem.IsPackageItem = 0;
                    pharmacyitem.PackageId = 0;
                    pharmacyitem.PackageName = '';
                    pharmacyitem.OrderId = 0;
                    pharmacyitem.OrderDetailId = 0;
                    pharmacyitem.OrderTypeId = 0;
                    pharmacyitem.OrderDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ServiceRateCategoryId = 0;
                    pharmacyitem.ServiceRateCategoryName = '';
                    pharmacyitem.IsModified = 0;
                    pharmacyitem.IsSupplimentary = 0;
                    pharmacyitem.IsBillable = 0;
                    pharmacyitem.IsDoctorDiscount = 0;
                    pharmacyitem.IsGstDoctor = 0;
                    pharmacyitem.StartDateTime = null;
                    pharmacyitem.EndDateTime = null;
                    pharmacyitem.DiscountTypeId = pharmacyitem.DiscountTypeId;
                    pharmacyitem.DiscountModeId = $scope.currentfilter.DiscountModeId;
                    pharmacyitem.DiscountAuthorizedBy = $scope.currentcontext.DiscountApprovedBy;
                    pharmacyitem.DoctorShare = 0;
                    pharmacyitem.ReferalShare = 0;
                    pharmacyitem.CNAmount = 0;
                    pharmacyitem.CancelReason = 0;
                    pharmacyitem.CancelledBy = 0;
                    pharmacyitem.ItemMasterId = pharmacyitem.ItemMasterId;
                    pharmacyitem.GenericName = pharmacyitem.GenericName;
                    pharmacyitem.IsNonClaimable = pharmacyitem.IsNonClaimable;
                    pharmacyitem.ItemCode = pharmacyitem.ItemCode;
                    pharmacyitem.ItemName = pharmacyitem.ItemName;
                    pharmacyitem.ScheduleTypeId = pharmacyitem.ScheduleTypeId;
                    pharmacyitem.ScheduleTypeDescription = pharmacyitem.ScheduleTypeDescription;
                    pharmacyitem.StoreMasterId = $scope.currentfilter.StoreMasterId;
                    pharmacyitem.Comments = '';
                    pharmacyitem.DepartmentId = $scope.item.DepartmentId;
                    pharmacyitem.IsPharmacySale = 1;
                    pharmacyitem.PharmacySaleTypeId = $scope.item.PharmacySaleTypeId;
                    pharmacyitem.IsMultiUse = pharmacyitem.IsMultiUse;
                    pharmacyitem.NoOfTransactions = pharmacyitem.NoOfTransactions;
                    pharmacyitem.TotalTransactions = pharmacyitem.TotalTransactions;
                    pharmacyitem.ConsumedTransactions = pharmacyitem.ConsumedTransactions;
                    pharmacyitem.PendingTransactions = pharmacyitem.PendingTransactions;
                    pharmacyitem.ItemPossibleTransactions = pharmacyitem.ItemPossibleTransactions;
                    pharmacyitem.ConsumedPerTransactions = pharmacyitem.ConsumedPerTransactions;
                    result.push(pharmacyitem);
                }
            }
            for (var idx in $scope.DeletedPatientBills) {
                var item = $scope.DeletedPatientBills[idx];
                if (item.Id > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function getClaimLinesForSave() {
            var result = [];
            for (var piidx in $scope.PatientBillDetails) {
                var pharmacyitem = $scope.PatientBillDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseInt(pharmacyitem.Quantity) > 0 && !pharmacyitem.IsNonClaimable) {
                    pharmacyitem.ServiceId = pharmacyitem.ItemMasterId || 0;
                    pharmacyitem.ServiceCode = pharmacyitem.ItemCode;
                    pharmacyitem.ServiceName = pharmacyitem.ItemName;
                    pharmacyitem.ServiceTypeId = pharmacyitem.ServiceTypeId || 0;
                    pharmacyitem.ServiceGroupId = pharmacyitem.ServiceGroupId || 0;
                    pharmacyitem.ServiceCategoryId = pharmacyitem.ServiceCategoryId || 0;
                    pharmacyitem.MasterName = pharmacyitem.MasterName;
                    pharmacyitem.MasterItemId = pharmacyitem.MasterItemId || 0;
                    pharmacyitem.EncounterId = $scope.item.EncounterId;
                    pharmacyitem.PatientBillStatusId = $scope.item.PatientBillStatusId;
                    pharmacyitem.MasterTypeId = pharmacyitem.MasterTypeId || 0;
                    pharmacyitem.Quantity = parseInt(pharmacyitem.Quantity);
                    pharmacyitem.StockItemId = pharmacyitem.StockItemId;
                    pharmacyitem.StockSerialItemId = pharmacyitem.StockSerialItemId;
                    pharmacyitem.BatchId = pharmacyitem.BatchId;
                    pharmacyitem.ExpiryDate = pharmacyitem.ExpiryDate;
                    pharmacyitem.Rate = pharmacyitem.MrPrice;
                    pharmacyitem.Amount = pharmacyitem.Amount;
                    pharmacyitem.GrossAmount = pharmacyitem.Amount;
                    pharmacyitem.GrossGSTAmount = pharmacyitem.GrossGSTAmount;
                    pharmacyitem.DiscountAmount = pharmacyitem.DiscountAmount;
                    pharmacyitem.DoctorDiscountAmount = pharmacyitem.DoctorDiscountAmount;
                    pharmacyitem.EducationCess = pharmacyitem.EducationCess;
                    pharmacyitem.GSTAmount = pharmacyitem.GSTAmount;
                    pharmacyitem.NetAmountBeforeGST = pharmacyitem.NetAmountBeforeGST;
                    pharmacyitem.NetAmount = pharmacyitem.NetAmount;
                    pharmacyitem.GSTId = pharmacyitem.GSTId;
                    pharmacyitem.GSTPercentage = pharmacyitem.GSTPercentage;
                    pharmacyitem.TaxCode = pharmacyitem.TaxCode;
                    pharmacyitem.InGstId = pharmacyitem.InGstId;
                    pharmacyitem.InGstPercentage = pharmacyitem.InGstPercentage;
                    pharmacyitem.InGstAmount = pharmacyitem.InGstAmount;
                    pharmacyitem.CGstId = pharmacyitem.CGstId;
                    pharmacyitem.CGstPercentage = pharmacyitem.CGstPercentage;
                    pharmacyitem.CGstAmount = pharmacyitem.CGstAmount;
                    pharmacyitem.SGstId = pharmacyitem.SGstId;
                    pharmacyitem.SGstPercentage = pharmacyitem.SGstPercentage;
                    pharmacyitem.SGstAmount = pharmacyitem.SGstAmount;
                    pharmacyitem.DoctorId = $scope.item.DoctorId;
                    pharmacyitem.DoctorName = $scope.item.DoctorName;
                    pharmacyitem.IsPackageItem = 0;
                    pharmacyitem.PackageId = 0;
                    pharmacyitem.PackageName = '';
                    pharmacyitem.OrderId = 0;
                    pharmacyitem.OrderDetailId = 0;
                    pharmacyitem.OrderTypeId = 0;
                    pharmacyitem.OrderDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ServiceRateCategoryId = 0;
                    pharmacyitem.ServiceRateCategoryName = '';
                    pharmacyitem.IsModified = 0;
                    pharmacyitem.IsSupplimentary = 0;
                    pharmacyitem.IsBillable = 0;
                    pharmacyitem.IsDoctorDiscount = 0;
                    pharmacyitem.IsGstDoctor = 0;
                    pharmacyitem.StartDateTime = null;
                    pharmacyitem.EndDateTime = null;
                    pharmacyitem.DiscountTypeId = pharmacyitem.DiscountTypeId;
                    pharmacyitem.DiscountModeId = $scope.currentfilter.DiscountModeId;
                    pharmacyitem.DiscountAuthorizedBy = $scope.currentcontext.DiscountApprovedBy;
                    pharmacyitem.DoctorShare = 0;
                    pharmacyitem.ReferalShare = 0;
                    pharmacyitem.CNAmount = 0;
                    pharmacyitem.CancelReason = 0;
                    pharmacyitem.CancelledBy = 0;
                    pharmacyitem.ItemMasterId = pharmacyitem.ItemMasterId;
                    pharmacyitem.GenericName = pharmacyitem.GenericName;
                    pharmacyitem.IsNonClaimable = pharmacyitem.IsNonClaimable;
                    pharmacyitem.ItemCode = pharmacyitem.ItemCode;
                    pharmacyitem.ItemName = pharmacyitem.ItemName;
                    pharmacyitem.ScheduleTypeId = pharmacyitem.ScheduleTypeId;
                    pharmacyitem.ScheduleTypeDescription = pharmacyitem.ScheduleTypeDescription;
                    pharmacyitem.StoreMasterId = $scope.currentfilter.StoreMasterId;
                    pharmacyitem.Comments = '';
                    pharmacyitem.DepartmentId = $scope.item.DepartmentId;
                    pharmacyitem.IsPharmacySale = 1;
                    pharmacyitem.PharmacySaleTypeId = $scope.item.PharmacySaleTypeId;

                    result.push(pharmacyitem);
                }
            }
            for (var idx in $scope.DeletedPatientBills) {
                var item = $scope.DeletedPatientBills[idx];
                if (item.Id > 0 && !item.IsNonClaimable) {
                    result.push(item);
                }
            }
            return result;
        }

        function getNonClaimLinesForSave() {
            var result = [];
            for (var piidx in $scope.PatientBillDetails) {
                var pharmacyitem = $scope.PatientBillDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseInt(pharmacyitem.Quantity) > 0 && pharmacyitem.IsNonClaimable) {
                    pharmacyitem.ServiceId = pharmacyitem.ItemMasterId || 0;
                    pharmacyitem.ServiceCode = pharmacyitem.ItemCode;
                    pharmacyitem.ServiceName = pharmacyitem.ItemName;
                    pharmacyitem.ServiceTypeId = pharmacyitem.ServiceTypeId || 0;
                    pharmacyitem.ServiceGroupId = pharmacyitem.ServiceGroupId || 0;
                    pharmacyitem.ServiceCategoryId = pharmacyitem.ServiceCategoryId || 0;
                    pharmacyitem.MasterName = pharmacyitem.MasterName;
                    pharmacyitem.MasterItemId = pharmacyitem.MasterItemId || 0;
                    pharmacyitem.EncounterId = $scope.item.EncounterId;
                    pharmacyitem.PatientBillStatusId = $scope.item.PatientBillStatusId;
                    pharmacyitem.MasterTypeId = pharmacyitem.MasterTypeId || 0;
                    pharmacyitem.Quantity = parseInt(pharmacyitem.Quantity);
                    pharmacyitem.StockItemId = pharmacyitem.StockItemId;
                    pharmacyitem.StockSerialItemId = pharmacyitem.StockSerialItemId;
                    pharmacyitem.BatchId = pharmacyitem.BatchId;
                    pharmacyitem.ExpiryDate = pharmacyitem.ExpiryDate;
                    pharmacyitem.Rate = pharmacyitem.MrPrice;
                    pharmacyitem.Amount = pharmacyitem.Amount;
                    pharmacyitem.GrossAmount = pharmacyitem.Amount;
                    pharmacyitem.GrossGSTAmount = pharmacyitem.GrossGSTAmount;
                    pharmacyitem.DiscountAmount = pharmacyitem.DiscountAmount;
                    pharmacyitem.DoctorDiscountAmount = pharmacyitem.DoctorDiscountAmount;
                    pharmacyitem.EducationCess = pharmacyitem.EducationCess;
                    pharmacyitem.GSTAmount = pharmacyitem.GSTAmount;
                    pharmacyitem.NetAmountBeforeGST = pharmacyitem.NetAmountBeforeGST;
                    pharmacyitem.NetAmount = pharmacyitem.NetAmount;
                    pharmacyitem.GSTId = pharmacyitem.GSTId;
                    pharmacyitem.GSTPercentage = pharmacyitem.GSTPercentage;
                    pharmacyitem.TaxCode = pharmacyitem.TaxCode;
                    pharmacyitem.InGstId = pharmacyitem.InGstId;
                    pharmacyitem.InGstPercentage = pharmacyitem.InGstPercentage;
                    pharmacyitem.InGstAmount = pharmacyitem.InGstAmount;
                    pharmacyitem.CGstId = pharmacyitem.CGstId;
                    pharmacyitem.CGstPercentage = pharmacyitem.CGstPercentage;
                    pharmacyitem.CGstAmount = pharmacyitem.CGstAmount;
                    pharmacyitem.SGstId = pharmacyitem.SGstId;
                    pharmacyitem.SGstPercentage = pharmacyitem.SGstPercentage;
                    pharmacyitem.SGstAmount = pharmacyitem.SGstAmount;
                    pharmacyitem.DoctorId = $scope.item.DoctorId;
                    pharmacyitem.DoctorName = $scope.item.DoctorName;
                    pharmacyitem.IsPackageItem = 0;
                    pharmacyitem.PackageId = 0;
                    pharmacyitem.PackageName = '';
                    pharmacyitem.OrderId = 0;
                    pharmacyitem.OrderDetailId = 0;
                    pharmacyitem.OrderTypeId = 0;
                    pharmacyitem.OrderDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ServiceRateCategoryId = 0;
                    pharmacyitem.ServiceRateCategoryName = '';
                    pharmacyitem.IsModified = 0;
                    pharmacyitem.IsSupplimentary = 0;
                    pharmacyitem.IsBillable = 0;
                    pharmacyitem.IsDoctorDiscount = 0;
                    pharmacyitem.IsGstDoctor = 0;
                    pharmacyitem.StartDateTime = null;
                    pharmacyitem.EndDateTime = null;
                    pharmacyitem.DiscountTypeId = pharmacyitem.DiscountTypeId;
                    pharmacyitem.DiscountModeId = $scope.currentfilter.DiscountModeId;
                    pharmacyitem.DiscountAuthorizedBy = $scope.currentcontext.DiscountApprovedBy;
                    pharmacyitem.DoctorShare = 0;
                    pharmacyitem.ReferalShare = 0;
                    pharmacyitem.CNAmount = 0;
                    pharmacyitem.CancelReason = 0;
                    pharmacyitem.CancelledBy = 0;
                    pharmacyitem.ItemMasterId = pharmacyitem.ItemMasterId;
                    pharmacyitem.GenericName = pharmacyitem.GenericName;
                    pharmacyitem.IsNonClaimable = pharmacyitem.IsNonClaimable;
                    pharmacyitem.ItemCode = pharmacyitem.ItemCode;
                    pharmacyitem.ItemName = pharmacyitem.ItemName;
                    pharmacyitem.ScheduleTypeId = pharmacyitem.ScheduleTypeId;
                    pharmacyitem.ScheduleTypeDescription = pharmacyitem.ScheduleTypeDescription;
                    pharmacyitem.StoreMasterId = $scope.currentfilter.StoreMasterId;
                    pharmacyitem.Comments = '';
                    pharmacyitem.DepartmentId = $scope.item.DepartmentId;
                    pharmacyitem.IsPharmacySale = 1;
                    pharmacyitem.PharmacySaleTypeId = $scope.item.PharmacySaleTypeId;

                    result.push(pharmacyitem);
                }
            }
            for (var idx in $scope.DeletedPatientBills) {
                var item = $scope.DeletedPatientBills[idx];
                if (item.Id > 0 && item.IsNonClaimable) {
                    result.push(item);
                }
            }
            return result;
        }

        $scope.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        };

        $scope.amountConversion = function (amount) {
            if (amount !== undefined) {
                return parseFloat(amount).toFixed(2);
            } else {
                return '0.00';
            }
        };

        $scope.OnPharmacyBarcodeSelected = function (selectedItem) {

            var SelectedMasterItem = null;
            var stockserialitems = null;
            var serialitem = [];
            var batid = 0;
            if (selectedItem.IsThisPrescription) {
                SelectedMasterItem = selectedItem.SelectedItem;
                selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                selectedItem.ItemName = SelectedMasterItem.ItemName;
                selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                selectedItem.RST = '';
                selectedItem.RackId = SelectedMasterItem.RackId || 0;
                selectedItem.RackName = SelectedMasterItem.RackName || '';
                selectedItem.Shelf = SelectedMasterItem.Self || '';
                selectedItem.Tray = SelectedMasterItem.Tray || '';
                selectedItem.DiscountModeId = 2;
                selectedItem.Discount = 0;
                if (SelectedMasterItem.RackName) {
                    selectedItem.RST = SelectedMasterItem.RackName;
                }
                if (SelectedMasterItem.Self) {
                    selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Self;
                }
                if (SelectedMasterItem.Tray) {
                    selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Tray;
                }
                selectedItem.IsNonClaimable = SelectedMasterItem.IsNonClaimable;
                if (SelectedMasterItem.GenericMaster) {
                    selectedItem.GenericId = SelectedMasterItem.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.GenericMaster.GenericName;
                }
                if (SelectedMasterItem.Manufacturer) {
                    selectedItem.ManufacturerId = SelectedMasterItem.ManufacturerId;
                    selectedItem.ManufacturerName = SelectedMasterItem.Manufacturer.VendorName;
                }
                if (SelectedMasterItem.ScheduleType) {
                    selectedItem.ScheduleTypeId = SelectedMasterItem.ScheduleTypeId;
                    selectedItem.ScheduleTypeDescription = SelectedMasterItem.ScheduleType.Description;
                }
                if (SelectedMasterItem.SubCategoryId == 1) {
                    selectedItem.SubCategoryId = 1;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                    selectedItem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                    selectedItem.MasterName = SelectedMasterItem.DrugName;
                    selectedItem.MasterItemId = SelectedMasterItem.DrugId;
                    selectedItem.DrugName = SelectedMasterItem.DrugName;
                    selectedItem.DrugId = SelectedMasterItem.DrugId;
                    selectedItem.MasterTypeId = SelectedMasterItem.SubCategoryId;
                } else if (SelectedMasterItem.SubCategoryId == 2) {
                    selectedItem.SubCategoryId = 2;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                    selectedItem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                    selectedItem.MasterName = SelectedMasterItem.DrugName;
                    selectedItem.MasterItemId = SelectedMasterItem.DrugId;
                    selectedItem.DrugName = SelectedMasterItem.DrugName;
                    selectedItem.DrugId = SelectedMasterItem.DrugId;
                    selectedItem.MasterTypeId = SelectedMasterItem.SubCategoryId;
                } else {
                    selectedItem.SubCategoryId = 0;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = 0;
                    selectedItem.ServiceCategoryId = 0;
                    selectedItem.MasterName = '';
                    selectedItem.MasterItemId = 0;
                    selectedItem.DrugName = 0;
                    selectedItem.DrugId = 0;
                    selectedItem.MasterTypeId = 0;
                }

                if (SelectedMasterItem.StockItem &&
                    SelectedMasterItem.StockItem.StockSerialItems.length > 0) {
                    selectedItem.MinQty = SelectedMasterItem.MinQty;
                    selectedItem.TotalQuantity = SelectedMasterItem.StockItem.Quantity;
                    selectedItem.MaxQty = SelectedMasterItem.MaxQty;
                    if (selectedItem.TotalQuantity <= selectedItem.MinQty) {
                        selectedItem.IsFallUnderMinQty = true;
                    }
                    selectedItem.StockItemRev = SelectedMasterItem.StockItem.Rev;
                    stockserialitems = SelectedMasterItem.StockItem.StockSerialItems;
                    for (batid = 0; batid < stockserialitems.length; batid++) {
                        serialitem = stockserialitems[batid];
                        if (serialitem.Quantity > 0) {
                            selectedItem.BatchDetails.push(serialitem);
                        }
                    }

                    $scope.ChooseBatches(idx, selectedItem);
                    if ($scope.separatePaymentCounter == 1) {
                        $scope.IsSeparatePharmacyCounter();
                    } else {
                        $scope.updateReceiptAmt();
                    }
                }
            } else {
                if (selectedItem.SelectedItem.StockInHand <= 0) {
                    utl.Alert.showErrorMsg('Stock Not Available');
                    selectedItem.BatchQuantity = 0;
                    selectedItem.TotalQuantity = 0;
                    selectedItem.Quantity = 0;
                    selectedItem.ExpiryDate = '';
                    selectedItem.MrPrice = 0.00;
                    selectedItem.GSTPercentage = 0.00;
                    selectedItem.DiscountAmount = 0;
                    selectedItem.DiscountAmount = 0.00;
                    selectedItem.SelectedBatchId = -1;
                    selectedItem.BatchDetails = [];
                } else {
                    SelectedMasterItem = selectedItem.SelectedItem;
                    selectedItem.IsThisPrescription = false;
                    selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                    selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                    selectedItem.ItemName = SelectedMasterItem.ItemName;
                    selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                    selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
                    selectedItem.RST = '';
                    selectedItem.RackId = SelectedMasterItem.RackId || 0;
                    selectedItem.RackName = SelectedMasterItem.RackName || '';
                    selectedItem.Shelf = SelectedMasterItem.Self || '';
                    selectedItem.Tray = SelectedMasterItem.Tray || '';
                    if (SelectedMasterItem.RackName) {
                        selectedItem.RST = SelectedMasterItem.RackName;
                    }
                    if (SelectedMasterItem.Self) {
                        selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Self;
                    }
                    if (SelectedMasterItem.Tray) {
                        selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Tray;
                    }
                    selectedItem.AllowStaffDiscount = SelectedMasterItem.ItemMaster.AllowStaffDiscount;
                    selectedItem.IsNonClaimable = SelectedMasterItem.ItemMaster.IsNonClaimable;
                    selectedItem.ManufacturerId = SelectedMasterItem.ItemMaster.ManufacturerId;
                    selectedItem.ManufacturerName = SelectedMasterItem.ItemMaster.ManufacturerName;
                    selectedItem.ScheduleTypeId = SelectedMasterItem.ItemMaster.ScheduleTypeId;
                    selectedItem.DiscountModeId = SelectedMasterItem.ItemMaster.DiscountModeId || 2;
                    selectedItem.Discount = SelectedMasterItem.ItemMaster.Discount || 0;
                    if (SelectedMasterItem.ItemMaster.ScheduleType) {
                        selectedItem.ScheduleTypeDescription = SelectedMasterItem.ItemMaster.ScheduleType.Description;
                    }
                    if (SelectedMasterItem.ItemMaster.GenericMaster) {
                        selectedItem.IsPrescribed = SelectedMasterItem.ItemMaster.GenericMaster.IsPrescribed;
                    }
                    if (SelectedMasterItem.ItemMaster.SubCategoryId == 1) {
                        selectedItem.SubCategoryId = 1;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                        selectedItem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                        selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
                    } else if (SelectedMasterItem.ItemMaster.SubCategoryId == 2) {
                        selectedItem.SubCategoryId = 2;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                        selectedItem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                        selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
                    } else {
                        selectedItem.SubCategoryId = 0;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = 0;
                        selectedItem.ServiceCategoryId = 0;
                        selectedItem.MasterName = '';
                        selectedItem.MasterItemId = 0;
                        selectedItem.DrugName = 0;
                        selectedItem.DrugId = 0;
                        selectedItem.MasterTypeId = 0;
                    }

                    selectedItem.BatchDetails = [];
                    selectedItem.BatchDetail = {};
                    selectedItem.BatchId = '';
                    selectedItem.SelectedBatchId = '';
                    selectedItem.ExpiryDate = '';
                    selectedItem.BatchQuantity = 0;
                    selectedItem.Quantity = 0;
                    selectedItem.MrPrice = 0.00;
                    selectedItem.Amount = 0.00;
                    selectedItem.GrossAmount = 0.00;
                    selectedItem.UnitDiscountAmount = 0.00;
                    selectedItem.DiscountAmount = 0.00;
                    selectedItem.GSTPercentage = 0.00;
                    selectedItem.GSTAmount = 0.00;
                    selectedItem.InGstPercentage = 0.00;
                    selectedItem.InGstAmount = 0.00;
                    selectedItem.CGstPercentage = 0.00;
                    selectedItem.CGstAmount = 0.00;
                    selectedItem.SGstPercentage = 0.00;
                    selectedItem.SGstAmount = 0.00;
                    selectedItem.NetAmount = 0.00;

                    // if (SelectedMasterItem.ItemMaster.StockItem &&
                    //     SelectedMasterItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                    // var SumOfSerialQuantity = 0;
                    // stockserialitems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
                    // for (batid = 0; batid < stockserialitems.length; batid++) {
                    //     serialitem = stockserialitems[batid];
                    //     if (serialitem.Quantity > 0) {
                    //         SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity;
                    selectedItem.BatchDetails.push(SelectedMasterItem);
                    //     }
                    // }

                    selectedItem.MinQty = SelectedMasterItem.MinQty;
                    selectedItem.TotalQuantity = SelectedMasterItem.StockInHand;
                    selectedItem.MaxQty = SelectedMasterItem.MaxQty;
                    if (selectedItem.TotalQuantity <= selectedItem.MinQty) {
                        selectedItem.IsFallUnderMinQty = true;
                    }
                    // selectedItem.StockItemRev = SelectedMasterItem.ItemMaster.StockItem.Rev;
                    // }
                    $scope.ChooseBarcodeBatches(selectedItem);
                }
            }
        }

        $scope.ChooseBarcodeBatches = function (item) {
            var currentitem = item;
            var PatientBillDetail = {};
            var ExpiryDays = null;
            $scope.currentcontext.ReceiptAmt = 0;

            PatientBillDetail = {
                Id: 0,
                BillDateTime: utl.Formatter.getCurrentDate(),
                ServiceId: item.ItemMasterId,
                ServiceCode: item.ItemCode,
                ServiceName: item.ItemName,
                ItemMasterId: item.ItemMasterId,
                ItemCode: item.ItemCode,
                ItemName: item.ItemName,
                AllowStaffDiscount: item.AllowStaffDiscount,
                itemidxdesc: null,
                ScheduleTypeId: item.ScheduleTypeId,
                ScheduleTypeDescription: item.ScheduleTypeDescription,
                StoreMasterId: item.StoreMasterId,
                ItemTypeId: 0,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: '',
                MasterItemId: 0,
                EncounterId: 0,
                PatientBillStatusId: 0,
                MasterTypeId: 0,
                StockSerialItemId: item.SelectedItem.Id,
                StockSerialItemRev: item.SelectedItem.Rev,
                StockItemId: item.SelectedItem.StockItemId,
                Quantity: item.Quantity,
                FreeQty: 0,
                itemidxqty: null,
                BatchQuantity: item.SelectedItem.Quantity,
                MinQty: item.MinQty,
                TotalQuantity: item.TotalQuantity,
                MaxQty: item.MaxQty,
                Batch: true,
                BatchId: item.SelectedItem.BatchId,
                SelectedBatchId: item.SelectedItem.BatchId,
                ExpiryDate: null,
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                Ucp: parseFloat((item.SelectedItem.Ucp).toFixed(2)),
                Mrp: parseFloat((item.SelectedItem.Mrp).toFixed(2)),
                Rate: parseFloat((item.SelectedItem.Mrp).toFixed(2)),
                Amount: 0.00,
                GrossAmount: 0.00,
                GrossGSTAmount: 0.00,
                DiscountPercentage: 0.00,
                UnitDiscountAmount: 0.00,
                DiscountAmount: 0.00,
                UnitProportionateDiscount: 0.00,
                ProportionateDiscount: 0.00,
                DoctorDiscountAmount: 0.00,
                EducationCess: 0.00,
                NetAmountBeforeGST: 0.00,
                NetAmount: 0.00,
                TaxCode: '',
                DoctorId: 0,
                DoctorName: '',
                IsPrescribed: false,
                IsPackageItem: 0,
                PackageId: 0,
                PackageName: '',
                OrderId: 0,
                OrderDetailId: 0,
                OrderTypeId: 0,
                OrderDateTime: null,
                ServiceRateCategoryId: 0,
                ServiceRateCategoryName: '',
                IsModified: 0,
                IsSupplimentary: 0,
                IsBillable: 0,
                IsPharmacySale: 1,
                IsDoctorDiscount: 0,
                IsGstDoctor: 0,
                StartDateTime: null,
                EndDateTime: null,
                DiscountTypeId: 0,
                DiscountModeId: item.DiscountModeId,
                Discount: parseFloat((item.Discount).toFixed(2)),
                DiscountAuthorizedBy: 0,
                DoctorShare: 0.00,
                ReferalShare: 0.00,
                CNAmount: 0.00,
                CancelReason: 0,
                CancelledBy: 0,
                Comments: '',
                DepartmentId: 0,
                GenericId: item.GenericId,
                GenericName: item.GenericName,
                IsNonClaimable: item.IsNonClaimable,
                RackId: item.RackId,
                RackName: item.RackName,
                Shelf: item.Shelf,
                Tray: item.Tray,
                RST: item.RST,
                VendorMasterId: item.SelectedItem.VendorMasterId,
                ManufacturerId: item.SelectedItem.ManufacturerId,
                ManufacturerName: item.ManufacturerName,
                UnitCostPrice: parseFloat((item.SelectedItem.Ucp).toFixed(2)),
                MrPrice: parseFloat((item.SelectedItem.Mrp).toFixed(2)),
                UnitPrice: 0.00,
                GSTId: item.SelectedItem.GstId,
                InGstId: item.SelectedItem.InGstId,
                CGstId: item.SelectedItem.CGstId,
                SGstId: item.SelectedItem.SGstId,
                GSTPercentage: item.SelectedItem.GstPercentage,
                InGstPercentage: item.SelectedItem.InGstPercentage,
                CGstPercentage: item.SelectedItem.CGstPercentage,
                SGstPercentage: item.SelectedItem.SGstPercentage,
                PurchaseUomId: item.SelectedItem.PurchaseUomId,
                BaseUomId: item.SelectedItem.BaseUomId,
                SaleUomId: item.SelectedItem.SaleUomId,
                GrnId: item.SelectedItem.GrnId,
                GrnDetailId: item.SelectedItem.GrnDetailId,
                StockEntryId: item.SelectedItem.StockEntryId,
                StockEntryDetailId: item.SelectedItem.StockEntryDetailId,
                UnitGSTAmount: 0.00,
                UnitInGstAmount: 0.00,
                UnitCGstAmount: 0.00,
                UnitSGstAmount: 0.00,
                GSTAmount: 0.00,
                InGstAmount: 0.00,
                CGstAmount: 0.00,
                SGstAmount: 0.00,
                RdoDiscountMode: true,
                RdoDiscount: true,
                PrescriptionDetailId: 0,
                IsThisPrescription: item.IsThisPrescription,
                Status: 1
            };

            ExpiryDays = GetExpiryDays(item.SelectedItem.ExpiryDate);
            if (ExpiryDays <= $scope.currentfilter.ExpiryPriorStopDays) {
                PatientBillDetail.ExpiryStop = true;
            } else if (ExpiryDays > $scope.currentfilter.ExpiryPriorStopDays && ExpiryDays <= $scope.currentfilter.ExpiryWarningDays) {
                PatientBillDetail.ExpiryAlert = true;
            } else {
                PatientBillDetail.ExpiryProceed = true;
            }

            if (PatientBillDetail.ExpiryAlert) {
                PatientBillDetail.ExpiryDate = null;
                PatientBillDetail.ExpiryAlert = true;
                PatientBillDetail.ExpiryDate = item.SelectedItem.ExpiryDate;
            } else if (PatientBillDetail.ExpiryStop) {
                PatientBillDetail.ExpiryDate = null;
                PatientBillDetail.ExpiryStop = true;
                PatientBillDetail.ExpiryDate = item.SelectedItem.ExpiryDate;
            } else {
                PatientBillDetail.ExpiryDate = null;
                PatientBillDetail.ExpiryProceed = true;
                PatientBillDetail.ExpiryDate = item.SelectedItem.ExpiryDate;
            }

            if (PatientBillDetail.TotalQuantity <= PatientBillDetail.MinQty) {
                PatientBillDetail.IsFallUnderMinQty = true;
            } else {
                PatientBillDetail.IsFallUnderMinQty = false;
            }

            PatientBillDetail.IsPrescribed = item.IsPrescribed;
            if ($scope.item.StaffCheck) {
                if (PatientBillDetail.AllowStaffDiscount) {
                    if ($scope.item.StaffDiscountTypeId === 2) {
                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                        PatientBillDetail.UnitInGstAmount = 0;
                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                    } else {
                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                        PatientBillDetail.MrPrice = PatientBillDetail.UnitCostPrice;
                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.UnitCostPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                        PatientBillDetail.UnitInGstAmount = 0;
                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                    }
                } else {
                    PatientBillDetail.DiscountPercentage = 0;
                    PatientBillDetail.DiscountAmount = 0;
                    PatientBillDetail.UnitDiscountAmount = 0;
                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                    PatientBillDetail.UnitInGstAmount = 0;
                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                }
            } else {
                if (item.DiscountModeId == 2 && item.Discount > 0) {
                    PatientBillDetail.DiscountPercentage = item.Discount;
                    PatientBillDetail.DiscountAmount = item.Discount;

                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                    PatientBillDetail.UnitDiscountAmount = parseFloat((item.Discount / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                    PatientBillDetail.UnitInGstAmount = 0;
                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                } else if (item.DiscountModeId == 1 && item.Discount > 0) {
                    PatientBillDetail.DiscountPercentage = 0;
                    PatientBillDetail.DiscountAmount = item.Discount;

                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice - item.Discount;
                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - item.Discount;

                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                    PatientBillDetail.UnitInGstAmount = 0;
                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                } else {
                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));

                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                    PatientBillDetail.UnitInGstAmount = 0;
                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                }
            }
            PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
            //PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
            //PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
            //PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
            //PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
            //PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
            //PatientBillDetail.UnitCGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.CGstPercentage).toFixed(2));
            //PatientBillDetail.UnitSGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.SGstPercentage).toFixed(2));
            PatientBillDetail.GSTAmount = parseFloat((PatientBillDetail.UnitGSTAmount * PatientBillDetail.Quantity).toFixed(2));
            PatientBillDetail.InGstAmount = parseFloat((PatientBillDetail.UnitInGstAmount * PatientBillDetail.Quantity).toFixed(2));
            PatientBillDetail.CGstAmount = PatientBillDetail.GSTAmount / 2;
            PatientBillDetail.SGstAmount = PatientBillDetail.GSTAmount / 2;
            //PatientBillDetail.CGstAmount = parseFloat((PatientBillDetail.UnitCGstAmount * PatientBillDetail.Quantity).toFixed(2));
            //PatientBillDetail.SGstAmount = parseFloat((PatientBillDetail.UnitSGstAmount * PatientBillDetail.Quantity).toFixed(2));
            PatientBillDetail.NetAmount = parseFloat((PatientBillDetail.Rate * PatientBillDetail.Quantity).toFixed(2));
            PatientBillDetail.NetAmountBeforeGST = parseFloat((PatientBillDetail.NetAmount - PatientBillDetail.GSTAmount).toFixed(2));

            if (item.SubCategoryId == 1) {
                PatientBillDetail.SubCategoryId = 1;
                PatientBillDetail.ServiceTypeId = 0;
                PatientBillDetail.ServiceGroupId = $scope.item.DrugServiceGroupId;
                PatientBillDetail.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                PatientBillDetail.MasterName = item.DrugName;
                PatientBillDetail.MasterItemId = item.DrugId;
                PatientBillDetail.MasterTypeId = item.SubCategoryId;
            } else if (item.SubCategoryId == 2) {
                PatientBillDetail.SubCategoryId = 2;
                PatientBillDetail.ServiceTypeId = 0;
                PatientBillDetail.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                PatientBillDetail.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                PatientBillDetail.MasterName = item.DrugName;
                PatientBillDetail.MasterItemId = item.DrugId;
                PatientBillDetail.MasterTypeId = item.SubCategoryId;
            } else {
                PatientBillDetail.SubCategoryId = 0;
                PatientBillDetail.ServiceTypeId = 0;
                PatientBillDetail.ServiceGroupId = 0;
                PatientBillDetail.ServiceCategoryId = 0;
                PatientBillDetail.MasterName = '';
                PatientBillDetail.MasterItemId = 0;
                PatientBillDetail.MasterTypeId = 0;
            }

            PatientBillDetail.BatchDetails = item.BatchDetails;
            var index = $scope.PatientBillDetails.indexOf(item);
            $scope.PatientBillDetails.splice(index, 1);
            $scope.PatientBillDetails.push(PatientBillDetail);
            item.Quantity = 0;
            $scope.currentcontext.BillDiscount = 0;
            savehitcompleted = 0;

            document.getElementById("itemId").value = '';
            $scope.CalculateNetAmt();
            $scope.addNewLineItem();

        };


        vm.pharmacybatchcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Item Code',
                field: 'ItemCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Item Name',
                field: 'ItemName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
            },
            {
                header: 'Claim',
                field: 'Claimable',
                datatype: 'string',
                headercls: 'td-claimable',
                fieldcls: 'td-claimable'
            },
            {
                header: 'Rack Name',
                field: 'RackName',
                datatype: 'string',
                headercls: 'td-rackname',
                fieldcls: 'td-rackname'
            },
            {
                header: 'Stock-In-Hand',
                field: 'StockInHand',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            },
            {
                header: 'MrPrice',
                field: 'MrPrice',
                datatype: 'string',
                headercls: 'td-mrprice',
                fieldcls: 'td-mrprice'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/stockserialitem/GetStockSerialItems',
            formatdisplay: formatselectedpharmacybatch,
            presearch: presearchpharmacybatch,
            postsearch: postsearchpharmacybatch
        };

        function formatselectedpharmacybatch() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.pharmacybatchcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, selectedItem.ItemCode].join(' ');
            } else if (vm.pharmacybatchcontrolconfig.rowdata) {
                result = [vm.pharmacybatchcontrolconfig.rowdata.ItemName, vm.pharmacybatchcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpharmacybatch() {
            var query = vm.pharmacybatchcontrolconfig.query;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.StoreTypeId
                },
                {
                    Key: 18,
                    Value: TodayDate
                },
                {
                    Key: 20,
                    Value: 1
                },
                {
                    Key: 19,
                    Value: 2
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.pharmacybatchcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 21,
                    Value: query
                });
            }

            vm.pharmacybatchcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacybatch() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.pharmacybatchcontrolconfig.result) {
                var item = vm.pharmacybatchcontrolconfig.result[idx];
                var SerialItems = null;
                var SerialQuantity = 0;
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                if (item.ItemMaster) {
                    item.GenericName = item.ItemMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                item.RackName = item.RackName;
                item.StockInHand = item.Quantity;
                item.MrPrice = item.ItemMaster.MrPrice;
                item.IsNonClaimable = item.ItemMaster.IsNonClaimable;
                if (item.IsNonClaimable == false) {
                    item.Claimable = 'Y'
                } else {
                    item.Claimable = 'N'
                }
            }
        }

        if ($scope.zerostocksales == 1) {
            vm.pharmacyitemcontrolconfig = {
                query: '',
                searchbyid: false,
                options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                /*
                {
                    header: 'Product Type Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                */
                {
                    header: 'Generic Name',
                    field: 'GenericName',
                    datatype: 'string',
                    headercls: 'td-genericname',
                    fieldcls: 'td-genericname'
                },
                /*
                {
                    header: 'Manufacturer Name',
                    field: 'ManufacturerName',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                },
                */
                // {
                //     header: 'Claim',
                //     field: 'Claimable',
                //     datatype: 'string',
                //     headercls: 'td-claimable',
                //     fieldcls: 'td-claimable'
                // },
                // {
                //     header: 'Rack Name',
                //     field: 'RackName',
                //     datatype: 'string',
                //     headercls: 'td-rackname',
                //     fieldcls: 'td-rackname'
                // },
                {
                    header: 'Stock-In-Hand',
                    field: 'StockInHand',
                    datatype: 'string',
                    headercls: 'td-stockinhand',
                    fieldcls: 'td-stockinhand'
                },
                {
                    header: 'Sales Price',
                    field: 'MrPrice',
                    datatype: 'string',
                    headercls: 'td-mrprice',
                    fieldcls: 'td-mrprice'
                }
                ],
                searchparams: {},
                result: {},
                api: 'pharmacy/itemmaster/GetPharmacyStoreItemsForNonZero',
                formatdisplay: formatselectedpharmacyitem,
                presearch: presearchpharmacyitem,
                postsearch: postsearchpharmacyitem
            };
        } else if ($scope.zerostocksales == 0) {
            vm.pharmacyitemcontrolconfig = {
                query: '',
                searchbyid: false,
                options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                /*
                {
                    header: 'Product Type Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                */
                {
                    header: 'Generic Name',
                    field: 'GenericName',
                    datatype: 'string',
                    headercls: 'td-genericname',
                    fieldcls: 'td-genericname'
                },
                /*
                {
                    header: 'Manufacturer Name',
                    field: 'ManufacturerName',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                },
                */
                // {
                //     header: 'Claim',
                //     field: 'Claimable',
                //     datatype: 'string',
                //     headercls: 'td-claimable',
                //     fieldcls: 'td-claimable'
                // },
                // {
                //     header: 'Rack Name',
                //     field: 'RackName',
                //     datatype: 'string',
                //     headercls: 'td-rackname',
                //     fieldcls: 'td-rackname'
                // },
                {
                    header: 'Stock-In-Hand',
                    field: 'StockInHand',
                    datatype: 'string',
                    headercls: 'td-stockinhand',
                    fieldcls: 'td-stockinhand'
                },
                {
                    header: 'Sales Price',
                    field: 'MrPrice',
                    datatype: 'string',
                    headercls: 'td-mrprice',
                    fieldcls: 'td-mrprice'
                }
                ],
                searchparams: {},
                result: {},
                api: 'pharmacy/itemmaster/GetPharmacyStoreItems',
                formatdisplay: formatselectedpharmacyitem,
                presearch: presearchpharmacyitem,
                postsearch: postsearchpharmacyitem
            };
        }

        function formatselectedpharmacyitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, selectedItem.ItemCode].join(' ');
            } else if (vm.pharmacyitemcontrolconfig.rowdata) {
                result = [vm.pharmacyitemcontrolconfig.rowdata.ItemName, vm.pharmacyitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 16,
                    Value: utl.Session.getCurrentFacilityId()
                },
                // {
                //     Key: 8,
                //     Value: $scope.currentfilter.StoreTypeId
                // },
                {
                    Key: 12,
                    Value: TodayDate
                },
                {
                    Key: 13,
                    Value: 1
                },
                {
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 22,
                    Value: false
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.pharmacyitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2 && $scope.item.IsGenericSearch == false) {
                if ($scope.itemexactsearch == true) {
                    inputData.Params.push({
                        Key: 24,
                        Value: query
                    });
                } else {
                    inputData.Params.push({
                        Key: 3,
                        Value: query
                    });
                }
            } else if (query && query.length > 2 && $scope.item.IsGenericSearch == true) {
                inputData.Params.push({
                    Key: 21,
                    Value: query
                });
            }

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                var SerialItems = null;
                var SerialQuantity = 0;
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                /*
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                */
                if (item.ItemMaster) {
                    item.GenericName = item.ItemMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                /*
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                */
                /*
                item.ManufacturerName = item.ManufacturerName;
                */
                /*
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                item.RackName = item.RackName;
                if (item.ItemMaster.StockItem !== null) {
                    if (item.ItemMaster.StockItem &&
                        item.ItemMaster.StockItem.StockSerialItems.length > 0) {
                        SerialItems = item.ItemMaster.StockItem.StockSerialItems;
                        for (var batid = 0; batid < SerialItems.length; batid++) {
                            SerialQuantity = SerialQuantity + SerialItems[batid].Quantity;
                        }
                    }
                    item.StockInHand = SerialQuantity;
                } else {
                    item.StockInHand = 0;
                }
                item.MrPrice = item.ItemMaster.MrPrice;
                item.IsNonClaimable = item.ItemMaster.IsNonClaimable;
                if (item.IsNonClaimable == false) {
                    item.Claimable = 'Y'
                } else {
                    item.Claimable = 'N'
                }
            }
            if ($scope.itemexactsearch == true)//Sorting for JSS
                vm.pharmacyitemcontrolconfig.result.sort($scope.sort_by_stock);
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
                $scope.item.ReferralName = selectedItem.ReferralName;
                $scope.currentfilter.ReferralName = selectedItem.ReferralName;
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        $scope.sort_by_stock = function (a, b) {

            if (a.StockInHand > b.StockInHand)
                return -1;
            if (a.StockInHand < b.StockInHand)
                return 1;
            return 0;

        };
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

        function loadData() {
            $scope.applyVisibilityRules();
            $scope.addNewLineItem();
            $scope.isSaving = false;
            $scope.currentfilter.GuarantorTypeId = -1;
        }

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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                if (selectedItem.DoctorName)
                    result = selectedItem.DoctorName;
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

            if (vm.doctorcontrolconfig.searchbyid === true) {
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

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getUserBillsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                if ($scope.IsDueAllowed == 'true') {
                    utl.Alert.showErrorMsg('Please Collect all Due Amounts to Proceed Next Bill...');
                    $scope.canShowSaveapproveBtn = false;
                    $scope.canShowSaveBtn = false;
                }
            }
        };

        $scope.getUserBills = function () {
            var inputData = {
                Params: [{
                    Key: 39,
                    Value: utl.Session.getCurrentUserId()
                },
                {
                    Key: 45,
                    Value: '0'
                },
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
                onComplete: $scope.getUserBillsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnsubmit').text("Save (F2)");
            $('#saveAndApproveid').text("Approve (F4)");
            $('#btnprint').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.currentfilter.StoreTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreTypeId;
                            $scope.currentfilter.StoreSubTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreSubTypeId;
                            $scope.currentfilter.SequenceOptionId = $scope.lookup.UserStores[usidx].StoreMaster.SequenceOptionId;
                            $scope.currentfilter.ExpiryWarningDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryWarningDays;
                            $scope.currentfilter.ExpiryPriorStopDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryPriorStopDays;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === 0) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                        $scope.currentfilter.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = value[0].StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = value[0].StoreMaster.SequenceOptionId;
                        $scope.currentfilter.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                        $scope.currentfilter.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                    }
                    $scope.getStorePrintPreference();
                    /* $scope.getStoreStaffDiscounts(); */
                }
                if (key == 'FacilityPreference') {
                    $scope.item.PreferedRoundOff = value[0].PreferenceValue;
                }
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'DRUG') {
                            $scope.item.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'NONDRUG') {
                            $scope.item.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });
            defaultReferral();
            // $scope.getUserBills();
            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "DiscountApprover"
            },
            // {
            //     "Key": "Doctor"
            // },
            {
                "Key": "PrivateDueApprover"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "DiscountType"
            },
            {
                "Key": "GuarantorType"
            },
            // {
            //     "Key": "Guarantor",
            //     Request: {
            //         Params: [{
            //             Key: 7,
            //             Value: utl.Session.getCurrentFacilityId()
            //         }]
            //     }
            // },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "PharmacySaleType",
                Default: false
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
            {
                "Key": "Title"
            },
            {
                "Key": "Referral"
            },
            {
                "Key": "Gender"
            },
            {
                "Key": "ServiceCategory"
            },
            {
                "Key": "PatientType"
            },
            {
                "Key": "UserStores",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId(),
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                },
                Default: false
            },
            {
                "Key": "FacilityPreference",
                Request: {
                    Params: [{
                        Key: 0,
                        Value: 76
                    }]
                },
                Default: false
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

        /* Pharmacy dotmatrix print starts */

        $scope.dmPrint = function () {

            /*   // Test Print for print per page Column count and row count
            var data = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
            var data1 = "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            data1 += "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            data1 += "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            data1 += "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            var printData= []
            printData.push(data);
            printData.push(data1);
            $scope.printRaw(printData);
            */
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));

                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'billing/patientbills/DMPrintPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function (scope, data, options, hasError) {
            if (window.clientcode.toLowerCase() == 'lotus') {
                var dmPrintInputForIncludeClaim = preparePrintDataForIncludeClaim(data);
                if (dmPrintInputForIncludeClaim.header.NeedToPrint == true) {
                    $scope.printPharmacySales(dmPrintInputForIncludeClaim);
                }
                var dmPrintInputForNotIncludeClaim = preparePrintDataForNotIncludeClaim(data);
                if (dmPrintInputForNotIncludeClaim.header.NeedToPrint == true) {
                    $scope.printPharmacySales(dmPrintInputForNotIncludeClaim);
                }
                if (savehitcompleted == 1)
                    $scope.clear();
            } else {
                console.log(data);
                var dmPrintInput = preparePrintData(data);
                $scope.printPharmacySales(dmPrintInput);
                if (savehitcompleted == 1)
                    $scope.clear();
            }
        };

        function preparePrintDataForIncludeClaim(data) {
            console.log('preparePrintDataForIncludeClaim starts');

            var vIPOPNO = '';
            var vEncounterType = '';
            var vGST = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vFDOB = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var vRefName = '';
            var vGuarantorName = '';
            var NeedToPrint = false;
            var Comments = '';
            var vTinNo = '';
            var BillTypeId = '';
            var IsDirectDGBill = '';
            Comments = data.PatientBills.Comments;

            if (data.PatientBills.Encounter) vIPOPNO = '' + data.PatientBills.Encounter.VisitIdentifier;
            if (data.Encounter) vEncounterType = '' + data.Encounter.EncounterType.Description;
            if (data.PatientBills.Facility) vGST = '' + data.PatientBills.Facility.GstNumber;

            if (data.PatientBills.User) {
                if (data.PatientBills.User.Title) vUTitle = data.PatientBills.User.Title.Description;
                if (data.PatientBills.User.FirstName) vUFirstName = data.PatientBills.User.FirstName;
                if (data.PatientBills.User.LastName) vULastName = data.PatientBills.User.LastName;
                vDrName = (vUTitle + ' ' + vUFirstName + ' ' + vULastName)
            }
            if (data.PatientBills.CreatedUser) {
                if (data.PatientBills.CreatedUser.Title) vCTitle = data.PatientBills.CreatedUser.Title.Description;
                if (data.PatientBills.CreatedUser.FirstName) vCFirstName = data.PatientBills.CreatedUser.FirstName;
                if (data.PatientBills.CreatedUser.LastName) vCLastName = data.PatientBills.CreatedUser.LastName;
            }
            if (data.PatientBills.Patient) {
                if (data.PatientBills.Patient.Title) vPTitle = data.PatientBills.Patient.Title.Description;
                if (data.PatientBills.Patient.FirstName) vPFirstName = data.PatientBills.Patient.FirstName;
                if (data.PatientBills.Patient.LastName) vPLastName = data.PatientBills.Patient.LastName;
                if (data.PatientBills.Patient.MRN) vMRN = data.PatientBills.Patient.MRN;
                if (data.PatientBills.Patient.Age) vAge = '' + data.PatientBills.Patient.Age;
                if (data.PatientBills.Patient.DOB) vDOB = '' + data.PatientBills.Patient.DOB;
                if (data.PatientBills.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientBills.Patient.DOB);
                if (data.PatientBills.Patient.Gender) vGender = '' + data.PatientBills.Patient.Gender.Description;
            } else {
                if (data.PatientBills.Title)
                    vPTitle = data.PatientBills.Title.Description;
                vPFirstName = data.PatientBills.PatientName;
                if (data.PatientBills.Age)
                    vAge = '' + data.PatientBills.Age;
                if (data.PatientBills.Gender)
                    vGender = '' + data.PatientBills.Gender.Description;
                if (data.PatientBills.DoctorName)
                    vDrName = '' + data.PatientBills.DoctorName;
            }
            if (data.PatientBills.Guarantor) {
                if (data.PatientBills.Guarantor.GuarantorName) vGuarantorName = '' + data.PatientBills.Guarantor.GuarantorName;
            }
            if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                if (data.PatientBills.GuarantorMaster) {
                    if (data.PatientBills.GuarantorMaster.GuarantorName) vGuarantorName = '' + data.PatientBills.GuarantorMaster.GuarantorName;
                }
            }
            if (data.PatientBills.StoreMaster) vTinNo = data.PatientBills.StoreMaster.TinNo;
            var TotalQuantity = 0;
            var TotalNetAmount = 0;
            var TotalNetAmountBeforeGST = 0;
            var TotalGSTAmount = 0;
            var TotalCGstAmount = 0;
            var TotalSGstAmount = 0;
            var TotalProportionateDiscount = 0;
            var TotalAmount = 0;
            var TotalGrossAmount = 0;
            var TotalDiscountAmount = 0;
            var TotalNoOfItems = data.PatientBills.PatientBillDetails.length;

            for (var idx in data.PatientBills.PatientBillDetails) {
                var billDetail = data.PatientBills.PatientBillDetails[idx];
                if (billDetail.IsNonClaimable == true) {
                    TotalQuantity = TotalQuantity + billDetail.Quantity;
                    TotalNetAmount = TotalNetAmount + billDetail.NetAmount;
                    TotalNetAmountBeforeGST = TotalNetAmountBeforeGST + billDetail.NetAmountBeforeGST;
                    TotalGSTAmount = TotalGSTAmount + billDetail.GSTAmount;
                    TotalCGstAmount = TotalCGstAmount + billDetail.CGstAmount;
                    TotalSGstAmount = TotalSGstAmount + billDetail.SGstAmount;
                    TotalProportionateDiscount = TotalProportionateDiscount + billDetail.ProportionateDiscount;
                    TotalAmount = TotalAmount + billDetail.Amount;
                    TotalGrossAmount = TotalGrossAmount + billDetail.GrossAmount;
                    TotalDiscountAmount = TotalDiscountAmount + billDetail.DiscountAmount;
                    NeedToPrint = true;
                }
            }

            var BillType = vEncounterType + ' CASH BILL';
            var BillTypeId = data.PatientBills.BillTypeId;
            var IsDirectDGBill = data.PatientBills.IsDirectDGBill;
            /* if (data.PatientBills.IsPharmacyBill == true &&
                data.PatientBills.IsPaidFully == false &&
                data.PatientBills.OutStandingAmount > 0) {
                BillType = vEncounterType + ' CREDIT BILL';
            } */
            var BillDate = utl.Formatter.getDateString(data.PatientBills.BillDateTime);
            var RefName = data.PatientBills.Referral.ReferralName;
            var BillDateTime = new Date(data.PatientBills.BillDateTime);
            var Minutes = BillDateTime.getMinutes();
            var Hours = BillDateTime.getHours();
            var Meridiem = 'AM';
            if (Hours > 12 || Hours == 12) {
                Meridiem = 'PM';
                Hours = Hours - 12;
            }
            if (Hours < 10) {
                Hours = '0' + Hours;
            }
            if (Minutes < 10) {
                Minutes = '0' + Minutes;
            }
            var BillTime = Hours + ':' + Minutes + ' ' + Meridiem;

            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: vDrName || '',
                billno: '' + data.PatientBills.BillNumber,
                patientname: vPTitle + ' ' +
                    vPFirstName + ' ' + vPLastName,
                MRN: vMRN || ' ',
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                GuarantorName: vGuarantorName,
                billdate: utl.Formatter.getDateTimeString(data.PatientBills.BillDateTime),
                billedby: vCTitle + ' ' + vCFirstName + ' ' + vCLastName,
                BillType: BillType,
                BillDate: BillDate,
                BillTime: BillTime,
                ReferralName: RefName,
                TotalQuantity: TotalQuantity,
                TotalNetAmount: TotalNetAmount,
                TotalNetAmountBeforeGST: TotalNetAmountBeforeGST,
                TotalGSTAmount: TotalGSTAmount,
                TotalCGstAmount: TotalCGstAmount,
                TotalSGstAmount: TotalSGstAmount,
                TotalProportionateDiscount: TotalProportionateDiscount,
                TotalAmount: TotalAmount,
                TotalGrossAmount: TotalGrossAmount,
                TotalDiscountAmount: TotalDiscountAmount,
                TotalNoOfItems: TotalNoOfItems,
                NeedToPrint: NeedToPrint,
                Comments: Comments,
                TinNo: vTinNo,
                BillTypeId: BillTypeId,
                IsDirectDGBill: IsDirectDGBill,
                licenseno: '' + data.PatientBills.StoreMaster.LicenseNo
            };

            dmPrintInput.lines = [];
            var islno = 1;
            var GSTPercentages = Array();
            for (var idx in data.PatientBills.PatientBillDetails) {
                var billDetail = data.PatientBills.PatientBillDetails[idx];
                if (billDetail.IsNonClaimable == true) {
                    var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                    var manu = billDetail.ManufacturerName;
                    if (manu && manu.length > 3) {
                        manu = manu.substring(0, 3);
                    }

                    var batchid = billDetail.BatchId;
                    if (batchid && batchid.length > 6) {
                        batchid = batchid.substring(0, 6);
                    }

                    var cgstamt = billDetail.CGstAmount.toFixed(2);
                    var sgstamt = billDetail.SGstAmount.toFixed(2);

                    var vHSN = '';
                    if (billDetail.ItemMaster)
                        if (billDetail.ItemMaster.ProductRegNo)
                            vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                    var vSCH = '';
                    if (billDetail.ScheduleTypeDescription)
                        vSCH = billDetail.ScheduleTypeDescription;

                    var Location = '';
                    if (billDetail.RackName &&
                        billDetail.RackName != null &&
                        billDetail.RackName != '' &&
                        billDetail.RackName != undefined) {
                        Location = Location + billDetail.RackName;
                    }

                    if (billDetail.Shelf &&
                        billDetail.Shelf != null &&
                        billDetail.Shelf != '' &&
                        billDetail.Shelf != undefined) {
                        Location = Location + '/' + billDetail.Shelf;
                    }

                    if (billDetail.Tray &&
                        billDetail.Tray != null &&
                        billDetail.Tray != '' &&
                        billDetail.Tray != undefined) {
                        Location = Location + '/' + billDetail.Tray;
                    }

                    GSTPercentages.push(billDetail.GSTPercentage);

                    var DetailDiscountPercentage = billDetail.DiscountPercentage.toFixed(0);
                    var detail = {
                        ispace: ' ',
                        slno: islno++,
                        desc: billDetail.ItemName,
                        hsn: vHSN,
                        sch: vSCH,
                        batch: batchid,
                        exp: expiryDate,
                        qty: billDetail.Quantity,
                        mrp: billDetail.Rate.toFixed(2),
                        value: billDetail.NetAmountBeforeGST.toFixed(2),
                        gstamt: billDetail.GSTAmount,
                        gstper: billDetail.GSTPercentage,
                        beforegst: billDetail.NetAmountBeforeGST,
                        loc: billDetail.LocationId,
                        cgstper: billDetail.CGstPercentage,
                        cgstamt: cgstamt,
                        sgstper: billDetail.SGstPercentage,
                        sgstamt: sgstamt,
                        totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                        amount: billDetail.Amount.toFixed(2),
                        mfr: manu,
                        netamount: billDetail.NetAmount.toFixed(2),
                        DetailDiscountPercentage: DetailDiscountPercentage,
                        vLocation: Location
                    };
                    dmPrintInput.lines.push(detail);
                }
            }

            dmPrintInput.GSTDetails = [];
            let UniqueGSTPercentages = []
            for (let i = 0; i < GSTPercentages.length; i++) {
                if (UniqueGSTPercentages.indexOf(GSTPercentages[i]) == -1) {
                    UniqueGSTPercentages.push(GSTPercentages[i])
                }
            }

            for (var index in UniqueGSTPercentages) {
                var IndividualGSTPercentage = UniqueGSTPercentages[index];
                var IndividualGSTAmount = 0;
                var IndividualSGSTAmount = 0;
                var IndividualCGSTAmount = 0;
                for (var index1 in data.PatientBills.PatientBillDetails) {
                    var BillDetails = data.PatientBills.PatientBillDetails[index1];
                    if (BillDetails.IsNonClaimable == true) {
                        if (IndividualGSTPercentage == BillDetails.GSTPercentage) {
                            IndividualGSTAmount = IndividualGSTAmount + BillDetails.GSTAmount;
                            IndividualSGSTAmount = IndividualSGSTAmount + BillDetails.SGstAmount;
                            IndividualCGSTAmount = IndividualCGSTAmount + BillDetails.CGstAmount;
                        }
                    }
                }
                var GSTDetail = {
                    space: ' ',
                    IndividualGSTPercentage: IndividualGSTPercentage,
                    IndividualGSTAmount: IndividualGSTAmount.toFixed(2),
                    IndividualSGSTAmount: IndividualSGSTAmount.toFixed(2),
                    IndividualCGSTAmount: IndividualCGSTAmount.toFixed(2)
                };
                dmPrintInput.GSTDetails.push(GSTDetail);
            }
            console.log('preparePrintDataForIncludeClaim ends');
            return dmPrintInput;
        }

        function preparePrintDataForNotIncludeClaim(data) {
            console.log('preparePrintDataForNotIncludeClaim starts');

            var vIPOPNO = '';
            var vEncounterType = '';
            var vGST = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vFDOB = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var vGuarantorName = '';
            var vRefName = '';
            var NeedToPrint = false;
            var Comments = '';
            var vTinNo = '';
            var BillTypeId = '';
            var IsDirectDGBill = '';
            Comments = data.PatientBills.Comments;
            if (data.PatientBills.Encounter) vIPOPNO = '' + data.PatientBills.Encounter.VisitIdentifier;
            if (data.Encounter) vEncounterType = '' + data.Encounter.EncounterType.Description;
            if (data.PatientBills.Facility) vGST = '' + data.PatientBills.Facility.GstNumber;

            if (data.PatientBills.User) {
                if (data.PatientBills.User.Title) vUTitle = data.PatientBills.User.Title.Description;
                if (data.PatientBills.User.FirstName) vUFirstName = data.PatientBills.User.FirstName;
                if (data.PatientBills.User.LastName) vULastName = data.PatientBills.User.LastName;
                vDrName = (vUTitle + ' ' + vUFirstName + ' ' + vULastName)
            }
            if (data.PatientBills.CreatedUser) {
                if (data.PatientBills.CreatedUser.Title) vCTitle = data.PatientBills.CreatedUser.Title.Description;
                if (data.PatientBills.CreatedUser.FirstName) vCFirstName = data.PatientBills.CreatedUser.FirstName;
                if (data.PatientBills.CreatedUser.LastName) vCLastName = data.PatientBills.CreatedUser.LastName;
            }
            if (data.PatientBills.Patient) {
                if (data.PatientBills.Patient.Title) vPTitle = data.PatientBills.Patient.Title.Description;
                if (data.PatientBills.Patient.FirstName) vPFirstName = data.PatientBills.Patient.FirstName;
                if (data.PatientBills.Patient.LastName) vPLastName = data.PatientBills.Patient.LastName;
                if (data.PatientBills.Patient.MRN) vMRN = data.PatientBills.Patient.MRN;
                if (data.PatientBills.Patient.Age) vAge = '' + data.PatientBills.Patient.Age;
                if (data.PatientBills.Patient.DOB) vDOB = '' + data.PatientBills.Patient.DOB;
                if (data.PatientBills.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientBills.Patient.DOB);
                if (data.PatientBills.Patient.Gender) vGender = '' + data.PatientBills.Patient.Gender.Description;
            } else {
                if (data.PatientBills.Title)
                    vPTitle = data.PatientBills.Title.Description;
                vPFirstName = data.PatientBills.PatientName;
                if (data.PatientBills.Age)
                    vAge = '' + data.PatientBills.Age;
                if (data.PatientBills.Gender)
                    vGender = '' + data.PatientBills.Gender.Description;
                if (data.PatientBills.DoctorName)
                    vDrName = '' + data.PatientBills.DoctorName;
            }

            if (data.PatientBills.Guarantor) {
                if (data.PatientBills.Guarantor.GuarantorName) vGuarantorName = '' + data.PatientBills.Guarantor.GuarantorName;
            }
            if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                if (data.PatientBills.GuarantorMaster) {
                    if (data.PatientBills.GuarantorMaster.GuarantorName) vGuarantorName = '' + data.PatientBills.GuarantorMaster.GuarantorName;
                }
            }
            if (data.PatientBills.StoreMaster) vTinNo = data.PatientBills.StoreMaster.TinNo;
            var TotalQuantity = 0;
            var TotalNetAmount = 0;
            var TotalNetAmountBeforeGST = 0;
            var TotalGSTAmount = 0;
            var TotalCGstAmount = 0;
            var TotalSGstAmount = 0;
            var TotalProportionateDiscount = 0;
            var TotalAmount = 0;
            var TotalGrossAmount = 0;
            var TotalDiscountAmount = 0;
            var TotalNoOfItems = data.PatientBills.PatientBillDetails.length;

            for (var idx in data.PatientBills.PatientBillDetails) {
                var billDetail = data.PatientBills.PatientBillDetails[idx];
                if (billDetail.IsNonClaimable == false) {
                    TotalQuantity = TotalQuantity + billDetail.Quantity;
                    TotalNetAmount = TotalNetAmount + billDetail.NetAmount;
                    TotalNetAmountBeforeGST = TotalNetAmountBeforeGST + billDetail.NetAmountBeforeGST;
                    TotalGSTAmount = TotalGSTAmount + billDetail.GSTAmount;
                    TotalCGstAmount = TotalCGstAmount + billDetail.CGstAmount;
                    TotalSGstAmount = TotalSGstAmount + billDetail.SGstAmount;
                    TotalProportionateDiscount = TotalProportionateDiscount + billDetail.ProportionateDiscount;
                    TotalAmount = TotalAmount + billDetail.Amount;
                    TotalGrossAmount = TotalGrossAmount + billDetail.GrossAmount;
                    TotalDiscountAmount = TotalDiscountAmount + billDetail.DiscountAmount;
                    NeedToPrint = true;
                }
            }

            var BillTypeId = data.PatientBills.BillTypeId;
            var BillType = vEncounterType + ' CREDIT BILL';
            var IsDirectDGBill = data.PatientBills.IsDirectDGBill;
            /* if (data.PatientBills.IsPharmacyBill == true &&
                data.PatientBills.IsPaidFully == false &&
                data.PatientBills.OutStandingAmount > 0) {
                BillType = vEncounterType + ' CREDIT BILL';
            } */
            var RefName = data.PatientBills.Referral.ReferralName;
            var BillDate = utl.Formatter.getDateString(data.PatientBills.BillDateTime);
            var BillDateTime = new Date(data.PatientBills.BillDateTime);
            var Minutes = BillDateTime.getMinutes();
            var Hours = BillDateTime.getHours();
            var Meridiem = 'AM';
            if (Hours > 12 || Hours == 12) {
                Meridiem = 'PM';
                Hours = Hours - 12;
            }
            if (Hours < 10) {
                Hours = '0' + Hours;
            }
            if (Minutes < 10) {
                Minutes = '0' + Minutes;
            }
            var BillTime = Hours + ':' + Minutes + ' ' + Meridiem;

            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: vDrName || '',
                billno: '' + data.PatientBills.BillNumber,
                patientname: vPTitle + ' ' +
                    vPFirstName + ' ' + vPLastName,
                MRN: vMRN || ' ',
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                ReferralName: RefName,
                GuarantorName: vGuarantorName,
                billdate: utl.Formatter.getDateTimeString(data.PatientBills.BillDateTime),
                billedby: vCTitle + ' ' + vCFirstName + ' ' + vCLastName,
                ReferralName: RefName,
                BillType: BillType,
                BillDate: BillDate,
                BillTime: BillTime,
                TotalQuantity: TotalQuantity,
                TotalNetAmount: TotalNetAmount,
                TotalNetAmountBeforeGST: TotalNetAmountBeforeGST,
                TotalGSTAmount: TotalGSTAmount,
                TotalCGstAmount: TotalCGstAmount,
                TotalSGstAmount: TotalSGstAmount,
                TotalProportionateDiscount: TotalProportionateDiscount,
                TotalAmount: TotalAmount,
                TotalGrossAmount: TotalGrossAmount,
                TotalDiscountAmount: TotalDiscountAmount,
                TotalNoOfItems: TotalNoOfItems,
                NeedToPrint: NeedToPrint,
                Comments: Comments,
                TinNo: vTinNo,
                BillTypeId: BillTypeId,
                IsDirectDGBill: IsDirectDGBill,
                licenseno: '' + data.PatientBills.StoreMaster.LicenseNo
            };

            dmPrintInput.lines = [];
            var islno = 1;
            var GSTPercentages = Array();
            for (var idx in data.PatientBills.PatientBillDetails) {
                var billDetail = data.PatientBills.PatientBillDetails[idx];
                if (billDetail.IsNonClaimable == false) {
                    var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                    var manu = billDetail.ManufacturerName;
                    if (manu && manu.length > 3) {
                        manu = manu.substring(0, 3);
                    }

                    var batchid = billDetail.BatchId;
                    if (batchid && batchid.length > 6) {
                        batchid = batchid.substring(0, 6);
                    }

                    var cgstamt = billDetail.CGstAmount.toFixed(2);
                    var sgstamt = billDetail.SGstAmount.toFixed(2);

                    var vHSN = '';
                    if (billDetail.ItemMaster)
                        if (billDetail.ItemMaster.ProductRegNo)
                            vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                    var vSCH = '';
                    if (billDetail.ScheduleTypeDescription)
                        vSCH = billDetail.ScheduleTypeDescription;

                    var Location = '';
                    if (billDetail.RackName &&
                        billDetail.RackName != null &&
                        billDetail.RackName != '' &&
                        billDetail.RackName != undefined) {
                        Location = Location + billDetail.RackName;
                    }

                    if (billDetail.Shelf &&
                        billDetail.Shelf != null &&
                        billDetail.Shelf != '' &&
                        billDetail.Shelf != undefined) {
                        Location = Location + '/' + billDetail.Shelf;
                    }

                    if (billDetail.Tray &&
                        billDetail.Tray != null &&
                        billDetail.Tray != '' &&
                        billDetail.Tray != undefined) {
                        Location = Location + '/' + billDetail.Tray;
                    }

                    GSTPercentages.push(billDetail.GSTPercentage);

                    var DetailDiscountPercentage = billDetail.DiscountPercentage.toFixed(0);
                    var detail = {
                        ispace: ' ',
                        slno: islno++,
                        desc: billDetail.ItemName,
                        hsn: vHSN,
                        sch: vSCH,
                        batch: batchid,
                        exp: expiryDate,
                        qty: billDetail.Quantity,
                        mrp: billDetail.Rate.toFixed(2),
                        value: billDetail.NetAmountBeforeGST.toFixed(2),
                        gstamt: billDetail.GSTAmount,
                        gstper: billDetail.GSTPercentage,
                        beforegst: billDetail.NetAmountBeforeGST,
                        loc: billDetail.LocationId,
                        cgstper: billDetail.CGstPercentage,
                        cgstamt: cgstamt,
                        sgstper: billDetail.SGstPercentage,
                        sgstamt: sgstamt,
                        totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                        amount: billDetail.Amount.toFixed(2),
                        mfr: manu,
                        netamount: billDetail.NetAmount.toFixed(2),
                        DetailDiscountPercentage: DetailDiscountPercentage,
                        vLocation: Location
                    };
                    dmPrintInput.lines.push(detail);
                }
            }

            dmPrintInput.GSTDetails = [];
            let UniqueGSTPercentages = []
            for (let i = 0; i < GSTPercentages.length; i++) {
                if (UniqueGSTPercentages.indexOf(GSTPercentages[i]) == -1) {
                    UniqueGSTPercentages.push(GSTPercentages[i])
                }
            }

            for (var index in UniqueGSTPercentages) {
                var IndividualGSTPercentage = UniqueGSTPercentages[index];
                var IndividualGSTAmount = 0;
                var IndividualSGSTAmount = 0;
                var IndividualCGSTAmount = 0;
                for (var index1 in data.PatientBills.PatientBillDetails) {
                    var BillDetails = data.PatientBills.PatientBillDetails[index1];
                    if (BillDetails.IsNonClaimable == false) {
                        if (IndividualGSTPercentage == BillDetails.GSTPercentage) {
                            IndividualGSTAmount = IndividualGSTAmount + BillDetails.GSTAmount;
                            IndividualSGSTAmount = IndividualSGSTAmount + BillDetails.SGstAmount;
                            IndividualCGSTAmount = IndividualCGSTAmount + BillDetails.CGstAmount;
                        }
                    }
                }
                var GSTDetail = {
                    space: ' ',
                    IndividualGSTPercentage: IndividualGSTPercentage,
                    IndividualGSTAmount: IndividualGSTAmount.toFixed(2),
                    IndividualSGSTAmount: IndividualSGSTAmount.toFixed(2),
                    IndividualCGSTAmount: IndividualCGSTAmount.toFixed(2)
                };
                dmPrintInput.GSTDetails.push(GSTDetail);
            }
            console.log('preparePrintDataForNotIncludeClaim ends');
            return dmPrintInput;
        }

        function preparePrintData(data) {
            console.log('preparePrintData starts');

            var vIPOPNO = '';
            var vEncounterType = '';
            var vGST = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vTinNo = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vFDOB = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var vGuarantorName = '';
            var nostoreheader = 0;
            var vStoreheading1 = '';
            var vStoreheading2 = '';
            var vStoreheading3 = '';
            var vStoreheading4 = '';
            var vStorefooter1 = '';
            var vStorefooter2 = '';
            var vStorefooter3 = '';
            var vStorefooter4 = '';
            var DepartmentName = '';
            var vPatientGuarantorName = '';
            var vGuarantorTypeId = '';
            var vGuarantorLetterNo = '';
            var vEmployeeId = '';
            var vRefName = '';

            if (data.PatientBills.Encounter) vIPOPNO = '' + data.PatientBills.Encounter.VisitIdentifier;
            if (data.Encounter) vEncounterType = '' + data.Encounter.EncounterType.Description;
            if (data.PatientBills.Facility) vGST = '' + data.PatientBills.Facility.GstNumber;

            if (data.PatientBills.Department) {
                DepartmentName = data.PatientBills.Department.DepartmentName;
            }

            if (data.PatientBills.User) {
                if (data.PatientBills.User.Title) vUTitle = data.PatientBills.User.Title.Description;
                if (data.PatientBills.User.FirstName) vUFirstName = data.PatientBills.User.FirstName;
                if (data.PatientBills.User.LastName) vULastName = data.PatientBills.User.LastName;
                vDrName = (vUTitle + ' ' + vUFirstName + ' ' + vULastName)
            }
            if (data.PatientBills.CreatedUser) {
                if (data.PatientBills.CreatedUser.Title) vCTitle = data.PatientBills.CreatedUser.Title.Description;
                if (data.PatientBills.CreatedUser.FirstName) vCFirstName = data.PatientBills.CreatedUser.FirstName;
                if (data.PatientBills.CreatedUser.LastName) vCLastName = data.PatientBills.CreatedUser.LastName;
            }
            if (data.PatientBills.Patient) {
                if (data.PatientBills.Patient.Title) vPTitle = data.PatientBills.Patient.Title.Description;
                if (data.PatientBills.Patient.FirstName) vPFirstName = data.PatientBills.Patient.FirstName;
                if (data.PatientBills.Patient.LastName) vPLastName = data.PatientBills.Patient.LastName;
                if (data.PatientBills.Patient.MRN) vMRN = data.PatientBills.Patient.MRN;
                if (data.PatientBills.Patient.Age) vAge = '' + data.PatientBills.Patient.Age;
                if (data.PatientBills.Patient.DOB) vDOB = '' + data.PatientBills.Patient.DOB;
                if (data.PatientBills.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientBills.Patient.DOB);
                if (data.PatientBills.Patient.Gender) vGender = '' + data.PatientBills.Patient.Gender.Description;

            } else {
                if (data.PatientBills.Title)
                    vPTitle = data.PatientBills.Title.Description;
                vPFirstName = data.PatientBills.PatientName;
                if (data.PatientBills.Age)
                    vAge = '' + data.PatientBills.Age;
                if (data.PatientBills.Gender)
                    vGender = '' + data.PatientBills.Gender.Description;
                if (data.PatientBills.DoctorName)
                    vDrName = '' + data.PatientBills.DoctorName;
            }

            if (data.PatientBills.GuarantorMaster) {
                if (data.PatientBills.GuarantorMaster.GuarantorName) vGuarantorName = '' + data.PatientBills.GuarantorMaster.GuarantorName;
            }
            if (data.Encounter) {
                if (data.Encounter.PatientGuarantor) {
                    if (data.Encounter.PatientGuarantor.GuarantorName) vPatientGuarantorName = '' + data.Encounter.PatientGuarantor.GuarantorName;
                    if (data.Encounter.PatientGuarantor.GuarantorTypeId) vGuarantorTypeId = '' + data.Encounter.PatientGuarantor.GuarantorTypeId;
                    if (data.Encounter.PatientGuarantor.GuarantorLetterNo) vGuarantorLetterNo = '' + data.Encounter.PatientGuarantor.GuarantorLetterNo;
                    if (data.Encounter.PatientGuarantor.EmployeeId) vEmployeeId = '' + data.Encounter.PatientGuarantor.EmployeeId;
                }
            }

            if (data.PatientBills.StoreMaster) vTinNo = data.PatientBills.StoreMaster.TinNo;
            if (data.PrintData.pharmacydmprintenable == '0') {
                nostoreheader = 1;
            }
            if (data.PrintData.heading1)
                vStoreheading1 = data.PrintData.heading1
            if (data.PrintData.heading2)
                vStoreheading2 = data.PrintData.heading2
            if (data.PrintData.heading3)
                vStoreheading3 = data.PrintData.heading3
            if (data.PrintData.heading4)
                vStoreheading4 = data.PrintData.heading4
            if (data.PrintData.footer1)
                vStorefooter1 = data.PrintData.footer1
            if (data.PrintData.footer2)
                vStorefooter2 = data.PrintData.footer2
            if (data.PrintData.footer3)
                vStorefooter3 = data.PrintData.footer3
            if (data.PrintData.footer4)
                vStorefooter4 = data.PrintData.footer4

            var vPayTypeId = -1;
            var BillTypeId = '';
            var IsDirectDGBill = '';
            var GrossAmount = 0;
            var TotalGSTAmount = data.PatientBills.GSTAmount;
            var TotalBillAmount = data.PatientBills.BillAmount;
            var TotalCGSTAmount = data.PatientBills.CGstAmount;
            var TotalSGSTAmount = data.PatientBills.SGstAmount;
            GrossAmount = TotalBillAmount - TotalGSTAmount;
            var TotalNoOfItems = data.PatientBills.PatientBillDetails.length;
            var TotalQuantity = 0;
            var TotalGstPercent = 0;
            var TotalCGstPercent = 0;
            var TotalSGstPercent = 0;
            var GSTlistitem = 0;
            var Total28perGstPercent = 0;
            var Total18perGstPercent = 0;
            var Total14perGstPercent = 0;
            var Total12perGstPercent = 0;
            var Total9perGstPercent = 0;
            var Total7perGstPercent = 0;
            var Total6perGstPercent = 0;
            var Total5perGstPercent = 0;
            var Total0perGstPercent = 0;

            var Total28perCGSTAmount = 0;
            var Total18perCGSTAmount = 0;
            var Total14perCGSTAmount = 0;
            var Total12perCGSTAmount = 0;
            var Total9perCGSTAmount = 0;
            var Total7perCGSTAmount = 0;
            var Total6perCGSTAmount = 0;
            var Total5perCGSTAmount = 0;
            var Total0perCGSTAmount = 0;

            var Total28perSGSTAmount = 0;
            var Total18perSGSTAmount = 0;
            var Total14perSGSTAmount = 0;
            var Total12perSGSTAmount = 0;
            var Total9perSGSTAmount = 0;
            var Total7perSGSTAmount = 0;
            var Total6perSGSTAmount = 0;
            var Total5perSGSTAmount = 0;
            var Total0perSGSTAmount = 0;
            var GuarantorName = 0;
            for (var idx in data.PatientBills.PatientBillDetails) {
                var billDetail = data.PatientBills.PatientBillDetails[idx];
                TotalQuantity = TotalQuantity + billDetail.Quantity;
                TotalGstPercent = TotalGstPercent + billDetail.GSTPercentage;
                if (billDetail.GSTPercentage == 12) {
                    Total12perGstPercent = billDetail.GSTPercentage;
                    Total12perCGSTAmount = Total12perCGSTAmount + billDetail.CGstAmount;
                    Total12perSGSTAmount = Total12perSGSTAmount + billDetail.SGstAmount
                } else if (billDetail.GSTPercentage == 28) {
                    Total28perGstPercent = billDetail.GSTPercentage;
                    Total28perCGSTAmount = Total28perCGSTAmount + billDetail.CGstAmount;
                    Total28perSGSTAmount = Total28perSGSTAmount + billDetail.SGstAmount

                } else if (billDetail.GSTPercentage == 18) {
                    Total18perGstPercent = billDetail.GSTPercentage;
                    Total18perCGSTAmount = Total18perCGSTAmount + billDetail.CGstAmount;
                    Total18perSGSTAmount = Total18perSGSTAmount + billDetail.SGstAmount
                } else if (billDetail.GSTPercentage == 5) {
                    Total5perGstPercent = billDetail.GSTPercentage;
                    Total5perCGSTAmount = Total5perCGSTAmount + billDetail.CGstAmount;
                    Total5perSGSTAmount = Total5perSGSTAmount + billDetail.SGstAmount
                } else if (billDetail.GSTPercentage == 0) {
                    Total0perGstPercent = billDetail.GSTPercentage;
                    Total0perCGSTAmount = Total0perCGSTAmount + billDetail.CGstAmount;
                    Total0perSGSTAmount = Total0perSGSTAmount + billDetail.SGstAmount
                }
                TotalCGstPercent = TotalCGstPercent + billDetail.CGstPercentage;
                TotalSGstPercent = TotalSGstPercent + billDetail.SGstPercentage;
            }
            var BillType = vEncounterType + ' CASH BILL';
            if (data.PatientBills.IsPharmacyBill == true &&
                data.PatientBills.IsPaidFully == false &&
                data.PatientBills.OutStandingAmount > 0) {
                BillType = vEncounterType + ' CREDIT BILL';
            }
            var BillTypeId = data.PatientBills.BillTypeId;
            var IsDirectDGBill = data.PatientBills.IsDirectDGBill;
            var RefName = data.PatientBills.Referral.ReferralName;
            var BillDate = utl.Formatter.getDateString(data.PatientBills.BillDateTime);
            var BillDateTime = new Date(data.PatientBills.BillDateTime);
            var Minutes = BillDateTime.getMinutes();
            var Hours = BillDateTime.getHours();
            var Meridiem = 'AM';
            if (Hours > 12 || Hours == 12) {
                Meridiem = 'PM';
                Hours = Hours - 12;
            }
            if (Hours < 10) {
                Hours = '0' + Hours;
            }
            if (Minutes < 10) {
                Minutes = '0' + Minutes;
            }
            var BillTime = Hours + ':' + Minutes + ' ' + Meridiem;

            if (data.PatientBills.PatientPaymentDetails)
                for (var idxpy in data.PatientBills.PatientPaymentDetails)
                    vPayTypeId = data.PatientBills.PatientPaymentDetails[idxpy].PaymentTypeId;

            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: vDrName || '',
                licenseno: '' + data.PatientBills.StoreMaster.LicenseNo,
                billno: '' + data.PatientBills.BillNumber,
                patientname: vPTitle + ' ' +
                    vPFirstName + ' ' + vPLastName,
                GstNo: vGST,
                TinNo: vTinNo,
                MRN: vMRN,
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                GuarantorName: vGuarantorName,
                billdate: utl.Formatter.getDateTimeString(data.PatientBills.BillDateTime),
                // addressline: data.PatientBills.Patient.AddressLine1,
                // state: data.PatientBills.Patient.State,
                // city: data.PatientBills.Patient.City,
                // pincode: '' + data.PatientBills.Patient.Pincode || '',
                totalamount: data.PatientBills.BillAmount,
                totDiscont: data.PatientBills.BillDiscount,
                totroundoff: data.PatientBills.RoundOffValue,
                totpaidamt: data.PatientBills.PaidAmount,
                billedby: vCTitle + ' ' + vCFirstName + ' ' + vCLastName,
                paytypeid: vPayTypeId || -1,
                nostoreheader: nostoreheader,
                vStoreheading1: vStoreheading1,
                vStoreheading2: vStoreheading2,
                vStoreheading3: vStoreheading3,
                vStoreheading4: vStoreheading4,
                vStorefooter1: vStorefooter1,
                vStorefooter2: vStorefooter2,
                vStorefooter3: vStorefooter3,
                vStorefooter4: vStorefooter4,
                GrossAmount: GrossAmount,
                TotalCGSTAmount: TotalCGSTAmount,
                TotalSGSTAmount: TotalSGSTAmount,
                TotalGSTAmount: TotalGSTAmount,
                TotalNoOfItems: TotalNoOfItems,
                TotalQuantity: TotalQuantity,
                TotalGstPercent: TotalGstPercent,
                TotalCGstPercent: TotalCGstPercent,
                TotalSGstPercent: TotalSGstPercent,
                BillType: BillType,
                BillDate: BillDate,
                BillTime: BillTime,
                Total12perGstPercent: Total12perGstPercent,
                Total12perCGSTAmount: Total12perCGSTAmount,
                Total12perSGSTAmount: Total12perSGSTAmount,
                Total28perGstPercent: Total28perGstPercent,
                Total28perCGSTAmount: Total28perCGSTAmount,
                Total28perSGSTAmount: Total28perSGSTAmount,
                Total18perGstPercent: Total18perGstPercent,
                Total18perCGSTAmount: Total18perCGSTAmount,
                Total18perSGSTAmount: Total18perSGSTAmount,
                Total5perGstPercent: Total5perGstPercent,
                Total5perCGSTAmount: Total5perCGSTAmount,
                Total5perSGSTAmount: Total5perSGSTAmount,
                Total0perGstPercent: Total0perGstPercent,
                Total0perCGSTAmount: Total0perCGSTAmount,
                Total0perSGSTAmount: Total0perSGSTAmount,
                DepartmentName: DepartmentName,
                PatientGuarantorName: vPatientGuarantorName,
                GuarantorTypeId: vGuarantorTypeId,
                GuarantorLetterNo: vGuarantorLetterNo,
                EmployeeId: vEmployeeId,
                BillTypeId: BillTypeId,
                IsDirectDGBill: IsDirectDGBill,
                ReferralName: RefName,
            };

            dmPrintInput.lines = [];
            var islno = 1;
            var GSTPercentages = Array();
            for (var idx in data.PatientBills.PatientBillDetails) {
                var billDetail = data.PatientBills.PatientBillDetails[idx];
                var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                var manu = billDetail.ManufacturerName;
                if (manu && manu.length > 3) {
                    manu = manu.substring(0, 3);
                }

                var batchid = billDetail.BatchId;
                if (batchid && batchid.length > 6) {
                    batchid = batchid.substring(0, 6);
                }

                var cgstamt = billDetail.CGstAmount.toFixed(2);
                var sgstamt = billDetail.SGstAmount.toFixed(2);

                var vHSN = '';
                if (billDetail.ItemMaster)
                    if (billDetail.ItemMaster.ProductRegNo)
                        vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                var vSCH = '';
                if (billDetail.ScheduleTypeDescription)
                    vSCH = billDetail.ScheduleTypeDescription;
                // var GSTlistitem = '';
                // if(billDetail.ItemName == billDetail.GSTPercentage)
                // vGSTlistitem = billDetail.GSTPercentage;
                // else(billDetail.ItemName != billDetail.GSTPercentage)
                // vGSTlistitem = billDetail.GSTPercentage;

                var Location = '';
                if (billDetail.RackName &&
                    billDetail.RackName != null &&
                    billDetail.RackName != '' &&
                    billDetail.RackName != undefined) {
                    Location = Location + billDetail.RackName;
                }

                if (billDetail.Shelf &&
                    billDetail.Shelf != null &&
                    billDetail.Shelf != '' &&
                    billDetail.Shelf != undefined) {
                    Location = Location + '/' + billDetail.Shelf;
                }

                if (billDetail.Tray &&
                    billDetail.Tray != null &&
                    billDetail.Tray != '' &&
                    billDetail.Tray != undefined) {
                    Location = Location + '/' + billDetail.Tray;
                }

                GSTPercentages.push(billDetail.GSTPercentage);

                var DetailDiscountPercentage = billDetail.DiscountPercentage.toFixed(0);
                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    desc: billDetail.ItemName,
                    hsn: vHSN,
                    sch: vSCH,
                    batch: batchid,
                    exp: expiryDate,
                    qty: billDetail.Quantity,
                    mrp: billDetail.Rate.toFixed(2),
                    value: billDetail.NetAmountBeforeGST.toFixed(2),
                    gstamt: billDetail.GSTAmount,
                    gstper: billDetail.GSTPercentage,

                    beforegst: billDetail.NetAmountBeforeGST,
                    loc: billDetail.LocationId,
                    cgstper: billDetail.CGstPercentage,
                    cgstamt: cgstamt,
                    sgstper: billDetail.SGstPercentage,
                    sgstamt: sgstamt,
                    totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                    //totbfrgst: (),
                    amount: billDetail.Amount.toFixed(2),
                    mfr: manu,
                    netamount: billDetail.NetAmount.toFixed(2),
                    DetailDiscountPercentage: DetailDiscountPercentage,
                    vLocation: Location
                };

                dmPrintInput.lines.push(detail);
            }

            dmPrintInput.GSTDetails = [];
            let UniqueGSTPercentages = []
            for (let i = 0; i < GSTPercentages.length; i++) {
                if (UniqueGSTPercentages.indexOf(GSTPercentages[i]) == -1) {
                    UniqueGSTPercentages.push(GSTPercentages[i])
                }
            }

            for (var index in UniqueGSTPercentages) {
                var IndividualGSTPercentage = UniqueGSTPercentages[index];
                var IndividualGSTAmount = 0;
                var IndividualSGSTAmount = 0;
                var IndividualCGSTAmount = 0;
                for (var index1 in data.PatientBills.PatientBillDetails) {
                    var BillDetails = data.PatientBills.PatientBillDetails[index1];
                    if (IndividualGSTPercentage == BillDetails.GSTPercentage) {
                        IndividualGSTAmount = IndividualGSTAmount + BillDetails.GSTAmount;
                        IndividualSGSTAmount = IndividualSGSTAmount + BillDetails.SGstAmount;
                        IndividualCGSTAmount = IndividualCGSTAmount + BillDetails.CGstAmount;
                    }
                }
                var GSTDetail = {
                    space: ' ',
                    IndividualGSTPercentage: IndividualGSTPercentage,
                    IndividualGSTAmount: IndividualGSTAmount.toFixed(2),
                    IndividualSGSTAmount: IndividualSGSTAmount.toFixed(2),
                    IndividualCGSTAmount: IndividualCGSTAmount.toFixed(2)
                };
                dmPrintInput.GSTDetails.push(GSTDetail);
            }
            console.log('preparePrintData ends');
            return dmPrintInput;
        }

        /* Pharmacy dotmatrix print ends */

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    nextId = "doctorid";
                    $('#' + nextId).focus();
                } else if (nextId == "doctorid") {
                    if ($scope.currentcontext && $scope.currentcontext.isnewpatient) {
                        nextId = "dpmobileid";
                        $('#' + nextId).focus();
                    } else {
                        var idx = $scope.PatientBillDetails.length - 1;
                        nextId = "desc" + '' + idx;
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "dpmobileid") {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }

            }
        };

        $scope.startinterval = null;

        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) { // right
                nextId = nextId + index;
                $('#' + nextId).select();
                $('#' + nextId).focus();
            } else if (event.keyCode == 37) { // left
                prevId = prevId + index;
                $('#' + prevId).focus();
            } else if (event.keyCode == 38) { // Up
                if (upId == 'qty') {
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
                    $scope.ValidQty(downId + index);
                    $scope.ChooseBatches(index, item);
                    if ($scope.separatePaymentCounter == 1) {
                        $scope.IsSeparatePharmacyCounter();
                    } else {
                        $scope.currentcontext.ReceiptAmt = $scope.currentcontext.TotNetAmount;
                        $scope.updateReceiptAmt();
                    }
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        var paytypedom = document.getElementById('paymenttype');
                        $scope.setCmbFocus(paytypedom);
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                } else if (nextId == 'qty') {
                    savehitcompleted = 0;
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 9) {
                if (nextId == 'desc') {
                    $scope.ValidQty(downId + index);
                    if ($scope.separatePaymentCounter == 1) {
                        $scope.IsSeparatePharmacyCounter();
                    } else {
                        $scope.currentcontext.ReceiptAmt = $scope.currentcontext.TotNetAmount;
                        $scope.updateReceiptAmt();
                    }
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.deletePatientBillDetails(index, item);
                $timeout(function () {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }, 10);
            }
        };

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() === '')
                $('#' + nextId).val(0);
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
                uichild.close();
            }, 100);
        };

        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "paymenttype") {
                    if ($scope.currentcontext.PaymentTypeId == 1) {
                        nextId = "receivedamt";
                        $('#' + nextId).focus();
                    } else {
                        var banknamedom = document.getElementById('BankName');
                        $scope.setCmbFocus(banknamedom);
                    }
                } else if (nextId == "BankName") {
                    $timeout(function () {
                        if ($scope.currentcontext.PaymentTypeId == 2) {
                            nextId = "chequeno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 3) {
                            nextId = "ddno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 4) {
                            nextId = "transationno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                            nextId = "cardno";
                            $('#' + nextId).focus();
                        }
                    }, 500);
                } else if (nextId == "cardno") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom1 = document.getElementById('TerminalNoId');
                        $scope.setCmbFocus(dom1);
                    }
                } else if (nextId == "TerminalNoId") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom2 = document.getElementById('CardType');
                        $scope.setCmbFocus(dom2);
                    }
                } else if (nextId == "chequeno") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "transationno") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "ddno") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "CollectedOn") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "Chequedate";
                        $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "dddate";
                        $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "transferredon";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "Chequedate") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "dddate") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "transferredon") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "CardType") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "receivedamt") {
                    if ($('#' + nextId).val() <= 0) {
                        var creditapproverdom = document.getElementById('creditapprover');
                        $scope.setCmbFocus(creditapproverdom);
                    } else {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                }
            }
            if (event.keyCode == 39) { //right
                if (nextId == "btnsubmit") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 37) { //left
                if (nextId == "saveAndApproveid") {
                    nextId = "btnsubmit";
                    $('#' + nextId).focus();
                }
            }
        };

        $scope.getLastBillDataCallback = function (scope, res, options, hasError) {
            if (res) {
                $scope.canLastdata = true;
                var billnumber = '';
                billnumber = res.BillNumber;

                if (billnumber === null)
                    billnumber = '#';

                var billamt = res.BillAmount;
                var discamt = res.BillDiscount;
                var roundamt = res.RoundOffValue;
                if (billamt) billamt = (billamt - discamt + roundamt).toFixed(2);
                $scope.LastTransactionDatetime = 'Bill No# / Amount: ' + billnumber + ' / ';
                $scope.LastBillAmt = billamt;
            }
        };

        $scope.getLastBillData = function (pageNo) {
            var vFromDate = utl.Formatter.getCurrentDate();
            var vToDate = utl.Formatter.getCurrentDate();
            var vfFromDate = '';
            var vfToDate = '';
            if (vFromDate || vToDate) {
                vfFromDate = $filter('date')(vFromDate, 'yyyy-MM-dd 00:00:00');
                vfToDate = $filter('date')(vToDate, 'yyyy-MM-dd 23:59:59');
            }
            var inputData = {
                FromDate: vfFromDate,
                ToDate: vfToDate
            };
            var options = {
                action: 'billing/patientbills/GetLastBillInfo',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.getLastBillDataCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPharmacyPrintPreference = function () {
            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('dmprint', 'pharmacydmprintenable');

            $scope.printpreferences =
                utl.FacilitySetting.getFacilitySettingValue('print', 'laserprintenable');

            if ($scope.dmprintpreferences <= 0) $('#btndmprint').hide();
            else $('#btndmprint').show();

            if ($scope.printpreferences <= 0) $('#btnprint').hide();
            else $('#btnprint').show();

            $scope.separatePaymentCounter =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'pharmacypendingpayments');

            $scope.IsSeparatePharmacyCounter();

        };

        $scope.getLastBillData();
        $scope.getPharmacyPrintPreference();
        $scope.initLookup();

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        /* Pharmacy  Sales - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 113 && savehitcompleted === 0 && $scope.canShowSaveBtn) { // F2  - SaveDraft
                $scope.saveDraft();
            }
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn) { // F2  - SaveAndApprove
                $scope.saveAndApprove();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.clear();
            }
            if (kCode == 119) { // F8  - Find Bills
                $scope.findBill();
            }
            if (e.altKey && kCode == 83 && savehitcompleted === 0 && $scope.canShowSaveBtn) { // alt + s  - SaveDraft
                $scope.saveDraft();
            }
            if (e.altKey && kCode == 65 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn) { // alt + s  - SaveAndApprove
                $scope.saveAndApprove();
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else {
                    $scope.print();
                }
            }
            if (kCode == 27) { // Esc
                $scope.autosearchpopup = 0;
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Pharmacy  Sales - Shortcut Keys - End */
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
        // Hosmat POS Integration
        function generateProcessId() {
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

            return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
        }
        var pollInterval = null;
        var pollEndTime = null;
        var countdownTimer = null;
        var pollingFrequency = 5000;
        $scope.paymentInProgress = false;
        $scope.setupPaymentDetails = function () {
            const patientName = $scope.newPatient.PatientName;
            const uhid = generateProcessId();
            const chargerate = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
            // const chargerate = '1';
            const email = '';
            const mobileno = $scope.newPatient.Mobile;
            $scope.processingid = generateProcessId();
            const uname = utl.Session.getCurrentUserId() + '-' + utl.Session.getCurrentUserName();
            var paymode = '';
            if ($scope.currentcontext.PaymentTypeId == 11) {
                paymode = "cards-upi";
            } else if ($scope.currentcontext.PaymentTypeId == 5) {
                paymode = "cards-swipe";
            }
            const callback_url = "https://hosmat.momentpay.live/ma/ariticpayment/callback";
            const redirect_url = "";
            // const redirect_url = "https://testing.momentpay.in/ma/thankyou-new";

            const myVal = '{"credentials":{"user":"hosmat_hospital","key":"cozQP6vmJNbcraqWlnLpzNJIiiIC5H4EIlHNkYcm0vBy0WNbs8","version":"HISV2"},"cashier_id": "' + uname + '", "customer_details": [{"customer_name": "' +
                patientName + '", "customer_id": "' + uhid + '", "payment_amount": "' + chargerate + '", "customer_email": "' + email + '","customer_phone": "' +
                mobileno + '"}], "processing_id": "' + $scope.processingid + '","paymode": "' + paymode + '","payment_fill":"pre_full","transaction_location":"Hosmat Hospital","callback_url": "' + callback_url + '","redirect_url": "' + redirect_url + '"}';

            $('#txttoken').val(myVal);
            $('#mid').val('KkZma9ph');
            $('#check_sum_hash').val('ZjMzNzk0MTFmZjE3YTA4YjlkNzI2NGM3NTBmMWFhMWMxNzAzOWY5N2ViNmYzYTA3ZTc5YzEzYTJjZGZlZDExYQ==');
        }
        $("#paynow").click(function () {
            if (!$scope.ApproveFromPayment()) {
                return;
            }
            $scope.setupPaymentDetails();
            var width = 800;
            var height = 700;
            var left = (screen.width - width) / 2;
            var top = (screen.height - height) / 2;
            var popupWindow = window.open("", "PaymentWindow", `width=${width},height=${height},top=${top},left=${left}`);
            if (popupWindow) {
                $("#iframeForm").attr("target", "PaymentWindow");
                $("#iframeForm").submit();
                startPolling($scope.processingid);
                var checkPopupClosed = setInterval(function () {
                    if (popupWindow.closed) {
                        console.log("Payment window closed. Stopping polling...");
                        clearInterval(checkPopupClosed);
                        stopPolling();
                        resetUI();
                    }
                }, 1000);
            } else {
                alert("Popup blocked! Please allow popups for this site.");
            }
        });
        $scope.$watchGroup(["currentcontext.ReceiptAmt", "currentcontext.PaymentTypeId"], function (newValues, oldValues) {
            const [newReceiptAmt, newPaymentTypeId] = newValues;
            const [oldReceiptAmt, oldPaymentTypeId] = oldValues;

            if (newReceiptAmt > 0 && (newReceiptAmt !== oldReceiptAmt || newPaymentTypeId !== oldPaymentTypeId)) {
                $scope.setupPaymentDetails();
            }
        });
        function resetUI() {
            $scope.$apply(function () {
                $scope.paymentInProgress = false;
                // $scope.countdown = 60;
            });
            console.log("UI Reset: Countdown stopped, payment process reset.");
        }
        function startPolling(processingid) {
            stopPolling();
            $scope.paymentInProgress = true;
            if ($scope.currentcontext.PaymentTypeId == 11) {
                $scope.countdown = 180;
            } else if ($scope.currentcontext.PaymentTypeId == 5) {
                $scope.countdown = 240;
            } else {
                $scope.countdown = 60;
            }

            pollEndTime = Date.now() + ($scope.countdown * 1000);

            startCountdown();

            pollInterval = $interval(function () {
                if (Date.now() >= pollEndTime) {
                    stopPolling();
                    console.log("Polling stopped: Time expired.");
                    return;
                }
                $scope.getListPOS(processingid);
            }, pollingFrequency);
        }

        function stopPolling() {
            if (pollInterval) {
                $interval.cancel(pollInterval);
                pollInterval = null;
                console.log("Polling stopped.");
            }
            if (countdownTimer) {
                $interval.cancel(countdownTimer);
                countdownTimer = null;
            }
            $scope.paymentInProgress = false;
        }

        function startCountdown() {
            countdownTimer = $interval(function () {
                if ($scope.countdown <= 0) {
                    stopPolling();
                } else {
                    $scope.countdown--;
                }
            }, 1000);
        }

        $scope.getListCallbackPOS = function (scope, res, options, hasError) {
            console.log('Checking transaction status:', res.body);
            const token = res.body.response_token || '';
            const ResponseCode = token.response_code || '';
            if (ResponseCode == '1200') {
                console.log('Transaction successful.');
                utl.Alert.showSuccessMsg($translate.instant('Transaction successful.'));
                stopPolling();
                $scope.item.ReferenceNumber = token.processing_id;
                if (token.payment_method === 'UPI') {
                    $scope.item.UPIRefNumber = token.transaction_id;
                } else {
                    $scope.item.AuthorizedCode = token.transaction_id;
                    $scope.item.AuthorizeNumber = token.transaction_id;
                }
                $scope.saveStatus(token);
                $scope.saveItem(3);
                $scope.currentcontext.retryTypeId = 1;
            } else {
                console.log('Transaction still pending...');
                $scope.currentcontext.retryTypeId = 2;
            }
        };

        $scope.getListPOS = function (processingid) {
            var inputData = {
                processing_id: processingid
            };

            var options = {
                action: 'Billing/PosMomentLog/MomentTransactionStatus',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.getListCallbackPOS
            };

            utl.Http.doAction(options);
        };
        $scope.retryTransaction = function () {
            if (!$scope.processingid) {
                console.warn("No processing ID found. Cannot retry transaction.");
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to Retry this Transaction',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onRetryConfirm,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onRetryConfirm = function () {
            $scope.getListPOS($scope.processingid);
        };
        $scope.saveStatus = function (req) {
            var inputData = {
                ResponseCode: req.response_code || null,
                ResponseMessage: req.response_message || null,
                ProcessingId: req.processing_id || null,
                Amount: req.customer_details? parseFloat(req.customer_details.amount) : null,
                TransactionId: req.transaction_id || null,
                PayMode: req.payment_method || null,
                RrnId: req.payment_response.rrn_id || null,
                CardNumber: req.payment_response.cardNumber || null,
                CardHolderName: req.payment_response.cardHolderName || null,
                CardType: req.payment_response.cardType || null,
                ApprovalCode: req.payment_response.approval_code || null,
                CustomerId: req.customer_details.customer_number,
                TransactionAmount: req.customer_details? parseFloat(req.customer_details.amount) : null,
            };

            var options = {
                action: 'Billing/PosMomentLog/AddPosMomentLog',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveStatusCallbackPOS
            };

            utl.Http.doAction(options);
        };
        $scope.saveStatusCallbackPOS  = function (scope, data, options, hasError) {
            if (!hasError) {
                utl.Alert.showSuccessMsg($translate.instant('Transaction Satus Saved'));
            }
        };
        $scope.ApproveFromPayment = function () {
            if ($scope.item.TotDiscAmount > 0 && !$scope.IsDiscountApproved) {
                utl.Alert.showErrorMsg($scope.DiscountAlert);
                return false;
            }
            if ($scope.currentcontext.TotBalanceAmt > 0 && !$scope.IsDueApproved) {
                utl.Alert.showErrorMsg($scope.DueAlert);
                return false;
            }
            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber === null) {
                //$scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            }

            if ((!$scope.item.PrivateDueId) && $scope.currentcontext.TotBalanceAmt != 0 && $scope.currentfilter.GuarantorTypeId == 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.dueapprover.lbl'));

                $scope.item.PrivateDueId = -1;
                $('#creditapprover').focus();
                return false;
            }
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;
            if ($scope.currentcontext.TotBalanceAmt === 0) {
                $scope.item.IsPaidFully = true;
            }
            if (!$scope.newPatient.PatientName || $scope.newPatient.PatientName == '' || !$scope.newPatient.GenderId ||
                !$scope.newPatient.Age || $scope.newPatient.Age == '' || !$scope.newPatient.Mobile || $scope.newPatient.Mobile == '') {
                utl.Alert.showErrorMsg($translate.instant('Please Enter All required fields'));
                return;
            }

            if ($scope.currentcontext.DiscountApprovedBy > 0) {
                if (!$scope.currentfilter.GuarantorTypeId || $scope.currentfilter.GuarantorTypeId == -1) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select Discount Category'));
                    return;
                }
            }

            if ($scope.item.IsMultiplePayment == false) {
                if (savehitcompleted == 1) return false;
            }
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ||
                    $scope.currentcontext.PaymentTypeId == 11) {
                    if (!$scope.item.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizeNumber || $scope.item.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 11 || $scope.currentcontext.PaymentTypeId == 12) {
                    if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
            }

            $scope.item.PatientBillStatusId = 3;
            $scope.item.IsDirectDGBill = true;

            var dTotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            var dPaidAmt = parseFloat($scope.currentcontext.PaidAmt);
            var dReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);

            if ($scope.item.PatientBillStatusId == 1 && dReceiptAmt > 0) {
                $scope.currentcontext.ReceiptAmt = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.approvallevel.lbl'));

                $scope.currentcontext.ReceiptAmt = 0;
                dReceiptAmt = 0;
                $scope.CalculateNetAmt();
                return false;
            } else if (($scope.item.PatientBillStatusId == 3) && dReceiptAmt <= 0 && $scope.item.PrivateDueId <= 0 &&
                (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                if ($scope.currentfilter.DiscountModeId == 2 && parseFloat($scope.currentcontext.BillDiscount) < 100) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                } else if ($scope.currentfilter.DiscountModeId == 1 &&
                    parseFloat($scope.currentcontext.BillDiscount) < parseFloat($scope.currentcontext.TotNetAmount) &&
                    (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                }
            } else if (($scope.item.PatientBillStatusId == 3) && $scope.item.PrivateDueId <= 0 && $scope.currentcontext.TotBalanceAmt > 0 &&
                (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                if ($scope.currentfilter.DiscountModeId == 2 && parseFloat($scope.currentcontext.BillDiscount) < 100) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                } else if ($scope.currentfilter.DiscountModeId == 1 &&
                    parseFloat($scope.currentcontext.BillDiscount) < parseFloat($scope.currentcontext.TotNetAmount) &&
                    (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false)) {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.selectdueapprover.lbl'));
                    return false;
                }
            }

            if (!$scope.PatientBillDetails || $scope.PatientBillDetails.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

                $('#pid').focus();
                return false;
            } else {
                var ItemCount = 0;
                var ItemCheck = 0;
                var CheckExpiry = 0;
                var ItemName = null;
                if ($scope.PatientBillDetails.length === 1) {
                    for (var idx1 in $scope.PatientBillDetails) {
                        var item1 = $scope.PatientBillDetails[idx1];
                        if (item1 && item1.ItemMasterId < 0) {
                            ItemCount = 1;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && item1.Quantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else if (item1.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    for (var idx in $scope.PatientBillDetails) {
                        var item = $scope.PatientBillDetails[idx];
                        if (item && item.ItemMasterId >= 0 && item.Quantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item.ItemName;
                            break;
                        } else if (item.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                }

                if (ItemCount == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

                    return false;
                }

                if (ItemCheck == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.qtyalert.lbl') + ItemName);

                    return false;
                }
            }
            if (!checkMandatoryFields()) {
                return;
            }
            return true;
        };
    }

    pharmacydirectsalesController.$inject = ['$rootScope', '$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig', '$timeout'];

})();