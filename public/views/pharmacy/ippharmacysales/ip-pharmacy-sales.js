(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ippharmacysalesController', ippharmacysalesController);


    function ippharmacysalesController($rootScope, $scope, $interval, $stateParams, $state, $translate, utl, $filter, modalConfig, $timeout) {
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
        $scope.DeletedPatientBills = [];
        $scope.PatientBillDetails = [];
        $scope.WantListItem = {};
        $scope.WantedListData = {};
        $scope.selectedPatient = {};
        $scope.itemUsedBatches = {};

        $scope.SaveImdDMPrint = 0;

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.zerostocksales = 0;
        $scope.requirewantedlist = 0;
        $scope.zerostocksales =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'zerostocksales');
        $scope.requirewantedlist =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'requirewantedlist');
        $scope.enableroundoff = 0;
        $scope.enableroundoff =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'enableroundoff');
        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;


        $scope.item = {
            PatientId: -1,
            PatientName: '',
            DoctorId: -1,
            DoctorName: '',
            BillDate: utl.Formatter.getCurrentDate(),
            BillNumber: '',
            GuarantorTypeId: -1,
            GuarantorId: -1,
            GuarantorName: '',
            StoreMasterId: 0,
            StoreTypeId: 0,
            DepartmentId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientBillStatusId: 1,
            PatientBillStatus: null,
            PatientAdmissionStatusId: 0,
            PatientStatusId: 0,
            PharmacySaleTypeId: 6,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            TotalNetAmount: 0,
            IsPharmacyBill: 1,
            IsPrescription: 0,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            RdoPatientId: false,
            RdoGuarantorId: false,
            RdoDoctorId: false,
            RdoStoreMasterId: false,
            RdoWardId: false,
            RdoRoomId: false,
            RdoBedId: false,
            DrugServiceCategoryId: 0,
            DrugServiceGroupId: 0,
            NonDrugServiceCategoryId: 0,
            NonDrugServiceGroupId: 0,
            CanAllowIPDiscount: false,
            IsBillLock: false,
            IsGenericSearch: false,
            WithHeader: true,
            WithoutHeader: false
        };

        $scope.currentcontext = {
            id: 0,
            ApprovedById: -1,
            PatientBillStatusId: 1,
            PharmacyBillStatusId: 0,
            PatientStatusId: 1
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.id && $stateParams.id > 0) {
            $scope.item.PatientId = parseInt($stateParams.id);
            $scope.patientChange();
        }

        $scope.StoreChange = function (SelectedStore) {
            $scope.item.StoreTypeId = SelectedStore.StoreMaster.StoreTypeId;
            $scope.getStorePrintPreference();
            if ($scope.PatientBillDetails.length > 1)
                $scope.clear();
        };
        $scope.backtoList = function () {
            $state.go('app.pharmacydashboard');
        };
        $scope.applyVisibilityRules = function () {
            if ($scope.item.PatientBillStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
                $scope.CanShowAdd = false;
                // $scope.item.RdoStoreMasterId = true;
            }
            if ($scope.item.PatientBillStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
            }
            if ($scope.item.PatientBillStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
                $scope.CanShowAdd = false;
            }
            if ($scope.PatientBillInfo.length > 0) {
                $scope.CanShowAdd = true;
            }
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
                    itemname: item.ItemName
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

        //   $scope.setCmbFocus = function (dom) {
        //     $timeout(function () {
        //         var uiSelect = angular.element(dom);
        //         var uichild = uiSelect.controller('uiSelect');
        //         uichild.activate();
        //     }, 100);
        // };

        $scope.ipbatchDetails = function (idx, item) {
            utl.Modal.open('app.ippharmacybatch-details', {
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
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.onBatchChange = function (UpdatedItemData) {
            var ExpiryDays = null;
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
                    Mrp: item.BatchDetails[batid].Mrp,
                    Rate: item.BatchDetails[batid].Mrp,
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
                    RackId: item.RackId,
                    RackName: item.RackName,
                    VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                    ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                    ManufacturerName: item.ManufacturerName,
                    UnitCostPrice: item.BatchDetails[batid].Ucp,
                    MrPrice: item.BatchDetails[batid].Mrp,
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
                    Status: 1
                };

                ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                    PatientBillDetail.ExpiryStop = true;
                } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
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

                PatientBillDetail.BatchDetails = item.BatchDetails;
                $scope.PatientBillDetails.push(PatientBillDetail);
                $scope.currentcontext.BillDiscount = 0;
                savehitcompleted = 0;
            }

            $scope.CalculateNetAmt();
            $scope.addNewLineItem();

            var nxtidx = $scope.PatientBillDetails.length - 1;
            var nextId = "desc" + '' + nxtidx;
            $timeout(function () {
                $('#' + nextId).focus();
            }, 100);
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
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                MinQty: 0,
                Quantity: 0,
                MaxQty: 0,
                itemidxqty: null,
                BatchQuantity: 0,
                TotalQuantity: 0,
                Batch: false,
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
                PurchaseUomId: 0,
                BaseUomId: 0,
                SaleUomId: 0,
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
                IsPharmacySale: 1,
                IsDoctorDiscount: 0,
                IsGstDoctor: 0,
                StartDateTime: null,
                EndDateTime: null,
                DiscountTypeId: 0,
                DiscountModeId: 0,
                DiscountAuthorizedBy: 0,
                Discount: 0,
                DoctorShare: 0,
                ReferalShare: 0,
                CNAmount: 0,
                CancelReason: 0,
                CancelledBy: 0,
                Comments: '',
                DepartmentId: 0,
                GenericId: 0,
                GenericName: null,
                RackId: 0,
                RackName: '',
                Shelf: '',
                Tray: '',
                RST: '',
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
                SubCategoryId: 0,
                VendorMasterId: 0,
                ManufacturerId: 0,
                GrnId: 0,
                GrnDetailId: 0,
                StockEntryId: 0,
                StockEntryDetailId: 0,
                DrugId: 0,
                DrugName: '',
                IsPrescribed: false,
                IsSupplementary: false,
                IsFallUnderMinQty: false,
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

        $scope.onBatchSelected = function (pharmacyItem, selectedMasterItem, idx) {
            var existing = $scope.itemUsedBatches[pharmacyItem.ItemMasterId].indexOf(pharmacyItem.BatchId);
            var modified = $scope.itemUsedBatches[pharmacyItem.ItemMasterId].indexOf(pharmacyItem.SelectedBatchId);
            if (modified == -1) {
                pharmacyItem.StockSerialItemId = selectedMasterItem.Id;
                pharmacyItem.StockItemId = selectedMasterItem.StockItemId;
                pharmacyItem.BatchId = selectedMasterItem.BatchId;
                pharmacyItem.SelectedBatchId = selectedMasterItem.BatchId;
                pharmacyItem.BatchQuantity = selectedMasterItem.Quantity;
                pharmacyItem.UnitCostPrice = selectedMasterItem.Ucp;
                pharmacyItem.MrPrice = selectedMasterItem.Mrp;
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
                pharmacyItem.UnitGSTAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.GstPercentage).toFixed(4));

                pharmacyItem.InGstId = selectedMasterItem.InGstId;
                pharmacyItem.InGstPercentage = selectedMasterItem.InGstPercentage;
                pharmacyItem.UnitInGstAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.InGstPercentage).toFixed(4));

                pharmacyItem.CGstId = selectedMasterItem.CGstId;
                pharmacyItem.CGstPercentage = selectedMasterItem.CGstPercentage;
                pharmacyItem.UnitCGstAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.CGstPercentage).toFixed(4));

                pharmacyItem.SGstId = selectedMasterItem.SGstId;
                pharmacyItem.SGstPercentage = selectedMasterItem.SGstPercentage;
                pharmacyItem.UnitSGstAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.SGstPercentage).toFixed(4));

                if (selectedMasterItem.ExpiryAlert) {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = true;
                    pharmacyItem.ExpiryStop = false;
                    pharmacyItem.ExpiryProceed = false;
                    utl.Alert.showErrorMsg('Item Going to expire Soon!...');
                    pharmacyItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                } else if (selectedMasterItem.ExpiryStop) {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = false;
                    pharmacyItem.ExpiryStop = true;
                    utl.Alert.showErrorMsg('Item Going to expire Soon!...');
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
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.batchalert2.lbl') + pharmacyItem.ItemName);

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
                    selectedItem.IsDecimalAllowed = SelectedMasterItem.ItemMaster.IsDecimalAllowed;
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

        $scope.addWantList = function () {
            $scope.WantListItem.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.WantListItem.RequestedDate = utl.Formatter.getCurrentDate();
            $scope.WantListItem.ItemMasterId = $scope.WantedListData.ItemMasterId;
            $scope.WantListItem.ItemCode = $scope.WantedListData.ItemCode;
            $scope.WantListItem.ItemName = $scope.WantedListData.ItemName;
            $scope.WantListItem.StoreMasterId = $scope.item.StoreMasterId;
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

        $scope.CleanItemBatches = function (item) {
            for (var count = 0; count < $scope.PatientBillDetails.length; count++) {
                var cllitem = $scope.PatientBillDetails[count];
                if (cllitem.ItemMasterId == item.ItemMasterId) {
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
        };

        $scope.ChooseBatches = function (idx, item) {
            var currentitem = item;
            var PatientBillDetail = {};
            var ExpiryDays = null;
            $scope.currentcontext.ReceiptAmt = 0;
            if (item.Quantity > item.TotalQuantity) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.availqty.lbl'));

                item.Quantity = 0;
            } else if (item.Quantity === null || item.Quantity === 0) {
                //utl.Alert.showErrorMsg('Quantity should be Greater Than Zero');
                //item.Quantity = 0;
            } else {
                $scope.CleanItemBatches(item);
                item.BatchDetails.sort($scope.custom_multi_sort);
                for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                    if (item.Quantity > 0) {
                        if (item.BatchDetails[batid].Quantity >= item.Quantity) {
                            PatientBillDetail = {
                                Id: 0,
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
                                Ucp: item.BatchDetails[batid].Ucp,
                                Mrp: item.BatchDetails[batid].Mrp,
                                Rate: item.BatchDetails[batid].Mrp,
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
                                RackId: item.RackId,
                                RackName: item.RackName,
                                Shelf: item.Shelf,
                                Tray: item.Tray,
                                RST: item.RST,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                UnitCostPrice: item.BatchDetails[batid].Ucp,
                                MrPrice: item.BatchDetails[batid].Mrp,
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
                                SubCategoryId: 0,
                                DrugId: 0,
                                DrugName: '',
                                IsPrescribed: false,
                                IsSupplementary: item.IsSupplementary,
                                IsNarcotic: item.IsNarcotic,
                                PharmacySaleTypeId: 6,
                                Status: 1,
                                IsNonClaimable: item.IsNonClaimable,
                                IsDecimalAllowed: item.IsDecimalAllowed
                            };
                            if (PatientBillDetail.IsDecimalAllowed == false) {
                                PatientBillDetail.Quantity = parseInt(PatientBillDetail.Quantity);
                            }
                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                PatientBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
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
                            if (item.DiscountModeId == 2 && item.Discount > 0) {
                                PatientBillDetail.DiscountPercentage = item.Discount;
                                PatientBillDetail.UnitDiscountAmount = parseFloat((item.Discount / 100 * PatientBillDetail.MrPrice).toFixed(2));
                                PatientBillDetail.DiscountAmount = item.UnitDiscountAmount * PatientBillDetail.Quantity;
                                PatientBillDetail.Rate = PatientBillDetail.MrPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);
                            } else if (item.DiscountModeId == 1 && item.Discount > 0) {
                                PatientBillDetail.UnitDiscountAmount = item.Discount;
                                PatientBillDetail.DiscountAmount = item.UnitDiscountAmount * PatientBillDetail.Quantity;
                                PatientBillDetail.Rate = PatientBillDetail.MrPrice - item.Discount;
                            } else {
                                PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                            }
                            PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                            PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                            PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
                            PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
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
                        } else if (item.BatchDetails[batid].Quantity < item.Quantity) {
                            PatientBillDetail = {
                                Id: 0,
                                //BillDateTime: utl.Formatter.getCurrentDate(),
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
                                Quantity: item.BatchDetails[batid].Quantity,
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
                                Mrp: item.BatchDetails[batid].Mrp,
                                Rate: item.BatchDetails[batid].Mrp,
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
                                RackId: item.RackId,
                                RackName: item.RackName,
                                Shelf: item.Shelf,
                                Tray: item.Tray,
                                RST: item.RST,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                UnitCostPrice: item.BatchDetails[batid].Ucp,
                                MrPrice: item.BatchDetails[batid].Mrp,
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
                                SubCategoryId: 0,
                                DrugId: 0,
                                DrugName: '',
                                IsPrescribed: false,
                                IsSupplementary: item.IsSupplementary,
                                PharmacySaleTypeId: 6,
                                IsNarcotic: item.IsNarcotic,
                                Status: 1,
                                IsNonClaimable: item.IsNonClaimable,
                                IsDecimalAllowed: item.IsDecimalAllowed
                            };
                            if (PatientBillDetail.IsDecimalAllowed == false) {
                                PatientBillDetail.Quantity = parseInt(PatientBillDetail.Quantity);
                            }
                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                PatientBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
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
                            if (item.DiscountModeId == 2 && item.Discount > 0) {
                                PatientBillDetail.DiscountPercentage = item.Discount;
                                PatientBillDetail.UnitDiscountAmount = parseFloat((item.Discount / 100 * PatientBillDetail.MrPrice).toFixed(2));
                                PatientBillDetail.DiscountAmount = item.UnitDiscountAmount * PatientBillDetail.Quantity;
                                PatientBillDetail.Rate = PatientBillDetail.MrPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);
                            } else if (item.DiscountModeId == 1 && item.Discount > 0) {
                                PatientBillDetail.UnitDiscountAmount = item.Discount;
                                PatientBillDetail.DiscountAmount = item.UnitDiscountAmount * PatientBillDetail.Quantity;
                                PatientBillDetail.Rate = PatientBillDetail.MrPrice - item.Discount;
                            } else {
                                PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                            }
                            PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                            PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                            PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
                            PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
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
                        }
                        if ($scope.item.GuarantorTypeId > 1) {
                            if (PatientBillDetail.IsNonClaimable == false) {
                                if ($scope.item.CoPayPercent) {
                                    PatientBillDetail.PatNetAmount = parseFloat(PatientBillDetail.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                                    PatientBillDetail.InsNetAmount = parseFloat(PatientBillDetail.NetAmount) - parseFloat(PatientBillDetail.PatNetAmount);
                                }
                                if (!$scope.item.CoPayPercent) {
                                    PatientBillDetail.InsNetAmount = parseFloat(PatientBillDetail.NetAmount);
                                }
                            } else {
                                PatientBillDetail.PatNetAmount = parseFloat(PatientBillDetail.NetAmount);
                                PatientBillDetail.InsNetAmount = 0;
                                PatientBillDetail.IsSupplementary = true;
                            }

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

        function GetExpiryDays(ExpiryDate) {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var CurDate = new Date(TodayDate);

            var FutureDate = ExpiryDate.slice(0, 10);
            var ExpDate = new Date(FutureDate);

            var ExpiryDays = Math.round((ExpDate - CurDate) / (1000 * 60 * 60 * 24));
            return ExpiryDays;
        }

        $scope.CheckBatchQty = function (item) {
            if (item.BatchQuantity > 0) {
                if (item.Quantity > item.BatchQuantity) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.quantityalert.lbl'));

                    item.Quantity = 0;
                    item.Rate = 0;
                    item.Amount = 0;
                    item.GSTAmount = 0;
                    item.InGstAmount = 0;
                    item.CGstAmount = 0;
                    item.SGstAmount = 0;
                    item.NetAmount = 0;
                    item.NetAmountBeforeGST = 0;
                } else if (item.Quantity === null) {
                    item.Rate = 0;
                    item.Amount = 0;
                    item.GSTAmount = 0;
                    item.InGstAmount = 0;
                    item.CGstAmount = 0;
                    item.SGstAmount = 0;
                    item.NetAmount = 0;
                    item.NetAmountBeforeGST = 0;
                } else {
                    item.Rate = item.MrPrice;
                    item.Amount = item.Quantity * item.Rate;
                    item.GSTAmount = item.UnitGSTAmount * item.Quantity;
                    item.InGstAmount = item.UnitInGstAmount * item.Quantity;
                    item.CGstAmount = item.UnitCGstAmount * item.Quantity;
                    item.SGstAmount = item.UnitSGstAmount * item.Quantity;
                    item.NetAmount = item.Amount;
                    item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;
                }

                $scope.CalculateNetAmt();
            }
        };

        $scope.CalcualteAmt = function (item) {
            if (item.Quantity > item.BatchQuantity) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.availqty.lbl'));
                item.Quantity = 0;
            } else if (item.Quantity === null) { } else {
                item.Rate = item.MrPrice;
                item.Amount = parseFloat((item.Quantity * item.Rate).toFixed(2));
                item.GSTAmount = parseFloat((item.UnitGSTAmount * item.Quantity).toFixed(2));
                item.InGstAmount = parseFloat((item.UnitInGstAmount * item.Quantity).toFixed(2));
                item.CGstAmount = parseFloat((item.UnitCGstAmount * item.Quantity).toFixed(2));
                item.SGstAmount = parseFloat((item.UnitSGstAmount * item.Quantity).toFixed(2));

                if (item.DiscountModeId > 0 && item.DiscountModeId == 2) {
                    item.DiscountPercentage = parseFloat(item.Discount);
                    item.DiscountAmount = parseFloat(((parseFloat(item.Discount) / 100) * item.Amount).toFixed(2));
                    item.NetAmount = parseFloat((item.Amount - item.DiscountAmount).toFixed(2));
                    item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;
                } else if (item.DiscountModeId > 0 && item.DiscountModeId == 1) {
                    item.DiscountPercentage = 0;
                    item.DiscountAmount = parseFloat(item.Discount);
                    item.NetAmount = parseFloat((item.Amount - parseFloat(item.DiscountAmount)).toFixed(2));
                    item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;
                } else {
                    item.DiscountPercentage = 0;
                    item.DiscountAmount = 0;
                    item.NetAmount = item.Amount;
                    item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;
                }

                if (item.NetAmount >= 0) {
                    $scope.CalculateNetAmt();
                } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.discountamt.lbl'));
                    item.NetAmount = item.Amount;
                    item.Discount = 0;
                    item.DiscountPercentage = 0;
                    item.DiscountAmount = 0;
                }
            }
        };

        $scope.CalculateNetAmt = function () {
            var itemwisegrossamount = 0;
            var itemwisegstamount = 0;
            var itemwiseingstamount = 0;
            var itemwisecgstamount = 0;
            var itemwisesgstamount = 0;
            var itemwisenetamount = 0;
            var itemwisenetpatamt = 0;
            var itemwisenetinsamt = 0;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                if ($scope.PatientBillDetails[i].Status == 1) {
                    var itemgrossamount = 0;
                    var itemgstamount = 0;
                    var itemingstamount = 0;
                    var itemcgstamount = 0;
                    var itemsgstAmount = 0;
                    var itemnetamount = 0;
                    var itempatamt = 0;
                    var iteminsamt = 0;
                    itemgrossamount = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                    itemgstamount = isNaN(parseFloat($scope.PatientBillDetails[i].GSTAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].GSTAmount);
                    itemingstamount = isNaN(parseFloat($scope.PatientBillDetails[i].InGstAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].InGstAmount);
                    itemcgstamount = isNaN(parseFloat($scope.PatientBillDetails[i].CGstAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].CGstAmount);
                    itemsgstAmount = isNaN(parseFloat($scope.PatientBillDetails[i].SGstAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].SGstAmount);
                    itemnetamount = isNaN(parseFloat($scope.PatientBillDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].NetAmount);
                    if ($scope.item.GuarantorTypeId > 1) {
                        itempatamt = isNaN(parseFloat($scope.PatientBillDetails[i].PatNetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].PatNetAmount);
                        iteminsamt = isNaN(parseFloat($scope.PatientBillDetails[i].InsNetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].InsNetAmount);
                    }

                    itemwisegrossamount += itemgrossamount;
                    itemwisegstamount += itemgstamount;
                    itemwiseingstamount += itemingstamount;
                    itemwisecgstamount += itemcgstamount;
                    itemwisesgstamount += itemsgstAmount;
                    itemwisenetamount += itemnetamount;
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
            $scope.item.NetPatientAmount = itemwisenetpatamt || 0;
            $scope.item.NetInsuranceAmount = itemwisenetinsamt || 0;
            var NetNaturalValue = getNatural(Number($scope.item.TotalGrossAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.item.TotalGrossAmount).toFixed(2));
            var PreferedRoundOff = parseFloat($scope.item.PreferedRoundOff);
            var NetRoundOffValue = 0;
            if ($scope.enableroundoff == 1) {
                if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                    $scope.item.TotalGrossAmount = NetNaturalValue;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.item.TotalGrossAmount);
                    NetRoundOffValue = -1 * (NetDecimalValue / 100);
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                    $scope.item.TotalGrossAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.item.TotalGrossAmount);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else {
                    NetRoundOffValue = 0;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                }
            }
        };

        $scope.clear = function () {
            $scope.SaveImdDMPrint = 0;
            $state.reload();
            savehitcompleted = 0;
            $('#pid').focus();
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.numberonly = function (e, item) {
            console.log(item);
            console.log(e.keyCode);
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                if (e.keyCode == 46 && item.IsDecimalAllowed == true) { }
                else { return; }

            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                if (item.IsDecimalAllowed == true && e.keyCode == 46) {

                } else {
                    e.preventDefault();
                }

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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.DepartmentName = selectedItem.UserDept.DepartmentName;
                if (selectedItem.Department) {
                    // if (selectedItem.Department.IsEmergency == true)
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
            // $scope.getDoctorTeam();
            // $scope.getFollowupDeptwise();
            // $scope.calDoctorShareInfo();
            return result;
        }

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

        //Guarantor List
        vm.guarantorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                {
                    header: 'Guarantor Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                }, {
                    header: 'Guarantor Name',
                    field: 'GuarantorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/Guarantor/GetGuarantors',
            formatdisplay: formatselectedguarantor,
            presearch: presearchguarantor,
            postsearch: postsearchguarantor
        };

        function formatselectedguarantor() {
            var selectedItem = vm.guarantorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.GuarantorId = selectedItem.Id;
                $scope.item.GuarantorName = selectedItem.GuarantorName;
                result = [selectedItem.GuarantorName].join(' ');
            } else if (vm.guarantorcontrolconfig.rowdata) {
                result = [vm.guarantorcontrolconfig.rowdata.GuarantorName].join(' ');
            }
            return result;
        }

        function presearchguarantor() {
            var query = vm.guarantorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };


            if (vm.guarantorcontrolconfig.searchbyid === true) {
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

            vm.guarantorcontrolconfig.searchparams = inputData;
        }

        function postsearchguarantor() {
            for (var idx in vm.guarantorcontrolconfig.result) {
                var item = vm.guarantorcontrolconfig.result[idx];
                item.GuarantorName = item.GuarantorName;
                item.GuarantorCode = item.GuarantorCode;
                $scope.item.GuarantorTypeId = item.GuarantorTypeId;
                $scope.item.TpaId = item.TPAId;
                // if (item.RemarkType) {
                //     item.RemarkType = item.RemarkType.Description;
                // }
            }
        }

        $scope.amountConversion = function (amount) {
            if (amount !== undefined) {
                return parseFloat(amount).toFixed(2);
            } else {
                return '0.00';
            }
        };

        function PatientIPPharmacyBillPickerCallback(patientbilldata) {
            console.log(patientbilldata);
            $scope.currentcontext.id = patientbilldata.BillId;
            $scope.item.EncounterId = patientbilldata.EncounterId;
            $scope.item.WardId = patientbilldata.WardId;
            $scope.item.PatientId = patientbilldata.PatientId;
            $scope.item.RoomId = patientbilldata.RoomId;
            $scope.item.BedId = patientbilldata.BedId;
            $scope.item.StoreMasterId = patientbilldata.StoreId;
            $scope.currentcontext.PharmacyBillStatusId = patientbilldata.BillStatusId;
            $scope.patientChange();
            $scope.getBillInfoByBillId();
        }

        $scope.findBill = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.find-ip-pharmacy-sales', {
                params: {
                    id: $scope.item.EncounterId
                },
                confirmCallback: PatientIPPharmacyBillPickerCallback
            });
        };
        $scope.pendingBill = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.pending-ippharmacy-sale', {
                params: {
                    id: $scope.item.EncounterId
                },
                confirmCallback: PatientIPPharmacyBillPickerCallback
            });
        };
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
            $state.go('app.ip-pharmacy-sales', {
                id: 0,
                pid: $scope.currentcontext.pid
            });
        };

        $scope.openAttachments = function () {
            $scope.SaveImdDMPrint = 0;
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
                        withoutHeader: $scope.item.WithoutHeader,
                    }
                };
                var options = {
                    action: 'billing/patientbills/PrintIPPharmacyBills',
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
                        withoutHeader: $scope.item.WithoutHeader,
                    }
                };
                var options = {
                    action: 'billing/patientbills/PrintIPPharmacyBills',
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
                action: 'billing/patientbills/PrintPharmacyBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.deletePatientBillDetails = function (idx, item) {
            if (item.ItemMasterId != -1) {
                /*
                var existing = $scope.itemUsedBatches[item.ItemMasterId].indexOf(item.SelectedBatchId);
                $scope.itemUsedBatches[item.ItemMasterId].splice(existing, 1);
                */
                var index = $scope.PatientBillDetails.indexOf(item);
                item.Status = 2;
                $scope.DeletedPatientBills.push(item);
                $scope.PatientBillDetails.splice(index, 1);
                var lastIndex = $scope.PatientBillDetails.length - 1;
                if (lastIndex < 0) {
                    $scope.addNewLineItem();
                }
                $scope.CalculateNetAmt();
            }
            $scope.setIndexforTableIndex();
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
                    $scope.item.PharmacySaleTypeId = patientbills.PharmacySaleTypeId;
                    $scope.item.TotalGrossAmount = patientbills.BillAmount;
                    $scope.item.TotalGstAmount = patientbills.GSTAmount;
                    $scope.item.TotalInGstAmount = patientbills.InGstAmount;
                    $scope.item.TotalCGstAmount = patientbills.CGstAmount;
                    $scope.item.TotalSGstAmount = patientbills.SGstAmount;
                    $scope.item.TotalNetAmount = patientbills.BillAmount;
                    $scope.item.Comments = patientbills.Comments;
                    if (patientbills.CreatedUser) {
                        $scope.item.DispensedBy = patientbills.CreatedUser.Title.Description + '.' + patientbills.CreatedUser.UserName;
                    }
                    $scope.item.IsPharmacyBill = 1;

                    if ($scope.item.PatientBillStatusId == 3) {
                        $scope.item.RdoPatientId = true;
                        $scope.item.RdoGuarantorId = true;
                        $scope.item.RdoDoctorId = true;
                        $scope.item.RdoStoreMasterId = true;
                        $scope.item.RdoWardId = true;
                        $scope.item.RdoRoomId = true;
                        $scope.item.RdoBedId = true;
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
                                $scope.item.RdoStoreMasterId = true;
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
                    $scope.setIndexforTableIndex();
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
                    }, {
                        Key: 29,
                        Value: $scope.item.StoreMasterId
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
            var storemasterid = $scope.item.StoreMasterId;
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
                // $scope.setDefaultPrivateDueId();
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;

            $scope.getBillInfoByBillId();
            $scope.applyVisibilityRules();
            if (options && options.data && options.data.Data &&
                options.data.Data.Header &&
                options.data.Data.Header.PatientBillStatusId == 3) {
                if ($scope.printpreferences == 1) {
                    $scope.print();
                    $scope.clear();
                }
            }
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.SaveImdDMPrint = 1;

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
            $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem(1);
        };

        $scope.securitypisvalid = false;

        $scope.SecurityPINChkCallback = function (SecurityStatus) {
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

        $scope.saveAndApprove = function () {
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber === null) { }

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

        $scope.saveBillCancelled = function () {
            $scope.saveItem(3);
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

        $scope.errorItemCallback = function (data, options) {
            console.log(data);
            if (data.Error.Message) {
                var message = data.Error.Message;


                if (message.includes('Stock Changes Happened') == true) {
                    message = message.replace("Stock Changes Happened for ", "");
                    let error_items = message.split("$,$");
                    for (var idx in error_items) {
                        let item = error_items[idx];
                        let item_det = item.split(":");
                        var itemid = Number(item_det[0]);

                        // let find_index = $scope.PatientBillDetails.findIndex(bDet => {
                        //     return bDet.ItemMasterId == itemid
                        // });
                        // $scope.PatientBillDetails.forEach((billItem, index) => billItem.ItemMasterId === itemid ? $scope.PatientBillDetails[index].removeEntry = true : $scope.PatientBillDetails[index].removeEntry = false)

                        $scope.PatientBillDetails.forEach(function (elem, index, array) {
                            if (elem.ItemMasterId === itemid) {
                                $scope.PatientBillDetails[index].removeEntry = true;
                            }
                            // return indexesOf12
                        });
                        // console.log(find_index);
                        // if (find_index != -1) {
                        //     $scope.PatientBillDetails[find_index].removeEntry = true;
                        // }
                    }
                    console.log($scope.PatientBillDetails); //return;
                } else if (message.includes('Stock Already Transfered') == true) {
                    $scope.backToList();
                } else {
                    console.log(message);
                }
            }
        };
        $scope.saveItem = function (StatusId) {
            if ($scope.currentcontext.PatientBillStatusId == 1 && $scope.currentcontext.id > 0) savehitcompleted = 0;
            if (savehitcompleted == 1) return false;

            if ($scope.item.IsEncounter === false) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientalert.lbl'));

                return false;
            }

            if ($scope.item.PatientAdmissionStatusId > 4) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientdischarge.lbl'));
                return false;
            }

            if ($scope.item.IsBillLock) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.lockmode.lbl'));

                return false;
            }

            $scope.item.PatientBillStatusId = StatusId;

            if (!$scope.PatientBillDetails || $scope.PatientBillDetails.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

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

                if (CheckExpiry == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.expiryalert.lbl') + ItemName);

                    return false;
                }
            }

            $scope.item.Id = $scope.currentcontext.id;
            //$scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.item.BillTypeId = 3;
            $scope.item.BillPriorityId = 1;
            $scope.item.BillAmount = $scope.item.TotalGrossAmount;
            $scope.item.RoundOffValue = $scope.item.TotRndoffAmt || 0;
            $scope.item.OutStandingAmount = $scope.item.TotalGrossAmount;
            $scope.item.GSTAmount = $scope.item.TotalGstAmount;
            $scope.item.InGstAmount = $scope.item.TotalInGstAmount;
            $scope.item.CGstAmount = $scope.item.TotalCGstAmount;
            $scope.item.SGstAmount = $scope.item.TotalSGstAmount;
            $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();
            $scope.item.BillApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.PharmacyBillStatusId = $scope.currentcontext.PharmacyBillStatusId;
            $scope.item.PatientTypeId = 0;
            if ($scope.item.IsEncounter)
                $scope.item.EncounterId = $scope.encounter.Id;
            $scope.item.EncounterTypeId = 2;
            if ($scope.item.CancelReason)
                $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            else
                $scope.item.CancelledBy = 0;

            if (checkMandatoryFields()) {
                var pharmacyitemlines = getLinesForSave();
                var paymentlines = [];
                var actionName = 'billing/patientbills/AddIPPatientPharmacyBills';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientbills/UpdatePatientPharmacyBills';
                }

                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: pharmacyitemlines,
                    paymentDetail: paymentlines
                };
                // console.log(inputData);return;
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
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var piidx in $scope.PatientBillDetails) {
                var pharmacyitem = $scope.PatientBillDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseFloat(pharmacyitem.Quantity) > 0) {
                    pharmacyitem.SubCategoryId = pharmacyitem.SubCategoryId;
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
                    if (pharmacyitem.IsDecimalAllowed)
                        pharmacyitem.Quantity = parseFloat(pharmacyitem.Quantity);
                    else
                        pharmacyitem.Quantity = parseInt(pharmacyitem.Quantity);
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
                    pharmacyitem.RackId = pharmacyitem.RackId;
                    pharmacyitem.RackName = pharmacyitem.RackName;
                    pharmacyitem.ItemCode = pharmacyitem.ItemCode;
                    pharmacyitem.ItemName = pharmacyitem.ItemName;
                    pharmacyitem.DrugCode = pharmacyitem.ItemCode;
                    pharmacyitem.DrugName = pharmacyitem.ItemName;
                    pharmacyitem.ScheduleTypeId = pharmacyitem.ScheduleTypeId;
                    pharmacyitem.ScheduleTypeDescription = pharmacyitem.ScheduleTypeDescription;
                    pharmacyitem.StoreMasterId = $scope.item.StoreMasterId;
                    pharmacyitem.DepartmentId = $scope.item.DepartmentId;
                    pharmacyitem.IsPharmacyCredit = true;
                    console.log($scope.encounter.IsPackageAssigned);
                    if ($scope.encounter.IsPackageAssigned) {
                        pharmacyitem.IsInclusionItem = 1;
                    }

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
        $scope.getPendingIndentCountCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.PatientPendingIndentCount = res.Data.length;
            }
        };

        $scope.getPendingIndentCount = function () {
            if ($scope.item.PatientId) {
                var inputData = {
                    Params: [{
                        Key: 5,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 18,
                        Value: 1
                    },
                    {
                        Key: 8,
                        Value: utl.Session.getCurrentFacilityId()
                    }
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPendingIndentCountCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.pendingindents = function () {
            utl.Modal.open('app.patientpendingindents', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: $scope.pendingindent
            });
        };

        $scope.pendingindent = function (IndentData) {
            if (IndentData.Id && IndentData.Id > 0) {
                $scope.item.PatientStockRequestId = IndentData.Id;

                var options = {
                    action: 'IPManagement/PatientStockRequests/GetPendingIndents',
                    data: {
                        Id: IndentData.Id
                    },
                    type: 'post',
                    onComplete: $scope.getIndentData
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getIndentData = function (scope, data, options, hasError) {
            $scope.IndentDetails = [];
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
                DrugDetail.StoreMasterId = $scope.item.StoreMasterId;
                DrugDetail.Quantity = item.Min;
                DrugDetail.SelectedItem = item;
                DrugDetail.SelectedItem.ItemMasterId = item.Id;
                DrugDetail.SelectedItem.StoreMasterId = $scope.item.StoreMasterId;
                $scope.IndentDetails.push(DrugDetail);
            });

            $scope.item.IsPrescription = 1;

            for (var idx in $scope.IndentDetails) {
                var item = $scope.IndentDetails[idx];
                $scope.ServiceItemChanged(idx, item);
            }
        };
        $scope.getPendingPrescriptionCountCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.PatientPendingPrescribeCount = res.Data.length;
            }
        };

        $scope.getPendingPrescriptionCount = function () {
            if ($scope.item.PatientId) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.PatientId
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
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/prescription/GetPrescriptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPendingPrescriptionCountCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.pendingPrescription = function () {
            utl.Modal.open('app.pendingprescriptions', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: $scope.pendingprescription
            });
        };

        $scope.pendingprescription = function (pendingData) {
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
                DrugDetail.StoreMasterId = $scope.item.StoreMasterId;
                DrugDetail.Quantity = item.Min;
                DrugDetail.SelectedItem = item;
                DrugDetail.SelectedItem.ItemMasterId = item.Id;
                DrugDetail.SelectedItem.StoreMasterId = $scope.item.StoreMasterId;
                $scope.PrescriptionDetails.push(DrugDetail);
            });

            $scope.item.IsPrescription = 1;

            for (var idx in $scope.PrescriptionDetails) {
                var item = $scope.PrescriptionDetails[idx];
                item.IsThisPrescription = true;
                $scope.ServiceItemChanged(idx, item);
            }
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

        $scope.getPatientInfo = function (scope, data, options, hasError) {
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
            $scope.CanShowAdd = true;
            $scope.fnencounter();
            $scope.initLookup();
            $scope.getPendingPrescriptionCount();
            $scope.getPendingIndentCount();
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [{
                    Key: 14,
                    Value: 1
                },
                {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 4,
                    Value: $scope.item.PatientId
                },
                {
                    Key: 52, //IsLatest
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
                $scope.CanshowInsfield = false;
                if ($scope.item.GuarantorTypeId > 1) {
                    $scope.CanshowInsfield = true;
                }
                if ($scope.encounter.AdmissionStatusId > 4) {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.IsEncounter = true;
                    $scope.PatientReturnDetails = [];
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientdischarge.lbl'));

                } else {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.IsEncounter = true;
                    if ($scope.encounter.IsBillLock) {
                        $scope.PatientBillDetails = [];
                        $scope.item.IsBillLock = true;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.lockmode.lbl'));

                    } else {
                        $scope.addNewLineItem();
                    }
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.visitalert.lbl'));

            }
            if ($scope.item.EncounterId)
                $scope.getBillInfoByPatientID();
        };

        $scope.getPendingBillCallBack = function (scope, res, options, hasError) {
            $scope.PatientBillInfo = res.Data || [];
            $scope.item.Count = $scope.PatientBillInfo.length;
        };

        $scope.getBillInfoByPatientID = function () {
            if ($scope.item.EncounterId > 0) {
                var inputData = {
                    Params: [{
                        Key: 16,
                        Value: $scope.item.EncounterId
                    }, {
                        Key: 4,
                        Value: 1
                    },],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    // onComplete: $scope.getBillInfoCallback
                    onComplete: $scope.getPendingBillCallBack
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                /*
                { header: 'Patient Name', field: 'PatientName', datatype: 'string', headercls: 'td-patientname', fieldcls: 'td-patientname' },
                { header: 'Ward Name', field: 'WardName', datatype: 'string', headercls: 'td-wardname', fieldcls: 'td-wardname' },
                { header: 'Room No', field: 'RoomNo', datatype: 'string', headercls: 'td-roomno', fieldcls: 'td-roomno' },
                { header: 'Bed No', field: 'BedNo', datatype: 'string', headercls: 'td-bedno', fieldcls: 'td-bedno' },
                */

                {
                    header: 'Title',
                    field: 'Title',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'PatientName',
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
                {
                    header: 'Visit#',
                    field: 'VisitIdentifier',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Ward/Room/Bed',
                    field: 'WardDetail',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            var strTitle = '';
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
                $scope.item.BedId = selectedItem.BedId;

                strTitle = selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            } else if (vm.patientcontrolconfig.rowdata) {
                if (vm.patientcontrolconfig.rowdata.Patient) {
                    result = [vm.patientcontrolconfig.rowdata.Patient.Title.Description,
                    vm.patientcontrolconfig.rowdata.Patient.FirstName,
                    vm.patientcontrolconfig.rowdata.Patient.LastName
                    ].join(' ');
                } else {
                    return '';
                }
            }
            $scope.patientChange();

            return result;
        }

        /*
        $scope.patientChanged = function() {
            $scope.Encounter = $scope.item.SelectedItem;
            var selectedItem = $scope.item.SelectedItem;

            $scope.item.DoctorId = selectedItem.DoctorId;
            $scope.item.OrderFromId = selectedItem.DepartmentId;
            $scope.item.OrderToId = 8;
            $scope.item.PatientId = selectedItem.PatientId;
            $scope.item.PatientName = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            if (selectedItem.EncounterTypeId == 2) {
                $scope.item.EncounterTypeId = 2;
                $scope.item.ServiceRateCategoryId = 2;
            } else {
                $scope.item.ServiceRateCategoryId = 1;
                $scope.item.EncounterTypeId = 1;
            }
            $scope.item.EncounterId = selectedItem.Id;
        };
        */

        function presearchEncounter() {
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
            /*
            if ($scope.currentcontext.id === 0 && $scope.currentcontext.testtype > 0) {
                inputData.Params.push({ Key: 3, Value: 2 || 3 || 4 }, { Key: 15, Value: 2 });
            }
            */
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
                // inputData.Params.push({
                //     Key: 13,
                //     Value: query
                // });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 13,
                    Value: query
                });
                // inputData.Params.push({
                //     Key: 13,
                //     Value: query
                // });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                /*
                item.PatientName = item.Patient.FirstName;
                item.WardName = item.WardMaster.WardName;
                item.RoomNo = item.WardRoomMaster.RoomNo;
                item.BedNo = item.WardRoomBedMaster.BedNo;
                */
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        }

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
                if ($scope.item.GuarantorTypeId == 1) {
                    selectedItem.IsNonClaimable = false;
                }
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
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
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
                    Value: $scope.item.StoreMasterId
                },
                {
                    Key: 17,
                    Value: $scope.item.StoreTypeId
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

        // if ($scope.zerostocksales == 1) {
        //     vm.pharmacyitemcontrolconfig = {
        //         query: '',
        //         searchbyid: false,
        //         options: [{
        //             header: 'Item Code',
        //             field: 'ItemCode',
        //             datatype: 'string',
        //             headercls: 'td-code',
        //             fieldcls: 'td-code'
        //         },
        //         {
        //             header: 'Item Name',
        //             field: 'ItemName',
        //             datatype: 'string',
        //             headercls: 'td-name',
        //             fieldcls: 'td-name'
        //         },
        //         /*
        //         {
        //             header: 'Product Type Name',
        //             field: 'ProductTypeName',
        //             datatype: 'string',
        //             headercls: 'td-producttypename',
        //             fieldcls: 'td-producttypename'
        //         },
        //         */
        //         {
        //             header: 'Generic Name',
        //             field: 'GenericName',
        //             datatype: 'string',
        //             headercls: 'td-genericname',
        //             fieldcls: 'td-genericname'
        //         },
        //         /*
        //         {
        //             header: 'Manufacturer Name',
        //             field: 'ManufacturerName',
        //             datatype: 'string',
        //             headercls: 'td-manufacturername',
        //             fieldcls: 'td-manufacturername'
        //         },
        //         */
        //         // {
        //         //     header: 'Claim',
        //         //     field: 'Claimable',
        //         //     datatype: 'string',
        //         //     headercls: 'td-claimable',
        //         //     fieldcls: 'td-claimable'
        //         // },
        //         // {
        //         //     header: 'Rack Name',
        //         //     field: 'RackName',
        //         //     datatype: 'string',
        //         //     headercls: 'td-rackname',
        //         //     fieldcls: 'td-rackname'
        //         // },
        //         {
        //             header: 'Stock-In-Hand',
        //             field: 'StockInHand',
        //             datatype: 'string',
        //             headercls: 'td-stockinhand',
        //             fieldcls: 'td-stockinhand'
        //         },
        //         {
        //             header: 'Sales Price',
        //             field: 'MrPrice',
        //             datatype: 'string',
        //             headercls: 'td-mrprice',
        //             fieldcls: 'td-mrprice'
        //         }
        //         ],
        //         searchparams: {},
        //         result: {},
        //         api: 'pharmacy/itemmaster/GetPharmacyStoreItemsForNonZero',
        //         formatdisplay: formatselectedpharmacyitem,
        //         presearch: presearchpharmacyitem,
        //         postsearch: postsearchpharmacyitem
        //     };
        // } else if ($scope.zerostocksales == 0 || !$scope.zerostocksales) {
        //     vm.pharmacyitemcontrolconfig = {
        //         query: '',
        //         searchbyid: false,
        //         options: [{
        //             header: 'Item Code',
        //             field: 'ItemCode',
        //             datatype: 'string',
        //             headercls: 'td-code',
        //             fieldcls: 'td-code'
        //         },
        //         {
        //             header: 'Item Name',
        //             field: 'ItemName',
        //             datatype: 'string',
        //             headercls: 'td-name',
        //             fieldcls: 'td-name'
        //         },
        //         /*
        //         {
        //             header: 'Product Type Name',
        //             field: 'ProductTypeName',
        //             datatype: 'string',
        //             headercls: 'td-producttypename',
        //             fieldcls: 'td-producttypename'
        //         },
        //         */
        //         {
        //             header: 'Generic Name',
        //             field: 'GenericName',
        //             datatype: 'string',
        //             headercls: 'td-genericname',
        //             fieldcls: 'td-genericname'
        //         },
        //         /*
        //         {
        //             header: 'Manufacturer Name',
        //             field: 'ManufacturerName',
        //             datatype: 'string',
        //             headercls: 'td-manufacturername',
        //             fieldcls: 'td-manufacturername'
        //         },
        //         */
        //         // {
        //         //     header: 'Claim',
        //         //     field: 'Claimable',
        //         //     datatype: 'string',
        //         //     headercls: 'td-claimable',
        //         //     fieldcls: 'td-claimable'
        //         // },
        //         // {
        //         //     header: 'Rack Name',
        //         //     field: 'RackName',
        //         //     datatype: 'string',
        //         //     headercls: 'td-rackname',
        //         //     fieldcls: 'td-rackname'
        //         // },
        //         {
        //             header: 'Stock-In-Hand',
        //             field: 'StockInHand',
        //             datatype: 'string',
        //             headercls: 'td-stockinhand',
        //             fieldcls: 'td-stockinhand'
        //         },
        //         {
        //             header: 'Sales Price',
        //             field: 'MrPrice',
        //             datatype: 'string',
        //             headercls: 'td-mrprice',
        //             fieldcls: 'td-mrprice'
        //         }
        //         ],
        //         searchparams: {},
        //         result: {},
        //         api: 'pharmacy/itemmaster/GetPharmacyStoreItems',
        //         formatdisplay: formatselectedpharmacyitem,
        //         presearch: presearchpharmacyitem,
        //         postsearch: postsearchpharmacyitem
        //     };
        // }

        // function formatselectedpharmacyitem() {
        //     $scope.autosearchpopup = 0;
        //     var selectedItem = vm.pharmacyitemcontrolconfig.selected;
        //     var result = '';
        //     if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //         result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join(' ');
        //     } else if (vm.pharmacyitemcontrolconfig.rowdata) {
        //         result = [vm.pharmacyitemcontrolconfig.rowdata.ItemName, vm.pharmacyitemcontrolconfig.rowdata.ItemCode].join(' ');
        //     }
        //     return result;
        // }

        // function presearchpharmacyitem() {
        //     var query = vm.pharmacyitemcontrolconfig.query;
        //     var TodayDate = new Date().toISOString().slice(0, 10);
        //     var inputData = {
        //         Params: [{
        //             Key: 1,
        //             Value: $scope.item.StoreMasterId
        //         },
        //         //{ Key: 8, Value: $scope.item.StoreTypeId },
        //         {
        //             Key: 12,
        //             Value: TodayDate
        //         },
        //         {
        //             Key: 13,
        //             Value: 1
        //         },
        //         {
        //             Key: 15,
        //             Value: 1
        //         },
        //         {
        //             Key: 22,
        //             Value: false
        //         }
        //             //{ Key: 18, Value: $scope.item.GuarantorId }
        //         ],
        //         PageContext: {
        //             PageSize: 25,
        //             PageNumber: 1
        //         }
        //     };

        //     if (vm.pharmacyitemcontrolconfig.searchbyid === true) {
        //         inputData.Params.push({
        //             Key: 0,
        //             Value: query
        //         });
        //     } else if (query && query.length > 2 && $scope.item.IsGenericSearch == false) {
        //         inputData.Params.push({
        //             Key: 3,
        //             Value: query
        //         });
        //     } else if (query && query.length > 2 && $scope.item.IsGenericSearch == true) {
        //         inputData.Params.push({
        //             Key: 21,
        //             Value: query
        //         });
        //     }

        //     vm.pharmacyitemcontrolconfig.searchparams = inputData;
        // }

        // function postsearchpharmacyitem() {
        //     $scope.autosearchpopup = 1;
        //     for (var idx in vm.pharmacyitemcontrolconfig.result) {
        //         var item = vm.pharmacyitemcontrolconfig.result[idx];
        //         var SerialItems = null;
        //         var SerialQuantity = 0;
        //         item.ItemCode = item.ItemCode;
        //         item.ItemName = item.ItemName;
        //         /*
        //         if (item.ItemMaster.ProductType !== null) {
        //             item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
        //         } else {
        //             item.ProductTypeName = '';
        //         }
        //         */
        //         if (item.ItemMaster) {
        //             item.GenericName = item.ItemMaster.GenericName;
        //         } else {
        //             item.GenericName = '';
        //         }
        //         /*
        //         if (item.ItemMaster.GenericMaster !== null) {
        //             item.GenericName = item.ItemMaster.GenericMaster.GenericName;
        //         } else {
        //             item.GenericName = '';
        //         }
        //         */
        //         /*
        //         item.ManufacturerName = item.ManufacturerName;
        //         */
        //         /*
        //         if (item.ItemMaster.Manufacturer !== null) {
        //             item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
        //         } else {
        //             item.ManufacturerName = '';
        //         }
        //         */
        //         item.RackName = item.RackName;
        //         if (item.ItemMaster.StockItem !== null) {
        //             if (item.ItemMaster.StockItem &&
        //                 item.ItemMaster.StockItem.StockSerialItems.length > 0) {
        //                 SerialItems = item.ItemMaster.StockItem.StockSerialItems;
        //                 for (var batid = 0; batid < SerialItems.length; batid++) {
        //                     SerialQuantity = SerialQuantity + SerialItems[batid].Quantity;
        //                 }
        //             }
        //             item.StockInHand = SerialQuantity;
        //         } else {
        //             item.StockInHand = 0;
        //         }
        //         item.MrPrice = item.ItemMaster.MrPrice;
        //     }
        // }

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

                ],
                searchparams: {},
                result: {},
                api: 'pharmacy/itemmaster/GetPharmacyStoreItemsForNonZero',
                formatdisplay: formatselectedpharmacyitem,
                presearch: presearchpharmacyitem,
                postsearch: postsearchpharmacyitem
            };
        } else if ($scope.zerostocksales == 0 || !$scope.zerostocksales) {
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
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join(' ');
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
                    Value: $scope.item.StoreMasterId
                },
                {
                    Key: 16,
                    Value: utl.Session.getCurrentFacilityId()
                },
                //{ Key: 8, Value: $scope.item.StoreTypeId },
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
                    //{ Key: 18, Value: $scope.item.GuarantorId }
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
                item.ItemCode = item.ItemCode;
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
                            $scope.item.StoreTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreTypeId;
                            $scope.item.CanAllowIPDiscount = $scope.lookup.UserStores[usidx].StoreMaster.CanAllowIPDiscount;
                            $scope.item.ExpiryWarningDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryWarningDays;
                            $scope.item.ExpiryPriorStopDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryPriorStopDays;
                        }
                    }
                    if ($scope.item.StoreMasterId === 0) {
                        $scope.item.StoreMasterId = value[0].Id;
                        $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                        $scope.item.CanAllowIPDiscount = value[0].StoreMaster.CanAllowIPDiscount;
                        $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                        $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                    }
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
            $scope.getStorePrintPreference();
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
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));

                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'billing/patientbills/PrintDMIPPharmacyBills',
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
            $scope.printIPPharmacySales(dmPrintInput);
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
                vPFirstName = data.PatientBills.PatientName;
            }

            if (data.PatientBills.StoreMaster) vTinNo = data.PatientBills.StoreMaster.TinNo;

            if (data.PatientBills.GuarantorMaster.GuarantorName) vGuarantorName = '' + data.PatientBills.GuarantorMaster.GuarantorName;

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
            var TotalGSTAmount = data.PatientBills.GSTAmount;
            var TotalBillAmount = data.PatientBills.BillAmount;
            var TotalCGSTAmount = data.PatientBills.CGstAmount;
            var TotalSGSTAmount = data.PatientBills.SGstAmount;
            GrossAmount = TotalBillAmount - TotalGSTAmount;
            var TotalNoOfItems = data.PatientBills.PatientBillDetails.length;
            var TotalQuantity = 0;
            var GSTlistitem = 0;
            var TotalGstPercent = 0;
            var TotalGstPercent = 0;
            var TotalCGstPercent = 0;
            var TotalSGstPercent = 0;
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
                    Tota0perGstPercent = billDetail.GSTPercentage;
                    Tota0perCGSTAmount = Total0perCGSTAmount + billDetail.CGstAmount;
                    Tota0perSGSTAmount = Total0perSGSTAmount + billDetail.SGstAmount
                }
                TotalCGstPercent = TotalCGstPercent + billDetail.CGstPercentage;
                TotalSGstPercent = TotalSGstPercent + billDetail.SGstPercentage;
            }
            for (var idx in data.PatientBills.PatientBillDetails) {
                var billDetail = data.PatientBills.PatientBillDetails[idx];
                TotalQuantity = TotalQuantity + billDetail.Quantity;
            }
            var BillType = vEncounterType + ' CASH BILL';
            if (data.PatientBills.IsPharmacyBill == true &&
                data.PatientBills.IsPaidFully == false) {
                BillType = vEncounterType + ' CREDIT BILL';
            }
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
                prescribedby: (vUTitle + ' ' +
                    vUFirstName + ' ' + vULastName) || '',
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
                billdate: utl.Formatter.getDateTimeString(data.PatientBills.BillDateTime),
                totalamount: data.PatientBills.BillAmount,
                totDiscont: data.PatientBills.BillDiscount,
                totroundoff: data.PatientBills.RoundOffValue,
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
                GuarantorName: vGuarantorName,
                DepartmentName: DepartmentName
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

                var DetailDiscountPercentage = billDetail.DiscountPercentage.toFixed(0);

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
                    qty: billDetail.Quantity,
                    mrp: billDetail.Rate.toFixed(2),
                    value: billDetail.NetAmountBeforeGST.toFixed(2),
                    cgstper: billDetail.CGstPercentage,
                    cgstamt: cgstamt,
                    sgstper: billDetail.SGstPercentage,
                    sgstamt: sgstamt,
                    gstper: billDetail.GSTPercentage,
                    totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
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
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    } else {
                        //$('#' + nextId).focus();
                        $scope.startinterval = $interval(function () {
                            $('#' + nextId).focus();
                            $interval.cancel($scope.startinterval);
                        }, 100);
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
                $scope.deletePatientBillDetails(index, item);
                $scope.startinterval = $interval(function () {
                    var idx = $scope.PatientBillDetails.length - 1;
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
                    billnumber = '--------';

                var billamt = res.BillAmount;
                if (billamt) billamt = billamt.toFixed(2);
                $scope.LastTransactionDatetime = 'Last Bill Number : ' + billnumber + ' Bill Amt : ';
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

            if ($scope.dmprintpreferences)
                if ($scope.dmprintpreferences <= 0)
                    $('#btndmprint').hide();


            if ($scope.printpreferences)
                if ($scope.printpreferences <= 0)
                    $('#btnprint').hide();
        };

        $scope.getPharmacyPrintPreference();


        /* IP - Pharmacy  Sales - Shortcut Keys - Start */
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
        /* IP Pharmacy Sales - Shortcut Keys - End */
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
    }

    ippharmacysalesController.$inject = ['$rootScope', '$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig', '$timeout'];

})();