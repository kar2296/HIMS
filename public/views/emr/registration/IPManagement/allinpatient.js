(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('allinpatientsController', allinpatientsController);

    function allinpatientsController($scope, $filter, $stateParams, $state, $translate, utl, uibButtonConfig) {
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
                var item = items[idx]
                if (item.IsDay1Discharge == true) {
                    item.IsDay1Discharge = "Day-1 Discharge";
                }
                $scope.gridData.IsDay1Discharge = item.IsDay1Discharge;
                const admission_array = [4, 5, 6]; //4-Clinical Discharge, 5-Financial Discharge, 6-Physical Discharge

                if (item.IsBillLock && !admission_array.includes(item.AdmissionStatusId)) {
                    item.ColorCode = 6;
                } else {
                    item.ColorCode = item.AdmissionStatusId;
                }

                if (item.IsPackageAssigned == true) {
                    item.ColorCode = 7;
                }

            }
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            // loadPhotos();
        };

        $scope.getList = function() {
            if ($scope.currentfilter.DOA)
                var From = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;

            vm.gridConfig.data = [];
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
                    // {
                    //     Key: 8,
                    //     Value: $scope.currentfilter.AdmissionRequestTypeId
                    // },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    // {
                    //     Key: 12,
                    //     Value: $scope.currentfilter.RequestNo
                    // },
                    // {
                    //     Key: 13,
                    //     Value: $scope.currentfilter.VisitIdentifier
                    // },
                    {
                        Key: 15,
                        Value: 2
                    },
                    // {
                    //     Key: 16,
                    //     Value: utl.Formatter.getFilterDate($scope.currentfilter.AdmissionDate)
                    // },
                    {
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    // {
                    //     Key: 20,
                    //     Value: $scope.currentfilter.AttenderPhone
                    // },
                    // {
                    //     Key: 6,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },

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
            console.log(actionType);
            if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('patientemr.patientrecords', {
                    eid: entity.Id,
                    pid: entity.PatientId,
                    from: 'nursing'
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
        var rowtpl = '<div ng-class="{\'green\':row.entity.AdmissionStatusId==1, \'blue\':row.entity.AdmissionStatusId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                //flag: 'IsBillLock && AdmissionStatusId!=5',

                style: {
                    field: 'ColorCode',
                    value: {
                        // 1:{'background':'#000000','color':'#fff'},
                        // 2:{'background':'#8217a6','color':'#fff'},
                        // 3:{'background':'#FFFF00','color':'#fff'},
                        // 4: { 'background': '#EE7700', 'color': '#fff' },
                        5: {
                            'background': '#4274d8ad',
                            'color': 'black'
                        },
                        6: {
                            'background': '#ed143dad',
                            'color': '#fff'
                        },
                        7: {
                            'background': '#EE7700',
                            'color': '#fff'
                        },
                    }
                },

            },
            package: {
                flag: 'IsPackageAssigned',
                // style: {
                //     field: 'Status',
                //     value: {
                //         1: { 'background': 'red', 'color': '#fff' }
                //     }
                // }
            },
            // background: {
            //     // flag: 'IsPackageAssigned',
            //     style: {
            //         field: 'IsPackageAssigned',
            //         value: {
            //             true: { 'background': 'green', 'color': '#fff' }
            //         }
            //     }
            // },
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
                        "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
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
                { field: "IsDay1Discharge", displayName: $translate.instant('Day-1 Discharge') },
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
                    // {
                    //     "Key": "Doctor"
                    // },
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
    }
    allinpatientsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();