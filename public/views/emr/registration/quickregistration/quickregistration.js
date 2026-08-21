(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('quickRegistrationFormController', quickRegistrationFormController);

    function quickRegistrationFormController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.autopatientportal = 0;

        $scope.autopatientportal =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'autopatientportal');


        // angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2

        };

        $scope.numberonly = function(e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.item = {
            PatientTypeId: 1,
            tabindex: $scope.tabindexmap.detailtabindex++

        };
        $scope.backtoList = function() {
            $state.go('app.billingsdashboard')
        }

        $scope.opd_dashboard = function() {
            $state.go('app.opddashboard');
        }

        // --- React Bridge ---
        $scope.handleReactAction = function(actionName, payload) {
            if (actionName === 'itemFieldChange') {
                var field = payload && payload.field;
                if (field) {
                    $scope.item[field] = payload.value;
                    $scope.refreshFormReactProps();
                    $scope.$applyAsync();
                }
            } else if (actionName === 'itemFieldsMerge') {
                if (payload && payload.fields) {
                    angular.extend($scope.item, payload.fields);
                    $scope.refreshFormReactProps();
                    $scope.$applyAsync();
                }
            } else if (actionName === 'titleChange') {
                $scope.item.TitleId = payload && payload.value;
                $scope.fillGenderInfo();
                $scope.refreshFormReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'genderChange') {
                $scope.item.GenderId = payload && payload.value;
                $scope.refreshFormReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'ageChange') {
                $scope.item.Age = payload && payload.value;
                $scope.calculateDOB($scope.item.Age, 'years');
                $scope.refreshFormReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'approxDaysChange') {
                $scope.item.ApproxAgeDays = payload && payload.value;
                $scope.calculateDOB($scope.item.ApproxAgeDays, 'days');
                $scope.refreshFormReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'approxMonthsChange') {
                $scope.item.ApproxAgeMonths = payload && payload.value;
                $scope.calculateDOB($scope.item.ApproxAgeMonths, 'months');
                $scope.refreshFormReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'dobChange') {
                $scope.item.DOB = payload && payload.value;
                $scope.calculateAge();
                $scope.refreshFormReactProps();
                $scope.$applyAsync();
            } else if (actionName === 'openWebCam') {
                $scope.openWebCam();
            } else if (actionName === 'clearimage') {
                $scope.clearimage();
                $scope.refreshFormReactProps();
            } else if (actionName === 'fileSelected') {
                $scope.currentcontext.file = (payload && payload.file) || null;
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            } else if (actionName === 'saveAndInactive') {
                $scope.saveAndInactive($scope.item);
            } else if (actionName === 'opdBill') {
                $scope.OPDBill();
            }
        };

        $scope.refreshReactProps = function() {
            vm.reactPropsActionBar = {
                saveCompleted: $scope.SaveCompleted || false,
                billCompleted: $scope.BillCompleted || false,
                isPatientDeactivated: $scope.isPatientDeactivated || false,
                isTempPatient: $scope.currentcontext ? $scope.currentcontext.isTempPatient : false,
                patientStatusId: $scope.item ? $scope.item.PatientStatusId : 0,
                referredNewVisit: $scope.item ? $scope.item.ReferredNewVisit : false,
                attachmentCount: $scope.currentcontext ? $scope.currentcontext.attachmentcount : 0
            };
            $scope.reactPropsActionBar = vm.reactPropsActionBar;

            vm.reactPropsFooter = {
                patientStatusId: $scope.item ? $scope.item.PatientStatusId : 0,
                attachmentCount: $scope.currentcontext ? $scope.currentcontext.attachmentcount : 0,
                enableOPD: $scope.EnableOPD || false,
                isTempPatient: $scope.currentcontext ? $scope.currentcontext.isTempPatient : false,
                vitalsEnabled: $scope.Vitals || false,
                visitPrintEnabled: $scope.Visitprint || false,
                canDisableApprove: $scope.currentcontext ? $scope.currentcontext.canDisableApprove : false,
                privileges: {
                    canDeceased: (utl.Privilege && typeof utl.Privilege.hasPrivilege === 'function') ? utl.Privilege.hasPrivilege('QuickRegistration', 'QR-Deceased') : ((utl.Privilege && typeof utl.Privilege.hasAccess === 'function') ? utl.Privilege.hasAccess('QR-Deceased') : true),
                    canAttachment: (utl.Privilege && typeof utl.Privilege.hasPrivilege === 'function') ? utl.Privilege.hasPrivilege('QuickRegistration', 'Attachment') : ((utl.Privilege && typeof utl.Privilege.hasAccess === 'function') ? utl.Privilege.hasAccess('Attachment') : true),
                    canNewVisit: (utl.Privilege && typeof utl.Privilege.hasPrivilege === 'function') ? utl.Privilege.hasPrivilege('QuickRegistration', 'QR-Newvisit') : ((utl.Privilege && typeof utl.Privilege.hasAccess === 'function') ? utl.Privilege.hasAccess('QR-Newvisit') : true),
                    canOPDBill: (utl.Privilege && typeof utl.Privilege.hasPrivilege === 'function') ? utl.Privilege.hasPrivilege('QuickRegistration', 'QR-OPDBill') : ((utl.Privilege && typeof utl.Privilege.hasAccess === 'function') ? utl.Privilege.hasAccess('QR-OPDBill') : true)
                }
            };
            $scope.reactPropsFooter = vm.reactPropsFooter;
        };
        $scope.refreshReactProps();

        // Builds the props for the new QuickRegistrationFormScreen mount (the
        // patient-details + photo form). Kept as its own function/watch group,
        // separate from the pre-existing refreshReactProps above (which only ever
        // fed RegistrationActionBar/RegistrationFooter and must not be disturbed).
        $scope.refreshFormReactProps = function() {
            vm.reactPropsForm = {
                item: $scope.item,
                lookup: {
                    Title: ($scope.lookup && $scope.lookup.Title) || [],
                    Gender: ($scope.lookup && $scope.lookup.Gender) || [],
                    MaritalStatus: ($scope.lookup && $scope.lookup.MaritalStatus) || [],
                    VipType: ($scope.lookup && $scope.lookup.VipType) || [],
                    MRNType: ($scope.lookup && $scope.lookup.MRNType) || []
                },
                currentcontext: {
                    id: $scope.currentcontext ? $scope.currentcontext.id : undefined,
                    Photo: $scope.currentcontext ? $scope.currentcontext.Photo : undefined,
                    triedSubmit: $scope.currentcontext ? $scope.currentcontext.triedSubmit : false
                }
            };
            $scope.reactPropsForm = vm.reactPropsForm;
        };
        $scope.refreshFormReactProps();

        $scope.$watchGroup([
            'SaveCompleted',
            'BillCompleted',
            'isPatientDeactivated',
            'currentcontext',
            'item.PatientStatusId',
            'item.ReferredNewVisit',
            'EnableOPD',
            'Vitals',
            'Visitprint'
        ], function() {
            $scope.refreshReactProps();
        });
        // --------------------

        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function() {
                $scope.item.AddressLine1 = '';
                $scope.item.AddressLine2 = '';
                $scope.item.PinCodeId = -1;
                $scope.item.Area = '';
                $scope.item.CityId = -1;
                $scope.item.StateId = -1;
                $scope.item.CountryId = -1;
            }
            // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = '';
            var address2 = '';
            var city = '';
            var area = '';
            var state = '';
            var country = '';
            var pincode = '';
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
        $scope.getPincodeDataCallback = function(scope, res, options, hasError) {
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
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getPincodeData = function(pincode) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: pincode
                }],
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

        $scope.enablegoogleaddopt = function() {
                $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
                $timeout(function() {
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
        // $scope.currentcontext.id = parseInt($stateParams.id) || 0;
        // $scope.item.IsMRNTypeDisable = false;
        // $scope.isSaveAndApprove = false;

        //Visibility rules starts

        $scope.canShowApproxAge = function(vTitleId) {
            if (vTitleId && $scope.lookup) {
                for (var idx in $scope.lookup.Title) {
                    if (vTitleId == $scope.lookup.Title[idx].Id) {
                        if ($scope.lookup.Title[idx].Code.toLowerCase() == "babyof" || $scope.lookup.Title[idx].Code.toLowerCase() == "baby") {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        //Visibility rules ends
        $('#myModal').hide();
        $scope.showprocessflow = function() {
            $('#myModal').show();
        }

        $scope.hideprocessflow = function() {
            $('#myModal').hide();
        }
        $scope.fillDefaultValues = function() {
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
        $scope.getPatientProfilePicCallback = function(scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
            $scope.refreshFormReactProps();
        };

        $scope.getPatientProfilePic = function() {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function(scope, data, options, hasError) {
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
            $scope.refreshFormReactProps();
        };


        $scope.setFocusTitle = function() {
            if ($scope.currentcontext.id <= 0) {
                $timeout(function() {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }

        $scope.callTitleFocus = function() {
            if ($scope.currentcontext.id <= 0) {
                var uiSelect = angular.element(document.getElementById('title'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
        }

        $scope.isPatientActivated = function() {
            if ($scope.item.PatientStatusId) {
                return $scope.item.PatientStatusId == 2;
            }
            return false;
        }

        $scope.openattachments = function() {
            if ($scope.item.Id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.item.Id,
                        itemid: $scope.item.Id
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }


        $scope.print = function() {
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

        $scope.print2 = function() {
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

        $scope.print3 = function() {
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

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.setFocusTitle();
            }
        };
        // OPD Bill Popup Screen  - Start
        $scope.getEncounterCallback = function(scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
        };

        $scope.getEncounters = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 14,
                        Value: 1
                    }
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
        $scope.OPDBill = function() {
                $state.go('app.opbilling-list', {
                    id: $scope.item.Id
                });
                // utl.Modal.open('app.opdbill', {
                //     params: { id: $scope.Encounter.Id, pid: $scope.currentcontext.id },
                //     confirmCallback: $scope.getItem
                // }
                // );
            }
            // OPD Bill Popup Screen  - End

        //Patient picker related code starts
        function patientPickerCallback(patientdata) {
            $state.go('app.quickregistration', {
                id: patientdata.pid
            });
        }

        $scope.pickPatient = function() {
                utl.Modal.open('app.patientpicker', {
                    params: {},
                    confirmCallback: patientPickerCallback
                });
            }
            //Patient picker related code ends

        $scope.deceased = function() {
            utl.Modal.open('app.registrarion', {
                params: {
                    pid: $scope.currentcontext.id
                },
                // confirmCallback: $scope.getList
                confirmCallback: $scope.getItem //
            });
        }
        $scope.vitals = function() {
            utl.Modal.open('patientemr.patientvital', {
                params: {
                    pid: $scope.currentcontext.id,
                    encounter: $scope.Encounter.Id
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.visitprint = function() {
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
        $scope.backToList = function() {
            $state.go('app.patientsearch');
        }

        $scope.addNewFull = function() {
            $state.go('app.fullregistrationtab.basic', {
                id: 0
            });
        }
        $scope.admission = function() {
            $state.go('app.admissiontab.admission', {
                pid: $scope.item.PatientId,
                id: 0
            });
        };

        $scope.addNewQuick = function() {
            $state.go('app.quickregistration', {
                id: 0
            });
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
        $scope.newvisit = function() {
            if ($scope.currentcontext.id == 0) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.register-patient-msg.lbl'));
                return;
            }

            if (!$scope.item.MRN) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.nomrn-msg.lbl'));
                return;
            }

            utl.Modal.open('app.appointment', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.id,
                    apptstatusid: 6
                },
                // confirmCallback: $scope.getList
                confirmCallback: vistCreated //
            });
        }

        //Success alert starts
        $scope.showPatientSuccessAlert = function(pid) {
            $scope.isSaveAndApprove = false;
            if ($scope.currentcontext.id == 0) {
                $state.go('app.quickregistration', {
                    id: pid
                });
            } else {
                $scope.getItem();
            }
        };

        $scope.getPatientItemForAlertCallback = function(scope, data, options, hasError) {
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

        $scope.getPatientItemForAlert = function(pid) {
            var options = {
                action: 'registration/patient/GetPatientById',
                data: {
                    Id: pid
                },
                type: 'post',
                onComplete: $scope.getPatientItemForAlertCallback
            };
            utl.Http.doAction(options);
        };
        //Success alert ends

        $scope.afterSave = function(data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    if ($scope.isSaveAndApprove) {
                        //$state.go('app.quickregistration', { id: options.data.Data.Id });
                        $scope.currentcontext.id = options.data.Data.Id;
                        $scope.getItem();
                    } else if ($scope.currentcontext.id == 0) {
                        $state.go('app.quickregistration', {
                            id: options.data.Data.Id
                        });
                    } else {
                        $scope.getItem();
                    }
                }
            } else if (typeof(data) == "number") {
                if ($scope.isSaveAndApprove) {
                    //$state.go('app.quickregistration', { id: data });
                    $scope.currentcontext.id = data;
                    $scope.getItem();
                } else if ($scope.currentcontext.id == 0) {
                    $state.go('app.quickregistration', {
                        id: data
                    });
                } else {
                    $scope.getItem();
                }
            } else {
                $scope.backToList(); // Safer side added
            }
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            if (typeof(data) == "number") {
                $state.go('app.admissiontab.admission', {
                    id: 0,
                    pid: data
                })
            }
        };

        // Faithful replacement for utl.Validator.validate($scope) (which internally
        // checked $scope.item_form.$valid). The real Angular <form id="item_form"> this
        // depended on no longer exists now that the field section is a React component,
        // so this reimplements the exact same required-field set the original form
        // markup declared: Title/FirstName/DOB/Gender required (ui-select/input
        // `required` attributes), Mobile required with exactly 10 digits (the original's
        // MINLENGTH=10/MAXLENGTH=10 on #contactnr). No other field in the original form
        // carried a required/minlength/maxlength/pattern constraint.
        $scope.isQuickRegFormValid = function() {
            if (!$scope.item.TitleId) return false;
            if (!$scope.item.FirstName) return false;
            if (!$scope.item.DOB) return false;
            if (!$scope.item.GenderId) return false;
            if (!$scope.item.Mobile || String($scope.item.Mobile).length !== 10) return false;
            return true;
        };

        $scope.saveItem = function() {

            if (!$scope.isQuickRegFormValid()) {
                $scope.currentcontext.triedSubmit = true;
                $scope.refreshFormReactProps();
                return;
            }

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

            $scope.item.Email = "jssinnaah@gmail.com";
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function(resp) { //upload function returns a promise

                        if (resp.data < 0) {
                            handlePatientExists(resp.data);
                        } else {
                            $scope.currentcontext.file = null;
                            var patientId = $scope.currentcontext.id > 0 ? $scope.currentcontext.id : resp.data;
                            $scope.saveItemCallback('', patientId);
                        }
                    },
                    function(resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function(evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.clear = function() {
            $scope.item = {};
            $scope.fillDefaultValues();
            $scope.setFocusTitle();
        }

        $scope.save = function() {
            $scope.item.PatientStatus = 'Draft'
            $scope.saveItem();
        };

        $scope.saveAndApprove = function() {
            $scope.item.PatientStatus = 'Active';
            $scope.isSaveAndApprove = true;
            $scope.saveItem();
        };

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
            $scope.refreshFormReactProps();
        }

        $scope.openWebCam = function() {
            utl.Modal.open('webcam-modal', {
                params: {
                    pid: $scope.currentcontext.id
                },
                confirmCallback: webcamSuccess
            });
        }
        $scope.clearimage = function() {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        }


        $scope.PatInfoCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.PatientId = $scope.item.Id;
            $scope.item.BannerPatientId = 0;
            $scope.OpBillPrint = false;
            $timeout(function() {
                $scope.item.BannerPatientId = $scope.item.Id;
            }, 100);
            if ($scope.item.MRNTypeId == 1) { // TEMP to Active Patient
                $scope.item.IsTempPatient = true;
                $scope.item.MRN = null;
                $scope.item.OverrideDuplicate = true;
            }
            // $scope.setTempPatDefaultValue();
            $scope.getPatientProfilePic();
            var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
            $scope.item.ApproxAgeDays = ageObj.d;
            $scope.item.ApproxAgeMonths = ageObj.m;
            $scope.item.Age = ageObj.y;
            $scope.refreshFormReactProps();
        };


        $scope.patientChange = function(pageNo) {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.PatInfoCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.saveAndInactive = function() {
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

        $scope.fillGenderInfo = function() {
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function() {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
        }

        $scope.calculateDOB = function(age, substractPart) {
            var options = {
                d: $scope.item.ApproxAgeDays,
                m: $scope.item.ApproxAgeMonths,
                y: $scope.item.Age
            };

            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
            $scope.item.IsBirthDateApproximate = true;
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshFormReactProps();
            // $scope.getViewData();
            $scope.getItem();
        }

        function handlePatientExists(data) {
            var confirmOptions = {
                messageKey: 'registration.fullregistration.patient-exists-msg.lbl',
                placeholder: {
                    patientcount: (data * -1)
                },
                onSuccessMethod: function() {
                    $scope.item.OverrideDuplicate = true;
                    $scope.saveItem();
                }
            };

            utl.Dialog.confirmMessage(confirmOptions);
        }

        //Reload banner code starts
        $scope.setBannerDelegate = function(cmp) {
            $scope.bannercmp = cmp;
        };

        $scope.refreshBanner = function() {
                if ($scope.bannercmp) {
                    $scope.bannercmp.refresh();
                }
            }
            //Reload banner code ends

        $scope.portalaccess = function(item) {
            var user = {
                TitleId: $scope.item.TitleId,
                ActionFrom: utl.Formatter.getCurrentDate(),
                GenderId: $scope.item.GenderId,
                FirstName: $scope.item.FirstName,
                MiddleName: $scope.item.MiddleName,
                LastName: $scope.item.LastName,
                Age: $scope.item.Age,
                DOB: $scope.item.DOB,
                NationalityId: $scope.item.NationalityId,
                LandLine: $scope.item.LandLine,
                Email: $scope.item.Email,
                Mobile: $scope.item.Mobile,
                CityId: $scope.item.CityId,
                StateId: $scope.item.StateId,
                CountryId: $scope.item.CountryId,
                PinCodeId: $scope.item.PinCodeId,
                Area: $scope.item.Area,
                City: $scope.item.City,
                State: $scope.item.State,
                Country: $scope.item.Country,
                UserName: $scope.item.MRN,
                Password: 'password',
                IsActive: true,
                ActiveStatus: 'Active',
                FacilityId: utl.Session.getCurrentFacilityId(),
                DepartmentId: utl.Session.getCurrentDepartmentId(),
                OrgId: utl.Session.getCurrentOrgId(),
                UserTypeId: 8,
                PatientId: $scope.item.Id,
                LoginPermission: 1,
                GroupCode: 'PATIENTPORTAL'
            }; //UserType - Patient

            var options = {
                action: 'SystemSettings/User/AddUser',
                data: {
                    Data: user
                },
                type: 'post',
                onComplete: $scope.saveUserCallback
            };
            utl.Http.doAction(options);
        }

        // $scope.getViewDataCallback = function (scope, data, options, hasError) {
        //     // $scope.item = data;
        //     console.log(data);
        //     return;
        // };

        // $scope.getViewData = function () {

        //         var options = {
        //             action: 'SystemSettings/user/GetViewDetails',
        //             data: {
        //                 Id: 1
        //             },
        //             type: 'post',
        //             onComplete: $scope.getViewDataCallback
        //         };
        //         utl.Http.doAction(options);

        // };
        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Title"
                },
                {
                    "Key": "MaritalStatus"
                },
                {
                    "Key": "Religion"
                },
                {
                    "Key": "Nationality"
                },
                {
                    "Key": "Language"
                },
                {
                    "Key": "VisaType"
                },
                {
                    "Key": "VipType"
                },
                {
                    "Key": "PatientType"
                },
                // { "Key": "Pincode" },
                // { "Key": "City" },
                //{ "Key": "State" },
                // { "Key": "Country" },
                {
                    "Key": "Gender"
                },
                {
                    "Key": "MRNType",
                    "Default": false
                }
            ]
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

    quickRegistrationFormController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();
