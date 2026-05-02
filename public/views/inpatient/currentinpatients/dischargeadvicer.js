(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargeadvicerController', dischargeadvicerController);

    function dischargeadvicerController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));


        $scope.item = {
            PatientName: '',
            AdmissionStatusId: 3,
            isCompleted: true,
            DischargeTypeId: 1,
            FitFordischargeById: utl.Session.getCurrentUserId(),
            FitFordischargedate: utl.Formatter.getCurrentDate(),
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);

            $scope.currentcontext.encounterid = parseInt(modalConfig.params.EncounterId);

            $scope.Patient = modalConfig.params.Encounter.Patient;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.item.PatientId = $scope.currentcontext.pid;

        //get patient profile

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.EncounterId = $scope.currentcontext.id;
            $scope.item.isCompleted = true;

        };
        $scope.getItem = function(pageNo) {
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

        //Emergency contac

        $scope.getencountersCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];

                $scope.item.DoctorId = encounter.DoctorId,
                    $scope.item.PatientId = encounter.PatientId


            }
        };

        $scope.getEncounterById = function() {
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

        $scope.save = function() {
            $scope.item.AdmissionStatusId = 3;

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'currentinpatient.fitconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.patientprofiledetails = function() {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }
        $scope.reverse = function() {
            $scope.item = {
                AdmissionStatusId: 3

            };
        }
        $scope.backToList = function() {
            $scope.confirmCallback();
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            //var actionName = 'IPManagement/PatientDischargeEvent/AddPatientDischargeEvent';
            var actionName = 'IPManagement/PatientDischargeEvent/AddPatientDischargeEvent';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/PatientDischargeEvent/UpdatePatientDischargeEvent';
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
        //autosearch related code starts for Doctors
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
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
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Department = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors

        //lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getEncounterById();

        }

        $scope.initLookup = function() {
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
                { "Key": "AllergySeverity" },
                { "Key": "ClinicalStatus" },
                { "Key": "AdmissionStatus" },
                { "Key": "PatientAllergyStatus" }
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

    dischargeadvicerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();