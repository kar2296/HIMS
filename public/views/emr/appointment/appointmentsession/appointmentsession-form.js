(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentSessionFormController', appointmentSessionFormController);

    function appointmentSessionFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            IsActive: true,
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);

        if (!$scope.currentcontext.id && $scope.$parent.currentcontext.id)
            $scope.currentcontext.id = $scope.$parent.currentcontext.id;

        $scope.item.StartDate = new Date();


        $scope.reloadpages = function () {
            $scope.clear();
        };

        //Defaulting
        function setDefaults() {
            if ($scope.currentcontext.id == 0) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
                $scope.item.IsAll = true;
                $scope.allChkChanged();
            }
        }

        $scope.allChkChanged = function () {
            if ($scope.item.IsAll == true) {
                $scope.item.IsMonday = true;
                $scope.item.IsTuesday = true;
                $scope.item.IsWednesday = true;
                $scope.item.IsThursday = true;
                $scope.item.IsFriday = true;
                $scope.item.IsSaturday = true;
                $scope.item.IsSunday = true;
            } else {
                $scope.item.IsMonday = false;
                $scope.item.IsTuesday = false;
                $scope.item.IsWednesday = false;
                $scope.item.IsThursday = false;
                $scope.item.IsFriday = false;
                $scope.item.IsSaturday = false;
                $scope.item.IsSunday = false;
            }
        }

        //Visibility rules starts
        $scope.canShowPhysicianArea = function () {
            var result = false;
            if ($scope.item && $scope.item.AppointmentSessionTypeId == 1) {
                result = true;
            }
            return result;
        }

        $scope.canShowResourceArea = function () {
            var result = false;
            if ($scope.item && $scope.item.AppointmentSessionTypeId == 2) {
                result = true;
            }
            return result;
        }
        //Visibility rules ends

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.StartDate = $scope.item.StartDate;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'appointment/AppointmentSession/GetAppointmentSessionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.departmentChangeCallback = function (scope, data, options, hasError) {
        }
        $scope.departmentChange = function () {
            var inputData = [];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.departmentChangeCallback
            };
            utl.Http.doAction(options);
        }

        $scope.doctorChange = function () {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.SpecialityId = doctorObj.SpecialityId;
            //setAssignToDetails();
            //$scope.getList();
        }

        $scope.backToList = function () {
            $state.go('app.appointmentsessions');
        }
        $scope.addNew = function () {
            $scope.item_form.$resetForm(true);
            $scope.item = {
                StartDate: new Date(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                IsAll: true,
                IsMonday: true,
                IsTuesday: true,
                IsWednesday: true,
                IsThursday: true,
                IsFriday: true,
                IsSaturday: true,
                IsSunday: true,
                IsActive: true
            };

        };
        $scope.saveAndApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == 'number') {
                $scope.currentcontext.id = data;
                $scope.$parent.currentcontext.id = data;
                $scope.$parent.currentcontext.selecteddocid = $scope.item.DoctorId;
            }
            $scope.getItem();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (utl.Formatter.getDateString($scope.item.StartDate) != utl.Formatter.getDateString($scope.currentcontext.StartDate)
                && utl.Formatter.isPastDate($scope.item.StartDate)) {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointmentsession-form.start-cant-past-msg.lbl'));
                return;
            }

            if ((!$scope.item.DoctorId || $scope.item.DoctorId == -1) && (!$scope.item.ResourceId || $scope.item.ResourceId == -1)) {
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                return;
            }

            if (!$scope.item.SessionTypeId || !$scope.item.StartDate || !$scope.item.EndDate ||
                (!$scope.item.AppointmentSlotTypeId && $scope.item.AppointmentSlotTypeId <= 0) ||
                !$scope.item.StartTime || !$scope.item.EndTime ||
                !$scope.item.SlotDuration ) {
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                return;
            }


            if ($scope.item.AppointmentSessionTypeId == 1) {
                $scope.item.ResourceId = -1;
            } else if ($scope.item.AppointmentSessionTypeId == 2) {
                $scope.item.DoctorId = -1;
            }

            var actionName = 'appointment/AppointmentSession/AddAppointmentSession';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'appointment/AppointmentSession/UpdateAppointmentSession';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getItem();
        }
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
            // api: 'SystemSettings/User/GetUserswithAppointments',
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
                    { Key: 3, Value: 2 },
                    // {
                    //     Key: 2,
                    //     Value: utl.Session.getCurrentFacilityId()
                    // },
                    {
                        Key: 31,
                        Value: true
                    }
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

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AppointmentSessionType" },
                { "Key": "SessionType" },
                { "Key": "Facility" },
                { "Key": "Clinic" },
                { "Key": "Speciality" },
                // { "Key": "Doctor" },
                { "Key": "Resource" },
                { "Key": "AppointmentSlotType" },
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

    appointmentSessionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();