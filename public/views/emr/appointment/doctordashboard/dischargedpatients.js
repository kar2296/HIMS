(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DischargedPatientsController', DischargedPatientsController);

    function DischargedPatientsController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        vm.EncounterType = $stateParams.tp;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            patientnamemrn: '',
            DoctorId: -1,
        }
        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.doctordashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            updateReactProps();
        };

        $scope.getList = function () {
            if ($scope.currentfilter.FromDate == null) {
                utl.Alert.showErrorMsg('Please Select any From date');
                vm.gridConfig.data = [];
                updateReactProps();
                return true;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 6
                    },
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    {
                        Key: 28,
                        Value: From
                    },
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
        // Cancel Requests from List Screen Function - End 
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('patientemr.patientrecords', {
                    eid: entity.Id,
                    pid: entity.PatientId,
                    context: 'fromward'
                });
            } else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('currentinpatient.ipno.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "AdmissionDate",
                displayName: $translate.instant('admissions.filter_admissiondate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "DischargeDate",
                displayName: $translate.instant('admissions.discharge.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "VisitIdentifier",
                displayName: $translate.instant('currentinpatient.ipno2.lbl')
            },
            {
                field: "Patient",
                displayName: $translate.instant('admissions.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>"
                    // '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                    // '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                    +
                    '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
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
                    "</a></div>",
                handleEvent: $scope.handleEvents
            },
            // { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('admissions.roomdetails.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}}</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}}</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"



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
            // { field: "Department.DepartmentName", displayName: $translate.instant('admissions.department.lbl') },
            // {
            //     field: "AdmissionStatus.Description",
            //     displayName: $translate.instant('admissions.status.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            //                                         <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;class='col-sm-2'></div>\
            //                                     &nbsp;<span>{{entity.AdmissionStatus.Description}}</span>\
            //                                 </div>"
            // },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'emr\',entity)"><i class="fas solid fa-laptop-medical" uib-tooltip="EMR"></i></span>\</span>\
                    <span ng-if="entity.GuarantorTypeId == 6" class="grid-action"\
                    style="background: #d15ef7;" ng-click="handleEvents(\'discharge\',entity)">\
                    <i class="btn text-white  btn-xs" aria-hidden="true"><strong>Discharge</strong>\
                    </i></span>\</div>',
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

        // $scope.custom_sort = function (a, b) {
        //     return new Date(a.Id).getTime() - new Date(b.Id).getTime();
        // }

        $scope.onEnter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.DoctorId = -1;
                $scope.getList();
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            updateReactProps();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "AdmissionStatus",
                Default: false
            },
            {
                "Key": "Ward"
            },
            {
                "Key": "Room"
            },
            {
                "Key": "AdmissionType"
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

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to DischargedPatientsScreen.tsx).
        // All API calls/business logic above are untouched.
        //
        // Real dead code disclosed, NOT reproduced: $scope.onEnter is never
        // referenced by the real template (no `on-enter` attribute anywhere
        // in dischargedpatients.html) -- unreachable in production, so no
        // dispatch path is wired to it here either.
        // ---------------------------------------------------------------
        function updateReactProps() {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                lookup: {
                    Doctor: ($scope.lookup && $scope.lookup.Doctor) || []
                },
                currentfilter: {
                    FromDate: toIsoDateString($scope.currentfilter.FromDate),
                    patientnamemrn: $scope.currentfilter.patientnamemrn,
                    DoctorId: $scope.currentfilter.DoctorId
                },
                pager: {
                    totalItems: vm.gridConfig.pagerObj.totalItems,
                    currentPage: vm.gridConfig.pagerObj.currentPage,
                    pageSize: vm.gridConfig.pagerObj.pageSize
                }
            };
        }

        function toIsoDateString(d) {
            if (!d) return '';
            var dt = new Date(d);
            if (isNaN(dt.getTime())) return '';
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }
        function fromIsoDateString(s) {
            if (!s) return null;
            var parts = String(s).split('-');
            if (parts.length !== 3) return null;
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'filterChange':
                    $scope.currentfilter[payload.field] = payload.value;
                    updateReactProps();
                    break;
                case 'filterChangeAndSearch':
                    if (payload.field === 'FromDate') {
                        $scope.currentfilter.FromDate = fromIsoDateString(payload.value);
                    } else {
                        $scope.currentfilter[payload.field] = payload.value;
                    }
                    updateReactProps();
                    $scope.getList();
                    break;
                case 'search':
                    $scope.getList();
                    break;
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    break;
                case 'emr':
                case 'patientinfo':
                    $scope.handleEvents(actionName, payload.entity);
                    break;
                case 'doctordashboard':
                    $scope.doctordashboard();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        updateReactProps();
    }
    DischargedPatientsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();
