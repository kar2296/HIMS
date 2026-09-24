(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientReturnController', PatientReturnController);

    function PatientReturnController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientAdmissionStatusId: 0,
            PatientAdmissionStatus: '',
            PatientReturnPriorityId: 1,
            PatientReturnTypeId: 1,
            ToStoreId: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            TotalGrossAmount: 0,
            Comments: null,
            CanDisableHeader: false,
            DisableComments: false,
            RBDisabled: true,
            IsBillLock: false,
            IsPicked: 1
        };

        $scope.currentcontext = {
            id: -1
        };

        $scope.PatientStockReturnDetails = [];
        $scope.selectedPatient = {};
        $scope.lookup = {};

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
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

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            $scope.encounter = [];
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.PatientAdmissionStatusId = $scope.encounter.AdmissionStatusId;
                if ($scope.encounter.AdmissionStatusId == 2) {
                    $scope.item.PatientAdmissionStatus = 'On Admission';
                } else if ($scope.encounter.AdmissionStatusId == 3) {
                    $scope.item.PatientAdmissionStatus = 'Fit For Discharge';
                } else if ($scope.encounter.AdmissionStatusId == 4) {
                    $scope.item.PatientAdmissionStatus = 'Clinically Discharged';
                } else if ($scope.encounter.AdmissionStatusId == 5) {
                    $scope.item.PatientAdmissionStatus = 'Financially Discharged';
                } else if ($scope.encounter.AdmissionStatusId == 6) {
                    $scope.item.PatientAdmissionStatus = 'Physically Discharged';
                }
                if ($scope.encounter.AdmissionStatusId > 4) {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.IsEncounter = true;
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.dischargemsg.lbl'));

                } else {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.IsEncounter = true;
                    if ($scope.encounter.IsBillLock) {
                        $scope.item.IsBillLock = true;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.lockmode.lbl'));

                    } else {
                    }
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientalert.lbl'));

            }
        };

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

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.PatientReturnStatusId != 1 || $scope.item.PatientReturnStatusId != 2 || $scope.item.PatientReturnStatusId != 3 || $scope.item.PatientReturnStatusId != 4 || $scope.item.PatientReturnStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowHistoryBtn = false;
            }
            // When In Draft Status
            if ($scope.item.PatientReturnStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = false;
            }
            //  When In Returned Status
            if ($scope.item.PatientReturnStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.PatientReturnStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Received Status
            if ($scope.item.PatientReturnStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.PatientReturnStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patientreturnattachments', {
                params: { pid: 0, itemid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.history', {});
        };

        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.PatientReturnHistory', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName,
                    },
                    confirmCallback: $scope.getList
                });
            }
        };

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.PatientReturnDetails', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    },
                }
                )
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.emptyrow.lbl'));

            }
        };

        $scope.deletePatientReturnDetail = function (idx, item) {
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientStockReturnDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientStockReturnDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }

            var PatientStockReturnDetail = {
                Id: 0,
                PatientStockRequestDetailId: 0,
                PatientBillDetailId: 0,
                PatientBillId: 0,
                ItemMasterId: -1,
                ItemCode: '',
                ItemName: '',
                IsSupplementary: false,
                BillNumber: '',
                ReturnQuantity: 0,
                ReturnedQuantity: 0,
                BilledQuantity: 0,
                ReceivedQuantity: 0,
                StockItemId: 0,
                StockSerialItemId: 0,
                BatchId: '',
                ExpiryDate: null,
                Ucp: 0,
                Mrp: 0,
                GstId: 0,
                GstPercentage: 0.00,
                GstAmount: 0.00,
                InGstId: 0,
                InGstPercentage: 0.00,
                InGstAmount: 0.00,
                CGstId: 0,
                CGstPercentage: 0.00,
                CGstAmount: 0.00,
                SGstId: 0,
                SGstPercentage: 0.00,
                SGstAmount: 0.00,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Comments: '',
                Status: 1,
                CanDisableDetails: false
            };

            if ($scope.currentcontext.id > 0) {
                PatientStockReturnDetail.PatientStockReturnId = $scope.currentcontext.id;
            }
            $scope.PatientStockReturnDetails.push(PatientStockReturnDetail);

            $scope.SelectedIndex = $scope.PatientStockReturnDetails.length;
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientreturn.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.PatientReturnStatusId == 1) {
                $scope.item.ReturnedBy = utl.Session.getCurrentUserId();
                $scope.item.PatientReturnDateTime = utl.Formatter.getCurrentDate();
            } else {
                $scope.item.ReturnedBy = utl.Session.getCurrentUserId();
                $scope.item.PatientReturnDateTime = utl.Formatter.getCurrentDate();
            }
            $scope.item.PatientReturnStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (!$scope.PatientStockReturnDetails || $scope.PatientStockReturnDetails.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

                return false;
            } else {
                var ItemCount = 0;
                var ItemCheck = 0;
                var ItemName = null;
                if ($scope.PatientStockReturnDetails.length === 1) {
                    for (var idx1 in $scope.PatientStockReturnDetails) {
                        var item1 = $scope.PatientStockReturnDetails[idx1];
                        if (item1 && item1.ItemMasterId < 0) {
                            ItemCount = 1;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && item1.ReturnQuantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    for (var idx in $scope.PatientStockReturnDetails) {
                        var item = $scope.PatientStockReturnDetails[idx];
                        if (item && item.ItemMasterId >= 0 && item.ReturnQuantity <= 0) {
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
            }

            var lines = getLinesForSave();

            var actionName = 'IPManagement/PatientStockReturns/AddPatientStockReturns';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/PatientStockReturns/UpdatePatientStockReturns';
            }

            var inputData = { Header: $scope.item, Details: lines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientStockReturnDetails) {
                var item = $scope.PatientStockReturnDetails[idx];
                item = $scope.PatientStockReturnDetails[idx];
                if (item.ItemMasterId > 0 && item.ReturnQuantity > 0) {
                    item.EncounterId = $scope.item.EncounterId;
                    item.ReturnStatusId = $scope.item.PatientReturnStatusId;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (data === true) {
                $state.go('app.returnworklisttab.returnworklists');
                /*
                $scope.currentcontext.id = options.data.Data.Header.Id;
                $scope.getPatientReturnInfoById();
                */
            } else {
                $state.go('app.returnworklisttab.returnworklists');
                /*
                $scope.currentcontext.id = data;
                $scope.getPatientReturnInfoById();
                */
            }

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.getPatientReturnInfoById = function () {
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

        $scope.getReturnInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientReturnInfo = res.Data || [];
            if ($scope.PatientReturnInfo && $scope.PatientReturnInfo.length > 0) {
                $scope.PatientReturnInfo.forEach(PatientReturn => {
                    $scope.item.Id = PatientReturn.Id;
                    $scope.item.PatientStockReturnId = PatientReturn.Id;
                    $scope.item.PatientReturnNumber = PatientReturn.PatientReturnNumber;
                    $scope.item.PatientReturnDateTime = PatientReturn.PatientReturnDateTime;
                    $scope.item.PatientReturnTypeId = PatientReturn.PatientReturnTypeId;
                    $scope.item.PatientReturnSubTypeId = PatientReturn.PatientReturnSubTypeId;
                    $scope.item.PatientReturnStatusId = PatientReturn.PatientReturnStatusId;
                    $scope.item.PatientReturnPriorityId = PatientReturn.PatientReturnPriorityId;

                    if ($scope.item.PatientReturnStatusId == 1) {
                        $scope.item.CanDisableHeader = false;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayReturnStatus = 'Draft';
                    }
                    if ($scope.item.PatientReturnStatusId == 2) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayReturnStatus = 'Approved';
                    }
                    if ($scope.item.PatientReturnStatusId == 3) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayReturnStatus = 'Authorized';
                    }
                    if ($scope.item.PatientReturnStatusId == 4) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayReturnStatus = 'Completed';
                    }
                    if ($scope.item.PatientReturnStatusId == 5) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayReturnStatus = 'Cancelled';
                    }

                    $scope.item.PatientId = PatientReturn.PatientId;
                    $scope.item.PatientTypeId = PatientReturn.PatientTypeId;
                    $scope.item.PatientMRN = PatientReturn.PatientMRN;
                    $scope.item.PatientName = PatientReturn.PatientName;
                    $scope.item.EncounterId = PatientReturn.EncounterId;
                    $scope.item.EncounterTypeId = PatientReturn.EncounterTypeId;
                    $scope.item.DoctorId = PatientReturn.DoctorId;
                    $scope.item.DoctorName = PatientReturn.DoctorName;
                    $scope.item.ReferralId = PatientReturn.ReferralId;
                    $scope.item.ReferralName = PatientReturn.ReferralName;
                    $scope.item.DepartmentId = PatientReturn.DepartmentId;
                    $scope.item.GuarantorId = PatientReturn.GuarantorId;
                    $scope.item.GuarantorTypeId = PatientReturn.GuarantorTypeId;
                    $scope.item.GuarantorName = PatientReturn.GuarantorName;
                    $scope.item.LocationId = PatientReturn.LocationId;
                    $scope.item.WardId = PatientReturn.WardId;
                    $scope.item.RoomId = PatientReturn.RoomId;
                    $scope.item.BedId = PatientReturn.BedId;
                    $scope.item.ToStoreId = PatientReturn.ToStoreId;
                    $scope.item.FacilityId = PatientReturn.FacilityId;
                    $scope.item.TotalGrossAmount = PatientReturn.TotalGrossAmount;
                    $scope.item.TotalNetAmount = PatientReturn.TotalNetAmount;

                    $scope.item.ReturnedBy = PatientReturn.ReturnedBy;
                    $scope.item.ReturnedDate = PatientReturn.ReturnedDate;
                    $scope.item.ApprovedBy = PatientReturn.ApprovedBy;
                    $scope.item.ApprovedDate = PatientReturn.ApprovedDate;
                    $scope.item.AuthorizedBy = PatientReturn.AuthorizedBy;
                    $scope.item.AuthorizedDate = PatientReturn.AuthorizedDate;

                    $scope.PatientStockReturnDetails = [];
                    $scope.PatientStockReturnDetails = PatientReturn.PatientStockReturnDetails;
                    for (var retidx in $scope.PatientStockReturnDetails) {
                        var retitem = $scope.PatientStockReturnDetails[retidx];
                        if (retitem.ItemMasterId > 0) {
                            if ($scope.item.PatientReturnStatusId == 1) {
                                retitem.CanDisableDetails = false;
                            } else {
                                retitem.CanDisableDetails = true;
                            }
                            if (retitem.PatientBillDetail) {
                                retitem.BilledQuantity = retitem.PatientBillDetail.Quantity;
                                retitem.ReturnedQuantity = retitem.PatientBillDetail.ReturnedQuantity;
                                if (retitem.PatientBillDetail.PatientBill) {
                                    retitem.BillNumber = retitem.PatientBillDetail.PatientBill.BillNumber;
                                }
                            }
                        }
                    }

                    $scope.applyVisibilityRules();
                });
            }
        };

        $scope.backToList = function () {
            $state.go('app.returnworklisttab.returnworklists');
        };

        function loadData() {
            $scope.applyVisibilityRules();
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientReturnInfoById();
            }
        }

        $scope.openDispensedList = function (idx, item) {
            utl.Modal.open('app.pick-from-dispenselist', {
                params: {
                    patientid: $scope.item.PatientId,
                    encounterid: $scope.item.EncounterId,
                    id: $scope.item.EncounterId
                },
                confirmCallback: loadSelectedList
            });
        };

        function loadSelectedList(selectedList) {
            $scope.item.IsPicked = selectedList.IsPicked;
            $scope.PatientStockReturnDetails = [];
            if (selectedList.ReturnData && selectedList.ReturnData.length > 0) {
                selectedList.ReturnData.forEach(SelectedReturn => {
                    var ReturnItemDetail = {
                        Id: 0,
                        PatientStockRequestDetailId: 0,
                        PatientBillDetailId: 0,
                        PatientBillId: 0,
                        ItemMasterId: SelectedReturn.ItemMasterId,
                        ItemCode: SelectedReturn.ItemCode,
                        ItemName: SelectedReturn.ItemName,
                        IsSupplementary: SelectedReturn.IsSupplementary,
                        ReturnQuantity: parseInt(SelectedReturn.ReturnQuantity),
                        ReturnedQuantity: parseInt(SelectedReturn.ReturnedQuantity),
                        BilledQuantity: parseInt(SelectedReturn.Quantity),
                        ReceivedQuantity: 0,
                        StockItemId: SelectedReturn.StockItemId,
                        StockSerialItemId: SelectedReturn.StockSerialItemId,
                        BatchId: SelectedReturn.BatchId,
                        ExpiryDate: SelectedReturn.ExpiryDate,
                        Ucp: Math.abs(parseFloat(SelectedReturn.Rate)),
                        Mrp: Math.abs(parseFloat(SelectedReturn.Rate)),
                        GstId: parseInt(SelectedReturn.GSTId),
                        GstPercentage: Math.abs(parseFloat(SelectedReturn.GSTPercentage)),
                        GstAmount: Math.abs(parseFloat(SelectedReturn.GSTAmount)),
                        InGstId: parseInt(SelectedReturn.InGstId),
                        InGstPercentage: Math.abs(parseFloat(SelectedReturn.InGstPercentage)),
                        InGstAmount: Math.abs(parseFloat(SelectedReturn.InGstAmount)),
                        CGstId: parseInt(SelectedReturn.CGstId),
                        CGstPercentage: Math.abs(parseFloat(SelectedReturn.CGstPercentage)),
                        CGstAmount: Math.abs(parseFloat(SelectedReturn.CGstAmount)),
                        SGstId: parseInt(SelectedReturn.SGstId),
                        SGstPercentage: Math.abs(parseFloat(SelectedReturn.SGstPercentage)),
                        SGstAmount: Math.abs(parseFloat(SelectedReturn.SGstAmount)),
                        GrossAmount: Math.abs(parseInt(SelectedReturn.ReturnQuantity) * parseFloat(SelectedReturn.Rate)),
                        NetAmount: Math.abs(parseInt(SelectedReturn.ReturnQuantity) * parseFloat(SelectedReturn.Rate)),
                        Comments: '',
                        Status: 1,
                        CanDisableDetails: false
                    }
                    $scope.item.TotalGrossAmount = $scope.item.TotalGrossAmount + ReturnItemDetail.GrossAmount;
                    $scope.item.TotalGstAmount = $scope.item.TotalGstAmount + ReturnItemDetail.GstAmount;
                    $scope.item.TotalInGstAmount = $scope.item.TotalInGstAmount + ReturnItemDetail.InGstAmount;
                    $scope.item.TotalCGstAmount = $scope.item.TotalCGstAmount + ReturnItemDetail.CGstAmount;
                    $scope.item.TotalSGstAmount = $scope.item.TotalSGstAmount + ReturnItemDetail.SGstAmount;
                    $scope.item.TotalNetAmount = $scope.item.TotalNetAmount + ReturnItemDetail.NetAmount;
                    $scope.PatientStockReturnDetails.push(ReturnItemDetail);
                });
            }
        }

        $scope.computeAmount = function (item) {
            if (item.ReturnQuantity > 0) {
                if (item.ReturnQuantity > (item.BilledQuantity - item.ReturnedQuantity)) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.returnquantity.lbl'));

                    item.ReturnQuantity = 0;
                } else {
                    item.GstAmount = Math.abs(item.UnitGstAmount) * item.ReturnQuantity;
                    item.InGstAmount = Math.abs(item.UnitInGstAmount) * item.ReturnQuantity;
                    item.CGstAmount = Math.abs(item.UnitCGstAmount) * item.ReturnQuantity;
                    item.SGstAmount = Math.abs(item.UnitSGstAmount) * item.ReturnQuantity;

                    item.GrossAmount = Math.abs(item.Mrp) * item.ReturnQuantity;
                    item.NetAmount = Math.abs(item.Mrp) * item.ReturnQuantity;
                }
            } else if (item.ReturnQuantity === null) {
                item.GstAmount = 0;
                item.InGstAmount = 0;
                item.CGstAmount = 0;
                item.SGstAmount = 0;

                item.GrossAmount = 0;
                item.NetAmount = 0;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        $scope.CalcualteAmt = function (item) {
            if (item.Quantity > item.BatchQuantity) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.availqty.lbl'));

                item.Quantity = 0;
            } else if (item.Quantity === null) { } else {
                item.Rate = Math.abs(item.MrPrice);
                item.Amount = item.Quantity * Math.abs(item.Rate);
                item.GSTAmount = Math.abs(item.UnitGSTAmount) * item.Quantity;
                item.InGstAmount = Math.abs(item.UnitInGstAmount) * item.Quantity;
                item.CGstAmount = Math.abs(item.UnitCGstAmount) * item.Quantity;
                item.SGstAmount = Math.abs(item.UnitSGstAmount) * item.Quantity;
                item.NetAmount = item.Amount;
                item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;

                $scope.CalculateNetAmt();
            }
        };

        function calculatetotalAmount() {
            for (var idx in $scope.PatientStockReturnDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.PatientStockReturnDetails[idx].GrossAmount).toFixed(2));

                if ($scope.TotalGstAmount === null) {
                    $scope.TotalGstAmount = 0;
                }
                $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + $scope.PatientStockReturnDetails[idx].GstAmount).toFixed(2));

                if ($scope.TotalNetAmount === null) {
                    $scope.TotalNetAmount = 0;
                }
                $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.PatientStockReturnDetails[idx].NetAmount).toFixed(2));

            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
        }

        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Title', field: 'Title', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Age/Gender', field: 'Age', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DOB', field: 'DOB', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'MRN', field: 'MRN', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Visit#', field: 'VisitIdentifier', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Ward/Room/Bed', field: 'WardDetail', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
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
            var strTitle = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.GuarantorTypeId = selectedItem.PatientGuarantor.GuarantorTypeId;
                $scope.item.GuarantorId = selectedItem.PatientGuarantor.GuarantorId;
                $scope.item.GuarantorName = selectedItem.PatientGuarantor.GuarantorName;
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DoctorName = selectedItem.DoctorName;
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                if (selectedItem.WardMaster) {
                    $scope.item.ToStoreId = selectedItem.WardMaster.StoreMasterId;
                }

                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.LocationId = selectedItem.LocationId;
                $scope.item.WardId = selectedItem.WardId;
                $scope.item.RoomId = selectedItem.RoomId;
                $scope.item.BedId = selectedItem.BedId;

                strTitle = selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            }

            $scope.patientChange();

            return result;
        }

        function presearchencounter() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 15, Value: 2 },
                    { Key: 37, Value: false },
                    { Key: 38, Value: 2 + "," + 3 + "," + 4 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 11, Value: query });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchencounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
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

        $scope.canShowPatientBanner = function () {
            if (this.item.PatientId > 0) {
                return true;
            }
            return false;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'ToStore' && $scope.item.ToStoreId === 0) {
                    $scope.item.ToStoreId = value[0].Id;
                }
            });

            loadData();
        };

        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initAllLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "Ward" },
                { "Key": "Room" },
                { "Key": "PatientReturnPriority" },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 10
                        }, {
                            Key: 5,
                            Value: 2
                        }],

                    }
                },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: 1
                        }]
                    },
                    Default: false
                }
            ];
            $scope.lookupCall(inputData);
            $scope.loadAdditionalLookup();
        };

        $scope.wardLookUp = function () {
            var inputData = [{
                "Key": "Ward",
                Request: {
                    Params: [{ Key: 2, Value: $scope.item.FacilityId || 0 },
                    { Key: 5, Value: $scope.item.LocationId || 0 }
                    ]
                }
            },];
            $scope.lookupCall(inputData);
            $scope.item.WardId = $scope.item.WardId || 0;
            $scope.item.RoomId = $scope.item.RoomId || 0;
            $scope.item.BedId = $scope.item.BedId || 0;
        };

        $scope.getRoomLookUp = function () {
            var inputData = [{
                "Key": "Room",
                Request: {
                    Params: [
                        { Key: 2, Value: $scope.item.WardId || 0 }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
        };

        $scope.getBedLookUp = function () {
            var inputData = [{
                "Key": "Bed",
                Request: {
                    Params: [
                        { Key: 1, Value: $scope.item.WardId || 0 },
                        { Key: 2, Value: $scope.item.RoomId || 0 }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
        };

        $scope.loadAdditionalLookup = function () {
            $scope.wardLookUp();
            $scope.getRoomLookUp();
            $scope.getBedLookUp();
        };

        $scope.initAllLookup();
    }

    PatientReturnController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();