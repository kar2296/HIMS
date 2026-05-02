(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtconsultationFormController', discasshtconsultationFormController);

    function discasshtconsultationFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.item.ProfileId = -1;

        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {
            encounter: utl.Session.getPatientEncounter(),
            DoctorId: -1,
            DepartmentId: -1,
            DischargeTypeId: -1,
            AdmissionDate: null,
            DischargeDate: null,
            SurgeryDate: null,
            CreatedBy: '',
            ApprovedBy: '',
        };
        $scope.currentcontext.selecteddept = [];
        var saveCompleted = 0;
        if (modalConfig) {
            if (modalConfig.params.id)
                $scope.currentcontext.id = parseInt(modalConfig.params.id);
            if (modalConfig.params.vid)
                $scope.currentcontext.encounter.VisitTypeId = modalConfig.params.vid;
            if (modalConfig.params.prfid)
                $scope.currentcontext.prfid = modalConfig.params.prfid;
            if (modalConfig.params.date)
                $scope.currentcontext.date = modalConfig.params.date;

            $scope.currentcontext.CreatedBy = '';
            $scope.currentcontext.ApprovedBy = '';

            if (modalConfig.params.selecteditem) {
                var item = modalConfig.params.selecteditem;
                if (item.CreatedUser && item.CreatedUser.Title &&
                    item.CreatedUser.Title.Description)
                    $scope.currentcontext.CreatedBy += item.CreatedUser.Title.Description;
                if (item.CreatedUser && item.CreatedUser.FirstName)
                    $scope.currentcontext.CreatedBy += ' ' + item.CreatedUser.FirstName;
                if (item.CreatedUser && item.CreatedUser.LastName)
                    $scope.currentcontext.CreatedBy += ' ' + item.CreatedUser.LastName;
            }
            if (modalConfig.params.selecteditem) {
                var item = modalConfig.params.selecteditem;
                if (item.ApprovedUser && item.ApprovedUser.Title &&
                    item.ApprovedUser.Title.Description)
                    $scope.currentcontext.ApprovedBy += item.ApprovedUser.Title.Description;
                if (item.ApprovedUser && item.ApprovedUser.FirstName)
                    $scope.currentcontext.ApprovedBy += ' ' + item.ApprovedUser.FirstName;
                if (item.ApprovedUser && item.ApprovedUser.LastName)
                    $scope.currentcontext.ApprovedBy += ' ' + item.ApprovedUser.LastName;
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        var encounter = $scope.currentcontext.encounter;
        if (encounter.EncounterTypeId == 2) {
            if ($scope.currentcontext.encounter.AdmittingReason) {
                $scope.currentcontext.ReasonForVisit = $scope.currentcontext.encounter.AdmittingReason.Description;
            }
        }
        $scope.currentcontext.ReferredBy = $scope.currentcontext.encounter.ReferralName;

        $scope.item = {
            ConsultationDate: utl.Formatter.getCurrentDate(),
            //PatientId: parseInt(utl.Session.getEMRPatientId()),
            PatientId: encounter.PatientId,
            EncounterId: encounter.Id,
            EncounterDoctorId: encounter.DoctorId,
            ProgressNoteStatusId: 1,
            VisitTypeId: $scope.currentcontext.encounter.VisitTypeId
        };
        $scope.getencountersCallback = function(scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                $scope.Encounters = res.Data[0];

                if (res.Data.length == 1) {
                    $scope.item.VisitTypeId = 1
                } else if (res.Data.length > 1) {
                    $scope.item.VisitTypeId = 2
                }
                $scope.currentcontext.DoctorId = $scope.Encounters.DoctorId;
                $scope.currentcontext.DepartmentId = $scope.Encounters.DepartmentId;
                $scope.currentcontext.DischargeTypeId = $scope.Encounters.DischargeTypeId;
                $scope.currentcontext.AdmissionDate = $scope.Encounters.AdmissionDate;
                $scope.currentcontext.DischargeDate = $scope.Encounters.DischargeDate;
                $scope.currentcontext.SurgeryDate = $scope.Encounters.SurgeryDate;
                $scope.doctorChange();
            } else {
                $scope.getEncounterswithoutLatest();
            }

        };

        $scope.getCurrentConsultationCallback = function(scope, data, options, hasError) {
            $scope.item.ProfileId = data.ProfileId;
            $scope.currentcontext.DischargeTypeId = data.DischargeTypeId;
            $scope.currentcontext.AdmissionDate = data.AdmissionDate;
            $scope.currentcontext.DischargeDate = data.DischargeDate;
            $scope.currentcontext.SurgeryDate = data.SurgeryDate;
        };

        $scope.getCurrentConsultation = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getencounterswithoutLatestCallback = function(scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0)
                $scope.Encounters = res.Data[0];

            if (res.Data.length == 1) {
                $scope.item.VisitTypeId = 1
            } else if (res.Data.length > 1) {
                $scope.item.VisitTypeId = 2
            }
            $scope.currentcontext.DoctorId = $scope.Encounters.DoctorId;
            $scope.currentcontext.DepartmentId = $scope.Encounters.DepartmentId;
            $scope.currentcontext.DischargeTypeId = $scope.Encounters.DischargeTypeId;
            $scope.currentcontext.AdmissionDate = $scope.Encounters.AdmissionDate;
            $scope.currentcontext.DischargeDate = $scope.Encounters.DischargeDate;
            $scope.currentcontext.SurgeryDate = $scope.Encounters.SurgeryDate;
            $scope.doctorChange();
        };

        $scope.getEncounterswithoutLatest = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 15,
                        Value: 2 //EncounterTypeId
                    },
                    {
                        Key: 75,
                        Value: true
                    }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencounterswithoutLatestCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getCurrentConsultation = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getEncounters = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 15,
                        Value: 2
                    },
                    {
                        Key: 52,
                        Value: true
                    },
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };

        if ($scope.currentcontext.prfid)
            $scope.item.ProfileId = $scope.currentcontext.prfid;

        if ($scope.currentcontext.date)
            $scope.item.ConsultationDate = $scope.currentcontext.date;

        $scope.backToList = function() {
            $scope.cancelCallback();
        };

        $scope.doctorChange = function() {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.currentcontext.DoctorId);
            for (var idx in $scope.lookup.Department) {
                if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                    if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                    }
                }
            }
            if ($scope.currentcontext.selecteddept.length > 0)
                $scope.currentcontext.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
        };
        $scope.onDoctorSelected = function(data) {
            $scope.currentcontext.selecteddept = [];
            $scope.doctorChange();
            console.log(data);
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
            iteminfo: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
                $scope.item.Doctor = result;
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
                $scope.item.Doctor = result;
            }
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
                        Key: 5,
                        Value: 2
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

                item.DoctorName = '';
                if (item.Title.Description)
                    item.DoctorName += item.Title.Description;
                if (item.FirstName)
                    item.DoctorName += ' ' + item.FirstName;
                if (item.LastName)
                    item.DoctorName += ' ' + item.LastName;

                item.Qualification = item.Qualification;
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }
        //autosearch related code ends for Doctors

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == 'number') {
                $scope.currentcontext.id = data
            } else {
                $scope.currentcontext.id = options.data.Data.Id;
            }
            $scope.openConsultation($scope.currentcontext.id);
            $scope.confirmCallback();
        };

        $scope.profileChanged = function() {
            var profileObj = utl.Lookup.getObject($scope.lookup.Profile, $scope.item.ProfileId);
            $scope.item.Name = profileObj.Text;
        }

        $scope.openConsultation = function(consultationId) {
            $state.go('patientemr.dischargecasesheet', {
                id: consultationId
            });
        }

        $scope.saveItem = function() {
            if (saveCompleted == 1) return;
            saveCompleted = 1;
            if (!utl.Validator.validate($scope)) {
                return;
            }


            if (!$scope.item.EncounterDoctorId && $scope.currentcontext.DoctorId)
                $scope.item.EncounterDoctorId = $scope.currentcontext.DoctorId;

            if (!$scope.item.DepartmentId && $scope.currentcontext.DepartmentId)
                $scope.item.DepartmentId = $scope.currentcontext.DepartmentId;

            if (!$scope.item.DischargeTypeId && $scope.currentcontext.DischargeTypeId)
                $scope.item.DischargeTypeId = $scope.currentcontext.DischargeTypeId;

            if (!$scope.item.AdmissionDate && $scope.currentcontext.AdmissionDate)
                $scope.item.AdmissionDate = $scope.currentcontext.AdmissionDate;

            if (!$scope.item.DischargeDate && $scope.currentcontext.DischargeDate)
                $scope.item.DischargeDate = $scope.currentcontext.DischargeDate;

            if (!$scope.item.SurgeryDate && $scope.currentcontext.SurgeryDate)
                $scope.item.SurgeryDate = $scope.currentcontext.SurgeryDate;

            if ($scope.currentcontext.id)
                $scope.item.Id = $scope.currentcontext.id;

            var actionName = 'emr/consultation/AddConsultation';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/consultation/UpdateConsultation';
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if (parseInt($scope.currentcontext.id) > 0) {
                $scope.getCurrentConsultation();
            } else {
                $scope.getEncounters();
            }

        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Profile",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: 2
                        }]
                    }
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
                {
                    "Key": "Department"
                },
                {
                    "Key": "DischargeType"
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
    }

    discasshtconsultationFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();