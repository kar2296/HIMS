(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('medicineReturnController', medicineReturnController);

    function medicineReturnController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientAdmissionStatusId: 0,
            PatientAdmissionStatus: '',
            PatientReturnPriorityId: 1,
            PatientReturnTypeId: 1,
            ToStoreId: 1,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            TotalGrossAmount: 0,
            Comments: null,
            CanDisableHeader: false,
            DisableComments: false,
            RBDisabled: true,
            IsBillLock: false,
            IsPicked: 1,
            WardRoom: ''
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.EncounterId = parseInt($stateParams.eid);
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.PatientStockReturnDetails = [];
        $scope.selectedPatient = {};
        $scope.lookup = {};

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
            // $scope.item.FacilityId = $scope.selectedPatient.FacilityId;

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
                    $scope.item.LocationId = $scope.encounter.LocationId;
                    $scope.item.WardId = $scope.encounter.WardId;
                    $scope.item.RoomId = $scope.encounter.RoomId;
                    $scope.item.BedId = $scope.encounter.BedId;

                    if ($scope.encounter.WardMaster) {
                        $scope.item.WardRoom = $scope.encounter.WardMaster.WardName;
                    }
                    if ($scope.encounter.WardRoomMaster) {
                        $scope.item.WardRoom += ' / ' + $scope.encounter.WardRoomMaster.RoomNo;
                    }
                    if ($scope.encounter.WardRoomBedMaster) {
                        $scope.item.WardRoom += ' / ' + $scope.encounter.WardRoomBedMaster.BedNo;
                    }

                    $scope.item.IsEncounter = true;
                    utl.Alert.showErrorMsg('Patient is either Financially (or) Physically Discharged');
                } else {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.LocationId = $scope.encounter.LocationId;
                    $scope.item.WardId = $scope.encounter.WardId;
                    $scope.item.RoomId = $scope.encounter.RoomId;
                    $scope.item.BedId = $scope.encounter.BedId;

                    if ($scope.encounter.WardMaster) {
                        $scope.item.WardRoom = $scope.encounter.WardMaster.WardName;
                    }
                    if ($scope.encounter.WardRoomMaster) {
                        $scope.item.WardRoom += ' / ' + $scope.encounter.WardRoomMaster.RoomNo;
                    }
                    if ($scope.encounter.WardRoomBedMaster) {
                        $scope.item.WardRoom += ' / ' + $scope.encounter.WardRoomBedMaster.BedNo;
                    }
                    if ($scope.encounter.WardMaster) {
                        $scope.item.ToStoreId = $scope.encounter.WardMaster.StoreMasterId;
                    }
                    $scope.item.IsEncounter = true;
                    if ($scope.encounter.IsBillLock) {
                        $scope.item.IsBillLock = true;
                        utl.Alert.showErrorMsg('Patient is Under Lock Mode. Contact Billing Department');
                    }
                }
            } else {
                utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
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

        $scope.openPreviousReturns = function () {
            utl.Modal.open('app.peviousreturndetails', {
                params: {
                    storemasterid: $scope.item.ToStoreId,
                    // itemmasterid: $scope.item.ItemMasterId,
                    patientid: $scope.item.PatientId,
                    encounterid: $scope.item.EncounterId,
                    // patientmrn: item.PatientMRN,
                    // patientname: item.PatientName,
                },
            });
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
            utl.Modal.open('app.patientattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
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
                })
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..')
            }
        };

        $scope.deletePatientReturnDetail = function (idx, item) {
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.backToList = function () {
            $state.go('patientemr.medicinereturns');
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

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientreturn.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.PatientReturnStatusId = 1;
            $scope.item.ReturnedBy = utl.Session.getCurrentUserId();
            $scope.item.PatientReturnDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem();
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

        $scope.SaveandAuthorize = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientreturn.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.PatientReturnStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.CancelReturn = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientreturn.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.PatientReturnStatusId = 5;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.PatientReturnStatusId = 4;
            $scope.item.CompletedBy = utl.Session.getCurrentUserId();
            $scope.item.CompletedDate = utl.Formatter.getCurrentDate();
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
                utl.Alert.showErrorMsg('Please Select Atleast One Item');
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
                    utl.Alert.showErrorMsg('Please Select Atleast One Item');
                    return false;
                }
            }

            var lines = getLinesForSave();

            var actionName = 'IPManagement/PatientStockReturns/AddPatientStockReturns';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/PatientStockReturns/UpdatePatientStockReturns';
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
                $scope.currentcontext.id = options.data.Data.Header.Id;
                $scope.getPatientReturnInfoById();
            } else {
                $scope.currentcontext.id = data;
                $scope.getPatientReturnInfoById();
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

        function loadData() {
            $scope.applyVisibilityRules();
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientReturnInfoById();
            } else {
                $scope.patientChange();
            }
        }

        $scope.openDispensedList = function (idx, item) {
            utl.Modal.open('app.emrpick-from-dispenselist', {
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
                        ReturnQuantity: parseInt(SelectedReturn.ReturnQuantity),
                        ReturnedQuantity: SelectedReturn.ReturnedQuantity,
                        BilledQuantity: SelectedReturn.Quantity,
                        ReceivedQuantity: 0,
                        StockItemId: SelectedReturn.StockItemId,
                        StockSerialItemId: SelectedReturn.StockSerialItemId,
                        BatchId: SelectedReturn.BatchId,
                        ExpiryDate: SelectedReturn.ExpiryDate,
                        Ucp: SelectedReturn.Rate,
                        Mrp: SelectedReturn.Rate,
                        GstId: SelectedReturn.GSTId,
                        GstPercentage: SelectedReturn.GSTPercentage,
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
                        GrossAmount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        NetAmount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
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
                    utl.Alert.showErrorMsg('Return Qty should not Greater Than Actual Billed Qty');
                    item.ReturnQuantity = 0;
                } else {
                    item.GstAmount = item.UnitGstAmount * item.ReturnQuantity;
                    item.InGstAmount = item.UnitInGstAmount * item.ReturnQuantity;
                    item.CGstAmount = item.UnitCGstAmount * item.ReturnQuantity;
                    item.SGstAmount = item.UnitSGstAmount * item.ReturnQuantity;

                    item.GrossAmount = item.Mrp * item.ReturnQuantity;
                    item.NetAmount = item.Mrp * item.ReturnQuantity;
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
                utl.Alert.showErrorMsg('Quantity should not exceed than Avail Qty');
                item.Quantity = 0;
            } else if (item.Quantity === null) {} else {
                item.Rate = item.MrPrice;
                item.Amount = item.Quantity * item.Rate;
                item.GSTAmount = item.UnitGSTAmount * item.Quantity;
                item.InGstAmount = item.UnitInGstAmount * item.Quantity;
                item.CGstAmount = item.UnitCGstAmount * item.Quantity;
                item.SGstAmount = item.UnitSGstAmount * item.Quantity;
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

        $scope.canShowPatientBanner = function () {
            if (this.item.PatientId > 0) {
                return true;
            }
            return false;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                // if (key == 'ToStore' && $scope.item.ToStoreId === 0) {
                //     $scope.item.ToStoreId = value[0].Id;
                // }
            });

            loadData();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'IPManagement/PatientReturn/PrintPatientReturn',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
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
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "PatientReturnPriority"
                },
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
                        Params: [
                            { Key: 2, Value: 1 },
                            { Key: 3, Value: 2 },
                            { Key: 7, Value: 2 },
                            { Key: 6, Value: utl.Session.getCurrentFacilityId() }
                        ]
                    },
                    Default: false
                }
            ];

            $scope.lookupCall(inputData);
        };

        $scope.initAllLookup();
    }

    medicineReturnController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();