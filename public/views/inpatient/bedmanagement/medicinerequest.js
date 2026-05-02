(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('medicineRequestController', medicineRequestController);

    function medicineRequestController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, lodash, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.context = 'main';
        $scope.currentcontext = {};
        uibButtonConfig.activeClass = "opt-selected";
        $scope.cancelCallback = $uibModalInstance.dismiss;
        // $scope.currentcontext.CanSave = utl.Privilege.hasPrivilege('CanSave');
        // $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove');
        // $scope.currentcontext.CanAuthorize = utl.Privilege.hasPrivilege('CanAuthorize');
        // $scope.currentcontext.CanCancel = utl.Privilege.hasPrivilege('CanCancel');
        // $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        // $scope.currentcontext.CanHistory = utl.Privilege.hasPrivilege('CanHistory');
        // $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew');


        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientRequestPriorityId: 1,
            PatientRequestTypeId: 1,
            PatientRequestStatusId: 0,
            PrescriptionId: 0,
            ToStoreId: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            TotalAmount: 0,
            TotalGrossAmount: 0,
            Comments: null,
            CanDisableHeader: false,
            RBDisabled: true
        };

        // if ($stateParams && $stateParams.tp) {
        //     $scope.context = $stateParams.tp;
        //     $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        //     $scope.item.PatientId = $scope.currentcontext.pid;
        //     $scope.item.EncounterId = $scope.currentcontext.eid;
        // }

        // $scope.commentsDisabled = false;

        // $scope.currentcontext = {
        //     ismodal: modalConfig && modalConfig.params ? true : false
        // };

        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = modalConfig.params.id;
        //     $scope.item.PatientId = modalConfig.params.pid;
        //     $scope.item.EncounterId = modalConfig.params.encounterid;
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }
        $scope.currentcontext.option = 'detail';
        $scope.options = [
            { key: 'detail', name: $translate.instant('Details') },
            { key: 'ticksheet', name: $translate.instant('patientemr.prescription-form.ticksheet.lbl') },
            // { key: 'panels', name: $translate.instant('patientemr.prescription-form.panels.lbl') }
        ];
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.PatientStockRequestDetails = [];
        $scope.DeletedPatientStockRequestDetails = [];
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
        $scope.canShowDetailsArea = function () {
            return $scope.currentcontext.option == 'detail';
        };

        $scope.canShowTickSheetArea = function () {
            return $scope.currentcontext.option == 'ticksheet';
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
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;
                if ($scope.item.PatientRequestStatusId < 2) {
                    $scope.addNewLineItem();
                }
            } else {
                utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
            }
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.PatientStockRequestDetails) {
                if ($scope.PatientStockRequestDetails[idx].Status == 1) {
                    $scope.PatientStockRequestDetails[idx].SNo = SNo;
                    $scope.PatientStockRequestDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.PatientStockRequestDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };
        $scope.ticksheetconfig = {
            ticksheetmastertypeid: 4,
            selectedlist: [],
            selecteddetail: {},
            departmentid: -1
        };

        $scope.saveTickSheets = function () {
            $scope.PatientStockRequestDetails.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                try {
                    vMrPrice = ticksheetitem.ItemMaster.MrPrice;
                } catch (ex) { }
                try {
                    vAvailQuantity = ticksheetitem.ItemMaster.StockItem.Quantity;
                } catch (ex) { }
                if (ticksheetitem.ItemMaster.SaleUom)
                    var saleuom = ticksheetitem.ItemMaster.SaleUom.UomCode;
                if (ticksheetitem.ItemMaster.StockItem)
                    var quant = ticksheetitem.ItemMaster.StockItem.Quantity;
                var item = {
                    ItemMasterId: ticksheetitem.ItemId,
                    ItemCode: ticksheetitem.ItemMaster.ItemCode,
                    ItemName: ticksheetitem.ItemMaster.ItemName,
                    DrugId: ticksheetitem.ItemMaster.DrugId,
                    DrugCode: ticksheetitem.ItemMaster.DrugCode,
                    DrugName: ticksheetitem.ItemMaster.DrugName,
                    GenericId: ticksheetitem.ItemMaster.GenericId,
                    GenericCode: ticksheetitem.ItemMaster.GenericCode,
                    GenericName: ticksheetitem.ItemMaster.GenericName,
                    RequestedQuantity: 0,
                    SaleUomCode: saleuom,
                    QuantityOnHand: quant,
                    Mrp: ticksheetitem.ItemMaster.MrPrice,
                    // NetAmount:ticksheetitem.ItemMaster.MrPrice,
                    CanDisableDetails: false,
                    Status: 1,
                };
                $scope.computeAmount(item);
                if (!checkExist(item)) {
                    $scope.PatientStockRequestDetails.push(item);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        };
        function checkExist(item) {
            for (var idx in $scope.PatientStockRequestDetails) {
                if ((item.ItemMasterId == $scope.PatientStockRequestDetails[idx].ItemMasterId) && ($scope.PatientStockRequestDetails[idx].Status == 1)) {
                    return true;
                }
            }
            return false;
        }
        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            $scope.PatientStockRequestDetails.splice(-1, 1);
            for (var idx in $scope.PatientStockRequestDetails) {
                var item = $scope.PatientStockRequestDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.PrescriptionId = $scope.currentcontext.id;
                }
                if (!checkExist(itemFromModal) && (itemFromModal.DrugId)) {
                    $scope.PatientStockRequestDetails.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        };
        $scope.addTickSheet = function () {
            var testmaster = $scope.ticksheetconfig.selecteddetail.ItemMaster;
            var currentItem = getNewItem();
            currentItem.ItemMasterId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.ItemName = testmaster.ItemName;
            currentItem.ItemCode = testmaster.ItemCode;
            utl.Modal.open('patientemr.prescriptiondetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, current_item: currentItem },
                confirmCallback: $scope.onDetailSave
            });
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
            if ($scope.item.PatientRequestStatusId != 1 || $scope.item.PatientRequestStatusId != 2 || $scope.item.PatientRequestStatusId != 3 ||
                $scope.item.PatientRequestStatusId != 4 || $scope.item.PatientRequestStatusId != 5 || $scope.item.PatientRequestStatusId != 6 ||
                $scope.item.PatientRequestStatusId != 7) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowHistoryBtn = false;
            }
            // When In Draft Status
            if ($scope.item.PatientRequestStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            //  When In Approved Status
            if ($scope.item.PatientRequestStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.PatientRequestStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Partially Dispensed Status
            if ($scope.item.PatientRequestStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Dispensed Status
            if ($scope.item.PatientRequestStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.PatientRequestStatusId == 6) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.PatientRequestStatusId == 7) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
            }
        };

        $scope.addNew = function () {
            if ($stateParams.id > 0) {
                if ($scope.context == 'main')
                    $state.go('app.patientrequest', { id: 0 });
                if ($scope.context == 'emr')
                    $state.go('patientemr.medicinerequestform', { id: 0 });
            }
            else
                $state.reload();
        };

        $scope.Clear = function () {
            document.getElementById("item_form").reset();
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
                utl.Modal.open('app.patientrequesthistory', {
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
                utl.Modal.open('app.patientrequestdetails', {
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

        $scope.editPrescriptionDetail = function (item) {
            item.currenteditable = true;

            utl.Modal.open('patientemr.prescriptiondetail', {
                params: { id: 0, pid: $scope.item.PatientId, current_item: item, isedit: true },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            $scope.PatientStockRequestDetails.splice(-1, 1);
            for (var idx in $scope.PatientStockRequestDetails) {
                var item = $scope.PatientStockRequestDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.RequestedQuantity = item.Quantity;
                    item.NetAmount = item.Quantity * item.Mrp;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.PatientStockRequestId = $scope.currentcontext.id;
                }
                if (!checkExist(itemFromModal) && (itemFromModal.ItemMasterId)) {
                    $scope.PatientStockRequestDetails.push(itemFromModal);
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;
            calculatetotalAmount();
            $scope.addNewLineItem();
        };

        $scope.deletePatientRequestDetail = function (SelectedItem, idx) {
            if (SelectedItem.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, SelectedItem, name);
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalAmount = 0;

            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalNetAmount = 0;
            $scope.item.TotalAmount = 0;

            calculatetotalAmount();
            $scope.setIndexforTableIndex();
        };

        $scope.backToList = function () {
            if ($scope.context == 'emr')
                $state.go('patientemr.patientindent', { id: 0 });
        };

        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientStockRequestDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientStockRequestDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }

            var PatientStockRequestDetail = {
                Id: 0,
                SNo: 0,
                TempId: 0,
                ItemMasterId: -1,
                PrescriptionDetailId: 0,
                ItemCode: '',
                ItemName: '',
                DrugId: 0,
                DrugCode: '',
                DrugName: '',
                BaseUomId: 0,
                BaseUomCode: '',
                PurchaseUomId: 0,
                PurchaseUomCode: '',
                SaleUomId: 0,
                SaleUomCode: '',
                QuantityOnHand: 0,
                RequestedQuantity: 0,
                Quantity: 0,
                Ucp: 0,
                Mrp: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                CanDisableDetails: false
            };

            if ($scope.currentcontext.id > 0) {
                PatientStockRequestDetail.PatientRequestId = $scope.currentcontext.id;
            }

            $scope.PatientStockRequestDetails.push(PatientStockRequestDetail);

            $scope.SelectedIndex = $scope.PatientStockRequestDetails.length;
            $scope.setIndexforTableIndex();
        };

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientrequest.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.PatientRequestStatusId = 1;
            $scope.item.RequestedBy = utl.Session.getCurrentUserId();
            $scope.item.PatientRequestDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientrequest.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.PatientRequestStatusId == 1) {
                $scope.item.RequestedBy = utl.Session.getCurrentUserId();
                $scope.item.PatientRequestDateTime = utl.Formatter.getCurrentDate();
            } else {
                $scope.item.RequestedBy = utl.Session.getCurrentUserId();
                $scope.item.PatientRequestDateTime = utl.Formatter.getCurrentDate();
            }
            $scope.item.PatientRequestStatusId = 2;
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
                messageKey: 'patientrequest.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.PatientRequestStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.CancelRequest = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientrequest.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.PatientRequestStatusId = 6;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.PatientRequestStatusId = 4;
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

            if (!$scope.PatientStockRequestDetails || $scope.PatientStockRequestDetails.length === 0) {
                utl.Alert.showErrorMsg('Please Select Atleast One Item');
                return false;
            } else {
                var ItemCount = 0;
                var ItemCheck = 0;
                var ItemName = null;
                if ($scope.PatientStockRequestDetails.length === 1) {
                    for (var idx1 in $scope.PatientStockRequestDetails) {
                        var item1 = $scope.PatientStockRequestDetails[idx1];
                        if (item1 && item1.ItemMasterId < 0 && item1.Status === 1) {
                            ItemCount = 1;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && item1.RequestedQuantity <= 0 && item1.Status == 1) {
                            ItemCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    for (var idx in $scope.PatientStockRequestDetails) {
                        var item = $scope.PatientStockRequestDetails[idx];
                        if (item && item.ItemMasterId >= 0 && item.RequestedQuantity <= 0 && item.Status == 1) {
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

                if (ItemCheck == 1) {
                    utl.Alert.showErrorMsg('Quantity Should not be zero for ' + ItemName);
                    return false;
                }
            }

            var lines = getLinesForSave();

            var actionName = 'IPManagement/PatientStockRequests/AddPatientStockRequests';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/PatientStockRequests/UpdatePatientStockRequests';
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
            for (var idx in $scope.PatientStockRequestDetails) {
                var item = $scope.PatientStockRequestDetails[idx];
                item = $scope.PatientStockRequestDetails[idx];
                if (item.ItemMasterId > 0 && item.RequestedQuantity > 0) {
                    if (item.Id > 0) {
                        result.push(item);
                    } else {
                        if (item.Status == 1) {
                            result.push(item);
                        }
                    }
                }
            }

            for (var didx in $scope.DeletedPatientStockRequestDetails) {
                var ditem = $scope.DeletedPatientStockRequestDetails[didx];
                ditem = $scope.DeletedPatientStockRequestDetails[didx];
                if (ditem.ItemMasterId > 0 && ditem.RequestedQuantity > 0) {
                    if (ditem.Id > 0 && ditem.Status == 2) {
                        result.push(ditem);
                    }
                }
            }

            return result;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
                $scope.getPatientRequestInfoById();
            } else {
                $scope.currentcontext.id = data;
                $scope.getPatientRequestInfoById();
            }

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.getPatientRequestInfoById = function () {
            var SearchRequestId = $scope.currentcontext.pid;
            if (SearchRequestId && SearchRequestId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchRequestId },
                        { Key: 9, Value: $scope.item.ToStoreId }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getRequestInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };
        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                $scope.item.EncounterId = encounter.Id
                $scope.currentcontext.patientid = encounter.PatientId;
                $scope.item.PatientId = encounter.PatientId
                $scope.item.WardId = encounter.WardId
                $scope.item.AdmissionStatusId = encounter.AdmissionStatusId
                $scope.item.VisitIdentifier = encounter.VisitIdentifier
                $scope.item.DoctorId = encounter.DoctorId
                $scope.item.DepartmentId = encounter.DepartmentId
                $scope.item.RoomId = encounter.RoomId
                $scope.item.BedId = encounter.BedId
                $scope.item.AdmissionDate = encounter.AdmissionDate;
                $scope.item.DischargeDate = encounter.DischargeDate;
                $scope.item.Patient = encounter.Patient;
            }
        };

        $scope.getEncounterById = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid },
                ]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getRequestInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientRequestInfo = res.Data || [];
            if ($scope.PatientRequestInfo && $scope.PatientRequestInfo.length > 0) {
                $scope.PatientRequestInfo.forEach(patientrequest => {
                    $scope.item.Id = patientrequest.Id;
                    $scope.item.PatientStockRequestId = patientrequest.Id;
                    $scope.item.PatientRequestNumber = patientrequest.PatientRequestNumber;
                    $scope.item.PatientRequestDateTime = patientrequest.PatientRequestDateTime;
                    $scope.item.PatientRequestTypeId = patientrequest.PatientRequestTypeId;
                    $scope.item.PatientRequestSubTypeId = patientrequest.PatientRequestSubTypeId;
                    $scope.item.PatientRequestStatusId = patientrequest.PatientRequestStatusId;
                    $scope.item.PatientRequestPriorityId = patientrequest.PatientRequestPriorityId;

                    if ($scope.item.PatientRequestStatusId == 1) {
                        $scope.item.CanDisableHeader = false;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Draft';
                    }
                    if ($scope.item.PatientRequestStatusId == 2) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Requested';
                    }
                    if ($scope.item.PatientRequestStatusId == 3) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Authorized';
                    }
                    if ($scope.item.PatientRequestStatusId == 4) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Partially Dispensed';
                    }
                    if ($scope.item.PatientRequestStatusId == 5) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Dispensed';
                    }
                    if ($scope.item.PatientRequestStatusId == 6) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Cancelled';
                    }
                    if ($scope.item.PatientRequestStatusId == 7) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Rejected';
                    }

                    $scope.item.PrescriptionId = patientrequest.PrescriptionId;
                    $scope.item.PatientId = patientrequest.PatientId;
                    $scope.item.PatientMRN = patientrequest.PatientMRN;
                    $scope.item.EncounterId = patientrequest.EncounterId;
                    $scope.item.DoctorId = patientrequest.DoctorId;
                    $scope.item.DoctorName = patientrequest.DoctorName;
                    $scope.item.DepartmentId = patientrequest.DepartmentId;
                    $scope.item.GuarantorId = patientrequest.GuarantorId;
                    $scope.item.LocationId = patientrequest.LocationId;
                    $scope.item.WardId = patientrequest.WardId;
                    $scope.item.RoomId = patientrequest.RoomId;
                    $scope.item.BedId = patientrequest.BedId;
                    $scope.item.ToStoreId = patientrequest.ToStoreId;
                    $scope.item.FacilityId = patientrequest.FacilityId;
                    $scope.item.TotalGrossAmount = patientrequest.TotalGrossAmount;
                    $scope.item.TotalNetAmount = patientrequest.TotalNetAmount;

                    $scope.item.RequestedBy = patientrequest.RequestedBy;
                    $scope.item.RequestedDate = patientrequest.RequestedDate;
                    $scope.item.ApprovedBy = patientrequest.ApprovedBy;
                    $scope.item.ApprovedDate = patientrequest.ApprovedDate;
                    $scope.item.AuthorizedBy = patientrequest.AuthorizedBy;
                    $scope.item.AuthorizedDate = patientrequest.AuthorizedDate;

                    $scope.PatientStockRequestDetails = [];
                    $scope.PatientStockRequestDetails = patientrequest.PatientStockRequestDetails;
                    for (var reqidx in $scope.PatientStockRequestDetails) {
                        var reqitem = $scope.PatientStockRequestDetails[reqidx];

                        if (reqitem.ItemMasterId > 0) {
                            if (reqitem.ItemMaster) {
                                reqitem.DrugId = reqitem.ItemMaster.DrugId;
                                reqitem.DrugCode = reqitem.ItemMaster.DrugCode;
                                reqitem.DrugName = reqitem.ItemMaster.DrugName;

                                if (reqitem.ItemMaster.SaleUom) {
                                    reqitem.SaleUomCode = reqitem.ItemMaster.SaleUom.UomCode;
                                }
                                if (reqitem.ItemMaster.PurchaseUom) {
                                    reqitem.PurchaseUomCode = reqitem.ItemMaster.PurchaseUom.UomCode;
                                }
                                if (reqitem.ItemMaster.BaseUom) {
                                    reqitem.BaseUomCode = reqitem.ItemMaster.BaseUom.UomCode;
                                }
                                if (reqitem.ItemMaster.StockItem) {
                                    reqitem.QuantityOnHand = reqitem.ItemMaster.StockItem.Quantity;
                                }
                            }
                            reqitem.TempId = 0;
                            if ($scope.item.PatientRequestStatusId == 1) {
                                reqitem.Quantity = 0;
                                reqitem.CanDisableDetails = false;
                            } else {
                                reqitem.CanDisableDetails = true;
                            }
                        }
                    }


                    $scope.applyVisibilityRules();
                });
                $scope.setIndexforTableIndex();
            }
        };

        // function loadData() {
        //     $scope.applyVisibilityRules();
        //     if ($scope.currentcontext.pid > 0) {
        //         $scope.getPatientRequestInfoById();
        //     }
        //      $scope.addNewLineItem();
        // }

        function loadData() {
            $scope.applyVisibilityRules();
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.getItem();
                $scope.getDetail();
            } else {
                $scope.getEncounterById();
                $scope.addNewLineItem();

            }
        }

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/PatientStockRequests/GetPatientStockRequestsById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            for (var idx in data.Data) {
                var item = data.Data[idx];

                item.TotalNetAmount = parseFloat(item.TotalNetAmount).toFixed(2);
                vm.gridConfig.data.push(item);
            }

            $scope.item = data;
            if (data.PatientRequestStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayRequestStatus = 'Draft';
            }
            if (data.PatientRequestStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayRequestStatus = 'Requested';
            }
            if (data.PatientRequestStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayRequestStatus = 'Authorized';
            }
            if (data.PatientRequestStatusId == 4) {
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayRequestStatus = 'Partially Dispensed';
            }
            if (data.PatientRequestStatusId == 5) {
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayRequestStatus = 'Dispensed';
            }
            if (data.PatientRequestStatusId == 6) {
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayRequestStatus = 'Cancelled';
            }
            if (data.PatientRequestStatusId == 7) {
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayRequestStatus = 'Rejected';
            }
            $scope.getDetail();
            $scope.applyVisibilityRules();
        };

        $scope.getDetail = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
                    ]
                };

                var options = {
                    action: 'IPManagement/PatientStockRequestDetails/GetPatientStockRequestDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getDetailCallback = function (scope, data, options, hasError) {
            $scope.PatientRequestDetails = data.Data || [];
            if ($scope.PatientRequestInfo && $scope.PatientRequestInfo.length > 0) {
                $scope.PatientRequestInfo.forEach(patientrequest => {
                    $scope.item.Id = patientrequest.Id;
                    $scope.item.PatientStockRequestId = patientrequest.Id;
                    $scope.item.PatientRequestNumber = patientrequest.PatientRequestNumber;
                    $scope.item.PatientRequestDateTime = patientrequest.PatientRequestDateTime;
                    $scope.item.PatientRequestTypeId = patientrequest.PatientRequestTypeId;
                    $scope.item.PatientRequestSubTypeId = patientrequest.PatientRequestSubTypeId;
                    $scope.item.PatientRequestStatusId = patientrequest.PatientRequestStatusId;
                    $scope.item.PatientRequestPriorityId = patientrequest.PatientRequestPriorityId;

                    if ($scope.item.PatientRequestStatusId == 1) {
                        $scope.item.CanDisableHeader = false;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Draft';
                    }
                    if ($scope.item.PatientRequestStatusId == 2) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Requested';
                    }
                    if ($scope.item.PatientRequestStatusId == 3) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Authorized';
                    }
                    if ($scope.item.PatientRequestStatusId == 4) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Partially Dispensed';
                    }
                    if ($scope.item.PatientRequestStatusId == 5) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Dispensed';
                    }
                    if ($scope.item.PatientRequestStatusId == 6) {
                        $scope.item.CanDisableHeader = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayRequestStatus = 'Cancelled';
                    }

                    $scope.item.PrescriptionId = patientrequest.PrescriptionId;
                    $scope.item.PatientId = patientrequest.PatientId;
                    $scope.item.PatientMRN = patientrequest.PatientMRN;
                    $scope.item.EncounterId = patientrequest.EncounterId;
                    $scope.item.DoctorId = patientrequest.DoctorId;
                    $scope.item.DoctorName = patientrequest.DoctorName;
                    $scope.item.DepartmentId = patientrequest.DepartmentId;
                    $scope.item.GuarantorId = patientrequest.GuarantorId;
                    $scope.item.LocationId = patientrequest.LocationId;
                    $scope.item.WardId = patientrequest.WardId;
                    $scope.item.RoomId = patientrequest.RoomId;
                    $scope.item.BedId = patientrequest.BedId;
                    $scope.item.ToStoreId = patientrequest.ToStoreId;
                    $scope.item.FacilityId = patientrequest.FacilityId;
                    $scope.item.TotalGrossAmount = patientrequest.TotalGrossAmount;
                    $scope.item.TotalNetAmount = patientrequest.TotalNetAmount;

                    $scope.item.RequestedBy = patientrequest.RequestedBy;
                    $scope.item.RequestedDate = patientrequest.RequestedDate;
                    $scope.item.ApprovedBy = patientrequest.ApprovedBy;
                    $scope.item.ApprovedDate = patientrequest.ApprovedDate;
                    $scope.item.AuthorizedBy = patientrequest.AuthorizedBy;
                    $scope.item.AuthorizedDate = patientrequest.AuthorizedDate;

                    $scope.PatientStockRequestDetails = [];
                    $scope.PatientStockRequestDetails = patientrequest.PatientStockRequestDetails;
                    for (var reqidx in $scope.PatientStockRequestDetails) {
                        var reqitem = $scope.PatientStockRequestDetails[reqidx];

                        if (reqitem.ItemMasterId > 0) {
                            if (reqitem.ItemMaster) {
                                reqitem.DrugId = reqitem.ItemMaster.DrugId;
                                reqitem.DrugCode = reqitem.ItemMaster.DrugCode;
                                reqitem.DrugName = reqitem.ItemMaster.DrugName;

                                if (reqitem.ItemMaster.SaleUom) {
                                    reqitem.SaleUomCode = reqitem.ItemMaster.SaleUom.UomCode;
                                }
                                if (reqitem.ItemMaster.PurchaseUom) {
                                    reqitem.PurchaseUomCode = reqitem.ItemMaster.PurchaseUom.UomCode;
                                }
                                if (reqitem.ItemMaster.BaseUom) {
                                    reqitem.BaseUomCode = reqitem.ItemMaster.BaseUom.UomCode;
                                }
                                if (reqitem.ItemMaster.StockItem) {
                                    reqitem.QuantityOnHand = reqitem.ItemMaster.StockItem.Quantity;
                                }
                            }
                            reqitem.TempId = 0;
                            if ($scope.item.PatientRequestStatusId == 1) {
                                reqitem.Quantity = 0;
                                reqitem.CanDisableDetails = false;
                            } else {
                                reqitem.CanDisableDetails = true;
                            }
                        }
                    }

                    $scope.applyVisibilityRules();
                });
                $scope.setIndexforTableIndex();
            }
        };

        $scope.alternateDetails = function (idx, item) {
            utl.Modal.open('app.patientrequestalternates', {
                params: {
                    genericid: item.GenericId,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: $scope.item.ToStoreId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                    lineindex: idx
                },
                confirmCallback: replaceAlternate
            });
        };

        function replaceAlternate(alternatedata) {
            var ActualItem = {};
            var alternatepatientstockrequestDetail = {};
            ActualItem.ItemMasterId = alternatedata.itemid;
            $scope.CleanDrugItem(ActualItem);
            var StockQty = 0;
            var BaseUomId = 0;
            var BaseUomCode = '';
            var PurchaseUomId = 0;
            var PurchaseUomCode = '';
            var SaleUomId = 0;
            var SaleUomCode = '';

            if (alternatedata.ItemData.StockItem) {
                StockQty = alternatedata.ItemData.StockItem.Quantity;
            }

            if (alternatedata.ItemData.BaseUom) {
                BaseUomId = alternatedata.ItemData.BaseUom.Id;
                BaseUomCode = alternatedata.ItemData.BaseUom.UomCode;
            }

            if (alternatedata.ItemData.PurchaseUom) {
                PurchaseUomId = alternatedata.ItemData.PurchaseUom.Id;
                PurchaseUomCode = alternatedata.ItemData.PurchaseUom.UomCode;
            }

            if (alternatedata.ItemData.SaleUom) {
                SaleUomId = alternatedata.ItemData.SaleUom.Id;
                SaleUomCode = alternatedata.ItemData.SaleUom.UomCode;
            }

            alternatepatientstockrequestDetail = {
                Id: 0,
                TempId: 0,
                ItemMasterId: alternatedata.ItemData.Id || -1,
                PrescriptionDetailId: 0,
                ItemCode: alternatedata.ItemData.ItemCode || '',
                ItemName: alternatedata.ItemData.ItemName || '',
                GenericId: alternatedata.ItemData.GenericId || -1,
                GenericCode: alternatedata.ItemData.GenericCode || '',
                GenericName: alternatedata.ItemData.GenericName || '',
                DrugId: alternatedata.ItemData.DrugId || -1,
                DrugCode: alternatedata.ItemData.DrugCode || '',
                DrugName: alternatedata.ItemData.DrugName || '',
                BaseUomId: BaseUomId || 0,
                BaseUomCode: BaseUomCode || '',
                PurchaseUomId: PurchaseUomId || 0,
                PurchaseUomCode: PurchaseUomCode || '',
                SaleUomId: SaleUomId || 0,
                SaleUomCode: SaleUomCode || '',
                QuantityOnHand: StockQty,
                RequestedQuantity: 0,
                Quantity: 0,
                Ucp: parseFloat((alternatedata.ItemData.ItemPrice).toFixed(2)),
                Mrp: parseFloat((alternatedata.ItemData.MrPrice).toFixed(2)),
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                CanDisableDetails: false
            };

            $scope.PatientStockRequestDetails.push(alternatepatientstockrequestDetail);

            $scope.addNewLineItem();
        }

        $scope.CleanDrugItem = function (item) {
            for (var count = 0; count < $scope.PatientStockRequestDetails.length; count++) {
                var cllitem = $scope.PatientStockRequestDetails[count];
                if (cllitem.ItemMasterId == item.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.DeletedPatientStockRequestDetails.push(cllitem);
                    var index1 = $scope.PatientStockRequestDetails.indexOf(cllitem);
                    $scope.PatientStockRequestDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.PatientStockRequestDetails) {
                var clsitem = $scope.PatientStockRequestDetails[clsidx];
                if (clsitem.ItemMasterId == -1) {
                    clsitem.Status = 2;
                    $scope.DeletedPatientStockRequestDetails.push(clsitem);
                    var index2 = $scope.PatientStockRequestDetails.indexOf(clsitem);
                    $scope.PatientStockRequestDetails.splice(index2, 1);
                }
            }
        };

        $scope.onItemSelected = function (idx, selectedItem) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.PatientStockRequestDetails, {
                pivotkey: 'ItemMasterId',
                displaykey: 'ItemName'
            });
            if (isDuplicate) {
                item.ItemMasterId = '';
                item.ItemName = '';
                return;
            }

            var SelectedMasterItem = selectedItem.SelectedItem;

            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;

            if (SelectedMasterItem.ItemMaster) {
                selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                selectedItem.DrugCode = SelectedMasterItem.ItemMaster.DrugCode;
                selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                selectedItem.GenericCode = SelectedMasterItem.ItemMaster.GenericCode;
                selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
            }

            if (SelectedMasterItem.ItemMaster.BaseUom) {
                selectedItem.BaseUomId = SelectedMasterItem.ItemMaster.BaseUom.Id;
                selectedItem.BaseUomCode = SelectedMasterItem.ItemMaster.BaseUom.UomCode;
            }
            if (SelectedMasterItem.ItemMaster.PurchaseUom) {
                selectedItem.PurchaseUomId = SelectedMasterItem.ItemMaster.PurchaseUom.Id;
                selectedItem.PurchaseUomCode = SelectedMasterItem.ItemMaster.PurchaseUom.UomCode;
            }
            if (SelectedMasterItem.ItemMaster.SaleUom) {
                selectedItem.SaleUomId = SelectedMasterItem.ItemMaster.SaleUom.Id;
                selectedItem.SaleUomCode = SelectedMasterItem.ItemMaster.SaleUom.UomCode;
            }

            selectedItem.Ucp = parseFloat((SelectedMasterItem.ItemMaster.ItemPrice).toFixed(2));
            selectedItem.Mrp = parseFloat((SelectedMasterItem.ItemMaster.MrPrice).toFixed(2));
            if (SelectedMasterItem.ItemMaster.StockItem) {
                selectedItem.QuantityOnHand = SelectedMasterItem.ItemMaster.StockItem.Quantity;
            } else {
                selectedItem.QuantityOnHand = 0;
            }

            var PharItemLineDetails = [];
            for (var pildid = 0; pildid < $scope.PatientStockRequestDetails.length; pildid++) {
                var PharItemLineDetail = $scope.PatientStockRequestDetails[pildid];
                if (PharItemLineDetail.Status == 1) {
                    PharItemLineDetails.push(PharItemLineDetail);
                }
            }

            var lastIndex = PharItemLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.computeAmount = function (item) {
            if (item.RequestedQuantity > 0) {
                item.GrossAmount = item.Mrp * item.RequestedQuantity;
                item.NetAmount = item.Mrp * item.RequestedQuantity;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.PatientStockRequestDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.PatientStockRequestDetails[idx].GrossAmount).toFixed(2));

                if ($scope.TotalNetAmount === null) {
                    $scope.TotalNetAmount = 0;
                }
                $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.PatientStockRequestDetails[idx].NetAmount).toFixed(2));
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.TotalAmount = $scope.TotalNetAmount;
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
                $scope.item.PatientMRN = selectedItem.MRN;
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
                $scope.item.PatientName = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');

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
                    { Key: 3, Value: [1, 2, 3, 4] }

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
                header: 'Product Type Name',
                field: 'ProductTypeName',
                datatype: 'string',
                headercls: 'td-producttypename',
                fieldcls: 'td-producttypename'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
            },
            {
                header: 'Manufacturer Name',
                field: 'ManufacturerName',
                datatype: 'string',
                headercls: 'td-manufacturername',
                fieldcls: 'td-manufacturername'
            },
            {
                header: 'Stock-In-Hand',
                field: 'StockInHand',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemStoreMaps',
            formatdisplay: formatselectedpharmacyitem,
            presearch: presearchpharmacyitem,
            postsearch: postsearchpharmacyitem
        };

        function formatselectedpharmacyitem() {
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, '(', selectedItem.ItemCode, ')'].join(' ');
            } else if (vm.pharmacyitemcontrolconfig.rowdata) {
                result = [vm.pharmacyitemcontrolconfig.rowdata.ItemName, vm.pharmacyitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var inputData = {
                Params: [{ Key: 1, Value: $scope.item.ToStoreId }, { Key: 4, Value: 1 },  { Key: 15, Value: 1 }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.pharmacyitemcontrolconfig.searchbyid === true) {
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

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                item.GenericName = item.ItemMaster.GenericName;
                item.ManufacturerName = item.ItemMaster.ManufacturerName;
                /*
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                if (item.ItemMaster.StockItem !== null) {
                    item.StockInHand = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.StockInHand = 0;
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

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'IPManagement/PatientStockRequests/PrintPatientStockRequest',
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
                { "Key": "Ward" },
                { "Key": "Room" },
                { "Key": "PatientRequestPriority" },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [
                            { Key: 3, Value: 10 },
                            { Key: 5, Value: 2 }
                        ],
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

    medicineRequestController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', 'lodash', '$uibModalInstance', 'modalConfig'];

})();