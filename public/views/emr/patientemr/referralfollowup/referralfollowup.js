(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReferralFollowupController', ReferralFollowupController);

    function ReferralFollowupController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getCNSectionBaseCtrl({ $scope: $scope }));

        $scope.item = {
            // StartDate: utl.Formatter.getCurrentDate(),
            AssignTo: 3,
            FacilityId: 0,
            DurationPeriodId: 1,
            DurationPeriod: 'Days'
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            id: 0
        };
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.currentcontext.id = parseInt($stateParams.id);
        //         $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        //         $scope.currentcontext.sectionid = $scope.getCurrentSectionId();

        if ($scope.currentcontext.encounter)
            $scope.currentcontext.aid = $scope.currentcontext.encounter.AppointmentId;
        $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;

        vm.AssignToOptions = [
            { Id: 1, Text: $translate.instant('Doctor') },
            { Id: 2, Text: $translate.instant('registration.patienttracker.group.lbl') },
            { Id: 3, Text: $translate.instant('Department') }
        ]

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.AppointmentId = $scope.currentcontext.aid;
        $scope.item.ConsultationId = $scope.currentcontext.cid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        //Visibility rules starts
        $scope.canShowUser = function() {
            return $scope.item.AssignTo == 1;
        }

        $scope.canShowGroup = function() {
            return $scope.item.AssignTo == 2;
        }
        $scope.canShowDept = function() {
            return $scope.item.AssignTo == 3;
        }
        $scope.canShowRoom = function() {
            return $scope.item.AssignTo == 1 || $scope.item.AssignTo == 2;
        }

        $scope.canShowFacility = function() {
            return $scope.item.AssignTo == 1 || $scope.item.AssignTo == 2;
        }

        $scope.canShowReviewNotes = function() {
                return $scope.item.AssignTo == 1 || $scope.item.AssignTo == 2;
            }
            //Visibility rules ends
        $scope.backToList = function() {
            $state.go('patientemr.consultationtab.consultationcurrentlist', {
                pid: $scope.currentcontext.pid,
                eid: $scope.currentcontext.eid,
                context: $scope.context
            });
        };

        $scope.onGroupChange = function(item) {
            $scope.item.AssignedGroupName = item.Text;
        }

        $scope.onUserChange = function(item) {
            var name = item.FirstName;
            if (item.Title && item.Title.Description) {
                name = item.Title.Description + " " + name;
            }
            if (item.LastName) {
                name += " " + item.LastName;
            }
            $scope.item.AssignedUserName = name;
        }

        $scope.onRoomChange = function(item) {
            $scope.item.AssignedRoomName = item.Text;
        }

        $scope.onDurationPeriodChange = function(item) {
            $scope.item.DurationPeriod = item.Text;
        }

        $scope.getItemCallback = function(scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                var data = res.Data[0];
                $scope.item = data;
                $scope.currentcontext.id = $scope.item.Id;
                if ($scope.item.AssignedUserId > 0) {
                    $scope.item.AssignTo = 1;
                }
                if ($scope.item.AssignedUserDepartmentId > 0) {
                    $scope.item.AssignTo = 3;
                }
                if ($scope.item.AssignedGroupId > 0) {
                    $scope.item.AssignTo = 2;
                }
                // $scope.item.AssignTo = 3;
                // $scope.item.FollowupAppointmentOn = data.FollowupAppointmentOn;
            }
            $scope.getPatientById();
        };
        $scope.getItem = function() {
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id },
                    ]
                };

            }
            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.pid },
                    ]
                };
            }
            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getpatientsCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var Patient = data.Data[0];
                $scope.currentcontext.DoctorName = Patient.Encounters[0].DoctorName;
            }
        };

        $scope.getPatientById = function() {

            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.pid },
                ]
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
                params: { id: 0, ct: '', pid: $scope.currentcontext.pid, appointmentDate: appnmtDate },
                confirmCallback: $scope.confirmCallback
            });
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            var data = options.data ? options.data : null;
            if (data && data.Data) {
                // if (data.Data.AssignTo) {
                //     openAppointmentForm(data.Data.FollowupAppointmentOn);
                // } else
                $scope.getItem();

                // if (data.Data.AssignTo && data.Data.AssignTo == 3 && data.Data.Duration) {
                //     $scope.doctor_dashboard();
                // }
            }
        };
        $scope.Save = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to Refer this Patient?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.saveItem = function() {

            if ($scope.canShowUser()) {
                $scope.item.AssignedGroupId = null;
                $scope.item.AssignedGroupName = null;
            } else if ($scope.canShowGroup()) {
                $scope.item.AssignedUserId = null;
                $scope.item.AssignedUserName = null;
            }

            if ($scope.item.Duration && $scope.item.DurationPeriod) {
                $scope.item.FollowupAppointmentOn = utl.Formatter.computeDateBasedOnPeriod($scope.item.Duration, $scope.item.DurationPeriod);
                console.log($scope.item.FollowupAppointmentOn);
            }

            var actionName = '';
            if ($scope.item.AssignTo == 1 || $scope.item.AssignTo == 2 || $scope.item.AssignTo == 3) {
                actionName = 'appointment/patienttracker/AssignPatient';
            }
            // else if ($scope.item.AssignTo == 3) {
            //     actionName = 'appointment/patienttracker/CheckoutConsultationPatient';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'appointment/patienttracker/UpdatePatientTracker';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                if (key == 'Facility') {
                    $scope.item.FacilityId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility", Default: false },
                { "Key": "Group" },
                { "Key": "Room" },
                { "Key": "DurationPeriod" },
                { "Key": "ReferrerClinicalStatus", Default: false },
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
                    "Key": "Department",
                    Request: {
                        Params: [{
                                Key: 3,
                                Value: 1
                            } // Clinical Dept Only
                        ]
                    }
                }
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
        $scope.getPatientById();
        if ($scope.currentcontext.id > 0) {
            $scope.getItem();
        }
    }


    ReferralFollowupController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();