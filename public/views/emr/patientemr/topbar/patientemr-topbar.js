(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientEMRTopbarController', patientEMRTopbarController);

    function patientEMRTopbarController($scope, $stateParams, $state, $translate, utl, $rootScope, $cookies) {
        $scope.patientInfo = {};
        $scope.Encounter = {};
        $scope.userinfo = {};
        $scope.currentcontext = {};
        $scope.currentcontext.allergy = '';
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.uid = parseInt(utl.Session.getCurrentUserId());
        if ($stateParams.pid) {
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        }

        if ($stateParams.doctor) {
            $scope.currentcontext.doctor = parseInt($stateParams.doctor);
        }
        $scope.contextLandingPageMap = {
            emr: {
                title: $translate.instant('patientemr.patient-topbar.tab-opemr.lbl'),
                context: 'emr',
                landingstate: 'patientemr.consultationtab.consultationcurrentlist'
            },
            aeemr: {
                title: $translate.instant('patientemr.patient-topbar.tab-opemr.lbl'),
                context: 'aeemr',
                landingstate: 'patientemr.consultationtab.consultationcurrentlist'
            },
            ipemr: {
                title: $translate.instant('patientemr.patient-topbar.tab-ipemr.lbl'),
                context: 'ipemr',
                landingstate: 'patientemr.patientrecords'
            },
            pastvisits: {
                title: $translate.instant('patientemr.patient-topbar.tab-pastvisits.lbl'),
                context: 'pastvisits',
                landingstate: 'patientemr.pastvisits'
            },
            pmhx: {
                title: $translate.instant('patientemr.patient-topbar.tab-pmhx.lbl'),
                context: 'pmhx',
                landingstate: 'patientemr.pmhxdashboard'
            },
            vorders: {
                title: $translate.instant('patientemr.patient-topbar.tab-opemr.lbl'),
                context: 'vorders',
                landingstate: 'patientemr.orderpatientrecords'
            }
        };

        $scope.contextMenus = [
            $scope.contextLandingPageMap['emr'],
            $scope.contextLandingPageMap['aeemr'],
            $scope.contextLandingPageMap['ipemr'],
            $scope.contextLandingPageMap['pastvisits'],
            $scope.contextLandingPageMap['pmhx'],
            $scope.contextLandingPageMap['vorders']
        ];

        $scope.backToList = function () {
            $state.go('app.patientsearch');
        };

        $scope.switchContext = function (item) {
            $state.go(item.landingstate);
            $rootScope.$broadcast('patientemr-context-switch', {
                context: item.context
            });
        }

        //logout
        $scope.logoutCallback = function (scope, res, options, hasError) {
            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k, {
                    path: '/'
                });
            });
            $state.go('page.login');
        };

        $scope.logout = function () {
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };

            utl.Http.doAction(options);
        };


        //Code block to redraw after get encounter
        $scope.$on('patientemr-redraw-topbar', function (event, args) {
            if (event.targetScope.$stateParams.oid > 0) {
                $scope.currentcontext.oid = event.targetScope.$stateParams.oid;
                var encounter = args.encounter;
                var encounterid = 0;
                encounterid = encounter.Id;
                // var strCotext = 'vorders';
                var strCotext = 'emr';
            }
            if (!event.targetScope.$stateParams.oid && args.encounter) {
                var encounter = args.encounter;
                var strCotext = 'pastvisits';
                var encounterid = 0;
                if (encounter) {
                    strCotext = encounter.EncounterTypeId == 1 ? 'emr' : 'ipemr';
                    encounterid = encounter.Id;
                }
            }
            if (!event.targetScope.$stateParams.oid && args.encounter) {
                var encounter = args.encounter;
                var strCotext = 'pastvisits';
                var encounterid = 0;
                if (encounter) {
                    if (encounter.IsEmergencyVisit == true) {
                        // strCotext = 'aeemr';
                        strCotext = encounter.EncounterTypeId == 1 ? 'emr' : 'aeemr';
                        encounterid = encounter.Id;
                    }
                }
            }
            computeMenu(encounter, strCotext);
            // No encounter in the event (e.g. a visit without an encounter id): nothing to switch to.
            if (!$scope.contextLandingPageMap[strCotext]) {
                return;
            }
            var landingstate = $scope.contextLandingPageMap[strCotext].landingstate;

            $state.go(landingstate, {
                pid: $scope.currentcontext.pid,
                eid: encounterid,
                context: strCotext,
                oid: $scope.currentcontext.oid
            });
            $rootScope.$broadcast('patientemr-context-switch', {
                context: strCotext
            });
        });

        //Code block to receive broadcast from pastvists starts

        $scope.$on('patientemr-view-encounter', function (event, args) {
            var encounter = args.encounter;
            var strCotext = encounter.EncounterTypeId == 1 ? 'emr' : 'ipemr';

            computeMenu(encounter, strCotext);
            var landingstate = $scope.contextLandingPageMap[strCotext].landingstate;

            $state.go(landingstate, {
                eid: encounter.Id
            });
            $rootScope.$broadcast('patientemr-context-switch', {
                context: strCotext
            });
        });

        function computeMenu(encounter, context) {
            var contextMenusArr = [];

            if (context != 'pastvisits') {
                contextMenusArr.push($scope.contextLandingPageMap[context]);
            }
            contextMenusArr.push($scope.contextLandingPageMap['pastvisits']);
            contextMenusArr.push($scope.contextLandingPageMap['pmhx']);

            $scope.contextMenus = contextMenusArr;
        }
        $scope.checkout = function () {
            utl.Modal.open('app.patienttracker', {
                params: {
                    pid: $scope.currentcontext.pid,
                    aid: $scope.patientInfo.Encounters[0].AppointmentId
                },
                cancelCallback: $scope.getList
            });
        }

        $scope.diagnosis = function () {
            utl.Modal.open('patientemr.patientdiagnosis', {
                params: {
                    pid: $scope.currentcontext.pid,
                    aid: $scope.patientInfo.Encounters[0].AppointmentId
                },
                cancelCallback: $scope.getList
            });
        }
        //Code block to receive broadcast from pastvists ends

        $scope.generalalerts = function () {
            utl.Modal.open('app.alertview', {
                params: {},
                cancelCallback: $scope.updateCount
            });
        }

        $scope.patientalerts = function () {
            utl.Modal.open('app.alertview', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                cancelCallback: $scope.updateCount
            });
        }
        $scope.updateCount = function () {
            $scope.getGeneralAlertsCount();
            $scope.getPatientAlertsCount();
        }

        $scope.patientallergy = function () {
            utl.Modal.open('patientemr.patientallergydashboard', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.getAllergyListCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.allergyCount = res.Data.length;
            for (var idx in res.Data) {
                if (idx < 3) {
                    var allergy = res.Data[idx].AllergyName;
                    var allergyname = '';
                    if (allergy)
                        allergyname = allergy;
                    $scope.currentcontext.allergy += allergyname + ',';
                }
            }
        };

        $scope.checkPatientAllergy = function () {

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 4,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllergyListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.patientAlertsCount = res.Data.length;
        };

        $scope.getPatientAlertsCount = function () {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 8,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getGeneralAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.generalAlertsCount = res.Data.length;
        };

        $scope.getGeneralAlertsCount = function () {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 7,
                        Value: true
                    },
                    {
                        Key: 8,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGeneralAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getUserCallback = function (scope, res, options, hasError) {
            $scope.userinfo = res.Data;
        };

        $scope.getUser = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.uid
                }, ],
            };

            var options = {
                action: 'SystemSettings/User/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUserCallback
            };

            utl.Http.doAction(options);
        };
        $scope.patientprofile = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentcontext.pid
                },
            });
        };

        $scope.profilesummary = function () {
            $state.go('patientemr.consuldationnotestab.consultationnotes');
        };

        $scope.homedoctordashboard = function () {
            $state.go('app.doctordashboard');
        };

        $scope.bedboard = function () {
            $state.go('app.bedmanagement');
        };

        //Attend Patient
        function attentPatientCallback(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        function attendPatient(data) {
            var actionName = 'appointment/patienttracker/AttendPatient';

            var inputData = {
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId
            }
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: attentPatientCallback
            };

            utl.Http.doAction(options);
        }

        function handlePatientAttend(entity) {
            var data = entity.Patient;
            var patientName = data.FirstName;
            if (data.Title && data.Title.Description) {
                patientName = data.Title.Description + ' ' + patientName;
            }
            if (data.LastName) {
                patientName += ' ' + data.LastName;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'registration.checkedinpatients.patient-attend-msg.lbl',
                placeholder: {
                    patientname: patientName
                },
                onSuccessMethod: function () {
                    attendPatient({
                        PatientId: entity.PatientId,
                        AppointmentId: entity.AppointmentId
                    });
                }
            };

            utl.Dialog.confirmMessage(confirmOptions);
        }

        function handleCheckout(entity) {
            utl.Modal.open('app.patienttracker', {
                params: {
                    pid: entity.PatientId,
                    aid: entity.AppointmentId
                },
                confirmCallback: $scope.getItem
            });
        }

        //handleevents
        $scope.handleEvents = function (actionType) {

            if (actionType == 'attend') {
                handlePatientAttend($scope.EncounterDoctor);
            } else if (actionType == 'checkout') {
                handleCheckout($scope.EncounterDoctor);
            }
        }


        //get encounter doctors
        function getEncounterDoctorsCallback(scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.EncounterDoctor = res.Data[0];
            }
        };

        function getEncounterDoctors() {
            $scope.EncounterDoctor = {};

            if ($scope.Encounter && $scope.Encounter.EncounterId) {
                var inputData = {
                    Params: [{
                        Key: 6,
                        Value: $scope.Encounter.EncounterId
                    }],
                    PageContext: {
                        PageSize: 20,
                        PageNumber: 1
                    }
                };

                inputData.Params.push({
                    Key: 2,
                    Value: {
                        'AppointmentStatus': 6,
                        'My': true
                    }
                });

                var options = {
                    action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                    data: inputData,
                    type: 'post',
                    onComplete: getEncounterDoctorsCallback
                };

                utl.Http.doAction(options);
            }
        }

        function getEncounterCallback(scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                for (var idx in res.Data) {
                    if ($scope.currentcontext.eid == res.Data[idx].Id)
                        $scope.Encounter = res.Data[idx];
                }
            }
        };

        function getEncounters() {
            $scope.Encounter = {};

            if ($scope.patientInfo && $scope.patientInfo.Encounters.length > 0) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.currentcontext.pid
                    }],
                    PageContext: {
                        PageSize: 20,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: getEncounterCallback
                };

                utl.Http.doAction(options);
            }
        }

        //getItem
        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.patientInfo = res.Data[0];

            var gender = $scope.patientInfo.Gender && $scope.patientInfo.Gender.Description ? $scope.patientInfo.Gender.Description : '';
            utl.Session.setPatientGender(gender);
            utl.Session.setPatientDOB($scope.patientInfo.DOB);

            $scope.Encounter = $scope.patientInfo.Encounters ? $scope.patientInfo.Encounters[0] : {};
            for (var idx in $scope.patientInfo.Appointments) {
                var appt = $scope.patientInfo.Appointments[idx];
                if (appt.Id == $scope.Encounter.AppointmentId) {
                    $scope.patientInfo.Appointment = appt;
                    break;
                }
            }
            $scope.getPatientProfilePic();
            getEncounterDoctors();
            getEncounters();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var inputData = {
                    Params: [{
                            Key: 0,
                            Value: $scope.currentcontext.pid
                        },
                        // { Key: 32, Value: $scope.currentcontext.eid }
                    ],
                    PageContext: {
                        PageSize: 0,
                        PageNumber: 25
                    }
                };

                var options = {
                    action: 'registration/patient/GetPatients',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.patientInfo.PhotoPath) {
                var inputData = {
                    Id: $scope.patientInfo.Id,
                    PhotoPath: $scope.patientInfo.PhotoPath
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

        $scope.getItem();
        $scope.getGeneralAlertsCount();
        $scope.getPatientAlertsCount();
        $scope.checkPatientAllergy();
        $scope.getUser();
    }

    patientEMRTopbarController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$rootScope', '$cookies'];

})();