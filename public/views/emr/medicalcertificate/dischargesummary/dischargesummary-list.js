(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargesummaryListController', dischargesummaryListController);

    function dischargesummaryListController($scope, $stateParams, $filter, $state, $translate, utl) {
        var vm = this;

        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }
        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            wardid: -1,
            admissionstatusid: -1,
            patientnamemrn: '',
            WardId: -1,
            dischargedatte: utl.Formatter.getCurrentDate(),
            CertificateStatusId: -1,
            // DischargeTypeId: - 1

        };
        if ($scope.context == 'emr') {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId())
        }

        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1,
                // From: utl.Formatter.getCurrentDate(),
                // To: utl.Formatter.getCurrentDate(),

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'registration.patientsearch.filter_registerfromdate.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'registration.patientsearch.filter_registertodate.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_admissiontype.lbl',
                        model: 'AdmissionRequestTypeId',
                        options: $scope.lookup.AdmissionRequestType,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'medicalcertificate.dischargesummary-form.approvedby.lbl',
                        model: 'DoctorId',
                        options: $scope.lookup.User,
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
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
        };

        $scope.getListCallback = function(scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            // var FromAdm = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDOD = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.dischargedatte, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.dischargedatte, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 11,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    {
                        Key: 13,
                        Value: From
                    },
                    {
                        Key: 14,
                        Value: To
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.admissionstatusid
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.CertificateStatusId
                    },
                    {
                        Key: 15,
                        Value: utl.Session.getCurrentFacilityId()
                    },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr')
                inputData.Params.push({
                    Key: 10,
                    Value: $scope.currentcontext.pid
                });
            var options = {
                action: 'DischargeSummary/patientcertificate/GetPatientCertificates',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.addNew = function() {
            if ($scope.context == 'main') {
                $state.go('app.dischargesummary-form', {
                    id: 0,
                    tp: 'main'
                });
            }
            if ($scope.context == 'emr') {
                $state.go('patientemr.dischargesummary', {
                    id: 0,
                    tp: 'emr'
                });
            }
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.currentpatient = function() {
            $state.go('app.bedmanagementtab.inpatient');
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'DischargeSummary/patientcertificate/DeletePatientCertificate',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'view' || actionType == 'edit') {
                $state.go('app.dischargesummary-form', {
                    id: entity.Id,
                    pid: entity.PatientId
                });
            } else if (actionType == 'newview') {
                $state.go('app.dischargesumwithnotes-form', {
                    id: entity.Id,
                    pid: entity.PatientId
                });
            } else if (actionType == 'amend') {
                var certificateId = entity.PatientCertificate ? entity.PatientCertificate.Id : 0;
                $state.go('app.dischargesummaryamend', {
                    id: certificateId,
                    eid: entity.Id,
                    pid: entity.PatientId
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('currentinpatient.ipno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('patientemr.dischargecasesheetlist.doa.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "VisitIdentifier",
                    displayName: $translate.instant('currentinpatient.ipno2.lbl')
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
                        "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}&nbsp;</span>" +
                        "</a></div>"
                },
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
                {
                    field: "Guarantor.GuarantorName",
                    displayName: $translate.instant('currentinpatient.guarantor.lbl')
                },
                {
                    field: "DOD",
                    displayName: $translate.instant('medicalcertificate.dischargesummary-list.dod.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                // {
                //     field: "ApprovedUser",
                //     displayName: $translate.instant('patientemr.dischargecasesheetlist.approve.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
                //     "<span >{{entity.AprovedUser.Title.Description}}&nbsp;</span>" +
                //     "<span >{{entity.AprovedUser.FirstName}}&nbsp;</span>" +
                //     "<span >{{entity.AprovedUser.LastName}}&nbsp;</span>" +
                //     "</span></div>"
                // },
                {
                    field: "DischargeType.Description",
                    displayName: $translate.instant('medicalcertificate.dischargesummary-list.distype.lbl')
                },
                {
                    field: "CertificateStatus.Description",
                    displayName: $translate.instant('medicalcertificate.dischargesummary-list.statuss.lbl')
                },
                // { field: "AttenderPhone", displayName: $translate.instant('admissions.filter_mobileno.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.CertificateStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }

        };
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // var draftid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Draft');
            // var admitid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Admitted');
            // var fitforid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Fit For Discharge');
            // var clinicalid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Clinical Discharge');
            // var financialid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Financial Discharge');
            // var physicalid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Physical Discharge');
            // $scope.currentfilter.admissionstatusid = admitid + ',' + fitforid + ',' + clinicalid + ',' + financialid;

            // var DraftId = utl.Lookup.getDefault($scope.lookup.CertificateStatus, 'Draft');
            // var createdId = utl.Lookup.getDefault($scope.lookup.CertificateStatus, 'Created');
            // var approveId = utl.Lookup.getDefault($scope.lookup.CertificateStatus, 'Approved');
            // var cancelid = utl.Lookup.getDefault($scope.lookup.CertificateStatus, 'Cancelled');
            // var releaseid = utl.Lookup.getDefault($scope.lookup.CertificateStatus, 'Releaded To Patient');
            // $scope.currentfilter.CertificateStatusId = createdId + ',' + approveId;

            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [{
                        "Key": "AdmissionStatus"
                    },
                    {
                        "Key": "AdmissionRequestType"
                    },
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
                        "Key": "Guarantor",
                        Request: {
                            Params: [{
                                Key: 7,
                                Value: [-1, utl.Session.getCurrentFacilityId()]
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
                        "Key": "DischargeType"
                    },
                    {
                        "Key": "CertificateStatus"
                    },
                    {
                        "Key": "NoteType"
                    },

                ]
                /*   2/12/2016 */
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
    dischargesummaryListController.$inject = ['$scope', '$stateParams', '$filter', '$state', '$translate', 'utl'];

})();