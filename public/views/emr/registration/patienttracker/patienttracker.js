(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientTrackerController', patientTrackerController);

    function patientTrackerController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            StartDate: utl.Formatter.getCurrentDate(),
            AssignTo: 3,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DurationPeriodId: 1,
            DurationPeriod: 'Days',
            isTracker: 0,
            PatientTrackerId: 0
        };
        $scope.lookup = {};
        $scope.from = 0;

        $scope.currentcontext = {
            id: -1,
            DoctorName: ''
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid, 10) || 0;
            var aid = parseInt(modalConfig.params.aid, 10);
            $scope.currentcontext.aid = (!isNaN(aid) && aid > 0) ? aid : null;
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid, 10) || 0;
            $scope.currentcontext.edid = parseInt(modalConfig.params.edid, 10) || 0;
            $scope.context = modalConfig.params.context;
            if (modalConfig.params.tracker && modalConfig.params.tracker != '') {
                console.log(modalConfig.params.tracker);
                if (modalConfig.params.tracker.FollowupAppointmentOn) {
                    $scope.item.IsTracker = 1;
                    $scope.item.TrackerNotes = modalConfig.params.tracker.TrackerNotes;
                    $scope.item.FollowupAppointmentOn = modalConfig.params.tracker.FollowupAppointmentOn;
                    $scope.item.PatientTrackerId = modalConfig.params.tracker.PatientTrackerId;
                    $scope.from = 1;
                }
            }

            if (modalConfig.params.assignto)
                $scope.item.AssignTo = modalConfig.params.assignto;
            if (modalConfig.params.did)
                $scope.item.DoctorId = parseInt(modalConfig.params.did, 10) || null;

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

        if (modalConfig.params.from == 'doctordashboard') {
            vm.AssignToOptions.splice(2, 1);
        }

        if (modalConfig.params.from == 'followuptracker') {
            vm.AssignToOptions.splice(1, 2);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.AppointmentId = $scope.currentcontext.aid || null;
        $scope.item.EncounterId = $scope.currentcontext.eid || null;

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
            if (data && data.Data && data.Data.length > 0) {
                var Patient = data.Data[0];
                if (Patient.Encounters && Patient.Encounters.length > 0) {
                    var enc = Patient.Encounters[0];
                    $scope.currentcontext.DoctorName = enc.DoctorName;
                    if (!$scope.item.DoctorId && enc.DoctorId) {
                        $scope.item.DoctorId = enc.DoctorId;
                    }
                    if (enc.EncounterDoctors && enc.EncounterDoctors.length > 0) {
                        var encDoc = enc.EncounterDoctors[0];
                        $scope.currentcontext.DoctorId = encDoc.DoctorId;
                        $scope.currentcontext.DepartmentId = encDoc.DepartmentId;
                        $scope.item.DoctorId = $scope.item.DoctorId || encDoc.DoctorId;
                        $scope.item.DepartmentId = $scope.item.DepartmentId || encDoc.DepartmentId;
                    }
                }
            }
        };

        $scope.getPatientById = function () {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                }, ]
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
            if (hasError) return;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

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
            if ($scope.currentcontext.eid) {
                $scope.item.EncounterId = $scope.currentcontext.eid;
            }
            if (parseInt($scope.currentcontext.edid) > 0) {
                $scope.item.DoctorId = $scope.currentcontext.edid; //EncounterDoctor
            }
            actionName = 'appointment/patienttracker/AssignPatient';
            if ($scope.item.AssignTo == 1 || $scope.item.AssignTo == 2) {
                actionName = 'appointment/patienttracker/AssignPatient';
            } else if ($scope.item.AssignTo == 4) {
                actionName = 'appointment/patienttracker/CheckoutPatient';
            } else if ($scope.item.AssignTo == 3) {
                actionName = 'appointment/patienttracker/CheckoutConsultationPatient';
            }

            if (modalConfig.params.from == 'followuptracker') {
                actionName = 'appointment/patienttracker/AssignPatient';
                $scope.from = 1;
            }
            // console.log($scope.item);
            // return;

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        //autosearch related code starts for Doctors
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            // api: 'SystemSettings/User/GetUsers',
            api: 'SystemSettings/User/GetMinUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            if (selectedItem.Department) {
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.DepartmentName = selectedItem.Department.DepartmentName;
            }

            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 33,
                        Value: utl.Session.getCurrentFacilityId()
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department) {
                    item.Speciality = item.Department.DepartmentName;
                }

            }
        }
        //autosearch related code ends for Doctors
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
                // {
                //     "Key": "Group"
                // },
                // {
                //     "Key": "Room"
                // },
                {
                    "Key": "DurationPeriod"
                },
                // {
                //     "Key": "Doctor"
                // }
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

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to PatientTrackerScreen.tsx). All
        // API calls/business logic above are 100% untouched; this only
        // keeps $scope.reactProps in sync (by wrapping the existing
        // callbacks) and dispatches UI events from the React component back
        // into the real, unchanged $scope functions. See
        // PatientTrackerScreen.tsx's header comment for every real
        // bug/dead-code path disclosed during this migration (none of it is
        // fixed here).
        // ---------------------------------------------------------------
        $scope.reactProps = {
            item: $scope.item,
            lookup: $scope.lookup,
            assignToOptions: vm.AssignToOptions,
            from: $scope.from
        };

        var origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            origLookupCallback(scope, data, options, hasError);
            $scope.reactProps.lookup = $scope.lookup;
            $scope.reactProps.item = $scope.item;
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'itemFieldChange':
                    $scope.item[payload.field] = payload.value;
                    break;
                case 'assignToChange':
                    $scope.item.AssignTo = payload.value;
                    break;
                case 'userChange':
                    $scope.item.AssignedUserId = payload.userId;
                    $scope.item.AssignedUserName = payload.userName;
                    $scope.item.DoctorId = payload.doctorId || payload.userId;
                    if (payload.departmentId) $scope.item.DepartmentId = payload.departmentId;
                    break;
                case 'groupChange':
                    $scope.item.AssignedGroupId = payload.value;
                    var groupItem = utl.Lookup.getObject($scope.lookup.Group, payload.value);
                    if (groupItem) {
                        $scope.onGroupChange(groupItem);
                    }
                    break;
                case 'durationPeriodChange':
                    $scope.item.DurationPeriodId = payload.value;
                    var periodItem = utl.Lookup.getObject($scope.lookup.DurationPeriod, payload.value);
                    if (periodItem) {
                        $scope.onDurationPeriodChange(periodItem);
                    }
                    break;
                case 'followupDateChange':
                    $scope.item.FollowupAppointmentOn = payload.value ? new Date(payload.value) : null;
                    break;
                case 'saveItem':
                    if (payload && payload.item) {
                        angular.extend($scope.item, payload.item);
                    }
                    $scope.saveItem();
                    break;
                case 'cancel':
                    $scope.cancelCallback();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };
    }



    patientTrackerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();