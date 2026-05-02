(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('fullRegistrationFormController', fullRegistrationFormController);

    function fullRegistrationFormController($scope, $timeout, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.autopatientportal = 0;

        $scope.autopatientportal =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'autopatientportal');


        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        utl.Session.setObject('PatientObject', '');

        $scope.item = {};
        $scope.details = [];
        $scope.EncounterInfo = {};
        $scope.canShowBarcodeButton = false;
        $scope.CanShowDeceased = false;
        $scope.startinterval = null;

        $scope.adrsmandatory = 0;
        $scope.adrsmandatory =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'adrsmandatory');

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2

        };
        $scope.item = {
            PatientTypeId: 1,
            tabindex: $scope.tabindexmap.detailtabindex++
        };


        $scope.numberonly = function(e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.getPatientProfilePicCallback = function(scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
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


        $scope.PatInfoCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.id = $scope.item.Id;
            $scope.getPatientProfilePic();
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

        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function() {
                $scope.item.AddressLine1 = '';
                $scope.item.AddressLine2 = '';
                $scope.item.PinCodeId = -1;
                $scope.item.Area = '';
                $scope.item.WardId = -1;
                $scope.item.CityId = -1;
                $scope.item.StateId = -1;
                $scope.item.DistrictId = -1;
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

        $scope.addOccupation = function() {
            utl.Modal.open('app.occupations', {
                params: {
                    id: 0
                }
            });
        }

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function(scope, res, options, hasError) {
            if (res.Data) {
                if (res.Data.length > 0) {
                    $scope.item.PinCodeId = res.Data[0].Id;
                    $scope.item.Ward = res.Data[0].Area;
                    $scope.item.CityId = res.Data[0].CityId;
                    $scope.item.StateId = res.Data[0].StateId;
                    $scope.item.CountryId = res.Data[0].CountryId;
                    $scope.item.DistrictId = res.Data[0].DistrictId;
                }
            }
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

        $scope.canShowPatientBanner = false;
        $scope.currentcontext = {
            attachmentcount: 0,
            canDisableApprove: false,
            Parent: $stateParams.pt,
            isTempPatient: false,
            showfocus: true
        };
        // $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove')
        // $scope.currentcontext.CanSave = utl.Privilege.hasPrivilege('CanSave')
        // $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint')
        // $scope.currentcontext.CanFRDeceased = utl.Privilege.hasPrivilege('CanFRDeceased')
        // $scope.currentcontext.CanAttachment = utl.Privilege.hasPrivilege('CanAttachment')
        // $scope.currentcontext.CanFROPDBill = utl.Privilege.hasPrivilege('CanFROPDBill')
        // $scope.currentcontext.CanFRNewvisit = utl.Privilege.hasPrivilege('CanFRNewvisit')
        // $scope.currentcontext.CanDeactivate = utl.Privilege.hasPrivilege('CanDeactivate')
        // $scope.currentcontext.CanFRFindpatient = utl.Privilege.hasPrivilege('CanFRFindpatient')
        tabindex: $scope.tabindexmap.detailtabindex++

            $scope.currentcontext.id = parseInt($stateParams.id) || 0;
        $scope.patientbanner = {
            MRN: '',
            Title: '',
            FirstName: '',
            MiddleName: '',
            LastName: '',
            Age: '',
            DOB: '',
            Gender: ''
        };

        if ($scope.currentcontext.id > 0)
            $scope.currentcontext.showfocus = false;

        $scope.item.IsMRNTypeDisable = false;
        $scope.isSaveAndApprove = false;
        $scope.isPatientDeactivated = false;

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

        $scope.fillDefaultValues = function() {
            var currentdate = utl.Formatter.getCurrentDate();
            $scope.item.RegisteredDate = utl.Formatter.getDateStringForAppointment(currentdate);
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.GuardianTypeId = 27;
        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.photoFileChanged = function() {
            $scope.item.iswebcamphoto = false;
            $scope.item.webcamphoto = '';
        }
        $scope.clear = function() {
            $state.reload();
        };

        $scope.addNew = function() {
            $state.reload();
        };
        $scope.EnableOPD = false;
        $scope.Visitprint = false;
        $scope.Vitals = false;

        function vistCreated() {
            $scope.getItem();
            $scope.EnableOPD = true;
            $scope.Visitprint = true;
            $scope.Vitals = true;
        }

        $scope.visitcreate = function() {
            utl.Modal.open('app.visitcreateform', {
                params: {
                    pid: $scope.currentcontext.patientid,
                },
                confirmCallback: $scope.getItem
            });
        }

        $scope.newvisit = function() {
            if ($scope.currentcontext.id == 0) {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.register-patient-msg.lbl'));
                return;
            }

            if (!$scope.item.MRN) {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.nomrn-msg.lbl'));
                return;
            }

            utl.Modal.open('app.appointment', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.id,
                    apptstatusid: 6
                },
                confirmCallback: vistCreated
            });
        }
        $scope.vitals = function() {
                utl.Modal.open('patientemr.patientvital', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.id,
                        encounter: $scope.Encounter.Id
                    },
                    confirmCallback: $scope.getList
                });
            }
            // OPD Bill Popup Screen  - Start
        $scope.getEncounterCallback = function(scope, res, options, hasError) {
            //$scope.Encounter = res.Data[0];
            for (var idx in res.Data) {
                var item = res.Data[0];
                if (item.EncounterStatusId != 11) {
                    $scope.Encounter = item;
                    $scope.EnableOPD = true;
                    $scope.Visitprint = true;
                    $scope.Vitals = true;
                }

            }
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

        $scope.admission = function() {
            $state.go('app.admissiontab.admission', {
                pid: $scope.item.Id,
                id: 0
            });
        };

        $scope.isPatientActivated = function() {
                if ($scope.item.PatientStatusId) {
                    return $scope.item.PatientStatusId == 2;
                }
                return false;
            }
            //get patient profile
        $scope.getPatientProfilePicCallback = function(scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
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

        //get item
        $scope.getItemCallback = function(scope, data, options, hasError) {
            if (data != null) {
                var patientObj = data;
                utl.Session.setObject('PatientObject', patientObj);
            }
            $scope.item = data;
            $scope.item.iswebcamphoto = false;
            $scope.currentcontext.isTempPatient = $scope.item.MRNTypeId == 1 ? true : false;
            if (data.PatientStatusId == 2) {
                $scope.CanShowDeceased = true;
            }
            if ($scope.item.MRNTypeId == 1) { //TEMP
                $scope.item.MRNTypeId = 2;
            }

            $scope.canShowPatientBanner = true;
            //$scope.fillBannerInfo(data);
            if (data.MRNTypeId == 2 && data.PatientStatusId == 2) {
                $scope.item.IsMRNTypeDisable = true;
            }
            $scope.getEncounters(); // 
            $scope.getPatientAttachments();
            $scope.getPatientProfilePic();

            //reload banner
            if ($scope.tabvm.refreshBanner) {
                $scope.tabvm.refreshBanner();
            }

            if (data.PatientStatusId == 3) {
                $scope.CanShowDeceased = true;
                $scope.isPatientDeactivated = true;
            } else {
                $scope.isPatientDeactivated = false;
            }

            //Compute age
            var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
            $scope.item.ApproxAgeDays = ageObj.d;
            $scope.item.ApproxAgeMonths = ageObj.m;
            $scope.item.Age = ageObj.y;

            $scope.setFocusTitle();
            $scope.getPatients();

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
                console.log("test print by ");
                var uiSelect = angular.element(document.getElementById('title'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
        }

        $scope.deceased = function() {
            utl.Modal.open('app.registrarion', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.visitprint = function() {
            if ($scope.item.Encounters.length > 0) {
                for (var idx in $scope.item.Encounters) {
                    var encounters = $scope.item.Encounters[idx];
                }
                if (encounters.AppointmentId != null) {
                    var inputData = {
                        Id: encounters.AppointmentId
                    };
                    var options = {
                        action: 'appointment/Appointment/PrintAppointment',
                        data: inputData,
                        type: 'post',
                    };
                    utl.Http.doDownload(options);
                } else {
                    utl.Alert.showErrorMsg($translate.instant('No Visit'));
                }
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
            utl.Http.doDownload(options); //
            // utl.Modal.open('app.appointmentprint', {
            //         params: { id:0 },
            //         confirmCallback: $scope.getList
            // });
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
        $scope.openattachments = function() {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.currentcontext.id,
                        itemid: $scope.item.Id,
                        objecttypeid: 1
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.savepatient-msg.lbl'));
            }
        }

        $scope.getPatientAttachmentsCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }

        $scope.getPatientAttachments = function() {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.id
                }, {
                    Key: 3,
                    Value: 1
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                //Setting patientid in fullregistrationtab for patientbanner control
                $scope.currentcontext.patientid = $scope.currentcontext.id;

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

        $scope.backToList = function() {
            $state.go('app.patientsearch');
        };

        $scope.showPatientSuccessAlert = function(pid) {
            $scope.isSaveAndApprove = false;
            if ($scope.currentcontext.id == 0) {
                $state.go('app.fullregistrationtab.basic', {
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

        $scope.FamIdUpdateCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    if ($scope.isSaveAndApprove) {
                        //$state.go('app.fullregistrationtab.basic', { id: options.data.Data.Id });
                        $scope.currentcontext.id = options.data.Data.Id;
                        $scope.getItem();
                    } else if ($scope.currentcontext.id == 0) {
                        $state.go('app.fullregistrationtab.basic', {
                            id: options.data.Data.Id
                        });
                    } else {
                        $scope.getItem();
                    }
                }
            } else if (typeof(data) == "number") {
                if ($scope.isSaveAndApprove) {
                    $state.go('app.fullregistrationtab.basic', {
                        id: data
                    });
                    $scope.currentcontext.id = data;
                    $scope.getItem();
                } else if ($scope.currentcontext.id == 0) {
                    $state.go('app.fullregistrationtab.basic', {
                        id: data
                    });
                } else {
                    $scope.getItem();
                }
            } else {
                $scope.backToList(); // Safer side added
            }
        }

        $scope.FamIdUpdate = function() {
            var options = {
                action: 'registration/patient/UpdatePatientFamilyId',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.FamIdUpdateCallback
            };
            utl.Http.doAction(options);
        }
        $scope.afterSave = function(data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    if ($scope.isSaveAndApprove) {
                        //$state.go('app.fullregistrationtab.basic', { id: options.data.Data.Id });
                        $scope.currentcontext.id = options.data.Data.Id;
                        $scope.getItem();
                    } else if ($scope.currentcontext.id == 0) {
                        $state.go('app.fullregistrationtab.basic', {
                            id: options.data.Data.Id
                        });
                    } else {
                        $scope.getItem();
                    }
                }
            } else if (typeof(data) == "number") {
                if ($scope.isSaveAndApprove) {
                    $state.go('app.fullregistrationtab.basic', {
                        id: data
                    });
                    $scope.currentcontext.id = data;
                    $scope.getItem();
                } else if ($scope.currentcontext.id == 0) {
                    $state.go('app.fullregistrationtab.basic', {
                        id: data
                    });
                } else {
                    $scope.getItem();
                }
            } else {
                $scope.backToList(); // Safer side added
            }
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

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            if (data < 0) {
                handlePatientExists(data);
            } else {
                if ($scope.item.IsIvfRegistration) {
                    $scope.item.PatientId = data;
                    $scope.FamIdUpdate();
                } else {
                    $scope.afterSave(data, options);
                }
            };
        }

        $scope.saveItem = function() {

            // if(!$scope.item_form.isValid()) {
            //     $scope.showErrorMsg($scope.i18n.registration.common.validationmsg.lbl);
            //     return;
            // }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (utl.Formatter.isFutureDate($scope.item.DOB)) {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.dobdate-cant-future-msg.lbl'));
                return;
            }

            if (!$scope.item.LandLine && !$scope.item.Mobile) {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.atleast-one-contactno-msg.lbl'));
                return;
            }

            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }

            if ($scope.adrsmandatory == 1) {
                if (!$scope.item.StateId) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select State!...'));
                    return;
                }
                if (!$scope.item.CityId) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select City!...'));
                    return;
                }
                if (!$scope.item.PinCodeId) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select PinCode!...'));
                    return;
                }
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
                }).then(function(resp) { //upload function returns a promise
                        if (resp.data < 0) {
                            handlePatientExists(resp.data);
                        } else {
                            $scope.currentcontext.file = null;
                            var patientId = $scope.currentcontext.id > 0 ? $scope.currentcontext.id : resp.data;
                            $scope.afterSave(patientId);
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
            $scope.item.PatientStatus = 'Active'
            $scope.isSaveAndApprove = true;
            $scope.saveItem();
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
        $scope.printOPBill = function() {
            // if ($scope.BillInfo && $scope.BillInfo.length > 0) {
            var inputData = {
                Id: $scope.BillInfo[0].BillId
            };
            var options = {
                action: 'billing/patientbills/PrintPatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
            // }
        };

        $scope.printMRDLabel = function() {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintMRDLabel && !isNaN($scope.NoofPrintMRDLabel))
                    noofprint = parseInt($scope.NoofPrintMRDLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vEncoutnerType = '';
                try {
                    if ($scope.Patientdata && $scope.Patientdata.Title &&
                        $scope.Patientdata.Title.Description)
                        vTitle += $scope.Patientdata.Title.Description;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.FirstName)
                        vFirstName += ' ' + $scope.Patientdata.FirstName;


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.MRN)
                        vMRN = $scope.Patientdata.MRN;

                } catch (ex) {}

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q406,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S3' + printCodes.new_line;
                code += 'D7' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R111,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                if (window.clientcode.toLowerCase() == 'lotus') {
                    code += 'A546,245,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A586,164,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'B546,106,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
                } else {
                    code += 'A414,254,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A507,174,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'B437,116,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };
        $scope.patientidcard = function() {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vAppointmentDate = '';
                var vAppointmentTime = '';
                var vPhoneNumber = '';
                var vDOB = '';
                var vGender = '';
                var vDepartment = '';
                var vAssignedUserName = '';
                var vVisitType = '';
                var vAge = '';
                var vDefaultServiceTotalAmt = '';
                var vCity = '';
                var vTokenNo = '';
                // var vcurrentuser = '';
                var vUserFirstName = '';
                var vUserLastName = '';
                var vAddressLine1 = '';
                var vAddressLine2 = '';


                try {
                    if ($scope.item && $scope.item.Title &&
                        $scope.item.Title.Description)
                        vTitle += $scope.item.Title.Description;

                    if ($scope.item && $scope.item &&
                        $scope.item.FirstName)
                        vFirstName += ' ' + $scope.item.FirstName;

                    if ($scope.item && $scope.item &&
                        $scope.item.LastName)
                        vLastName += ' ' + $scope.item.LastName;

                    if ($scope.item && $scope.item &&
                        $scope.item.MRN)
                        vMRN = $scope.item.MRN;

                    if ($scope.item && $scope.item &&
                        $scope.item.Age)
                        vAge = $scope.item.Age;
                    vAge = (vAge == "") ? vAge = ((typeof $scope.item.ApproxAgeMonths != "undefined") ? $scope.item.ApproxAgeMonths + "M " : "0M ") + $scope.item.ApproxAgeDays + "D" : vAge + "Y";
                    if ($scope.item && $scope.item &&
                        $scope.item.Gender.Description)
                        vGender += $scope.item.Gender.Description;

                    if ($scope.item && $scope.item &&
                        $scope.item.Mobile)
                        vPhoneNumber = $scope.item.Mobile;
                    if ($scope.item && $scope.item &&
                        $scope.item.Age)
                        vAge = $scope.item.Age;

                    if ($scope.item && $scope.item &&
                        $scope.item.City)
                        vCity = $scope.item.City;

                    if ($scope.item && $scope.item &&
                        $scope.item.DOB)
                        vDOB = $scope.item.DOB;
                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.AppointmentDate)
                        vAppointmentDate = $scope.Appointment.AppointmentDate;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.Department.DepartmentName)
                        vDepartment = $scope.Appointment.Department.DepartmentName;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.Department.DepartmentName)
                        vAssignedUserName = $scope.Appointment.AssignedUserName;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.VisitType.Description)
                        vVisitType = $scope.Appointment.VisitType.Description;
                    if ($scope.currentcontext && $scope.currentcontext.TokenNo &&
                        $scope.currentcontext.TokenNo)
                        vTokenNo = $scope.currentcontext.TokenNo;
                    if ($scope.Appointment.UpdatedByUser && $scope.Appointment.UpdatedByUser.FirstName &&
                        $scope.Appointment.UpdatedByUser.FirstName)
                        vUserFirstName = $scope.Appointment.UpdatedByUser.FirstName;
                    if ($scope.Appointment.UpdatedByUser && $scope.Appointment.UpdatedByUser.LastName &&
                        $scope.Appointment.UpdatedByUser.LastName)
                        vUserLastName = $scope.Appointment.UpdatedByUser.LastName;
                    if ($scope.DefaultServiceInfo && $scope.DefaultServiceInfo &&
                        $scope.DefaultServiceInfo[0].Amount)
                        vDefaultServiceTotalAmt = $scope.DefaultServiceInfo[0].Amount;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.AppointmentDate)
                        vAppointmentTime = $scope.Appointment.StartTime;

                    if ($scope.item && $scope.item &&
                        $scope.item.AddressLine1)
                        vAddressLine1 = $scope.item.AddressLine1;
                    if ($scope.item && $scope.item &&
                        $scope.item.AddressLine2)
                        vAddressLine2 = $scope.item.AddressLine2;


                    var dateString = vAppointmentTime.toString();
                    common.approveaction.lbl = dateString.substring(10, 0);
                } catch (ex) {}

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.clientcode.toLowerCase() == 'prakriya') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' Pat.Name :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + ' Gender/ Age  :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Visit Date :' + ' ' + vAppointmentDate + ' /  ' + vAppointmentTime + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;
                    //  $scope.printRaw(printData);
                    code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                } else if (window.clientcode.toLowerCase() == 'eechh') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' Pat.Name :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + ' Gender/ Age  :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Visit Date :' + ' ' + vAppointmentDate + ' /  ' + vAppointmentTime + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;
                    // $scope.printRaw(printData);
                    code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                } else if (window.clientcode.toLowerCase() == 'swostha') {
                    code += 'CT~~CD,~CC^~CT~' + printCodes.new_line;
                    code += '^XA' + printCodes.new_line;
                    code += '~TA000' + printCodes.new_line;
                    code += '~JSN' + printCodes.new_line;
                    code += '^LT0' + printCodes.new_line;
                    code += '^MNW' + printCodes.new_line;
                    code += '^MTT' + printCodes.new_line;
                    code += '^PON' + printCodes.new_line;
                    code += '^PMN' + printCodes.new_line;
                    code += '^LH0,0' + printCodes.new_line;
                    code += '^JMA' + printCodes.new_line;
                    code += '^PR8,8' + printCodes.new_line;
                    code += '~SD15' + printCodes.new_line;
                    code += '^JUS' + printCodes.new_line;
                    code += '^LRN' + printCodes.new_line;
                    code += '^CI27' + printCodes.new_line;
                    code += '^PA0,1,0,0' + printCodes.new_line;
                    code += '^XZ' + printCodes.new_line;
                    code += '^XA' + printCodes.new_line;
                    code += '^MMT' + printCodes.new_line;
                    code += '^PW895' + printCodes.new_line;
                    code += '^LL406' + printCodes.new_line;
                    code += '^LS0' + printCodes.new_line;
                    code += '^FT504,49^A0N,28,20^FH\^CI28^FDDate/Time^FS^CI27' + printCodes.new_line;
                    code += '^FT42,49^A0N,28,28^FH\^CI28^FD' + vDepartment + '^FS^CI27' + printCodes.new_line;
                    code += '^FT608,49^A0N,28,28^FH\^CI28^FD' + vAppointmentDate + '^FS^CI27' + printCodes.new_line;
                    code += '^FT42,98^A0N,28,28^FH\^CI28^FD' + vAssignedUserName + '^FS^CI27' + printCodes.new_line;
                    code += '^FT249,146^A0N,28,28^FH\^CI28^FD' + vMRN + '^FS^CI27' + printCodes.new_line;
                    code += '^FT42,146^A0N,28,28^FH\^CI28^FDHospital.No^FS^CI27' + printCodes.new_line;
                    code += '^FT543,146^A0N,28,23^FH\^CI28^FDQueue No^FS^CI27' + printCodes.new_line;
                    code += '^FT659,146^A0N,28,28^FH\^CI28^FD' + vTokenNo + '^FS^CI27' + printCodes.new_line;
                    code += '^FT42,189^A0N,28,30^FH\^CI28^FDPatient Name^FS^CI27' + printCodes.new_line;
                    code += '^FT249,189^A0N,28,28^FH\^CI28^FD' + vTitle + ' ' + vFirstName + ' ' + vLastName + '^FS^CI27' + printCodes.new_line;
                    code += '^FT42,230^A0N,28,28^FH\^CI28^FDAge / Sex^FS^CI27' + printCodes.new_line;
                    code += '^FT249,230^A0N,28,28^FH\^CI28^FD' + vAge + ' Y ' + ' / ' + vGender + '^FS^CI27' + printCodes.new_line;
                    code += '^FT229,146^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT229,189^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT229,230^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT42,274^A0N,28,28^FH\^CI28^FDAddress^FS^CI27' + printCodes.new_line;
                    code += '^FT249,274^A0N,28,28^FH\^CI28^FD' + vAddressLine1 + ' / ' + vAddressLine2 + '^FS^CI27' + printCodes.new_line;
                    code += '^FT229,274^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT558,230^A0N,28,28^FH\^CI28^FD' + vVisitType + '^FS^CI27' + printCodes.new_line;
                    code += '^FT42,315^A0N,28,28^FH\^CI28^FDUser^FS^CI27' + printCodes.new_line;
                    code += '^FT249,315^A0N,28,28^FH\^CI28^FD' + vUserFirstName + vUserLastName + '^FS^CI27' + printCodes.new_line;
                    code += '^FT229,315^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT558,315^A0N,28,28^FH\^CI28^FDChrg : Rs.' + vDefaultServiceTotalAmt + '^FS^CI27' + printCodes.new_line;
                    code += '^FT42,354^A0N,28,28^FH\^CI28^FDPhone No^FS^CI27' + printCodes.new_line;
                    code += '^FT249,354^A0N,28,28^FH\^CI28^FD' + vPhoneNumber + '^FS^CI27' + printCodes.new_line;
                    code += '^FT229,354^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^BY3,3,53^FT526,379^BCN,,N,N' + printCodes.new_line;
                    code += '^FH\^FD>;,' + vMRN + '^FS' + printCodes.new_line;
                    code += '^FT636,146^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT591,49^A0N,28,58^FH\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += noofprint > 1 ? '^PQ' + noofprint + ',,,Y ' + printCodes.new_line : '^PQ1,,,Y' + printCodes.new_line;
                    code += '^XZ' + printCodes.new_line;

                } else if (window.clientcode.toLowerCase() == 'nkhospital') {
                    code += 'SIZE 74.10 mm, 38 mm' + printCodes.new_line;
                    code += 'DIRECTION 0,0' + printCodes.new_line;
                    code += 'REFERENCE 0,0' + printCodes.new_line;
                    code += 'OFFSET 0 mm' + printCodes.new_line;
                    code += 'REFERENCE 0,0' + printCodes.new_line;
                    code += 'OFFSET 0 mm' + printCodes.new_line;
                    code += 'SET PEEL OFF' + printCodes.new_line;
                    code += 'SET CUTTER OFF' + printCodes.new_line;
                    code += 'SET PARTIAL_CUTTER OFF' + printCodes.new_line;
                    code += 'SET TEAR ON' + printCodes.new_line;
                    code += 'CLS' + printCodes.new_line;
                    code += 'CODEPAGE 1252' + printCodes.new_line;
                    code += 'TEXT 565,286,"ROMAN.TTF",180,13,10,"UHID :"' + printCodes.new_line;
                    code += 'TEXT 485,287,"ROMAN.TTF",180,13,10,"' + vMRN + '"' + printCodes.new_line;
                    // code += 'TEXT 565,254,"0",180,13,10,"OP. NO :"' + printCodes.new_line;
                    // code += 'TEXT 445,254,"0",180,13,10,"' + vTokenNo + '"' + printCodes.new_line;
                    code += 'TEXT 565,218,"0",180,13,10,"Pat. Name :"' + printCodes.new_line;
                    code += 'TEXT 386,221,"0",180,13,10,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    // code += 'TEXT 565,187,"0",180,13,10,"Consultant :"' + printCodes.new_line;
                    // code += 'TEXT 372,188,"0",180,13,10,"' + vDoctorName1 + ' ' + vDoctorName2 + '"' + printCodes.new_line;
                    code += 'TEXT 565,147,"0",180,13,10,"Gender/ Age :"' + printCodes.new_line;
                    code += 'TEXT 360,145,"0",180,13,10,"' + vGender + '"' + printCodes.new_line;
                    code += 'TEXT 236,145,"0",180,13,10,"' + vAge + "Y" + '"' + printCodes.new_line;
                    code += 'TEXT 559,112,"ROMAN.TTF",180,13,10,"Vist. Date :"' + printCodes.new_line;
                    code += 'TEXT 379,112,"0",180,13,10,"' + vAppointmentDate + '"' + printCodes.new_line;
                    code += 'BAR 477,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 468,54, 5, 30' + printCodes.new_line;

                    code += 'BAR 462,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 456,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 447,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 432,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 426,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 411,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 402,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 396,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 390,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 384,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 372,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 360,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 354,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 348,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 333,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 324,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 318,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 312,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 294,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 288,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 282,54, 5, 30' + printCodes.new_line;

                    code += 'BAR 273,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 267,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 252,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 246,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 237,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 228,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 216,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 210,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 201,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 189,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 180,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 174,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 165,54, 5, 30' + printCodes.new_line;

                    code += 'BAR 150,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 144,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 138,54, 5, 30' + printCodes.new_line;

                    code += 'TEXT 376,49,"ROMAN.TTF",180,1,10,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 256,145,"0",180,17,6,"/"' + printCodes.new_line;

                    //    $scope.printRaw(printData);
                    code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                } else {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' Pat.Name :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + ' Gender/ Age  :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Visit Date :' + ' ' + vAppointmentDate + ' /  ' + vAppointmentTime + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;
                    // $scope.printRaw(printData);
                    code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                }

                //console.log('**********',code);

                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };

        $scope.printPatientLabel = function() {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vEncoutnerType = '';
                var vAddress = '';
                var vRegisteredDate = '';
                var vPhoneNumber = '';
                var vGender = '';
                var vDoctor = '';
                var vDOB = '';
                var vArea = '';
                var vCityTownName = '';
                var vGender = '';
                var vAddressLine1 = '';
                var vAddressLine2 = '';
                var vAge = '';
                var vPincode = '';
                try {
                    if ($scope.Patientdata && $scope.Patientdata.Title &&
                        $scope.Patientdata.Title.Description)
                        vTitle += $scope.Patientdata.Title.Description;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.FirstName)
                        vFirstName += ' ' + $scope.Patientdata.FirstName;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.LastName)
                        vLastName += ' ' + $scope.Patientdata.LastName;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.MRN)
                        vMRN = $scope.Patientdata.MRN;


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.DOB)
                        vDOB = $scope.Patientdata.DOB;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.RegisteredDate)
                        vRegisteredDate = $scope.Patientdata.RegisteredDate;
                    var dateString = vRegisteredDate.toString();
                    vRegisteredDate = dateString.substring(10, 0);

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Age)
                        vAge = $scope.Patientdata.Age;
                    vAge = (vAge == "") ? vAge = ((typeof $scope.Patientdata.ApproxAgeMonths != "undefined") ? $scope.Patientdata.ApproxAgeMonths + "M " : "0M ") + $scope.Patientdata.ApproxAgeDays + "D" : vAge + "Y";


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Mobile)
                        vPhoneNumber = $scope.Patientdata.Mobile;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Gender.Description)
                        vGender = $scope.Patientdata.Gender.Description;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Area)
                        vArea = $scope.Patientdata.Area;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.AddressLine1)
                        vAddressLine1 = $scope.Patientdata.AddressLine1;


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.AddressLine2)
                        vAddressLine2 = $scope.Patientdata.AddressLine2;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.City)
                        vCityTownName = $scope.Patientdata.City;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Encounters[0].DoctorName)
                        vDoctor = $scope.Patientdata.Encounters[0].DoctorName;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Age)
                        vAge = $scope.Patientdata.Age;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Pincode)
                        vPincode = $scope.Patientdata.Pincode;


                } catch (ex) {}

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.clientcode.toLowerCase() == 'lotus') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A305,256,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    code += 'A186,256,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A620,193,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A530,193,2,4,1,1,N,"' + ' :' + ' ' + vAddressLine1 + ',' + vAddressLine2 + '"' + printCodes.new_line;
                    code += 'A620,163,2,4,1,1,N,"' + ' ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + '  ' + vArea + ',' + vCityTownName + '"' + printCodes.new_line;
                    code += 'A620,133,2,4,1,1,N,"' + 'Phone' + '"' + printCodes.new_line;
                    code += 'A530,133,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'A305,133,2,4,1,1,N,"' + 'Gender' + '"' + printCodes.new_line;
                    code += 'A186,133,2,4,1,1,N,"' + ':' + ' ' + vGender + '"' + printCodes.new_line;
                    code += 'A90,133,2,4,1,1,N,"' + '/' + ' ' + vAge + '"' + printCodes.new_line;
                    code += 'A620,98,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
                    code += 'A530,98,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
                    //code += 'A624,65,2,4,1,1,N,"' + 'DOB' + '"' + printCodes.new_line;
                    //code += 'A570,65,2,4,1,1,N,"' + ':' + ' ' + vDOB + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                } else if (window.clientcode.toLowerCase() == 'sundaram') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                    code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A420,225,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A600,197,2,4,1,1,N,"' + 'DOB / Gender' + '"' + printCodes.new_line;
                    code += 'A420,197,2,4,1,1,N,"' + ':' + ' ' + vDOB + ' / ' + vGender + '"' + printCodes.new_line;
                    code += 'A600,169,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
                    code += 'A600,140,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
                    code += 'A420,140,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    //code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    //code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A600,113,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
                    code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
                    code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                } else {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                    code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A420,226,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A600,197,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A420,198,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
                    code += 'A600,169,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
                    code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A600,113,2,4,1,1,N,"' + 'Gender/Age' + '"' + printCodes.new_line;
                    code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vGender + ' /' + vAge + ' /' + vDOB + '"' + printCodes.new_line;
                    code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;


                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };

        // $scope.idcard = function (selectedPatient) {
        //             utl.Modal.open('registration.patientprofile', {
        //                 params: { pid: selectedPatient.Id },
        //                 confirmCallback: $scope.getList
        //             });
        //         };
        $scope.idcard = function() {
            $state.go('app.regpatientidcard', {
                id: $scope.item.PatientId,
                // confirmCallback: $scope.getList
            });
        }

        // $scope.PatInfoCallback = function (scope, data, options, hasError) {
        //     $scope.selectedPatient = data;
        // }

        $scope.printRegistration = function() {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: {
                    EncounterId: $scope.item.EncounterId
                }
            };
            var options = {
                action: 'registration/Patient/PrintPatientWithEncounter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printRegistrationIdlabel = function() {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.patientPickerCallback = function(data) {
            // var Patient = data.pid;
            // $scope.item.PatientAssociateId = Patient.FirstName

            var options = {
                action: 'registration/patient/GetPatientById',
                data: {
                    Id: data.pid
                },
                type: 'post',
                onComplete: $scope.getPatientPatnerPidCallback
            };
            utl.Http.doAction(options);


        }

        $scope.getPatientPatnerPidCallback = function(scope, data, options, hasError) {
            console.log(data);
            var Patient = data;
            $scope.item.PatientAssociate = Patient.FirstName + '(' + Patient.MRN +
                ')';

        };


        $scope.findPatient = function() {
            utl.Modal.open('app.patientpicker', {
                params: {},
                confirmCallback: $scope.patientPickerCallback
            });
        }
        $scope.fillGenderInfo = function() {

            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function() {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
            $scope.item.IsBirthDateApproximate = false;
        }

        $scope.addReferral = function() {
            utl.Modal.open('app.referraltab.details', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.calculateDOB = function(age, substractPart) {
            var options = {
                d: $scope.item.ApproxAgeDays,
                m: $scope.item.ApproxAgeMonths,
                y: $scope.item.Age
            };
            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.IsBirthDateApproximate = true;
        };

        $scope.referralTypeChangeCallback = function(scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        };

        $scope.referralTypeChange = function() {
            var inputData = [{
                Key: "Referral",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: $scope.item.ReferTypeId
                    }]
                }
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.referralTypeChangeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.referralChange = function() {
            var refObj = utl.Lookup.getObject($scope.lookup.Referral, $scope.item.ReferrerId);
            $scope.item.ReferTypeId = refObj.ReferralTypeId;
        };

        $scope.recordDeathInfo = function() {
            utl.Modal.open('app.patientdeathrecordform', {
                params: {
                    pid: $scope.currentcontext.id
                },
                confirmCallback: $scope.getItem
            });
        }

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
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
            //autosearch related code starts for Occupation
        vm.occupationcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Occupation Id',
                    field: 'OccupationId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Occupation Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Occupations',
                    field: 'Occupations',
                    datatype: 'string',
                    headercls: 'td-Occupations',
                    fieldcls: 'td-Occupations'
                },
                {
                    header: 'Type',
                    field: 'OccupationType',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/Occupation/GetOccupations',
            formatdisplay: formatselectedoccupation,
            presearch: presearchoccupation,
            postsearch: postsearchoccupation
        };

        function formatselectedoccupation() {
            var selectedItem = vm.occupationcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Occupations + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.occupationcontrolconfig.rowdata) {
                result = [vm.occupationcontrolconfig.rowdata.OccupationId, vm.occupationcontrolconfig.rowdata.Code].join(' ');
            }
            // $scope.item.DoctorName = result;

            return result;
        }

        function presearchoccupation() {
            var query = vm.occupationcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.occupationcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.occupationcontrolconfig.searchparams = inputData;
        }

        function postsearchoccupation() {
            for (var idx in vm.occupationcontrolconfig.result) {
                var item = vm.occupationcontrolconfig.result[idx];
                item.OccupationId = item.Id;
                item.Code = item.Code;
                item.Occupations = item.Occupations;
                item.OccupationType = item.OccupationType.Description;
            }
        }
        //autosearch related code ends for Occupation
        $scope.getPatientInfoCallback = function(scope, res, options, hasError) {
            $scope.Patientdata = res.Data[0];
        };

        $scope.getPatients = function() {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientInfoCallback
            };

            utl.Http.doAction(options);
        };
        $scope.generatebarcode = function() {

            var vTitle = '';
            var vFirstName = '';
            var vLastName = '';
            var vMRN = '';
            var vEncoutnerType = '';
            try {
                if ($scope.Patientdata && $scope.Patientdata.Title &&
                    $scope.Patientdata.Title.Description)
                    vTitle += $scope.Patientdata.Title.Description;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.FirstName)
                    vFirstName += ' ' + $scope.Patientdata.FirstName;


                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.MRN)
                    vMRN = $scope.Patientdata.MRN;

                // if ($scope.Patientdata && $scope.Patientdata.EncounterType
                //     && $scope.Patientdata.Patientdata.Description)
                //     vEncoutnerType = $scope.Patientdata.EncounterType.Description;


            } catch (ex) {}

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
            code += 'I8,A,001' + printCodes.new_line;
            code += 'Q406,024' + printCodes.new_line;
            code += 'q831' + printCodes.new_line;
            code += 'rN' + printCodes.new_line;
            code += 'S3' + printCodes.new_line;
            code += 'D7' + printCodes.new_line;
            code += 'ZT' + printCodes.new_line;
            code += 'JF' + printCodes.new_line;
            code += 'O' + printCodes.new_line;
            code += 'R111,0' + printCodes.new_line;
            code += 'f100' + printCodes.new_line;
            code += 'N' + printCodes.new_line;
            code += 'A604,254,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
            code += 'A607,174,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
            code += 'B607,116,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
            code += 'P1' + printCodes.new_line;
            printData.push(code);
            $scope.printRaw(printData);

        };
        $scope.generatepatientbarcode = function() {
            var vTitle = '';
            var vFirstName = '';
            var vLastName = '';
            var vMRN = '';
            var vEncoutnerType = '';
            var vAddress = '';
            var vRegisteredDate = '';
            var vPhoneNumber = '';
            var vGender = '';
            var vDoctor = '';
            var vDOB = '';
            var vArea = '';
            var vCityTownName = '';
            var vGender = '';


            try {
                if ($scope.Patientdata && $scope.Patientdata.Title &&
                    $scope.Patientdata.Title.Description)
                    vTitle += $scope.Patientdata.Title.Description;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.FirstName)
                    vFirstName += ' ' + $scope.Patientdata.FirstName;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.LastName)
                    vLastName += ' ' + $scope.Patientdata.LastName;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.MRN)
                    vMRN = $scope.Patientdata.MRN;


                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.DOB)
                    vDOB = $scope.Patientdata.DOB;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.RegisteredDate)
                    vRegisteredDate = utl.Formatter.getDateTimeString($scope.Patientdata.RegisteredDate);

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.Mobile)
                    vPhoneNumber = $scope.Patientdata.Mobile;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.Gender.Description)
                    vGender = $scope.Patientdata.Gender.Description;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.Area)
                    vArea = $scope.Patientdata.Area;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.City)
                    vCityTownName = $scope.Patientdata.City;

                if ($scope.Patientdata && $scope.Patientdata &&
                    $scope.Patientdata.Age)
                    vDoctor = $scope.Patientdata.Age;


            } catch (ex) {}

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };

            if (window.clientcode.toLowerCase() == 'orthomed') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q731' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S3' + printCodes.new_line;
                code += 'D7' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R270,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'A399,220,2,4,1,1,N,"' + 'MRN.No' + '"' + printCodes.new_line;
                code += 'A266,220,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                code += 'A399,190,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                code += 'A266,190,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + vLastName + '"' + printCodes.new_line;
                //code += 'A399,150,2,4,1,1,N,"' + 'Mobile' + '"' + printCodes.new_line;
                //code += 'A265,150,2,4,1,1,N,"' +':'+' '+ vPhoneNumber + '"' + printCodes.new_line;
                code += 'A399,160,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                code += 'A265,160,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                code += 'A399,130,2,4,1,1,N,"' + 'Gen./Age' + '"' + printCodes.new_line;
                code += 'A266,130,2,4,1,1,N,"' + ':' + ' ' + vGender + ' /' + vDoctor + '"' + printCodes.new_line;
                code += 'B397,100,2,1,3,9,49,B,"' + vMRN + '"' + printCodes.new_line;
                code += 'P1' + printCodes.new_line;
            } else {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q406,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S3' + printCodes.new_line;
                code += 'D7' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R111,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'A582,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                code += 'A492,255,2,4,1,1,N,"' + '  :' + ' ' + vMRN + '"' + printCodes.new_line;
                code += 'A582,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                code += 'A479,226,2,4,1,1,N,"' + ' :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                code += 'A583,197,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                code += 'A456,198,2,4,1,1,N,"' + ':' + ' ' + vArea + '"' + printCodes.new_line;
                code += 'A581,169,2,4,1,1,N,"' + 'Phone#' + '"' + printCodes.new_line;
                code += 'A468,169,2,4,1,1,N,"' + ' :' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                code += 'A580,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                code += 'A453,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                code += 'A580,113,2,4,1,1,N,"' + 'Gender/Age' + '"' + printCodes.new_line;
                code += 'A453,113,2,4,1,1,N,"' + ':' + ' ' + vGender + ' /' + vDoctor + '"' + printCodes.new_line;
                code += 'B415,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                code += 'P1' + printCodes.new_line;
            }

            printData.push(code);
            //console.log(printData);
            $scope.printRaw(printData);
        };

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

        //Lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var facilitydata = $scope.lookup.Facility;
            for (var idx in facilitydata) {
                if (facilitydata[idx].Id > 0) {
                    $scope.item.CityId = facilitydata[idx].CityId;
                    $scope.item.StateId = facilitydata[idx].StateId;
                    $scope.item.DistrictId = facilitydata[idx].DistrictId;
                    $scope.item.CountryId = facilitydata[idx].CountryId;
                }
            }
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Title"
                },
                {
                    "Key": "Gender"
                },
                {
                    "Key": "GuardianType"
                },
                {
                    "Key": "MaritalStatus"
                },
                {
                    "Key": "Religion"
                },
                {
                    "Key": "Language"
                },
                {
                    "Key": "Nationality"
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
                {
                    "Key": "BloodGroup"
                },
                {
                    "Key": "Referral"
                },
                {
                    "Key": "ReferralType"
                },
                // { "Key": "Pincode" },
                //  { "Key": "City" },
                // { "Key": "State" },
                // { "Key": "Country" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 3
                        }, {
                            Key: 5,
                            Value: 2
                        }],

                    }
                },
                {
                    "Key": "MRNType",
                    "Default": false
                },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentFacilityId()
                        }]
                    }
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

        $scope.initLookup();
    }

    fullRegistrationFormController.$inject = ['$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();