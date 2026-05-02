(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('sickleaveformController', sickleaveformController);

    function sickleaveformController($scope, $stateParams, $state, $translate, utl, $filter) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;
        $scope.context = 'emr';

        $scope.item = {
            IssueDate: utl.Formatter.getCurrentDate(),
            ValidFrom: utl.Formatter.getCurrentDate(),
            ValidTo: utl.Formatter.getCurrentDate(),
            FormTypeId: 1,
            LeaveDayTypeId: 1
        };
        $scope.dateenable = true;
        $scope.currentcontext = {};
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;

        }
        if ($stateParams.pid) {

            $scope.item.PatientId = $stateParams.pid;
        } else {
            $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());
        }
        if ($scope.context == 'emr') {
            $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            // $scope.item.PatientId = $scope.currentcontext.encounter.Id;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
        }
        $scope.currentcontext.pid = $scope.item.PatientId;
        $scope.currentcontext.FormTypeId = 1;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.getLatestEncounterDetails();
            //$scope.applyVisibilityRules();
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'ipmanagement/PatientSickLeaveForm/GetPatientSickLeaveFormById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                //$scope.applyVisibilityRules();
            }
        };
        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            $scope.$parent.Encounter = $scope.Encounter;
            if ($scope.Encounter.IsBillLock == true) {
                utl.Alert.showErrorMsg($translate.instant('Bill Has Been Locked'));
                $scope.item.PatientId = null;
                // $scope.clear();
            }
        }

        $scope.getEncounters = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.item.PatientId
                }]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.$parent.selectedPatient = data;
            $scope.getEncounters();
        }
        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.canShowPatientBanner = function () {
            if (this.item.PatientId > 0) {
                return true;
            }
            return false;
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'ipmanagement/PatientSickLeaveForm/PrintPatientSickLeaveForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printSickLeaveForm = function (PatientSickLeaveFormId) {
            var inputData = {
                Id: PatientSickLeaveFormId
            };
            var options = {
                action: 'ipmanagement/PatientSickLeaveForm/PrintPatientSickLeaveForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printMedicalLeaveForm = function (PatientId, EncounterId) {
            var inputData = {
                Data: {
                    PatientId: PatientId,
                    EncounterId: EncounterId
                }

            };
            var options = {
                action: 'Registration/Patient/PrintPatientMedicalLeaveForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printMedicalRecord = function (PatientId, EncounterId) {
            var inputData = {
                Data: {
                    PatientId: PatientId,
                    EncounterId: EncounterId
                }

            };
            var options = {
                action: 'Registration/Patient/PrintPatientMedicalRecord',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.backToList = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.getPatientSickLeaveFormByIdCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.id = data.Id;
            $scope.getPatientDiagnosis();
            $scope.getPatientChiefComplaints();
        };
        $scope.getPatientSickLeaveFormById = function (PatientSickLeaveFormId) {
            if (PatientSickLeaveFormId && PatientSickLeaveFormId > 0) {
                var options = {
                    action: 'ipmanagement/PatientSickLeaveForm/GetPatientSickLeaveFormById',
                    data: {
                        Id: PatientSickLeaveFormId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientSickLeaveFormByIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientSickLeaveFormCallBack = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item = res.Data[0];
                $scope.currentcontext.id = res.Data[0].Id;
                $scope.item.Id = res.Data[0].Id;
                $scope.getPatientDiagnosis();
                $scope.getPatientChiefComplaints();
            }
        };

        $scope.getPatientSickLeaveForm = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.PatientId
                },
                {
                    Key: 3,
                    Value: 1
                }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'ipmanagement/PatientSickLeaveForm/GetPatientSickLeaveForm',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientSickLeaveFormCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientSickLeaveFormDetailsCallBack = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.PatientSickLeaveFormDetails = res.Data;
            }
        };

        $scope.getPatientSickLeaveFormDetails = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.PatientId
                },
                {
                    Key: 3,
                    Value: 1
                }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'ipmanagement/PatientSickLeaveForm/GetPatientSickLeaveForm',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientSickLeaveFormDetailsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientChiefComplaintsCallBack = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.ChiefComplaints = res.Data[0].ChiefComplaints;
            }
        };

        $scope.getPatientChiefComplaints = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.PatientId
                },
                {
                    Key: 2,
                    Value: $scope.item.EncounterId
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/PatientClinicalNotes/GetPatientClinicalNotess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientChiefComplaintsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientDiagnosisCallBack = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                /*
                                $scope.PatientDiagnosisDetails = res.Data;
                                var DiagnosisWithCode = '';
                                for (var idx in res.Data) {
                                    DiagnosisWithCode = DiagnosisWithCode + 'Code = ' + res.Data[idx].Code + ' Name = ' + res.Data[idx].DiagnosisName + ' , ';
                                }
                                $scope.item.Diagnosis = DiagnosisWithCode;
                 */
                $scope.item.Diagnosis = res.Data[0].DiagnosisName;
            }
        };

        $scope.getPatientDiagnosis = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.PatientId
                },
                {
                    Key: 5,
                    Value: $scope.item.EncounterId
                },
                {
                    Key: 7,
                    Value: false
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientDiagnosisCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getttDaysCount = function () {
            var oneDay = 24 * 60 * 60 * 1000;
            var firstDate = new Date($scope.item.ValidFrom);
            var secondDate = new Date($scope.item.ValidTo);
            var time = secondDate.getTime() - firstDate.getTime();
            var days = time / oneDay;
            $scope.item.DaysCount = days + 1;
        };
        $scope.getDaysCount = function () {
            var oneDay = 24 * 60 * 60 * 1000;
            var firstDate = new Date($scope.item.ValidFrom);
            var secondDate = new Date($scope.item.ValidTo);
            var time = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
            // var days = time / oneDay;
            $scope.item.DaysCount = time + 1;
        };

        $scope.changeDate = function (selectedItem) {
            if (selectedItem.Id == 3) {
                $scope.dateenable = false;
            } else {
                $scope.dateenable = true;
            }
            $scope.currentcontext.LeaveDayTypeId = selectedItem.Id;
            if ($scope.currentcontext.LeaveDayTypeId == 2) {
                var TomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                $scope.currentcontext.ValidFrom = TomorrowDate;
                $scope.currentcontext.ValidTo = TomorrowDate;
                $scope.item.ValidFrom = TomorrowDate;
                $scope.item.ValidTo = TomorrowDate;
            } else if ($scope.currentcontext.LeaveDayTypeId == 1) {
                var CurrentDate = new Date();
                $scope.currentcontext.ValidFrom = CurrentDate;
                $scope.currentcontext.ValidTo = CurrentDate;
                $scope.item.ValidFrom = CurrentDate;
                $scope.item.ValidTo = CurrentDate;
            } else if ($scope.currentcontext.LeaveDayTypeId == 3) {
                var selectdatefrom = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                var selectdateto = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                selectdatefrom = $scope.item.ValidFrom;
                selectdateto = $scope.item.ValidTo;
                $scope.currentcontext.ValidFrom = selectdatefrom;
                $scope.currentcontext.ValidTo = selectdateto;
                $scope.item.ValidFrom = selectdatefrom;
                $scope.item.ValidTo = selectdateto;
            } else {
                var CurrentDate = new Date();
                $scope.currentcontext.ValidFrom = CurrentDate;
                $scope.currentcontext.ValidTo = CurrentDate;
                $scope.item.ValidFrom = CurrentDate;
                $scope.item.ValidTo = CurrentDate;
            }
            $scope.getttDaysCount();
        };

        $scope.getLatestEncounterDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.LatestEncounterDetails = data.Data[0];
                $scope.item.EncounterId = data.Data[0].Id;
                $scope.item.DoctorId = data.Data[0].DoctorId;
                $scope.getPatientDiagnosis();
                $scope.getPatientChiefComplaints();
            }
        };

        $scope.getLatestEncounterDetails = function () {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 49,
                        Value: 1
                    }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getLatestEncounterDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //$scope.getItem();
            $scope.getPatientSickLeaveFormDetails();
            $scope.getPatientSickLeaveForm();
        };
        $scope.saveItem = function () {
            var actionName = 'ipmanagement/PatientSickLeaveForm/AddPatientSickLeaveForm';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'ipmanagement/PatientSickLeaveForm/UpdatePatientSickLeaveForm';
            }
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

        $scope.clear = function () {
            $scope.item = {};
            $state.reload();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getLatestEncounterDetails();
            $scope.getDaysCount();
            $scope.getPatientSickLeaveFormDetails();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "LeaveDayType"
            }, {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },]
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
    sickleaveformController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();