(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('diagnosiscodingsController', diagnosiscodingsController);

    function diagnosiscodingsController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            admissionstatusid: -1,
            PatientId: -1,
            DoctorId: -1,
            PatientNameMRN: '',
            VisitTypeId: -1,
            PatientTypeId: -1,
            EncounterTypeId: 1,
            DOA: utl.Formatter.getCurrentDate(),
            //DOD: utl.Formatter.getCurrentDate(),
            DepartmentId: -1,
        };
        $scope.advancedfilter = {
            From: '',
            To: '',
        };


        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DiagnosisId: -1,
                To: utl.Formatter.getCurrentDate(),
            };
      
            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'mrd.doa.lbl', model: 'DOA', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'mrd.dod.lbl', model: 'DOD', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'admissionrequest.ward.lbl', options: $scope.lookup.Ward, model: 'ward', position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'admissions.status.lbl', model: 'admissionstatusid', options: $scope.lookup.AdmissionStatus, position: { r: 3, c: 1 } },
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

        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        //Dynamic form  ends
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var list = {};
                if (data.Data[idx].AdmissionStatusId != 5) {
                    list = data.Data[idx];
                    var DiagnosisCode = '';
                    if (data.Data[idx].Diagnosis) {
                        if (data.Data[idx].Diagnosis.Code != '' && data.Data[idx].Diagnosis.Code != null && data.Data[idx].Diagnosis.Code != undefined) {
                            DiagnosisCode = data.Data[idx].Diagnosis.Code;
                        }
                    }
                    if (data.Data[idx].Diagnosis2) {
                        if (data.Data[idx].Diagnosis2.Code != '' && data.Data[idx].Diagnosis2.Code != null && data.Data[idx].Diagnosis2.Code != undefined) {
                            DiagnosisCode = DiagnosisCode + ' / ' + data.Data[idx].Diagnosis2.Code;
                        }
                    }
                    if (data.Data[idx].Diagnosis3) {
                        if (data.Data[idx].Diagnosis3.Code != '' && data.Data[idx].Diagnosis3.Code != null && data.Data[idx].Diagnosis3.Code != undefined) {
                            DiagnosisCode = DiagnosisCode + ' / ' + data.Data[idx].Diagnosis3.Code;
                        }
                    }
                    list.DiagnosisCode = DiagnosisCode;
                    vm.gridConfig.data.push(list);
                }
            }
            //vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.getList = function () {
            var Fromdod = $filter('date')($scope.advancedfilter.DOD, 'yyyy-MM-dd 00:00:00') || null;
            var Todod = $filter('date')($scope.advancedfilter.DOD, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;

            var Fromdod = $filter('date')($scope.currentfilter.DOD, 'yyyy-MM-dd 00:00:00') || null;
            var Todod = $filter('date')($scope.currentfilter.DOD, 'yyyy-MM-dd 23:59:59') || null;

            var Fromdoa = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var Todoa = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.admissionstatusid },
                    { Key: 3, Value: $scope.advancedfilter.admissionstatusid },
                    { Key: 4, Value: $scope.advancedfilter.PatientId },
                    { Key: 5, Value: $scope.advancedfilter.DoctorId },
                    { Key: 6, Value: $scope.advancedfilter.DepartmentId },
                    { Key: 6, Value: $scope.currentfilter.DepartmentId },
                    { Key: 11, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 15, Value: $scope.currentfilter.EncounterTypeId },
                    { Key: 9, Value: $scope.advancedfilter.DiagnosisId },
                    { Key: 17, Value: From },
                    { Key: 18, Value: To },
                    //{ Key: 28, Value: From },
                    //{ Key: 29, Value: To },
                    { Key: 28, Value: Fromdod },
                    { Key: 29, Value: Todod }
                ],
                PageContext: {
                    //PageSize: -1,
                    //PageNumber: 1
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
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };
        $scope.getItem = function (pageNo) {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getList
            });
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'info') {
                $scope.openModal('app.diagnosisdetails', entity);
            } else if (actionType == 'view' && entity.EncounterTypeId != 2) {
                $scope.openModal('app.diagnosiscodification', {
                    id: 0, eid: entity.Id, pid: entity.PatientId,
                    EncType: entity.EncounterTypeId,
                    AdmStatus: entity.AdmissionStatusId
                });
            } else if (actionType == 'view' && entity.EncounterTypeId == 2 && entity.AdmissionStatusId != 6 ) {
                $scope.openModal('app.diagnosiscodification', {
                    id: 0, eid: entity.Id, pid: entity.PatientId,
                    EncType: entity.EncounterTypeId,
                    AdmStatus: entity.AdmissionStatusId
                });

            } else if (actionType == 'discharge') {
                utl.Modal.open('app.freecheckout', {
                    params: { id: 0, Encounter: entity, EncounterId: entity.Id  },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'view' && entity.EncounterTypeId == 2 && entity.AdmissionStatusId == 6 ) {
                $scope.openModal('app.diagnosiscodification', {
                    id: 0, eid: entity.Id, pid: entity.PatientId,
                    pdid: entity.PatientDischargeEvents[0].Id,
                    EncType: entity.EncounterTypeId,
                    AdmStatus: entity.AdmissionStatusId
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "VisitIdentifier",
                    displayName: $translate.instant('Visit No')
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        // + '<a ng-click="handleEvents(\'patientinfo\',entity)">'
                        +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "{{entity.Patient.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Patient.FirstName}}&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('mrd.room.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName }}</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('mrd.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('mrd.doa.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DischargeDate",
                    displayName: $translate.instant('mrd.dod.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DiagnosisCode",
                    displayName: $translate.instant('mrd.code.lbl')
                },
                {
                    field: "Diagnosis.DiagnosisName",
                    displayName: $translate.instant('mrd.diagnosis.lbl')
                },
                {
                    field: "OtherDiagnosis",
                    displayName: $translate.instant('mrd.otherdiagnosis.lbl')
                },
                {
                    field: "AdmissionStatus.Description",
                    displayName: $translate.instant('admissions.status.lbl')
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                            cellTemplate: '<div class="ui-grid-cell-contents">\
                                                           \
                                                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)" title="Diagnosis Code" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                            \
                                                            <span class="grid-action" ng-click="handleEvents(\'discharge\',entity)" title="Discharge" ng-show="((entity.GuarantorTypeId == 6 && entity.AdmissionStatusId != 6) || entity.AdmissionStatusId == 5)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                           \
                                                        </div>',
                                                        handleEvent: $scope.handleEvents,
                            actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }


        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AdmissionStatus" },
                { "Key": "EncounterType" },
                { "Key": "Department" },
                { "Key": "Facility" },
                { "Key": "Ward" },

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
    diagnosiscodingsController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();