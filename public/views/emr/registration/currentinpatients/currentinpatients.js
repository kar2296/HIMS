(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('currentinpatientsController', currentinpatientsController);

    function currentinpatientsController($scope, $filter, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;


        $scope.Items = [];
        uibButtonConfig.activeClass = "opt-selected";

        $scope.gridData = [];
        $scope.Encounter = {};
        $scope.Patient = {};
        $scope.currentfilter = {
            // admissiondate: utl.Formatter.getCurrentDate(),
            admissionstatusid: '',
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };
        // $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext = {
            option: 'myinpatients',
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            pid: parseInt(utl.Session.getEMRPatientId())
        };
        $scope.options = [{
                key: 'myinpatients',
                name: $translate.instant('registration.inpatients.myinpatients.lbl')
            },
            {
                key: 'allinpatients',
                name: $translate.instant('registration.inpatients.currentinpatients.lbl')
            }
        ]


        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Patient.Id == patientId) {
                    item.Patient.Photo = photo;
                }
            }
        };

        $scope.getPatientProfilePic = function (item) {
            if (item.PhotoPath) {
                var inputData = {
                    Id: item.Id,
                    PhotoPath: item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadPhotos() {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Patient.PhotoPath) {
                    $scope.getPatientProfilePic(item.Patient);
                }
            }
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            for (var idx in items) {
                var item = items[idx];

            }
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            loadPhotos();
        };

        $scope.getList = function () {
            if ($scope.currentfilter.admissiondate)
                var From = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;

            vm.gridConfig.data = [];
            if ($scope.currentcontext.option == 'allinpatients') {
                var inputData = {
                    Params: [{
                            Key: 1,
                            Value: $scope.currentfilter.FacilityId
                        },
                        {
                            Key: 2,
                            Value: $scope.currentfilter.WardId
                        },
                        {
                            Key: 31,
                            Value: $scope.currentfilter.admissionstatusid
                        },
                        {
                            Key: 4,
                            Value: $scope.currentfilter.PatientId
                        },
                        {
                            Key: 8,
                            Value: $scope.currentfilter.AdmissionRequestTypeId
                        },
                        {
                            Key: 11,
                            Value: $scope.currentfilter.patientnamemrn
                        },
                        {
                            Key: 12,
                            Value: $scope.currentfilter.RequestNo
                        },
                        {
                            Key: 13,
                            Value: $scope.currentfilter.VisitIdentifier
                        },
                        {
                            Key: 15,
                            Value: 2
                        },
                        {
                            Key: 16,
                            Value: utl.Formatter.getFilterDate($scope.currentfilter.AdmissionDate)
                        },
                        {
                            Key: 17,
                            Value: From
                        },
                        {
                            Key: 18,
                            Value: To
                        },
                        {
                            Key: 20,
                            Value: $scope.currentfilter.AttenderPhone
                        },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.DepartmentId
                        },

                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage

                    }

                };
            } else if ($scope.currentcontext.option == 'myinpatients') {
                var inputData = {
                    Params: [{
                            Key: 1,
                            Value: $scope.currentfilter.FacilityId
                        },
                        {
                            Key: 5,
                            Value: $scope.currentfilter.DoctorId
                        },
                        {
                            Key: 2,
                            Value: $scope.currentfilter.WardId
                        },
                        {
                            Key: 31,
                            Value: $scope.currentfilter.admissionstatusid
                        },
                        {
                            Key: 11,
                            Value: $scope.currentfilter.patientnamemrn
                        },
                        {
                            Key: 15,
                            Value: 2
                        },
                        {
                            Key: 17,
                            Value: From
                        },
                        {
                            Key: 18,
                            Value: To
                        },
                        // { Key: 31, Value: [2, 3, 4, 5] },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage

                    }
                };
            }
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);


        };
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }

        // Patient Info popup  Start  

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }



        // $scope.handleEvents = function (actionType, row) {
        //     if (actionType == 'edit') {
        //         utl.Session.setEMRPatientId(entity.PatientId);
        //         $state.go('patientemr.patientdashboard', { pid: entity.Patient.Id, eid: entity.Id });
        //     }
        //     else if (actionType == 'ordertracker') {
        //         utl.Modal.open('app.ordertracker', {
        //             params: { eid: entity.Id, pid: entity.Patient.Id },
        //             confirmCallback: $scope.getList
        //         }
        //         );
        //     }

        // };
        // vm.gridConfig = {
        //     columnDefs: [
        //         { field: "Id", name: 'Patient Details', cellTemplate: 'currentinPatientsTemplate.html' }
        //     ],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };



        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.populateGrid
            });
        }


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('patientemr.patientrecords', {
                    eid: entity.Id,
                    pid: entity.PatientId
                });
            } else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            } else if (actionType == 'discharge') {
                utl.Modal.open('app.freecheckout', {
                    params: {
                        id: 0,
                        Encounter: entity,
                        EncounterId: entity.Id
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        $scope.print = function () {
            utl.Modal.open('app.admissionrequestprint', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
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
                    field: "VisitIdentifier",
                    displayName: $translate.instant('Visit No')
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
                {
                    field: "AdmissionStatus.Description",
                    displayName: $translate.instant('admissions.status.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;class='col-sm-2'></div>\
                                                &nbsp;<span>{{entity.AdmissionStatus.Description}}</span>\
                                            </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'emr\',entity)"><i class="fas solid fa-laptop-medical" uib-tooltip="EMR"></i></span>\
                    <span ng-if="entity.GuarantorTypeId == 6" class="grid-action"\
                    style="background: #d15ef7;" ng-click="handleEvents(\'discharge\',entity)">\
                    <i class="btn text-white  btn-xs" aria-hidden="true"><strong>Discharge</strong>\
                    </i></span>\
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
            var admitid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Admitted');
            var fitforid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Fit For Discharge');
            var clinicalid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Clinical Discharge');
            var financialid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Financial Discharge');
            $scope.currentfilter.admissionstatusid = admitid + ',' + fitforid + ',' + clinicalid + ',' + financialid;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Facility" },
                {
                    "Key": "AdmissionStatus"
                },
                {
                    "Key": "Ward"
                },
                {
                    "Key": "AdmissionRequestType"
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
                    "Key": "Department"
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

        // ---------------------------------------------------------------------
        // React bridge (currentinpatients "hollow controller" wiring). Every
        // function above is UNCHANGED; this section only exposes state to,
        // and dispatches actions back into, the existing functions.
        // ---------------------------------------------------------------------
        function updateReactProps() {
            $scope.reactProps = {
                items: $scope.gridData || [],
                lookup: {
                    Ward: ($scope.lookup && $scope.lookup.Ward) || [],
                    AdmissionStatus: ($scope.lookup && $scope.lookup.AdmissionStatus) || []
                },
                currentfilter: {
                    patientnamemrn: $scope.currentfilter.patientnamemrn,
                    WardId: $scope.currentfilter.WardId,
                    admissionstatusid: $scope.currentfilter.admissionstatusid
                },
                currentcontext: {
                    option: $scope.currentcontext.option
                },
                pager: {
                    totalItems: vm.gridConfig.pagerObj.totalItems,
                    currentPage: vm.gridConfig.pagerObj.currentPage,
                    pageSize: vm.gridConfig.pagerObj.pageSize
                }
            };
        }

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            updateReactProps();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            updateReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'filterChange':
                    // Mirrors the real on-enter box (Name/MRN): no refetch on keystroke.
                    $scope.currentfilter[payload.field] = payload.value;
                    updateReactProps();
                    break;
                case 'filterChangeAndSearch':
                    // Mirrors the real ng-change="getList()" on WardId/admissionstatusid.
                    $scope.currentfilter[payload.field] = payload.value;
                    updateReactProps();
                    $scope.getList();
                    break;
                case 'search':
                    // Mirrors the real on-enter="getList()" on the Name/MRN box.
                    $scope.getList();
                    break;
                case 'toggleOption':
                    // Mirrors uib-btn-radio + ng-click="getList()" on the option buttons.
                    $scope.currentcontext.option = payload.option;
                    updateReactProps();
                    $scope.getList();
                    break;
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    break;
                case 'emr':
                    $scope.handleEvents('emr', payload.entity);
                    break;
                case 'patientinfo':
                    $scope.handleEvents('patientinfo', payload.entity);
                    break;
                case 'discharge':
                    $scope.handleEvents('discharge', payload.entity);
                    break;
                case 'doctorDashboard':
                    $scope.doctor_dashboard();
                    break;
                default:
                    break;
            }
        };

        updateReactProps();
    }
    currentinpatientsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();