(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DrTransferFormController', DrTransferFormController);

    function DrTransferFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext = {
            encounterid: modalConfig.params.eid,
            DoctorId: modalConfig.params.doctorid,
            patientid: modalConfig.params.pid,
            AdmissionStatusId: modalConfig.params.admissionstatusid,
        };
        
        $scope.DoctorDetails = [];

        $scope.addNew = function () {
            var item = {};
            item.Id = 0;
            item.StartDate = utl.Formatter.getCurrentDate();
            item.TransferedById = utl.Session.getCurrentUserId();
            item.IsPrimary = false;
            item.PatientId = $scope.currentcontext.patientid;
            $scope.DoctorDetails.push(item);
        };

        $scope.getEncounterDoctorsCallback = function (scope, res, options, hasError) {
            $scope.DoctorDetails = [];
            $scope.DoctorDetails = res.Data;
            for (var idx in $scope.DoctorDetails) {
                var item = $scope.DoctorDetails[idx];
                item.IsDisabled = item.EndDate != undefined ? true : item.EndDate != null ? true : false;
            }
            $scope.Count = res.Data.length;
        };

        $scope.getEncounterDoctors = function () {
            if ($scope.currentcontext.encounterid && $scope.currentcontext.encounterid > 0) {
                var inputData = {
                    Params: [
                        { Key: 6, Value: $scope.currentcontext.encounterid }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    },
                };

                var options = {
                    action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getEncounterDoctorsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.doctorChange = function (item) {
            var selecteddoctor = item.SelectedDoctor;
            item.DepartmentId = selecteddoctor.DepartmentId;
        }

        function getDetails() {
            var result = [];
            for (var idx in $scope.DoctorDetails) {
                var item = $scope.DoctorDetails[idx];
                if (!item.AppointmentId) {
                    if (item.DoctorId > 0) {
                        item.TransferedById = utl.Session.getCurrentUserId();
                        result.push(item);
                    }
                }
            }
            return result;
        }

        $scope.saveItem = function () {
            var sDrExist = $scope.isAlreadExist();
            if (!sDrExist) {
                if ($scope.currentcontext.encounterid > 0
                    && $scope.currentcontext.DoctorId > 0
                    && $scope.currentcontext.patientid > 0) {
                    var details = getDetails();
                    $scope.confirmCallback({ data: details });
                }
            } else {
                utl.Alert.showErrorMsg(sDrExist + " Already Exist");
            }
        };

        $scope.isAlreadExist = function () {
            var sDrExist = '';
            var DrList = []
            for (var idx in $scope.DoctorDetails) {
                var item = $scope.DoctorDetails[idx];
                if (!DrList[item.DoctorId]) {
                    DrList[item.DoctorId] = [];
                    DrList[item.DoctorId].push(item.DoctorId);
                } else {
                    sDrExist = item.SelectedDoctor.DoctorName;
                }
            }

            return sDrExist;
        }

        //autosearch related code starts for Doctors
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                //{ header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
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
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounterDoctors();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
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

    DrTransferFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();