(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReturnReceiveViewController', ReturnReceiveViewController);

    function ReturnReceiveViewController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreTypeId: 0,
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
            PatientReturnNumber: null,
            PatientStockReturnId: 0,
            ReturnedBy: 0,
            ReturnedDate: null,
            DisplayDispenseReturnStatus: null,
            ReadOnly: true,
            TitleId: 0,
            GenderId: 0,
            Age: 0,
            DrugServiceCategoryId: 0,
            DrugServiceGroupId: 0,
            NonDrugServiceCategoryId: 0,
            NonDrugServiceGroupId: 0
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

        $scope.openAttachments = function () {
            utl.Modal.open('app.dispensereturnattachments', {
                params: { patientdispensereturnid: 0, itemmasterid: 0 },
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

        $scope.canShowPrintBtn = true;
        $scope.canShowSaveBtn = true;
        $scope.canShowReceiveBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;
        $scope.canShowCompleteBtn = false;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.DispenseReturnStatusId != 1 || $scope.item.DispenseReturnStatusId != 2 || $scope.item.DispenseReturnStatusId != 3 || $scope.item.DispenseReturnStatusId != 4 || $scope.item.DispenseReturnStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowReceiveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
            }
            // When In Draft Status
            if ($scope.item.DispenseReturnStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowReceiveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
            }
            // When In Approved Status
            if ($scope.item.DispenseReturnStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowReceiveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.DispenseReturnStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowReceiveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Completed Status
            if ($scope.item.DispenseReturnStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowReceiveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.DispenseReturnStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowReceiveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.DispenseReturnStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowReceiveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
        };

        $scope.addNewLineItem = function () {
            var patientdispensereturnDetail = {
                Id: 0,
                PatientStockReturnDetailId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
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
                BatchDetail: { Id: 0, StockItemId: 0, ItemMasterId: 0, StoreMasterId: 0, BatchId: '', Quantity: 0, ExpiryDate: null, Ucp: 0, Mrp: 0, Rev: 0, SerialDetails: null },
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                Ucp: 0,
                Mrp: 0,
                IsFullyReceived: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                patientdispensereturnDetail.PatientDispenseReturnId = $scope.currentcontext.id;
            }
            $scope.patientdispensereturnDetails.push(patientdispensereturnDetail);
        };

        $scope.Clear = function () {
            $scope.patientdispensereturnDetails = [];
            $scope.addNewLineItem();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.patientdispensereturnid
            };
            var options = {
                action: 'billing/PatientDispenseReturn/PrintPatientDispenseReturn',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.dispensereturnhistory', {});
        };

        $scope.History = function (item, idx) {
            utl.Modal.open('app.patientreturnhistory', {
                params: {
                    storemasterid: $scope.item.StoreMasterId,
                    itemmasterid: item.ItemMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.Stock = function (selectedItem, idx) {
            utl.Modal.open('app.stockdetails', {
                params: { itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.getPatientDispenseReturnInfoById = function () {
            var SearchDispenseReturnId = $scope.currentcontext.patientdispensereturnid;
            if (SearchDispenseReturnId && SearchDispenseReturnId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchDispenseReturnId },
                        { Key: 6, Value: $scope.currentcontext.storemasterid }
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

        $scope.getDispenseReturnInfoCallback = function (scope, res, options, hasError) {
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
                        $scope.item.DisplayDispenseReturnStatus = 'Received';
                    } else if (patientdispensereturn.DispenseReturnStatusId == 3) {
                        $scope.item.ReadOnly = true;
                        $scope.item.isDisabled = true;
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

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.computeAmount = function (item) {
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
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.acceptingqty.lbl'));

                    return false;
                } else {
                    item.GrossAmount = item.MrPrice * item.AcceptedQuantity;
                    item.NetAmount = item.MrPrice * item.AcceptedQuantity;
                    item.Quantity = item.AcceptedQuantity;
                    item.TransitQuantity = item.AcceptedQuantity;

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
        }

        $scope.backToList = function () {
            $state.go('app.returnworklisttab.patientreturns', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientDispenseReturnInfoById();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
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
                { "Key": "DispenseReturnStatus" },
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

    ReturnReceiveViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();