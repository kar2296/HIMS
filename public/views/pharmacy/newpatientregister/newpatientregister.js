(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('NewPatientRegisterController', NewPatientRegisterController);

    function NewPatientRegisterController($scope, $stateParams, $state, $translate, utl, Upload, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2

        };
        $scope.item = {
            PatientTypeId: 1,
            GuarantorId: 1,
            GuarantorTypeId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            tabindex: $scope.tabindexmap.detailtabindex++
        };
        $scope.DocDisable = false;

        $scope.canShowPatientBanner = false;
        $scope.currentcontext = {
            attachmentcount: 0,
            canDisableApprove: false,
            isTempPatient: false,
            iswebcamphoto: false,
            file: null,
            Photo: null
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.id) || 0;
            if($scope.currentcontext.pid == 0) {
                $scope.currentcontext.pid = parseInt(modalConfig.params.pid) || 0;
            }

            $scope.currentcontext.eid = parseInt(modalConfig.params.eid) || 0;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

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

        $scope.canShowApproxAge = function () {
            return $scope.lookup && $scope.lookup.Title && $scope.item.TitleId == utl.Lookup.getDefault($scope.lookup.Title, 'BABY OF');
        }

        //Visibility rules ends

        $scope.fillDefaultValues = function () {
            var currentdate = utl.Formatter.getCurrentDate();
            $scope.item.RegisteredDate = utl.Formatter.getDateStringForAppointment(currentdate);
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.EncounterTypeId = 1; //OP
        }
        if (!$scope.currentcontext.pid || $scope.currentcontext.pid == 0) {
            $scope.fillDefaultValues();
        }

        $scope.fillGenderInfo = function () {
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };
        $scope.UploadPatientPhoto = function () {
            var actionName = 'registration/patient/UpdatePatient';
            if ($scope.currentcontext.file && $scope.item.PatientId) {
                $scope.data = {};
                $scope.data.PatientId = $scope.item.PatientId;
                $scope.data.Id = $scope.item.PatientId;
                $scope.data.MRNTypeId = 2;
                $scope.data.MRN = $scope.item.MRN;
                $scope.data.PatientStatus = 'Active';
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.data,
                    }
                }).then(function (resp) { //upload function returns a promise
                    if (resp.data < 0) {
                        handlePatientExists(resp.data);
                    } else {
                        console.log('Uploaded...');
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
            }
        };
        $scope.getEncountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                // $scope.item.Title.Description = Patient.Title.Description;
                $scope.item.PatientId = encounter.Patient.Id;
                $scope.item.TitleId = encounter.Patient.TitleId;
                $scope.item.DoctorId = encounter.Patient.DoctorId;
                $scope.item.MRN = encounter.Patient.MRN;
                $scope.item.FirstName = encounter.Patient.FirstName;
                $scope.item.LastName = encounter.Patient.LastName;
                $scope.item.Age = encounter.Patient.Age;
                $scope.item.DOB = encounter.Patient.DOB;
                $scope.item.GenderId = encounter.Patient.GenderId;
                $scope.item.Mobile = encounter.Patient.Mobile;
                $scope.item.AddressLine1 = encounter.Patient.AddressLine1;
                $scope.item.AddressLine2 = encounter.Patient.AddressLine2;
                $scope.item.PinCodeId = encounter.Patient.PinCodeId;
                $scope.item.Area = encounter.Patient.Area;
                $scope.item.StateId = encounter.Patient.StateId;
                $scope.item.CountryId = encounter.Patient.CountryId;
                $scope.item.StateId = encounter.Patient.StateId;
                $scope.item.PhotoPath = encounter.Patient.PhotoPath;
                // update
                $scope.item.CityId = encounter.Patient.CityId;
            }
            $scope.getEncounterProfilePic();
        };
        $scope.getEncounters = function() {
            if ($scope.currentcontext.eid && $scope.currentcontext.eid>0){
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.eid
                    },
                ],
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncountersCallback
            }
            };

            utl.Http.doAction(options);
        };

        $scope.getpatientsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounters = data.Data[0];
                // $scope.item.Title.Description = encounters.Title.Description;
                $scope.item.PatientId = encounters.PatientId;
                $scope.item.MRN = encounters.MRN;
                $scope.item.TitleId = encounter.TitleId;
                $scope.item.DoctorId = encounter.DoctorId;
                $scope.item.FirstName = encounters.FirstName;
                $scope.item.LastName = encounter.LastName;
                $scope.item.Age = encounters.Age;
                $scope.item.DOB = encounters.DOB;
                $scope.item.GenderId = encounters.GenderId;
                $scope.item.Mobile = encounters.Mobile;
                $scope.item.AddressLine1 = encounters.AddressLine1;
                $scope.item.AddressLine2 = encounters.AddressLine2;
                $scope.item.PinCodeId = encounters.PinCodeId;
                $scope.item.Area = encounters.Area;
                $scope.item.StateId = encounters.StateId;
                $scope.item.CountryId = encounters.CountryId;
                $scope.item.StateId = encounters.StateId;
                // update
                $scope.item.CityId = encounters.CityId;
            }
        };

        $scope.getPatientById = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                }, ]
            };

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpatientsCallback
            };

            utl.Http.doAction(options);
        };
        //get patient profile

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getItem
            });
        }
        //get item
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.Encounters.length > 0) {
                $scope.item.DoctorId = data.Encounters[0].DoctorId;
            }
            $scope.DocDisable = true;
            $scope.getPatientProfilePic ();
        };

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
        }

        $scope.openWebCam = function () {
            utl.Modal.openFixedDialog('webcam-modal', {
                params: {
                    pid: $scope.item.PatientId || 0
                },
                confirmCallback: webcamSuccess
            });
        };

        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        };
        $scope.afterSave = function (data, options) {
            $scope.getItem();
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.pid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
        };
        $scope.getEncounterProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
        };
        $scope.getPatientProfilePic = function () {
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
        $scope.getEncounterProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.PatientId,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getEncounterProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback({
                // PatientId: data
            });
        }
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // if ($scope.currentcontext.pid == 0) {
            //     if (!$scope.item.DoctorId) {
            //         utl.Alert.showErrorMsg($translate.instant('Please Select Any Doctor'));
            //         return;
            //     }
            // }
            var actionName = 'registration/patient/AddPharmacyPatient';
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

        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.save = function () {
            $scope.item.PatientStatus = 'Draft'
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            $scope.item.PatientStatus = 'Active'
            $scope.isSaveAndApprove = true;
            $scope.saveItem();
        };

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
        $scope.calculateAge = function () {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
        };
        $scope.calculateDOB = function (age, substractPart) {
            var options = {
                d: $scope.item.ApproxAgeDays,
                m: $scope.item.ApproxAgeMonths,
                y: $scope.item.Age
            };
            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
            $scope.item.IsBirthDateApproximate = true;
        };
        // $scope.calculateDOB = function (age, substractPart) {
        //     if (substractPart == 'days') {
        //         $scope.item.ApproxAgeMonths = '';
        //         $scope.item.Age = null;
        //     } else if (substractPart == 'months') {
        //         $scope.item.ApproxAgeDays = '';
        //         $scope.item.Age = null;
        //     } else if (substractPart == 'years') {
        //         $scope.item.ApproxAgeDays = '';
        //         $scope.item.ApproxAgeMonths = '';
        //     }

        //     $scope.item.DOB = utl.Formatter.getDOBFromAge(age, substractPart);
        //     $scope.item.IsBirthDateApproximate = true;
        // };

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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName].join(' ');
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
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                ],
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
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.OnGuarantorSelected = function (selectedItem) {
            $scope.item.GuarantorId = selectedItem.Id;
            $scope.item.GuarantorTypeId = selectedItem.GuarantorTypeId;
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            if($scope.currentcontext.eid > 0){
                $scope.getEncounters();
            }
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Gender"
                },
                {
                    "Key": "Title"
                },
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
                    "Key": "EncounterType"
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

    NewPatientRegisterController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$uibModalInstance', 'modalConfig'];

})();