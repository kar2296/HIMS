(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('apnmtfollowtokenController', apnmtfollowtokenController);

    function apnmtfollowtokenController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            //StartDate: utl.Formatter.getCurrentDate(),
            //AssignTo: 3,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FollowupBy1: utl.Session.getCurrentUserName(),
            FollowupBy2: utl.Session.getCurrentUserName(),
            FollowupBy3: utl.Session.getCurrentUserName(),
            // DurationPeriodId: 1,
            // DurationPeriod: 'Days',
            isTracker: 0
        };
        $scope.lookup = {};
        $scope.from = '';

        $scope.currentcontext = {
            id: -1,
            DoctorName: ''
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.aid = parseInt(modalConfig.params.aid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.doctor = parseInt(modalConfig.params.doctid);
            $scope.context = modalConfig.params.context;
            if(modalConfig.params.tracker && modalConfig.params.tracker != '') {
                $scope.item.isTracker = 1;
                $scope.item.TrackerNotes = modalConfig.params.tracker.TrackerNotes;
                $scope.item.FollowupAppointmentOn = modalConfig.params.tracker.FollowupAppointmentOn;
            }

            if (modalConfig.params.assignto)
                $scope.item.AssignTo = modalConfig.params.assignto;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        console.log(modalConfig.params);
        vm.AssignToOptions = [{
            Id: 1,
            Text: $translate.instant('registration.patienttracker.user.lbl')
        },
        // { Id: 2, Text: $translate.instant('registration.patienttracker.group.lbl') },
        {
            Id: 3,
            Text: $translate.instant('registration.patienttracker.consultation.lbl')
        },
        {
            Id: 4,
            Text: $translate.instant('registration.patienttracker.completevisit.lbl')
        }
        ]

        if(modalConfig.params.from == 'followuptracker') {
            vm.AssignToOptions.splice(1,2)  ;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.AppointmentId = $scope.currentcontext.aid;

        //Visibility rules starts
        $scope.canShowUser = function () {
            return $scope.item.AssignTo == 1;
        }

        $scope.canShowGroup = function () {
            return $scope.item.AssignTo == 2;
        }

        $scope.canShowRoom = function () {
            return $scope.item.AssignTo == 1 || $scope.item.AssignTo == 2;
        }

        $scope.canShowFacility = function () {
            return $scope.item.AssignTo == 1 || $scope.item.AssignTo == 2;
        }

        $scope.canShowReviewNotes = function () {
            return $scope.item.AssignTo == 1 || $scope.item.AssignTo == 2;
        }
        //Visibility rules ends

        $scope.onGroupChange = function (item) {
            $scope.item.AssignedGroupName = item.Text;
        }

        $scope.onUserChange = function (item) {
            var name = item.FirstName;
            if (item.Title && item.Title.Description) {
                name = item.Title.Description + " " + name;
            }
            if (item.LastName) {
                name += " " + item.LastName;
            }
            $scope.item.AssignedUserName = name;
            $scope.item.DepartmentId = item.DepartmentId;
        }

        $scope.onRoomChange = function (item) {
            $scope.item.AssignedRoomName = item.Text;
        }

        $scope.onDurationPeriodChange = function (item) {
            $scope.item.DurationPeriod = item.Text;
        }

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.cancelCallback();
            }
        }
        $scope.getpatientsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var Patient = data.Data[0];
                $scope.currentcontext.DoctorName = Patient.Encounters[0].DoctorName;
                if (Patient.Encounters[0].EncounterDoctors) {
                    if (Patient.Encounters[0].EncounterDoctors.length > 0) {
                        var encounter = Patient.Encounters[0].EncounterDoctors[0];
                        $scope.currentcontext.DoctorId = encounter.DoctorId;
                        $scope.currentcontext.DepartmentId = encounter.DepartmentId;
                    }
                }
            }
        };

        $scope.getPatientById = function () {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                },]
            };

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpatientsCallback
            };

            utl.Http.doAction(options);
        };

        function openAppointmentForm(appnmtDate) {
            utl.Modal.open('app.appointment', {
                params: {
                    id: 0,
                    ct: 'followup',
                    pid: $scope.currentcontext.pid,
                    appointmentDate: appnmtDate,
                    doctorId: $scope.currentcontext.DoctorId,
                    deptId: $scope.currentcontext.DepartmentId
                },
                confirmCallback: $scope.confirmCallback
            });
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();

            // if($scope.item.FollowupTrackerStatusId == 4)
            // {
            //     $scope.confirmCallback();
            //     $state.go('app.appointmentstab.details', {
            //         pid: $scope.currentcontext.pid,
            //     });
            // } else {
            //     $scope.confirmCallback();
            // }

        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getList = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'appointment/patienttracker/GetPatientTrackerById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItem = function (status) {

            if(status == 2)
            {
                $scope.item.FollowupTrackerStatusId = 2;
            }

            if(status == 3)
            {
                $scope.item.FollowupTrackerStatusId = 3;
            }

            if(status == 4)
            {
                $scope.item.FollowupTrackerStatusId = 4;
            }

            if (!$scope.item.FollowupComments1)
            {
                $scope.item.FollowupBy1 = '';
            }


            if (!$scope.item.FollowupComments2)
            {
                $scope.item.FollowupBy2 = '';
            } else {
                $scope.item.FollowupBy2 = utl.Session.getCurrentUserName();
            }

            if (!$scope.item.FollowupComments3)
            {
                $scope.item.FollowupBy3 = '';
            } else {
                $scope.item.FollowupBy3 = utl.Session.getCurrentUserName();
            }

                                   // if ($scope.canShowUser()) {
            //     $scope.item.AssignedGroupId = null;
            //     $scope.item.AssignedGroupName = null;
            // } else if ($scope.canShowGroup()) {
            //     $scope.item.AssignedUserId = null;
            //     $scope.item.AssignedUserName = null;
            // }

            // if ($scope.item.Duration && $scope.item.DurationPeriod) {
            //     $scope.item.FollowupAppointmentOn = utl.Formatter.computeDateBasedOnPeriod($scope.item.Duration, $scope.item.DurationPeriod);
            //     console.log($scope.item.FollowupAppointmentOn);
            // }

            var actionName = '';
            if( $scope.currentcontext.eid) {
                $scope.item.EncounterId = $scope.currentcontext.eid;
                $scope.item.Id = $scope.currentcontext.id;
            }
            // console.log($scope.item);
            // return;
            if($scope.item.FollowupTrackerStatusId == 4) {

                $scope.confirmCallback();
                    $state.go('app.appointmentstab.details', {
                        pid: $scope.currentcontext.pid,
                        date: $scope.item.FollowupAppointmentOn,
                        doctor: $scope.item.DoctorId,
                        tid: $scope.currentcontext.id
                    });
            } else {
                actionName = 'appointment/patienttracker/UpdatePatientTracker';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
            }

        };

        //lookup
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        // }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'Facility') {
                    $scope.item.FacilityId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Group"
                },
                {
                    "Key": "Room"
                },
                {
                    "Key": "DurationPeriod"
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
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
        $scope.getList();
        $scope.getPatientById();
    }


    apnmtfollowtokenController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();