(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('QualitymanagementController', QualitymanagementController);

    function QualitymanagementController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.items = [];
        $scope.LatDiscrgData = [];
        $scope.LatAdmsnData = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.labcriticals = function () {
            $state.go('app.labcriticals');
        };

        $scope.radiologycriticals = function () {
            $state.go('app.radiologycriticals');
        };

        $scope.notify_disease_patients = function () {
            $state.go('app.notifiablediseasesview');
        };

        $scope.ippatientslist = function () {
            $state.go('app.currentinpatients', {
                context: 'qm'
            });
        };

        $scope.ipdischargepatientslist = function () {
            $state.go('app.ipdischargedpatients', {
                context: 'qm'
            });
        };

        $scope.gettodaydischargeCallback = function (scope, data, options, hasError) {
            $scope.DiscrgData = [];
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            $scope.DiscrgData = data.Data;
            for (var idx in $scope.DiscrgData) {
                var Discrg = $scope.DiscrgData[idx];
                Discrg.patientname = '';
                if (Discrg.Patient.Title)
                    Discrg.patientname = Discrg.Patient.Title.Description + ' .';
                if (Discrg.Patient.FirstName)
                    Discrg.patientname += ' ' + Discrg.Patient.FirstName;
                if (Discrg.Patient.LastName)
                    Discrg.patientname += ' ' + Discrg.Patient.LastName;

                Discrg.doctorname = '';
                if (Discrg.Doctor.Title)
                    Discrg.doctorname = Discrg.Doctor.Title.Description + ' .';
                if (Discrg.Doctor.FirstName)
                    Discrg.doctorname += ' ' + Discrg.Doctor.FirstName;
                if (Discrg.Doctor.LastName)
                    Discrg.doctorname += ' ' + Discrg.Doctor.LastName;

                Discrg.warddetails = '';
                if (Discrg.WardMaster)
                    Discrg.warddetails = Discrg.WardMaster.WardName + ' - ';
                if (Discrg.WardRoomMaster)
                    Discrg.warddetails += Discrg.WardRoomMaster.RoomNo;
                if (Discrg.WardRoomBedMaster) + ' - '
                Discrg.warddetails += Discrg.WardRoomBedMaster.BedNo;

                $scope.LatDiscrgData.push(Discrg);
            }
        };
        $scope.gettodaydischarge = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },

                    {
                        Key: 3,
                        Value: 6
                    },

                    {
                        Key: 28,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 29,
                        Value: $scope.currentcontext.ToDate
                    }
                ],
                PageContext: {
                    PageSize: 6,
                    PageNumber: 1
                }

            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettodaydischargeCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getAdmsnListCallback = function (scope, data, options, hasError) {
            $scope.AdmittedData = [];

            $scope.AdmittedData = data.Data;
            for (var idx in $scope.AdmittedData) {
                var admInfo = $scope.AdmittedData[idx];
                admInfo.patientname = '';
                if (admInfo.Patient.Title)
                    admInfo.patientname = admInfo.Patient.Title.Description + ' .';
                if (admInfo.Patient.FirstName)
                    admInfo.patientname += ' ' + admInfo.Patient.FirstName;
                if (admInfo.Patient.LastName)
                    admInfo.patientname += ' ' + admInfo.Patient.LastName;

                admInfo.doctorname = '';
                if (admInfo.Doctor.Title)
                    admInfo.doctorname = admInfo.Doctor.Title.Description + ' .';
                if (admInfo.Doctor.FirstName)
                    admInfo.doctorname += ' ' + admInfo.Doctor.FirstName;
                if (admInfo.Doctor.LastName)
                    admInfo.doctorname += ' ' + admInfo.Doctor.LastName;

                admInfo.warddetails = '';
                if (admInfo.WardMaster)
                    admInfo.warddetails = admInfo.WardMaster.WardName + ' - ';
                if (admInfo.WardRoomMaster)
                    admInfo.warddetails += admInfo.WardRoomMaster.RoomNo + ' - ';
                if (admInfo.WardRoomBedMaster)
                    admInfo.warddetails += admInfo.WardRoomBedMaster.BedNo;

                $scope.LatAdmsnData.push(admInfo);
            }
            // $scope.patientname = $scope.AdmittedData.Patient.Title.Description + ' .' + $scope.AdmittedData.Patient.FirstName + ' ' + $scope.AdmittedData.Patient.MiddleName + ' ' + $scope.AdmittedData.Patient.LastName;
            // $scope.DoctorName = $scope.AdmittedData.Doctor.Title.Description + ' .' + $scope.AdmittedData.Doctor.FirstName + ' ' + $scope.AdmittedData.Doctor.MiddleName + ' ' + $scope.AdmittedData.Doctor.LastName;
        };
        $scope.getAdmsnList = function () {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },

                    {
                        Key: 38,
                        Value: "2, 3, 4, 5"
                    },

                    {
                        Key: 17,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.ToDate
                    }
                ],
                PageContext: {
                    PageSize: 6,
                    PageNumber: 1
                }

            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAdmsnListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getLabcriticalslistCallback = function (scope, res, options, hasError) {
            $scope.LabCriticals = [];
            for (var pdx in res.Data) {
                var labcritics = res.Data[pdx];
                labcritics.PatientName = '';
                if (labcritics.Patient) {
                    labcritics.PatientMrn = labcritics.Patient.MRN;
                    if (labcritics.Patient.Title) {
                        labcritics.PatientName = labcritics.Patient.Title.Description;
                    }
                    if (labcritics.Patient.FirstName) {
                        labcritics.PatientName += ' ' + labcritics.Patient.FirstName;
                    }
                    if (labcritics.Patient.LastName) {
                        labcritics.PatientName += ' ' + labcritics.Patient.LastName;
                    }
                }
                $scope.LabCriticals.push(labcritics);
            }
        };
        $scope.getLabcriticalslist = function () {
            var inputData = {
                Params: [{
                        Key: 11,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.ToDate
                    },
                    {
                        Key: 6,
                        Value: 1
                    },

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'lis/PatientCriticalOrder/GetPatientCriticalOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLabcriticalslistCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getRadcriticalslistCallback = function (scope, res, options, hasError) {
            $scope.RadCriticals = [];
            for (var pdx in res.Data) {
                var radcritics = res.Data[pdx];
                radcritics.PatientName = '';
                if (radcritics.Patient) {
                    radcritics.PatientMrn = radcritics.Patient.MRN;
                    if (radcritics.Patient.Title) {
                        radcritics.PatientName = radcritics.Patient.Title.Description;
                    }
                    if (radcritics.Patient.FirstName) {
                        radcritics.PatientName += ' ' + radcritics.Patient.FirstName;
                    }
                    if (radcritics.Patient.LastName) {
                        radcritics.PatientName += ' ' + radcritics.Patient.LastName;
                    }
                }
                $scope.RadCriticals.push(radcritics);
            }
        };
        $scope.getRadcriticalslist = function () {
            var inputData = {
                Params: [{
                        Key: 11,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.ToDate
                    },
                    {
                        Key: 6,
                        Value: 2
                    },

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'lis/PatientCriticalOrder/GetPatientCriticalOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRadcriticalslistCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getnotifieddiseaselistCallback = function (scope, res, options, hasError) {
            $scope.NotifiableDisease = [];
            for (var pdx in res.Data) {
                var notifieddisease = res.Data[pdx];
                notifieddisease.PatientName = '';
                if (notifieddisease.Patient) {
                    notifieddisease.PatientMrn = notifieddisease.Patient.MRN;
                    if (notifieddisease.Patient.Title) {
                        notifieddisease.PatientName = notifieddisease.Patient.Title.Description;
                    }
                    if (notifieddisease.Patient.FirstName) {
                        notifieddisease.PatientName += ' ' + notifieddisease.Patient.FirstName;
                    }
                    if (notifieddisease.Patient.LastName) {
                        notifieddisease.PatientName += ' ' + notifieddisease.Patient.LastName;
                    }
                }
                $scope.NotifiableDisease.push(notifieddisease);
            }
        };
        $scope.getnotifieddiseaselist = function () {
            var inputData = {
                Params: [{
                        Key: 8,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 9,
                        Value: $scope.currentcontext.ToDate
                    }

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/PatientNotifiableDisease/GetPatientNotifiableDiseases',
                data: inputData,
                type: 'post',
                onComplete: $scope.getnotifieddiseaselistCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getLabcriticalslist();
        $scope.getRadcriticalslist();
        $scope.getAdmsnList();
        $scope.gettodaydischarge();
        $scope.getnotifieddiseaselist();
    }
    QualitymanagementController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();