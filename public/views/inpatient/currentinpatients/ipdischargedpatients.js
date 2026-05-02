(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipDischargedpatientsListController', ipDischargedpatientsListController);

    function ipDischargedpatientsListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            WardId: -1,
            DoctorId: -1,
            admissionstatusid: 6,
            GuarantorId: -1,
            patientnamemrn: ''
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        //  Start
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1
            };
            $scope.backtoList = function() {
                if ($scope.Context == 'frontoffice') {
                    $state.go('app.frontdashboard');
                } else if ($scope.Context == 'billing') {
                    $state.go('app.billingsdashboard');
                } else if ($scope.Context == 'nursing') {
                    $state.go('app.nursingdashboard')
                } else if ($scope.Context == 'surgery') {
                    $state.go('app.surgerydashboard')
                } else if ($scope.Context == 'qm') {
                    $state.go('app.qualitymanagement')
                }
            }
            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'admissions.filter_admissiondate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'admissions.filter_dischargedate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_admissiontype.lbl', model: 'AdmissionTypeId', options: $scope.lookup.AdmissionType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_refferal.lbl', model: 'ReferralId', options: $scope.lookup.Referral, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_serviceratecategory.lbl', model: 'ServiceRateCategoryId', options: $scope.lookup.ServiceRateCategory, position: { r: 4, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 4, c: 1 } },
                    { type: 'text', translate: 'admissions.filter_attender.lbl', model: 'AttenderName', position: { r: 5, c: 0 } },
                    { type: 'checkbox', translate: 'admissions.filter_isreadmission.lbl', model: 'IsReadmission', position: { r: 5, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function() {

                utl.Modal.openDynamicForm({
                    modeldata: $scope.advancedfilter,
                    defaultdata: $scope.advancedfilterDefault,
                    schema: $scope.advancedFilterSchema,
                    relativeto: '#btnadvanced',
                    handleDynamicFormEvents: handleDynamicFormEvents
                });
            }
            //Dynamic form  ends
            //  End
        $scope.getListCallback = function(scope, data, options, hasError) {

            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var list = {};
                list = data.Data[idx];
                list.NoOfDays = '';
                var admDate = new Date(list.AdmissionDate);
                var crntDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                var date2 = new Date(crntDate);
                var difference_ms = date2.getTime() - admDate.getTime();
                difference_ms = difference_ms / 1000;
                var seconds = Math.floor(difference_ms % 60);
                difference_ms = difference_ms / 60;
                var minutes = Math.floor(difference_ms % 60);
                difference_ms = difference_ms / 60;
                var hours = Math.floor(difference_ms % 24);
                var days = Math.floor(difference_ms / 24);
                list.NoOfDays = days + 1;
                vm.gridConfig.data.push(list);

            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            //$scope.getDischarges();
        };

        $scope.getList = function() {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.facilityid },
                    // { Key: 2, Value: $scope.currentfilter.WardId },
                    { Key: 2, Value: $scope.currentfilter.WardTypeId },
                    { Key: 3, Value: 6 },
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    { Key: 4, Value: $scope.currentfilter.PatientId },
                    { Key: 6, Value: $scope.advancedfilter.DepartmentId },
                    { Key: 7, Value: $scope.advancedfilter.ServiceRateCategoryId },
                    { Key: 8, Value: $scope.currentfilter.AdmissionRequestTypeId },
                    { Key: 9, Value: $scope.advancedfilter.DiagnosisId },
                    // { Key: 3, Value: $scope.currentfilter.ReferralId },
                    { Key: 10, Value: $scope.advancedfilter.AttenderName },
                    { Key: 11, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 12, Value: $scope.currentfilter.RequestNo },
                    { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 19, Value: $scope.currentfilter.GuarantorId },
                    { Key: 15, Value: 2 },
                    { Key: 26, Value: true },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.patientprofiledetails = function(patientId) {
                utl.Modal.open('registration.patientprofile', {
                    params: { pid: patientId },
                    confirmCallback: $scope.getList
                });
            }
            // Patient Info popup  End  
            //Grid Actions
        $scope.addNew = function() {
            $state.go('app.admissiontab.admission', { id: 0 });
        }

        $scope.filter = function() {
            $state.go('app.admissions.advancefilter', { advancefilterid: 0 });
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'Visit/Visit/DeleteEncounter',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function(pageNo) {

            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function(cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }
        $scope.PatientAdmitCallBack = function(scope, data, options, hasError) {
            console.log(data);
        }
        $scope.PatientAdmit = function(requestData) {
            var options = {
                action: 'Visit/Visit/AdmitAdmissionRequest',
                data: requestData,
                type: 'post',
                onComplete: $scope.PatientAdmitCallBack
            };
            utl.Http.doAction(options);
        }
        $scope.openModal = function(appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getList
            });
        }
        $scope.getclinicalDischargeEventCallback = function(scope, data, options, hasError) {
            console.log(data);
            $scope.openModal('app.clinicalpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.getclinicalDischargeEvent = function(Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: Encounter.Id, Encounter: Encounter },
                type: 'post',
                onComplete: $scope.getclinicalDischargeEventCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getPatientDischargeCallback = function(scope, data, options, hasError) {
            // console.log(data);

            $scope.openModal('app.dischargeadvicer', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.getPatientDischarge = function(Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: Encounter.Id, Encounter: Encounter },
                type: 'post',
                onComplete: $scope.getPatientDischargeCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getPatientDischargeEventCallback = function(scope, data, options, hasError) {
            console.log(data);
            $scope.openModal('app.discharpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.getPatientDischargeEvent = function(Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: Encounter.Id, Encounter: Encounter },
                type: 'post',
                onComplete: $scope.getPatientDischargeEventCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getPhysicalDischargeCallback = function(scope, data, options, hasError) {
            console.log(data);
            $scope.openModal('app.physicalpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.getPhysicalDischarge = function(Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: Encounter.Id, Encounter: Encounter },
                type: 'post',
                onComplete: $scope.getPhysicalDischargeCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getPendingDispenseCallback = function(scope, data, options, hasError) {
            console.log(data);
            $scope.openModal('app.pendingdispense', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }
        $scope.getPendingDispense = function(Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: Encounter.Id, Encounter: Encounter },
                type: 'post',
                onComplete: $scope.getPendingDispenseCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'edit') {
                // $scope.openModal('app.pendingdispense', { id: entity.Id });
                $scope.getPendingDispense(entity);
            } else if (actionType == 'delete') {
                //$scope.openModal('app.dischargeadvicer', { id: entity.Id });
                $scope.getPatientDischarge(entity);
            } else if (actionType == 'cancel') { //Cancel Event 

                // $scope.openModal('app.discharpatient', { id: entity.Id });
                $scope.getPatientDischargeEvent(entity);

            } else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            } else if (actionType == 'view') { //Cancel Event 
                // $scope.openModal('app.physicalpatient', { id: entity.Id });
                $scope.getPhysicalDischarge(entity);
            } else if (actionType == 'show') { //Cancel Event 

                // $scope.openModal('app.discharpatient', { id: entity.Id });
                $scope.getclinicalDischargeEvent(entity);

            }

            // else if (actionType == 'view') {
            //     $state.go('app.admissionrequest', { id: entity.Id });
            // }
            else if (actionType == 'admit') {

                var inputData = { Id: entity.Id };
                $scope.PatientAdmit(inputData);
            }
        }

        $scope.print = function() {
            utl.Modal.open('app.admissionrequestprint', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }

        var rowtpl = '<div ng-class="{\'billlock\':entity.IsBillLock==1 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [

                { field: "VisitIdentifier", displayName: $translate.instant('S.NO') },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('currentinpatient.doa2.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}}  </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "VisitIdentifier", displayName: $translate.instant('Visit No') },
                {
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        // '<a ng-click="handleEvents(\'patientinfo\',entity   )" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        // '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom" >'
                        +
                        '<a ng-click="handleEvents(\'patientinfo\',entity  )">' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",

                    handleEvent: $scope.handleEvents

                },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('currentinpatient.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.WardMaster'>{{entity.WardMaster.WardName }}</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                        "</div>"
                },
                // { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('currentinpatient.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity    )">' +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                // { field: "Department.DepartmentName", displayName: $translate.instant('admissions.department.lbl') },

                { field: "Guarantor.GuarantorName", displayName: $translate.instant('currentinpatient.guarantor.lbl') },
                {
                    field: "ReferralName",
                    displayName: $translate.instant('Referral Name'),
                    width: '7%',
                },
                {
                    field: "NoOfDays",
                    displayName: $translate.instant('No.Of Days'),
                    width: '7%',
                },
                // { field: "Pharmacystatus", displayName: $translate.instant('currentinpatient.pharmacy.lbl') },
                // { field: "OTstatus", displayName: $translate.instant('currentinpatient.ot.lbl') },
                { field: "DischargeorderstatusId", displayName: $translate.instant('currentinpatient.d.order.lbl') },
                { field: "PatientCertificate.CertificateStatus.Description", displayName: $translate.instant('currentinpatient.summary.lbl') },

                // {
                //     field: "AdmissionStatus.Description", displayName: $translate.instant('admissions.status.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'>\
                //                                     <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;background:{{entity.AdmissionStatus.ColorCode}}' class='col-sm-2'></div>\
                //                                 &nbsp;<span>{{entity.AdmissionStatus.Description}}</span>\
                //                             </div>" },
                { field: "PatientCertificate.CertificateStatus.Description", displayName: $translate.instant('currentinpatient.summary2.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" title="Pharmacy Pending" ng-click="handleEvents(\'edit\',entity   )" ><i class="fas fa-prescription-bottle-alt"></i></span>\
                                                    <span class="grid-action" title="Discharge Advice" ng-click="handleEvents(\'delete\',entity )" ng-show="entity.AdmissionStatusId == 2"><i class="fas fa-comment-medical"></i></span>\
                                                    <span class="grid-action" title="Discharge" ng-click="handleEvents(\'cancel\',entity    )" ng-show="entity.AdmissionStatusId == 3"><i class="fa fa-hospital-o btn btn-primary btn-rounded" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" title="Discharge" ng-click="handleEvents(\'show\',entity  )" ng-show="entity.AdmissionStatusId == 4"><i class="fa fa-hospital-o btn btn-primary btn-rounded" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" title="Discharge" ng-click="handleEvents(\'view\',entity  )" ng-show="entity.AdmissionStatusId == 5"><i class="fa fa-hospital-o btn btn-primary btn-rounded" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" title="Discharge" ng-click="handleEvents(\'view\',entity  )" ng-show="entity.AdmissionStatusId == 6"><i class="fa fa-hospital-o btn btn-primary btn-rounded" aria-hidden="true"></i></span>\
   </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        function setDefaults() {
            //Setting default status filters starts
            var AdmittedId = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Admitted');
            var FitforDischargeId = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Fit for Discharge');
            var ClinicalDischargeId = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Clinical Discharge');
            $scope.currentfilter.admissionstatusid = AdmittedId + "," + FitforDischargeId + "," + ClinicalDischargeId;
            //Setting default status filters ends
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            setDefaults();
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "AdmissionStatus", Default: false },
                { "Key": "WardType" },
                {
                    "Key": "Ward",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId()
                        }]
                    }
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },

            ]
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
    ipDischargedpatientsListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();