(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReturnReceiveFormController', ReturnReceiveFormController);

    function ReturnReceiveFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreTypeId: 0,
            StoreSubTypeId: 0,
            SequenceOptionId: 0,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            DispenseReturnStatusId: 0,
            PatientReturnStatusId: 0,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            TotalNetAmountBeforeGst: 0,
            TotalNetAmount: 0,
            ReturnedValue: 0,
            ReceivedValue: 0,
            Comments: null,
            isDisabled: false,
            DispenseReturnNumber: null,
            DispenseReturnTypeId: 1,
            PatientReturnNumber: null,
            PatientStockReturnId: 0,
            ReturnedBy: 0,
            ReturnedDate: null,
            DisplayDispenseReturnStatus: null,
            ReadOnly: true,
            PatientName: '',
            TitleId: 0,
            GenderId: 0,
            Age: 0
        };

        $scope.currentreturn = {
            Id: -1,
            PatientReturnStatusId: -1
        };

        $scope.lookup = {};
        $scope.selectedPatient = {};

        $scope.currentrequest = {
            Id: -1,
            PatientReturnStatusId: -1
        };

        $scope.currentcontext = {
            id: -1,
            patientstockreturnid: -1,
            patientdispensereturnid: -1,
            storemasterid: -1,
        };

        /*
        $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove');
        $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        $scope.currentcontext.CanAttachment = utl.Privilege.hasPrivilege('CanAttachment');
        $scope.currentcontext.CanDelete = utl.Privilege.hasPrivilege('CanDelete');
        $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew');
        $scope.currentcontext.CanSWTransfer = utl.Privilege.hasPrivilege('CanSWTransfer');
        $scope.currentcontext.CanComplete = utl.Privilege.hasPrivilege('CanComplete');
        $scope.currentcontext.CanHistory = utl.Privilege.hasPrivilege('CanHistory');
        $scope.currentcontext.CanSWDMPrint = utl.Privilege.hasPrivilege('CanSWDMPrint');
        */
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.openAttachments = function() {
            utl.Modal.open('app.dispensereturnattachments', {
                params: {
                    patientdispensereturnid: 0,
                    itemmasterid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.patientstockreturnid = $state.params.PatientStockReturnId;
        $scope.currentcontext.patientdispensereturnid = $state.params.PatientDispenseReturnId;
        $scope.currentcontext.storemasterid = $state.params.StoreMasterId;
        $scope.item.DispenseReturnDateTime = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.patientdispensereturnDetails = [];

        $scope.canShowPrintBtn = false;
        $scope.canShowReceiveBtn = false;
        $scope.canShowRejectBtn = false;
        $scope.canShowCompleteBtn = false;

        $scope.DrugServiceCategoryId = 0;
        $scope.DrugServiceGroupId = 0;
        $scope.NonDrugServiceCategoryId = 0;
        $scope.NonDrugServiceGroupId = 0;

        $scope.applyVisibilityRules = function() {
            // New
            if ($scope.item.DispenseReturnStatusId != 1 || $scope.item.DispenseReturnStatusId != 2 || $scope.item.DispenseReturnStatusId != 3) {
                $scope.canShowPrintBtn = false;
                $scope.canShowReceiveBtn = true;
            }
            // When In Draft Status
            if ($scope.item.DispenseReturnStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowReceiveBtn = true;
            }
            // When In Received Status
            if ($scope.item.DispenseReturnStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowReceiveBtn = false;
            }
            // When In Rejected Status
            if ($scope.item.DispenseReturnStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowReceiveBtn = false;
            }
        };

        $scope.addNewLineItem = function() {
            var patientdispensereturnDetail = {
                Id: 0,
                PatientStockReturnDetailId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                IsSupplementary: false,
                SubCategoryId: 0,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: '',
                MasterItemId: 0,
                DrugName: '',
                DrugId: 0,
                MasterTypeId: 0,
                BaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                BaseUomId: 0,
                PurchaseUomId: 0,
                ReturnedQuantity: 0,
                ReturnQuantity: 0,
                ReceivedQuantity: 0,
                QuantityBeforeReceive: 0,
                AcceptedQuantity: 0,
                TotalAvailableQuantity: 0,
                BatchQuantity: 0,
                PurchasePrice: 0,
                GstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                InGstId: 0,
                InGstPercentage: 0,
                InUnitGstAmount: 0,
                InGstAmount: 0,
                CGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                CGstId: 0,
                CGstPercentage: 0,
                CUnitGstAmount: 0,
                CGstAmount: 0,
                SGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
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
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    ItemMasterId: 0,
                    StoreMasterId: 0,
                    BatchId: '',
                    Quantity: 0,
                    ExpiryDate: null,
                    Ucp: 0,
                    Mrp: 0,
                    Rev: 0,
                    SerialDetails: null
                },
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                Ucp: 0,
                Mrp: 0,
                IsPharmacyCredit: 1,
                IsFullyReceived: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                patientdispensereturnDetail.PatientDispenseReturnId = $scope.currentcontext.id;
            }
            $scope.patientdispensereturnDetails.push(patientdispensereturnDetail);
        };

        $scope.Clear = function() {
            $scope.patientdispensereturnDetails = [];
            $scope.addNewLineItem();
        };

        $scope.print = function() {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/PatientStockReturns/PrintPatientStockReturns',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.Stock = function(selectedItem, idx) {
            utl.Modal.open('app.patientreturndetails', {
                params: {
                    itemmasterid: idx.ItemMasterId,
                    itemcode: idx.ItemCode,
                    itemname: idx.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.history = function(HistoryId) {
            utl.Modal.open('app.patreturnhistory', {
                params: {
                    hid: $scope.item.PatientStockReturnId
                }
            });
        };

        $scope.History = function(item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.patientreturnhistory', {
                    params: {
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;
            $scope.DispensedValue = 0;

            calculatetotalAmount();
        };

        $scope.deletePatientDispenseReturnDetail = function(idx, item) {
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.editPatientDispenseReturnDetail = function(item) {
            item.currenteditable = true;
            utl.Modal.open('app.patientdispensereturndetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function(itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.patientdispensereturnDetails) {
                var item = $scope.patientdispensereturnDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.PatientDispenseReturnId = $scope.currentcontext.id;
                }
                $scope.patientdispensereturnDetails.push(itemFromModal);
            }
        };

        $scope.getPatientDispenseReturnInfoById = function() {
            var SearchDispenseReturnId = $scope.currentcontext.patientdispensereturnid;
            if (SearchDispenseReturnId && SearchDispenseReturnId > 0) {
                var inputData = {
                    Params: [{
                            Key: 0,
                            Value: SearchDispenseReturnId
                        },
                        {
                            Key: 5,
                            Value: $scope.currentcontext.storemasterid
                        }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Billing/PatientDispenseReturn/GetPatientDispenseReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDispenseReturnInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getDispenseReturnInfoCallback = function(scope, res, options, hasError) {
            $scope.PatientDispenseReturnInfo = res.Data || [];
            if ($scope.PatientDispenseReturnInfo && $scope.PatientDispenseReturnInfo.length > 0) {
                $scope.PatientDispenseReturnInfo.forEach(patientdispensereturn => {
                    if (patientdispensereturn.Patient) {
                        $scope.selectedPatient = patientdispensereturn.Patient;
                        $scope.item.TitleId = patientdispensereturn.Patient.TitleId;
                        $scope.item.GenderId = patientdispensereturn.Patient.GenderId;
                        $scope.item.Age = patientdispensereturn.Patient.Age;
                    }
                    $scope.item.DispenseReturnStatusId = patientdispensereturn.DispenseReturnStatusId;
                    if (patientdispensereturn.DispenseReturnStatusId == 1) {
                        $scope.item.ReadOnly = true;
                        $scope.item.isDisabled = false;
                        $scope.item.DisplayDispenseReturnStatus = 'Draft';
                    } else if (patientdispensereturn.DispenseReturnStatusId == 2) {
                        $scope.item.ReadOnly = true;
                        $scope.item.isDisabled = true;
                        $scope.canShowRejectBtn = false;
                        $scope.item.DisplayDispenseReturnStatus = 'Received';
                    } else if (patientdispensereturn.DispenseReturnStatusId == 3) {
                        $scope.item.ReadOnly = true;
                        $scope.item.isDisabled = true;
                        $scope.canShowRejectBtn = false;
                        $scope.item.DisplayDispenseReturnStatus = 'Cancelled';
                    }

                    $scope.item.PatientStockReturnId = patientdispensereturn.PatientStockReturnId;
                    $scope.item.PatientReturnNumber = patientdispensereturn.PatientReturnNumber;
                    $scope.item.DispenseReturnNumber = patientdispensereturn.DispenseReturnNumber;
                    $scope.item.DispenseReturnDateTime = patientdispensereturn.DispenseReturnDateTime;
                    $scope.item.ReturnReceivedBy = patientdispensereturn.ReturnReceivedBy;
                    $scope.item.ApprovedDateTime = patientdispensereturn.ApprovedDateTime;
                    $scope.item.ApprovedBy = patientdispensereturn.ApprovedBy;

                    $scope.item.OrganizationId = patientdispensereturn.OrganizationId;
                    $scope.item.FacilityId = patientdispensereturn.FacilityId;
                    $scope.item.DepartmentId = patientdispensereturn.DepartmentId;
                    $scope.item.StoreMasterId = patientdispensereturn.StoreMasterId;
                    $scope.item.PatientId = patientdispensereturn.PatientId;
                    $scope.item.PatientMRN = patientdispensereturn.PatientMRN;
                    $scope.item.PatientName = patientdispensereturn.PatientName;
                    $scope.item.PatientTypeId = patientdispensereturn.PatientTypeId;
                    $scope.item.EncounterId = patientdispensereturn.EncounterId;
                    $scope.item.EncounterTypeId = patientdispensereturn.EncounterTypeId;
                    $scope.item.LocationId = patientdispensereturn.LocationId;
                    $scope.item.WardId = patientdispensereturn.WardId;
                    $scope.item.WardName = '';
                    if (patientdispensereturn.WardMaster) {
                        $scope.item.WardName = patientdispensereturn.WardMaster.WardName;
                    }
                    $scope.item.RoomId = patientdispensereturn.RoomId;
                    $scope.item.RoomName = '';
                    if (patientdispensereturn.WardRoomMaster) {
                        $scope.item.RoomName = patientdispensereturn.WardRoomMaster.RoomNo;
                    }
                    $scope.item.WardRoom = $scope.item.WardName + ' / ' + $scope.item.RoomName;
                    $scope.item.BedId = patientdispensereturn.BedId;
                    $scope.item.GuarantorId = patientdispensereturn.GuarantorId;
                    $scope.item.GuarantorTypeId = patientdispensereturn.GuarantorTypeId;
                    $scope.item.GuarantorName = patientdispensereturn.GuarantorName;
                    $scope.item.DoctorId = patientdispensereturn.DoctorId;
                    $scope.item.DoctorName = patientdispensereturn.DoctorName;
                    $scope.item.ReferralId = patientdispensereturn.ReferralId;
                    $scope.item.ReferralName = patientdispensereturn.ReferralName;
                    $scope.item.RemarkId = patientdispensereturn.RemarkId;
                    $scope.item.Comments = patientdispensereturn.Comments;

                    $scope.item.ReturnedValue = patientdispensereturn.ReturnedValue;
                    $scope.item.ReceivedValue = patientdispensereturn.ReceivedValue;
                    $scope.item.TotalGrossAmount = patientdispensereturn.TotalGrossAmount;
                    $scope.item.DiscountModeId = patientdispensereturn.DiscountModeId;
                    $scope.item.DiscountValue = patientdispensereturn.DiscountValue;
                    $scope.item.DiscountAmount = patientdispensereturn.DiscountAmount;
                    $scope.item.TotalGstAmount = patientdispensereturn.TotalGstAmount;
                    $scope.item.TotalInGstAmount = patientdispensereturn.TotalInGstAmount;
                    $scope.item.TotalCGstAmount = patientdispensereturn.TotalCGstAmount;
                    $scope.item.TotalSGstAmount = patientdispensereturn.TotalSGstAmount;
                    $scope.item.TotalNetAmountBeforeGst = patientdispensereturn.TotalNetAmountBeforeGst;
                    $scope.item.TotalNetAmount = patientdispensereturn.TotalNetAmount;

                    $scope.patientdispensereturnDetails = patientdispensereturn.PatientDispenseReturnDetails || [];
                    for (var idx in $scope.patientdispensereturnDetails) {
                        var dispensereturnitem = $scope.patientdispensereturnDetails[idx];
                        if (dispensereturnitem.ItemMasterId > 0) {
                            dispensereturnitem.UnitCostPrice = dispensereturnitem.Ucp;
                            dispensereturnitem.MrPrice = dispensereturnitem.Mrp;
                            if (dispensereturnitem.StockItem !== null) {
                                dispensereturnitem.TotalAvailableQuantity = dispensereturnitem.StockItem.Quantity;
                            } else {
                                dispensereturnitem.TotalAvailableQuantity = 0;
                            }
                            if (dispensereturnitem.StockSerialItem !== null) {
                                dispensereturnitem.QuantityBeforeReceive = dispensereturnitem.StockSerialItem.Quantity;
                            } else {
                                dispensereturnitem.QuantityBeforeReceive = 0;
                            }
                            dispensereturnitem.ReceivedQuantity = dispensereturnitem.AcceptedQuantity;
                            if ($scope.item.DispenseReturnStatusId == 2) {
                                dispensereturnitem.IsFullyReceived = true;
                            }
                        }
                    }

                    $scope.applyVisibilityRules();
                });
            }
        };

        $scope.previousReturns = function() {
            utl.Modal.open('app.patientpreviousreturns', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: $scope.item.EncounterId,
                    patientdispenseid: $scope.currentcontext.patientstockrequestid,
                    itemmasterid: 0
                },
                // confirmCallback: $scope.initLookup,
                // cancelCallback: $scope.initLookup
            });
        };

        $scope.patientprofiledetails = function() {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.patientreturndetails = function() {
            utl.Modal.open('app.patientreturnprofile', {
                params: {
                    prid: $scope.item.PatientStockReturnId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.getPatientReturnInfoById = function() {
            var SearchReturntId = $scope.currentcontext.id;
            if (SearchReturntId && SearchReturntId > 0) {
                var inputData = {
                    Params: [{
                            Key: 0,
                            Value: SearchReturntId
                        },
                        {
                            Key: 9,
                            Value: $scope.currentcontext.storemasterid
                        }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getReturnInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getReturnInfoCallback = function(scope, res, options, hasError) {
            $scope.PatientReturnInfo = res.Data || [];
            if ($scope.PatientReturnInfo && $scope.PatientReturnInfo.length > 0) {
                $scope.PatientReturnInfo.forEach(patientreturn => {
                    if (patientreturn.Patient) {
                        $scope.selectedPatient = patientreturn.Patient;
                        $scope.item.TitleId = patientreturn.Patient.TitleId;
                        $scope.item.GenderId = patientreturn.Patient.GenderId;
                        $scope.item.Age = patientreturn.Patient.Age;
                    }
                    if (patientreturn.PatientReturnStatusId == 4) {
                        $scope.canShowCompleteBtn = true;
                    } else if (patientreturn.PatientReturnStatusId == 2 || patientreturn.PatientReturnStatusId == 3) {
                        $scope.canShowRejectBtn = true;
                    }
                    $scope.item.PatientStockReturnId = patientreturn.Id;
                    $scope.item.PatientReturnNumber = patientreturn.PatientReturnNumber;
                    $scope.item.StoreMasterId = patientreturn.ToStoreId;
                    $scope.item.StoreName = '';
                    $scope.item.PatientId = patientreturn.PatientId;
                    $scope.item.PatientTypeId = patientreturn.PatientTypeId;
                    $scope.item.PatientMRN = patientreturn.PatientMRN;
                    $scope.item.PatientName = patientreturn.PatientName;
                    $scope.item.EncounterId = patientreturn.EncounterId;
                    $scope.item.EncounterTypeId = patientreturn.EncounterTypeId;
                    $scope.item.DoctorId = patientreturn.DoctorId;
                    $scope.item.DoctorName = patientreturn.DoctorName;
                    $scope.item.ReferralId = patientreturn.ReferralId;
                    $scope.item.ReferralName = patientreturn.ReferralName;
                    $scope.item.DepartmentId = patientreturn.DepartmentId;
                    $scope.item.GuarantorId = patientreturn.GuarantorId;
                    $scope.item.GuarantorTypeId = patientreturn.GuarantorTypeId;
                    $scope.item.GuarantorName = patientreturn.GuarantorName;
                    $scope.item.LocationId = patientreturn.LocationId;
                    $scope.item.WardId = patientreturn.WardId;
                    if (patientreturn.Encounter) {
                        $scope.item.CoPayPercent = patientreturn.Encounter.Guarantor.CoPayPercent;
                    }
                    $scope.item.WardName = '';
                    if (patientreturn.WardMaster) {
                        $scope.item.WardName = patientreturn.WardMaster.WardName;
                    }
                    $scope.item.RoomId = patientreturn.RoomId;
                    $scope.item.RoomName = '';
                    if (patientreturn.WardRoomMaster) {
                        $scope.item.RoomName = patientreturn.WardRoomMaster.RoomNo;
                    }
                    $scope.item.WardRoom = $scope.item.WardName + ' / ' + $scope.item.RoomName;
                    $scope.item.BedId = patientreturn.BedId;
                    if (patientreturn.ToStore) {
                        $scope.item.StoreTypeId = patientreturn.ToStore.StoreTypeId;
                        $scope.item.StoreSubTypeId = patientreturn.ToStore.StoreSubTypeId;
                        $scope.item.SequenceOptionId = patientreturn.ToStore.SequenceOptionId;
                    }
                    $scope.item.ToStoreId = patientreturn.ToStoreId;
                    $scope.item.FacilityId = patientreturn.FacilityId;

                    $scope.item.TotalGrossAmount = 0;
                    $scope.item.TotalGstAmount = 0;
                    $scope.item.TotalInGstAmount = 0;
                    $scope.item.TotalCGstAmount = 0;
                    $scope.item.TotalSGstAmount = 0;
                    $scope.item.TotalNetAmountBeforeGst = 0;
                    $scope.item.TotalNetAmount = 0;
                    $scope.item.DispensedValue = 0;

                    $scope.item.ReturnedBy = patientreturn.ReturnedBy;
                    $scope.item.ReturnedDate = patientreturn.ReturnedDate;
                    $scope.item.ApprovedBy = patientreturn.ApprovedBy;
                    $scope.item.ApprovedDate = patientreturn.ApprovedDate;
                    $scope.item.AuthorizedBy = patientreturn.AuthorizedBy;
                    $scope.item.AuthorizedDate = patientreturn.AuthorizedDate;

                    $scope.patientstockreturnDetails = patientreturn.PatientStockReturnDetails || [];
                    var patientdispensereturnDetail = {};
                    for (var psridx in $scope.patientstockreturnDetails) {
                        var psritem = $scope.patientstockreturnDetails[psridx];
                        if (psritem.ItemMasterId > 0) {
                            if (psritem.ItemMaster.SubCategoryId == 1) {
                                psritem.SubCategoryId = 1;
                                psritem.ServiceTypeId = 0;
                                psritem.ServiceGroupId = $scope.DrugServiceGroupId;
                                psritem.ServiceCategoryId = $scope.DrugServiceCategoryId;
                                psritem.MasterName = psritem.ItemMaster.DrugName;
                                psritem.MasterItemId = psritem.ItemMaster.DrugId;
                                psritem.DrugName = psritem.ItemMaster.DrugName;
                                psritem.DrugId = psritem.ItemMaster.DrugId;
                                psritem.MasterTypeId = psritem.ItemMaster.SubCategoryId;
                            } else if (psritem.ItemMaster.SubCategoryId == 2) {
                                psritem.SubCategoryId = 2;
                                psritem.ServiceTypeId = 0;
                                psritem.ServiceGroupId = $scope.NonDrugServiceGroupId;
                                psritem.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                                psritem.MasterName = psritem.ItemMaster.DrugName;
                                psritem.MasterItemId = psritem.ItemMaster.DrugId;
                                psritem.DrugName = psritem.ItemMaster.DrugName;
                                psritem.DrugId = psritem.ItemMaster.DrugId;
                                psritem.MasterTypeId = psritem.ItemMaster.SubCategoryId;
                            } else {
                                psritem.SubCategoryId = 0;
                                psritem.ServiceTypeId = 0;
                                psritem.ServiceGroupId = 0;
                                psritem.ServiceCategoryId = 0;
                                psritem.MasterName = '';
                                psritem.MasterItemId = 0;
                                psritem.DrugName = 0;
                                psritem.DrugId = 0;
                                psritem.MasterTypeId = 0;
                            }
                            if (psritem.ItemMaster.ScheduleType) {
                                psritem.ScheduleTypeDescription = psritem.ItemMaster.ScheduleType.Description;
                            }
                            if (psritem.StockItem !== null) {
                                psritem.TotalAvailableQuantity = psritem.StockItem.Quantity;
                            }
                            if (psritem.StockSerialItem !== null) {
                                psritem.QuantityBeforeReceive = psritem.StockSerialItem.Quantity;
                            }
                            patientdispensereturnDetail = {
                                Id: 0,
                                PatientStockReturnDetailId: psritem.Id,
                                ItemMasterId: psritem.ItemMasterId,
                                ItemCode: psritem.ItemCode,
                                ItemName: psritem.ItemName,
                                IsSupplementary: psritem.IsSupplementary,
                                CategoryId: psritem.ItemMaster.CategoryId,
                                SubCategoryId: psritem.ItemMaster.SubCategoryId,
                                ProductTypeId: psritem.ItemMaster.ProductTypeId,
                                SubProductTypeId: psritem.ItemMaster.SubProductTypeId,
                                ServiceTypeId: psritem.ServiceTypeId,
                                ServiceGroupId: psritem.ServiceGroupId,
                                ServiceCategoryId: psritem.ServiceCategoryId,
                                MasterName: psritem.MasterName,
                                MasterItemId: psritem.MasterItemId,
                                DrugName: psritem.DrugName,
                                DrugId: psritem.DrugId,
                                MasterTypeId: psritem.MasterTypeId,
                                GenericId: psritem.ItemMaster.GenericId,
                                GenericName: psritem.ItemMaster.GenericName,
                                ManufacturerId: psritem.ItemMaster.ManufacturerId,
                                ManufacturerName: psritem.ItemMaster.ManufacturerName,
                                ScheduleTypeId: psritem.ItemMaster.ScheduleTypeId,
                                ScheduleTypeDescription: psritem.ScheduleTypeDescription,
                                BaseUomId: psritem.ItemMaster.BaseUomId,
                                SaleUomId: psritem.ItemMaster.SaleUomId,
                                ReturnedQuantity: psritem.ReturnQuantity,
                                ReturnQuantity: psritem.ReturnQuantity,
                                ReceivedQuantity: psritem.ReceivedQuantity,
                                AcceptedQuantity: psritem.ReturnQuantity - psritem.ReceivedQuantity,
                                QuantityBeforeReceive: psritem.QuantityBeforeReceive,
                                StockItemId: psritem.StockItemId,
                                StockSerialItemId: psritem.StockSerialItemId,
                                BatchId: psritem.BatchId,
                                ExpiryDate: psritem.ExpiryDate,
                                PurchasePrice: psritem.Ucp,
                                UnitCostPrice: psritem.Ucp,
                                Ucp: psritem.Ucp,
                                MrPrice: psritem.Mrp,
                                Mrp: psritem.Mrp,
                                Amount: 0,
                                GrossAmount: 0,
                                DiscountModeId: 2,
                                DiscountValue: 0,
                                DiscountAmount: 0,
                                DoctorDiscountAmount: 0,
                                GstId: psritem.GstId,
                                GstPercentage: psritem.GstPercentage,
                                UnitGstAmount: 0,
                                GstAmount: 0,
                                InGstId: psritem.InGstId,
                                InGstPercentage: psritem.InGstPercentage,
                                UnitInGstAmount: 0,
                                InGstAmount: 0,
                                CGstId: psritem.CGstId,
                                CGstPercentage: psritem.CGstPercentage,
                                UnitCGstAmount: 0,
                                CGstAmount: 0,
                                SGstId: psritem.SGstId,
                                SGstPercentage: psritem.SGstPercentage,
                                UnitSGstAmount: 0,
                                SGstAmount: 0,
                                NetAmountBeforeGst: 0,
                                NetAmount: 0,
                                TotalAvailableQuantity: psritem.TotalAvailableQuantity,
                                BatchQuantity: 0,
                                EncounterId: $scope.item.EncounterId,
                                PatientBillStatusId: 3,
                                GSTId: psritem.GstId,
                                GSTPercentage: psritem.GstPercentage,
                                UnitGSTAmount: 0,
                                GSTAmount: 0,
                                NetAmountBeforeGST: 0,
                                IsPharmacyReturn: 1,
                                PharmacyReturnTypeId: 2,
                                BillDateTime: null,
                                ServiceId: psritem.ItemMasterId,
                                ServiceCode: psritem.ItemCode,
                                ServiceName: psritem.ItemName,
                                Quantity: psritem.ReturnQuantity - psritem.ReceivedQuantity,
                                Rate: psritem.Mrp,
                                IsPharmacyCredit: 1,
                                Status: 1
                            };

                            patientdispensereturnDetail.Amount = parseFloat((patientdispensereturnDetail.MrPrice * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.GrossAmount = parseFloat((patientdispensereturnDetail.MrPrice * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.UnitPrice = parseFloat(((patientdispensereturnDetail.MrPrice * 100) / (100 + patientdispensereturnDetail.GstPercentage)).toFixed(2));
                            patientdispensereturnDetail.UnitGSTAmount = parseFloat(((patientdispensereturnDetail.UnitPrice / 100) * patientdispensereturnDetail.GstPercentage).toFixed(2));
                            patientdispensereturnDetail.UnitGstAmount = parseFloat(((patientdispensereturnDetail.UnitPrice / 100) * patientdispensereturnDetail.GstPercentage).toFixed(2));
                            patientdispensereturnDetail.UnitInGstAmount = parseFloat(((patientdispensereturnDetail.UnitPrice / 100) * patientdispensereturnDetail.InGstPercentage).toFixed(2));
                            patientdispensereturnDetail.UnitCGstAmount = parseFloat(((patientdispensereturnDetail.UnitPrice / 100) * patientdispensereturnDetail.CGstPercentage).toFixed(2));
                            patientdispensereturnDetail.UnitSGstAmount = parseFloat(((patientdispensereturnDetail.UnitPrice / 100) * patientdispensereturnDetail.SGstPercentage).toFixed(2));
                            patientdispensereturnDetail.GSTAmount = parseFloat((patientdispensereturnDetail.UnitGstAmount * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.GstAmount = parseFloat((patientdispensereturnDetail.UnitGstAmount * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.InGstAmount = parseFloat((patientdispensereturnDetail.UnitInGstAmount * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.CGstAmount = parseFloat((patientdispensereturnDetail.UnitCGstAmount * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.SGstAmount = parseFloat((patientdispensereturnDetail.UnitSGstAmount * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.NetAmount = parseFloat((patientdispensereturnDetail.MrPrice * patientdispensereturnDetail.AcceptedQuantity).toFixed(2));
                            patientdispensereturnDetail.NetAmountBeforeGST = parseFloat((patientdispensereturnDetail.NetAmount - patientdispensereturnDetail.GstAmount).toFixed(2));
                            patientdispensereturnDetail.NetAmountBeforeGst = parseFloat((patientdispensereturnDetail.NetAmount - patientdispensereturnDetail.GstAmount).toFixed(2));
                            patientdispensereturnDetail.PatNetAmount = parseFloat(patientdispensereturnDetail.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                            patientdispensereturnDetail.InsNetAmount = parseFloat(patientdispensereturnDetail.NetAmount) - parseFloat(patientdispensereturnDetail.PatNetAmount);
                            if (patientdispensereturnDetail.IsSupplementary == true) {
                                patientdispensereturnDetail.PatNetAmount = patientdispensereturnDetail.NetAmount;
                                patientdispensereturnDetail.InsNetAmount = parseFloat(patientdispensereturnDetail.NetAmount || 0) - parseFloat(patientdispensereturnDetail.PatNetAmount || 0);
                            }
                            $scope.patientdispensereturnDetails.push(patientdispensereturnDetail);
                        }
                    }

                    $scope.TotalGrossAmount = 0;
                    $scope.TotalGstAmount = 0;
                    $scope.TotalInGstAmount = 0;
                    $scope.TotalCGstAmount = 0;
                    $scope.TotalSGstAmount = 0;
                    $scope.TotalNetAmountBeforeGst = 0;
                    $scope.TotalNetAmount = 0;
                    $scope.ReceivedValue = 0;

                    calculatetotalAmount();
                    $scope.applyVisibilityRules();
                });
            }
        };

        $scope.computeAmount = function(item) {
            if (item.AcceptedQuantity === null) {
                item.Quantity = 0;
                item.Amount = 0;
                item.GrossAmount = 0;
                item.GSTAmount = 0;
                item.GstAmount = 0;
                item.InGstAmount = 0;
                item.CGstAmount = 0;
                item.SGstAmount = 0;
                item.NetAmount = 0;
                item.NetAmountBeforeGST = 0;
                item.NetAmountBeforeGst = 0;

                if (item.SubCategoryId == 1) {
                    item.ServiceGroupId = $scope.DrugServiceGroupId;
                    item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                } else if (item.SubCategoryId == 2) {
                    item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                    item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                } else {
                    item.ServiceGroupId = 0;
                    item.ServiceCategoryId = 0;
                }

                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.emptyqty.lbl'));

                return false;
            } else if (item.AcceptedQuantity === 0) {
                item.Quantity = 0;
                item.Amount = 0;
                item.GrossAmount = 0;
                item.GSTAmount = 0;
                item.GstAmount = 0;
                item.InGstAmount = 0;
                item.CGstAmount = 0;
                item.SGstAmount = 0;
                item.NetAmount = 0;
                item.NetAmountBeforeGST = 0;
                item.NetAmountBeforeGst = 0;

                if (item.SubCategoryId == 1) {
                    item.ServiceGroupId = $scope.DrugServiceGroupId;
                    item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                } else if (item.SubCategoryId == 2) {
                    item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                    item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                } else {
                    item.ServiceGroupId = 0;
                    item.ServiceCategoryId = 0;
                }
            } else {
                if (item.AcceptedQuantity > (item.ReturnedQuantity - item.ReceivedQuantity)) {
                    item.AcceptedQuantity = 0;
                    item.Quantity = 0;
                    item.Amount = 0;
                    item.GrossAmount = 0;
                    item.GSTAmount = 0;
                    item.GstAmount = 0;
                    item.InGstAmount = 0;
                    item.CGstAmount = 0;
                    item.SGstAmount = 0;
                    item.NetAmount = 0;
                    item.NetAmountBeforeGST = 0;
                    item.NetAmountBeforeGst = 0;

                    if (item.SubCategoryId == 1) {
                        item.ServiceGroupId = $scope.DrugServiceGroupId;
                        item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    } else if (item.SubCategoryId == 2) {
                        item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                        item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                    } else {
                        item.ServiceGroupId = 0;
                        item.ServiceCategoryId = 0;
                    }

                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.acceptingqty.lbl'));

                    return false;
                } else {
                    item.GrossAmount = item.MrPrice * item.AcceptedQuantity;
                    item.NetAmount = item.MrPrice * item.AcceptedQuantity;
                    item.Quantity = item.AcceptedQuantity;
                    item.TransitQuantity = item.AcceptedQuantity;

                    if (item.SubCategoryId == 1) {
                        item.ServiceGroupId = $scope.DrugServiceGroupId;
                        item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    } else if (item.SubCategoryId == 2) {
                        item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                        item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                    } else {
                        item.ServiceGroupId = 0;
                        item.ServiceCategoryId = 0;
                    }

                    item.Amount = parseFloat((item.MrPrice * item.AcceptedQuantity).toFixed(2));
                    item.GrossAmount = parseFloat((item.MrPrice * item.AcceptedQuantity).toFixed(2));
                    item.GSTAmount = parseFloat((item.UnitGstAmount * item.AcceptedQuantity).toFixed(2));
                    item.GstAmount = parseFloat((item.UnitGstAmount * item.AcceptedQuantity).toFixed(2));
                    item.InGstAmount = parseFloat((item.UnitInGstAmount * item.AcceptedQuantity).toFixed(2));
                    item.CGstAmount = parseFloat((item.UnitCGstAmount * item.AcceptedQuantity).toFixed(2));
                    item.SGstAmount = parseFloat((item.UnitSGstAmount * item.AcceptedQuantity).toFixed(2));
                    item.NetAmount = parseFloat((item.MrPrice * item.AcceptedQuantity).toFixed(2));
                    item.NetAmountBeforeGST = parseFloat((item.NetAmount - item.GstAmount).toFixed(2));
                    item.NetAmountBeforeGst = parseFloat((item.NetAmount - item.GstAmount).toFixed(2));
                    item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                    item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;
            $scope.ReceivedValue = 0;
            $scope.NetPatientAmt = 0;
            $scope.NetInsuranceAmt = 0;
            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.patientdispensereturnDetails) {
                var activeitem = $scope.patientdispensereturnDetails[idx];
                if (activeitem.ItemMasterId > 0 && activeitem.AcceptedQuantity > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeitem.GrossAmount).toFixed(4));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + activeitem.GstAmount).toFixed(4));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + activeitem.InGstAmount).toFixed(4));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + activeitem.CGstAmount).toFixed(4));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + activeitem.SGstAmount).toFixed(4));
                    $scope.TotalNetAmountBeforeGst = parseFloat(($scope.TotalNetAmountBeforeGst + activeitem.NetAmountBeforeGst).toFixed(4));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + activeitem.NetAmount).toFixed(4));
                    $scope.ReceivedValue = parseFloat(($scope.ReceivedValue + activeitem.NetAmount).toFixed(4));
                    $scope.NetPatientAmt = parseFloat(($scope.NetPatientAmt + activeitem.PatNetAmount).toFixed(4));
                    $scope.NetInsuranceAmt = parseFloat(($scope.NetInsuranceAmt + activeitem.InsNetAmount).toFixed(4));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmountBeforeGst = $scope.TotalNetAmountBeforeGst;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.ReceivedValue = $scope.ReceivedValue;
            $scope.item.NetPatientAmount = $scope.NetPatientAmt;
            $scope.item.NetInsuranceAmount = $scope.NetInsuranceAmt;
        }

        $scope.Reject = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you sure! you want to reject this?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onRejectConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onRejectConfirmed = function() {
            $scope.rejectPatientReturn();
        };

        $scope.rejectPatientReturn = function() {
            var actionName = 'IPManagement/PatientStockReturns/RejectPatientStockReturns';
            $scope.currentreturn.Id = $scope.item.PatientStockReturnId;
            $scope.currentreturn.PatientReturnStatusId = 6;
            var lines = null;
            var inputData = {
                Header: $scope.currentreturn,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.rejectPatientReturnCallback
            };
            utl.Http.doAction(options);
        };

        $scope.rejectPatientReturnCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.SaveandDraft = function() {
            $scope.item.DispenseReturnStatusId = 1;
            $scope.saveItem();
        };

        $scope.Receive = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you sure! you want to receive this?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onReceiveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onReceiveConfirmed = function() {
            $scope.item.DispenseReturnStatusId = 2;
            $scope.item.ReturnReceivedBy = utl.Session.getCurrentUserId();
            $scope.item.DispenseReturnDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function() {
            $scope.item.DispenseReturnStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function() {
            $scope.item.DispenseReturnStatusId = 4;
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function() {
            $scope.item.DispenseReturnStatusId = 3;
            $scope.saveItem();
        };

        $scope.CancelReceive = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.patientdispense-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.Complete = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.returnreceive-form.completemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCompleteConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCompleteConfirmed = function() {
            $scope.completePatientReturn();
        };

        $scope.completePatientReturn = function() {
            var actionName = 'IPManagement/PatientStockReturns/CompletePatientStockReturn';
            $scope.currentrequest.Id = $scope.currentcontext.id;
            $scope.currentrequest.PatientReturnStatusId = 5;
            var lines = getLinesForSave();
            var inputData = {
                Header: $scope.currentrequest,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.completePatientReturnCallback
            };
            utl.Http.doAction(options);
        };

        $scope.completePatientReturnCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
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

                        $scope.patientdispensereturnDetails.forEach(function (elem, index, array) {
                            if (elem.ItemMasterId === itemid) {
                                $scope.patientdispensereturnDetails[index].removeEntry = true;
                            } else {
                                $scope.patientdispensereturnDetails[index].removeEntry = false;
                            }
                            // return indexesOf12
                        });
                        // console.log(find_index);
                        // if (find_index != -1) {
                        //     $scope.PatientBillDetails[find_index].removeEntry = true;
                        // }
                    }
                    console.log($scope.patientdispensereturnDetails); //return;
                } else if (message.includes('Stock Already Transfered') == true) {
                    $scope.backToList();
                } else {
                    console.log(message);
                }
            }
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var AtLeatOneItem = 0;
            var PatientReturnStatusCheck = 0;
            var PatientReturnedQtyCheck = 0;
            var PatientReturnedItemName = null;
            for (var pretidx in $scope.patientstockreturnDetails) {
                var pretitem = $scope.patientstockreturnDetails[pretidx];
                var BalanceOfReturnedQty = pretitem.ReturnQuantity - pretitem.ReceivedQuantity;
                if (BalanceOfReturnedQty < 0)
                    BalanceOfReturnedQty = 0;
                var DispRetQty = 0;
                for (var dispretidx in $scope.patientdispensereturnDetails) {
                    var dispretitem = $scope.patientdispensereturnDetails[dispretidx];
                    if (dispretitem.ItemMasterId > 0 && dispretitem.Status == 1) {
                        if (dispretitem.AcceptedQuantity > 0) {
                            AtLeatOneItem = 1;
                        }
                    }
                    if (dispretitem.ItemMasterId > 0 && dispretitem.Status == 1 && dispretitem.ItemMasterId == pretitem.ItemMasterId) {
                        DispRetQty = DispRetQty + dispretitem.AcceptedQuantity;
                    }
                }

                if (BalanceOfReturnedQty > DispRetQty) {
                    PatientReturnStatusCheck = 1;
                }

                if (BalanceOfReturnedQty < DispRetQty) {
                    PatientReturnedQtyCheck = 1;
                    PatientReturnedItemName = pretitem.ItemName;
                    break;
                } else {
                    continue;
                }
            }

            if (AtLeatOneItem === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.quantity.lbl'));

                return false;
            }

            if (PatientReturnStatusCheck === 1) {
                $scope.item.PatientReturnStatusId = 4;
            } else {
                $scope.item.PatientReturnStatusId = 5;
            }

            // if (PatientReturnedQtyCheck === 1) {
            //     utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.receivingqty.lbl') + PatientReturnedItemName);

            //     return false;
            // }

            var lines = getLinesForSave();

            var actionName = 'billing/patientdispensereturn/AddPatientDispenseReturn';
            if ($scope.currentcontext.patientdispensereturnid && $scope.currentcontext.patientdispensereturnid > 0) {
                actionName = 'billing/patientdispensereturn/UpdatePatientDispenseReturn';
            }

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
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.patientdispensereturnDetails) {
                var item = $scope.patientdispensereturnDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1 && item.AcceptedQuantity > 0) {
                    item.StoreMasterId = $scope.item.StoreMasterId;
                    item.DepartmentId = $scope.item.DepartmentId;
                    item.FacilityId = $scope.item.FacilityId;
                    item.OrganizationId = 1;
                    item.DoctorId = $scope.item.DoctorId;
                    item.DoctorName = $scope.item.DoctorName;

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

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.patientdispensereturnid = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.patientdispensereturnid = data;
            }

            $scope.getPatientDispenseReturnInfoById();
        };

        $scope.backToList = function() {
            $state.go('app.returnworklisttab.returnworklists', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientReturnInfoById();
            }
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                    $scope.item.StoreSubTypeId = value[0].StoreMaster.StoreSubTypeId;
                    $scope.item.SequenceOptionId = value[0].StoreMaster.SequenceOptionId;
                    $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                    $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                }
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'DRUG') {
                            $scope.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'NONDRUG') {
                            $scope.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });
            loadData();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "DispenseReturnStatus"
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

        $scope.getLookUp = function(inputData) {
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

    ReturnReceiveFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();