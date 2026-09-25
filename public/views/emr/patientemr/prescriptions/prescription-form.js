(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('prescriptionFormController', prescriptionFormController);

    function prescriptionFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, lodash, $uibModalInstance, modalConfig) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            EncounterId: utl.Session.getEncounterId(),
            ConsultationId: $stateParams.cid ? parseInt($stateParams.cid) : null,
            PharmacyId: 0
        };

        var ItemMrPriceCount = 0;
        var ItemStockCount = 0;
        $scope.lookup = {};
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.currentcontext = {
            attachmentcount: 0,
            copyid: 0,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($stateParams.prescribeid && $stateParams.prescribeid > 0) {
            $scope.currentcontext.prescribeid = parseInt($stateParams.prescribeid)
        }

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.option = 'ticksheet';
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.prescriptionDetails = [];
        $scope.deletedprescriptionDetails = [];
        $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
        $scope.item.PrescriptionPriorityId = 1;
        $scope.item.DurationPeriodId = 1;
        $scope.IsDisabled = false;
        $scope.showbutton = false;

        if ($stateParams.prescribeid && $stateParams.prescribeid > 0) {
            $scope.showbutton = true;
        }

        var parentState = 'patientemr.prescriptions';
        if ($stateParams.ct == 'consultation') {
            parentState = 'patientemr.consultation';
        }

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // Copy from a previous visit (EMR workspace): the ticked medicines of earlier prescriptions are
        // loaded as a NEW draft for the current visit; the doctor reviews and prescribes.
        //   params.copyFromPrescriptionIds: [prescriptionId], params.copyDetailIds: [prescriptionDetailId] (optional filter)
        if (modalConfig && modalConfig.params && angular.isArray(modalConfig.params.copyFromPrescriptionIds)
            && modalConfig.params.copyFromPrescriptionIds.length) {
            $scope.currentcontext.copyFromPrescriptionIds = modalConfig.params.copyFromPrescriptionIds;
            $scope.currentcontext.copyDetailIds = angular.isArray(modalConfig.params.copyDetailIds) ? modalConfig.params.copyDetailIds : null;
            $scope.currentcontext.id = 0;
            $scope.currentcontext.option = 'detail';
        }

        // Callers (e.g. the EMR workspace) can choose the first tab; defaults to the tick sheet.
        var startTabs = ['detail', 'ticksheet', 'panels'];
        if (modalConfig && modalConfig.params && startTabs.indexOf(modalConfig.params.startTab) >= 0) {
            $scope.currentcontext.option = modalConfig.params.startTab;
        }

        if (modalConfig && modalConfig.params && modalConfig.params.context) {
            $scope.currentcontext.context = modalConfig.params.context;
            $scope.item.DoctorId = modalConfig.params.doctid;
            $scope.item.DepartmentId = modalConfig.params.deptid;
        }

        if ($stateParams.context) {
            $scope.currentcontext.context = $stateParams.context;
        }
        if ($stateParams.copyid) {
            $scope.currentcontext.copyid = $stateParams.copyid;
            $scope.currentcontext.option = 'detail';
        }
        if ($scope.currentcontext.context == 'summary') {
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
            if ($scope.currentcontext.encounter) {
                $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
                $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
                $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
            }
            $scope.item.IsDischargeMedication = true;
        }

        var formState = isMainContext() ? 'app.prescription' : 'patientemr.prescription';
        $scope.options = [
            { key: 'detail', name: $translate.instant('patientemr.prescription-form.prescription.lbl') },
            { key: 'ticksheet', name: $translate.instant('patientemr.prescription-form.ticksheet.lbl') },
            { key: 'panels', name: $translate.instant('patientemr.prescription-form.panels.lbl') }
        ];

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
        }

        $scope.applyVisibilityRules = function() {};

        function isMainContext() {
            return $scope.currentcontext.context == 'main';
        }

        $scope.canShowPatientControl = function() {
            return isMainContext();
        };

        $scope.patientChange = function() {
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
        $scope.getPatientInfo = function(scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }
        $scope.panelconfig = {
            paneltypeid: 1,
            selectedlist: []
        };

        function checkExist(item) {
            for (var idx in $scope.prescriptionDetails) {
                if ((item.DrugId == $scope.prescriptionDetails[idx].DrugId) && ($scope.prescriptionDetails[idx].Status == 1)) {
                    return true;
                }
            }
            return false;
        }

        $scope.getItemMasterStockDeailsCallBack = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var ItemCurrentStock = '';
                for (var idx in data.Data) {
                    if (data.Data[idx].Quantity || data.Data[idx].Quantity != '' || data.Data[idx].Quantity != null) {
                        ItemCurrentStock = data.Data[idx].Quantity;
                    }
                }
                if (ItemCurrentStock || ItemCurrentStock != '' || ItemCurrentStock != null) {
                    $scope.prescriptionDetails[ItemStockCount].AvailQuantity = ItemCurrentStock;
                }
            }
            ItemStockCount++;
        };

        $scope.getItemMasterStockDeails = function(ItemMasterId, StoreMasterId) {
            var inputData = {
                Params: [
                    { Key: 1, Value: StoreMasterId },
                    { Key: 2, Value: ItemMasterId }
                ],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            var options = {
                action: 'pharmacy/StockItem/GetStockItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemMasterStockDeailsCallBack
            };

            utl.Http.doAction(options);
        };

        $scope.getItemMasterDeailsCallBack = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var ItemMrPrice = '';
                for (var idx in data.Data) {
                    if (data.Data[idx].MrPrice || data.Data[idx].MrPrice != '' || data.Data[idx].MrPrice != null) {
                        ItemMrPrice = data.Data[idx].MrPrice;
                    }
                }
                if (ItemMrPrice || ItemMrPrice != '' || ItemMrPrice != null) {
                    $scope.prescriptionDetails[ItemMrPriceCount].Price = ItemMrPrice;
                }
            }
            ItemMrPriceCount++;
        };

        $scope.getItemMasterDeails = function(ItemMasterId) {
            var inputData = {
                Params: [
                    { Key: 0, Value: ItemMasterId }
                ],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            var options = {
                action: 'pharmacy/ItemMaster/GetItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemMasterDeailsCallBack
            };

            utl.Http.doAction(options);
        };

        $scope.savePanels = function() {
            $scope.prescriptionDetails.splice(-1, 1);
            for (var idx in $scope.panelconfig.selectedlist) {
                var panelitem = $scope.panelconfig.selectedlist[idx];
                ItemMrPriceCount = 0;
                ItemStockCount = 0;
                for (var indx in panelitem.PanelMasterDetails) {
                    var item = {
                        DrugId: panelitem.PanelMasterDetails[indx].ItemId,
                        DrugGenericId: panelitem.PanelMasterDetails[indx].DrugGenericId,
                        DrugGenericName: panelitem.PanelMasterDetails[indx].DrugGenericName,
                        IsGeneric: false,
                        Dosage: panelitem.PanelMasterDetails[indx].Dosage || '',
                        Duration: panelitem.PanelMasterDetails[indx].Duration || 0,
                        DrugFrequencyId: panelitem.PanelMasterDetails[indx].DrugFrequencyId || -1,
                        DrugRouteId: panelitem.PanelMasterDetails[indx].DrugRouteId || -1,
                        DurationPeriodId: panelitem.PanelMasterDetails[indx].DurationPeriodId || 1,
                        DrugInstructionId: panelitem.PanelMasterDetails[indx].DrugInstructionId || 1,
                        Quantity: panelitem.PanelMasterDetails[indx].Quantity || 0,
                        AvailQuantity: 0,
                        Status: 1,
                        StartDate: utl.Formatter.getCurrentDate(),
                        RxName: panelitem.PanelMasterDetails[indx].DisplayName
                    };
                    if (!checkExist(item)) {
                        $scope.prescriptionDetails.push(item);
                    }
                    $scope.getItemMasterDeails(panelitem.PanelMasterDetails[indx].ItemId);
                    $scope.getItemMasterStockDeails(panelitem.PanelMasterDetails[indx].ItemId, $scope.item.PharmacyId);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        };

        $scope.saveasRxPanel = function() {
            var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            if (userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
                $scope.currentcontext.userId = userObj.Id;
            }
            var drugs = [];
            for (var idx in $scope.prescriptionDetails) {
                var prescriptionDetail = $scope.prescriptionDetails[idx];
                if (!prescriptionDetail.IsGeneric && prescriptionDetail.Status == 1 && prescriptionDetail.DrugName) {
                    var item = {
                        PanelMasterId: 0,
                        PanelTypeId: 1,
                        ItemId: prescriptionDetail.DrugId,
                        DrugGenericId: prescriptionDetail.DrugGenericId,
                        DrugGenericName: prescriptionDetail.DrugGenericName,
                        DisplayName: prescriptionDetail.DrugName,
                        Comments: '',
                        Diagnosis: '',
                        Physiotheraphy: '',
                        Status: 1,
                        DrugFrequencyId: prescriptionDetail.DrugFrequencyId,
                        DrugRouteId: prescriptionDetail.DrugRouteId,
                        Dosage: prescriptionDetail.Dosage,
                        Duration: prescriptionDetail.Duration,
                        DurationPeriodId: prescriptionDetail.DurationPeriodId,
                        DrugInstructionId: prescriptionDetail.DrugInstructionId,
                        Quantity: prescriptionDetail.Quantity,
                        ReviewDate: utl.Formatter.getCurrentDate(),
                    };
                    drugs.push(item);
                }
            }
            utl.Modal.open('app.panelmaster', {
                params: { id: 0, paneltypeid: 1, deptid: $scope.currentcontext.userDepartmentId, userid: $scope.currentcontext.userId, items: drugs }
            });
        };

        $scope.ticksheetconfig = {
            ticksheetmastertypeid: 1,
            selectedlist: [],
            selecteddetail: {},
            departmentid: -1
        };

        $scope.saveTickSheets = function() {
            $scope.prescriptionDetails.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var vMrPrice = 0;
                var vAvailQuantity = 0;
                try {
                    vMrPrice = ticksheetitem.ItemMaster.MrPrice;
                } catch (ex) {}
                try {
                    vAvailQuantity = ticksheetitem.ItemMaster.StockItem.Quantity;
                } catch (ex) {}
                var item = {
                    DrugId: ticksheetitem.ItemId,
                    IsGeneric: false,
                    Duration: 0,
                    DurationPeriodId: 1,
                    Quantity: 0,
                    AvailQuantity: vAvailQuantity,
                    Status: 1,
                    Price: vMrPrice,
                    StartDate: utl.Formatter.getCurrentDate(),
                    DrugName: ticksheetitem.DrugMaster.DrugName,
                    DrugCode: ticksheetitem.DrugMaster.DrugCode,
                    DrugRouteId: ticksheetitem.DrugMaster.DrugRouteId,
                    DrugGenericId: ticksheetitem.DrugMaster.GenericId,
                    DrugGenericCode: ticksheetitem.DrugMaster.GenericCode,
                    DrugGenericName: ticksheetitem.DrugMaster.GenericName,
                    DrugFrequencyId: ticksheetitem.DrugMaster.DrugFrequencyId,
                    Dosage: ticksheetitem.DrugMaster.MaxDosagePerDay,
                    DrugFormId: ticksheetitem.DrugMaster.DrugFormId,
                    Duration: ticksheetitem.DrugMaster.Duration,
                    DurationPeriodId: ticksheetitem.DrugMaster.DurationPeriodId,
                    DrugInstructionId: ticksheetitem.DrugMaster.DrugInstructionId,
                };
                $scope.computeQuantity(item);
                if (!checkExist(item)) {
                    $scope.prescriptionDetails.push(item);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        };

        $scope.drugprofiledetails = function(DrugId) {
            utl.Modal.open('app.drugprofile', {
                params: { drugid: DrugId },
                confirmCallback: $scope.getList
            });
        };

        function getNewItem() {
            var detail = {
                Id: 0,
                PatientId: $scope.item.PatientId,
                DrugId: -1,
                DrugFrequencyId: $scope.item.DrugFrequencyId,
                DrugRouteId: $scope.item.DrugRouteId,
                PrescriptionDate: $scope.item.PrescriptionDate,
                Dosage: $scope.item.Dosage,
                DurationPeriodId: $scope.item.DurationPeriodId,
                Status: 1,
                tabindex: $scope.tabindexmap.detailtabindex++
            };
            detail.autoSearchName = getAutoSearchName();
            return detail;
        }

        function getAutoSearchName() {
            return 'drug_';
        }

        $scope.addTickSheet = function() {
            var testmaster = $scope.ticksheetconfig.selecteddetail.DrugMaster;
            var currentItem = getNewItem();
            currentItem.DrugId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.DrugName = testmaster.DrugName;
            currentItem.DrugCode = testmaster.DrugCode;
            utl.Modal.open('patientemr.prescriptiondetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, current_item: currentItem },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.addNewLineItem = function() {
            var prescriptionDetail = {
                Id: 0,
                DrugId: -1,
                IsGeneric: false,
                GenericId: -1,
                Dosage: 0,
                DrugRouteId: -1,
                DrugFrequencyId: -1,
                Duration: 0,
                DurationPeriodId: 1,
                Quantity: 0,
                Price: 0,
                AvailQuantity: 0,
                DrugInstructionId: -1,
                Status: 1,
                PrescriptionIdentifier: null,
                DisplayPrecriptionStatus: null,
                StartDate: utl.Formatter.getCurrentDate(),
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                prescriptionDetail.PrescriptionId = $scope.currentcontext.id;
            }
            $scope.prescriptionDetails.push(prescriptionDetail);
        };

        $scope.canShowPrescriptionArea = function() {
            return $scope.currentcontext.option == 'detail';
        };

        $scope.canShowTickSheetArea = function() {
            return $scope.currentcontext.option == 'ticksheet';
        };

        $scope.canShowPanelsArea = function() {
            return $scope.currentcontext.option == 'panels';
        };

        $scope.openattachments = function() {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.item.PatientId, itemid: $scope.item.Id, objecttypeid: 1 },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            }
        };

        $scope.getPatientAttachmentsCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        };

        $scope.getPatientAttachments = function() {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.item.PatientId }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function() {
            $stateParams.id = $scope.currentcontext.id;
            if ($stateParams.id > 0) {
                $state.go('patientemr.prescription', {
                    id: 0,
                });
            }
            if ($stateParams.id > 0 && $scope.currentcontext.context == 'dashboard') {
                $state.go('patientemr.prescription', {
                    id: 0,
                    context: $scope.currentcontext.context
                });
            } else if ($stateParams.id == 0 || $scope.currentcontext.id == 0)
                $scope.clear();
        };

        $scope.print = function() {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/Prescription/PrintPrescription',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
            if ($scope.currentcontext.context == 'dashboard') {
                $state.go('patientemr.emrdashboard')
            }
        };

        $scope.onDetailSave = function(itemFromModal) {
            var isaddnew = true;
            $scope.prescriptionDetails.splice(-1, 1);
            for (var idx in $scope.prescriptionDetails) {
                var item = $scope.prescriptionDetails[idx];
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
                    $scope.prescriptionDetails.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        };

        $scope.editPrescriptionDetail = function(item) {
            item.currenteditable = true;

            utl.Modal.open('patientemr.prescriptiondetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, current_item: item, isedit: true },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.clear = function() {
            $scope.IsDisabled = false;
            $scope.prescriptionDetails = [];
            $scope.addNewLineItem();
        };

        function checkDuplicateEnrty() {}

        $scope.alternateDetails = function(idx, item) {
            utl.Modal.open('app.prescriptionalternates', {
                params: {
                    genericid: item.DrugGenericId,
                    drugid: item.DrugId,
                    pharmacyid: $scope.item.PharmacyId,
                    drugcode: item.DrugCode,
                    drugname: item.DrugName,
                    lineindex: idx
                },
                confirmCallback: replaceAlternate
            });
        };

        function replaceAlternate(alternatedata) {
            var ActualItem = {};
            var alternateprescriptionDetail = {};
            ActualItem.DrugId = alternatedata.drugid;
            $scope.CleanDrugItem(ActualItem);
            var StockQty = 0;
            if (alternatedata.ItemData.StockItem) {
                StockQty = alternatedata.ItemData.StockItem.Quantity;
            }
            alternateprescriptionDetail = {
                Id: 0,
                DrugId: alternatedata.ItemData.DrugId || -1,
                DrugCode: alternatedata.ItemData.DrugCode || '',
                DrugName: alternatedata.ItemData.DrugName || '',
                DrugRouteId: alternatedata.ItemData.DrugMaster.DrugRouteId || -1,
                DrugFrequencyId: alternatedata.ItemData.DrugMaster.DrugFrequencyId || -1,
                Dosage: alternatedata.ItemData.DrugMaster.MaxDosagePerDay || 0,
                DrugFormId: alternatedata.ItemData.DrugMaster.DrugFormId || -1,
                Price: parseFloat(alternatedata.ItemData.MrPrice).toFixed(2) || 0,
                AvailQuantity: StockQty || 0,
                DrugGenericId: alternatedata.ItemData.DrugMaster.GenericId || -1,
                DrugGenericCode: alternatedata.ItemData.DrugMaster.GenericCode || '',
                DrugGenericName: alternatedata.ItemData.DrugMaster.GenericName || '',
                Duration: alternatedata.ItemData.DrugMaster.Duration || 0,
                DurationPeriodId: alternatedata.ItemData.DrugMaster.DurationPeriodId || 1,
                DrugInstructionId: alternatedata.ItemData.DrugMaster.DrugInstructionId || -1,
                Status: 1
            };
            $scope.prescriptionDetails.push(alternateprescriptionDetail);
            $scope.addNewLineItem();
        }

        $scope.CleanDrugItem = function(item) {
            for (var count = 0; count < $scope.prescriptionDetails.length; count++) {
                var cllitem = $scope.prescriptionDetails[count];
                if (cllitem.DrugId == item.DrugId) {
                    cllitem.Status = 2;
                    $scope.deletedprescriptionDetails.push(cllitem);
                    var index1 = $scope.prescriptionDetails.indexOf(cllitem);
                    $scope.prescriptionDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.prescriptionDetails) {
                var clsitem = $scope.prescriptionDetails[clsidx];
                if (clsitem.DrugId == -1) {
                    clsitem.Status = 2;
                    $scope.deletedprescriptionDetails.push(clsitem);
                    var index2 = $scope.prescriptionDetails.indexOf(clsitem);
                    $scope.prescriptionDetails.splice(index2, 1);
                }
            }
        };

        $scope.drugChanged = function(idx, item) {
            // only rows that have a drug can be duplicates (blank rows share DrugId -1/null)
            var linesWithDrug = $scope.prescriptionDetails.filter(function (line) {
                return line.Status === 1 && line.DrugId > 0;
            });
            var isDuplicate = utl.Common.isDuplicateRec(linesWithDrug, { pivotkey: 'DrugId', displaykey: 'DrugName' }, true);
            if (isDuplicate) {
                item.RxName = '';
                item.DrugId = null;
                return;
            }
            if (item.GenericId == -1) {
                item.DrugCode = item.SelectedItem.DrugCode;
                item.DrugName = item.SelectedItem.DrugName;
                item.DrugRouteId = item.SelectedItem.DrugRouteId || -1;
                item.DrugFrequencyId = item.SelectedItem.DrugFrequencyId || -1;
                item.Dosage = item.SelectedItem.MaxDosagePerDay || 0;
                item.DrugFormId = item.SelectedItem.DrugFormId || -1;
                // drugs without a stock/item master have no MRP; show 0.00 rather than NaN
                var mrPrice = parseFloat(item.SelectedItem.MrPrice);
                item.Price = isNaN(mrPrice) ? '0.00' : mrPrice.toFixed(2);
                item.AvailQuantity = item.SelectedItem.Quantity || 0;
                item.DrugGenericId = item.SelectedItem.GenericId || -1;
                item.DrugGenericCode = item.SelectedItem.GenericCode;
                item.DrugGenericName = item.SelectedItem.GenericName;
                item.Duration = item.SelectedItem.Duration || 0;
                item.DurationPeriodId = item.SelectedItem.DurationPeriodId || 1;
                item.DrugInstructionId = item.SelectedItem.DrugInstructionId || -1;
            } else if (item.GenericId) {
                item.GenericId = item.GenericId;
                item.GenericCode = item.Code;
                item.GenericName = item.GenericName;
            }

            var activeRecords = $filter('filterArrayItems')($scope.prescriptionDetails, [
                { search: 1, fields: ['Status'] }
            ]);
            var lastIndex = activeRecords.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
            $scope.computeQuantity(item);
        };

        $scope.computeQuantity = function(item) {
            var iscalqty = false;
            if (item.SelectedItem && item.SelectedItem.IsCalculateFrequencyQty) {
                iscalqty = item.SelectedItem.IsCalculateFrequencyQty;
            }
            if (item.DrugFrequencyId != -1 && item.Duration && item.DurationPeriodId != -1 && iscalqty) {
                var drugFrequencyObj = utl.Lookup.getObject($scope.lookup.DrugFrequency, item.DrugFrequencyId);
                var noOfTimes = drugFrequencyObj.NoOfTimes;
                var totalDays = 0;
                if (item.DurationPeriodId == 1) { //Days
                    totalDays = item.Duration * 1;
                } else if (item.DurationPeriodId == 2) { //Weeks
                    totalDays = item.Duration * 7;
                } else if (item.DurationPeriodId == 3) { //Months
                    totalDays = item.Duration * 30;
                }
                item.Quantity = noOfTimes * totalDays;
            } else if (item.DrugFrequencyId != -1 && item.Duration && item.DurationPeriodId != -1 && !iscalqty) {
                item.Quantity = 1;
            }
        };


        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
            $scope.item.AvailQuantity = 0;
            item.Dosage = 0;
            item.DrugCode = 0;
            item.DrugFrequencyId = 0;
            // item.DrugId = 0;
            item.DrugName = 0;
            item.DrugRouteId = 0;
            item.Duration = 0;
            item.DurationPeriodId = 0;
            item.DrugId = 0;
            item.DrugGenericId = 0;
            item.DrugGenericCode = '';
            item.DrugGenericName = '';
            // keep one empty line so another medicine can always be added
            var hasBlankLine = $scope.prescriptionDetails.some(function (line) {
                return line.Status === 1 && !(line.DrugId > 0) && !(line.GenericId > 0);
            });
            if (!hasBlankLine) {
                $scope.addNewLineItem();
            }
            // called from the confirm dialog, outside Angular's digest: refresh the grid now
            $scope.$applyAsync();
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.DeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/Prescription/DeletePrescription',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.backToList();
        };

        $scope.draftDelete = function() {
            utl.Dialog.confirmDelete($scope.DeleteConfirmed, $scope.currentcontext.id);
        };

        $scope.deletePrescriptionDetail = function(idx, selectedItem) {
            var name = selectedItem.DrugName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        };

        $scope.getPrescriptionDetailsCallback = function(scope, res, options, hasError) {
            $scope.prescriptionDetails = res.Data || [];
            $scope.addNewLineItem();
        };

        $scope.copyDetailsCallback = function(scope, res, options, hasError) {
            $scope.prescriptionDetails = res.Data || [];
            for (var idx in $scope.prescriptionDetails) {
                $scope.prescriptionDetails[idx].Id = 0;
            }
            $scope.addNewLineItem();
        };

        $scope.getPrescriptionDetails = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.id }
                    ]
                };
                var options = {
                    action: 'emr/prescriptiondetail/GetPrescriptionDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPrescriptionDetailsCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyid && $scope.currentcontext.copyid > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.copyid }
                    ]
                };
                var options = {
                    action: 'emr/prescriptiondetail/GetPrescriptionDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.copyDetailsCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyFromPrescriptionIds) {
                loadCopiedLines($scope.currentcontext.copyFromPrescriptionIds, $scope.currentcontext.copyDetailIds);
            } else {
                var lastIndex = $scope.prescriptionDetails.length - 1;
                if (lastIndex < 0) {
                    $scope.addNewLineItem();
                }
            }
        };

        /** A saved prescription line turned into a new, unsaved line of this prescription. */
        function toCopiedLine(source) {
            var line = angular.copy(source);
            ['Id', 'PrescriptionId', 'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy', 'Rev', 'DispensedQuantity',
                'AdministeredQuantity', 'AdministerStatusId', 'IsAllergyOverride', 'AllergyOverrideReason',
                'AllergyOverrideBy', 'AllergyOverrideAt', 'PrecriptionStatusId', '$$hashKey'].forEach(function (key) {
                delete line[key];
            });
            line.Id = 0;
            line.Status = 1;
            line.StartDate = utl.Formatter.getCurrentDate();
            line.tabindex = $scope.tabindexmap.detailtabindex++;
            return line;
        }

        function loadCopiedLines(prescriptionIds, detailIds) {
            var pending = prescriptionIds.length;
            var copied = [];
            prescriptionIds.forEach(function (prescriptionId) {
                utl.Http.doAction({
                    action: 'emr/prescriptiondetail/GetPrescriptionDetails',
                    data: { Params: [{ Key: 2, Value: prescriptionId }] },
                    type: 'post',
                    onComplete: function (scope, res) {
                        (res && res.Data || []).forEach(function (line) {
                            var active = line.Status === undefined || line.Status === 1;
                            var wanted = !detailIds || detailIds.indexOf(line.Id) >= 0;
                            var alreadyCopied = copied.some(function (c) { return c.DrugId > 0 && c.DrugId === line.DrugId; });
                            if (active && wanted && !alreadyCopied && (line.DrugId > 0 || line.GenericId > 0)) {
                                copied.push(toCopiedLine(line));
                            }
                        });
                        pending--;
                        if (pending === 0) {
                            $scope.prescriptionDetails = copied;
                            $scope.addNewLineItem();
                            if (copied.length) {
                                utl.Alert.showSuccessMsg(copied.length + ' medicine(s) copied from the previous visit. Review and click Prescribe.');
                            }
                        }
                    }
                });
            });
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;

            if ($scope.item.PrecriptionStatusId == 2 || $scope.item.PrecriptionStatusId == 3) {
                $scope.IsDisabled = true;
            }
            if ($scope.currentcontext.prescribeid) {
                $scope.IsDisabled = false;
            }
            if (data.PrecriptionStatusId == 1) {
                $scope.item.DisplayPrecriptionStatus = 'Draft';
            }
            if (data.PrecriptionStatusId == 2) {
                $scope.item.DisplayPrecriptionStatus = 'Cancelled';
            }
            if (data.PrecriptionStatusId == 3) {
                $scope.item.DisplayPrecriptionStatus = 'Completed';
            }
            $scope.applyVisibilityRules();
            $scope.getData();
            $scope.patientChange();
            $scope.getPatientAttachments();
        };

        $scope.copyItemCallback = function(scope, data, options, hasError) {
            $scope.item.DoctorId = data.DoctorId;
            $scope.item.PatientId = data.PatientId;
            $scope.item.DepartmentId = data.DepartmentId;
            $scope.item.PrescriptionPriorityId = data.PrescriptionPriorityId;
            $scope.item.PharmacyId = data.PharmacyId;
            $scope.item.EncounterId = data.EncounterId;
        };

        $scope.getItem = function() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/prescription/GetPrescriptionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyid && $scope.currentcontext.copyid > 0) {
                var options = {
                    action: 'emr/prescription/GetPrescriptionById',
                    data: { Id: $scope.currentcontext.copyid },
                    type: 'post',
                    onComplete: $scope.copyItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.previousmedication = function() {
            utl.Modal.open('patientemr.previousmedications', {
                params: {}
            });
        };

        $scope.patientallergy = function() {
            utl.Modal.open('patientemr.patientallergies', {
                params: { pid: $scope.currentcontext.pid }
            });
        };

        $scope.vital = function() {
            utl.Modal.open('patientemr.patientvitals', {
                params: { pid: $scope.currentcontext.pid }
            });
        };

        $scope.getDataCallback = function(scope, data, options, hasError) {
            $scope.Data = data.Data[0];
        };

        $scope.getData = function() {
            var inputData = null;
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ]
                };
            }
            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDataCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
            if ($scope.currentcontext.context == 'dashboard') {
                $state.go('patientemr.rxprescriptions');
            }
            // else {
            //     $state.go(parentState, $scope.currentcontext.pid);
            // }
        };

        function openAppointmentForm(appnmtDate) {
            utl.Modal.open('app.appointment', {
                params: {
                    id: 0,
                    ct: 'followup',
                    pid: $scope.currentcontext.pid,
                    appointmentDate: appnmtDate,
                    doctorId: $scope.currentcontext.encounter.DoctorId,
                    deptId: $scope.currentcontext.encounter.DepartmentId
                },
                confirmCallback: $scope.confirmCallback
            });
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                if ($scope.currentcontext.ismodal) {
                    $scope.confirmCallback();
                }
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                if ($scope.currentcontext.ismodal) {
                    $scope.confirmCallback();
                }
                $scope.currentcontext.id = data;
            }
            if ($scope.currentcontext.context != 'summary' && $scope.currentcontext.context != 'ipemr') {
                if (options.data.Data.Header.PrecriptionStatusId == 3) {
                    $scope.print();
                    $state.go('app.checkedinpatients');
                }
            }
            if ($scope.currentcontext.context == 'ipemr') {
                $scope.currentcontext.prescribeid = null;
                $scope.showbutton = false;
            }
            // openAppointmentForm(options.data.Data.Header.ReviewDate);
            loadData();
        };

        $scope.saveDraft = function() {
            $scope.saveItem(1);
        };

        $scope.prescribe = function() {
            $scope.saveItem(3);
        };

        $scope.onOrderConfirmed = function() {
            $scope.saveItem(3);
        };

        $scope.prescribeAndOrder = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.prescription-form.ordermsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onOrderConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelConfirmed = function() {
            $scope.saveItem(2);
        };

        $scope.saveCancelled = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.prescription-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.prescriptionDetails, [
                { search: 1, fields: ['Status'] }
            ]);
            var drugLines = activeRecords.filter(function (line) {
                return line.DrugId > 0 || line.GenericId > 0;
            });
            if (drugLines.length === 0) {
                utl.Alert.showErrorMsg('Add at least one drug to the prescription.');
                return false;
            }
            // A drug name typed into a row but not picked from the search list has no DrugId and would be
            // silently left out of the saved prescription -- stop and say so instead.
            // (rows follow the grid order; a row with a picked drug shows no search box)
            var gridRows = document.querySelectorAll('.rxf-detail #mainresponsivetablecontrol > table > tbody > tr');
            for (var r = 0; r < activeRecords.length && r < gridRows.length; r++) {
                var rowInput = gridRows[r].querySelector('td[data-col="drug"] input[type=text]');
                var typed = rowInput ? (rowInput.value || '').trim() : '';
                var rowLine = activeRecords[r];
                if (typed && !(rowLine.DrugId > 0) && !(rowLine.GenericId > 0)) {
                    var safeText = typed.replace(/[<>&"']/g, '');
                    utl.Alert.showErrorMsg('"' + safeText + '" was not picked from the list. Select the drug from the search results (or clear that row).');
                    rowInput.focus();
                    return false;
                }
            }
            // [field check, label, element id prefix] -- ids use the row index of the visible (active) rows
            var checks = [
                [function (l) { return !l.Dosage || l.Dosage === 0 || l.Dosage === '0'; }, 'Dosage', '#dgdoesage'],
                [function (l) { return !l.DrugRouteId || l.DrugRouteId == -1; }, 'Route', '#dgroute'],
                [function (l) { return !l.DrugFrequencyId || l.DrugFrequencyId == -1; }, 'Frequency', '#dgfreq'],
                [function (l) { return !l.Duration || l.Duration == 0; }, 'Duration', '#dgduration'],
                [function (l) { return !l.DurationPeriodId || l.DurationPeriodId == 0 || l.DurationPeriodId == -1; }, 'Period', '#dgduraperiod'],
                [function (l) { return !l.Quantity || l.Quantity == 0; }, 'Qty', '#Quantity']
            ];
            for (var idx = 0; idx < activeRecords.length; idx++) {
                var line = activeRecords[idx];
                if (!(line.DrugId > 0)) {
                    continue;
                }
                for (var c = 0; c < checks.length; c++) {
                    if (checks[c][0](line)) {
                        var drugName = line.DrugName || (line.SelectedItem && line.SelectedItem.DrugName) || ('line ' + (idx + 1));
                        utl.Alert.showErrorMsg('Please enter ' + checks[c][1] + ' for ' + drugName + '.');
                        $(checks[c][2] + idx).focus();
                        return false;
                    }
                }
            }
            return true;
        }

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        };

        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        };

        $scope.saveItem = function(StatusId) {
            if ($scope.item.PrecriptionStatusId != 3 && !utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {
                $scope.item.PrecriptionStatusId = StatusId;
                var lines = getLinesForSave();
                var actionName = 'emr/prescription/AddPrescription';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/prescription/UpdatePrescription';
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

        $scope.addDiagnosisComments = function() {
            if (!$scope.item.DiagnosisComments) {
                $scope.item.DiagnosisComments = '';
            }
            var provisionaldiagnosis = $('#provisionaldiagnosis').val();
            $('#provisionaldiagnosis').val('');
            if ($scope.item.DiagnosisComments.length == 0)
                $scope.item.DiagnosisComments += provisionaldiagnosis;
            else
                $scope.item.DiagnosisComments += ',' + provisionaldiagnosis;

            //console.log(provisionaldiagnosis);
        }

        $scope.addSurgeryComments = function() {

            if (!$scope.item.SurgeryComments) {
                $scope.item.SurgeryComments = '';
            }
            var surgerydata = $('#surgeryname').val();
            $('#surgeryname').val('');
            if ($scope.item.SurgeryComments.length == 0)
                $scope.item.SurgeryComments += surgerydata;
            else
                $scope.item.SurgeryComments += ',' + surgerydata;

            //console.log(surgerydata);
        }



        $scope.previousprescription = function() {
            utl.Modal.open('patientemr.previousprescription', {
                params: { pid: $scope.currentcontext.pid }
            });
        };

        $scope.addclinicalremark = function() {
            utl.Modal.open('app.clinicalremarkform', {
                params: { id: 0, type: 1, context: 'modal' },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.getAdviceInstrCallback = function(scope, data, options, hasError) {
            $scope.AdviceInstr = data;
            if ($scope.item.Comments == null) {
                $scope.item.Comments = '';
                $scope.item.Comments += $scope.AdviceInstr.ClinicalRemarks;
            } else if ($scope.item.Comments) {
                var comment = '';
                comment = $scope.AdviceInstr.ClinicalRemarks;
                $scope.item.Comments += ',' + comment;
            } else if ($scope.item.Comments == '') {
                $scope.item.Comments += $scope.AdviceInstr.ClinicalRemarks;
            }
        };

        $scope.getAdviceInstr = function() {
            if ($scope.item.AdviceListId && $scope.item.AdviceListId > 0) {
                var options = {
                    action: 'generalmaster/ClinicalRemark/GetClinicalRemarkById',
                    data: { Id: $scope.item.AdviceListId },
                    type: 'post',
                    onComplete: $scope.getAdviceInstrCallback
                };
                utl.Http.doAction(options);
            }
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.prescriptionDetails) {
                var item = $scope.prescriptionDetails[idx];
                if (item.Status === 1 && (item.DrugId > 0 || item.GenericId > 0)) {
                    item.PharmacyId = $scope.item.PharmacyId;
                    result.push(item);
                } else if (item.Status === 2 && item.Id > 0) {
                    // a saved line the user removed: send it so the server marks it deleted
                    result.push(item);
                }
            }
            return result;
        }

        $scope.doctorChange = function() {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            if (doctorObj) {
                $scope.item.DepartmentId = doctorObj.DepartmentId;
            }
        };

        function loadData() {
            $scope.getItem();
            $scope.getPrescriptionDetails();
            $scope.getPatientAttachments();
        }

        vm.drugcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'DrugCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'DrugName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qty', field: 'Quantity', datatype: 'string', headercls: 'td-qty', fieldcls: 'td-qty' },
                { header: 'Mrp', field: 'MrPrice', datatype: 'string', headercls: 'td-mrp', fieldcls: 'td-mrp' },
                { header: 'Type', field: 'DrugType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                { header: 'Generic', field: 'GenericMaster', datatype: 'string', headercls: 'td-generic', fieldcls: 'td-generic' },
                { header: 'Forms', field: 'DrugForm', datatype: 'string', headercls: 'td-form', fieldcls: 'td-form' },
                { header: 'Frequency', field: 'DrugFrequency', datatype: 'string', headercls: 'td-frequency', fieldcls: 'td-frequency' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DrugMaster/GetDrugMasters',
            formatdisplay: formatselecteddrugs,
            presearch: presearchdrugs,
            postsearch: postsearchdrugs
        };

        function formatselecteddrugs() {
            var selectedItem = vm.drugcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DrugName + '(' + selectedItem.DrugCode + ')'].join('  ');
            } else if (vm.drugcontrolconfig.rowdata) {
                result = [vm.drugcontrolconfig.rowdata.DrugCode, vm.drugcontrolconfig.rowdata.DrugName].join(' ');
            }
            return result;
        }

        function presearchdrugs() {
            var query = vm.drugcontrolconfig.query;
            var inputData = {
                Params: [{ Key: 5, Value: $scope.item.PharmacyId }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.drugcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query }, { Key: 6, Value: true });
            }
            vm.drugcontrolconfig.searchparams = inputData;
        }

        function postsearchdrugs() {
            for (var idx in vm.drugcontrolconfig.result) {
                var item = vm.drugcontrolconfig.result[idx];
                item.DrugCode = item.DrugCode;
                item.DrugName = item.DrugName;
                if (item.DrugType)
                    item.DrugType = item.DrugType.Description;
                if (item.ItemMaster) {
                    if (item.ItemMaster.StockItem) {
                        item.Quantity = item.ItemMaster.StockItem.Quantity;
                    }
                    item.MrPrice = parseFloat(item.ItemMaster.MrPrice).toFixed(2);
                }
                if (item.GenericMaster)
                    item.GenericMaster = item.GenericMaster.GenericName;
                if (item.DrugForm)
                    item.DrugForm = item.DrugForm.Description;
                if (item.DrugFrequency)
                    item.DrugFrequency = item.DrugFrequency.Name;
            }
        }

        vm.genericcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'GenericName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Type', field: 'AllergenType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedgenerics,
            presearch: presearchgenerics,
            postsearch: postsearchgenerics
        };

        function formatselectedgenerics() {
            var selectedItem = vm.genericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.genericcontrolconfig.rowdata) {
                result = [vm.genericcontrolconfig.rowdata.Code, vm.genericcontrolconfig.rowdata.GenericName].join(' ');
            }
            return result;
        }

        function presearchgenerics() {
            var query = vm.genericcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.genericcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.genericcontrolconfig.searchparams = inputData;
        }

        function postsearchgenerics() {
            for (var idx in vm.genericcontrolconfig.result) {
                var item = vm.genericcontrolconfig.result[idx];
                item.GenericCode = item.Code;
                item.GenericName = item.GenericName;
                item.AllergenType = item.AllergenType.Description;
            }
        }

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
                $scope.item.Comments = selectedItem.PrescriptionAdvice;
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DiagnosisName', field: 'DiagnosisName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Version', field: 'Version', datatype: 'string', headercls: 'td-Version', fieldcls: 'td-Version' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-Speciality', fieldcls: 'td-Speciality' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {

            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')' + selectedItem.Version].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                    vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                item.Version = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }

        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Procedure Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            // $scope.item.ProcedureName = result;
            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
            }
        }

        vm.physiocontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.physiocontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.physiocontrolconfig.rowdata) {
                result = [vm.physiocontrolconfig.rowdata.ServiceCode, vm.physiocontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.physiocontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                    { Key: 28, Value: true },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.physiocontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.physiocontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.physiocontrolconfig.result) {
                var item = vm.physiocontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
            }
        }

        function checkDrugAllergyCallback(scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.currentcontext.isPatientHasAllergy = true;
            }
        }

        $scope.checkDrugAllergy = function() {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: 1 },
                    { Key: 4, Value: 1 }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                onComplete: checkDrugAllergyCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                if (key == 'StoreMaster' && $scope.item.PharmacyId === 0) {
                    /* $scope.item.PharmacyId = value[0].Id; */
                    for (var idx in value) {
                        var store = value[idx];
                        if (store.IsDefaultPrescriptionStore) {
                            $scope.item.PharmacyId = store.Id;
                        }
                    }
                }
            });
            loadData();
            $scope.checkDrugAllergy();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Department" },
                { "Key": "User" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "PrescriptionPriority" },
                { "Key": "DrugRoute" },
                { "Key": "DrugFrequency" },
                { "Key": "DrugInstruction" },
                {
                    "Key": "ClinicalRemarks",
                    Request: {
                        Params: [{ Key: 3, Value: 1 }]
                    },
                },
                { "Key": "DurationPeriod", Default: false },
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 2, Value: 1 },
                            { Key: 3, Value: 2 },
                            { Key: 7, Value: 2 }
                        ]
                    },
                    Default: false
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

        $scope.initLookup();
    }

    prescriptionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', 'lodash', '$uibModalInstance', 'modalConfig'];

})();