(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('materialIssueFormController', materialIssueFormController);


    function materialIssueFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.context = 'main';

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            PatientStockRequestId: 0,
            PatientRequestNumber: null,
            DispenseNumber: null,
            DispenseDateTime: utl.Formatter.getCurrentDate(),
            DispensedBy: 0,
            DispenseTypeId: 2,
            DispensePriorityId: 1,
            DispensedValue: 0,
            DispensedCounterId: 0,
            TotalGrossAmount: 0,
            DiscountModeId: 2,
            DiscountValue: 0,
            DiscountAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            TotalNetAmountBeforeGst: 0,
            TotalNetAmount: 0,
            ApprovedBy: 0,
            ApprovedDateTime: utl.Formatter.getCurrentDate(),
            DispenseStatusId: 0,
            OrganizationId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: 0,
            StoreMasterId: 0,
            StoreTypeId: 0,
            PatientId: 0,
            PatientMRN: null,
            TitleId: 0,
            PatientName: null,
            PatientTypeId: 0,
            GenderId: 0,
            Age: 0,
            OTIdentifier: null,
            EncounterId: 0,
            EncounterTypeId: 0,
            OTRegisterId: 0,
            LocationId: 0,
            WardId: 0,
            RoomId: 0,
            BedId: 0,
            OTRoomId: 0,
            GuarantorId: 0,
            GuarantorTypeId: 0,
            GuarantorName: null,
            DoctorId: 0,
            DoctorName: null,
            ReferralId: 0,
            ReferralName: null,
            RemarkId: 0,
            Comments: null,
            DisplayDispenseStatus: null,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            IsDisabled: false
        };

        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        $scope.currentcontext = {
            id: -1,
            PatientDispenseId: -1,
            StoreId: -1,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $stateParams.pid;
        $scope.item.EncounterId = $stateParams.eid;
        $scope.item.OTRoomId = $stateParams.otroomid;
        $scope.item.OTRegisterId = parseInt($stateParams.otregisterid);
        $scope.item.OTIdentifier = $stateParams.otidentifier;

        $scope.currentcontext.PatientDispenseId = $stateParams.patientdispenseid;
        $scope.currentcontext.StoreId = $stateParams.storeid;

        $scope.DrugServiceCategoryId = 0;
        $scope.DrugServiceGroupId = 0;
        $scope.NonDrugServiceCategoryId = 0;
        $scope.NonDrugServiceGroupId = 0;

        $scope.autosearchpopup = 0;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.lookup = {};

        //$scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        //$scope.currentcontext.CanAttachment = utl.Privilege.hasPrivilege('CanAttachment');
        //$scope.currentcontext.CanDispense = utl.Privilege.hasPrivilege('CanDispense');
        //$scope.currentcontext.CanHistory = utl.Privilege.hasPrivilege('CanHistory');
        //$scope.currentcontext.CanDMPrint = utl.Privilege.hasPrivilege('CanDMPrint');

        $scope.patientdispenseDetails = [];
        $scope.deletedpatientdispenseDetails = [];

        $scope.PMRInfo = [];
        $scope.PMRItems = [];

        $scope.canShowPrintBtn = false;
        $scope.canShowDispenseBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowHistoryBtn = true;

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
            $scope.item.Patient = $scope.selectedPatient;
            $scope.item.Patient = $scope.selectedPatient.Title.Description;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

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

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            $scope.encounter = [];
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.GuarantorTypeId = $scope.encounter.GuarantorTypeId;
                $scope.item.GuarantorId = $scope.encounter.GuarantorId;
                $scope.item.GuarantorName = $scope.encounter.Guarantor.GuarantorName;
                $scope.item.PatientMRN = $scope.encounter.PatientMrn;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                $scope.item.DoctorName = $scope.encounter.DoctorName;
                $scope.item.PatientId = $scope.encounter.PatientId;
                $scope.$parent.SelectedItem.PatientId = $scope.encounter.PatientId;
                $scope.item.LocationId = $scope.encounter.LocationId;
                $scope.item.WardId = $scope.encounter.WardId;
                $scope.item.RoomId = $scope.encounter.RoomId;
                $scope.item.BedId = $scope.encounter.BedId;
                $scope.item.TitleId = $scope.encounter.Patient.TitleId;
                $scope.item.GenderId = $scope.encounter.Patient.GenderId;
                $scope.item.Age = $scope.encounter.Patient.Age;

                var strTitle = $scope.encounter.Patient.Title ? $scope.encounter.Patient.Title.Description : '';
                $scope.item.PatientName = [strTitle, $scope.encounter.Patient.FirstName, $scope.encounter.Patient.LastName].join(' ');

                if ($scope.encounter.WardMaster) {
                    $scope.item.ToStoreId = $scope.encounter.WardMaster.StoreMasterId;
                }

                $scope.item.IsEncounter = true;
            } else {
                utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
            }
        };

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.DispenseStatusId != 1 || $scope.item.DispenseStatusId != 2 || $scope.item.DispenseStatusId != 3 || $scope.item.DispenseStatusId != 4 || $scope.item.DispenseStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowDispenseBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Pending Status
            if ($scope.item.DispenseStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Dispensed Status
            if ($scope.item.DispenseStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Accepted Status
            if ($scope.item.TransferStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Rejected Status
            if ($scope.item.TransferStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.TransferStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patient-ot-attachments', {
                params: {
                    pid: 0,
                    otregisterid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.patientdispenseDetails) {
                if ($scope.patientdispenseDetails[idx].Status == 1) {
                    if ($scope.patientdispenseDetails[idx].Status == 1) {
                        $scope.patientdispenseDetails[idx].SNo = SNo;
                        $scope.patientdispenseDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                        $scope.patientdispenseDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                        SNo++;
                    }
                }
            }
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.patientdispenseDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.patientdispenseDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }

            var patientdispenseDetail = {
                Id: 0,
                PatientStockRequestDetailId: 0,
                SNo: 0,
                itemidxdesc: null,
                itemidxqty: null,
                DispenseDateTime: utl.Formatter.getCurrentDate(),
                ServiceId: -1,
                ItemMasterId: -1,
                ItemCode: null,
                ItemName: null,
                CategoryId: 0,
                SubCategoryId: 0,
                ProductTypeId: 0,
                SubProductTypeId: 0,
                GenericId: 0,
                GenericName: null,
                ManufacturerId: 0,
                ManufacturerName: null,
                ScheduleTypeId: 0,
                ScheduleTypeDescription: null,
                BaseUomId: 0,
                PurchaseUomId: 0,
                SaleUomId: 0,
                MinQty: 0,
                MaxQty: 0,
                RequestedQuantity: 0,
                QuantityBeforeDispense: 0,
                DispensedQuantity: 0,
                StockItemId: 0,
                StockSerialItemId: 0,
                StoreMasterId: 0,
                DepartmentId: 0,
                FacilityId: utl.Session.getCurrentFacilityId(),
                OrganizationId: 1,
                Batch: false,
                BatchId: null,
                ExpiryDate: null,
                Ucp: 0,
                Mrp: 0,
                Amount: 0,
                GrossAmount: 0,
                GrossGstAmount: 0,
                DiscountModeId: 0,
                DiscountValue: 0,
                DiscountAmount: 0,
                DoctorDiscountAmount: 0,
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstId: 0,
                InGstPercentage: 0,
                UnitInGstAmount: 0,
                InGstAmount: 0,
                CGstId: 0,
                CGstPercentage: 0,
                UnitCGstAmount: 0,
                CGstAmount: 0,
                SGstId: 0,
                SGstPercentage: 0,
                UnitSGstAmount: 0,
                SGstAmount: 0,
                NetAmountBeforeGst: 0,
                NetAmount: 0,
                DoctorId: 0,
                DoctorName: null,
                IsGstDoctor: 0,
                Comments: null,
                Status: 1,
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    StoreMasterId: 0,
                    BarCodeId: 0,
                    ItemMasterId: 0,
                    ItemCode: null,
                    ItemName: null,
                    BatchId: null,
                    ExpiryDate: null,
                    Quantity: 0,
                    UomPrice: 0,
                    PurchasePrice: 0,
                    DiscountModeId: 0,
                    Discount: 0,
                    UomDiscountAmount: 0,
                    DiscountAmount: 0,
                    UomPriceAfterDiscount: 0,
                    PurchasePriceAfterDiscount: 0,
                    Ucp: 0,
                    Mrp: 0,
                    GstId: 0,
                    GstPercentage: 0,
                    UnitGstAmount: 0,
                    GstAmount: 0,
                    InGstId: 0,
                    InGstPercentage: 0,
                    UnitInGstAmount: 0,
                    InGstAmount: 0,
                    CGstId: 0,
                    CGstPercentage: 0,
                    UnitCGstAmount: 0,
                    CGstAmount: 0,
                    SGstId: 0,
                    SGstPercentage: 0,
                    UnitSGstAmount: 0,
                    SGstAmount: 0,
                    PurchaseUomId: 0,
                    BaseUomId: 0,
                    SaleUomId: 0,
                    ConversionQuantity: 0,
                    IsExpiry: 0,
                    IsSuspended: 0,
                    ManufacturerId: 0,
                    VendorMasterId: 0,
                    GrnDetailId: 0,
                    GrnId: 0,
                    StockEntryDetailId: 0,
                    StockEntryId: 0,
                    FacilityId: 0,
                    Rev: 0,
                    SerialDetails: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false
                },
                StockSerialItemRev: 0,
                StockItemRev: 0,
                BarCodeId: 0,
                Quantity: 0,
                UomPrice: 0,
                PurchasePrice: 0,
                Discount: 0,
                UomDiscountAmount: 0,
                UomPriceAfterDiscount: 0,
                PurchasePriceAfterDiscount: 0,
                ConversionQuantity: 0,
                IsExpiry: 0,
                IsSuspended: 0,
                ManufacturerId: 0,
                VendorMasterId: 0,
                GrnDetailId: 0,
                GrnId: 0,
                StockEntryDetailId: 0,
                StockEntryId: 0,
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                IsFallUnderMinQty: false,
                TotalAvailableQuantity: 0,
                SubCategoryId: 0,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: '',
                MasterItemId: 0,
                DrugName: '',
                DrugId: 0,
                MasterTypeId: 0,
                IsPMRItem: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                patientdispenseDetail.PatientDispenseId = $scope.currentcontext.id;
            }
            $scope.patientdispenseDetails.push(patientdispenseDetail);
            $scope.SelectedIndex = $scope.patientdispenseDetails.length;
            $scope.setIndexforTableIndex();
        };

        $scope.Clear = function () {
            $scope.patientdispenseDetails = [];
            savehitcompleted = 0;
            $scope.autosearchpopup = 0;
            $scope.addNewLineItem();
            $scope.setCmbFocus('');
            $timeout(function () {
                var uiSelect = angular.element(document.getElementById('storemasterid'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }, 100);
        };

        /*
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'Billing/PatientDispense/PrintPatientDispense',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.item.PatientId = $stateParams.pid;
        $scope.item.EncounterId = $stateParams.eid;
        $scope.item.OTRoomId = $stateParams.otroomid;
        $scope.item.OTRegisterId = parseInt($stateParams.id);
        $scope.item.OTIdentifier = $stateParams.otidentifier;
        */

        $scope.batchDetails = function (idx, item) {
            utl.Modal.open('app.pharmacybatch-details', {
                params: {
                    current_index: idx,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    current_item: item,
                    grid_items: $scope.patientdispenseDetails
                },
                confirmCallback: $scope.onBatchChange
            });
        };

        $scope.onBatchChange = function (UpdatedItemData) {
            var ExpiryDays = null;
            var item = [];
            item = UpdatedItemData.UpdatedItem;

            for (var count = 0; count < $scope.patientdispenseDetails.length; count++) {
                var cllitem = $scope.patientdispenseDetails[count];
                if (cllitem.ItemMasterId == UpdatedItemData.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.deletedpatientdispenseDetails.push(cllitem);
                    var index1 = $scope.patientdispenseDetails.indexOf(cllitem);
                    $scope.patientdispenseDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.patientdispenseDetails) {
                var clsitem = $scope.patientdispenseDetails[clsidx];
                if (clsitem.ServiceId == -1) {
                    clsitem.Status = 2;
                    $scope.deletedpatientdispenseDetails.push(clsitem);
                    var index2 = $scope.patientdispenseDetails.indexOf(clsitem);
                    $scope.patientdispenseDetails.splice(index2, 1);
                }
            }

            for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                var patientdispenseDetail = {
                    Id: 0,
                    ItemMasterId: item.ItemMasterId,
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    CategoryId: item.CategoryId,
                    SubCategoryId: item.SubCategoryId,
                    ProductTypeId: item.ProductTypeId,
                    SubProductTypeId: item.SubProductTypeId,
                    itemidxdesc: null,
                    ScheduleTypeId: item.ScheduleTypeId,
                    ScheduleTypeDescription: item.ScheduleTypeDescription,
                    StockSerialItemId: item.BatchDetails[batid].Id,
                    StockSerialItemRev: item.BatchDetails[batid].Rev,
                    StockItemId: item.BatchDetails[batid].StockItemId,
                    StockItemRev: item.StockItemRev,
                    DispensedQuantity: item.BatchDetails[batid].IssueQty,
                    itemidxqty: null,
                    MinQty: item.MinQty,
                    MaxQty: item.MaxQty,
                    TotalAvailableQuantity: item.TotalAvailableQuantity,
                    QuantityBeforeDispense: item.BatchDetails[batid].Quantity,
                    BarCodeId: item.BatchDetails[batid].BarCodeId,
                    Batch: true,
                    BatchId: item.BatchDetails[batid].BatchId,
                    ExpiryDate: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false,
                    UomPrice: item.BatchDetails[batid].UomPrice,
                    PurchasePrice: item.BatchDetails[batid].PurchasePrice,
                    DiscountModeId: item.BatchDetails[batid].DiscountModeId,
                    Discount: 0,
                    UomDiscountAmount: 0,
                    UnitDiscountAmount: 0,
                    DiscountAmount: 0,
                    UomPriceAfterDiscount: 0,
                    PurchasePriceAfterDiscount: 0,
                    Ucp: item.BatchDetails[batid].Ucp,
                    Mrp: item.BatchDetails[batid].Mrp,
                    UnitCostPrice: item.BatchDetails[batid].Ucp,
                    MrPrice: item.BatchDetails[batid].Mrp,
                    GSTId: item.BatchDetails[batid].GstId,
                    GstId: item.BatchDetails[batid].GstId,
                    InGstId: item.BatchDetails[batid].InGstId,
                    CGstId: item.BatchDetails[batid].CGstId,
                    SGstId: item.BatchDetails[batid].SGstId,
                    GSTPercentage: item.BatchDetails[batid].GstPercentage,
                    GstPercentage: item.BatchDetails[batid].GstPercentage,
                    InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                    CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                    SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                    UnitGstAmount: item.BatchDetails[batid].UnitGstAmount,
                    UnitInGstAmount: item.BatchDetails[batid].UnitInGstAmount,
                    UnitCGstAmount: item.BatchDetails[batid].UnitCGstAmount,
                    UnitSGstAmount: item.BatchDetails[batid].UnitSGstAmount,
                    GstAmount: 0.00,
                    InGstAmount: 0.00,
                    CGstAmount: 0.00,
                    SGstAmount: 0.00,
                    PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                    BaseUomId: item.BatchDetails[batid].BaseUomId,
                    SaleUomId: item.BatchDetails[batid].SaleUomId,
                    ConversionQuantity: item.BatchDetails[batid].ConversionQuantity,
                    IsExpiry: item.BatchDetails[batid].IsExpiry,
                    IsSuspended: item.BatchDetails[batid].IsSuspended,
                    VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                    GrnId: item.BatchDetails[batid].GrnId,
                    GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                    StockEntryId: item.BatchDetails[batid].StockEntryId,
                    StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                    OrganizationId: 1,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    GrossAmount: 0.00,
                    NetAmount: 0.00,
                    ServiceId: item.ItemMasterId,
                    ServiceCode: item.ItemCode,
                    ServiceName: item.ItemName,
                    EncounterId: $scope.item.EncounterId,
                    PatientBillStatusId: 3,
                    Quantity: item.BatchDetails[batid].IssueQty,
                    Rate: item.BatchDetails[batid].Mrp,
                    DoctorId: $scope.item.DoctorId,
                    DoctorName: $scope.item.DoctorName,
                    IsPharmacyCredit: 1,
                    IsPharmacySale: 1,
                    PharmacySaleTypeId: 2,
                    DiscountModeId: 2,
                    GenericId: item.GenericId,
                    GenericName: item.GenericName,
                    ManufacturerId: item.ManufacturerId,
                    ManufacturerName: item.ManufacturerName,
                    StoreMasterId: $scope.item.StoreMasterId,
                    DepartmentId: $scope.item.DepartmentId,
                    OTRegisterId: $scope.item.OTRegisterId,
                    ProcedureId: $scope.item.ProcedureId,
                    Status: 1
                };

                ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                    patientdispenseDetail.ExpiryStop = true;
                } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                    patientdispenseDetail.ExpiryAlert = true;
                } else {
                    patientdispenseDetail.ExpiryProceed = true;
                }

                if (patientdispenseDetail.ExpiryAlert) {
                    patientdispenseDetail.ExpiryDate = null;
                    patientdispenseDetail.ExpiryAlert = true;
                    patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                } else if (patientdispenseDetail.ExpiryStop) {
                    patientdispenseDetail.ExpiryDate = null;
                    patientdispenseDetail.ExpiryStop = true;
                    patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                } else {
                    patientdispenseDetail.ExpiryDate = null;
                    patientdispenseDetail.ExpiryProceed = true;
                    patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                }

                if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQty) {
                    patientdispenseDetail.IsFallUnderMinQty = true;
                } else {
                    patientdispenseDetail.IsFallUnderMinQty = false;
                }

                patientdispenseDetail.Rate = patientdispenseDetail.MrPrice;
                patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.Mrp * 100) / (100 + patientdispenseDetail.GSTPercentage)).toFixed(2));
                patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GSTPercentage).toFixed(2));
                patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGSTAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GSTAmount).toFixed(2));
                patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                patientdispenseDetail.BatchDetails = item.AllBatchDetails;
                $scope.patientdispenseDetails.push(patientdispenseDetail);
                savehitcompleted = 0;
            }

            calculatetotalAmount();
            $scope.addNewLineItem();

            var nxtidx = $scope.patientdispenseDetails.length - 1;
            var nextId = "desc" + '' + nxtidx;
            $timeout(function () {
                $('#' + nextId).focus();
            }, 100);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.OTRegisterId,
                Data: {
                    isprint: false
                }
            };
            var options = {
                action: 'billing/patientbills/PrintOTBillingPharmacyBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.ot-dispense-history', {});
        };

        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.patientdispensehistory', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName,
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
            }
        };

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.patientdispensedetails', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
            }
        };

        $scope.getOtregisterCallback = function (scope, data, options, hasError) {
            //$scope.item = data;
            $scope.$parent.SelectedItem.OtDate = data.OTStartedate;
            $scope.$parent.SelectedItem.ChiefSurgeon = data.DoctorName;
            if (data.OTRegisterStatusId == 1) {
                $scope.SelectedItem.OTRegisterStatusId = "Draft";
            }
            if (data.OTRegisterStatusId == 2) {
                $scope.SelectedItem.OTRegisterStatusId = "Completed";
            }
            if (data.OTRegisterStatusId == 3) {
                $scope.SelectedItem.OTRegisterStatusId = "Cancelled";
            }
            if (data.OTRegisterStatusId == 4) {
                $scope.SelectedItem.OTRegisterStatusId = "Approved";
            }
        };

        $scope.getOtregisterById = function () {
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntryById',
                data: {
                    Id: $scope.item.OTRegisterId
                },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.ItemMasterId != -1) {
                item.Status = 2;
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
                return false;
            }

            $scope.DispensedValue = 0;
            $scope.TotalGrossAmount = 0;
            $scope.DiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;

            $scope.item.DispensedValue = 0;
            $scope.item.TotalGrossAmount = 0;
            $scope.item.DiscountAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmountBeforeGst = 0;
            $scope.item.TotalNetAmount = 0;

            $scope.setIndexforTableIndex();

            calculatetotalAmount();
        };

        $scope.deletePatientDispenseDetail = function (item, idx) {
            var lastIndex = 0;
            var index = 0;
            if (item.ItemMasterId != -1) {
                lastIndex = $scope.patientdispenseDetails.length - 1;
                index = $scope.patientdispenseDetails.indexOf(item);
                item.Status = 2;
                $scope.patientdispenseDetails.push(item);
                $scope.patientdispenseDetails.splice(index, 1);
                if (lastIndex < 0 || lastIndex == idx) {
                    $scope.addNewLineItem();
                }
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
                return false;
            }

            $scope.DispensedValue = 0;
            $scope.TotalGrossAmount = 0;
            $scope.DiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;

            $scope.item.DispensedValue = 0;
            $scope.item.TotalGrossAmount = 0;
            $scope.item.DiscountAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmountBeforeGst = 0;
            $scope.item.TotalNetAmount = 0;

            $scope.setIndexforTableIndex();

            calculatetotalAmount();
        };

        $scope.getPatientDispenseInfoById = function () {
            var SearchDispenseId = $scope.currentcontext.PatientDispenseId;
            var SearchStoreId = $scope.currentcontext.StoreId;
            if (SearchDispenseId && SearchDispenseId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchDispenseId
                    },
                    {
                        Key: 6,
                        Value: SearchStoreId
                    }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Billing/PatientDispense/GetPatientDispenses',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDispenseInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getDispenseInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientDispenseInfo = res.Data || [];
            if ($scope.PatientDispenseInfo && $scope.PatientDispenseInfo.length > 0) {
                $scope.PatientDispenseInfo.forEach(patientdispense => {
                    if (patientdispense.Patient) {
                        $scope.$parent.SelectedItem = patientdispense.Patient || [];
                        $scope.selectedPatient = patientdispense.Patient || [];
                    }
                    $scope.item.DispenseStatusId = patientdispense.DispenseStatusId;
                    if (patientdispense.DispenseStatusId == 1) {
                        $scope.item.IsDisabled = false;
                        $scope.item.DisplayDispenseStatus = 'Draft';
                    } else if (patientdispense.DispenseStatusId == 2) {
                        $scope.item.IsDisabled = true;
                        $scope.item.DisplayDispenseStatus = 'Dispensed';
                    } else if (patientdispense.DispenseStatusId == 3) {
                        $scope.item.IsDisabled = true;
                        $scope.item.DisplayDispenseStatus = 'Cancelled';
                    }

                    $scope.item.PatientStockRequestId = patientdispense.PatientStockRequestId;
                    $scope.item.PatientRequestNumber = patientdispense.PatientRequestNumber;
                    $scope.item.DispenseNumber = patientdispense.DispenseNumber;
                    $scope.item.DispenseDateTime = patientdispense.DispenseDateTime;
                    $scope.item.DispensedBy = patientdispense.DispensedBy;
                    $scope.item.DispenseTypeId = patientdispense.DispenseTypeId;
                    $scope.item.DispensePriorityId = patientdispense.DispensePriorityId;
                    $scope.item.ApprovedDateTime = patientdispense.ApprovedDateTime;
                    $scope.item.ApprovedBy = patientdispense.ApprovedBy;

                    $scope.item.OrganizationId = patientdispense.OrganizationId;
                    $scope.item.FacilityId = patientdispense.FacilityId;
                    $scope.item.DepartmentId = patientdispense.DepartmentId;
                    $scope.item.StoreMasterId = patientdispense.StoreMasterId;
                    $scope.item.PatientId = patientdispense.PatientId;
                    $scope.$parent.SelectedItem.PatientId = patientdispense.PatientId;
                    $scope.$parent.SelectedItem.OTIdentifier = patientdispense.OTIdentifier;
                    $scope.item.PatientMRN = patientdispense.PatientMRN;
                    $scope.item.PatientName = patientdispense.PatientName;
                    $scope.item.PatientTypeId = patientdispense.PatientTypeId;
                    $scope.item.OTIdentifier = patientdispense.OTIdentifier;
                    $scope.item.EncounterId = patientdispense.EncounterId;
                    $scope.item.EncounterTypeId = patientdispense.EncounterTypeId;
                    $scope.item.OTRegisterId = patientdispense.OTRegisterId;
                    $scope.item.LocationId = patientdispense.LocationId;

                    if (patientdispense.OtRegister) {
                        $scope.$parent.SelectedItem.OtDate = patientdispense.OtRegister.OTStartedate;
                        $scope.$parent.SelectedItem.ChiefSurgeon = patientdispense.OtRegister.DoctorName;
                        $scope.$parent.SelectedItem.OTRegisterStatusId = patientdispense.OtRegister.OTRegisterStatusId;
                        if (patientdispense.OtRegister.OTRegisterStatusId == 1) {
                            $scope.$parent.SelectedItem.OTRegisterStatusId = "Draft";
                        } else if (patientdispense.OtRegister.OTRegisterStatusId == 2) {
                            $scope.$parent.SelectedItem.OTRegisterStatusId = "Completed";
                        } else if (patientdispense.OtRegister.OTRegisterStatusId == 3) {
                            $scope.$parent.SelectedItem.OTRegisterStatusId = "Cancelled";
                        } else if (patientdispense.OtRegister.OTRegisterStatusId == 4) {
                            $scope.$parent.SelectedItem.OTRegisterStatusId = "Approved";
                        }
                    }

                    $scope.item.WardId = patientdispense.WardId;
                    $scope.item.WardName = '';
                    if (patientdispense.WardMaster) {
                        $scope.item.WardName = patientdispense.WardMaster.WardName;
                    }
                    $scope.item.RoomId = patientdispense.RoomId;
                    $scope.item.RoomName = '';
                    if (patientdispense.WardRoomMaster) {
                        $scope.item.RoomName = patientdispense.WardRoomMaster.RoomNo;
                    }
                    $scope.item.WardRoom = $scope.item.WardName + ' / ' + $scope.item.RoomName;
                    $scope.item.BedId = patientdispense.BedId;
                    $scope.item.OTRoomId = patientdispense.OTRoomId;
                    $scope.item.GuarantorId = patientdispense.GuarantorId;
                    $scope.item.GuarantorTypeId = patientdispense.GuarantorTypeId;
                    $scope.item.GuarantorName = patientdispense.GuarantorName;
                    $scope.item.DoctorId = patientdispense.DoctorId;
                    $scope.item.DoctorName = patientdispense.DoctorName;
                    $scope.item.ReferralId = patientdispense.ReferralId;
                    $scope.item.ReferralName = patientdispense.ReferralName;
                    $scope.item.RemarkId = patientdispense.RemarkId;
                    $scope.item.Comments = patientdispense.Comments;

                    $scope.item.DispensedValue = patientdispense.DispensedValue;
                    $scope.item.TotalGrossAmount = patientdispense.TotalGrossAmount;
                    $scope.item.DiscountModeId = patientdispense.DiscountModeId;
                    $scope.item.DiscountValue = patientdispense.DiscountValue;
                    $scope.item.DiscountAmount = patientdispense.DiscountAmount;
                    $scope.item.TotalGstAmount = patientdispense.TotalGstAmount;
                    $scope.item.TotalInGstAmount = patientdispense.TotalInGstAmount;
                    $scope.item.TotalCGstAmount = patientdispense.TotalCGstAmount;
                    $scope.item.TotalSGstAmount = patientdispense.TotalSGstAmount;
                    $scope.item.TotalNetAmountBeforeGst = patientdispense.TotalNetAmountBeforeGst;
                    $scope.item.TotalNetAmount = patientdispense.TotalNetAmount;

                    $scope.patientdispenseDetails = patientdispense.PatientDispenseDetails || [];
                    for (var idx in $scope.patientdispenseDetails) {
                        var dispenseitem = $scope.patientdispenseDetails[idx];
                        if (dispenseitem.ItemMasterId > 0) {
                            if (dispenseitem.StockItem) {
                                dispenseitem.TotalAvailableQuantity = dispenseitem.StockItem.Quantity;
                            } else {
                                if (dispenseitem.ItemMaster) {
                                    if (dispenseitem.ItemMaster.StockItem !== null) {
                                        dispenseitem.TotalAvailableQuantity = dispenseitem.ItemMaster.StockItem.Quantity;
                                    } else {
                                        dispenseitem.TotalAvailableQuantity = 0;
                                    }
                                } else {
                                    dispenseitem.TotalAvailableQuantity = 0;
                                }
                            }

                            if (dispenseitem.StockSerialItem) {
                                dispenseitem.QuantityBeforeDispense = dispenseitem.StockSerialItem.Quantity;
                            } else {
                                dispenseitem.QuantityBeforeDispense = 0;
                            }

                            dispenseitem.UnitCostPrice = dispenseitem.Ucp;
                            dispenseitem.MrPrice = dispenseitem.Mrp;
                            dispenseitem.ExpiryProceed = true;
                        }
                    }

                    $scope.setIndexforTableIndex();
                    $scope.applyVisibilityRules();
                });
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getPatientDispenseInfoById();
        };

        $scope.backToList = function () {
            $state.go('surgeryentry.materialissues', {
                id: $scope.item.OTRegisterId,
                eid: $scope.item.EncounterId,
                pid: $scope.item.PatientId
            });
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.othistory', {});
        };

        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.otrequesthistory', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName,
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.stockrequestdetails', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.patientdispense-form.dispensemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onsaveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onsaveConfirmed = function () {
            $scope.item.DispenseStatusId = 1;
            // $scope.item.DispensedBy = utl.Session.getCurrentUserId();
            // $scope.item.DispenseDateTime = utl.Formatter.getCurrentDate();
            // $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            // $scope.item.ApprovedDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.Dispense = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.patientdispense-form.dispensemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onDispenseConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onDispenseConfirmed = function () {
            $scope.item.DispenseStatusId = 2;
            $scope.item.DispensedBy = utl.Session.getCurrentUserId();
            $scope.item.DispenseDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.AdmissionStatusId === 5) {
                utl.Alert.showErrorMsg('Patient Financially Discharged! Contact Billing Section.');
                return false;
            } else if ($scope.item.AdmissionStatusId === 6) {
                utl.Alert.showErrorMsg('Patient Physically Discharged Already!.');
                return false;
            } else {
                if ($scope.item.IsBillLock) {
                    utl.Alert.showErrorMsg('Patient Services are Under Locked! Contact Billing Section.');
                    return false;
                }
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'billing/patientdispense/AddPatientDispense';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientdispense/UpdatePatientDispense';
                }

                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: lines
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

        function checkMandatoryFields() {
            var AnyOne = 0;
            for (var iddx in $scope.patientdispenseDetails) {
                var iddxitem = $scope.patientdispenseDetails[iddx];
                if (iddxitem.ItemMasterId > 0 && parseInt(iddxitem.DispensedQuantity) <= 0) {
                    utl.Alert.showErrorMsg('Please Enter Qty for ' + iddxitem.ItemName);
                    return false;
                } else if (iddxitem.ItemMasterId > 0 && iddxitem.Status == 1) {
                    AnyOne = 1;
                }
            }

            if (AnyOne == 0) {
                utl.Alert.showErrorMsg('Please Enter Any one Entry');
                return false;
            }

            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.patientdispenseDetails) {
                var item = $scope.patientdispenseDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1 && item.DispensedQuantity > 0) {
                    if (item.SubCategoryId == 1) {
                        item.ServiceGroupId = $scope.DrugServiceGroupId;
                        item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    } else if (item.SubCategoryId == 2) {
                        item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                        item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                    }

                    result.push(item);
                }
            }
            return result;
        }

        $scope.loadSelectedPMR = function () {
            var TodayDate = new Date().toISOString().slice(0, 10);
            if ($scope.item.PMRId && $scope.item.PMRId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.item.PMRId
                    },
                    {
                        Key: 6,
                        Value: $scope.item.StoreMasterId
                    },
                    {
                        Key: 7,
                        Value: TodayDate
                    }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'pharmacy/PMR/GetPMRItems',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getSelectedPMRInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.CleanGrid = function () {
            for (var clsidx in $scope.patientdispenseDetails) {
                var clsitem = $scope.patientdispenseDetails[clsidx];
                if (clsitem.ItemMasterId == -1) {
                    clsitem.Status = 2;
                    $scope.deletedpatientdispenseDetails.push(clsitem);
                    var index2 = $scope.patientdispenseDetails.indexOf(clsitem);
                    $scope.patientdispenseDetails.splice(index2, 1);
                }
            }
        };

        $scope.getSelectedPMRInfoCallback = function (scope, res, options, hasError) {
            $scope.PMRInfo = res.Data || [];
            if ($scope.PMRInfo && $scope.PMRInfo.length > 0) {
                $scope.CleanGrid();
                $scope.PMRInfo.forEach(pmr => {
                    $scope.PMRItems = pmr.PMRDetails || [];
                    for (var pmridx in $scope.PMRItems) {
                        var pmritem = $scope.PMRItems[pmridx];
                        if (pmritem.ItemMasterId > 0) {
                            if (pmritem.ItemMaster) {
                                if (pmritem.ItemMaster.StockItem) {
                                    var patientdispenseDetail = {};
                                    var ExpiryDays = null;
                                    var SerialItems = [];
                                    if (pmritem.ItemMaster.StockItem.StockSerialItems) {
                                        SerialItems = pmritem.ItemMaster.StockItem.StockSerialItems;
                                        for (var batid = 0; batid < SerialItems.length; batid++) {
                                            if (pmritem.Quantity > 0) {
                                                if (SerialItems[batid].Quantity >= pmritem.Quantity) {
                                                    patientdispenseDetail = {
                                                        Id: 0,
                                                        ItemMasterId: pmritem.ItemMasterId,
                                                        ItemCode: pmritem.ItemCode,
                                                        ItemName: pmritem.ItemName,
                                                        CategoryId: pmritem.CategoryId,
                                                        SubCategoryId: pmritem.SubCategoryId,
                                                        ProductTypeId: pmritem.ProductTypeId,
                                                        SubProductTypeId: pmritem.SubProductTypeId,
                                                        itemidxdesc: null,
                                                        ScheduleTypeId: pmritem.ItemMaster.ScheduleTypeId,
                                                        ScheduleTypeDescription: '',
                                                        StockSerialItemId: SerialItems[batid].Id,
                                                        StockSerialItemRev: SerialItems[batid].Rev,
                                                        StockItemId: SerialItems[batid].StockItemId,
                                                        StockItemRev: pmritem.ItemMaster.StockItem.Rev,
                                                        DispensedQuantity: pmritem.Quantity,
                                                        itemidxqty: null,
                                                        MinQty: pmritem.ItemMaster.MinQty,
                                                        MaxQty: pmritem.ItemMaster.MaxQty,
                                                        TotalAvailableQuantity: pmritem.ItemMaster.StockItem.Quantity,
                                                        QuantityBeforeDispense: SerialItems[batid].Quantity,
                                                        BarCodeId: SerialItems[batid].BarCodeId,
                                                        BatchId: SerialItems[batid].BatchId,
                                                        Batch: true,
                                                        ExpiryDate: null,
                                                        ExpiryAlert: false,
                                                        ExpiryStop: false,
                                                        ExpiryProceed: false,
                                                        UomPrice: SerialItems[batid].UomPrice,
                                                        PurchasePrice: SerialItems[batid].PurchasePrice,
                                                        DiscountModeId: SerialItems[batid].DiscountModeId,
                                                        Discount: 0,
                                                        UomDiscountAmount: 0,
                                                        UnitDiscountAmount: 0,
                                                        DiscountAmount: 0,
                                                        UomPriceAfterDiscount: 0,
                                                        PurchasePriceAfterDiscount: 0,
                                                        Ucp: SerialItems[batid].Ucp,
                                                        Mrp: SerialItems[batid].Mrp,
                                                        UnitCostPrice: SerialItems[batid].Ucp,
                                                        MrPrice: SerialItems[batid].Mrp,
                                                        GSTId: SerialItems[batid].GstId,
                                                        GstId: SerialItems[batid].GstId,
                                                        InGstId: SerialItems[batid].InGstId,
                                                        CGstId: SerialItems[batid].CGstId,
                                                        SGstId: SerialItems[batid].SGstId,
                                                        GSTPercentage: SerialItems[batid].GstPercentage,
                                                        GstPercentage: SerialItems[batid].GstPercentage,
                                                        InGstPercentage: SerialItems[batid].InGstPercentage,
                                                        CGstPercentage: SerialItems[batid].CGstPercentage,
                                                        SGstPercentage: SerialItems[batid].SGstPercentage,
                                                        UnitGstAmount: SerialItems[batid].UnitGstAmount,
                                                        UnitInGstAmount: SerialItems[batid].UnitInGstAmount,
                                                        UnitCGstAmount: SerialItems[batid].UnitCGstAmount,
                                                        UnitSGstAmount: SerialItems[batid].UnitSGstAmount,
                                                        GstAmount: 0.00,
                                                        InGstAmount: 0.00,
                                                        CGstAmount: 0.00,
                                                        SGstAmount: 0.00,
                                                        PurchaseUomId: SerialItems[batid].PurchaseUomId,
                                                        BaseUomId: SerialItems[batid].BaseUomId,
                                                        SaleUomId: SerialItems[batid].SaleUomId,
                                                        ConversionQuantity: SerialItems[batid].ConversionQuantity,
                                                        IsExpiry: SerialItems[batid].IsExpiry,
                                                        IsSuspended: SerialItems[batid].IsSuspended,
                                                        VendorMasterId: SerialItems[batid].VendorMasterId,
                                                        GrnId: SerialItems[batid].GrnId,
                                                        GrnDetailId: SerialItems[batid].GrnDetailId,
                                                        StockEntryId: SerialItems[batid].StockEntryId,
                                                        StockEntryDetailId: SerialItems[batid].StockEntryDetailId,
                                                        OrganizationId: 1,
                                                        FacilityId: utl.Session.getCurrentFacilityId(),
                                                        GrossAmount: 0.00,
                                                        NetAmount: 0.00,
                                                        ServiceId: pmritem.ItemMasterId,
                                                        ServiceCode: pmritem.ItemCode,
                                                        ServiceName: pmritem.ItemName,
                                                        EncounterId: $scope.item.EncounterId,
                                                        PatientBillStatusId: 3,
                                                        Quantity: pmritem.Quantity,
                                                        Rate: SerialItems[batid].Mrp,
                                                        DoctorId: $scope.item.DoctorId,
                                                        DoctorName: $scope.item.DoctorName,
                                                        IsPharmacyCredit: 1,
                                                        IsPharmacySale: 1,
                                                        PharmacySaleTypeId: 2,
                                                        DiscountModeId: 2,
                                                        GenericId: pmritem.ItemMaster.GenericId,
                                                        GenericName: pmritem.ItemMaster.GenericName,
                                                        ManufacturerId: pmritem.ItemMaster.ManufacturerId,
                                                        ManufacturerName: pmritem.ItemMaster.ManufacturerName,
                                                        StoreMasterId: $scope.item.StoreMasterId,
                                                        DepartmentId: $scope.item.DepartmentId,
                                                        OTRegisterId: $scope.item.OTRegisterId,
                                                        ProcedureId: $scope.item.ProcedureId,
                                                        IsPMRItem: true,
                                                        Status: 1
                                                    };

                                                    ExpiryDays = GetExpiryDays(SerialItems[batid].ExpiryDate);
                                                    if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                                        patientdispenseDetail.ExpiryStop = true;
                                                    } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                    } else {
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                    }

                                                    if (patientdispenseDetail.ExpiryAlert) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                        patientdispenseDetail.ExpiryDate = SerialItems[batid].ExpiryDate;
                                                    } else if (patientdispenseDetail.ExpiryStop) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryStop = true;
                                                        patientdispenseDetail.ExpiryDate = SerialItems[batid].ExpiryDate;
                                                    } else {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                        patientdispenseDetail.ExpiryDate = SerialItems[batid].ExpiryDate;
                                                    }

                                                    if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQty) {
                                                        patientdispenseDetail.IsFallUnderMinQty = true;
                                                    } else {
                                                        patientdispenseDetail.IsFallUnderMinQty = false;
                                                    }

                                                    if (pmritem.ItemMaster.SubCategoryId == 1) {
                                                        patientdispenseDetail.SubCategoryId = 1;
                                                        patientdispenseDetail.ServiceTypeId = 0;
                                                        patientdispenseDetail.ServiceGroupId = $scope.DrugServiceGroupId;
                                                        patientdispenseDetail.ServiceCategoryId = $scope.DrugServiceCategoryId;
                                                        patientdispenseDetail.MasterName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.MasterItemId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.DrugName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.DrugId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.MasterTypeId = pmritem.ItemMaster.SubCategoryId;
                                                    } else if (pmritem.ItemMaster.SubCategoryId == 2) {
                                                        patientdispenseDetail.SubCategoryId = 2;
                                                        patientdispenseDetail.ServiceTypeId = 0;
                                                        patientdispenseDetail.ServiceGroupId = $scope.NonDrugServiceGroupId;
                                                        patientdispenseDetail.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                                                        patientdispenseDetail.MasterName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.MasterItemId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.DrugName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.DrugId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.MasterTypeId = pmritem.ItemMaster.SubCategoryId;
                                                    } else {
                                                        patientdispenseDetail.SubCategoryId = 0;
                                                        patientdispenseDetail.ServiceTypeId = 0;
                                                        patientdispenseDetail.ServiceGroupId = 0;
                                                        patientdispenseDetail.ServiceCategoryId = 0;
                                                        patientdispenseDetail.MasterName = '';
                                                        patientdispenseDetail.MasterItemId = 0;
                                                        patientdispenseDetail.DrugName = 0;
                                                        patientdispenseDetail.DrugId = 0;
                                                        patientdispenseDetail.MasterTypeId = 0;
                                                    }

                                                    patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                                                    patientdispenseDetail.Amount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.GrossAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                                                    patientdispenseDetail.GSTAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.GstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.InGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitInGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.CGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitCGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.SGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitSGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.NetAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                                                    patientdispenseDetail.BatchDetails = SerialItems;
                                                    $scope.patientdispenseDetails.push(patientdispenseDetail);
                                                    pmritem.Quantity = 0;
                                                } else if (SerialItems[batid].Quantity < pmritem.Quantity) {
                                                    patientdispenseDetail = {
                                                        Id: 0,
                                                        ItemMasterId: pmritem.ItemMasterId,
                                                        ItemCode: pmritem.ItemCode,
                                                        ItemName: pmritem.ItemName,
                                                        CategoryId: pmritem.CategoryId,
                                                        SubCategoryId: pmritem.SubCategoryId,
                                                        ProductTypeId: pmritem.ProductTypeId,
                                                        SubProductTypeId: pmritem.SubProductTypeId,
                                                        itemidxdesc: null,
                                                        ScheduleTypeId: pmritem.ItemMaster.ScheduleTypeId,
                                                        ScheduleTypeDescription: '',
                                                        StockSerialItemId: SerialItems[batid].Id,
                                                        StockSerialItemRev: SerialItems[batid].Rev,
                                                        StockItemId: SerialItems[batid].StockItemId,
                                                        StockItemRev: pmritem.ItemMaster.StockItem.Rev,
                                                        DispensedQuantity: SerialItems[batid].Quantity,
                                                        itemidxqty: null,
                                                        MinQty: pmritem.ItemMaster.MinQty,
                                                        MaxQty: pmritem.ItemMaster.MaxQty,
                                                        TotalAvailableQuantity: pmritem.ItemMaster.StockItem.Quantity,
                                                        QuantityBeforeDispense: SerialItems[batid].Quantity,
                                                        BarCodeId: SerialItems[batid].BarCodeId,
                                                        BatchId: SerialItems[batid].BatchId,
                                                        Batch: true,
                                                        ExpiryDate: null,
                                                        ExpiryAlert: false,
                                                        ExpiryStop: false,
                                                        ExpiryProceed: false,
                                                        UomPrice: SerialItems[batid].UomPrice,
                                                        PurchasePrice: SerialItems[batid].PurchasePrice,
                                                        DiscountModeId: SerialItems[batid].DiscountModeId,
                                                        Discount: 0,
                                                        UomDiscountAmount: 0,
                                                        UnitDiscountAmount: 0,
                                                        DiscountAmount: 0,
                                                        UomPriceAfterDiscount: 0,
                                                        PurchasePriceAfterDiscount: 0,
                                                        Ucp: SerialItems[batid].Ucp,
                                                        Mrp: SerialItems[batid].Mrp,
                                                        UnitCostPrice: SerialItems[batid].Ucp,
                                                        MrPrice: SerialItems[batid].Mrp,
                                                        GSTId: SerialItems[batid].GstId,
                                                        GstId: SerialItems[batid].GstId,
                                                        InGstId: SerialItems[batid].InGstId,
                                                        CGstId: SerialItems[batid].CGstId,
                                                        SGstId: SerialItems[batid].SGstId,
                                                        GSTPercentage: SerialItems[batid].GstPercentage,
                                                        GstPercentage: SerialItems[batid].GstPercentage,
                                                        InGstPercentage: SerialItems[batid].InGstPercentage,
                                                        CGstPercentage: SerialItems[batid].CGstPercentage,
                                                        SGstPercentage: SerialItems[batid].SGstPercentage,
                                                        UnitGstAmount: SerialItems[batid].UnitGstAmount,
                                                        UnitInGstAmount: SerialItems[batid].UnitInGstAmount,
                                                        UnitCGstAmount: SerialItems[batid].UnitCGstAmount,
                                                        UnitSGstAmount: SerialItems[batid].UnitSGstAmount,
                                                        GstAmount: 0.00,
                                                        InGstAmount: 0.00,
                                                        CGstAmount: 0.00,
                                                        SGstAmount: 0.00,
                                                        PurchaseUomId: SerialItems[batid].PurchaseUomId,
                                                        BaseUomId: SerialItems[batid].BaseUomId,
                                                        SaleUomId: SerialItems[batid].SaleUomId,
                                                        ConversionQuantity: SerialItems[batid].ConversionQuantity,
                                                        IsExpiry: SerialItems[batid].IsExpiry,
                                                        IsSuspended: SerialItems[batid].IsSuspended,
                                                        VendorMasterId: SerialItems[batid].VendorMasterId,
                                                        GrnId: SerialItems[batid].GrnId,
                                                        GrnDetailId: SerialItems[batid].GrnDetailId,
                                                        StockEntryId: SerialItems[batid].StockEntryId,
                                                        StockEntryDetailId: SerialItems[batid].StockEntryDetailId,
                                                        OrganizationId: 1,
                                                        FacilityId: utl.Session.getCurrentFacilityId(),
                                                        GrossAmount: 0.00,
                                                        NetAmount: 0.00,
                                                        ServiceId: pmritem.ItemMasterId,
                                                        ServiceCode: pmritem.ItemCode,
                                                        ServiceName: pmritem.ItemName,
                                                        EncounterId: $scope.item.EncounterId,
                                                        PatientBillStatusId: 3,
                                                        Quantity: SerialItems[batid].Quantity,
                                                        Rate: SerialItems[batid].Mrp,
                                                        DoctorId: $scope.item.DoctorId,
                                                        DoctorName: $scope.item.DoctorName,
                                                        IsPharmacyCredit: 1,
                                                        IsPharmacySale: 1,
                                                        PharmacySaleTypeId: 2,
                                                        DiscountModeId: 2,
                                                        GenericId: pmritem.ItemMaster.GenericId,
                                                        GenericName: pmritem.ItemMaster.GenericName,
                                                        ManufacturerId: pmritem.ItemMaster.ManufacturerId,
                                                        ManufacturerName: pmritem.ItemMaster.ManufacturerName,
                                                        StoreMasterId: $scope.item.StoreMasterId,
                                                        DepartmentId: $scope.item.DepartmentId,
                                                        OTRegisterId: $scope.item.OTRegisterId,
                                                        ProcedureId: $scope.item.ProcedureId,
                                                        IsPMRItem: true,
                                                        Status: 1
                                                    };

                                                    ExpiryDays = GetExpiryDays(SerialItems[batid].ExpiryDate);
                                                    if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                                        patientdispenseDetail.ExpiryStop = true;
                                                    } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                    } else {
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                    }

                                                    if (patientdispenseDetail.ExpiryAlert) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                        patientdispenseDetail.ExpiryDate = SerialItems[batid].ExpiryDate;
                                                    } else if (patientdispenseDetail.ExpiryStop) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryStop = true;
                                                        patientdispenseDetail.ExpiryDate = SerialItems[batid].ExpiryDate;
                                                    } else {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                        patientdispenseDetail.ExpiryDate = SerialItems[batid].ExpiryDate;
                                                    }

                                                    if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQty) {
                                                        patientdispenseDetail.IsFallUnderMinQty = true;
                                                    } else {
                                                        patientdispenseDetail.IsFallUnderMinQty = false;
                                                    }

                                                    if (pmritem.ItemMaster.SubCategoryId == 1) {
                                                        patientdispenseDetail.SubCategoryId = 1;
                                                        patientdispenseDetail.ServiceTypeId = 0;
                                                        patientdispenseDetail.ServiceGroupId = $scope.DrugServiceGroupId;
                                                        patientdispenseDetail.ServiceCategoryId = $scope.DrugServiceCategoryId;
                                                        patientdispenseDetail.MasterName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.MasterItemId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.DrugName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.DrugId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.MasterTypeId = pmritem.ItemMaster.SubCategoryId;
                                                    } else if (pmritem.ItemMaster.SubCategoryId == 2) {
                                                        patientdispenseDetail.SubCategoryId = 2;
                                                        patientdispenseDetail.ServiceTypeId = 0;
                                                        patientdispenseDetail.ServiceGroupId = $scope.NonDrugServiceGroupId;
                                                        patientdispenseDetail.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                                                        patientdispenseDetail.MasterName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.MasterItemId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.DrugName = pmritem.ItemMaster.DrugName;
                                                        patientdispenseDetail.DrugId = pmritem.ItemMaster.DrugId;
                                                        patientdispenseDetail.MasterTypeId = pmritem.ItemMaster.SubCategoryId;
                                                    } else {
                                                        patientdispenseDetail.SubCategoryId = 0;
                                                        patientdispenseDetail.ServiceTypeId = 0;
                                                        patientdispenseDetail.ServiceGroupId = 0;
                                                        patientdispenseDetail.ServiceCategoryId = 0;
                                                        patientdispenseDetail.MasterName = '';
                                                        patientdispenseDetail.MasterItemId = 0;
                                                        patientdispenseDetail.DrugName = 0;
                                                        patientdispenseDetail.DrugId = 0;
                                                        patientdispenseDetail.MasterTypeId = 0;
                                                    }

                                                    patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                                                    patientdispenseDetail.Amount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.GrossAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                                                    patientdispenseDetail.GSTAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.GstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.InGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitInGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.CGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitCGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.SGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitSGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.NetAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                                                    patientdispenseDetail.BatchDetails = SerialItems;
                                                    $scope.patientdispenseDetails.push(patientdispenseDetail);
                                                    pmritem.Quantity = pmritem.Quantity - SerialItems[batid].Quantity;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                $scope.DispensedValue = 0;
                $scope.TotalGrossAmount = 0;
                $scope.DiscountAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalInGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmountBeforeGst = 0;
                $scope.TotalNetAmount = 0;

                calculatetotalAmount();

                $scope.addNewLineItem();
            }
        };

        $scope.onItemSelected = function (idx, selectedItem) {
            var SelectedMasterItem = null;
            var stockserialitems = null;
            var serialitem = [];
            var batid = 0;
            if (selectedItem.SelectedItem.MyStoreQty <= 0) {
                utl.Alert.showErrorMsg('Stock Not Available');
                selectedItem.StockSerialItemId = 0;
                selectedItem.StockItemId = 0;
                selectedItem.BarCodeId = 0;
                selectedItem.BatchId = null;
                selectedItem.ExpiryDate = null;
                selectedItem.Quantity = 0;
                selectedItem.UomPrice = 0;
                selectedItem.PurchasePrice = 0;
                selectedItem.DiscountModeId = 0;
                selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.DiscountAmount = 0;
                selectedItem.UnitDiscountAmount = 0;
                selectedItem.UomPriceAfterDiscount = 0;
                selectedItem.PurchasePriceAfterDiscount = 0;
                selectedItem.Ucp = 0;
                selectedItem.Mrp = 0;
                selectedItem.GstId = 0;
                selectedItem.GstPercentage = 0;
                selectedItem.GstAmount = 0;
                selectedItem.UnitGstAmount = 0;
                selectedItem.InGstId = 0;
                selectedItem.InGstPercentage = 0;
                selectedItem.InGstAmount = 0;
                selectedItem.UnitInGstAmount = 0;
                selectedItem.CGstId = 0;
                selectedItem.CGstPercentage = 0;
                selectedItem.CGstAmount = 0;
                selectedItem.UnitCGstAmount = 0;
                selectedItem.SGstId = 0;
                selectedItem.SGstPercentage = 0;
                selectedItem.SGstAmount = 0;
                selectedItem.UnitSGstAmount = 0;
                selectedItem.PurchaseUomId = 0;
                selectedItem.BaseUomId = 0;
                selectedItem.SaleUomId = 0;
                selectedItem.ConversionQuantity = 0;
                selectedItem.IsExpiry = 0;
                selectedItem.IsSuspended = 0;
                selectedItem.ManufacturerId = 0;
                selectedItem.VendorMasterId = 0;
                selectedItem.GrnDetailId = 0;
                selectedItem.GrnId = 0;
                selectedItem.StockEntryDetailId = 0;
                selectedItem.StockEntryId = 0;
                selectedItem.FacilityId = utl.Session.getCurrentFacilityId();
                selectedItem.StockSerialItemRev = 0;

                selectedItem.QuantityBeforeDispense = 0;
                selectedItem.TotalAvailableQuantity = 0;
                selectedItem.UnitCostPrice = 0;
                selectedItem.MrPrice = 0;

                selectedItem.BatchDetails = [];
            } else {
                SelectedMasterItem = selectedItem.SelectedItem;
                selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                selectedItem.ItemName = SelectedMasterItem.ItemName;
                selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
                selectedItem.ManufacturerId = SelectedMasterItem.ItemMaster.ManufacturerId;
                selectedItem.ManufacturerName = SelectedMasterItem.ItemMaster.ManufacturerName;
                selectedItem.ScheduleTypeId = SelectedMasterItem.ItemMaster.ScheduleTypeId;
                if (SelectedMasterItem.ItemMaster.ScheduleType) {
                    selectedItem.ScheduleTypeDescription = SelectedMasterItem.ItemMaster.ScheduleType.Description;
                }
                selectedItem.CategoryId = SelectedMasterItem.ItemMaster.CategoryId;
                selectedItem.SubCategoryId = SelectedMasterItem.ItemMaster.SubCategoryId;
                selectedItem.ProductTypeId = SelectedMasterItem.ItemMaster.ProductTypeId;
                selectedItem.SubProductTypeId = SelectedMasterItem.ItemMaster.SubProductTypeId;
                selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;

                selectedItem.BatchDetails = [];
                selectedItem.BatchDetail = {};

                selectedItem.StockSerialItemId = 0;
                selectedItem.StockItemId = 0;
                selectedItem.BarCodeId = 0;
                selectedItem.BatchId = null;
                selectedItem.ExpiryDate = null;
                selectedItem.Quantity = 0;
                selectedItem.UomPrice = 0;
                selectedItem.PurchasePrice = 0;
                selectedItem.DiscountModeId = 0;
                selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.DiscountAmount = 0;
                selectedItem.UnitDiscountAmount = 0;
                selectedItem.UomPriceAfterDiscount = 0;
                selectedItem.PurchasePriceAfterDiscount = 0;
                selectedItem.Ucp = 0;
                selectedItem.Mrp = 0;
                selectedItem.GstId = 0;
                selectedItem.GstPercentage = 0;
                selectedItem.GstAmount = 0;
                selectedItem.UnitGstAmount = 0;
                selectedItem.InGstId = 0;
                selectedItem.InGstPercentage = 0;
                selectedItem.InGstAmount = 0;
                selectedItem.UnitInGstAmount = 0;
                selectedItem.CGstId = 0;
                selectedItem.CGstPercentage = 0;
                selectedItem.CGstAmount = 0;
                selectedItem.UnitCGstAmount = 0;
                selectedItem.SGstId = 0;
                selectedItem.SGstPercentage = 0;
                selectedItem.SGstAmount = 0;
                selectedItem.UnitSGstAmount = 0;
                selectedItem.PurchaseUomId = 0;
                selectedItem.BaseUomId = 0;
                selectedItem.SaleUomId = 0;
                selectedItem.ConversionQuantity = 0;
                selectedItem.IsExpiry = 0;
                selectedItem.IsSuspended = 0;
                selectedItem.ManufacturerId = 0;
                selectedItem.VendorMasterId = 0;
                selectedItem.GrnDetailId = 0;
                selectedItem.GrnId = 0;
                selectedItem.StockEntryDetailId = 0;
                selectedItem.StockEntryId = 0;
                selectedItem.FacilityId = utl.Session.getCurrentFacilityId();
                selectedItem.StockSerialItemRev = 0;

                selectedItem.QuantityBeforeDispense = 0;
                selectedItem.TotalAvailableQuantity = 0;
                selectedItem.UnitCostPrice = 0;
                selectedItem.MrPrice = 0;
                selectedItem.Amount = 0.00;
                selectedItem.GrossAmount = 0.00;
                selectedItem.NetAmount = 0.00;

                if (SelectedMasterItem.ItemMaster.StockItem &&
                    SelectedMasterItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                    var SumOfSerialQuantity = 0;
                    stockserialitems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
                    for (batid = 0; batid < stockserialitems.length; batid++) {
                        serialitem = stockserialitems[batid];
                        if (serialitem.Quantity > 0) {
                            SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity;
                            selectedItem.BatchDetails.push(serialitem);
                        }
                    }

                    selectedItem.TotalAvailableQuantity = SumOfSerialQuantity;
                    selectedItem.MinQty = SelectedMasterItem.MinQty;
                    selectedItem.MaxQty = SelectedMasterItem.MaxQty;
                    if (selectedItem.TotalAvailableQuantity <= selectedItem.MinQty) {
                        selectedItem.IsFallUnderMinQty = true;
                    }
                    selectedItem.StockItemRev = SelectedMasterItem.ItemMaster.StockItem.Rev;
                }
            }
        };

        $scope.CleanItemBatches = function (item) {
            for (var count = 0; count < $scope.patientdispenseDetails.length; count++) {
                var cllitem = $scope.patientdispenseDetails[count];
                if (cllitem.ItemMasterId == item.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.deletedpatientdispenseDetails.push(cllitem);
                    var index1 = $scope.patientdispenseDetails.indexOf(cllitem);
                    $scope.patientdispenseDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.patientdispenseDetails) {
                var clsitem = $scope.patientdispenseDetails[clsidx];
                if (clsitem.ItemMasterId == -1) {
                    clsitem.Status = 2;
                    $scope.deletedpatientdispenseDetails.push(clsitem);
                    var index2 = $scope.patientdispenseDetails.indexOf(clsitem);
                    $scope.patientdispenseDetails.splice(index2, 1);
                }
            }
        };

        $scope.ChooseBatches = function (idx, item) {
            var currentitem = item;
            var patientdispenseDetail = {};
            var ExpiryDays = null;
            if (item.DispensedQuantity > item.TotalAvailableQuantity) {
                utl.Alert.showErrorMsg('Quantity should not exceed than Total Avail Qty');
                item.DispensedQuantity = 0;
            } else if (item.DispensedQuantity === null || item.DispensedQuantity === 0) {
                //utl.Alert.showErrorMsg('Quantity should be Greater Than Zero');
                //item.DispensedQuantity = 0;
            } else {
                $scope.CleanItemBatches(item);
                for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                    if (item.DispensedQuantity > 0) {
                        if (item.BatchDetails[batid].Quantity >= item.DispensedQuantity) {
                            patientdispenseDetail = {
                                Id: 0,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                CategoryId: item.CategoryId,
                                SubCategoryId: item.SubCategoryId,
                                ProductTypeId: item.ProductTypeId,
                                SubProductTypeId: item.SubProductTypeId,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                StockItemRev: item.StockItemRev,
                                DispensedQuantity: item.DispensedQuantity,
                                itemidxqty: null,
                                MinQty: item.MinQty,
                                MaxQty: item.MaxQty,
                                TotalAvailableQuantity: item.TotalAvailableQuantity,
                                QuantityBeforeDispense: item.BatchDetails[batid].Quantity,
                                BarCodeId: item.BatchDetails[batid].BarCodeId,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                UomPrice: item.BatchDetails[batid].UomPrice,
                                PurchasePrice: item.BatchDetails[batid].PurchasePrice,
                                DiscountModeId: item.BatchDetails[batid].DiscountModeId,
                                Discount: 0,
                                UomDiscountAmount: 0,
                                UnitDiscountAmount: 0,
                                DiscountAmount: 0,
                                UomPriceAfterDiscount: 0,
                                PurchasePriceAfterDiscount: 0,
                                Ucp: item.BatchDetails[batid].Ucp,
                                Mrp: item.BatchDetails[batid].Mrp,
                                UnitCostPrice: item.BatchDetails[batid].Ucp,
                                MrPrice: item.BatchDetails[batid].Mrp,
                                GSTId: item.BatchDetails[batid].GstId,
                                GstId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GSTPercentage: item.BatchDetails[batid].GstPercentage,
                                GstPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                UnitGstAmount: item.BatchDetails[batid].UnitGstAmount,
                                UnitInGstAmount: item.BatchDetails[batid].UnitInGstAmount,
                                UnitCGstAmount: item.BatchDetails[batid].UnitCGstAmount,
                                UnitSGstAmount: item.BatchDetails[batid].UnitSGstAmount,
                                GstAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                ConversionQuantity: item.BatchDetails[batid].ConversionQuantity,
                                IsExpiry: item.BatchDetails[batid].IsExpiry,
                                IsSuspended: item.BatchDetails[batid].IsSuspended,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                OrganizationId: 1,
                                FacilityId: utl.Session.getCurrentFacilityId(),
                                GrossAmount: 0.00,
                                NetAmount: 0.00,
                                ServiceId: item.ItemMasterId,
                                ServiceCode: item.ItemCode,
                                ServiceName: item.ItemName,
                                EncounterId: $scope.item.EncounterId,
                                PatientBillStatusId: 3,
                                Quantity: item.DispensedQuantity,
                                Rate: item.BatchDetails[batid].Mrp,
                                DoctorId: $scope.item.DoctorId,
                                DoctorName: $scope.item.DoctorName,
                                IsPharmacyCredit: 1,
                                IsPharmacySale: 1,
                                PharmacySaleTypeId: 2,
                                DiscountModeId: 2,
                                GenericId: item.GenericId,
                                GenericName: item.GenericName,
                                ManufacturerId: item.ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                StoreMasterId: $scope.item.StoreMasterId,
                                DepartmentId: $scope.item.DepartmentId,
                                OTRegisterId: $scope.item.OTRegisterId,
                                ProcedureId: $scope.item.ProcedureId,
                                Status: 1
                            };

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                patientdispenseDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                patientdispenseDetail.ExpiryAlert = true;
                            } else {
                                patientdispenseDetail.ExpiryProceed = true;
                            }

                            if (patientdispenseDetail.ExpiryAlert) {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryAlert = true;
                                patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (patientdispenseDetail.ExpiryStop) {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryStop = true;
                                patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryProceed = true;
                                patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQty) {
                                patientdispenseDetail.IsFallUnderMinQty = true;
                            } else {
                                patientdispenseDetail.IsFallUnderMinQty = false;
                            }

                            if (item.SubCategoryId == 1) {
                                patientdispenseDetail.SubCategoryId = 1;
                                patientdispenseDetail.ServiceTypeId = 0;
                                patientdispenseDetail.ServiceGroupId = $scope.DrugServiceGroupId;
                                patientdispenseDetail.ServiceCategoryId = $scope.DrugServiceCategoryId;
                                patientdispenseDetail.MasterName = item.DrugName;
                                patientdispenseDetail.MasterItemId = item.DrugId;
                                patientdispenseDetail.DrugName = item.DrugName;
                                patientdispenseDetail.DrugId = item.DrugId;
                                patientdispenseDetail.MasterTypeId = item.SubCategoryId;
                            } else if (item.SubCategoryId == 2) {
                                patientdispenseDetail.SubCategoryId = 2;
                                patientdispenseDetail.ServiceTypeId = 0;
                                patientdispenseDetail.ServiceGroupId = $scope.NonDrugServiceGroupId;
                                patientdispenseDetail.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                                patientdispenseDetail.MasterName = item.DrugName;
                                patientdispenseDetail.MasterItemId = item.DrugId;
                                patientdispenseDetail.DrugName = item.DrugName;
                                patientdispenseDetail.DrugId = item.DrugId;
                                patientdispenseDetail.MasterTypeId = item.SubCategoryId;
                            } else {
                                patientdispenseDetail.SubCategoryId = 0;
                                patientdispenseDetail.ServiceTypeId = 0;
                                patientdispenseDetail.ServiceGroupId = 0;
                                patientdispenseDetail.ServiceCategoryId = 0;
                                patientdispenseDetail.MasterName = '';
                                patientdispenseDetail.MasterItemId = 0;
                                patientdispenseDetail.DrugName = 0;
                                patientdispenseDetail.DrugId = 0;
                                patientdispenseDetail.MasterTypeId = 0;
                            }

                            patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                            patientdispenseDetail.Amount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.GrossAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                            patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                            patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                            patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                            patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                            patientdispenseDetail.GSTAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.GstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.InGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitInGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.CGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitCGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.SGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitSGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.NetAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                            patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                            patientdispenseDetail.BatchDetails = item.BatchDetails;
                            $scope.patientdispenseDetails.push(patientdispenseDetail);
                            item.DispensedQuantity = 0;
                            savehitcompleted = 0;
                        } else if (item.BatchDetails[batid].Quantity < item.DispensedQuantity) {
                            patientdispenseDetail = {
                                Id: 0,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                CategoryId: item.CategoryId,
                                SubCategoryId: item.SubCategoryId,
                                ProductTypeId: item.ProductTypeId,
                                SubProductTypeId: item.SubProductTypeId,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                StockItemRev: item.StockItemRev,
                                DispensedQuantity: item.BatchDetails[batid].Quantity,
                                itemidxqty: null,
                                MinQty: item.MinQty,
                                MaxQty: item.MaxQty,
                                TotalAvailableQuantity: item.TotalAvailableQuantity,
                                QuantityBeforeDispense: item.BatchDetails[batid].Quantity,
                                BarCodeId: item.BatchDetails[batid].BarCodeId,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                UomPrice: item.BatchDetails[batid].UomPrice,
                                PurchasePrice: item.BatchDetails[batid].PurchasePrice,
                                DiscountModeId: item.BatchDetails[batid].DiscountModeId,
                                Discount: 0,
                                UomDiscountAmount: 0,
                                UnitDiscountAmount: 0,
                                DiscountAmount: 0,
                                UomPriceAfterDiscount: 0,
                                PurchasePriceAfterDiscount: 0,
                                Ucp: item.BatchDetails[batid].Ucp,
                                Mrp: item.BatchDetails[batid].Mrp,
                                UnitCostPrice: item.BatchDetails[batid].Ucp,
                                MrPrice: item.BatchDetails[batid].Mrp,
                                GSTId: item.BatchDetails[batid].GstId,
                                GstId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GSTPercentage: item.BatchDetails[batid].GstPercentage,
                                GstPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                UnitGstAmount: 0.00,
                                UnitInGstAmount: 0.00,
                                UnitCGstAmount: 0.00,
                                UnitSGstAmount: 0.00,
                                GstAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                ConversionQuantity: item.BatchDetails[batid].ConversionQuantity,
                                IsExpiry: item.BatchDetails[batid].IsExpiry,
                                IsSuspended: item.BatchDetails[batid].IsSuspended,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                OrganizationId: 1,
                                FacilityId: utl.Session.getCurrentFacilityId(),
                                GrossAmount: 0.00,
                                NetAmount: 0.00,
                                ServiceId: item.ItemMasterId,
                                ServiceCode: item.ItemCode,
                                ServiceName: item.ItemName,
                                EncounterId: $scope.item.EncounterId,
                                PatientBillStatusId: 3,
                                Quantity: item.DispensedQuantity,
                                Rate: item.BatchDetails[batid].Mrp,
                                DoctorId: $scope.item.DoctorId,
                                DoctorName: $scope.item.DoctorName,
                                IsPharmacyCredit: 1,
                                IsPharmacySale: 1,
                                PharmacySaleTypeId: 2,
                                DiscountModeId: 2,
                                GenericId: item.GenericId,
                                GenericName: item.GenericName,
                                ManufacturerId: item.ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                StoreMasterId: $scope.item.StoreMasterId,
                                DepartmentId: $scope.item.DepartmentId,
                                OTRegisterId: $scope.item.OTRegisterId,
                                ProcedureId: $scope.item.ProcedureId,
                                Status: 1
                            };

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                patientdispenseDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                patientdispenseDetail.ExpiryAlert = true;
                            } else {
                                patientdispenseDetail.ExpiryProceed = true;
                            }

                            if (patientdispenseDetail.ExpiryAlert) {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryAlert = true;
                                patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (patientdispenseDetail.ExpiryStop) {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryStop = true;
                                patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryProceed = true;
                                patientdispenseDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQty) {
                                patientdispenseDetail.IsFallUnderMinQty = true;
                            } else {
                                patientdispenseDetail.IsFallUnderMinQty = false;
                            }

                            if (item.SubCategoryId == 1) {
                                patientdispenseDetail.SubCategoryId = 1;
                                patientdispenseDetail.ServiceTypeId = 0;
                                patientdispenseDetail.ServiceGroupId = $scope.DrugServiceGroupId;
                                patientdispenseDetail.ServiceCategoryId = $scope.DrugServiceCategoryId;
                                patientdispenseDetail.MasterName = item.DrugName;
                                patientdispenseDetail.MasterItemId = item.DrugId;
                                patientdispenseDetail.DrugName = item.DrugName;
                                patientdispenseDetail.DrugId = item.DrugId;
                                patientdispenseDetail.MasterTypeId = item.SubCategoryId;
                            } else if (item.SubCategoryId == 2) {
                                patientdispenseDetail.SubCategoryId = 2;
                                patientdispenseDetail.ServiceTypeId = 0;
                                patientdispenseDetail.ServiceGroupId = $scope.NonDrugServiceGroupId;
                                patientdispenseDetail.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                                patientdispenseDetail.MasterName = item.DrugName;
                                patientdispenseDetail.MasterItemId = item.DrugId;
                                patientdispenseDetail.DrugName = item.DrugName;
                                patientdispenseDetail.DrugId = item.DrugId;
                                patientdispenseDetail.MasterTypeId = item.SubCategoryId;
                            } else {
                                patientdispenseDetail.SubCategoryId = 0;
                                patientdispenseDetail.ServiceTypeId = 0;
                                patientdispenseDetail.ServiceGroupId = 0;
                                patientdispenseDetail.ServiceCategoryId = 0;
                                patientdispenseDetail.MasterName = '';
                                patientdispenseDetail.MasterItemId = 0;
                                patientdispenseDetail.DrugName = 0;
                                patientdispenseDetail.DrugId = 0;
                                patientdispenseDetail.MasterTypeId = 0;
                            }

                            patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                            patientdispenseDetail.Amount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.GrossAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                            patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                            patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                            patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                            patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                            patientdispenseDetail.GSTAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.GstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.InGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitInGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.CGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitCGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.SGstAmount = parseFloat((parseFloat(patientdispenseDetail.UnitSGstAmount) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.NetAmount = parseFloat((parseFloat(patientdispenseDetail.MrPrice) * parseFloat(patientdispenseDetail.DispensedQuantity)).toFixed(2));
                            patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                            patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                            patientdispenseDetail.BatchDetails = item.BatchDetails;
                            $scope.patientdispenseDetails.push(patientdispenseDetail);
                            item.DispensedQuantity = item.DispensedQuantity - item.BatchDetails[batid].Quantity;
                            savehitcompleted = 0;
                        }
                    }
                }

                $scope.DispensedValue = 0;
                $scope.TotalGrossAmount = 0;
                $scope.DiscountAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalInGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmountBeforeGst = 0;
                $scope.TotalNetAmount = 0;

                calculatetotalAmount();

                $scope.addNewLineItem();
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

        $scope.computeAmount = function (item) {
            if (parseInt(item.DispensedQuantity) > 0) {
                if (parseInt(item.DispensedQuantity) > item.TotalAvailableQuantity) {
                    item.DispensedQuantity = 0;
                    utl.Alert.showErrorMsg('Enter Qty is Greater Than Avail Qty.!');
                    return false;
                }
                item.GrossAmount = item.UnitCostPrice * parseInt(item.DispensedQuantity);
                item.NetAmount = item.UnitCostPrice * parseInt(item.DispensedQuantity);
            }
            $scope.DispensedValue = 0;
            $scope.TotalGrossAmount = 0;
            $scope.DiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;
            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.patientdispenseDetails) {
                var activeitem = $scope.patientdispenseDetails[idx];
                if (activeitem.ItemMasterId > 0 && parseInt(activeitem.DispensedQuantity) > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + parseFloat(activeitem.GrossAmount)).toFixed(4));
                    $scope.DiscountAmount = parseFloat(($scope.DiscountAmount + parseFloat(activeitem.DiscountAmount)).toFixed(4));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + parseFloat(activeitem.GstAmount)).toFixed(4));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + parseFloat(activeitem.InGstAmount)).toFixed(4));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + parseFloat(activeitem.CGstAmount)).toFixed(4));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + parseFloat(activeitem.SGstAmount)).toFixed(4));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + parseFloat(activeitem.NetAmount)).toFixed(4));
                    $scope.DispensedValue = parseFloat(($scope.DispensedValue + parseFloat(activeitem.NetAmount)).toFixed(4));
                    $scope.TotalNetAmountBeforeGst = $scope.TotalNetAmount - $scope.TotalGstAmount;
                }
            }

            $scope.item.DispensedValue = $scope.DispensedValue;
            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.DiscountAmount = $scope.DiscountAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.TotalNetAmountBeforeGst = $scope.TotalNetAmountBeforeGst;
        }

        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Procedure Code',
                field: 'ProcedureCode',
                datatype: 'string',
                headercls: 'td-procedurecode',
                fieldcls: 'td-procedurecode'
            },
            {
                header: 'Procedure Name',
                field: 'ProcedureName',
                datatype: 'string',
                headercls: 'td-procedurename',
                fieldcls: 'td-procedurename'
            },
            {
                header: 'PMR Code',
                field: 'PMRCode',
                datatype: 'string',
                headercls: 'td-pmrcode',
                fieldcls: 'td-pmrcode'
            },
            {
                header: 'PMR Name',
                field: 'PMRName',
                datatype: 'string',
                headercls: 'td-pmrname',
                fieldcls: 'td-pmrname'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/PMR/GetPMRProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.ProcedureCode + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.ProcedureCode, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }

            $scope.item.ProcedureName = result;

            $scope.loadSelectedPMR();

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 5,
                    Value: query
                });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];

                item.ProcedureCode = item.ProcedureCode;
                item.ProcedureName = item.ProcedureName;
                item.PMRCode = item.PMRCode;
                item.PMRName = item.PMRName;
            }
        }

        vm.patientdispenseitemcontrolconfig = {
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
            /* { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' }, */
            {
                header: 'Generic',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
            },
            /* { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' }, */
            {
                header: 'My Store Qty',
                field: 'MyStoreQty',
                datatype: 'string',
                headercls: 'td-mystoreqty',
                fieldcls: 'td-mystoreqty'
            },
            {
                header: 'To Store Qty',
                field: 'ToStoreQty',
                datatype: 'string',
                headercls: 'td-tostoreqty',
                fieldcls: 'td-tostoreqty'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemStoreMaps',
            formatdisplay: formatselectedpatientdispenseitem,
            presearch: presearchpatientdispenseitem,
            postsearch: postsearchpatientdispenseitem
        };

        function formatselectedpatientdispenseitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.patientdispenseitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, selectedItem.ItemCode].join(' ');
            } else if (vm.patientdispenseitemcontrolconfig.rowdata) {
                result = [vm.patientdispenseitemcontrolconfig.rowdata.ItemName, vm.patientdispenseitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpatientdispenseitem() {
            var query = vm.patientdispenseitemcontrolconfig.query;
            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.item.StoreMasterId },
                    {
                        Key: 11,
                        Value: $scope.item.StoreMasterId
                    },
                    {
                        Key: 13,
                        Value: 2
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientdispenseitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.patientdispenseitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpatientdispenseitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.patientdispenseitemcontrolconfig.result) {
                var item = vm.patientdispenseitemcontrolconfig.result[idx];
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                /*
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                */
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                /*
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                if (item.ItemMaster.StockItem !== null) {
                    item.MyStoreQty = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.MyStoreQty = 0;
                }
                if (item.ItemMaster.ToStoreStock !== null) {
                    item.ToStoreQty = item.ItemMaster.ToStoreStock.Quantity;
                } else {
                    item.ToStoreQty = 0;
                }
            }
        }

        function loadData() {
            if ($scope.currentcontext.PatientDispenseId > 0) {
                $scope.getPatientDispenseInfoById();
            } else {
                $scope.patientChange();
                $scope.applyVisibilityRules();
                $scope.addNewLineItem();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnDispense').text("Dispense (F4)");
            $('#btnprint').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreId = value[0].Id;
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreName = value[0].StoreName;
                    if (value[0].StoreMaster) {
                        $scope.item.ItemCategoryId = value[0].StoreMaster.StoreTypeId;
                        $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                        $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                        $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                    }
                }
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'OTDRUG') {
                            $scope.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'OTNONDRUG') {
                            $scope.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });

            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "DispenseType"
            },
            {
                "Key": "DispensePriority"
            },
            {
                "Key": "DispenseStatus"
            },
            {
                "Key": "ServiceCategory"
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
            ];

            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        /* Stock Transfer DOT Matrix Print - Start */

        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg('No Perference Settings for current facility');
                return false;
            } else {

                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'pharmacy/StockTransfer/DMPrintStockTransfer',
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
            $scope.printMaterialIssue(dmPrintInput);
        }

        function preparePrintData(data) {
            console.log('preparePrintData starts');

            var vRequestedBy = '';
            var vApprovedBy = '';
            var vIssuedBy = '';
            var vStockPriority = '';
            var vtotalmrpamount = '';

            if (data.StockTransfer.RequestedUser) {
                if (data.StockTransfer.RequestedUser.Title)
                    vRequestedBy += data.StockTransfer.RequestedUser.Title.Description;
                if (data.StockTransfer.RequestedUser.FirstName)
                    vRequestedBy += ' ' + data.StockTransfer.RequestedUser.FirstName;
                if (data.StockTransfer.RequestedUser.LastName)
                    vRequestedBy += ' ' + data.StockTransfer.RequestedUser.LastName;
            }

            if (data.StockTransfer.ApprovedUser) {
                if (data.StockTransfer.ApprovedUser.Title)
                    vApprovedBy += data.StockTransfer.ApprovedUser.Title.Description;
                if (data.StockTransfer.ApprovedUser.FirstName)
                    vApprovedBy += ' ' + data.StockTransfer.ApprovedUser.FirstName;
                if (data.StockTransfer.ApprovedUser.LastName)
                    vApprovedBy += ' ' + data.StockTransfer.ApprovedUser.LastName;
            }

            if (data.StockTransfer.TranferedUser) {
                if (data.StockTransfer.TranferedUser.Title)
                    vIssuedBy += data.StockTransfer.TranferedUser.Title.Description;
                if (data.StockTransfer.TranferedUser.FirstName)
                    vIssuedBy += ' ' + data.StockTransfer.TranferedUser.FirstName;
                if (data.StockTransfer.TranferedUser.LastName)
                    vIssuedBy += ' ' + data.StockTransfer.TranferedUser.LastName;
            }

            if (data.StockTransfer.StockRequest) {
                if (data.StockTransfer.StockRequest.StockPriority) {
                    vStockPriority = data.StockTransfer.StockRequest.StockPriority;
                }
            }


            var dmPrintInput = {};

            dmPrintInput.header = {
                vfromstore: data.StockTransfer.FromStore.StoreName || '',
                vissueno: data.StockTransfer.TransferNumber || '',
                vrequestedby: vRequestedBy || '',
                vtostore: data.StockTransfer.ToStore.StoreName || '',
                vissuedate: utl.Formatter.getDateTimeString(data.StockTransfer.TransferDate) || '',
                vapprovedby: vApprovedBy || '',
                vpriority: vStockPriority || '',
                vissuedby: vIssuedBy || '',
                vrequestedno: data.StockTransfer.RequestNumber,
                vtotnetamt: data.StockTransfer.TotalNetAmount.toFixed(2),
                vtotalmrpamount: 0,
                vcomments: data.StockTransfer.TransfererComments,
            };


            dmPrintInput.lines = [];
            var islno = 1;
            var totmrpamt = 0;
            for (var idx in data.patientdispenseDetail) {
                var patientdispenseDetail = data.patientdispenseDetail[idx];

                var expiryDate = patientdispenseDetail.ExpiryDate ? utl.Formatter.formatDate(patientdispenseDetail.ExpiryDate, 'MM/YY') : '';

                var TotalMrp = patientdispenseDetail.TransferedQuantity * patientdispenseDetail.MrPrice;

                totmrpamt += TotalMrp;

                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    desc: patientdispenseDetail.ItemName,
                    batchid: patientdispenseDetail.BatchId,
                    expirydt: expiryDate || '',
                    transferqty: patientdispenseDetail.TransferedQuantity,
                    UCP: patientdispenseDetail.UnitCostPrice.toFixed(2),
                    mrpprice: patientdispenseDetail.MrPrice.toFixed(2),
                    netamt: patientdispenseDetail.NetAmount.toFixed(2),
                    TotalMrp: TotalMrp.toFixed(2),
                    netamount: patientdispenseDetail.NetAmount.toFixed(2)
                };
                dmPrintInput.lines.push(detail);
            }

            dmPrintInput.header.vtotalmrpamount = totmrpamt.toFixed(2);

            console.log('preparePrintData ends');
            return dmPrintInput;
        }

        /* Stock Transfer DOT Matrix Print - End */

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == 'tostoreid') {
                    $timeout(function () {
                        var uiSelect = angular.element(document.getElementById('transfertype'));
                        var uichild = uiSelect.controller('uiSelect');
                        uichild.focusser[0].focus();
                        uichild.activate();
                    }, 100);
                } else if (nextId == 'transfertype') {
                    var idx = $scope.patientdispenseDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }
            }
        };

        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) {
                nextId = nextId + index;
                $('#' + nextId).select();
                $('#' + nextId).focus();
            } else if (event.keyCode == 37) {
                prevId = prevId + index;
                $('#' + prevId).focus();
            } else if (event.keyCode == 38) {
                if (upId == 'qty') {
                    upId = upId + (index - 1);
                    $('#' + upId).focus();
                } else if (upId == 'desc') {
                    if ($scope.autosearchpopup == 0) {
                        upId = upId + (index - 1);
                        $('#' + upId).focus();
                    }
                }
            } else if (event.keyCode == 40) {
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }
            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    if (item.IsPMRItem) { } else {
                        $scope.ChooseBatches(index, item);
                    }
                    var activeRecords = $scope.getActiveRecord();
                    var idx = activeRecords.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        nextId = "btnDispense";
                        $('#' + nextId).focus();
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
                } else if (nextId == 'batchid') {
                    $timeout(function () {
                        nextId = nextId + index;
                        var uiSelect = angular.element(document.getElementById(nextId));
                        var uichild = uiSelect.controller('uiSelect');
                        uichild.focusser[0].focus();
                        uichild.activate();
                    }, 100);
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.onDeleteConfirmed(item);
                $timeout(function () {
                    var activeRecords = $scope.getActiveRecord();
                    var idx = activeRecords.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }, 100);
            }
        };

        $scope.getActiveRecord = function () {
            var activeRecords = $filter('filterArrayItems')($scope.patientdispenseDetails, [{
                search: 1,
                fields: ['Status']
            }]);

            return activeRecords;
        }

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() === '')
                $('#' + nextId).val(0);
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

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        /* Pharmacy  Sales - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowDispenseBtn) {
                /* F2 - SaveAndApprove */
                $scope.Dispense();
            }
            if (kCode == 118) {
                /* F7 - New Page */
                $scope.addNew();
            }
            if (e.altKey && kCode == 65 && savehitcompleted === 0 && $scope.canShowDispenseBtn) {
                /* alt + s  - SaveAndApprove */
                $scope.Dispense();
            }
            if (e.altKey && kCode == 80) {
                /* alt + p - DMPrint */
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else {
                    $scope.print();
                }
            }
            if (kCode == 27) {
                $scope.autosearchpopup = 0;
            }
        }
        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Pharmacy  Sales - Shortcut Keys - End */
    }

    materialIssueFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig', '$timeout'];

})();