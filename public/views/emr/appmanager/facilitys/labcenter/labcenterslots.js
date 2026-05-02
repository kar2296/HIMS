(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCenterSlotsController', LabCenterSlotsController);

    function LabCenterSlotsController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, modalConfig, $timeout) {
        var vm = this;

        $scope.item = {
            IsActive: true,
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.aid);
        $scope.currentcontext.facid = parseInt($stateParams.facid);
        $scope.item.FacilityId = $scope.currentcontext.facid;

        $scope.currentfilter = {
            AppointmentSessionTypeId: 3,
            ActiveStatusId: 2
        };

        $scope.currentcontext.OldAppointmentData = {};

        $scope.currentcontext.OldAppointmentDates = [];



        $scope.currentcontext.newform = 0;

        $scope.item.StartDate = new Date();

        $scope.reloadpages = function() {
            $scope.clear();
        };

        $scope.CalculateOldAppointmentDates = function() {
            $scope.currentcontext.OldAppointmentDates = [];
            for (var idx in $scope.currentcontext.OldAppointmentData) {
                var item = $scope.currentcontext.OldAppointmentData[idx];
                try {
                    if (typeof(item.StartTime) == "string") {
                        item.StartTime = new Date("1982-08-30 " + item.StartTime);
                        item.EndTime = new Date("1982-08-30 " + item.EndTime);
                    }
                    if (typeof(item.StartDate) == "string") {
                        item.StartDate = new Date(item.StartDate);
                        item.EndDate = new Date(item.EndDate);
                    }
                    var newStarDt = null;
                    var newEndDt = null;
                    item.StartDate.setHours(item.StartTime.getHours(), item.StartTime.getMinutes(), item.StartTime.getSeconds());
                    item.EndDate.setHours(item.EndTime.getHours(), item.EndTime.getMinutes(), item.EndTime.getSeconds());
                    $scope.AddOldAppointmentDates(item.StartDate);
                    while (item.StartDate <= item.EndDate) {
                        item.StartDate.setHours(item.EndTime.getHours(), item.EndTime.getMinutes(), item.EndTime.getSeconds());
                        newEndDt = item.StartDate;
                        $scope.AddOldAppointmentDates(newStarDt, newEndDt);
                        item.StartDate.setDate(item.StartDate.getDate() + 1);
                    }
                } catch (e) { console.log(e); }
            }
            console.log($scope.currentcontext.OldAppointmentDates);
        };

        $scope.AddOldAppointmentDates = function(strdate) {
            var PatientBillDetail = { strdt: strdate };
            $scope.currentcontext.OldAppointmentDates.push(PatientBillDetail);
        }

        $scope.getOldAppointmentListCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.OldAppointmentData = res.Data;
            $scope.CalculateOldAppointmentDates();
            setDefaults();
            if ($scope.currentcontext.newform == 1) {
                $scope.getParentItem();
            } else {
                $scope.getItem();
            }
        };

        $scope.getOldAppointmentList = function() {
            if ($scope.currentfilter.DoctorId &&
                $scope.currentfilter.DoctorId > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentfilter.FacilityId },
                        { Key: 3, Value: $scope.currentfilter.AppointmentSessionTypeId },
                        { Key: 5, Value: $scope.currentfilter.DoctorId },
                        { Key: 7, Value: $scope.currentfilter.SpecialityId },
                        { Key: 8, Value: $scope.currentfilter.ActiveStatusId }
                    ],
                    PageContext: {
                        PageSize: 10000000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getOldAppointmentListCallback
                };
                utl.Http.doAction(options);
            } else {
                setDefaults();
                if ($scope.currentcontext.newform == 1) {
                    $scope.getParentItem();
                } else {
                    $scope.getItem();
                }
            }
        };

        //Defaulting
        function setDefaults() {
            if ($scope.currentcontext.id == 0) {
                $scope.item.FacilityId = $scope.currentcontext.FacilityId;
                $scope.item.IsAll = true;
                $scope.allChkChanged();
            }
        }

        $scope.allChkChanged = function() {
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
        $scope.canShowPhysicianArea = function() {
            var result = false;
            if ($scope.item && $scope.item.AppointmentSessionTypeId == 1) {
                result = true;
            }
            return result;
        }

        $scope.canShowResourceArea = function() {
                var result = false;
                if ($scope.item && $scope.item.AppointmentSessionTypeId == 2) {
                    result = true;
                }
                return result;
            }
            //Visibility rules ends

        $scope.NewFormInitialzing = function() {
            $scope.item.Id = 0;
            $scope.currentcontext.id = 0;
            $scope.item.IsOrderMandatory = false;
            $scope.item.IsAllowForceBooking = false;
            $scope.item.SessionTypeId = -1;
            $scope.item.StartDate = new Date();
            $scope.item.EndDate = null;
            $scope.item.SlotDuration = null;
            $scope.item.StartTime = moment(new Date()).format("HH:mm");
            $scope.item.EndTime = null;
            $scope.item.BreakFrom = null;
            $scope.item.BreakTo = null;
            $scope.item.MaxSlotPerDay = null;
            $scope.item.NoofScheduleAppt = null;
            $scope.item.NoofWalkInPatient = null;
            $scope.item.HolidayFrom = null;
            $scope.item.HolidayTo = null;
            $scope.item.IsAll = false;
            $scope.allChkChanged();
        };

        $scope.getParentItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.StartDate = $scope.item.StartDate;
            if ($scope.currentcontext.newform) {
                $scope.NewFormInitialzing();
            }
        };

        $scope.getParentItem = function(pageNo) {
            if ($scope.$parent.$stateParams.id && $scope.$parent.$stateParams.id > 0) {
                var options = {
                    action: 'appointment/AppointmentSession/GetAppointmentSessionById',
                    data: { Id: $scope.$parent.$stateParams.id },
                    type: 'post',
                    onComplete: $scope.getParentItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.StartDate = $scope.item.StartDate;
            if ($scope.currentcontext.newform) {
                $scope.NewFormInitialzing();
            }
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.departmentChangeCallback = function(scope, data, options, hasError) {}
        $scope.departmentChange = function() {
            var inputData = [];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.departmentChangeCallback
            };
            utl.Http.doAction(options);
        }

        $scope.doctorChange = function() {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.SpecialityId = doctorObj.SpecialityId;
        }

        $scope.backToList = function() {
            $state.go('app.labcenterprofiletab.labcenterslotslist');
        }

        $scope.addNew = function() {
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
            }
        };

        $scope.getPrevSlotsCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                utl.Alert.showErrorMsg($translate.instant('Already added this Session to this OrderType'));
                $scope.item.SessionTypeId = -1;
                return;
            }
        };

        $scope.getPrevSlots = function(prevdata) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.facid },
                    { Key: 8, Value: 2 },
                    { Key: 13, Value: prevdata.SessionTypeId },
                    { Key: 10, Value: prevdata.OrderTypeId },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevSlotsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.SelectedSession = function(selectedItem) {
            $scope.item.SessionTypeId = selectedItem.Id;
            $scope.getPrevSlots($scope.item);
        };

        $scope.saveAndApprove = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };
        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            $scope.backToList();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.FacilityId = $scope.currentcontext.facid;

            var actionName = 'appointment/AppointmentMultiSession/AddAppointmentMultiSession';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'appointment/AppointmentMultiSession/UpdateAppointmentMultiSession';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
                $scope.lookup = hasError ? {} : data;
                $scope.getOldAppointmentList();
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

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "AppointmentSessionType" },
                { "Key": "SessionType" },
                { "Key": "Facility" },
                { "Key": "Clinic" },
                { "Key": "Speciality" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Resource" },
                { "Key": "AppointmentSlotType" },
                {
                    "Key": "VirtualSubCategory",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: true
                        }],

                    }
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

    LabCenterSlotsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', 'modalConfig', '$timeout'];

})();