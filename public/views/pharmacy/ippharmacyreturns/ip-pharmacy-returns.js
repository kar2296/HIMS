(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ippharmacyreturnsController', ippharmacyreturnsController);

    function ippharmacyreturnsController($rootScope, $scope, $interval, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.autosearchpopup = 0;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.SelectedIndex = -1;

        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.PatientBillInfo = [];
        $scope.PatientReturnInfo = [];
        $scope.DeletedPatientReturns = [];
        $scope.PatientBillDetails = [];
        $scope.PatientReturnDetails = [];

        $scope.selectedPatient = {};
        $scope.itemUsedBatches = {};

        $scope.SaveImdDMPrint = 0;

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            PatientId: -1,
            PatientName: '',
            PatientTypeId: -1,
            DoctorId: -1,
            DoctorName: '',
            BillDate: utl.Formatter.getCurrentDate(),
            BillDateTime: utl.Formatter.getCurrentDate(),
            ReturnDate: utl.Formatter.getCurrentDate(),
            ReturnDateTime: null,
            WithHeader: true,
            WithoutHeader: false,
            GuarantorTypeId: -1,
            GuarantorId: -1,
            EncounterTypeId: -1,
            EncounterId: -1,
            GuarantorName: '',
            StoreMasterId: 0,
            DepartmentId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientBillStatusId: 1,
            PatientBillStatus: null,
            PatientAdmissionStatusId: 0,
            PatientStatusId: 0,
            PatientReturnStatusId: 1,
            PatientReturnStatus: null,
            PharmacyReturnTypeId: 6,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            TotalNetAmount: 0,
            TotalReturnAmount: 0,
            IsPharmacyBill: 1,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            RdoPatientId: false,
            RdoGuarantorId: false,
            RdoDoctorId: false,
            RdoStoreMasterId: false,
            RdoWardId: false,
            RdoRoomId: false,
            DrugServiceCategoryId: 0,
            DrugServiceGroupId: 0,
            NonDrugServiceCategoryId: 0,
            NonDrugServiceGroupId: 0,
            DrugReturnServiceCategoryId: 0,
            DrugReturnServiceGroupId: 0,
            NonDrugReturnServiceCategoryId: 0,
            NonDrugReturnServiceGroupId: 0,
            IsBillLock: false
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.currentcontext = {
            id: 0,
            BillGeneratedBy: 0,
            BillApprovedBy: 0,
            PatientBillStatusId: 1,
            PatientReturnStatusId: 1,
            ReturnGeneratedBy: 0,
            ReturnApprovedBy: 0
        };

        if ($stateParams.id && $stateParams.id > 0) {
            $scope.item.PatientId = parseInt($stateParams.id);
            $scope.patientChange();
        }

        $scope.StoreChange = function (SelectedStore) {
            if ($scope.PatientReturnDetails.length > 1) {
                $scope.clear();
            }
        };
        $scope.backtoList = function () {
            $state.go('app.pharmacydashboard');
        };
        $scope.applyVisibilityRules = function () {
            if ($scope.item.PatientReturnStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
            }
            if ($scope.item.PatientReturnStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
            }
            if ($scope.item.PatientReturnStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
            }
        };

        $scope.setIndexforTableIndex = function () {
            for (var idx in $scope.PatientReturnDetails) {
                if ($scope.PatientReturnDetails[idx].Status == 1) {
                    $scope.PatientReturnDetails[idx].itemidxdesc = 'desc' + idx;
                    $scope.PatientReturnDetails[idx].itemidxqty = 'qty' + idx;
                }
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientReturnDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientReturnDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }
            var PatientReturnDetail = {
                Id: 0,
                PatientBillDetailId: 0,
                PatientBillId: 0,
                BillDateTime: utl.Formatter.getCurrentDate(),
                ServiceId: -1,
                ServiceCode: null,
                ServiceName: null,
                ItemMasterId: -1,
                ItemCode: null,
                ItemName: null,
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
                StockItemId: 0,
                Quantity: 0,
                itemidxqty: null,
                BilledQuantity: 0,
                SoldQuantity: 0,
                ReturnQuantity: 0,
                ReturnedQuantity: 0,
                BatchId: '',
                SelectedBatchId: '',
                ExpiryDate: null,
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
                IsPharmacyReturn: 1,
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
                GenericName: null,
                IsPrescribed: false,
                IsSupplementary: false,
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
                RdoItemMasterId: false,
                tabindex: $scope.tabindexmap.detailtabindex++,
                Status: 1
            };

            if ($scope.currentcontext.id > 0) {
                PatientReturnDetail.PatientReturnId = $scope.currentcontext.id;
            }
            $scope.PatientReturnDetails.push(PatientReturnDetail);

            $scope.SelectedIndex = $scope.PatientReturnDetails.length;

            $scope.setIndexforTableIndex();
        };

        $scope.ServiceItemChanged = function (idx, selectedItem) {

            var isDuplicate = utl.Common.isDuplicateRec($scope.PatientReturnDetails, {
                pivotkey: 'SelectedItem.ItemMasterId',
                displaykey: 'ItemName'
            });
            if (isDuplicate) {
                selectedItem.SelectedItem.ItemMasterId = '';
                selectedItem.SelectedItem.ItemName = '';
                $scope.PatientReturnDetails.splice(idx, 1)
                $scope.addNewLineItem();
                return;
            }

            var SelectedMasterItem = selectedItem.SelectedItem;
            selectedItem.PatientBillDetailId = SelectedMasterItem.Id;
            selectedItem.PatientBillId = SelectedMasterItem.PatientBillId;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            selectedItem.MasterName = SelectedMasterItem.MasterName;
            selectedItem.MasterItemId = SelectedMasterItem.MasterItemId;
            selectedItem.MasterTypeId = SelectedMasterItem.MasterTypeId;
            selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
            selectedItem.GenericName = SelectedMasterItem.GenericName;
            selectedItem.IsPrescribed = SelectedMasterItem.IsPrescribed;
            selectedItem.IsSupplementary = SelectedMasterItem.IsSupplementary;
            selectedItem.ScheduleTypeId = SelectedMasterItem.ScheduleTypeId;
            selectedItem.ScheduleTypeDescription = SelectedMasterItem.ScheduleTypeDescription;
            selectedItem.ServiceGroupId = SelectedMasterItem.ServiceGroupId;
            selectedItem.ServiceCategoryId = SelectedMasterItem.ServiceCategoryId;
            selectedItem.StockSerialItemId = SelectedMasterItem.StockSerialItemId;
            selectedItem.StockItemId = SelectedMasterItem.StockItemId;
            selectedItem.BatchId = SelectedMasterItem.BatchId;
            selectedItem.ExpiryDate = SelectedMasterItem.ExpiryDate;
            selectedItem.SelectedBatchId = SelectedMasterItem.BatchId;
            selectedItem.Quantity = SelectedMasterItem.Quantity;
            selectedItem.BilledQuantity = SelectedMasterItem.Quantity;
            selectedItem.SoldQuantity = SelectedMasterItem.Quantity;
            selectedItem.ReturnedQuantity = SelectedMasterItem.ReturnedQuantity;
            selectedItem.UnitCostPrice = SelectedMasterItem.Rate;
            selectedItem.MrPrice = SelectedMasterItem.Rate;
            selectedItem.Amount = 0.00;
            selectedItem.GrossAmount = 0.00;
            selectedItem.DiscountAmount = 0.00;
            selectedItem.GSTId = SelectedMasterItem.GSTId;
            selectedItem.GSTPercentage = SelectedMasterItem.GSTPercentage;
            selectedItem.UnitGSTAmount = SelectedMasterItem.UnitGSTAmount;
            selectedItem.GSTAmount = 0.00;
            selectedItem.InGstId = SelectedMasterItem.InGstId;
            selectedItem.InGstPercentage = SelectedMasterItem.InGstPercentage;
            selectedItem.UnitInGstAmount = SelectedMasterItem.UnitInGstAmount;
            selectedItem.InGstAmount = 0.00;
            selectedItem.CGstId = SelectedMasterItem.CGstId;
            selectedItem.CGstPercentage = SelectedMasterItem.CGstPercentage;
            selectedItem.UnitCGstAmount = SelectedMasterItem.UnitCGstAmount;
            selectedItem.CGstAmount = 0.00;
            selectedItem.SGstId = SelectedMasterItem.SGstId;
            selectedItem.SGstPercentage = SelectedMasterItem.SGstPercentage;
            selectedItem.UnitSGstAmount = SelectedMasterItem.UnitSGstAmount;
            selectedItem.SGstAmount = 0.00;
            selectedItem.NetAmount = 0.00;

            if (selectedItem.MasterTypeId == 1) {
                selectedItem.ServiceGroupId = $scope.item.DrugReturnServiceGroupId;
                selectedItem.ServiceCategoryId = $scope.item.DrugReturnServiceCategoryId;
            } else if (selectedItem.MasterTypeId == 2) {
                selectedItem.ServiceGroupId = $scope.item.NonDrugReturnServiceGroupId;
                selectedItem.ServiceCategoryId = $scope.item.NonDrugReturnServiceCategoryId;
            } else {
                selectedItem.ServiceGroupId = 0;
                selectedItem.ServiceCategoryId = 0;
            }

            var PharItemLineDetails = [];
            for (var prdid = 0; prdid < $scope.PatientReturnDetails.length; prdid++) {
                var PharItemLineDetail = $scope.PatientReturnDetails[prdid];
                if (PharItemLineDetail.Status == 1) {
                    PharItemLineDetails.push(PharItemLineDetail);
                }
            }

            var lastIndex = PharItemLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.CalcualteAmt = function (item) {
            if (item.ReturnQuantity > item.BilledQuantity - item.ReturnedQuantity) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.returnqtyalert.lbl'));

                item.ReturnQuantity = 0;
            } else if (item.ReturnQuantity === null) { } else {
                item.Rate = item.MrPrice;
                item.Amount = item.ReturnQuantity * item.Rate;

                item.GSTAmount = item.UnitGSTAmount * item.ReturnQuantity;
                item.InGstAmount = item.UnitInGstAmount * item.ReturnQuantity;
                item.CGstAmount = item.UnitCGstAmount * item.ReturnQuantity;
                item.SGstAmount = item.UnitSGstAmount * item.ReturnQuantity;

                item.NetAmount = item.Amount;
                item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;
                item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);

                item.OldNetPat = item.PatNetAmount;
                item.OldNetIns = item.InsNetAmount;
                if (item.IsSupplementary == true) {
                    item.PatNetAmount = item.NetAmount;
                    item.InsNetAmount = parseFloat(item.NetAmount || 0) - parseFloat(item.PatNetAmount || 0);
                    // if (item.IsPharmacySale) {
                    //     $scope.item.NetInsuranceAmount = $scope.item.NetInsuranceAmount - parseFloat(item.OldNetIns || 0);
                    // }
                    // if (item.IsPharmacyReturn) {
                    //     $scope.item.NetInsuranceAmount = $scope.item.NetInsuranceAmount;
                    // }
                    // $scope.item.NetPatientAmount += parseFloat(item.PatNetAmount || 0) - parseFloat(item.OldNetPat || 0);
                    // item.isSupplm = false;
                } else {
                    // item.PatNetAmount = item.NetAmount * ($scope.item.CoPayPercent / 100);;
                    // item.InsNetAmount = parseFloat(item.NetAmount || 0) - parseFloat(item.PatNetAmount || 0);
                    // // item.isSupplm = true;
                    // $scope.item.NetInsuranceAmount += parseFloat(item.OldNetIns || 0) + parseFloat(item.InsNetAmount || 0);
                    // $scope.item.NetPatientAmount = $scope.item.NetPatientAmount - (parseFloat(item.OldNetPat || 0) - parseFloat(item.PatNetAmount || 0));
                }


                $scope.CalculateNetAmt();
            }
        };


        $scope.CalculateNetAmt = function () {
            var itemwisegrossamount = 0;
            var itemwisegstamount = 0;
            var itemwiseingstamount = 0;
            var itemwisecgstamount = 0;
            var itemwisesgstamount = 0;
            var itemwisenetamount = 0;
            var itemwisereturnamount = 0;
            var itemwisenetpatamt = 0;
            var itemwisenetinsamt = 0;
            for (var i = 0, len = $scope.PatientReturnDetails.length; i < len; i++) {
                if ($scope.PatientReturnDetails[i].Status == 1) {
                    var itemgrossamount = 0;
                    var itemgstamount = 0;
                    var itemingstamount = 0;
                    var itemcgstamount = 0;
                    var itemsgstAmount = 0;
                    var itemnetamount = 0;
                    var itemreturnamount = 0;
                    var itempatamt = 0;
                    var iteminsamt = 0;
                    itemgrossamount = isNaN(parseFloat($scope.PatientReturnDetails[i].Amount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].Amount);
                    itemgstamount = isNaN(parseFloat($scope.PatientReturnDetails[i].GSTAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].GSTAmount);
                    itemingstamount = isNaN(parseFloat($scope.PatientReturnDetails[i].InGstAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].InGstAmount);
                    itemcgstamount = isNaN(parseFloat($scope.PatientReturnDetails[i].CGstAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].CGstAmount);
                    itemsgstAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].SGstAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].SGstAmount);
                    itemnetamount = isNaN(parseFloat($scope.PatientReturnDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].NetAmount);
                    itemreturnamount = isNaN(parseFloat($scope.PatientReturnDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].NetAmount);
                    if ($scope.item.GuarantorTypeId > 1) {
                        itempatamt = isNaN(parseFloat($scope.PatientReturnDetails[i].PatNetAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].PatNetAmount);
                        iteminsamt = isNaN(parseFloat($scope.PatientReturnDetails[i].InsNetAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].InsNetAmount);
                    }
                    itemwisegrossamount += itemgrossamount;
                    itemwisegstamount += itemgstamount;
                    itemwiseingstamount += itemingstamount;
                    itemwisecgstamount += itemcgstamount;
                    itemwisesgstamount += itemsgstAmount;
                    itemwisenetamount += itemnetamount;
                    itemwisereturnamount += itemreturnamount;
                    itemwisenetpatamt += itempatamt;
                    itemwisenetinsamt += iteminsamt;
                }
            }

            $scope.item.TotalGrossAmount = itemwisegrossamount;
            $scope.item.TotalGstAmount = itemwisegstamount;
            $scope.item.TotalInGstAmount = itemwiseingstamount;
            $scope.item.TotalCGstAmount = itemwisecgstamount;
            $scope.item.TotalSGstAmount = itemwisesgstamount;
            $scope.item.TotalNetAmount = itemwisenetamount;
            $scope.item.TotalReturnAmount = itemwisenetamount;
            $scope.item.NetPatientAmount = itemwisenetpatamt || 0;
            $scope.item.NetInsuranceAmount = itemwisenetinsamt || 0;
        };

        $scope.clear = function () {
            $state.reload();
            savehitcompleted = 0;
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.amountConversion = function (amount) {
            if (amount !== undefined) {
                return parseFloat(amount).toFixed(2);
            } else {
                return '0.00';
            }
        };

        function PatientIPPharmacyReturnPickerCallback(patientreturndata) {
            $scope.currentcontext.id = patientreturndata.ReturnId;
            $scope.currentcontext.PharmacyReturnStatusId = patientreturndata.ReturnStatusId;
            $scope.getReturnInfoByReturnId();
        }

        $scope.findReturn = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.find-ip-pharmacy-returns', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: PatientIPPharmacyReturnPickerCallback
            });
        };

        $scope.pickreturns = function () {
            utl.Modal.open('app.pick-from-dispenselist', {
                params: {
                    patientid: $scope.item.PatientId,
                    encounterid: $scope.item.EncounterId,
                    storemasterid:$scope.item.StoreMasterId,
                    id: $scope.item.EncounterId
                },
                confirmCallback: loadSelectedList
            });
        };

        function loadSelectedList(selectedList) {
            $scope.item.IsPicked = selectedList.IsPicked;
            $scope.PatientReturnDetails = [];
            if (selectedList.ReturnData && selectedList.ReturnData.length > 0) {
                selectedList.ReturnData.forEach(SelectedReturn => {
                    var ReturnItemDetail = {
                        Id: 0,
                        PatientStockRequestDetailId: 0,
                        PatientBillDetailId: SelectedReturn.PatientBillDetailId,
                        PatientBillId: SelectedReturn.PatientBillId,
                        ItemMasterId: SelectedReturn.ItemMasterId,
                        ServiceCategoryId: SelectedReturn.ServiceCategoryId,
                        ItemCode: SelectedReturn.ItemCode,
                        ItemName: SelectedReturn.ItemName,
                        ReturnQuantity: parseInt(SelectedReturn.ReturnQuantity),
                        Quantity: parseInt(SelectedReturn.ReturnQuantity),
                        ReturnedQuantity: SelectedReturn.ReturnedQuantity,
                        BilledQuantity: SelectedReturn.Quantity,
                        ReceivedQuantity: 0,
                        StockItemId: SelectedReturn.StockItemId,
                        StockSerialItemId: SelectedReturn.StockSerialItemId,
                        BatchId: SelectedReturn.BatchId,
                        ExpiryDate: SelectedReturn.ExpiryDate,
                        Ucp: SelectedReturn.Rate,
                        MrPrice: SelectedReturn.Rate,
                        GSTId: SelectedReturn.GSTId,
                        GSTPercentage: SelectedReturn.GSTPercentage,
                        GstAmount: SelectedReturn.GSTAmount,
                        InGstId: SelectedReturn.InGstId,
                        InGstPercentage: SelectedReturn.InGstPercentage,
                        InGstAmount: SelectedReturn.InGstAmount,
                        CGstId: SelectedReturn.CGstId,
                        CGstPercentage: SelectedReturn.CGstPercentage,
                        CGstAmount: SelectedReturn.CGstAmount,
                        SGstId: SelectedReturn.SGstId,
                        SGstPercentage: SelectedReturn.SGstPercentage,
                        SGstAmount: SelectedReturn.SGstAmount,
                        UnitSGstAmount: SelectedReturn.UnitSGstAmount,
                        UnitCGstAmount: SelectedReturn.UnitCGstAmount,
                        UnitInGstAmount: SelectedReturn.UnitInGstAmount,
                        Rate: SelectedReturn.Rate,
                        UnitGSTAmount: SelectedReturn.UnitGSTAmount,
                        UnitDiscountAmount: SelectedReturn.UnitDiscountAmount,
                        GrossAmount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        Amount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        NetAmount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        Comments: '',
                        Status: 1,
                        StoreName: SelectedReturn.StoreName,
                        IsPharmacyReturn: true,
                        CanDisableDetails: false,
                        IsNonClaimable: SelectedReturn.IsSupplementary,
                        IsSupplementary: SelectedReturn.IsSupplementary
                    }
                    $scope.item.TotalGrossAmount = $scope.item.TotalGrossAmount + ReturnItemDetail.GrossAmount;
                    $scope.item.TotalGstAmount = $scope.item.TotalGstAmount + ReturnItemDetail.GstAmount;
                    $scope.item.TotalInGstAmount = $scope.item.TotalInGstAmount + ReturnItemDetail.InGstAmount;
                    $scope.item.TotalCGstAmount = $scope.item.TotalCGstAmount + ReturnItemDetail.CGstAmount;
                    $scope.item.TotalSGstAmount = $scope.item.TotalSGstAmount + ReturnItemDetail.SGstAmount;
                    $scope.item.TotalNetAmount = $scope.item.TotalNetAmount + ReturnItemDetail.NetAmount;

                    $scope.PatientReturnDetails.push(ReturnItemDetail);
                    $scope.CalcualteAmt(ReturnItemDetail);
                });
            }
        }

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.add_new = function () {
            $scope.SaveImdDMPrint = 0;
            $state.go('app.ip-pharmacy-returns', {
                id: 0,
                pid: $scope.currentcontext.pid
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

        $scope.originalprint = function () {
            if ($scope.printpreferences != 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));

                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id,
                    Data: {
                        Reason: $scope.currentcontext.printreason,
                        isprint: false,
                        withHeader: $scope.item.WithHeader,
                        withoutHeader: $scope.item.WithoutHeader
                    }
                };
                var options = {
                    action: 'billing/patientreturns/PrintIPPatientReturns',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.print = function () {
            if ($scope.printpreferences != 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));

                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id,
                    Data: {
                        isprint: false,
                        withHeader: $scope.item.WithHeader,
                        withoutHeader: $scope.item.WithoutHeader
                    }
                };
                var options = {
                    action: 'billing/patientreturns/PrintIPPatientReturns',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doPrint(options);
            }
        };

        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: true,
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'billing/patientbills/PrintPatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.deletePatientReturnDetails = function (idx, item) {
            if (item.ItemMasterId != -1) {
                var index = $scope.PatientReturnDetails.indexOf(item);
                $scope.DeletedPatientReturns.push(item);
                $scope.PatientReturnDetails.splice(index, 1);
                var lastIndex = $scope.PatientReturnDetails.length - 1;
                if (lastIndex < 0) {
                    $scope.addNewLineItem();
                }
                $scope.CalculateNetAmt();
            }
            $scope.setIndexforTableIndex();
        };

        $scope.onDeleteConfirmed = function (item) {
            var index = $scope.PatientReturnDetails.indexOf(item);
            $scope.DeletedPatientReturns.push(item);
            $scope.PatientReturnDetails.splice(index, 1);
            var lastIndex = $scope.PatientReturnDetails.length - 1;
            if (lastIndex < 0) {
                $scope.addNewLineItem();
            }
            $scope.CalculateNetAmt();
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.PatientName = patientbills.PatientName;
                    $scope.item.DoctorId = patientbills.DoctorId;
                    $scope.item.DoctorName = patientbills.DoctorName;
                    $scope.item.BillDate = patientbills.BillDateTime;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                    $scope.item.BillNumber = patientbills.BillNumber;
                    $scope.item.GuarantorTypeId = patientbills.GuarantorTypeId;
                    $scope.item.GuarantorId = patientbills.GuarantorId;
                    $scope.item.GuarantorName = patientbills.GuarantorName;
                    $scope.item.StoreMasterId = patientbills.StoreMasterId;
                    $scope.item.DepartmentId = patientbills.DepartmentId;
                    $scope.item.FacilityId = patientbills.FacilityId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                    $scope.item.PatientStatusId = patientbills.PatientBillStatusId;
                    $scope.item.TotalGrossAmount = patientbills.BillAmount;
                    $scope.item.TotalGstAmount = patientbills.GSTAmount;
                    $scope.item.TotalInGstAmount = patientbills.InGstAmount;
                    $scope.item.TotalCGstAmount = patientbills.CGstAmount;
                    $scope.item.TotalSGstAmount = patientbills.SGstAmount;
                    $scope.item.NetPatientAmount = patientbills.NetPatientAmount;
                    $scope.item.NetInsuranceAmount = patientbills.NetInsuranceAmount;
                    $scope.item.TotalNetAmount = patientbills.BillAmount;
                    $scope.item.IsPharmacyBill = 1;

                    if ($scope.item.PatientBillStatusId == 3) {
                        $scope.item.RdoPatientId = true;
                        $scope.item.RdoGuarantorId = true;
                        $scope.item.RdoDoctorId = true;
                        $scope.item.RdoStoreMasterId = true;
                        $scope.item.RdoWardId = true;
                        $scope.item.RdoRoomId = true;
                    }

                    $scope.currentcontext.id = patientbills.Id;
                    $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;

                    $scope.PatientBillDetails = [];
                    $scope.PatientBillDetails = patientbills.PatientBillDetails;
                    for (var saledidx in $scope.PatientBillDetails) {
                        var saleditem = $scope.PatientBillDetails[saledidx];
                        saleditem.BatchDetails = [];
                        if (saleditem.ItemMasterId > 0) {
                            saleditem.ExpiryProceed = true;
                            saleditem.MrPrice = saleditem.Rate;
                            saleditem.SelectedBatchId = saleditem.BatchId;
                            var SaledBatchDetail = {
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
                                SerialDetails: null
                            };

                            SaledBatchDetail.Id = saleditem.StockSerialItemId;
                            SaledBatchDetail.StockItemId = saleditem.StockItemId;
                            SaledBatchDetail.ItemMasterId = saleditem.ItemMasterId;
                            SaledBatchDetail.StoreMasterId = saleditem.StoreMasterId;
                            SaledBatchDetail.BatchId = saleditem.BatchId;
                            SaledBatchDetail.SelectedBatchId = saleditem.BatchId;
                            SaledBatchDetail.Quantity = saleditem.Quantity;
                            SaledBatchDetail.ExpiryDate = saleditem.ExpiryDate;
                            SaledBatchDetail.Ucp = saleditem.Rate;
                            SaledBatchDetail.Mrp = saleditem.Rate;

                            SaledBatchDetail.SerialDetails = [
                                ' Batch: ', saleditem.BatchId,
                                ' | Qty: ', saleditem.Quantity,
                                ' | Expiry: ', saleditem.ExpiryDate,
                                ' | UCP: ', saleditem.Rate,
                                ' | MRP: ', saleditem.Rate
                            ].join(' ');

                            saleditem.BatchDetails.push(SaledBatchDetail);
                        }

                        if ($scope.item.PatientBillStatusId == 3) {
                            saleditem.RdoItemMasterId = true;
                        }
                    }

                    $scope.applyVisibilityRules();
                    $scope.CalculateNetAmt();
                });
            }
        };

        $scope.getBillInfoByBillId = function () {
            var SearchBillId = $scope.currentcontext.id;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchBillId
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

        $scope.getReturnInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientReturnInfo = res.Data || [];
            if ($scope.PatientReturnInfo && $scope.PatientReturnInfo.length > 0) {
                $scope.PatientReturnInfo.forEach(patientreturns => {
                    $scope.item.PatientId = patientreturns.PatientId;
                    $scope.item.PatientName = patientreturns.PatientName;
                    $scope.item.PatientTypeId = patientreturns.PatientTypeId;
                    $scope.item.DoctorId = patientreturns.DoctorId;
                    $scope.item.DoctorName = patientreturns.DoctorName;
                    $scope.item.BillDate = patientreturns.BillDateTime;
                    $scope.item.BillDateTime = patientreturns.BillDateTime;
                    $scope.item.BillNumber = patientreturns.BillNumber;
                    $scope.item.ReturnNumber = patientreturns.ReturnNumber;
                    $scope.item.ReturnDate = patientreturns.ReturnDateTime;
                    $scope.item.ReturnDateTime = patientreturns.ReturnDateTime;
                    $scope.item.GuarantorTypeId = patientreturns.GuarantorTypeId;
                    $scope.item.GuarantorId = patientreturns.GuarantorId;
                    $scope.item.EncounterTypeId = patientreturns.EncounterTypeId;
                    $scope.item.EncounterId = patientreturns.EncounterId;
                    $scope.item.GuarantorName = patientreturns.GuarantorName;
                    $scope.item.StoreMasterId = patientreturns.StoreMasterId;
                    $scope.item.DepartmentId = patientreturns.DepartmentId;
                    $scope.item.FacilityId = patientreturns.FacilityId;
                    $scope.item.PharmacyReturnTypeId = patientreturns.PharmacyReturnTypeId;
                    $scope.item.PatientReturnStatusId = patientreturns.PatientReturnStatusId;
                    $scope.item.PatientReturnStatus = patientreturns.PatientReturnStatus.Description;
                    $scope.item.TotalGrossAmount = patientreturns.GrossAmount;
                    $scope.item.TotalGstAmount = patientreturns.GstAmount;
                    $scope.item.TotalInGstAmount = patientreturns.InGstAmount;
                    $scope.item.TotalCGstAmount = patientreturns.CGstAmount;
                    $scope.item.TotalSGstAmount = patientreturns.SGstAmount;
                    $scope.item.TotalNetAmount = patientreturns.NetAmount;
                    $scope.item.TotalReturnAmount = patientreturns.ReturnAmount;
                    $scope.item.IsPharmacyBill = 1;

                    if ($scope.item.PatientReturnStatusId == 3) {
                        $scope.item.RdoPatientId = true;
                        $scope.item.RdoGuarantorId = true;
                        $scope.item.RdoDoctorId = true;
                        $scope.item.RdoStoreMasterId = true;
                        $scope.item.RdoWardId = true;
                        $scope.item.RdoRoomId = true;
                    }

                    $scope.currentcontext.id = patientreturns.Id;
                    $scope.currentcontext.PatientReturnStatusId = patientreturns.PatientReturnStatusId;
                    $scope.currentcontext.ReturnGeneratedBy = patientreturns.ReturnGeneratedBy;
                    $scope.currentcontext.ReturnApprovedBy = patientreturns.ReturnApprovedBy;

                    $scope.PatientReturnDetails = [];
                    $scope.PatientReturnDetails = patientreturns.PatientReturnDetails;
                    for (var returnidx in $scope.PatientReturnDetails) {
                        var returneditem = $scope.PatientReturnDetails[returnidx];
                        if (returneditem.ItemMasterId > 0) {
                            returneditem.MrPrice = returneditem.Rate;
                            returneditem.SelectedBatchId = returneditem.BatchId;
                        }

                        if ($scope.item.PatientReturnStatusId == 3) {
                            returneditem.RdoItemMasterId = true;
                        }
                    }
                    $scope.patientChange();
                    $scope.applyVisibilityRules();
                    $scope.CalculateNetAmt();
                });
            }

            if ($scope.SaveImdDMPrint == 1) {
                $scope.SaveImdDMPrint = 0;
                if ($scope.dmprintpreferences == 1) {
                    $scope.dmPrint();
                }
            }
        };

        $scope.getReturnInfoByReturnId = function () {
            var SearchReturnId = $scope.currentcontext.id;
            if (SearchReturnId && SearchReturnId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchReturnId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientreturns/GetPatientReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getReturnInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;

            $scope.getReturnInfoByReturnId();
            $scope.applyVisibilityRules();

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.SaveImdDMPrint = 1;
            $scope.print();
        };

        $scope.completeBill = function (action) {
            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billing-details.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: action,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveDraft = function () {
            $scope.item.ReturnDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ReturnGeneratedBy = utl.Session.getCurrentUserId();
            $scope.saveItem(3);
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
            $scope.item.ReturnApprovedBy = utl.Session.getCurrentUserId();
            if ($scope.item.ReturnNumber === null) {
                $scope.item.ReturnDateTime = utl.Formatter.getCurrentDate();
            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            $scope.saveItem(3);
        };

        $scope.onCancelConfirmed = function (reason) {
            $scope.item.CancelReason = reason;
            $scope.saveItem(2);
        };

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.opbilling-list.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.CancelReceipt,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function (StatusId) {

            if (savehitcompleted == 1) return false;

            if ($scope.item.IsEncounter === false) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientalert.lbl'));

                $scope.clear();
                return false;
            }

            $scope.item.PatientReturnStatusId = StatusId;
            $scope.item.PatientBillStatusId = StatusId;

            if (!$scope.PatientReturnDetails || $scope.PatientReturnDetails.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

                return false;
            } else {
                var ItemCount = 0;
                var ItemCheck = 0;
                var ItemName = null;
                if ($scope.PatientReturnDetails.length === 1) {
                    for (var idx1 in $scope.PatientReturnDetails) {
                        var item1 = $scope.PatientReturnDetails[idx1];
                        if (item1 && item1.ItemMasterId < 0) {
                            ItemCount = 1;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && item1.Quantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    for (var idx in $scope.PatientReturnDetails) {
                        var item = $scope.PatientReturnDetails[idx];
                        if (item && item.ItemMasterId >= 0 && item.Quantity <= 0) {
                            ItemCheck = 1;
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
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.qtyalert.lbl' + ItemName));

                    return false;
                }
            }

            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.PatientBillId = 0;
            $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ReturnDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ReturnTypeId = 6;
            $scope.item.BillTypeId = 3;
            $scope.item.ReturnPriorityId = 1;
            $scope.item.BillPriorityId = 1;
            $scope.item.BillAmount = $scope.item.TotalReturnAmount;
            $scope.item.ReturnAmount = $scope.item.TotalReturnAmount;
            $scope.item.GrossAmount = $scope.item.TotalGrossAmount;
            $scope.item.GSTAmount = $scope.item.TotalGstAmount;
            $scope.item.GstAmount = $scope.item.TotalGstAmount;
            $scope.item.InGstAmount = $scope.item.TotalInGstAmount;
            $scope.item.CGstAmount = $scope.item.TotalCGstAmount;
            $scope.item.SGstAmount = $scope.item.TotalSGstAmount;
            $scope.item.NetAmount = $scope.item.TotalNetAmount;
            $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();
            $scope.item.BillApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ReturnGeneratedBy = utl.Session.getCurrentUserId();
            $scope.item.ReturnApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.PharmacyBillStatusId = $scope.currentcontext.PharmacyBillStatusId;
            $scope.item.FacilityId = $scope.item.FacilityId;
            $scope.item.DepartmentId = $scope.item.DepartmentId;
            $scope.item.StoreMasterId = $scope.item.StoreMasterId;
            $scope.item.PatientId = $scope.item.PatientId;
            $scope.item.PatientName = $scope.item.PatientName;
            $scope.item.PatientTypeId = 0;
            if ($scope.item.IsEncounter)
                $scope.item.EncounterId = $scope.encounter.Id;
            $scope.item.EncounterTypeId = 2;
            $scope.item.GuarantorId = $scope.item.GuarantorId;
            $scope.item.GuarantorTypeId = $scope.item.GuarantorTypeId;
            $scope.item.GuarantorName = $scope.item.GuarantorName;
            $scope.item.DoctorId = $scope.item.DoctorId;
            $scope.item.DoctorName = $scope.item.DoctorName;
            $scope.item.ReturnGeneratedById = utl.Session.getCurrentUserId();

            if (checkMandatoryFields()) {
                var pharmacyreturnitemlines = getLinesForSave();
                if (pharmacyreturnitemlines.length <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.returnitem.lbl'));

                    return false;
                }
                var returnedpaymentlines = [];
                var actionName = 'billing/patientreturns/AddPatientReturns';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientreturns/UpdatePatientReturns';
                }
                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: pharmacyreturnitemlines,
                    paymentDetail: returnedpaymentlines
                };
                // return;
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
                if (!item.ItemMasterId || !item.ItemName || item.Quantity <= 0 || item.MrPrice <= 0 ||
                    item.Amount <= 0 || item.NetAmount <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var piidx in $scope.PatientReturnDetails) {
                var pharmacyitem = $scope.PatientReturnDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseInt(pharmacyitem.ReturnQuantity) > 0 && pharmacyitem.Amount > 0) {
                    pharmacyitem.BillDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ReturnDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ServiceId = pharmacyitem.ItemMasterId;
                    pharmacyitem.ServiceCode = pharmacyitem.ItemCode;
                    pharmacyitem.ServiceName = pharmacyitem.ItemName;
                    pharmacyitem.ServiceTypeId = pharmacyitem.ServiceTypeId;
                    pharmacyitem.ServiceGroupId = pharmacyitem.ServiceGroupId;
                    pharmacyitem.ServiceCategoryId = pharmacyitem.ServiceCategoryId;
                    pharmacyitem.MasterName = pharmacyitem.MasterName;
                    pharmacyitem.MasterItemId = pharmacyitem.MasterItemId;
                    pharmacyitem.EncounterId = $scope.item.EncounterId;
                    pharmacyitem.PatientBillStatusId = $scope.item.PatientBillStatusId;
                    pharmacyitem.MasterTypeId = pharmacyitem.MasterTypeId;
                    pharmacyitem.Quantity = parseInt(pharmacyitem.ReturnQuantity);
                    pharmacyitem.ReturnedQuantity = parseInt(pharmacyitem.ReturnedQuantity);
                    pharmacyitem.StockItemId = pharmacyitem.StockItemId;
                    pharmacyitem.StockSerialItemId = pharmacyitem.StockSerialItemId;
                    pharmacyitem.BatchId = pharmacyitem.BatchId;
                    pharmacyitem.ExpiryDate = pharmacyitem.ExpiryDate;
                    pharmacyitem.Rate = pharmacyitem.MrPrice;
                    pharmacyitem.Amount = pharmacyitem.Amount;
                    pharmacyitem.GrossAmount = pharmacyitem.Amount;
                    pharmacyitem.GSTAmount = pharmacyitem.GSTAmount;
                    pharmacyitem.NetAmount = pharmacyitem.NetAmount;
                    pharmacyitem.GSTId = pharmacyitem.GSTId;
                    pharmacyitem.GSTPercentage = pharmacyitem.GSTPercentage;
                    pharmacyitem.TaxCode = pharmacyitem.TaxCode;
                    pharmacyitem.InGstId = pharmacyitem.InGstId;
                    pharmacyitem.InGstPercentage = pharmacyitem.InGstPercentage;
                    pharmacyitem.InGstAmount = pharmacyitem.InGstAmount;
                    pharmacyitem.CGstId = pharmacyitem.CGstId;
                    pharmacyitem.CGstPercentage = pharmacyitem.CGstPercentage;
                    pharmacyitem.CGstAmount = parseFloat((pharmacyitem.NetAmount * pharmacyitem.CGstPercentage) / (100 + pharmacyitem.GSTPercentage)).toFixed(2);
                    pharmacyitem.UnitCGstAmount = parseFloat(pharmacyitem.CGstAmount / pharmacyitem.Quantity).toFixed(2);
                    pharmacyitem.SGstId = pharmacyitem.SGstId;
                    pharmacyitem.SGstPercentage = pharmacyitem.SGstPercentage;
                    pharmacyitem.SGstAmount = parseFloat((pharmacyitem.NetAmount * pharmacyitem.SGstPercentage) / (100 + pharmacyitem.GSTPercentage)).toFixed(2);;
                    pharmacyitem.UnitSGstAmount = parseFloat(pharmacyitem.SGstAmount / pharmacyitem.Quantity).toFixed(2);
                    pharmacyitem.NetAmountBeforeGST = parseFloat(pharmacyitem.NetAmount - (parseFloat(pharmacyitem.CGstAmount) + parseFloat(pharmacyitem.SGstAmount))).toFixed(2);
                    pharmacyitem.DoctorId = $scope.item.DoctorId;
                    pharmacyitem.DoctorName = $scope.item.DoctorName;
                    pharmacyitem.OrderDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ItemMasterId = pharmacyitem.ItemMasterId;
                    pharmacyitem.GenericName = pharmacyitem.GenericName;
                    pharmacyitem.ItemCode = pharmacyitem.ItemCode;
                    pharmacyitem.ItemName = pharmacyitem.ItemName;
                    pharmacyitem.ScheduleTypeId = pharmacyitem.ScheduleTypeId;
                    pharmacyitem.ScheduleTypeDescription = pharmacyitem.ScheduleTypeDescription;
                    pharmacyitem.StoreMasterId = $scope.item.StoreMasterId;
                    pharmacyitem.DepartmentId = $scope.item.DepartmentId;
                    pharmacyitem.FacilityId = $scope.item.FacilityId;
                    pharmacyitem.PatientId = $scope.item.PatientId;
                    pharmacyitem.PatientReturnStatusId = $scope.item.PatientReturnStatusId;
                    pharmacyitem.ReturnedQuantity = pharmacyitem.ReturnedQuantity;
                    pharmacyitem.SoldQuantity = pharmacyitem.BilledQuantity;
                    pharmacyitem.ReturnQuantity = parseInt(pharmacyitem.ReturnQuantity);
                    pharmacyitem.PharmacyReturnTypeId = 6;

                    result.push(pharmacyitem);
                }
            }
            for (var idx in $scope.DeletedPatientReturns) {
                var item = $scope.DeletedPatientReturns[idx];
                if (item.Id > 0) {
                    result.push(item);
                }
            }
            return result;
        }

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

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.selectedPatient = data;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.FacilityId = $scope.selectedPatient.FacilityId;

            if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                var encounter = $scope.selectedPatient.Encounters[0] || {};
                var encGuarantor = encounter.EncounterGuarantors.length > 0 ? encounter.EncounterGuarantors[0] : {
                    GuarantorTypeId: -1
                };
                $scope.item.GuarantorTypeId = encGuarantor.GuarantorTypeId;
            }

            $scope.fnencounter();
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [{
                    Key: 14,
                    Value: 1
                },
                {
                    Key: 4,
                    Value: $scope.item.PatientId
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

        /*
        $scope.getVisitIndentifier = function(scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            $scope.encounter = [];
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;
            } else {
                utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
            }
        };
        */

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            $scope.item.IsBillLock = false;
            $scope.item.PatientAdmissionStatusId = 0;
            $scope.encounter = [];
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.PatientAdmissionStatusId = $scope.encounter.AdmissionStatusId;
                if ($scope.item.Guarantor) {
                    $scope.item.CoPayPercent = $scope.item.Guarantor.CoPayPercent;
                }
                $scope.CanshowInsfield = false;
                if ($scope.item.GuarantorTypeId > 1) {
                    $scope.CanshowInsfield = true;
                }
                if ($scope.encounter.AdmissionStatusId > 4) {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.VisitIdentifier = $scope.encounter.VisitIdentifier;
                    $scope.item.AdmissionStatus = $scope.encounter.AdmissionStatus.Description;
                    $scope.item.IsEncounter = true;
                    $scope.PatientReturnDetails = [];
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientdischarge.lbl'));

                } else {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.VisitIdentifier = $scope.encounter.VisitIdentifier;
                    $scope.item.AdmissionStatus = $scope.encounter.AdmissionStatus.Description;
                    $scope.item.IsEncounter = true;
                    if ($scope.encounter.IsBillLock) {
                        $scope.PatientReturnDetails = [];
                        $scope.item.IsBillLock = true;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.lockmode.lbl'));

                    } else {
                        $scope.addNewLineItem();
                    }
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientalert.lbl'));

            }
        };

        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'MRN',
                field: 'PatientMrn',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Patient Name',
                field: 'PatientName',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Visit#',
                field: 'VisitIdentifier',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Ward Name',
                field: 'WardName',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Room No.',
                field: 'RoomNo',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Bed No.',
                field: 'BedNo',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchencounter,
            formatdisplay: formatselectedencounter,
            postsearch: postsearchencounter
        };

        function formatselectedencounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {

                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.GuarantorTypeId = selectedItem.GuarantorTypeId;
                $scope.item.GuarantorId = selectedItem.GuarantorId;
                if (selectedItem.Guarantor) {
                    $scope.item.GuarantorName = selectedItem.Guarantor.GuarantorName;
                    $scope.item.CoPayPercent = selectedItem.Guarantor.CoPayPercent;
                }
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DoctorName = selectedItem.DoctorName;
                $scope.item.DepartmentId = selectedItem.DepartmentId;

                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.LocationId = selectedItem.LocationId;
                $scope.item.WardId = selectedItem.WardId;
                $scope.item.RoomId = selectedItem.RoomId;

                result = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');

                $scope.item.PatientName = result;
            } else if (vm.patientcontrolconfig.rowdata && vm.patientcontrolconfig.rowdata.PatientId > 0) {
                result = [vm.patientcontrolconfig.rowdata.Patient.Title.Description, vm.patientcontrolconfig.rowdata.Patient.FirstName].join(' ');
            }
            $scope.patientChange();
            //$scope.addNewLineItem();
            return result;
        }

        function presearchencounter() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 38,
                    Value: 2 + "," + 3 + "," + 4
                }
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
                    Key: 11,
                    Value: query
                });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchencounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                // item.MRN = item.Patient.MRN;
                // item.VisitIdentifier = item.VisitIdentifier;
                item.PatientName = item.Patient.FirstName;
                if (item.WardMaster)
                    item.WardName = item.WardMaster.WardName;
                if (item.WardRoomMaster)
                    item.RoomNo = item.WardRoomMaster.RoomNo;
                if (item.WardRoomBedMaster)
                    item.BedNo = item.WardRoomBedMaster.BedNo;
            }
        }

        vm.pharmacyitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Item Code',
                field: 'ItemCode',
                datatype: 'string',
                headercls: 'td-itemcode',
                fieldcls: 'td-itemcode'
            },
            {
                header: 'Item Name',
                field: 'ItemName',
                datatype: 'string',
                headercls: 'td-itemname',
                fieldcls: 'td-itemname'
            },
            {
                header: 'Bill Number',
                field: 'BillNumber',
                datatype: 'string',
                headercls: 'td-billnumber',
                fieldcls: 'td-billnumber'
            },
            {
                header: 'Batch Id',
                field: 'BatchId',
                datatype: 'string',
                headercls: 'td-batchid',
                fieldcls: 'td-batchid'
            },
            {
                header: 'Billed Qty',
                field: 'Quantity',
                datatype: 'string',
                headercls: 'td-billedquantity',
                fieldcls: 'td-billedquantity'
            },
            {
                header: 'Returned Qty',
                field: 'ReturnedQuantity',
                datatype: 'string',
                headercls: 'td-returnedquantity',
                fieldcls: 'td-returnedquantity'
            }
            ],
            searchparams: {},
            result: {},
            api: 'billing/patientbilldetails/GetPatientBillDetails',
            formatdisplay: formatselectedpharmacyitem,
            presearch: presearchpharmacyitem,
            postsearch: postsearchpharmacyitem
        };

        function formatselectedpharmacyitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.pharmacyitemcontrolconfig.rowdata) {
                result = [vm.pharmacyitemcontrolconfig.rowdata.ItemCode, vm.pharmacyitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.item.EncounterId
                },
                {
                    Key: 14,
                    Value: $scope.item.StoreMasterId
                },
                {
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 21,
                    Value: 6
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
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 8,
                    Value: query
                });
            }

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.BillNumber = item.PatientBill.BillNumber;
                item.BatchId = item.BatchId;
                item.Quantity = item.Quantity;
                item.ReturnedQuantity = item.ReturnedQuantity;
            }
        }

        function loadData() {
            $scope.applyVisibilityRules();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnsubmit').text("Save (F2)");
            $('#saveAndApproveid').text("Approve(F4)");
            $('#btnprint').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.item.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.item.ExpiryWarningDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryWarningDays;
                            $scope.item.ExpiryPriorStopDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryPriorStopDays;
                        }
                    }
                    if ($scope.item.StoreMasterId === 0) {
                        $scope.item.StoreMasterId = value[0].Id;
                        $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                        $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                    }
                }
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'DRUG') {
                            $scope.item.DrugReturnServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.DrugReturnServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'NONDRUG') {
                            $scope.item.NonDrugReturnServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.NonDrugReturnServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });

            loadData();
            $('#pid').focus();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department"
            },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "GuarantorType"
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
                "Key": "Title"
            },
            {
                "Key": "Gender"
            },
            {
                "Key": "Ward"
            },
            {
                "Key": "Room"
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
                "Key": "ServiceCategory"
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
                utl.Alert.showSuccessMsg('No Perference Settings for current facility');
                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'billing/patientreturns/PrintDMIPPatientReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            $scope.printIPPharmacyReturn(dmPrintInput);
            if ($scope.FindOldBillFlag != 1)
                $scope.clear();
        };

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
            var vStoreheading1 = '';
            var vStoreheading2 = '';
            var vStoreheading3 = '';
            var vStoreheading4 = '';
            var vStorefooter1 = '';
            var vStorefooter2 = '';
            var vStorefooter3 = '';
            var vStorefooter4 = '';
            var vGuarantorName = '';
            var DepartmentName = '';

            if (data.PatientReturns.Encounter) vIPOPNO = '' + data.PatientReturns.Encounter.VisitIdentifier;
            if (data.Encounter) vEncounterType = '' + data.Encounter.EncounterType.Description;
            if (data.PatientReturns.Facility) vGST = '' + data.PatientReturns.Facility.GstNumber;

            if (data.PatientReturns.Department) {
                DepartmentName = data.PatientReturns.Department.DepartmentName;
            }

            if (data.PatientReturns.User) {
                if (data.PatientReturns.User.Title) vUTitle = data.PatientReturns.User.Title.Description;
                if (data.PatientReturns.User.FirstName) vUFirstName = data.PatientReturns.User.FirstName;
                if (data.PatientReturns.User.LastName) vULastName = data.PatientReturns.User.LastName;
            }
            if (data.PatientReturns.CreatedUser) {
                if (data.PatientReturns.CreatedUser.Title) vCTitle = data.PatientReturns.CreatedUser.Title.Description;
                if (data.PatientReturns.CreatedUser.FirstName) vCFirstName = data.PatientReturns.CreatedUser.FirstName;
                if (data.PatientReturns.CreatedUser.LastName) vCLastName = data.PatientReturns.CreatedUser.LastName;
            }
            if (data.PatientReturns.Patient) {
                if (data.PatientReturns.Patient.Title) vPTitle = data.PatientReturns.Patient.Title.Description;
                if (data.PatientReturns.Patient.FirstName) vPFirstName = data.PatientReturns.Patient.FirstName;
                if (data.PatientReturns.Patient.LastName) vPLastName = data.PatientReturns.Patient.LastName;
                if (data.PatientReturns.Patient.MRN) vMRN = data.PatientReturns.Patient.MRN;
                if (data.PatientReturns.Patient.Age) vAge = '' + data.PatientReturns.Patient.Age;
                if (data.PatientReturns.Patient.DOB) vDOB = '' + data.PatientReturns.Patient.DOB;
                if (data.PatientReturns.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientReturns.Patient.DOB);
                if (data.PatientReturns.Patient.Gender) vGender = '' + data.PatientReturns.Patient.Gender.Description;
            } else {
                vPFirstName = data.PatientReturns.PatientName;
            }

            if (data.PatientReturns.GuarantorName &&
                data.PatientReturns.GuarantorName != null &&
                data.PatientReturns.GuarantorName != '' &&
                data.PatientReturns.GuarantorName != undefined) {
                vGuarantorName = data.PatientReturns.GuarantorName;
            }

            if (data.PatientReturns.StoreMaster) vTinNo = data.PatientReturns.StoreMaster.TinNo;

            var vtotalrnd = 0;
            var vtotDiscont = 0;
            var vtotmt = 0;

            if (data.PatientReturns.RoundOffValue)
                vtotalrnd = data.PatientReturns.RoundOffValue;

            if (data.PatientReturns.DiscountAmount)
                vtotDiscont = data.PatientReturns.DiscountAmount;

            if (data.PatientReturns.GrossAmount)
                vtotmt = data.PatientReturns.GrossAmount;

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

            var GrossAmount = 0;
            var TotalGSTAmount = 0;
            var TotalBillAmount = data.PatientReturns.ReturnAmount;
            var TotalCGSTAmount = data.PatientReturns.CGstAmount;
            var TotalSGSTAmount = data.PatientReturns.SGstAmount;
            TotalGSTAmount = TotalCGSTAmount + TotalSGSTAmount;
            GrossAmount = TotalBillAmount - TotalGSTAmount;
            var TotalNoOfItems = data.PatientReturns.PatientReturnDetails.length;
            var TotalQuantity = 0;
            for (var idx in data.PatientReturns.PatientReturnDetails) {
                var billDetail = data.PatientReturns.PatientReturnDetails[idx];
                TotalQuantity = TotalQuantity + billDetail.ReturnQuantity;
            }
            var BillType = vEncounterType + ' SALES RETURN';
            /*
                        if (data.PatientBills.IsPharmacyBill == true
                            && data.PatientBills.IsPaidFully == false
                            && data.PatientBills.OutStandingAmount > 0) {
                            BillType = 'CASH BILL';
                        }
            */
            var BillDate = utl.Formatter.getDateString(data.PatientReturns.ReturnDateTime);
            var BillDateTime = new Date(data.PatientReturns.ReturnDateTime);
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

            var TotalGSTAmount = 0;
            var TotalCGSTAmount = data.PatientReturns.CGstAmount;
            var TotalSGSTAmount = data.PatientReturns.SGstAmount;
            TotalGSTAmount = TotalCGSTAmount + TotalSGSTAmount;

            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: (vUTitle + ' ' +
                    vUFirstName + ' ' + vULastName) || '',
                licenseno: '' + data.PatientReturns.StoreMaster.LicenseNo,
                billno: '' + data.PatientReturns.ReturnNumber,
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
                billdate: utl.Formatter.getDateTimeString(data.PatientReturns.ReturnDateTime),
                totalamount: vtotmt,
                totDiscont: vtotDiscont,
                totroundoff: vtotalrnd,
                billedby: vCTitle + ' ' + vCFirstName + ' ' + vCLastName,
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
                BillType: BillType,
                BillDate: BillDate,
                BillTime: BillTime,
                TotalCGSTAmount: TotalCGSTAmount,
                TotalSGSTAmount: TotalSGSTAmount,
                TotalGSTAmount: TotalGSTAmount,
                DepartmentName: DepartmentName
            };

            dmPrintInput.lines = [];
            var islno = 1;
            var GSTPercentages = Array();
            for (var idx in data.PatientReturns.PatientReturnDetails) {
                var billDetail = data.PatientReturns.PatientReturnDetails[idx];
                var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                var manu = billDetail.ItemMaster.ManufacturerName;
                if (manu && manu.length > 3) {
                    manu = manu.substring(0, 3);
                }

                var batchid = billDetail.BatchId;
                if (batchid && batchid.length > 4) {
                    batchid = batchid.substring(0, 4);
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

                var DetailDiscountPercentage = billDetail.DiscountPercentage.toFixed(1);

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

                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    desc: billDetail.ItemName,
                    hsn: vHSN,
                    sch: vSCH,
                    batch: batchid,
                    exp: expiryDate,
                    qty: billDetail.ReturnQuantity,
                    mrp: billDetail.Rate.toFixed(2),
                    value: billDetail.NetAmountBeforeGST.toFixed(2),
                    cgstper: billDetail.CGstPercentage,
                    cgstamt: cgstamt,
                    sgstper: billDetail.SGstPercentage,
                    sgstamt: sgstamt,
                    totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                    amount: billDetail.Amount.toFixed(2),
                    mfr: manu,
                    netamount: billDetail.NetAmount.toFixed(2),
                    DetailDiscountPercentage: DetailDiscountPercentage,
                    vLocation: Location,
                    gstper: billDetail.GSTPercentage,
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
                for (var index1 in data.PatientReturns.PatientReturnDetails) {
                    var BillDetails = data.PatientReturns.PatientReturnDetails[index1];
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
                    nextId = "desc0";
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
                    var idx = $scope.PatientReturnDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    } else {
                        $('#' + nextId).focus();
                    }
                } else if (nextId == 'qty') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 9) {
                if (nextId == 'desc') {
                    $scope.ValidQty(downId + index);
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.deletePatientReturnDetails(index, item);
                $scope.startinterval = $interval(function () {
                    var idx = $scope.PatientReturnDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                    $interval.cancel($scope.startinterval);
                }, 10);
            }
        };

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() == '')
                $('#' + nextId).val(0);
        };

        $scope.setCmbFocus = function (dom) {
            $scope.startinterval = $interval(function () {
                $scope.callCmbFocus(dom);
            }, 10);
        };

        $scope.callCmbFocus = function (dom) {
            var uiSelect = angular.element(dom);
            var uichild = uiSelect.controller('uiSelect');
            uichild.focusser[0].focus();
            uichild.activate();
            $interval.cancel($scope.startinterval);
        };

        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "paymenttype") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
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
                var datatime = res.BillNumber;
                var billamt = res.BillAmount;
                if (billamt) billamt = billamt.toFixed(2);
                $scope.LastTransactionDatetime = 'Last Bill Number : ' + datatime + ' Bill Amt : ';
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

            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('print', 'laserprintenable');

            if ($scope.dmprintpreferences)
                if ($scope.dmprintpreferences <= 0)
                    $('#btndmprint').hide();


            if ($scope.printpreferences)
                if ($scope.printpreferences <= 0)
                    $('#btnprint').hide();
        };

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();

        /* IP - Pharmacy  Return - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 113 && savehitcompleted == 0 && $scope.canShowSaveBtn) { // F2  - SaveDraft
                $scope.saveDraft();
            }
            if (kCode == 115 && savehitcompleted == 0 && $scope.canShowSaveapproveBtn) { // F2  - SaveAndApprove
                $scope.saveAndApprove();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.clear();
            }
            if (kCode == 120) { // F8  - Find Return Bills
                $scope.findReturn();
            }
            if (e.altKey && kCode == 83 && savehitcompleted == 0 && $scope.canShowSaveBtn) { // alt + s  - SaveDraft
                $scope.saveDraft();
            }
            if (e.altKey && kCode == 65 && savehitcompleted == 0 && $scope.canShowSaveapproveBtn) { // alt + s  - SaveAndApprove
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
        /* IP Pharmacy  Return - Shortcut Keys - End */
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
    }

    ippharmacyreturnsController.$inject = ['$rootScope', '$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();