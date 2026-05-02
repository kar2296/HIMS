(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otcnFollowupSectionController', otcnFollowupSectionController);

    function otcnFollowupSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            StartDate: utl.Formatter.getCurrentDate(),
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

        $scope.currentcontext.otregid = $scope.$parent.currentcontext.id;
        $scope.currentcontext.pid = $scope.$parent.currentcontext.pid;
        $scope.currentcontext.eid = $scope.$parent.currentcontext.eid;

        $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        if ($scope.currentcontext.encounter)
            $scope.currentcontext.aid = $scope.currentcontext.encounter.AppointmentId;
        $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;

        vm.AssignToOptions = [
            { Id: 1, Text: $translate.instant('registration.patienttracker.user.lbl') },
            { Id: 2, Text: $translate.instant('registration.patienttracker.group.lbl') },
            { Id: 3, Text: $translate.instant('registration.patienttracker.completevisit.lbl') }
        ]

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.AppointmentId = $scope.currentcontext.aid;
        $scope.item.ConsultationId = $scope.currentcontext.cid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

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
        $scope.backToList = function () {
            $state.go('patientemr.consultations', { pid: $scope.currentcontext.pid });
        }
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
        }

        $scope.onRoomChange = function (item) {
            $scope.item.AssignedRoomName = item.Text;
        }

        $scope.onDurationPeriodChange = function (item) {
            $scope.item.DurationPeriod = item.Text;
        }


        $scope.getItemCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                var data = res.Data[0];
                $scope.item = data;
                $scope.currentcontext.id = $scope.item.Id;
                $scope.item.AssignTo = 3;
                if ($scope.item.FollowupAppointmentOn && $scope.item.FollowupAppointmentOn != '' && $scope.item.CreatedAt && $scope.item.CreatedAt != '') {
                    var CreatedAt = new Date($scope.item.CreatedAt);
                    var FollowupAppointmentOn = new Date($scope.item.FollowupAppointmentOn);
                    if (FollowupAppointmentOn != CreatedAt) {
                        $scope.item.Duration = parseInt(Math.round((FollowupAppointmentOn - CreatedAt) / (1000 * 60 * 60 * 24)));
                    }
                }
            }
            $scope.getPatientById();
        };
        $scope.getItem = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.cid },
                ]
            };

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getpatientsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var Patient = data.Data[0];
                $scope.currentcontext.DoctorName = Patient.Encounters[0].DoctorName;
            }
        };

        $scope.getPatientById = function () {

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
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };
        $scope.Save = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to Checkout this Patient?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.saveItem = function () {

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
            if ($scope.item.AssignTo == 1 || $scope.item.AssignTo == 2) {
                actionName = 'appointment/patienttracker/AssignPatient';
            } else if ($scope.item.AssignTo == 3) {
                actionName = 'appointment/patienttracker/CheckoutPatient';
                if ($scope.item.AssignTo == 3 && $scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'appointment/patienttracker/UpdatePatientTracker';
                }
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        //lookup

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
                { "Key": "Facility", Default: false },
                { "Key": "Group" },
                { "Key": "Room" },
                { "Key": "DurationPeriod" },
                { "Key": "ReferrerClinicalStatus", Default: false },
                { "Key": "User" }
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
        $scope.getItem();
    }


    otcnFollowupSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();