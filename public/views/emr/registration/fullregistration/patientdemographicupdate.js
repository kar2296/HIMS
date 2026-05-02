(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientdemographicupdateFormController', patientdemographicupdateFormController);

    function patientdemographicupdateFormController($scope, $stateParams, $state, $translate, utl, Upload, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({ $scope: $scope }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2

        };
        $scope.item = {
            PatientTypeId: 1,
            tabindex: $scope.tabindexmap.detailtabindex++

        };


        $scope.canShowPatientBanner = false;
        $scope.currentcontext = {
            attachmentcount: 0,
            canDisableApprove: false,
            // Parent: $stateParams.pt,
            isTempPatient: false
        };

        //   tabindex: $scope.tabindexmap.detailtabindex++
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.id) || 0;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.currentcontext.id = parseInt($stateParams.id) || 0;
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
        $scope.item.IsMRNTypeDisable = false;
        $scope.isSaveAndApprove = false;
        $scope.isPatientDeactivated = false;

        //Visibility rules starts

        $scope.canShowApproxAge = function() {
            return $scope.lookup && $scope.lookup.Title && $scope.item.TitleId == utl.Lookup.getDefault($scope.lookup.Title, 'BABY OF');
        }

        //Visibility rules ends

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

        $scope.getpatientsCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var Patient = data.Data[0];
                // $scope.item.Title.Description = Patient.Title.Description;
                $scope.item.MRN = Patient.MRN;
                $scope.item.FirstName = Patient.FirstName;
                $scope.item.Age = Patient.Age;
                $scope.item.DOB = Patient.DOB;
                $scope.item.GenderId = Patient.GenderId;
                $scope.item.Mobile = Patient.Mobile;
                // $scope.item.Mobile = Patient.LandLine;
                $scope.item.AddressLine1 = Patient.AddressLine1;
                $scope.item.AddressLine2 = Patient.AddressLine2;
                $scope.item.PinCodeId = Patient.PinCodeId;
                $scope.item.Area = Patient.Area;
                $scope.item.StateId = Patient.StateId;
                $scope.item.CountryId = Patient.CountryId;
                $scope.item.StateId = Patient.StateId;
                $scope.item.CityId = Patient.CityId;


            }
        };

        $scope.getPatientById = function() {

            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.pid },
                ]
            };

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpatientsCallback
            };

            utl.Http.doAction(options);
        };
        // OPD Bill Popup Screen  - Start


        // OPD Bill Popup Screen  - End


        //get patient profile

        $scope.patientprofiledetails = function() {
                utl.Modal.open('registration.patientprofile', {
                    params: { pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getItem
                });
            }
            //get item
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.getPatientById();


        };


        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                //Setting patientid in fullregistrationtab for patientbanner control
                // $scope.tabvm.currentcontext.patientid = $scope.currentcontext.pid;

                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.patientsearch');
        };

        $scope.showPatientSuccessAlert = function(pid) {
            $scope.isSaveAndApprove = false;
            if ($scope.currentcontext.id == 0) {
                $state.go('app.fullregistrationtab.basic', { id: pid });
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
                data: { Id: pid },
                type: 'post',
                onComplete: $scope.getPatientItemForAlertCallback
            };
            utl.Http.doAction(options);
        };

        $scope.afterSave = function(data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    if ($scope.isSaveAndApprove) {
                        //$state.go('app.fullregistrationtab.basic', { id: options.data.Data.Id });
                        $scope.currentcontext.id = options.data.Data.Id;
                        $scope.getItem();
                    } else if ($scope.currentcontext.id == 0) {
                        $state.go('app.fullregistrationtab.basic', { id: options.data.Data.Id });
                    } else {
                        $scope.getItem();
                    }
                }
            } else if (typeof(data) == "number") {
                if ($scope.isSaveAndApprove) {
                    //$state.go('app.fullregistrationtab.basic', { id: data });
                    $scope.currentcontext.id = data;
                    $scope.getItem();
                } else if ($scope.currentcontext.id == 0) {
                    $state.go('app.fullregistrationtab.basic', { id: data });
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
                placeholder: { patientcount: (data * -1) },
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
                $scope.afterSave(data, options);
            };
            $scope.confirmCallback();

        }

        $scope.saveItem = function() {

            // if(!$scope.item_form.isValid()) {
            //     $scope.showErrorMsg($scope.i18n.registration.common.validationmsg.lbl);
            //     return;
            // }

            if (!utl.Validator.validate($scope)) {
                return;
            }



            var actionName = 'registration/patient/AddPatient';
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
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


        $scope.getPatientPatnerPidCallback = function(scope, data, options, hasError) {
            console.log(data);
            var Patient = data;
            $scope.item.PatientAssociate = Patient.FirstName + '(' + Patient.MRN +
                ')';

        };



        $scope.fillGenderInfo = function() {

            if ($scope.item.TitleId == 10) { // 10-MR
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
                params: { id: 0 },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.calculateDOB = function(age, substractPart) {
            if (substractPart == 'days') {
                $scope.item.ApproxAgeMonths = '';
                $scope.item.Age = null;
            } else if (substractPart == 'months') {
                $scope.item.ApproxAgeDays = '';
                $scope.item.Age = null;
            } else if (substractPart == 'years') {
                $scope.item.ApproxAgeDays = '';
                $scope.item.ApproxAgeMonths = '';
            }

            $scope.item.DOB = utl.Formatter.getDOBFromAge(age, substractPart);
            $scope.item.IsBirthDateApproximate = true;
        };




        $scope.recordDeathInfo = function() {
            utl.Modal.open('app.patientdeathrecordform', {
                params: { pid: $scope.currentcontext.id },
                confirmCallback: $scope.getItem
            });
        }

        //Lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getPatientById();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Title" },
                { "Key": "Gender" },
                { "Key": "GuardianType" },
                { "Key": "MaritalStatus" },
                { "Key": "Religion" },
                { "Key": "Language" },
                { "Key": "Nationality" },
                { "Key": "VisaType" },
                { "Key": "VipType" },
                { "Key": "PatientType" },
                { "Key": "BloodGroup" },
                { "Key": "Referral" },
                { "Key": "ReferralType" },
                //   { "Key": "Pincode" },
                //  { "Key": "City" },
                //  { "Key": "State" },
                //  { "Key": "Country" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
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

        $scope.initLookup();
    }

    patientdemographicupdateFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$uibModalInstance', 'modalConfig'];

})();