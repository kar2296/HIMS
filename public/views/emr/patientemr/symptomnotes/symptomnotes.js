(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SymptomNotesController', SymptomNotesController);

    function SymptomNotesController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Name: '',
        };
        $scope.item = {};
        $scope.currentcontext = {
            id: 0
        };
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.item.IllnessDurationTypeId = 1;

        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // } else {
        // }

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };


        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item = res.Data[0];
                $scope.currentcontext.id = $scope.item.Id;
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.cid
                    }
                ],
            };

            var options = {
                action: 'emr/PatientClinicalNotes/GetPatientClinicalNotess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.backToList = function () {
            $state.go('patientemr.symptomnoteslist', {
                pid: $scope.currentcontext.pid
            });
        };

        $scope.addcomplaints = function () {
            utl.Modal.open('app.chiefcomplaint', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.addexaminations = function () {
            utl.Modal.open('app.examinationmasterform', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.getComplaintsCallback = function (scope, data, options, hasError) {
            $scope.Comlplaint = data;
            if ($scope.item.ChiefComplaints == null) {
                $scope.item.ChiefComplaints = '';
                $scope.item.ChiefComplaints += $scope.Comlplaint.ChiefComplaint;
            } else if ($scope.item.ChiefComplaints) {
                var complaint = '';
                complaint = $scope.Comlplaint.ChiefComplaint
                $scope.item.ChiefComplaints += ',' + complaint;
            } else if ($scope.item.ChiefComplaints == '') {
                $scope.item.ChiefComplaints += $scope.Comlplaint.ChiefComplaint;
            }
        };
        $scope.getComplaints = function () {
            if ($scope.item.ComplaintId && $scope.item.ComplaintId > 0) {
                var options = {
                    action: 'clinicalmaster/chiefcomplaint/GetChiefComplaintById',
                    data: {
                        Id: $scope.item.ComplaintId
                    },
                    type: 'post',
                    onComplete: $scope.getComplaintsCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getExaminationsCallback = function (scope, data, options, hasError) {
            $scope.Examination = data;
            if ($scope.item.Examinations == null) {
                $scope.item.Examinations = '';
                $scope.item.Examinations += $scope.Examination.Name;
            } else if ($scope.item.Examinations) {
                var examination = '';
                examination = $scope.Examination.Name
                $scope.item.Examinations += ',' + examination;
            } else if ($scope.item.Examinations == '') {
                $scope.item.Examinations += $scope.Examination.Name;
            }
        };
        $scope.getExaminations = function () {
            if ($scope.item.ExaminationId && $scope.item.ExaminationId > 0) {
                var options = {
                    action: 'clinicalmaster/ExaminationMaster/GetExaminationMasterById',
                    data: {
                        Id: $scope.item.ExaminationId
                    },
                    type: 'post',
                    onComplete: $scope.getExaminationsCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            if (!$scope.item.ChiefComplaints) {
                utl.Alert.showErrorMsg($translate.instant('Enter Required Fields'));
                return;
            }
            if (!$scope.item.IllnessTypeId) {
                utl.Alert.showErrorMsg($translate.instant('Select Any IllnessType'));
                return;
            }
            if (!$scope.item.DurationCount || $scope.item.DurationCount == -1) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Duration'));
                return;
            }

            if (!$scope.item.IllnessDurationTypeId || $scope.item.IllnessDurationTypeId == -1) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Period Type'));
                return;
            }

            var actionName = 'emr/PatientClinicalNotes/AddPatientClinicalNotes';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PatientClinicalNotes/UpdatePatientClinicalNotes';
            };

            $scope.item.PatientId = $scope.currentcontext.pid;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            $scope.item.ConsultationId = $scope.currentcontext.cid;

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

        //viewConsultation
        $scope.viewConsultation = function (item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: {
                    cid: item.Id,
                    pid: $scope.currentcontext.pid
                }
            });
        };

        //previousnotes
        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.consultlist = res.Data;
            // consultlist = res.Data;
        };
        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [
                    // { Key: 2, Value: $scope.currentcontext.eid },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };

        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.Consult = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
            //loadSectionData();
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {

                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.currentcontext.cid
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "IllnessType",
                    "Default": false
                },
                {
                    "Key": "ChiefComplaint"
                },
                {
                    "Key": "ExaminationMaster"
                },
                {
                    "Key": "IllnessDurationType"
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
        $scope.getCurrentConsultation();
    }

    SymptomNotesController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();