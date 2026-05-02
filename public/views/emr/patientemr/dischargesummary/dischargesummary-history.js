(function () {
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
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
            // CertificateStatusId: 3,
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
                    // { type: 'select', translate: 'admissions.filter_department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_refferal.lbl', model: 'ReferralId', options: $scope.lookup.Referral, position: { r: 3, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 3, c: 1 } },
                    // { type: 'select', translate: 'admissions.filter_serviceratecategory.lbl', model: 'ServiceRateCategoryId', options: $scope.lookup.ServiceRateCategory, position: { r: 4, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 4, c: 1 } },
                    // { type: 'text', translate: 'admissions.filter_attender.lbl', model: 'AttenderName', position: { r: 5, c: 0 } },
                    // { type: 'checkbox', translate: 'admissions.filter_isreadmission.lbl', model: 'IsReadmission', position: { r: 5, c: 1 } },
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

        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // var FromAdm = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDOD = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var Fromdate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var Todate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 11,
                    Value: $scope.currentfilter.patientnamemrn
                },
                {
                    Key: 13,
                    Value: Fromdate
                },
                {
                    Key: 14,
                    Value: Todate
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
                }
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


        $scope.addNew = function () {
            if ($scope.context == 'main') {
                $state.go('app.dischargesummary-form', {
                    id: 0,
                    tp: 'main'
                });
            }
            if ($scope.context == 'emr') {
                $state.go('patientemr.dischargesummarytab.dischargesummarycurrentvisit', {
                    id: 0,
                    tp: 'emr'
                });
            }
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        $scope.onDeleteConfirmed = function (deleteId) {
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

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'view' || actionType == 'edit') {
                $state.go('patientemr.dischargesummarytab.dischargesummaryview', {
                    id: entity.Id,
                    pid: entity.PatientId
                });
            } else if (actionType == 'newview') {
                $state.go('app.dischargesumwithnotes-form', {
                    id: entity.Id,
                    pid: entity.PatientId
                });
            } else if (actionType == 'modify') {
                // var certificateId = entity.PatientCertificate ? entity.PatientCertificate.Id : 0;
                $state.go('patientemr.dischargesummarytab.dischargesummarymodify', {
                    id: entity.Id,
                    pid: entity.PatientId,
                    // eid: entity.EncounterId,
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
            // {
            //     field: "AdmissionDate",
            //     displayName: $translate.instant('patientemr.dischargecasesheetlist.date.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            // },
            {
                field: "AdmissionDate",
                displayName: $translate.instant('patientemr.dischargecasesheetlist.doa.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            // {
            //     field: "AdmissionDate",
            //     displayName: $translate.instant('patientemr.dischargecasesheetlist.dod.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
            // },
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
                    "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            },
            // {
            //     field: "WardRoomMaster",
            //     displayName: $translate.instant('admissions.roomdetails.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
            //         "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}} </span>" +
            //         "<span  ng-if='entity.WardRoomMaster'>/</span>" +
            //         "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
            //         "<span  ng-if='entity.WardRoomMaster'>/</span>" +
            //         "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
            //         "</div>"
            // },
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
                field: "Encounter.PatientGuarantor.GuarantorName",
                displayName: $translate.instant('currentinpatient.guarantor.lbl')
            },
            {
                field: "DOD",
                displayName: $translate.instant('medicalcertificate.dischargesummary-list.dod.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "ApprovedUser",
                displayName: $translate.instant('patientemr.dischargecasesheetlist.approve.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span >{{entity.AprovedUser.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.AprovedUser.FirstName}}&nbsp;</span>" +
                    "<span >{{entity.AprovedUser.LastName}}</span>" +
                    "</span></div>"
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
                            <span class="grid-action" ng-click="handleEvents(\'modify\',entity)"><a>Modify</a></span>\
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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "AdmissionStatus"
            },
            {
                "Key": "AdmissionRequestType"
            },
            {
                "Key": "Ward"
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