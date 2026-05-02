(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('NurseOPPatientsController', NurseOPPatientsController);

    function NurseOPPatientsController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;

        $scope.gridData = [];
        $scope.currentfilter = {
            patientname: '',
            consultationstatusid: -1,
            visitdate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };

        $scope.currentcontext = {
            DoctorId: parseInt(utl.Session.getCurrentUserId())
        };

        $scope.patientsecuritypin =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'patientsecuritypin');


        $scope.getPatientProfilePicCallback = function(scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Patient.Id == patientId) {
                    item.Patient.Photo = photo;
                }
            }
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


        $scope.appoinment = function() {
                $state.go('app.nursingdashboard');
            }
            // $scope.backToList = function () {
            //     $state.go('app.nursingdashboard');
            // };
        $scope.changeConsultantStatus = function(ConStatusId) {
            $scope.currentfilter.consultationstatusid = ConStatusId;
            $scope.getList();
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.Patient) {
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            loadPhotos();
        };
        $scope.getList = function() {
            if (!$scope.currentfilter.patientname) {
                if ($scope.currentfilter.visitdate == null) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select Date...'));
                    return false;
                }
            }
            var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
            var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: {
                            'AppointmentStatus': 6,
                            'My': false
                        }
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.patientname
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.consultationstatusid
                    // },
                    {
                        Key: 10,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 21,
                        Value: 1
                    },
                    {
                        Key: 20,
                        Value: 1
                    },
                    // {
                    //     Key: 22,
                    //     Value: [FrRegDt, ToRegDt]
                    // }
                ]
            }
            if (!$scope.currentfilter.patientname) {
                inputData.Params.push({
                    Key: 22,
                    Value: [FrRegDt, ToRegDt]
                })
            }
            if (!$scope.currentfilter.patientname && $scope.currentfilter.consultationstatusid > 0) {
                inputData.Params.push({
                    Key: 4,
                    Value: $scope.currentfilter.consultationstatusid
                })
            }
            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $timeout(function() {
            $('#patientname').focus();
        }, 1000);

        // $scope.onEnter = function (data) {
        //     if (data == undefined) {
        //         $scope.currentfilter.PatientId = 0;
        //         $scope.getList();
        //     }
        // }



        function attendPatientAfterConfirm(data) {
            var actionName = 'appointment/patienttracker/AttendPatient';

            var inputData = {
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId,
                eid: data.Encounter.Id
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
        }

        function updatePatientBillsCallback(scope, data, options, hasError) {
            $scope.initLookup();
        };

        function updateAppointmentStatus(data) {
            var actionName = 'appointment/Appointment/UpdateAppointment';

            var inputData = {
                Id: data.AppointmentId,
                AppointmentStatusId: 12
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                    //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        function updateEncounterStatus(data) {
            var actionName = 'encounter/Visit/UpdateEncounter';

            var inputData = {
                Id: data.Encounter.Id,
                IsVisitCancel: 1,
                DischargeDate: utl.Formatter.getCurrentDate()
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                    //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        function updateEncounterDoctorStatus(data) {
            var actionName = 'encounter/EncounterDoctor/UpdateEncounterDoctor';

            var inputData = {
                Id: data.Id,
                EncounterDoctorStatus: 4
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                    //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        function updatePatientBills(PatientBillId, PatientBillAmount) {
            var actionName = 'billing/patientbills/UpdatePatientBillsByDefaultFlow';
            var inputData = {
                Id: PatientBillId,
                PatientBillStatusId: 2,
                IsCancelRequest: true,
                CancelReason: '',
                CancelAmount: PatientBillAmount,
                CancelledBy: parseInt(utl.Session.getCurrentUserId()),
                BillCancelStatusId: 1,
                CancelledAt: new Date()
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: updatePatientBillsCallback
            };

            utl.Http.doAction(options);
        }

        function getPatientBillsCallback(scope, res, options, hasError) {
            let PatientBillId = 0;
            let PatientBillAmount = 0;
            if (res.Data.length > 0)
                $scope.PatientBills = res.Data[0];
            PatientBillId = res.Data[0].Id;
            PatientBillAmount = res.Data[0].GrossTotal;
            if (PatientBillId > 0) {
                updatePatientBills(PatientBillId, PatientBillAmount);
            }
        };

        function getPatientBills(data) {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 12,
                        Value: data.PatientId
                    },
                    {
                        Key: 16,
                        Value: data.Encounter.Id
                    },
                    {
                        Key: 40,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: getPatientBillsCallback
            };

            utl.Http.doAction(options);
        };

        function updateCheckoutStatus(data) {
            var actionName = 'appointment/patienttracker/CheckoutPatient';

            var inputData = {
                EncounterId: data.Encounter.Id,
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId,
                DoctorId: data.Encounter.DoctorId,
                IsNotShownPatient: true
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                    //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        $scope.onConfirmation = function(confirmedentity) {
            if (confirmedentity.new_visit) {
                $scope.getList();
            } else {
                var selectedVisit = confirmedentity.selected_visit;
                $scope.selectedVisit = {};
                $scope.selectedVisit.Id = confirmedentity.current_visit.Encounter.Id;
                $scope.selectedVisit.EncounterId = confirmedentity.current_visit.Encounter.Id;
                $scope.selectedVisit.PreviousEncounterId = selectedVisit.Id;
                $scope.selectedVisit.DeductableAmount = selectedVisit.DeductableAmount;
                $scope.selectedVisit.BalanceDeductableAmount = selectedVisit.BalanceDeductableAmount;
                $scope.selectedVisit.ApprovedLimit = selectedVisit.ApprovedLimit;
                $scope.selectedVisit.BalanceApprovedLimit = selectedVisit.BalanceApprovedLimit;
                $scope.selectedVisit.ClaimProcessId = selectedVisit.ClaimProcessId;
                $scope.selectedVisit.ClaimNumber = selectedVisit.ClaimNumber;
                $scope.changeFollwUpVisit();
                attendPatientAfterConfirm({
                    PatientId: confirmedentity.PatientId,
                    AppointmentId: confirmedentity.AppointmentId,
                    Encounter: confirmedentity.current_visit.Encounter
                });
            }
        };

        function attentPatientCallback(scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.getList();
            utl.Session.setEMRPatientId(options.data.Data.PatientId);
            $state.go('patientemr.patientrecords', {
                pid: options.data.Data.PatientId,
                eid: options.data.Data.eid,
                from: 'nursing'
            });

        };

        function attendPatient(data) {
            var actionName = 'appointment/patienttracker/AttendPatient';

            var inputData = {
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId,
                eid: data.Encounter.Id
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
        }

        $scope.getattendPatConf = function(itemFromModal) {
            if (itemFromModal.PatData.IsPinVerified) {
                attendPatient(itemFromModal.EncData);
            }
        }

        $scope.getSecPin = function(encdata, type) {
            if (type == 'attend') {
                utl.Modal.open('app.patsecuritypincheck', {
                    params: { pid: encdata.PatientId, eInfo: encdata },
                    confirmCallback: $scope.getattendPatConf
                });
            } else if (type == 'emr') {
                utl.Modal.open('app.patsecuritypincheck', {
                    params: { pid: encdata.PatientId, eInfo: encdata },
                    confirmCallback: $scope.gotoEMR
                });
            }
        }

        $scope.gotoEMR = function(itemFromModal) {
            if (itemFromModal.PatData.IsPinVerified) {
                utl.Session.setEMRPatientId(itemFromModal.EncData.PatientId);
                $state.go('patientemr.orderpatientrecords', {
                    eid: itemFromModal.EncData.EncounterId,
                    pid: itemFromModal.EncData.PatientId,
                    aid: itemFromModal.EncData.AppointmentId
                });
            }
        }
        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'attend') {
                if ($scope.patientsecuritypin == 1) {
                    $scope.getSecPin(entity, actionType);
                } else {
                    attendPatient({
                        PatientId: entity.PatientId,
                        AppointmentId: entity.AppointmentId,
                        Encounter: entity.Encounter
                    });
                }
                // attendPatient(entity);
            } else if (actionType == 'emr') {
                if ($scope.patientsecuritypin == 1) {
                    $scope.getSecPin(entity, actionType);
                } else {
                    utl.Session.setEMRPatientId(entity.PatientId);
                    $state.go('patientemr.patientrecords', {
                        eid: entity.EncounterId,
                        pid: entity.PatientId,
                        aid: entity.AppointmentId,
                        from: 'nursing'
                    });
                }
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
                    field: "StartDate",
                    displayName: $translate.instant('registration.checkedinpatients.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StartDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.StartDate| date: 'HH:mm'}}</span>" + "</div>"
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
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
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

                {
                    field: "Encounter.VisitType.Description",
                    displayName: $translate.instant('registration.checkedinpatients.visittype.lbl'),
                },
                {
                    field: "Encounter.Remark.Remarks",
                    displayName: $translate.instant('Visit Reason'),
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
                // {
                //     field: "ClaimNumber",
                //     displayName: $translate.instant('registration.checkedinpatients.claimno.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents claim" >\
                //     {{entity.Encounter.ClaimNumber}} </div>'
                // },
                {
                    field: "ConsultationStatus.Description",
                    displayName: $translate.instant('registration.checkedinpatients.staturs.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('registration.checkedinpatients.action.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'attend\',entity)" ng-show="entity.EncounterDoctorStatus==1">\
                    <i class="fas fa-hospital-user" uib-tooltip="Attend" tooltip-placement="bottom"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'emr\',entity)" ng-hide="entity.EncounterDoctorStatus==1">\
                    <i class="fas solid fa-laptop-medical" uib-tooltip="EMR" aria-hidden="true"></i></span>\
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
        $scope.changeFollwUpVisit = function() {
            var actionName = '';
            if ($scope.selectedVisit.Id && $scope.selectedVisit.Id > 0) {
                actionName = 'encounter/Visit/ChangeFollwUpVisit';
            }

            var inputData = {
                Header: $scope.selectedVisit
            };

            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.changeFollwUpCallback
            };

            utl.Http.doAction(options);
        };

        function handleCheckout(entity) {
            utl.Modal.open('app.patienttracker', {
                params: {
                    pid: entity.PatientId,
                    aid: entity.AppointmentId,
                    from: 'doctordashboard'
                },
                confirmCallback: patientTrackerCallback
            });
        }


        function patientTrackerCallback() {
            $scope.getList();
        }

        $scope.canShowAction = function(actionType, entity) {
            if (actionType == 'waiting4u') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 1 && entity.DoctorId == currentDoctorId);
            } else if (actionType == 'waiting4others') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 1 && entity.DoctorId != currentDoctorId);
            } else if (actionType == 'attendbyu') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 2 && entity.DoctorId == currentDoctorId);
            } else if (actionType == 'attendbyothers') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 2 && entity.DoctorId != currentDoctorId);
            }
            return true;
        };


        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function() {
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

    NurseOPPatientsController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

})();