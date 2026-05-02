(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('physicaldischargeController', physicaldischargeController);

    function physicaldischargeController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            isCompleted: true,
            PatientName: '',
            AdmissionStatusId: 5,
            DischargeDate: utl.Formatter.getCurrentDate(),
            PhysicalDischargeById: utl.Session.getCurrentUserId(),
            PhysicalDischargeDate: utl.Formatter.getCurrentDate()
        };

        $scope.encounter = {};
        $scope.currentcontext = {};
        $scope.feedbackData = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.encounterid = parseInt(modalConfig.params.EncounterId);
            // $scope.Patient = modalConfig.params.Encounter.Patient || {};
            $scope.Patient = modalConfig.params.Encounter;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if (modalConfig && modalConfig.params.type)
            $scope.item.DischargeTypeId = modalConfig.params.type;
        if ($scope.Patient)
            $scope.item.PatientId = $scope.Patient.Id;


        //get patient profile


        $scope.getItemCallback = function (scope, data, options, hasError) {
            // $scope.item = data;
            // $scope.item.ClinicalDischargeDate = utl.Formatter.getCurrentDate();
            if(data.ClinicalDischargeDate) {
                $scope.item.ClinicalDischargeDate = data.ClinicalDischargeDate;
            }
            $scope.item.OutcomeId = 1;
            $scope.item.ClicalDischargeId = 1;
            $scope.item.PeriodId = 1;
            $scope.item.EncounterId = $scope.currentcontext.id;
            $scope.item.PatientId = data.PatientId;
            if (!$scope.item.DoctorId) {
                $scope.item.DoctorId = data.DoctorId;
            }
            if ($scope.item.DoctorId > 0) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
                $scope.item.DepartmentId = doctorObj.DepartmentId;
            }
            $scope.item.Dischargetypeid = data.DischargeTypeId;
            $scope.item.Clicaldischargeid = data.ClicalDischargeId;
            $scope.item.Id = data.Id;
            $scope.item.AdmissionStatusId = $scope.item.AdmissionStatusId + 1;
            $scope.item.isCompleted = true;

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.ClinicalDischargeDate && $scope.item.ClinicalDischargeDate != '') {
                var ClinicalDischargeDate = new Date($scope.item.ClinicalDischargeDate);
                $scope.item.ExpectedDischargeDate = new Date(ClinicalDischargeDate.getFullYear(),
                    ClinicalDischargeDate.getMonth(),
                    ClinicalDischargeDate.getDate() + parseInt($scope.item.ALOS));
            }
        }
        $scope.doctorChange = function (selectedItem) {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
            $scope.item.DoctorName = selectedItem.Text;
        }

        //Emergency contac

        $scope.save = function () {
            $scope.item.AdmissionStatusId = 6;
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'currentinpatient.physicalconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.saveItem();
        };
        $scope.reverse = function () {
            $scope.item = {
                AdmissionStatusId: 4

            };
        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }

        $scope.recordDeathInfo = function () {
            utl.Modal.open('app.patientdeathrecordform', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.OnDeathRecSave
            });
        }

        $scope.OnDeathRecSave = function (itemFromModal) {
            $scope.item.DeathDate = itemFromModal.DeathDate;
        }


        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                $scope.encounter = encounter;
                if (encounter.DischargeTypeId)
                    $scope.item.DischargeTypeId = encounter.DischargeTypeId;

                $scope.item.DoctorId = encounter.DoctorId;
                $scope.getItem();
            }
        };

        $scope.getEncounterById = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.encounterid },
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
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            var status = options.data.Data.AdmissionStatusId;
            if(utl.Session.getMedblazePost() == 1) {
            var options = {
                action: "Visit/Visit/postMedBlaze/",
                data: {
                    Data: {
                        // encounterId: data,
                        feedbackData: $scope.feedbackData
                    }
                },
                type: 'post',
                // onComplete: $scope.saveItemCallback,
                // onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        }
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));

            $scope.confirmCallback(status);
        };


        $scope.saveItem = function () {
            console.log($scope.item);
            console.log($scope.encounter);
            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            var patientName = $scope.encounter.Patient.FirstName;
            if ($scope.encounter.Patient.LastName) patientName += ' ' + $scope.encounter.Patient.LastName;
            $scope.feedbackData = {
                processDefinitionKey: "botomate-process",
                variables: [
                    {
                        name: "status",
                        type: "string",
                        value: "DISCHARGED",
                        scope: "global"
                    },
                    {
                        name: "admitType",
                        type: "string",
                        value: "IP",
                        scope: "global"
                    },
                    {
                        name: "unitId",
                        type: "integer",
                        value: 1,
                        scope: "global"
                    },
                    {
                        name: "oneTimeFeedbackName",
                        type: "string",
                        value: "IP Post Discharge Feedback",
                        scope: "global"
                    },
                    {
                        name: "credit",
                        type: "string",
                        value: "cash",
                        scope: "global"
                    },
                    {
                        name: "departmentName",
                        type: "string",
                        value: $scope.encounter.Department.DepartmentName,
                        scope: "global"
                    },
                    {
                        name: "uhid",
                        type: "string",
                        value: ($scope.encounter.PatientMrn) ? $scope.encounter.PatientMrn : "",
                        scope: "global"
                    },
                    {
                        name: "ipNumber",
                        type: "string",
                        value: $scope.encounter.VisitIdentifier,
                        scope: "global"
                    },
                    {
                        name: "patientName",
                        type: "string",
                        value: patientName,
                        scope: "global"
                    },
                    {
                        name: "email",
                        type: "string",
                        value: ($scope.encounter.Patient.Email) ? $scope.encounter.Patient.Email : "",
                        scope: "global"
                    },
                    {
                        name: "mobileNo",
                        type: "string",
                        value: ($scope.encounter.Patient.Mobile) ? $scope.encounter.Patient.Mobile : "",
                        scope: "global"
                    },
                    {
                        name: "dateOfAdmission",
                        type: "date",
                        value: $scope.encounter.AdmissionDate,
                        scope: "global"
                    },
                    {
                        name: "dateOfDischarge",
                        type: "date",
                        value: new Date(),
                        scope: "global"
                    },
                    {
                        name: "doctor",
                        type: "json",
                        value: [
                            $scope.encounter.DoctorName],
                        scope: "global"
                    },
                    {
                        name: "dateOfBirth",
                        type: "date",
                        value: new Date($scope.encounter.Patient.DOB),
                        scope: "global"
                    },
                    {
                        name: "age",
                        type: "integer",
                        value: $scope.encounter.Patient.Age,
                        scope: "global"
                    },
                    {
                        name: "location",
                        type: "string",
                        value: ($scope.encounter.LocationName)?$scope.encounter.LocationName:"",
                        scope: "global"
                    },
                    {
                        name: "floor",
                        type: "string",
                        value: $scope.encounter.WardRoomMaster.RoomNo,
                        scope: "global"
                    },
                    {
                        name: "bedNo",
                        type: "string",
                        value: $scope.encounter.WardRoomBedMaster.Description,
                        scope: "global"
                    },
                    {
                        name: "gender",
                        type: "string",
                        value: ($scope.encounter.Patient.Gender) ? $scope.encounter.Patient.Gender.Description : "",
                        scope: "global"
                    },
                    {
                        name: "attendantMobileNumber",
                        type: "string",
                        value: ($scope.encounter.Patient.AlternateMobileNum) ? $scope.encounter.Patient.AlternateMobileNum : $scope.encounter.Patient.Mobile,
                        scope: "global"
                    }
                ],
                returnVariables: false
            };
            console.log($scope.feedbackData);
            // return;
            if ($scope.item.DischargeTypeId == 2) {
                if (!$scope.item.DeathDate) {
                    utl.Alert.showErrorMsg($translate.instant('Enter Death Details'));
                    return;
                }
            }
            var actionName = 'ipmanagement/PatientDischargeEvent/AddPatientDischargeEvent';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'ipmanagement/PatientDischargeEvent/UpdatePatientDischargeEvent';
            }
            $scope.item.EncounterId = $scope.currentcontext.encounterid;

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
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounterById();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DischargeType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Department" },
                { "Key": "Outcome" },
                { "Key": "ModeOfTransport" },
                { "Key": "Period" },
                { "Key": "DischargeOrderStatus" },
                { "Key": "ClinicalStatus" },
                { "Key": "InfectionType" },
                { "Key": "AdmissionStatus" },
                { "Key": "PatientAllergyStatus" },
                { "Key": "Encounter" }
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

    physicaldischargeController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();