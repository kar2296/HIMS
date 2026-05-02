(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServicecurrentpatientsingleController', ServicecurrentpatientsingleController);

    function ServicecurrentpatientsingleController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;

        $scope.gridData = [];
        $scope.PendingOrders = [];
        $scope.currentfilter = {
            patientname: '',
            consultationstatusid: 1,
            scheduledate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };

        if ($stateParams.cInfoId) {
            $scope.cInfoId = $stateParams.cInfoId;
        }

        $scope.currentcontext = {
            DoctorId: parseInt(utl.Session.getCurrentUserId())
        };

        $scope.changeConsultantStatus = function (ConStatusId) {
            $scope.currentfilter.consultationstatusid = ConStatusId;
            $scope.getList();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.PendingOrders = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentfilter.scheduledate == null) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Date...'));
                return false;
            }
            var FrRegDt = $filter('date')($scope.currentfilter.scheduledate, 'yyyy-MM-dd 00:00:00');
            var ToRegDt = $filter('date')($scope.currentfilter.scheduledate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentfilter.patientname
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.consultationstatusid
                    },
                    {
                        Key: 10,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 23,
                        Value: true
                    },
                    {
                        Key: 29,
                        Value: FrRegDt
                    },
                    {
                        Key: 30,
                        Value: ToRegDt
                    },
                    {
                        Key: 24,
                        Value: $scope.cInfoId
                    },
                    {
                        Key: 13,
                        Value: $scope.currentcontext.DoctorId
                    },
                ]
            }
            var options = {
                action: 'Visit/EncounterDoctor/GetServiceEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $timeout(function () {
            $('#patientname').focus();
        }, 1000);


        function attentPatientCallback(scope, data, options, hasError) {
            utl.Session.setEMRPatientId(options.data.Data.PatientId);
            $state.go('patientemr.orderpatientrecords', {
                pid: options.data.Data.PatientId,
                eid: options.data.Data.eid,
                oid: options.data.Data.oid
            });

        };

        function attendPatient(data) {
            var actionName = 'appointment/patienttracker/AttendPatient';
            var inputData = {
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId,
                eid: data.Encounter,
                oid: data.oid
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: attentPatientCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'attend') {
                attendPatient({
                    PatientId: entity.PatientId,
                    AppointmentId: entity.AppointmentId,
                    Encounter: entity.EncounterId,
                    oid: entity.VirtualOrderId
                });
            } else if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('patientemr.orderpatientrecords', {
                    eid: entity.EncounterId,
                    pid: entity.PatientId,
                    oid: entity.VirtualOrderId
                });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "RequestDate",
                    displayName: $translate.instant('Request Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.VirtualOrder.OrderRequestDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.VirtualOrder.OrderRequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "ScheduleDate",
                    displayName: $translate.instant('Schedule Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.VirtualOrder.OrderScheduleDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.VirtualOrder.OrderScheduleDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "VirtualOrder.OrderNumber",
                    displayName: $translate.instant('Ref,No#')
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('registration.checkedinpatients.mrn.lbl')
                },
                {
                    field: "Name",
                    displayName: $translate.instant('registration.checkedinpatients.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                        '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" >' +
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

                {
                    field: "OrderConsultType",
                    displayName: $translate.instant('Consult Type'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <div ng-if='entity.VirtualOrder.OrderConsultTypeId==1'>\
                        <span>Call</span>\
                    </div>\ <div ng-if='entity.VirtualOrder.OrderConsultTypeId==2'>\
                        <span>Video</span>\
                    </div>\
                      </div>"
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('registration.checkedinpatients.drname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                        "{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</a></div>",
                },
                {
                    field: "ConsultationStatus.Description",
                    displayName: $translate.instant('registration.checkedinpatients.staturs.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('registration.checkedinpatients.action.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'attend\',entity)" ng-show="entity.EncounterDoctorStatus==1"  tooltip-placement="top">\
                    <i class="fas fa-hospital-user" uib-tooltip="Attend"  aria-hidden="true" tooltip-placement="top"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'emr\',entity)" ng-hide="entity.EncounterDoctorStatus==1"   tooltip-placement="top">\
                    <i class="fas solid fa-laptop-medical" uib-tooltip="EMR"></i></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
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
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ConsultationStatus"
            }]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();

    }

    ServicecurrentpatientsingleController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

})();