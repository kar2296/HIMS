(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DocTransferController', DocTransferController);

    function DocTransferController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.DoctorDetails = [];

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        if ($stateParams.docId)
            $scope.currentcontext.docId = $stateParams.docId;

        $scope.addNew = function () {
            var lastidx = $scope.DoctorDetails.length - 1;
            var CanAddNew = $scope.DoctorDetails[lastidx].EndDate != undefined ? true : false;
            if ($scope.Count == $scope.DoctorDetails.length && CanAddNew) {
                var item = {};
                item.Id = 0;
                item.StartDate = utl.Formatter.getCurrentDate();
                item.TransferedById = utl.Session.getCurrentUserId();
                item.IsPrimary = false;
                item.PatientId = $scope.currentcontext.pid;
                $scope.DoctorDetails.push(item);
            }
            else if (!CanAddNew) {
                utl.Alert.showErrorMsg($translate.instant('doctor-transfer.doctortime.lbl'));
            }
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
        $scope.doctor_dashboard = function () {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $scope.getEncounterDoctors = function () {
            if ($scope.currentcontext.eid && $scope.currentcontext.eid > 0) {
                var inputData = {
                    Params: [
                        { Key: 6, Value: $scope.currentcontext.eid }
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    },
                };

                var options = {
                    action: 'Visit/EncounterDoctor/GetTransferEncounterDoctors',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getEncounterDoctorsCallback
                };
                utl.Http.doAction(options);
            }
        };

        function getDetails() {
            var result = [];
            for (var idx in $scope.DoctorDetails) {
                var item = $scope.DoctorDetails[idx];
                if (item.Id == 0)
                    $scope.currentcontext.DoctorId = item.DoctorId;
                if (item.DoctorId > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        $scope.doctorChange = function (item) {
            var selecteddoctor = item.SelectedDoctor;
            item.DepartmentId = selecteddoctor.DepartmentId;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getEncounterDoctors();
        };

        $scope.saveItem = function () {

            var actionName = 'Visit/EncounterDoctor/ManageIPEncounterDoctor';
            var details = getDetails();
            var options = {
                action: actionName,
                data: {
                    Data: {
                        Details: details,
                        EncounterId: $scope.currentcontext.eid,
                        DoctorId: $scope.currentcontext.DoctorId
                    }
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
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
                { "Key": "User" },
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

    DocTransferController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();