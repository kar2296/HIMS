(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientRegisterFormReportController', PatientRegisterFormReportController);

    function PatientRegisterFormReportController($scope, $timeout, $stateParams, $state, $cookies, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2

        };
        $scope.item = {
            PatientTypeId: 1,
            tabindex: $scope.tabindexmap.detailtabindex++

        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = $stateParams.id;


        $scope.home = function () {
            $state.go('app.patientservices');
        }

        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function () {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.Area = '';
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
        }
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = ''; var address2 = ''; var city = '';
            var area = ''; var state = ''; var country = ''; var pincode = '';
            for (var i = 0; i < addressComponents.length; i++) {
                if (i == 0)
                    $scope.clearpreviousaddress();

                var addressType = addressComponents[i].types[0];
                if (addressType) {
                    if ('premise' == addressType) { // Address 1
                        address1 = addressComponents[i].long_name;
                    } else if ('sublocality_level_1' == addressType) { // Address 2
                        address2 = addressComponents[i].long_name;
                    } else if ('route' == addressType) { // Area
                        city = addressComponents[i].long_name;
                    } else if ('locality' == addressType) { // city
                        area = addressComponents[i].long_name;
                    } else if ('administrative_area_level_1' == addressType) { // state
                        state = addressComponents[i].long_name;
                    } else if ('country' == addressType) { // country
                        country = addressComponents[i].long_name;
                    } else if ('postal_code' == addressType) { // pincode
                        pincode = addressComponents[i].long_name;
                    }
                }
            }
            $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
                $scope.getPincodeData(pincode);
        });

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function (scope, res, options, hasError) {
            if (res.Data) {
                if (res.Data.length > 0) {
                    $scope.item.PinCodeId = res.Data[0].Id;
                    $scope.item.Area = res.Data[0].Area;
                    $scope.item.CityId = res.Data[0].CityId;
                    $scope.item.StateId = res.Data[0].StateId;
                    $scope.item.CountryId = res.Data[0].CountryId;
                }
            }
        }

        $scope.getPincodeData = function (pincode) {
            var inputData = {
                Params: [{ Key: 5, Value: pincode }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/PincodeMaster/GetPincodeMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPincodeDataCallback
            };
            utl.Http.doAction(options);
        }

        $scope.enablegoogleaddopt = function () {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function () {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        }
        /* Google Address code ends */

        $scope.currentcontext = {
            file: null,
            canDisableApprove: false
        };
        // $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove')
        // $scope.currentcontext.CanSave = utl.Privilege.hasPrivilege('CanSave')
        // $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint')
        // $scope.currentcontext.CanQRFindpatient = utl.Privilege.hasPrivilege('CanQRFindpatient')
        // $scope.currentcontext.CanQRDeceased = utl.Privilege.hasPrivilege('CanQRDeceased')
        // $scope.currentcontext.CanAttachment = utl.Privilege.hasPrivilege('CanAttachment')
        // $scope.currentcontext.CanQROPDBill = utl.Privilege.hasPrivilege('CanQROPDBill')
        // $scope.currentcontext.CanQRNewvisit = utl.Privilege.hasPrivilege('CanQRNewvisit')
        // $scope.currentcontext.CanUserManual = utl.Privilege.hasPrivilege('CanUserManual')
        // $scope.currentcontext.CanProcessFlow = utl.Privilege.hasPrivilege('CanProcessFlow')
        $scope.currentcontext.id = parseInt($stateParams.id) || 0;
        $scope.item.IsMRNTypeDisable = false;
        $scope.isSaveAndApprove = false;

        //Visibility rules starts

        $scope.canShowApproxAge = function (vTitleId) {
            if (vTitleId && $scope.lookup) {
                for (var idx in $scope.lookup.Title) {
                    if (vTitleId == $scope.lookup.Title[idx].Id)
                        if ($scope.lookup.Title[idx].Code.toLowerCase() == "babyof")
                            return true;
                }
            }
            return false;
            //return $scope.lookup && $scope.lookup.Title && $scope.item.TitleId == utl.Lookup.getDefaultCode($scope.lookup.Title, 'BABYOF');
        }

        //Visibility rules ends
        $('#myModal').hide();
        $scope.showprocessflow = function () {
            $('#myModal').show();
        }

        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        }
        $scope.fillDefaultValues = function () {
            var currentdate = utl.Formatter.getCurrentDate();
            $scope.item.RegisteredDate = utl.Formatter.getDateStringForAppointment(currentdate);
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2 // Defaulted to MRN
        }

        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
            $scope.refreshReactProps();
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = { Id: $scope.item.Id, PhotoPath: $scope.item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getEncounters(); //
            if (data.MRNTypeId == 2 && data.PatientStatusId == 2) {
                $scope.item.IsMRNTypeDisable = true;
            }
            if ($scope.refreshBanner) {
                $scope.refreshBanner();
            }

            $scope.getPatientProfilePic();

            //Compute age
            var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
            $scope.item.ApproxAgeDays = ageObj.d;
            $scope.item.ApproxAgeMonths = ageObj.m;
            $scope.item.Age = ageObj.y;

            $scope.setFocusTitle();
            $scope.refreshReactProps();
        };


        $scope.setFocusTitle = function () {
            if ($scope.currentcontext.id <= 0) {
                $timeout(function () {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }

        $scope.callTitleFocus = function () {
            if ($scope.currentcontext.id <= 0) {
                console.log("test print by ");
                var uiSelect = angular.element(document.getElementById('title'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
        }

        $scope.isPatientActivated = function () {
            if ($scope.item.PatientStatusId) {
                return $scope.item.PatientStatusId == 2;
            }
            return false;
        }

        $scope.openattachments = function () {
            if ($scope.item.Id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.item.Id, itemid: $scope.item.Id },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }


        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'registration/Patient/PrintPatient',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.print2 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatient',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.print3 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            else {
                $scope.setFocusTitle();
            }
        };
        // OPD Bill Popup Screen  - Start
        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
        };

        $scope.getEncounters = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.id },
                    { Key: 14, Value: 1 }
                ]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };
        $scope.OPDBill = function () {
            $state.go('app.opbilling-list', { id: $scope.item.Id });
            // utl.Modal.open('app.opdbill', {
            //     params: { id: $scope.Encounter.Id, pid: $scope.currentcontext.id },
            //     confirmCallback: $scope.getItem
            // }
            // );
        }
        // OPD Bill Popup Screen  - End

        //Patient picker related code starts
        function patientPickerCallback(patientdata) {
            $state.go('app.quickregistration', { id: patientdata.pid });
        }

        $scope.pickPatient = function () {
            utl.Modal.open('app.patientpicker', {
                params: {},
                confirmCallback: patientPickerCallback
            });
        }
        //Patient picker related code ends

        $scope.deceased = function () {
            utl.Modal.open('app.registrarion', {
                params: { pid: $scope.currentcontext.id },
                // confirmCallback: $scope.getList
                confirmCallback: $scope.getItem //
            });
        }
        $scope.vitals = function () {
            utl.Modal.open('patientemr.patientvital', {
                params: { pid: $scope.currentcontext.id, encounter: $scope.Encounter.Id },
                confirmCallback: $scope.getList
            });
        }
        $scope.visitprint = function () {
            var inputData = {
                Id: $scope.item.Encounters[0].AppointmentId
            };
            var options = {
                action: 'appointment/Appointment/PrintAppointment',
                data: inputData,
                type: 'post',
                // onComplete:$scope.backToList
            };
            utl.Http.doDownload(options);
        }
        $scope.backToList = function () {
            $state.go('app.patientregistration-list');
        }

        $scope.addNewFull = function () {
            $state.go('app.fullregistrationtab.basic', { id: 0 });
        }

        $scope.addNewQuick = function () {
            $state.go('app.quickregistration', { id: 0 });
        }


        $scope.EnableOPD = false;
        $scope.Visitprint = false;
        $scope.Vitals = false;

        function vistCreated() {
            $scope.getItem();
            $scope.EnableOPD = true;
            $scope.Visitprint = true;
            $scope.Vitals = true;

        }
        $scope.newvisit = function () {
            if ($scope.currentcontext.id == 0) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.register-patient-msg.lbl'));
                return;
            }

            if (!$scope.item.MRN) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.nomrn-msg.lbl'));
                return;
            }

            utl.Modal.open('app.appointment', {
                params: { id: 0, pid: $scope.currentcontext.id, apptstatusid: 6 },
                // confirmCallback: $scope.getList
                confirmCallback: vistCreated //
            });
        }

        //Success alert starts
        $scope.showPatientSuccessAlert = function (pid) {
            $scope.isSaveAndApprove = false;
            if ($scope.currentcontext.id == 0) {
                $state.go('app.patientservices', { id: pid });
            } else {
                $scope.getItem();
            }
        };

        $scope.getPatientItemForAlertCallback = function (scope, data, options, hasError) {
            var patientInfo = "";
            if (data.Title && data.Title.Description) {
                patientInfo += data.Title.Description + '. ';
            }
            patientInfo += data.FirstName;
            if (data.LastName) {
                patientInfo += ' ' + data.LastName;
            }
            patientInfo += ' / MRN: ' + data.MRN;

            var alertOptions = {
                messageKey: 'registration.fullregistration.patient-success-msg.lbl',
                patientInfo: patientInfo,
                pid: data.Id,
                onSuccessMethod: $scope.showPatientSuccessAlert,
                onDismissMethod: $scope.showPatientSuccessAlert
            };

            utl.Dialog.patientConfirmMessage(alertOptions);
        };

        $scope.getPatientItemForAlert = function (pid) {
            var options = {
                action: 'registration/patient/GetPatientById',
                data: { Id: pid },
                type: 'post',
                onComplete: $scope.getPatientItemForAlertCallback
            };
            utl.Http.doAction(options);
        };
        //Success alert ends

        $scope.afterSave = function (data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    if ($scope.isSaveAndApprove) {
                        //$state.go('app.quickregistration', { id: options.data.Data.Id });
                        $scope.currentcontext.id = options.data.Data.Id;
                        $state.go('app.patientservices', { id: options.data.Data.Id });
                    }
                    // else if ($scope.currentcontext.id == 0) {
                    //     $state.go('app.patientservices', { id: options.data.Data.Id });
                    // } else {
                    //     $scope.getItem();
                    // }
                }
            } else if (typeof (data) == "number") {
                if ($scope.isSaveAndApprove) {
                    //$state.go('app.patientservices', { id: data });
                    $scope.currentcontext.id = data;
                    $state.go('app.patientservices', { id: data });
                }
                // else if ($scope.currentcontext.id == 0) {
                //     $state.go('app.patientservices', { id: data });
                // } else {
                //     $scope.getItem();
                // }
            }
            else {
                $scope.backToList(); // Safer side added
            }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (data < 0) {
                handlePatientExists(data);
            } else {
                $scope.afterSave(data, options);
            }
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //     $scope.showErrorMsg($scope.i18n.registration.common.validationmsg.lbl);
            //     return;
            // }

            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }

            if (utl.Formatter.isFutureDate($scope.item.DOB)) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.dobdate-cant-future-msg.lbl'));
                return;
            }

            if (!$scope.item.LandLine && !$scope.item.Mobile) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.atleast-one-contactno-msg.lbl'));
                return;
            }

            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }

            var actionName = 'registration/patient/AddPatient';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'registration/patient/UpdatePatient';
            }

            if ($scope.isSaveAndApprove) {
                $scope.currentcontext.canDisableApprove = true;
            }

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) { //upload function returns a promise

                    if (resp.data < 0) {
                        handlePatientExists(resp.data);
                    } else {
                        $scope.currentcontext.file = null;
                        var patientId = $scope.currentcontext.id > 0 ? $scope.currentcontext.id : resp.data;
                        $scope.afterSave(patientId);
                    }
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: { Data: $scope.item, file: $scope.currentcontext.file },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
            $scope.setFocusTitle();
        }

        $scope.save = function () {
            $scope.item.PatientStatus = 'Draft'
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            $scope.item.PatientStatus = 'Active';
            $scope.isSaveAndApprove = true;
            $scope.saveItem();
        };

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
            $scope.refreshReactProps();
        }

        $scope.openWebCam = function () {
            utl.Modal.open('webcam-modal', {
                params: { pid: $scope.currentcontext.id },
                confirmCallback: webcamSuccess
            });
        }
        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        }
        $scope.saveAndInactive = function () {
            $scope.item.PatientStatus = 'Inactive'
            if ($scope.item.Id > 0) {
                var message = "";
                message = $scope.item.Title ? $scope.item.Title.Description : "";
                message += message != "" ? ("." + $scope.item.FirstName) : $scope.item.FirstName;
                message += $scope.item.MRN ? (" / MRN-" + $scope.item.MRN) : "";
                utl.Dialog.confirmDeactivate($scope.saveItem, message);
            } else {
                $scope.saveItem(); // Safer side added
            }
        };

        $scope.fillGenderInfo = function () {
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function () {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
        }

        $scope.calculateDOB = function (age, substractPart) {
            var options = { d: $scope.item.ApproxAgeDays, m: $scope.item.ApproxAgeMonths, y: $scope.item.Age };
            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.IsBirthDateApproximate = true;
        };
        $scope.pshome = function () {
            $state.go('app.patientservices');
        }
        //logout
        $scope.logoutCallback = function (scope, res, options, hasError) {

            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k, { path: '/' });
            });

            $state.go('page.login');
        };

        $scope.logout = function () {
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };

            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getItem();
        }

        function handlePatientExists(data) {
            var confirmOptions = {
                messageKey: 'registration.fullregistration.patient-exists-msg.lbl',
                placeholder: { patientcount: (data * -1) },
                onSuccessMethod: function () {
                    $scope.item.OverrideDuplicate = true;
                    $scope.saveItem();
                }
            };

            utl.Dialog.confirmMessage(confirmOptions);
        }

        //Reload banner code starts
        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        $scope.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }
        //Reload banner code ends

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Title" },
                { "Key": "MaritalStatus" },
                { "Key": "Religion" },
                { "Key": "Nationality" },
                { "Key": "Language" },
                { "Key": "VisaType" },
                { "Key": "VipType" },
                { "Key": "PatientType" },
                // { "Key": "Pincode" },
                // { "Key": "City" },
                //{ "Key": "State" },
                // { "Key": "Country" },
                { "Key": "Gender" },
                { "Key": "MRNType", "Default": false }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // ---- React bridge (added for React migration) ----
        // Builds the props object handed to <react-component name="PatientRegistrationFormScreen">.
        // Keeps only the fields the React presentational layer actually needs; all real
        // business logic/API calls above are untouched and still own $scope.item.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: $scope.item,
                lookup: {
                    Title: ($scope.lookup && $scope.lookup.Title) || [],
                    Gender: ($scope.lookup && $scope.lookup.Gender) || [],
                    MaritalStatus: ($scope.lookup && $scope.lookup.MaritalStatus) || [],
                    Religion: ($scope.lookup && $scope.lookup.Religion) || [],
                    Nationality: ($scope.lookup && $scope.lookup.Nationality) || [],
                    Language: ($scope.lookup && $scope.lookup.Language) || [],
                    PatientType: ($scope.lookup && $scope.lookup.PatientType) || []
                },
                currentcontext: {
                    id: $scope.currentcontext.id,
                    Photo: $scope.currentcontext.Photo
                }
            };
        };
        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'saveAndApprove') {
                angular.extend($scope.item, payload);
                $scope.saveAndApprove();
            } else if (actionName === 'backToList') {
                $scope.backToList();
            } else if (actionName === 'openWebCam') {
                $scope.openWebCam();
            } else if (actionName === 'clearimage') {
                $scope.clearimage();
                $scope.refreshReactProps();
            } else if (actionName === 'fileSelected') {
                $scope.currentcontext.file = (payload && payload.file) || null;
            } else if (actionName === 'titleChange') {
                $scope.item.TitleId = payload && payload.value;
                $scope.fillGenderInfo();
                $scope.refreshReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'genderChange') {
                $scope.item.GenderId = payload && payload.value;
                $scope.refreshReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'ageChange') {
                $scope.item.Age = payload && payload.value;
                $scope.calculateDOB($scope.item.Age, 'years');
                $scope.refreshReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'approxDaysChange') {
                $scope.item.ApproxAgeDays = payload && payload.value;
                $scope.calculateDOB($scope.item.ApproxAgeDays, 'days');
                $scope.refreshReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'approxMonthsChange') {
                $scope.item.ApproxAgeMonths = payload && payload.value;
                $scope.calculateDOB($scope.item.ApproxAgeMonths, 'months');
                $scope.refreshReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'dobChange') {
                $scope.item.DOB = payload && payload.value;
                $scope.calculateAge();
                $scope.refreshReactProps();
                $scope.$applyAsync();
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };

        $scope.initLookup();
    }

    PatientRegisterFormReportController.$inject = ['$scope', '$timeout', '$stateParams', '$state', '$cookies', '$translate', 'utl', 'Upload'];

})();
