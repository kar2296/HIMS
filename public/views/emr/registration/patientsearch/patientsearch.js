(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientSearchListController', patientSearchListController);

    function patientSearchListController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        // angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.gridData = [];
        $scope.currentfilter = {
            mrn: '',
            patientname: '',
            dateofbirth: '',
            status: 2,
            phoneno: '',
            visitid: '',
            registereddate: utl.Formatter.getCurrentDate(),
            isOtherFacility: false
        };
        $scope.currentcontext = {};
        // $scope.currentcontext.CanUserManual = utl.Privilege.hasPrivilege('CanUserManual')
        // $scope.currentcontext.CanProcessFlow = utl.Privilege.hasPrivilege('CanProcessFlow')
        // $scope.currentcontext.CanPSQuickReg = utl.Privilege.hasPrivilege('CanPSQuickReg')
        // $scope.currentcontext.CanPSFullReg = utl.Privilege.hasPrivilege('CanPSFullReg')
        // //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Id == patientId) {
                    item.Photo = photo;
                }
            }
        };
        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }

        $('#myModal').hide();
        $scope.showprocessflow = function () {
            $('#myModal').show();
        }

        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        }

        $scope.getPatientProfilePic = function (item) {
            if (item.PhotoPath) {
                var inputData = { Id: item.Id, PhotoPath: item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadPhotos() {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.PhotoPath) {
                    $scope.getPatientProfilePic(item);
                }
            }
        }

        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                MRN: '',
                Name: '',
                DOB: '',
                Phone: '',
                From: '',
                To: '',
                ReferralId: -1,
                PinCode: '',
                VisitDate: '',
                Country: '',
                VisitTypeId: -1,
                State: '',
                GuarantorId: -1,
                CityTown: '',
                IsAdmitted: false,
                Area: '',
                ShowTempPatient: false
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'text', translate: 'registration.patientsearch.filter_mrn.lbl', model: 'MRN', position: { r: 0, c: 0 } },
                    { type: 'text', translate: 'registration.patientsearch.filter_patientname.lbl', model: 'Name', position: { r: 0, c: 1 } },
                    { type: 'date', translate: 'registration.patientsearch.filter_dateofbirth.lbl', model: 'DOB', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'registration.patientsearch.filter_phoneno.lbl', model: 'Phone', position: { r: 1, c: 1 } },
                    { type: 'date', translate: 'registration.patientsearch.filter_registerfromdate.lbl', model: 'From', position: { r: 2, c: 0 } },
                    { type: 'date', translate: 'registration.patientsearch.filter_registertodate.lbl', model: 'To', position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'registration.patientsearch.filter_referredby.lbl', model: 'ReferralId', options: $scope.lookup.Referral, position: { r: 3, c: 0 } },
                    { type: 'text', translate: 'registration.patientsearch.filter_pincode.lbl', model: 'PinCode', position: { r: 3, c: 1 } },
                    { type: 'date', translate: 'registration.patientsearch.filter_visitdate.lbl', model: 'VisitDate', position: { r: 4, c: 0 } },
                    { type: 'text', translate: 'registration.patientsearch.filter_country.lbl', model: 'Country', position: { r: 4, c: 1 } },
                    { type: 'select', translate: 'registration.patientsearch.filter_visittype.lbl', model: 'VisitTypeId', options: $scope.lookup.VisitType, position: { r: 5, c: 0 } },
                    { type: 'text', translate: 'registration.patientsearch.filter_state.lbl', model: 'State', position: { r: 5, c: 1 } },
                    { type: 'select', translate: 'registration.patientsearch.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 6, c: 0 } },
                    { type: 'text', translate: 'registration.patientsearch.filter_citytown.lbl', model: 'CityTown', position: { r: 6, c: 1 } },
                    { type: 'checkbox', translate: 'registration.patientsearch.filter_isadmitted.lbl', model: 'ReferralId', position: { r: 7, c: 0 } },
                    { type: 'text', translate: 'registration.patientsearch.filter_area.lbl', model: 'Area', position: { r: 7, c: 1 } },
                    { type: 'checkbox', translate: 'registration.patientsearch.filter_istemppatient.lbl', model: 'ShowTempPatient', position: { r: 8, c: 0 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        //Dynamic form  ends

        function getLatestAppointment(item) {
            var result = {};
            item.LatestEncounter = null;

            if (item.Appointments != null && item.Appointments.length > 0) {
                result = item.Appointments[0];
                if (item.Encounters && item.Encounters.length > 0) {
                    item.LatestEncounter = item.Encounters[0];

                    var latestAppointmentId = item.LatestEncounter.AppointmentId;
                    result = utl.Common.getItemByProp(item.Appointments, 'Id', latestAppointmentId);
                }
            }
            return result;
        }

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;


            if ($stateParams.mrnnricmobilenr) { // coming form top  MRN / NRIC / MobileNr
                $scope.currentfilter.patientname = '';
            }

            var items = $scope.gridData;
            for (var idx in items) {
                var item = items[idx];
                item.LatestAppointment = getLatestAppointment(item);

                //Compute age
                var ageObj = utl.Formatter.getDetailedAgeFromDOB(item.DOB);
                item.ApproxAgeDays = ageObj.d;
                item.ApproxAgeMonths = ageObj.m;
                item.Age = ageObj.y;

                item.AgeDisplay = item.Age > 0 ? item.Age + 'Y' : '';
                item.AgeDisplay += item.ApproxAgeMonths > 0 ? ' ' + item.ApproxAgeMonths + 'M' : '';
                item.AgeDisplay += item.ApproxAgeDays > 0 ? ' ' + item.ApproxAgeDays + 'D' : '';
            }

            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.Data.length;
            loadPhotos();
        };

        $scope.getList = function (pageNo) {
            if (!$scope.currentfilter.mrn &&
                !$scope.currentfilter.phoneno &&
                !$scope.currentfilter.patientname && !$scope.currentfilter.dateofbirth
                && !$scope.currentfilter.visitid && !$scope.currentfilter.registereddate
                && !$scope.advancedfilter.MRN && !$scope.advancedfilter.Name
                && !$scope.advancedfilter.Phone && !$scope.advancedfilter.DOB) {
                return;
            }
            if (($scope.advancedfilter.From || $scope.advancedfilter.To) || $scope.currentfilter.mrn ||
                $scope.currentfilter.phoneno || $scope.currentfilter.patientname || $scope.currentfilter.dateofbirth
                || $scope.currentfilter.visitid || $scope.advancedfilter.MRN ||
                $scope.advancedfilter.Phone || $scope.advancedfilter.Name || $scope.advancedfilter.DOB) {
                $scope.currentfilter.registereddate = '';
            }
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.patientname },
                    { Key: 3, Value: $scope.currentfilter.dateofbirth },
                    { Key: 4, Value: $scope.currentfilter.phoneno },
                    { Key: 5, Value: $scope.currentfilter.visitid },
                    { Key: 7, Value: $scope.currentfilter.status },
                    { Key: 8, Value: true }, //IncludeAppointments
                    { Key: 9, Value: $scope.advancedfilter.From },
                    { Key: 10, Value: $scope.advancedfilter.To },
                    { Key: 11, Value: $scope.advancedfilter.ReferralId },
                    //{ Key: 12, Value: $scope.advancedfilter.VisitDate },
                    //{ Key: 13, Value: $scope.advancedfilter.VisitTypeId },
                    { Key: 14, Value: $scope.advancedfilter.GuarantorId },
                    //{ Key: 15, Value: $scope.advancedfilter.IsAdmitted },
                    { Key: 16, Value: $scope.advancedfilter.PinCode },
                    { Key: 17, Value: $scope.advancedfilter.Country },
                    { Key: 18, Value: $scope.advancedfilter.State },
                    { Key: 19, Value: $scope.advancedfilter.CityTown },
                    { Key: 20, Value: $scope.advancedfilter.Area },
                    { Key: 23, Value: $scope.advancedfilter.ShowTempPatient || $scope.currentfilter.istemp || false },
                    { Key: 25, Value: 1 },
                    { Key: 1, Value: $scope.advancedfilter.Name },
                    { Key: 3, Value: $scope.advancedfilter.DOB },
                    { Key: 4, Value: $scope.advancedfilter.Phone }
                    // //for appointment based
                    // { Key: 21, Value: {
                    //     'AppointmentStatus': 6,
                    //     'My':false
                    // }}
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };

            var mrnshortcode =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'mrnshortcode');

            if ($scope.advancedfilter.MRN != '' && $scope.advancedfilter.MRN != null &&
            $scope.advancedfilter.MRN != undefined && $scope.advancedfilter.MRN) {

                if (mrnshortcode) {
                    if (isNaN($scope.advancedfilter.MRN)) {
                        inputData.Params.push({ Key: 2, Value: $scope.advancedfilter.MRN });
                    } else {
                        inputData.Params.push({ Key: 32, Value: $scope.advancedfilter.MRN });
                    }
                } else {
                    inputData.Params.push({ Key: 26, Value: $scope.advancedfilter.MRN });
                }
            } else {
                if (mrnshortcode) {
                    if (isNaN($scope.currentfilter.mrn)) {
                        inputData.Params.push({ Key: 2, Value: $scope.currentfilter.mrn });
                    } else {
                        inputData.Params.push({ Key: 32, Value: $scope.currentfilter.mrn });
                    }
                } else {
                    inputData.Params.push({ Key: 26, Value: $scope.currentfilter.mrn });
                }
            }

            if (!$scope.currentfilter.isOtherFacility) {
                inputData.Params.push(
                    { Key: 29, Value: utl.Session.getCurrentFacilityId() }
                );
            }

            if ($scope.currentfilter.registereddate) {
                var FrRegDt = $filter('date')($scope.currentfilter.registereddate, 'yyyy-MM-dd 00:00:00');
                var ToRegDt = $filter('date')($scope.currentfilter.registereddate, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push(
                    { Key: 6, Value: [FrRegDt, ToRegDt] }
                );
            }

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.test = function () {
            return "Visit in Progress";
        }

        //Grid Actions
        $scope.addNewFull = function () {
            $state.go('app.fullregistrationtab.basic', { id: 0 });
        }
        $scope.addNewQuick = function () {
            $state.go('app.quickregistration', { id: 0 });
        }


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: '',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        //Save User
        $scope.saveUserCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('registration.patientsearch.portalaccess-success.lbl'));
        };

        $scope.createUserForPatient = function (row) {
            var user = {
                TitleId: row.entity.TitleId, ActionFrom: utl.Formatter.getCurrentDate(), GenderId: row.entity.GenderId,
                FirstName: row.entity.FirstName, MiddleName: row.entity.MiddleName, LastName: row.entity.LastName,
                Age: row.entity.Age, DOB: row.entity.DOB, NationalityId: row.entity.NationalityId,
                LandLine: row.entity.LandLine, Email: row.entity.Email, Mobile: row.entity.Mobile,
                CityId: row.entity.CityId, StateId: row.entity.StateId, CountryId: row.entity.CountryId, PinCodeId: row.entity.PinCodeId,
                Area: row.entity.Area, City: row.entity.City, State: row.entity.State, Country: row.entity.Country,
                UserName: row.entity.MRN, Password: 'password', IsActive: true, ActiveStatus: 'Active',
                FacilityId: utl.Session.getCurrentFacilityId(), DepartmentId: utl.Session.getCurrentDepartmentId(),
                OrgId: utl.Session.getCurrentOrgId(),
                UserTypeId: 8, PatientId: row.entity.Id, LoginPermission: 1,
                GroupCode: 'PATIENTPORTAL'
            }; //UserType - Patient

            var options = {
                action: 'SystemSettings/User/AddUser',
                data: { Data: user },
                type: 'post',
                onComplete: $scope.saveUserCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.fullregistrationtab.basic', { id: row.entity.Id });
            }
            if (row.entity.PatientStatusId != 3) {
                //Op Bill Navigation With Alert Start - 
                if (actionType == 'opbillinglist') {
                    if (row.entity.LatestEncounter) {
                        $state.go('app.opbilling-list', { id: row.entity.Id });
                    } else {
                        utl.Alert.showErrorMsg('Please Create A Visit For The Selected Patients')
                    }
                }
                //Op Bill Navigation With Alert End - 
                else if (actionType == 'delete') {
                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.FirstName);
                } else if (actionType == 'emr') {
                    utl.Session.setEMRPatientId(row.entity.Id);
                    var encounterId = row.entity.LatestEncounter ? row.entity.LatestEncounter.EncounterId : 0;
                    if (encounterId == 0)
                        encounterId = row.entity.Encounters ? (row.entity.Encounters.length > 0 ? row.entity.Encounters[0].EncounterId : 0) : 0;
                    $state.go('patientemr.shoulderassessment', { eid: encounterId });
                } else if (actionType == 'admissionlink') {
                    utl.Session.setEMRPatientId(row.entity.Id);
                    $state.go('app.admissiontab.admission', { id: 0 });
                } else if (actionType == 'ipbillinglink') {
                    utl.Session.setEMRPatientId(row.entity.Id);
                    $state.go('app.opbilling-list', { id: row.entity.Id, tp: 'DG' });
                } else if (actionType == 'appointments') {
                    if (row.entity.OutStandingAmount && row.entity.OutStandingAmount > 0)
                        utl.Alert.showErrorMsg('Patient has been due. Due Amount :' + $filter('displaycurrency')(row.entity.OutStandingAmount));
                    utl.Modal.open('app.appointment', {
                        params: { id: 0, pid: row.entity.Id },
                        confirmCallback: $scope.getList
                    }
                    );
                } else if (actionType == 'print') {
                    utl.Modal.open('app.patientprint', {
                        params: { id: 0, pid: row.entity.Id },
                        confirmCallback: $scope.getList
                    }
                    );
                } else if (actionType == 'preappoinments') {
                    utl.Modal.open('app.previousappointment', {
                        params: { id: 0, pid: row.entity.Id },
                        confirmCallback: $scope.getList
                    }
                    );
                } else if (actionType == 'newvisit') {
                    if (row.entity.OutStandingAmount && row.entity.OutStandingAmount > 0)
                        utl.Alert.showErrorMsg('Patient has been due. Due Amount :' + $filter('displaycurrency')(row.entity.OutStandingAmount));
                    utl.Modal.open('app.appointment', {
                        params: { id: 0, pid: row.entity.Id, apptstatusid: 6 },
                        confirmCallback: $scope.getList
                    }
                    );
                } else if (actionType == 'portalaccess') {
                    $scope.createUserForPatient(row);
                } else if (actionType == 'checkout') {
                    utl.Modal.open('app.patienttracker', {
                        params: { pid: row.entity.Id, aid: row.entity.LatestEncounter.AppointmentId },
                        confirmCallback: $scope.getList
                    });
                } else if (actionType == 'payer') {
                    utl.Modal.open('app.encounterguarantors', {
                        params: { pid: row.entity.Id, encounterid: row.entity.LatestEncounter.EncounterId },
                        confirmCallback: $scope.getList
                    });
                }
                else if (actionType == 'update') {
                    utl.Modal.open('app.demographicupdate', {
                        params: { id: row.entity.Id },
                        confirmCallback: $scope.patientPickerCallback
                    });
                } else if (actionType == 'outstandingbillsview') {
                    utl.Modal.open('app.outstandingbill-list', {
                        params: { eid: row.entity.Id },
                        confirmCallback: $scope.patientPickerCallback
                    });
                } else if (actionType == 'vitals') {
                    utl.Session.setEMRPatientId(row.entity.Id);
                    utl.Modal.open('patientemr.patientvital', {
                        params: { pid: row.entity.Id, encounter: row.entity.LatestEncounter.EncounterId },
                        confirmCallback: $scope.patientPickerCallback
                    });
                } else if (actionType == 'patientprint') {
                    utl.Session.setEMRPatientId(row.entity.Id);
                    utl.Modal.open('app.patientprints', {
                        params: { pid: row.entity.Id },
                        confirmCallback: $scope.patientPickerCallback
                    });
                }
            }
        }

        vm.gridConfig = {
            columnDefs: [
                /*{ field: "FirstName", displayName: $translate.instant('registration.patientsearch.name.lbl') },
                { field: "Age", displayName: $translate.instant('registration.patientsearch.age.lbl') },
                { field: "DOB", displayName: $translate.instant('registration.patientsearch.dob.lbl'),
                    cellTemplate : "<ngformatdate date-val='row.entity.DOB'></ngformatdate>" },
                { field: "AddressLine1", displayName: $translate.instant('registration.patientsearch.address.lbl') },
                { field: "City", displayName: $translate.instant('registration.patientsearch.city.lbl') },
                { field: "Country", displayName: $translate.instant('registration.patientsearch.country.lbl') },
                { field: "Mobile", displayName: $translate.instant('registration.patientsearch.mobile.lbl') },
                { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                        cellTemplate : 'actionTemplate.html',
                        actions : [
                                    {actiontype: 'edit', display : 'common.editaction.lbl'}
                                 ]
                }*/
                { field: "Id", name: 'Patient Details', cellTemplate: 'patientListTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();

            if ($stateParams.mainsearchdata) { // coming form top
                $scope.advancedfilter = $stateParams.mainsearchdata;
            }

            if ($stateParams.mrnnricmobilenr) { // coming form top  MRN / NRIC / MobileNr
                $scope.currentfilter.patientname = $stateParams.mrnnricmobilenr;
            }

            $scope.getList();
        }



        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PatientStatus" },
                { "Key": "Referral" },
                { "Key": "VisitType" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
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

    patientSearchListController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();