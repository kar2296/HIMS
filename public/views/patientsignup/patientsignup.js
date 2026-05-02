(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientSignupController', PatientSignupController);

    function PatientSignupController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, Upload, $cookies) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));

        $scope.item = {
            CountryId: 1,
        };
        if ($stateParams.mobile) {
            $scope.item.Mobile = $stateParams.mobile;
        }
        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.file = {};
        $scope.item.IsSelfUser = true;
        $scope.item.MRNTypeId = 2;
        $scope.item.FacilityId = 1;
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.currentcontext.file = null;
        $scope.currentcontext.Photo = null;
        $scope.item.iswebcamphoto = false;
        $scope.item.PhotoPath = null;
        $scope.clearpreviousaddress = function () {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.Area = '';
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
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
            // $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city + ' '+ area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.item.AddressLine2 = name + ' ' + address1 + ' ' + address2 + ' ' + city + ' ' + area + ' ' + state + ' ' + country + ' ' + pincode;
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
        };

        $scope.getPincodeData = function (pincode) {
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
        };

        $scope.enablegoogleaddopt = function () {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function () {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */


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
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
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
            $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city + ' ' + area + ' ' + state + ' ' + country + ' ' + pincode;
            //   $scope.item.AddressLine2 = name + ' ' + address1 + ' ' + address2 + ' ' + city + ' '+ area + ' ' + state + ' ' + country + ' ' + pincode;
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
        };

        $scope.getPincodeData = function (pincode) {
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
        };

        $scope.enablegoogleaddopt1 = function () {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function () {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */

        $scope.sameaddress = function () {
            // chkgoogleaddopt = chkgoogleaddopt;
            $scope.item.AddressLine2 = $scope.item.AddressLine1
            $scope.item.PCountryId = $scope.item.CountryId;
            $scope.item.PStateId = $scope.item.StateId;
            $scope.item.PDistrictId = $scope.item.DistrictId;
            $scope.item.PWardId = $scope.item.WardId;
            $scope.item.PCityId = $scope.item.CityId;
        };

        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };
        $scope.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }

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

        $scope.canShowApproxAge = function (vTitleId) {
            if (vTitleId && $scope.lookup) {
                for (var idx in $scope.lookup.Title) {
                    if (vTitleId == $scope.lookup.Title[idx].Id)
                        if ($scope.lookup.Title[idx].Code.toLowerCase() == "babyof")
                            return true;
                }
            }
            return false;
        };

        $scope.fillGenderInfo = function () {
            $scope.item.title = $scope.item.TitleId.Text;
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };

        $scope.SelectedTitle = function (selectedItem) {
            $scope.item.TitleId = selectedItem.Id;
            $scope.item.title = selectedItem.Text;
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

        $scope.signup = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientStatus = 'Active';
            var msg = 'Are you Sure Do you Want Register For ' + $scope.item.title + ' ' + $scope.item.FirstName;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        //logout
        $scope.logoutCallback = function (scope, res, options, hasError) {
            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k, {
                    path: '/'
                });
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

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
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

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.PatientId = $scope.item.Id;
            $scope.getPatientProfilePic();
            var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
            $scope.item.ApproxAgeDays = ageObj.d;
            $scope.item.ApproxAgeMonths = ageObj.m;
            $scope.item.Age = ageObj.y;
            if ($scope.item.Age == null) {
                $scope.item.Age = 0;
            }
            utl.Modal.openFixedDialog('self.confirmreg', {
                params: {
                    patData: $scope.item
                }
            });
            $scope.getPatientUsers(data);
        };

        $scope.getPatientUsersCallback = function (scope, data, options, hasError) {
            var UserData = data.Data[0];
            $scope.item.Passwo = UserData.Password;
        };
        $scope.getPatientUsers = function (patInfo) {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 8
                },
                {
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 23,
                    Value: patInfo.PatientId
                },

                ],
            };
            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientUsersCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getItem = function (pageNo) {
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
            }
        };

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

        $scope.afterSave = function (data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            $scope.getItem();
            $scope.logout();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (data < 0) {
                handlePatientExists(data);
            } else {
                $scope.afterSave(data, options);
            };
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.currentcontext.id = data;
            // $scope.getItem();
            // $scope.logout();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + 'registration/patient/AddSelfPatient';

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) {
                    if (resp.data < 0) {
                        handlePatientExists(resp.data);
                    } else {
                        $scope.currentcontext.file = null;
                        var patientId = $scope.currentcontext.id > 0 ? $scope.currentcontext.id : resp.data;
                        $scope.saveItemCallback('', patientId);
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
                    action: 'registration/patient/AddSelfPatient',
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

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            })
            // $scope.sgetStatelookup();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Title"
            },
            {
                "Key": "Country"
            },
            {
                "Key": "State",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.CountryId
                    }]
                }
            },
            {
                "Key": "City",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.StateId
                    }]
                }
            },
            {
                "Key": "District",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: $scope.item.CityId
                    }]
                }
            },
            {
                "Key": "Pincode",
                Request: {
                    Params: [{
                        Key: 9,
                        Value: $scope.item.DistrictId
                    }]
                }
            },
            {
                "Key": "Gender"
            },
            {
                "Key": "Nationality"
            },
            ]
            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getStatelookup = function () {
            $scope.item.StateId = -1;
            if ($scope.item.CountryId > 0) {
                var inputData = [{
                    "Key": "State",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: $scope.item.CountryId
                        }]
                    }
                },];
                $scope.getLookUp(inputData);
            }
        };

        $scope.getCitylookup = function () {
            $scope.item.CityId = -1;
            if ($scope.item.CountryId > 0 && $scope.item.StateId > 0) {
                var inputData = [{
                    "Key": "City",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: $scope.item.StateId
                        }, {
                            Key: 5,
                            Value: $scope.item.CountryId
                        },
                        {
                            Key: 3,
                            Value: $scope.item.DistrictId
                        }
                        ]
                    }
                },];
                $scope.getLookUp(inputData);
            }
        };

        $scope.getDistrictlookup = function () {
            $scope.item.DistrictId = -1;
            if ($scope.item.CountryId > 0 && $scope.item.StateId > 0) {
                var inputData = [{
                    "Key": "District",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: $scope.item.CountryId
                        }, {
                            Key: 2,
                            Value: $scope.item.StateId
                        },]
                    }
                },];
                $scope.getLookUp(inputData);
            }
        };

        $scope.getWardlookup = function () {
            $scope.item.WardId = -1;
            if ($scope.item.CountryId > 0 && $scope.item.StateId > 0) {
                var inputData = [{
                    "Key": "Pincode",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: $scope.item.CountryId
                        }, {
                            Key: 3,
                            Value: $scope.item.StateId
                        }, {
                            Key: 4,
                            Value: $scope.item.CityId
                        }, {
                            Key: 9,
                            Value: $scope.item.DistrictId
                        }]
                    }
                },];
                $scope.getLookUp(inputData);
            }
        };
        $scope.initLookup();
        $scope.enablegoogleaddopt();

    }

    PatientSignupController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$cookies'];

})();