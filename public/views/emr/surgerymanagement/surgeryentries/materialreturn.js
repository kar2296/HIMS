(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('materialReturnFormController', materialReturnFormController);

    function materialReturnFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.context = 'main';

        $scope.item = {
            PatientStockReturnId: 0,
            PatientReturnNumber: null,
            DispenseReturnNumber: null,
            DispenseReturnDateTime: utl.Formatter.getCurrentDate(),
            DispenseReturnTypeId: 2,
            ReturnReceivedBy: 0,
            ReturnedValue: 0,
            ReceivedValue: 0,
            ReceivedCounterId: 0,
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
            DispenseReturnStatusId: 1,
            OrganizationId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: 0,
            StoreMasterId: 0,
            PatientId: 0,
            PatientMRN: null,
            PatientName: null,
            PatientTypeId: 0,
            EncounterId: 0,
            EncounterTypeId: 0,
            OTRegisterId: 0,
            OTIdentifier: null,
            LocationId: 0,
            WardId: 0,
            RoomId: 0,
            BedId: 0,
            OTRoomId: 0,
            EncounterGuarantorId: 0,
            GuarantorId: 0,
            GuarantorTypeId: 0,
            GuarantorName: null,
            DoctorId: 0,
            DoctorName: null,
            ReferralId: 0,
            ReferralName: null,
            RemarkId: 0,
            Comments: null,
            CanDisableHeader: false,
            CanDisableDetail: false,
            CanDisableFooter: false,
            IsBillLock: false,
            IsPicked: 1
        };

        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        $scope.currentcontext = {
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

        $scope.PatientStockReturnDetails = [];
        $scope.selectedPatient = {};
        $scope.lookup = {};

        $scope.DrugServiceCategoryId = 0;
        $scope.DrugServiceGroupId = 0;
        $scope.NonDrugServiceCategoryId = 0;
        $scope.NonDrugServiceGroupId = 0;

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
            $scope.item.PatientMRN = $scope.selectedPatient.MRN;
            $scope.item.PatientTypeId = $scope.selectedPatient.PatientTypeId;
            $scope.item.FacilityId = $scope.selectedPatient.FacilityId;

            if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                var encounter = $scope.selectedPatient.Encounters[0] || {};
                var encGuarantor = encounter.EncounterGuarantors.length > 0 ? encounter.EncounterGuarantors[0] : { GuarantorTypeId: -1 };
                $scope.item.EncounterGuarantorId = encGuarantor.EncounterGuarantorId;
                $scope.item.GuarantorId = encGuarantor.GuarantorId;
                $scope.item.GuarantorName = '';
                $scope.item.GuarantorTypeId = encGuarantor.GuarantorTypeId;
            }

            $scope.fnencounter();
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [
                    { Key: 14, Value: 1 },
                    { Key: 4, Value: $scope.item.PatientId }
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
                    $scope.item.EncounterTypeId = $scope.encounter.EncounterTypeId;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DoctorName = $scope.encounter.DoctorName;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.WardId = $scope.encounter.WardId;
                    $scope.item.RoomId = $scope.encounter.RoomId;
                    $scope.item.BedId = $scope.encounter.BedId;
                    $scope.item.IsEncounter = true;
                    utl.Alert.showErrorMsg('Patient is either Financially (or) Physically Discharged');
                } else {
                    $scope.item.EncounterId = $scope.encounter.Id;
                    $scope.item.EncounterTypeId = $scope.encounter.EncounterTypeId;
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    $scope.item.DoctorName = $scope.encounter.DoctorName;
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                    $scope.item.WardId = $scope.encounter.WardId;
                    $scope.item.RoomId = $scope.encounter.RoomId;
                    $scope.item.BedId = $scope.encounter.BedId;
                    $scope.item.IsEncounter = true;
                    if ($scope.encounter.IsBillLock) {
                        $scope.item.IsBillLock = true;
                        utl.Alert.showErrorMsg('Patient is Under Lock Mode. Contact Billing Department');
                    } else {
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

        $scope.applyVisibilityRules = function () {
            // When In New Status
            if ($scope.item.DispenseReturnStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowReturnBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            //  When In Returned Status
            if ($scope.item.DispenseReturnStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowReturnBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.DispenseReturnStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowReturnBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
            }
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
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
                utl.Alert.showErrorMsg('This one is Empty Row..')
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.ItemMasterId != -1) {
                item.Status = 2;
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
                return false;
            }

            $scope.ReturnedValue = 0;
            $scope.ReceivedValue = 0;
            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;

            $scope.item.ReturnedValue = 0;
            $scope.item.ReceivedValue = 0;
            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmountBeforeGst = 0;
            $scope.item.TotalNetAmount = 0;

            $scope.setIndexforTableIndex();

            calculatetotalAmount();
        };

        $scope.deletePatientReturnDetail = function (item, idx) {
            var lastIndex = 0;
            var index = 0;
            if (item.ItemMasterId != -1) {
                lastIndex = $scope.PatientStockReturnDetails.length - 1;
                index = $scope.PatientStockReturnDetails.indexOf(item);
                item.Status = 2;
                $scope.PatientStockReturnDetails.push(item);
                $scope.PatientStockReturnDetails.splice(index, 1);
                if (lastIndex < 0 || lastIndex == idx) {
                    $scope.addNewLineItem();
                }
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
                return false;
            }

            $scope.ReturnedValue = 0;
            $scope.ReceivedValue = 0;
            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;

            $scope.item.ReturnedValue = 0;
            $scope.item.ReceivedValue = 0;
            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmountBeforeGst = 0;
            $scope.item.TotalNetAmount = 0;

            $scope.setIndexforTableIndex();

            calculatetotalAmount();
        };

        $scope.backToList = function () {
            if ($scope.context == 'main') {
                $state.go('surgeryentry.materialreturns', {
                    id: $scope.item.OTRegisterId,
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.PatientId
                });
            } else {
                $state.go('patientemr.medicinereturns', { id: 0 });
            }
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
                SNo: 0,
                PatientStockRequestDetailId: 0,
                DispenseReturnDateTime: utl.Formatter.getCurrentDate(),
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
                SaleUomId: 0,
                ReturnedQuantity: 0,
                QuantityBeforeReceive: 0,
                AcceptedQuantity: 0,
                StockItemId: 0,
                StockSerialItemId: 0,
                StoreMasterId: 0,
                DepartmentId: 0,
                FacilityId: 0,
                OrganizationId: 0,
                BatchId: null,
                ExpiryDate: null,
                Ucp: 0,
                Mrp: 0,
                Rate: 0,
                Amount: 0,
                GrossAmount: 0,
                GrossGstAmount: 0,
                DiscountModeId: 2,
                DiscountValue: 0,
                DiscountAmount: 0,
                DoctorDiscountAmount: 0,
                GSTId: 0,
                GstId: 0,
                GstPercentage: 0.00,
                GSTPercentage: 0.00,
                GstAmount: 0.00,
                GSTAmount: 0.00,
                InGstId: 0,
                InGstPercentage: 0.00,
                InGstAmount: 0.00,
                CGstId: 0,
                CGstPercentage: 0.00,
                CGstAmount: 0.00,
                SGstId: 0,
                SGstPercentage: 0.00,
                SGstAmount: 0.00,
                NetAmountBeforeGst: 0.00,
                NetAmount: 0.00,
                DoctorId: 0,
                DoctorName: null,
                IsGstDoctor: 0,
                Comments: null,
                ServiceId: 0,
                ServiceCode: null,
                ServiceName: null,
                PatientBillStatusId: 3,
                OTRegisterId: 0,
                IsPharmacyCredit: 1,
                IsPharmacyReturn: 1,
                PharmacyReturnTypeId: 2,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: null,
                MasterItemId: 0,
                MasterTypeId: 0,
                Status: 1,
                CanDisableDetail: false
            };

            if ($scope.currentcontext.id > 0) {
                PatientStockReturnDetail.PatientDispenseReturnId = $scope.currentcontext.id;
            }
            $scope.PatientStockReturnDetails.push(PatientStockReturnDetail);
            $scope.SelectedIndex = $scope.PatientStockReturnDetails.length;
            $scope.setIndexforTableIndex();
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.PatientStockReturnDetails) {
                if ($scope.PatientStockReturnDetails[idx].Status == 1) {
                    if ($scope.PatientStockReturnDetails[idx].Status == 1) {
                        $scope.PatientStockReturnDetails[idx].SNo = SNo;
                        SNo++;
                    }
                }
            }
        };

        $scope.Return = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientreturn.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onReturnConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onReturnConfirmed = function () {
            $scope.item.DispenseReturnStatusId = 2;
            $scope.item.ReturnReceivedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
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
            $scope.item.DispenseReturnStatusId = 3;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDateTime = utl.Formatter.getCurrentDate();
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

            var actionName = 'billing/patientdispensereturn/AddPatientDispenseReturn';
            if ($scope.currentcontext.patientdispensereturnid && $scope.currentcontext.patientdispensereturnid > 0) {
                actionName = 'billing/patientdispensereturn/UpdatePatientDispenseReturn';
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
                    item.Quantity = item.ReturnQuantity;
                    item.ReturnedQuantity = item.ReturnQuantity;
                    item.OTRegisterId = $scope.item.OTRegisterId;
                    item.ServiceId = item.ItemMasterId;
                    item.ServiceCode = item.ItemCode;
                    item.ServiceName = item.ItemName;
                    item.StoreMasterId = $scope.item.StoreMasterId;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
                $scope.backToList();
                //$scope.getPatientReturnInfoById();
            } else {
                $scope.currentcontext.id = data;
                $scope.backToList();
                //$scope.getPatientReturnInfoById();
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

                    $scope.setIndexforTableIndex();
                    $scope.applyVisibilityRules();
                });
            }
        };

        $scope.getOtregisterCallback = function (scope, data, options, hasError) {
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
                data: { Id: $scope.item.OTRegisterId },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };

        function loadData() {
            $scope.applyVisibilityRules();
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientReturnInfoById();
            } else {
                //$scope.getOtregisterById();
                $scope.patientChange();
            }
        }

        $scope.openOTDispensedList = function (idx, item) {
            utl.Modal.open('app.pick-from-issuelist', {
                params: {
                    otregisterid: $scope.item.OTRegisterId,
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
                        SNo: 0,
                        PatientStockRequestDetailId: 0,
                        PatientBillDetailId: 0,
                        PatientBillId: 0,
                        ItemMasterId: SelectedReturn.ItemMasterId,
                        ItemCode: SelectedReturn.ItemCode,
                        ItemName: SelectedReturn.ItemName,
                        GenericId: SelectedReturn.GenericId,
                        GenericName: SelectedReturn.GenericName,
                        ManufacturerId: SelectedReturn.ManufacturerId,
                        ManufacturerName: SelectedReturn.ManufacturerName,
                        ScheduleTypeId: SelectedReturn.ScheduleTypeId,
                        ScheduleTypeDescription: SelectedReturn.ScheduleTypeDescription,
                        ServiceId: SelectedReturn.ItemMasterId,
                        ServiceCode: SelectedReturn.ItemCode,
                        ServiceName: SelectedReturn.ItemName,
                        ServiceTypeId: SelectedReturn.ServiceTypeId,
                        ServiceGroupId: SelectedReturn.ServiceGroupId,
                        ServiceCategoryId: $scope.DrugServiceCategoryId || $scope.NonDrugServiceCategoryId,
                        MasterName: SelectedReturn.MasterName,
                        MasterItemId: SelectedReturn.MasterItemId,
                        MasterTypeId: SelectedReturn.MasterTypeId,
                        DoctorId: SelectedReturn.DoctorId,
                        DoctorName: SelectedReturn.DoctorName,
                        DepartmentId: SelectedReturn.DepartmentId,
                        PatientBillStatusId: 3,
                        IsPharmacyCredit: 1,
                        IsPharmacyReturn: 1,
                        PharmacyReturnTypeId: 2,
                        DiscountModeId: 2,
                        ReturnQuantity: parseInt(SelectedReturn.ReturnQuantity),
                        ReturnedQuantity: parseInt(SelectedReturn.ReturnedQuantity),
                        BilledQuantity: parseInt(SelectedReturn.Quantity),
                        AcceptedQuantity: 0,
                        StockItemId: SelectedReturn.StockItemId,
                        StockSerialItemId: SelectedReturn.StockSerialItemId,
                        BatchId: SelectedReturn.BatchId,
                        ExpiryDate: SelectedReturn.ExpiryDate,
                        Ucp: Math.abs(parseFloat(SelectedReturn.Ucp)),
                        Mrp: Math.abs(parseFloat(SelectedReturn.Mrp)),
                        Rate: Math.abs(parseFloat(SelectedReturn.Mrp)),
                        GstId: parseInt(SelectedReturn.GSTId),
                        GSTId: parseInt(SelectedReturn.GSTId),
                        GstPercentage: Math.abs(parseFloat(SelectedReturn.GSTPercentage)),
                        GSTPercentage: Math.abs(parseFloat(SelectedReturn.GSTPercentage)),
                        UnitGstAmount: Math.abs(parseFloat(SelectedReturn.UnitGSTAmount)),
                        UnitGSTAmount: Math.abs(parseFloat(SelectedReturn.UnitGSTAmount)),
                        GstAmount: Math.abs(parseFloat(SelectedReturn.GSTAmount)),
                        GSTAmount: Math.abs(parseFloat(SelectedReturn.GSTAmount)),
                        InGstId: parseInt(SelectedReturn.InGstId),
                        InGstPercentage: Math.abs(parseFloat(SelectedReturn.InGstPercentage)),
                        UnitInGstAmount: Math.abs(parseFloat(SelectedReturn.UnitInGstAmount)),
                        InGstAmount: Math.abs(parseFloat(SelectedReturn.InGstAmount)),
                        CGstId: parseInt(SelectedReturn.CGstId),
                        CGstPercentage: Math.abs(parseFloat(SelectedReturn.CGstPercentage)),
                        UnitCGstAmount: Math.abs(parseFloat(SelectedReturn.UnitCGstAmount)),
                        CGstAmount: Math.abs(parseFloat(SelectedReturn.CGstAmount)),
                        SGstId: parseInt(SelectedReturn.SGstId),
                        SGstPercentage: Math.abs(parseFloat(SelectedReturn.SGstPercentage)),
                        UnitSGstAmount: Math.abs(parseFloat(SelectedReturn.UnitSGstAmount)),
                        SGstAmount: Math.abs(parseFloat(SelectedReturn.SGstAmount)),
                        Amount: Math.abs(parseInt(SelectedReturn.ReturnQuantity) * parseFloat(SelectedReturn.Mrp)),
                        GrossAmount: Math.abs(parseInt(SelectedReturn.ReturnQuantity) * parseFloat(SelectedReturn.Mrp)),
                        NetAmount: Math.abs(parseInt(SelectedReturn.ReturnQuantity) * parseFloat(SelectedReturn.Mrp)),
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
                    $scope.item.ReturnedValue = $scope.item.ReturnedValue + ReturnItemDetail.NetAmount;
                    $scope.item.ReceivedValue = $scope.item.ReceivedValue + ReturnItemDetail.NetAmount;
                    $scope.item.TotalNetAmountBeforeGst = $scope.item.TotalNetAmount - $scope.item.TotalGstAmount;

                    $scope.PatientStockReturnDetails.push(ReturnItemDetail);
                });

                $scope.setIndexforTableIndex();
            }
        }

        $scope.computeAmount = function (item) {
            if (item.ReturnQuantity > 0) {
                if (item.ReturnQuantity > (item.BilledQuantity - item.ReturnedQuantity)) {
                    utl.Alert.showErrorMsg('Return Qty should not Greater Than Actual Billed Qty');
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

            $scope.ReturnedValue = 0;
            $scope.ReceivedValue = 0;
            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.PatientStockReturnDetails) {
                var activeitem = $scope.PatientStockReturnDetails[idx];
                if (activeitem.ItemMasterId > 0 && parseInt(activeitem.ReturnQuantity) > 0 && activeitem.Status == 1) {
                    $scope.ReturnedValue = parseFloat(($scope.ReturnedValue + parseFloat(activeitem.NetAmount)).toFixed(4));
                    $scope.ReceivedValue = parseFloat(($scope.ReceivedValue + parseFloat(activeitem.NetAmount)).toFixed(4));
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + parseFloat(activeitem.GrossAmount)).toFixed(4));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + parseFloat(activeitem.GstAmount)).toFixed(4));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + parseFloat(activeitem.InGstAmount)).toFixed(4));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + parseFloat(activeitem.CGstAmount)).toFixed(4));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + parseFloat(activeitem.SGstAmount)).toFixed(4));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + parseFloat(activeitem.NetAmount)).toFixed(4));
                    $scope.TotalNetAmountBeforeGst = $scope.TotalNetAmount - $scope.TotalGstAmount;
                }
            }

            $scope.item.ReturnedValue = $scope.ReturnedValue;
            $scope.item.ReceivedValue = $scope.ReceivedValue;
            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.TotalNetAmountBeforeGst = $scope.TotalNetAmountBeforeGst;
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
            api: 'Encounter/Visit/GetEncounters',
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
                PageContext: { PageSize: 25, PageNumber: 1 }
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
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                }
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'OTDRUGRET') {
                            $scope.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'OTNONDRUGRET') {
                            $scope.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });

            loadData();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'IPManagement/PatientStockReturns/PrintPatientStockReturns',
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
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [
                            { Key: 3, Value: 10 },
                            { Key: 5, Value: 2 }
                        ]
                    }
                },
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
            $scope.lookupCall(inputData);
        };

        $scope.initAllLookup();
    }

    materialReturnFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();