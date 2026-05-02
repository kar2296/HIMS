(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discharpatientController', discharpatientController);

    function discharpatientController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.item = {
            PatientName: '',
            AdmissionStatusId: 4,
            isCompleted: true,
            DischargeorderstatusId: 2,
            ClicalDischargeById: utl.Session.getCurrentUserId(),
            ClinicalDischargeDate: utl.Formatter.getCurrentDate(),
            IsBillLock: false
        };
        $scope.ShowSave = true;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.encounterid = parseInt(modalConfig.params.EncounterId);
            $scope.Patient = modalConfig.params.Encounter.Patient;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.currentcontext.CanReversebutton = utl.Privilege.hasAccess('CanReversebutton');
        //get patient profile
        console.log('discharge.js');

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.ClinicalDischargeDate = utl.Formatter.getCurrentDate();
            $scope.item.EncounterId = $scope.currentcontext.id;
            $scope.item.DischargeorderstatusId = 2;
            $scope.item.OutcomeId = 1;
            $scope.item.PeriodId = 1;
            if ($scope.item.AdmissionStatusId == 4) {
                $scope.ShowSave = false;
            }
            $scope.item.isCompleted = true;
            $scope.item.AdmissionStatusId = $scope.item.AdmissionStatusId + 1;
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
        };
        $scope.getItem = function () {

            // $scope.getEncounters()
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
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
        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                $scope.item.DoctorId = encounter.DoctorId,
                    $scope.item.PatientId = encounter.PatientId,
                    $scope.item.IsBillLock = encounter.IsBillLock;
            }
        };
        $scope.getEncounterById = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.encounterid
                },]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };
        $scope.doctorChange = function (selectedItem) {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
            $scope.item.DoctorName = selectedItem.Text;
        }
        $scope.save = function () {
            $scope.item.AdmissionStatusId = 4;
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'currentinpatient.clinicalconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.saveItem();
        };
        $scope.Reverse = function () {


            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'currentinpatient.previousconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.reverse,

            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.reverse = function () {
            $scope.item.AdmissionStatusId = 2;
            $scope.saveItem();

        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            $scope.item.ClicalDischargeById = utl.Session.getCurrentUserId();
            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if ($scope.item.AdmissionStatusId == 4 && $scope.item.IsBillLock == false) {
                utl.Alert.showErrorMsg($translate.instant('Please Lock the Bill, before Clinical Discharge'));
                return;
            }
            var actionName = 'IPManagement/PatientDischargeEvent/AddPatientDischargeEvent';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/PatientDischargeEvent/UpdatePatientDischargeEvent';
            }
            $scope.item.EncounterId = $scope.currentcontext.encounterid;

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
                header: 'Department',
                field: 'Department',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
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
                Params: [{
                    Key: 3,
                    Value: 2
                }],
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
                item.Department = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getEncounterById();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "DischargeType"
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
                "Key": "Outcome"
            },
            {
                "Key": "ModeOfTransport"
            },
            {
                "Key": "Period"
            },
            {
                "Key": "DischargeOrderStatus"
            },
            {
                "Key": "ClinicalStatus"
            },
            {
                "Key": "InfectionType"
            },
            {
                "Key": "AdmissionStatus"
            },
            {
                "Key": "Encounter"
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
    }

    discharpatientController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();