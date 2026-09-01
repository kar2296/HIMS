(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDFileReturnsListController', MRDFileReturnsListController);

    function MRDFileReturnsListController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;


        $scope.Items = [];
        uibButtonConfig.activeClass = "opt-selected";

        $scope.gridData = [];
        $scope.Encounter = {};
        $scope.Patient = {};
        $scope.currentfilter = {
            DOD: utl.Formatter.getCurrentDate(),
            admissionstatusid: 6,
            DoctorId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };

        $scope.currentcontext = {
            option: 'myinpatients',
            // DoctorId: parseInt(utl.Session.getCurrentUserId()),
            pid: parseInt(utl.Session.getEMRPatientId())
        };

        $scope.getPatientProfilePic = function(item) {
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
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            for (var idx in items) {
                var item = items[idx];

            }
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
            // loadPhotos();
        };

        $scope.getList = function() {
            var FromDate = $filter('date')($scope.currentfilter.DOD, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.DOD, 'yyyy-MM-dd 23:59:59') || null;

            // if ($scope.currentfilter.admissiondate)
            //     var From = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            if ($scope.currentfilter.PatientName || $scope.currentfilter.VisitNo) {
                FromDate = null;
                ToDate = null;
            }
            vm.gridConfig.data = [];
            var inputData = {
                Params: [
                    //     {
                    //     Key: 1,
                    //     Value: $scope.currentfilter.FacilityId
                    // },
                    // {
                    //     Key: 2,
                    //     Value: $scope.currentfilter.WardId
                    // },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.VisitNo
                    },
                    {
                        Key: 3,
                        Value: 6
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.PatientId
                    // },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.PatientName
                    },
                    { Key: 28, Value: FromDate },
                    { Key: 29, Value: ToDate },
                    {
                        Key: 15,
                        Value: 2
                    },
                    {
                        Key: 61,
                        Value: false
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
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
        }

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        }
        $scope.bed_management = function() {
            $state.go('app.bedmanagement');
        }

        // Patient Info popup  Start  

        $scope.patientprofiledetails = function(patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.openModal = function(appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.populateGrid
            });
        }


        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'return') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('app.mrdfilereturnform', {
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

        $scope.print = function() {
            utl.Modal.open('app.admissionrequestprint', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }


        //React bridge: renders this screen's status filter through the shared
        //BridgeLookupSelectScreen and its <custom-table config="vm.gridConfig">
        //through the shared BridgeGridScreen. Cell text is formatted here with
        //the same $filter('date', ...) calls the original cellTemplates used,
        //so no formatting logic moves into React. Every dispatch lands back on
        //this controller's existing, unchanged functions.
            function patientNameGender(p) {
                if (!p) { return ''; }
                var title = p.Title && p.Title.Description ? p.Title.Description + ' ' : '';
                return (title + (p.FirstName || '') + ' ' + (p.LastName || '') + ' / ' + (p.Age || '') + ' / ' + (p.Gender && p.Gender.Description ? p.Gender.Description : '')).trim();
            }
            function userLabel(u) {
                if (!u) { return ''; }
                return ((u.Title && u.Title.Description ? u.Title.Description + ' ' : '') + (u.FirstName || '') + ' ' + (u.LastName || '')).trim();
            }
            function roomLabel(e) {
                if (!e || !e.WardRoomMaster) { return e && e.WardRoomBedMaster ? (e.WardRoomBedMaster.BedNo || '') : ''; }
                var ward = e.WardMaster && e.WardMaster.WardName ? e.WardMaster.WardName : '';
                var room = e.WardRoomMaster.RoomNo || '';
                var bed = e.WardRoomBedMaster ? (e.WardRoomBedMaster.BedNo || '') : '';
                return (ward + ' / ' + room + ' / ' + bed);
            }

        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (actionType == 'rowAction') {
                $scope.handleEvents('return', entity);
            } else if (actionType == 'cellAction') {
                $scope.handleEvents(payload.key == 'patient' ? 'patientinfo' : 'patientinfo', entity);
            }
        };

        $scope.handleFilterAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.currentfilter.DoctorId = payload.id;
                $scope.getList();
            }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                    { key: '__sno', header: hdr(0), width: '60px' },
                    { key: 'admissiondate', header: hdr(1), sortable: true },
                    { key: 'visitno', header: hdr(2), sortable: true },
                    { key: 'mrn', header: hdr(3), sortable: true },
                    { key: 'patient', header: hdr(4), link: true },
                    { key: 'roomdetails', header: hdr(5) },
                    { key: 'doctor', header: hdr(6), link: true },
                    { key: 'guarantor', header: hdr(7), sortable: true },
                    { key: 'status', header: hdr(8), sortable: true }
                ],
                    actionsHeader: defs.length ? defs[defs.length - 1].displayName : 'Actions',
                    hasActions: true,
                    highlightStyle: { background: '#ed143dad', color: '#fff' },
                    rows: items.map(function (entity) {
                        return {
                            id: entity.Id,
                            actionLabel: 'Send to MRD',
                            highlight: !!entity.IsIncompleteMRD,
                            cells: {
                        admissiondate: (entity.AdmissionDate ? $filter('date')(entity.AdmissionDate, 'dd-MMM-yyyy') : '') + ' ' + (entity.AdmissionDate ? $filter('date')(entity.AdmissionDate, 'HH:mm') : ''),
                        visitno: entity.VisitIdentifier,
                        mrn: entity.Patient && entity.Patient.MRN,
                        patient: patientNameGender(entity.Patient),
                        roomdetails: roomLabel(entity),
                        doctor: userLabel(entity.Doctor),
                        guarantor: entity.Guarantor && entity.Guarantor.GuarantorName,
                        status: entity.AdmissionStatus && entity.AdmissionStatus.Description
                    }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
            $scope.reactPropsFilterContainer = {
                reactProps: {
                    options: ($scope.lookup && $scope.lookup.Doctor) || [],
                    value: $scope.currentfilter.DoctorId
                },
                onAction: $scope.handleFilterAction
            };
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                flag: 'IsIncompleteMRD',
                // style:{
                //     field:'Status',
                //     value:{
                //         1:{'background':'red','color':'#fff'}
                //     }
                // }
            },
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('S.No'),
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
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
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
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}&nbsp;</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
                },
                // { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('admissions.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}} </span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
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
                        "<span >{{entity.Doctor.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                {
                    field: "Guarantor.GuarantorName",
                    displayName: $translate.instant('currentinpatient.guarantor.lbl')
                },
                // { field: "Department.DepartmentName", displayName: $translate.instant('admissions.department.lbl') },
                // {
                //     field: "ReturnedUser",
                //     displayName: $translate.instant('Returned By'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>"
                //         // '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                //         // '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                //         +
                //         "{{entity.ReturnedUser.Title.Description}}</span>" +
                //         "<span >{{entity.ReturnedUser.FirstName}}</span>" +
                //         "<span >{{entity.ReturnedUser.LastName}}</span>" +
                //         "</div>",
                //     handleEvent: $scope.handleEvents
                // },
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
                               <span class="grid-action" ng-click="handleEvents(\'return\',entity)"><i class="btn text-white dem-color4  btn-xs" aria-hidden="true"><strong>Send to MRD</strong></i></span>\
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

        $scope.refreshReactProps();

        
       $timeout(function () {
        removeFloatingNav();
    }, 100);

    function removeFloatingNav() {
        $rootScope.app.layout.isCollapsed = true;
    }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var admitid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Admitted');
            var fitforid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Fit For Discharge');
            var clinicalid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Clinical Discharge');
            var financialid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Financial Discharge');
            $scope.currentfilter.admissionstatusid = admitid + ',' + fitforid + ',' + clinicalid + ',' + financialid;
            $scope.getList();
        }

        $scope.initLookup = function() {
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
                    {
                        "Key": "User",
                        Request: {
                            Params: [{
                                    Key: 3,
                                    Value: 2
                                },
                                {
                                    Key: 5,
                                    Value: 2
                                }
                            ]
                        }
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
    MRDFileReturnsListController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();