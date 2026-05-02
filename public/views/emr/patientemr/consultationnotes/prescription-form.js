(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('prescriptionFormmodalController', prescriptionFormmodalController);

    function prescriptionFormmodalController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;

        uibButtonConfig.activeClass="opt-selected";
        $scope.item = {
        };
        $scope.currentcontext = {
            attachmentcount : 0
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.option = 'detail';
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.prescriptionDetails = [];
        $scope.item.DoctorId = utl.Session.getCurrentUserId();
        $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
        $scope.item.PrescriptionPriorityId = 1;
        $scope.item.DurationPeriodId = 1;
        $scope.item.DepartmentId = utl.Session.getCurrentDepartmentId();
        $scope.options = [
            { key : 'detail', name : $translate.instant('patientemr.prescription-form.prescription.lbl')},
            { key : 'ticksheet', name : $translate.instant('patientemr.prescription-form.ticksheet.lbl')},
            { key : 'panels', name : $translate.instant('patientemr.prescription-form.panels.lbl')}
        ]
        //Visibility rules starts    
        $scope.applyVisibilityRules = function () {
            // Draft
            if ($scope.item.PrecriptionStatusId != 2 || $scope.item.PrecriptionStatusId != 3) {
                $scope.canShowSaveBtn = true;
                $scope.canShowPrescribeBtn = true;
                $scope.canShowPrescribeOrderBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
            }
            // Cancelled
            if ($scope.item.PrecriptionStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // Completed
            if ($scope.item.PrecriptionStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
        }

        //Visibility rules ends

        //Panel area starts
        $scope.panelconfig = {
            paneltypeid : 1,
            selectedlist : []
        };
		

        function checkExist(item) {
            for(var idx in $scope.prescriptionDetails) {
                if((item.DrugId == $scope.prescriptionDetails[idx].DrugId) && ($scope.prescriptionDetails[idx].Status==1)) {
                    return true;
                }
            }
            return false
        }

        $scope.savePanels = function() {
            $scope.prescriptionDetails.splice(-1, 1);
            for(var idx in $scope.panelconfig.selectedlist) {
                var panelitem = $scope.panelconfig.selectedlist[idx];
                for(var indx in panelitem.PanelMasterDetails) {
                    var item = {
                        DrugId : panelitem.PanelMasterDetails[indx].ItemId, IsGeneric: false, Dosage: '', Duration: 0, DurationPeriodId: 1, Quantity: 0,
                        AvailQuantity: 220, Status: 1, StartDate : utl.Formatter.getCurrentDate(), RxName : panelitem.PanelMasterDetails[indx].DisplayName
                    }
                    if(!checkExist(item)) {
                        $scope.prescriptionDetails.push(item);
                    }
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }
        
        $scope.saveasRxPanel = function() {
            var userObj = utl.Lookup.getObject($scope.lookup.User,utl.Session.getCurrentUserId());
            if(userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
                $scope.currentcontext.userId = userObj.Id;
            }
            var drugs = [];
            for(var idx in $scope.prescriptionDetails) 
            {
                var prescriptionDetail = $scope.prescriptionDetails[idx];
                if(!prescriptionDetail.IsGeneric && prescriptionDetail.Status == 1 && prescriptionDetail.RxName)
                {
                    var item = { PanelMasterId : 0, PanelTypeId : 1, 
                            ItemId : prescriptionDetail.DrugId, DisplayName : prescriptionDetail.RxName, Comments : '', Status : 1 };
                    drugs.push(item);
                }
            }
            utl.Modal.open('app.panelmaster', {
                    params: { id:0 , paneltypeid : 1, deptid : $scope.currentcontext.userDepartmentId, userid : $scope.currentcontext.userId, items : drugs }
                }
            );
        }
        //Panel area ends

        //TickSheet area begins
        $scope.ticksheetconfig = {
            ticksheetmastertypeid : 1,
            selectedlist : [],
            selecteddetail : {},
            departmentid : -1
        };

        $scope.saveTickSheets = function() {
            $scope.prescriptionDetails.splice(-1, 1);
            for(var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var item = {
                        DrugId : ticksheetitem.ItemId, IsGeneric: false, Dosage: '', Duration: 0, DurationPeriodId: 1, Quantity: 0,
                        AvailQuantity: 220, Status: 1, StartDate : utl.Formatter.getCurrentDate(), RxName : ticksheetitem.ItemName
                    }
                    if(!checkExist(item)) {
                        $scope.prescriptionDetails.push(item);
                    }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.addTickSheet = function() {
            utl.Modal.open('patientemr.prescriptiondetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, itemid : $scope.ticksheetconfig.selecteddetail.ItemId },
                confirmCallback: $scope.onDetailSave
            }
            );
        }
        //TickSheet area ends

        $scope.addNewLineItem = function () {
            var prescriptionDetail = {
                Id: 0,
                DrugId: -1,
                IsGeneric: false,
                GenericId: -1,
                Dosage: '',
                DrugRouteId: -1,
                DrugFrequencyId: -1,
                Duration: 0,
                DurationPeriodId: 1,
                Quantity: 0,
                AvailQuantity: 220,
                Status: 1,
                StartDate : utl.Formatter.getCurrentDate()
                /*  RxName: '',
                  AdminInstructions: '',
                  PharmacyId: -1,
                  StartDate: '',
                  Diagnosis: '',
                  Price: '',
                  SpecialApprovalId: '',
                  Comments: '',
                  DrugFormId: '',
                  DrugFormName: '',
                  NoOfRefills: '',
                  PrescriptionPriorityId: '',
                  GuarantorId: '',
                  EndDate: '',
                  SubstitutionAllowedId: '',
                  TaperingOrderId: '',
                  RefusetoBuyId: '' */
            };

            if ($scope.currentcontext.id > 0) {
                prescriptionDetail.PrescriptionId = $scope.currentcontext.id;
            }
            $scope.prescriptionDetails.push(prescriptionDetail);
        }

        $scope.canShowPrescriptionArea = function() {
                return $scope.currentcontext.option=='detail';
        }

        $scope.canShowTickSheetArea = function() {
                return $scope.currentcontext.option=='ticksheet';
        }

        $scope.canShowPanelsArea = function() {
                return $scope.currentcontext.option=='panels';
        }

        $scope.openattachments = function() {
            if($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                        params: { pid:$scope.item.PatientId, itemid : $scope.item.Id, objecttypeid : 1 },
                        confirmCallback: $scope.getPatientAttachments,
                        cancelCallback: $scope.getPatientAttachments
                });
            }
        }

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }
        $scope.getPatientAttachments = function () {

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
        }

        $scope.add_new = function () {
            utl.Modal.open('patientemr.prescriptiondetail', {
                params: { id: 0, pid: $scope.currentcontext.pid },
                confirmCallback: $scope.onDetailSave
            }
            );
        }

         $scope.historypage  = function () {
            utl.Modal.open('app.appointmenthistory', {
                params: { id: 0, pid: $scope.currentcontext.pid },
                confirmCallback: $scope.onDetailSave
            }
            );
        }

		  $scope.historypage  = function () {
            utl.Modal.open('app.appointmenthistory', {
                params: { id: 0, pid: $scope.currentcontext.pid },
                confirmCallback: $scope.onDetailSave
            }
            );
        }


     $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/Prescription/PrintPrescription',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }




        $scope.onDetailSave = function (itemFromModal) {
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
                if(!checkExist(itemFromModal) && (itemFromModal.DrugId)) {
                    $scope.prescriptionDetails.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.editPrescriptionDetail = function (item) {
            item.currenteditable = true;

            utl.Modal.open('patientemr.prescriptiondetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, current_item: item, isedit: true },
                confirmCallback: $scope.onDetailSave
            }
            );
        }

        $scope.clear = function () {
            $scope.prescriptionDetails = [];
            $scope.addNewLineItem();
        }


        $scope.drugChanged = function (idx) {
            var lastIndex = $scope.prescriptionDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        }

        //computeQuantity
        $scope.computeQuantity = function (item) {
            if (item.DrugFrequencyId != -1 && item.Duration && item.DurationPeriodId != -1) {
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
            }
        }

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        }

        //deleteLineItem
        $scope.deletePrescriptionDetail = function (idx, item) {
            var name = item.RxName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        //getDetails
        $scope.getPrescriptionDetailsCallback = function (scope, res, options, hasError) {
            $scope.prescriptionDetails = res.Data || [];
            $scope.addNewLineItem();
        };
        $scope.getPrescriptionDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };


                var options = {
                    action: 'emr/prescriptiondetail/GetPrescriptionDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPrescriptionDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.applyVisibilityRules();            
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/prescription/GetPrescriptionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.previousmedication = function () {
            //$state.go('patientemr.previousmedications', {pid : $scope.currentcontext.pid});
            utl.Modal.open('patientemr.previousmedications', {
                params: {}
            }
            );
        }

        $scope.patientallergy = function () {
            utl.Modal.open('patientemr.patientallergies', {
                params: { pid: $scope.currentcontext.pid }
            }
            );
        }

        $scope.vital = function () {
            utl.Modal.open('patientemr.patientvitals', {
                params: { pid: $scope.currentcontext.pid }
            }
            );
        }

        $scope.backToList = function () {
            $state.go('patientemr.prescriptions', $scope.currentcontext.pid);
        }
        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveDraft = function () {
            $scope.item.PrecriptionStatusId = 1;
            $scope.saveItem();
        }

        $scope.prescribe = function () {
            $scope.item.PrecriptionStatusId = 3;
            $scope.saveItem();
        }

        $scope.prescribeAndOrder = function () {
            $scope.item.PrecriptionStatusId = 3;
            $scope.saveItem();
        }

        $scope.onCancelConfirmed = function () {
            $scope.item.PrecriptionStatusId = 2;
            $scope.saveItem();
        }

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.prescription-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }


            //Check Mandatory values

            if (checkMandatoryFields()) {
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
        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.prescriptionDetails, [
                { search: 1, fields: ['Status'] }
            ]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if ((item.RxName) && (!item.RxName || !item.Dosage || !item.DrugRouteId || item.DrugRouteId == -1 || !item.DrugFrequencyId ||
                    item.DrugFrequencyId == -1 || !item.Duration || item.Duration == 0 || !item.DurationPeriodId
                    || item.DurationPeriodId == -1 || !item.Quantity || item.Quantity == 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }
        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.prescriptionDetails) {
                var item = $scope.prescriptionDetails[idx];
                if (item.DrugId > 0 || item.GenericId > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
        }

        function loadData() {
            $scope.getItem();
            $scope.getPrescriptionDetails();
            $scope.getPatientAttachments();
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;            
            loadData();
        }

        $scope.initLookup = function () {
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
                { "Key": "Pharmacy" },
                { "Key": "DrugRoute" },
                { "Key": "DrugFrequency" },
                { "Key": "DurationPeriod", Default: false }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    prescriptionFormmodalController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig'];

})();