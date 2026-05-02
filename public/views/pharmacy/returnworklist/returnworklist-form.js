(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockDispenseFormController', StockDispenseFormController);

    function StockDispenseFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            PatientId: 0,
            PatientMRN: '',
            PatientName: '',
            EncounterId: 0,
            DoctorId: 0,
            DoctorName: '',
            DepartmentId: 0,
            GuarantorId: 0,
            LocationId: 0,
            WardId: 0,
            RoomId: 0,
            BedId: 0,
            DispenseTypeId: 0,
            DispenseStatusId: 0,
            PatientRequestStatusId: 0,
            DispensedValue: 0,
            GrossAmount: 0,
            NetAmount: 0,
            Comments: null,
            isDisabled: false,
            DispenseNumber: null,
            PatientRequestNumber: null,
            PatientStockRequestId: 0,
            RequestedBy: 0,
            RequestedDate: null,
            DisplayDispenseStatus: null,
            ReadOnly: true,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            DrugServiceCategoryId: 0,
            DrugServiceGroupId: 0,
            NonDrugServiceCategoryId: 0,
            NonDrugServiceGroupId: 0,
            PatientAdmissionStatusId: 0,
            IsBillLock: false
        };

        $scope.lookup = {};
        $scope.selectedPatient = {};
        $scope.currentcontext = {
            id: -1,
            patientstockrequestid: -1,
            patientdispenseid: -1,
            storemasterid: -1,
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.dispenseworklistshistory', {});
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.transferattachments', {
                params: { patientdispenseid: 0, itemmasterid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.patientstockrequestid = $state.params.PatientStockRequestId;
        $scope.currentcontext.patientdispenseid = $state.params.PatientDispenseId;
        $scope.currentcontext.storemasterid = $state.params.StoreMasterId;
        $scope.item.DispenseDateTime = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.PatientDispenseDetails = [];

        $scope.canShowPrintBtn = false;
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveandApproveBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;
        $scope.canShowLockTitle = false;
        $scope.canShowDischargeTitle = false;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.DispenseStatusId != 1 || $scope.item.DispenseStatusId != 2 || $scope.item.DispenseStatusId != 3 || $scope.item.DispenseStatusId != 4 || $scope.item.DispenseStatusId != 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
            }
            // When In Draft Status
            if ($scope.item.DispenseStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
            }
            // When In Approved Status
            if ($scope.item.DispenseStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.DispenseStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Completed Status
            if ($scope.item.DispenseStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.DispenseStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
        };

        $scope.addNewLineItem = function () {
            var PatientDispenseDetail = {
                Id: 0,
                PatientStockRequestDetailId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUom: { Id: 0, UomCode: '' },
                PurchaseUomId: 0,
                SaleUom: { Id: 0, UomCode: '' },
                SaleUomId: 0,
                CategoryId: 0,
                SubCategoryId: 0,
                ProductTypeId: 0,
                SubProductTypeId: 0,
                GenericId: 0,
                GenericName: '',
                ManufacturerId: 0,
                ManufacturerName: '',
                ScheduleTypeId: 0,
                ScheduleTypeDescription: '',
                RequestedQuantity: 0,
                ServedQuantity: 0,
                DispensedQuantity: 0,
                QuantityBeforeTransfer: 0,
                TotalAvailableQuantity: 0,
                BatchQuantity: 0,
                PurchasePrice: 0,
                GstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                InGstId: 0,
                InGstPercentage: 0,
                InUnitGstAmount: 0,
                InGstAmount: 0,
                CGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                CGstId: 0,
                CGstPercentage: 0,
                CUnitGstAmount: 0,
                CGstAmount: 0,
                SGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                SGstId: 0,
                SGstPercentage: 0,
                SUnitGstAmount: 0,
                SGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                BatchDetails: [],
                BatchDetail: { Id: 0, StockItemId: 0, ItemMasterId: 0, StoreMasterId: 0, BatchId: '', Quantity: 0, ExpiryDate: null, Ucp: 0, Mrp: 0, SerialDetails: null },
                StockSerialItemId: 0,
                StockItemId: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                Ucp: 0,
                Mrp: 0,
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                PatientDispenseDetail.PatientDispenseId = $scope.currentcontext.id;
            }
            $scope.PatientDispenseDetails.push(PatientDispenseDetail);
        };

        $scope.Clear = function () {
            $scope.PatientDispenseDetails = [];
            $scope.addNewLineItem();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/PatientDispense/PrintPatientDispenseDetail',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.canShowPatientBanner = function () {
            if (this.item.PatientId > 0) {
                return true;
            }
            return false;
        };

        $scope.History = function (selectedItem, idx) {
            utl.Modal.open('app.dispenseworklistshistory', {
                params: { itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.Stock = function (selectedItem, idx) {
            utl.Modal.open('app.patientreturndetails', {
                params: { itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                confirmCallback: $scope.getList
            });
        };
        //  $scope.Stock = function (selectedItem, idx) {
        //     if (selectedItem.ItemMasterId > 0) {
        //         utl.Modal.open('app.patientrequestdetails', {
        //             params: {
        //                 storemasterid: $scope.item.StoreMasterId,
        //                 itemmasterid: selectedItem.ItemMasterId,
        //                 itemcode: selectedItem.ItemCode,
        //                 itemname: selectedItem.ItemName
        //             },
        //         }
        //         )
        //     } else {
        //         utl.Alert.showErrorMsg('This one is Empty Row..')
        //     }
        // };

        $scope.alternateDetails = function (idx, item) {
            utl.Modal.open('app.pharmacyalternates', {
                params: {
                    genericid: item.GenericId,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.deletePatientDispenseDetail = function (idx, item) {
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.editPatientDispenseDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.patientdispensedetail', {
                params: { id: $scope.currentcontext.id, current_item: item },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.PatientDispenseDetails) {
                var item = $scope.PatientDispenseDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.StockTransferId = $scope.currentcontext.id;
                }
                $scope.PatientDispenseDetails.push(itemFromModal);
            }
        };

        $scope.getPatientDispenseDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientDispenseDetails = res.Data || [];
            for (var idx in $scope.PatientDispenseDetails) {
                var dispenseitem = $scope.PatientDispenseDetails[idx];
                if (dispenseitem.ItemMasterId > 0) {
                    var DispenseBatchDetail = {
                        Id: 0,
                        StockItemId: 0,
                        ItemMasterId: 0,
                        StoreMasterId: 0,
                        BatchId: '',
                        Quantity: 0,
                        ExpiryDate: null,
                        Ucp: 0,
                        Mrp: 0,
                        GstId: 0,
                        GstPercentage: 0,
                        InGstId: 0,
                        InGstPercentage: 0,
                        CGstId: 0,
                        CGstPercentage: 0,
                        SGstId: 0,
                        SGstPercentage: 0,
                        SerialDetails: null
                    };
                    dispenseitem.BatchDetails = [];
                    DispenseBatchDetail.BatchId = dispenseitem.BatchId;
                    dispenseitem.BatchDetails.push(DispenseBatchDetail);
                    dispenseitem.MrPrice = dispenseitem.Mrp;
                    dispenseitem.ServedQuantity = dispenseitem.PatientStockRequestDetail.DispensedQuantity;
                }
            }
            calculatetotalAmount();
        };

        $scope.getPatientDispenseDetails = function (pageNo) {
            if ($scope.currentcontext.patientdispenseid && $scope.currentcontext.patientdispenseid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.patientdispenseid }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'billing/patientdispensedetails/GetPatientDispenseDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientDispenseDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientDispenseCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.DispenseStatusId == 1) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = false;
                $scope.item.DisplayDispenseStatus = 'Draft';
            }
            if (data.DispenseStatusId == 2) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayDispenseStatus = 'Approved';
            }
            if (data.DispenseStatusId == 3) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayDispenseStatus = 'Authorized';
            }
            if (data.DispenseStatusId == 4) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayDispenseStatus = 'Completed';
            }
            if (data.DispenseStatusId == 5) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayDispenseStatus = 'Cancelled';
            }
            $scope.applyVisibilityRules();
        };

        $scope.getPatientDispenseById = function () {
            if ($scope.item.PatientDispenseId && $scope.item.PatientDispenseId > 0) {
                var options = {
                    action: 'billing/patientdispense/GetPatientDispenseById',
                    data: {
                        Id: $scope.currentcontext.patientdispenseid
                    },
                    type: 'post',
                    onComplete: $scope.getPatientDispenseCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.getPatientDispense = function () {
            $scope.item.PatientDispenseId = $scope.currentcontext.patientdispenseid;
            $scope.getPatientDispenseById();
            $scope.getPatientDispenseDetails();
        };

        $scope.getPatientStockRequest = function () {
            $scope.item.PatientStockRequestId = $scope.currentcontext.id;
            $scope.currentcontext.patientstockrequestid = $scope.currentcontext.id;
            $scope.getPatientStockRequestById();
            $scope.getPatientStockRequestDetails();
        };

        $scope.getPatientStockRequestById = function () {
            if ($scope.item.PatientStockRequestId && $scope.item.PatientStockRequestId > 0) {
                var options = {
                    action: 'IPManagement/PatientStockRequests/GetPatientStockRequestsById',
                    data: {
                        Id: $scope.currentcontext.patientstockrequestid
                    },
                    type: 'post',
                    onComplete: $scope.getPatientStockRequestCallback
                };
                utl.Http.doAction(options);
            } else { }
        };

        $scope.getPatientStockRequestCallback = function (scope, data, options, hasError) {
            var result = data;

            $scope.item.PatientStockRequestId = result.PatientStockRequestId;
            $scope.item.PatientRequestNumber = result.PatientRequestNumber;
            $scope.item.RequestedBy = result.RequestedBy;
            $scope.item.RequestedDate = result.RequestedDate;
            $scope.item.StoreMasterId = result.ToStoreId;
            $scope.item.StoreName = '';
            $scope.item.FacilityId = result.FacilityId;
            $scope.item.PatientId = result.PatientId;
            $scope.item.PatientMRN = result.PatientMRN;
            $scope.item.EncounterId = result.EncounterId;
            $scope.item.DoctorId = result.DoctorId;
            $scope.item.DoctorName = result.DoctorName;
            $scope.item.DepartmentId = result.DepartmentId;
            $scope.item.GuarantorId = result.GuarantorId;
            $scope.item.LocationId = result.LocationId;
            $scope.item.WardId = result.WardId;
            $scope.item.RoomId = result.RoomId;
            $scope.item.BedId = result.BedId;

            $scope.item.DispensedValue = 0;
            $scope.item.GrossAmount = 0;
            $scope.item.NetAmount = 0;

            $scope.patientChange();
        };

        $scope.getPatientStockRequestDetails = function () {
            if ($scope.item.PatientStockRequestId && $scope.item.PatientStockRequestId > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.patientstockrequestid
                    }, {
                        Key: 6,
                        Value: $scope.currentcontext.storemasterid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'IPManagement/PatientStockRequestDetails/GetPatientStockRequestDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientStockRequestDetailsCallback
                };
                utl.Http.doAction(options);
            } else { }
        };

        $scope.getPatientStockRequestDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientDispenseDetails = res.Data || [];
            for (var idx in $scope.PatientDispenseDetails) {
                var sritem = $scope.PatientDispenseDetails[idx];
                if (sritem.ItemMasterId > 0) {
                    sritem.PatientStockRequestDetailId = sritem.Id;
                    sritem.ServedQuantity = sritem.DispensedQuantity;
                    sritem.Id = 0;

                    sritem.CategoryId = sritem.ItemMaster.CategoryId;
                    sritem.SubCategoryId = sritem.ItemMaster.SubCategoryId;
                    sritem.ProductTypeId = sritem.ItemMaster.ProductTypeId;
                    sritem.SubProductTypeId = sritem.ItemMaster.SubProductTypeId;
                    if (sritem.ItemMaster.GenericMaster) {
                        sritem.GenericId = sritem.ItemMaster.GenericId;
                        sritem.GenericName = sritem.ItemMaster.GenericMaster.GenericName;
                    }
                    if (sritem.ItemMaster.Manufacturer) {
                        sritem.ManufacturerId = sritem.ItemMaster.ManufacturerId;
                        sritem.ManufacturerName = sritem.ItemMaster.Manufacturer.VendorName;
                    }
                    if (sritem.ItemMaster.ScheduleType) {
                        sritem.ScheduleTypeId = sritem.ItemMaster.ScheduleTypeId;
                        sritem.ScheduleTypeDescription = sritem.ItemMaster.ScheduleType.Description;
                    }

                    if (sritem.SubCategoryId == 1) {
                        sritem.ServiceTypeId = 0;
                        sritem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                        sritem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                        sritem.MasterName = sritem.ItemMaster.DrugName;
                        sritem.MasterItemId = sritem.ItemMaster.DrugId;
                        sritem.MasterTypeId = sritem.SubCategoryId;
                    } else if (sritem.SubCategoryId == 2) {
                        sritem.ServiceTypeId = 0;
                        sritem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                        sritem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                        sritem.MasterName = sritem.ItemMaster.DrugName;
                        sritem.MasterItemId = sritem.ItemMaster.DrugId;
                        sritem.MasterTypeId = sritem.SubCategoryId;
                    } else {
                        sritem.ServiceTypeId = 0;
                        sritem.ServiceGroupId = 0;
                        sritem.ServiceCategoryId = 0;
                        sritem.MasterName = '';
                        sritem.MasterItemId = 0;
                        sritem.MasterTypeId = 0;
                    }

                    if (sritem.ItemMaster.StockItem !== null) {
                        var stockserialitems = null;
                        sritem.TotalAvailableQuantity = sritem.ItemMaster.StockItem.Quantity;
                        if (sritem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                            stockserialitems = sritem.ItemMaster.StockItem.StockSerialItems;
                            for (var batid = 0; batid < stockserialitems.length; batid++) {
                                var serialitem = stockserialitems[batid];
                                serialitem.SerialDetails = [
                                    ' Batch: ', serialitem.BatchId,
                                    ' | Qty: ', serialitem.Quantity,
                                    ' | Expiry: ', serialitem.ExpiryDate,
                                    ' | UCP: ', serialitem.Ucp,
                                    ' | MRP: ', serialitem.Mrp
                                ].join(' ');
                            }

                            sritem.BatchDetails = sritem.ItemMaster.StockItem.StockSerialItems;
                            sritem.StockItemId = sritem.BatchDetails[0].StockItemId;
                            sritem.StockSerialItemId = sritem.BatchDetails[0].Id;
                            sritem.BatchId = sritem.BatchDetails[0].BatchId;
                            sritem.ExpiryDate = sritem.BatchDetails[0].ExpiryDate;
                            sritem.QuantityBeforeTransfer = sritem.BatchDetails[0].Quantity;
                            sritem.BatchQuantity = sritem.BatchDetails[0].Quantity;
                            if (sritem.BatchQuantity >= sritem.RequestedQuantity) {
                                sritem.DispensedQuantity = sritem.RequestedQuantity;
                            } else {
                                sritem.DispensedQuantity = sritem.BatchQuantity;
                            }
                            sritem.PurchasePrice = sritem.BatchDetails[0].Ucp;
                            sritem.UnitCostPrice = sritem.BatchDetails[0].Ucp;
                            sritem.MrPrice = sritem.BatchDetails[0].Mrp;

                            sritem.BaseUomId = sritem.BatchDetails[0].BaseUomId;
                            sritem.SaleUomId = sritem.BatchDetails[0].SaleUomId;

                            sritem.GstId = sritem.BatchDetails[0].GstId;
                            sritem.GstPercentage = sritem.BatchDetails[0].GstPercentage;

                            sritem.InGstId = sritem.BatchDetails[0].InGstId;
                            sritem.InGstPercentage = sritem.BatchDetails[0].InGstPercentage;

                            sritem.CGstId = sritem.BatchDetails[0].CGstId;
                            sritem.CGstPercentage = sritem.BatchDetails[0].CGstPercentage;

                            sritem.SGstId = sritem.BatchDetails[0].SGstId;
                            sritem.SGstPercentage = sritem.BatchDetails[0].SGstPercentage;

                            sritem.GrossAmount = sritem.DispensedQuantity * sritem.MrPrice;
                            sritem.Amount = sritem.DispensedQuantity * sritem.MrPrice;
                            sritem.NetAmount = sritem.DispensedQuantity * sritem.MrPrice;
                        }
                    } else {
                        sritem.TotalAvailableQuantity = 0;
                        sritem.QuantityBeforeTransfer = 0;
                    }
                }
            }
            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;
            calculatetotalAmount();
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
                var encGuarantor = encounter.EncounterGuarantors.length > 0 ? encounter.EncounterGuarantors[0] : { GuarantorTypeId: -1 };
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
                if ($scope.encounter.AdmissionStatusId > 4) {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.IsEncounter = true;
                    $scope.canShowPrintBtn = false;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canShowDeleteBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowCancelBtn = false;
                    $scope.canShowDischargeTitle = true;
                } else {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.IsEncounter = true;
                    if ($scope.encounter.IsBillLock) {
                        $scope.item.IsBillLock = true;
                        $scope.canShowPrintBtn = false;
                        $scope.canShowSaveBtn = false;
                        $scope.canShowSaveandApproveBtn = false;
                        $scope.canShowDeleteBtn = false;
                        $scope.canShowClearBtn = false;
                        $scope.canShowCancelBtn = false;
                        $scope.canShowLockTitle = true;
                    }
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.visitalert.lbl'));

            }
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.onBatchSelected = function (selectedItem, SelectedMasterItem, idx) {
            selectedItem.BatchId = SelectedMasterItem.BatchId;
            selectedItem.ExpiryDate = SelectedMasterItem.ExpiryDate;
            selectedItem.QuantityBeforeTransfer = SelectedMasterItem.Quantity;
            selectedItem.BatchQuantity = SelectedMasterItem.Quantity;
            selectedItem.PurchasePrice = SelectedMasterItem.Ucp;
            selectedItem.UnitCostPrice = SelectedMasterItem.Ucp;
            selectedItem.MrPrice = SelectedMasterItem.Mrp;
            selectedItem.StockItemId = SelectedMasterItem.StockItemId;
            selectedItem.StockSerialItemId = SelectedMasterItem.Id;
            selectedItem.DispensedQuantity = 0;

            selectedItem.GstId = selectedItem.GstId;
            selectedItem.GstPercentage = selectedItem.GstPercentage;

            selectedItem.InGstId = selectedItem.InGstId;
            selectedItem.InGstPercentage = selectedItem.InGstPercentage;

            selectedItem.CGstId = selectedItem.CGstId;
            selectedItem.CGstPercentage = selectedItem.CGstPercentage;

            selectedItem.SGstId = selectedItem.SGstId;
            selectedItem.SGstPercentage = selectedItem.SGstPercentage;
        };

        $scope.computeAmount = function (item) {
            if (item.DispensedQuantity === null) {
                item.GrossAmount = item.MrPrice * 0;
                item.NetAmount = item.MrPrice * 0;

                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.emptyqty.lbl'));

                return false;
            } else if (item.DispensedQuantity === 0) {
                item.GrossAmount = item.MrPrice * 0;
                item.NetAmount = item.MrPrice * 0;
            } else {
                if (item.DispensedQuantity > item.QuantityBeforeTransfer) {
                    item.DispensedQuantity = 0;
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.enterqty.lbl'));

                    return false;
                } else if (item.DispensedQuantity > item.RequestedQuantity) {
                    item.DispensedQuantity = 0;
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.requestedqty.lbl'));

                    return false;
                } else {
                    item.GrossAmount = item.MrPrice * item.DispensedQuantity;
                    item.NetAmount = item.MrPrice * item.DispensedQuantity;
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.PatientDispenseDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.PatientDispenseDetails[idx].GrossAmount).toFixed(2));

                if ($scope.TotalNetAmount === null) {
                    $scope.TotalNetAmount = 0;
                }
                $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.PatientDispenseDetails[idx].NetAmount).toFixed(2));
            }

            $scope.item.DispensedValue = $scope.TotalGrossAmount;
            $scope.item.GrossAmount = $scope.TotalGrossAmount;
            $scope.item.NetAmount = $scope.TotalNetAmount;
        }

        $scope.SaveandDraft = function () {
            $scope.item.DispenseStatusId = 1;
            $scope.saveItem();
        };
        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.stockdispense.savaandapproved.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };


        $scope.onSaveandApproveConfirmed = function () {
            $scope.item.DispenseStatusId = 2;
            $scope.item.PatientStockRequestId = $scope.currentcontext.patientstockrequestid;
            $scope.item.PatientRequestStatusId = 4;
            $scope.item.DispensedBy = utl.Session.getCurrentUserId();
            $scope.item.DispenseDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function () {
            $scope.item.DispenseStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.DispenseStatusId = 4;
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.DispenseStatusId = 3;
            $scope.saveItem();
        };

        $scope.CancelTransfer = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stocktransfer.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'billing/patientdispense/AddPatientDispense';
                if ($scope.currentcontext.patientdispenseid && $scope.currentcontext.patientdispenseid > 0) {
                    actionName = 'billing/patientdispense/UpdatePatientDispense';
                }

                var inputData = { Header: $scope.item, Details: lines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            for (var iddx in $scope.PatientDispenseDetails) {
                var iddxitem = $scope.PatientDispenseDetails[iddx];
                if (iddxitem.ItemMasterId > 0 && iddxitem.DispensedQuantity <= 0) {
                    utl.Alert.showErrorMsg('Please Enter Qty for ' + iddxitem.ItemName);
                    return false;
                }
            }

            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientDispenseDetails) {
                var item = $scope.PatientDispenseDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1) {
                    item.DispenseDateTime = $scope.item.DispenseDateTime;
                    item.StoreMasterId = $scope.item.StoreMasterId;
                    item.DepartmentId = $scope.item.DepartmentId;
                    item.FacilityId = $scope.item.FacilityId;
                    item.DoctorId = $scope.item.DoctorId;
                    item.DoctorName = $scope.item.DoctorName;
                    item.BillDateTime = $scope.item.DispenseDateTime;
                    item.ServiceId = item.ItemMasterId;
                    item.ServiceCode = item.ItemCode;
                    item.ServiceName = item.ItemName;
                    item.EncounterId = $scope.item.EncounterId;
                    item.PatientBillStatusId = 3;
                    item.Quantity = item.DispensedQuantity;
                    item.Rate = item.MrPrice;
                    item.IsPharmacySale = 1;

                    result.push(item);
                }
            }
            return result;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.patientdispenseid = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.patientdispenseid = data;
            }

            loadData();
        };

        $scope.backToList = function () {
            $state.go('app.dispenseworklists', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.patientdispenseid > 0) {
                $scope.getPatientDispense();
            } else {
                $scope.getPatientStockRequest();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                    $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
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
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ToStore", Request: { Params: [{ Key: 7, Value: 2 }] } },
                { "Key": "DispenseType" },
                { "Key": "DispenseStatus" },
                { "Key": "ServiceCategory" },
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
            loadData();
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

        $scope.initLookup();
    }

    StockDispenseFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();