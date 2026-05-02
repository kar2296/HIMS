(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('daycarepatientsController', daycarepatientsController);

    function daycarepatientsController($scope, $filter, $stateParams, $state, $translate, utl, uibButtonConfig) {
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
        $scope.allowaetoipconversion = 0;
        $scope.allowaetoipconversion = utl.FacilitySetting.getFacilitySettingValue('billing', 'allowaetoipconversion');
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
                item.ShowAdmission = 0;
                if ($scope.allowaetoipconversion == 1) {
                    item.ShowAdmission = 1;
                }
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            // loadPhotos();
        };

        $scope.getList = function() {
            if ($scope.currentfilter.DOA) {
                var From = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            }

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
                        Key: 11,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    {
                        Key: 15,
                        Value: 5
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
                        Key: 69,
                        Value: true
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
            console.log(actionType);
            if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('patientemr.patientrecords', {
                    eid: entity.Id,
                    pid: entity.PatientId,
                    aid: entity.AppointmentId,
                    // from: 'nursing'
                });
            } else if (actionType == 'admission') {
                $state.go('app.admissiontab.admission', {
                    pid: entity.PatientId,
                    eid: entity.Id,
                    isdaycare: true,
                    admdate: entity.AdmissionDate,
                    id: 0
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
                        "<span >{{entity.Patient.Gender.Description}}&nbsp;</span>" +
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
                               <span class="grid-action" ng-click="handleEvents(\'admission\',entity)" ng-show="entity.ShowAdmission==1">\
                               <img class="imgsrc" src="app/img/main/computer.png"  uib-tooltip="Admission" tooltip-placement="bottom" style="margin-top: -3px;width: 33px;"></span>\
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
    }
    daycarepatientsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();