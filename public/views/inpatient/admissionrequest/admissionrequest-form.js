(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionRequestFormController', admissionRequestFormController);

    function admissionRequestFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.item = {
            IsActive: true,
            RequestDate: utl.Formatter.getCurrentDate(),
            AdvisedDateTime: utl.Formatter.getCurrentDate(),
            PatientId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AdmissionRequestStatusId: 2,
        };
        $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());

        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        // For Displaying Created User - End 
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/admissionrequest/GetAdmissionRequestById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.backToList = function () {
            $state.go('patientemr.admissionrequests');
        }


        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        if ($scope.currentcontext.id === 0) {
            var element = document.getElementById("visibility");
            element.classList.add("hide");
        } else {
            var element = document.getElementById("visibility");
            element.classList.add("show");
        }
        if ($scope.currentcontext.id != 0) {
            var element = document.getElementById("btnSaveApprove");
            element.classList.add("hide");
        } else {
            var element = document.getElementById("btnSaveApprove");
            element.classList.add("show");
        }

        $scope.onCancelConfirmed = function () {
            // $scope.item.AdmissionRequestStatusId = 3;
            $scope.saveItem(3);
        }
        $scope.cancelPopup = function () {
            utl.Dialog.confirmCancel($scope.onCancelConfirmed, $scope.currentcontext.id, $scope.item.RequestIdentifier);
        }


        $scope.validateForm = function () {
            var isValid = true;
            if (!$scope.currentcontext.isnewpatient && (!$scope.item.PatientId || $scope.item.PatientId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('worklists.req-validation-msg.lbl'));
            }
            return isValid;
        }

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            $scope.IsOpPatient = false;
            if (data.Data.length > 0) {
                $scope.Encounters = data.Data[0];
                $scope.item.EncounterId = $scope.Encounters.Id;
                $scope.item.DoctorId = $scope.Encounters.DoctorId;
                $scope.item.DoctorName = $scope.Encounters.DoctorName;
                $scope.item.DepartmentId = $scope.Encounters.DepartmentId;
                $scope.item.ServiceRateCategoryId = $scope.Encounters.ServiceRateCategoryId;
            }
        };

        $scope.getEncounters = function () {

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.item.PatientId
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

        $scope.save = function () {
            // if ($scope.currentcontext.id == 0) { $scope.item.AdmissionRequestStatusId = 1; }
            $scope.saveItem(1);
        };

        $scope.saveAndApprove = function () {
            $scope.item.ActiveStatus = 'Active'
            $scope.item.AdmissionRequestStatusId = 2;
            $scope.saveItem(2);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function (status) {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // if (!$scope.validateForm()) {
            //     return;
            // }
            $scope.item.AdmissionRequestStatusId = status;
            var actionName = 'IPManagement/admissionrequest/AddAdmissionRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/admissionrequest/UpdateAdmissionRequest';
                // if ($scope.item.AdmissionRequestStatusId == 1) {
                //     $scope.item.AdmissionRequestStatusId = 2;
                // }
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
        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'IPManagement/admissionrequest/PrintAdmissionRequest',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
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
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            if (selectedItem.DepartmentId) {
                $scope.item.AdvisedDepartmentId = selectedItem.DepartmentId;
            }
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
                item.AdvisedDepartmentId = item.DepartmentId;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors
        //autosearch related code starts for Diagnosis
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'DiagnosisName',
                field: 'DiagnosisName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Version',
                field: 'Version',
                datatype: 'string',
                headercls: 'td-Version',
                fieldcls: 'td-Version'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-Speciality',
                fieldcls: 'td-Speciality'
            },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {
            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName, selectedItem.Code].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                item.DiagnosisVersion = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getItem();
            $scope.getEncounters();
        }

        $scope.initAllLookup = function () {
            var inputData = [{
                "Key": "AdmissionRequestType",
                Default: false
            },
            {
                "Key": "AdmittingRequestReason",
                Default: false
            },
            {
                "Key": "Department"
            },
            {
                "Key": "YesNo",
                Default: false
            },
            {
                "Key": "Payer",
                Default: false
            },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);

        }

        $scope.initAllLookup();
    }
    admissionRequestFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();