(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FeedbackOtpVerifyController',FeedbackOtpVerifyController);

    function FeedbackOtpVerifyController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, Upload, $cookies) {
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
        $scope.currentfilter = {
            FacilityId: 1,
            FeedbackTypeId: -1,
            FeedbackCategoryId: -1,
            ActiveStatusId: 2
        };


        $scope.item = {
            CountryId: 1

        };
        $scope.lookup = {};
        $scope.currentcontext = {};

        $scope.currentcontext.isnew = $stateParams.isnew;

        $scope.CanShowVerifyOtp = false;
        //logout
        // $scope.logoutCallback = function (scope, res, options, hasError) {
        //     var cookies = $cookies.getAll();
        //     angular.forEach(cookies, function (v, k) {
        //         $cookies.remove(k, {
        //             path: '/'
        //         });
        //     });
        //     $state.go('page.login');
        // };
        // $scope.logout = function () {
        //     var options = {
        //         action: 'auth/logout',
        //         data: null,
        //         type: 'post',
        //         onComplete: $scope.logoutCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.SelectedCountry = function (selectedItem) {
            $scope.item.CountryCode = selectedItem.CountryCode;
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('Mobile No Already Exists'));
            }
        };

        $scope.afterSave = function (data, options) {
            utl.Alert.showSuccessMsg($translate.instant('OTP Sended Your Mobile Phone'));
            console.log('otp is', data.Otp)
            $scope.CanShowVerifyOtp = true;
            $scope.item.Id = data.Id;
            $scope.item.Otp = data.Otp;
        };

        function handleExistData(data) {
            var confirmOptions = {
                messageKey: 'Mobile No Already Exists! Do You Want to Continue?',
                placeholder: {
                    patientcount: (data * -1)
                },
                onSuccessMethod: function () {
                    $scope.item.OverrideDuplicate = true;
                    $scope.sendotp();
                }
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.sendotpCallback = function (scope, data, options, hasError) {
            if (data < 0) {
                handleExistData(data);
            } else {
                $scope.afterSave(data, options);
            };
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.currentcontext.id = data;
            // $scope.getItem();
            // $scope.logout();
        };

        $scope.sendotp = function () {
            // params: {
            //     pid: $scope.item.PatientId,
            //     eid: $scope.item.EncounterId
            // },
            $scope.getUsers();
            // if ($scope.currentcontext.isnew == true) {

            var options = {
                action: 'SystemSettings/OtpVerify/AddOtpVerify',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.sendotpCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
            // }
            // if ($scope.currentcontext.isnew == false) {
            //     $scope.getUsers()
            // };
        };


        // $scope.getPrevList = function () {
        //     var inputData = {
        //         Params: [{
        //             Key: 1,
        //             Value: $scope.item.Mobile
        //         }, ],
        //     };
        //     var options = {
        //         action: 'SystemSettings/OtpVerify/GetOtpVerifys',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getPrevListCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        // $scope.getPrevListCallback = function (scope, data, options, hasError) {
        //     if (data.Data.length == 0) {
        //         utl.Alert.showErrorMsg($translate.instant('Mobile No is not registered'));
        //     } else {
        //         var otpdata = data.Data[0];
        //         $scope.item.Id = otpdata.Id;
        //         $scope.getForgotOtp();
        //     }
        // };

        $scope.getForgotOtpCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('OTP Sended Your Mobile Phone'));
            console.log('otp is', data.ForgotOtp)
            $scope.CanShowVerifyOtp = true;
            $scope.item.Id = data.Id;
            $scope.item.ForgotOtp = data.ForgotOtp;
        };

        $scope.getForgotOtp = function () {
            var options = {
                action: 'SystemSettings/OtpVerify/SendForgotOtpVerify',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.getForgotOtpCallback
            };
            utl.Http.doAction(options);
        };

        $scope.verifyotpCallback = function (scope, data, options, hasError) {
            if (data.IsOtpVerified == true) {
                utl.Alert.showSuccessMsg($translate.instant('OTP Verified'));
                $state.go('app.verifiedpatientfeedbacks', {
                    mobile: $scope.item.Mobile,
                    countryid: $scope.item.CountryId,
                    id: $scope.item.PatientId,

                })
            } else {
                utl.Alert.showErrorMsg($translate.instant('Invalid OTP'));
            }
        };

        $scope.forgotverifyotpCallback = function (scope, data, options, hasError) {
            if (data.IsForgotOtpVerified == true) {
                utl.Alert.showSuccessMsg($translate.instant('OTP Verified'));
                $state.go('self.verifypasswordchange', {
                    mobile: $scope.item.Mobile
                })
            } else {
                utl.Alert.showErrorMsg($translate.instant('Invalid OTP'));
            }
        };

        $scope.getVerifiedusersCallback = function (scope, data, options, hasError) {
            if (data.Data.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Mobile No is not registered'));
            } else {
                var UserData = data.Data[0];
                $scope.item.UserId = UserData.Id;
                $scope.item.PatientId = UserData.PatientId;
                $state.go('app.verifiedpatientfeedbacks', {
                    mobile: $scope.item.Mobile,
                    countryid: $scope.item.CountryId,
                    id: $scope.item.PatientId,

                })
                // $scope.item.OldPassword = UserData.Password;
                // $scope.getPrevList();
            }
        };
        $scope.backToList = function () {
            $state.go('app.patient-feedback');
            
        }
        $scope.home = function () { 
            $state.go('app.patient-feedback');
            
        }

        $scope.getVerifiedusers = function () {
            var inputData = {
                Params: [{
                    Key: 26,
                    Value: $scope.item.Mobile
                }],
            };
            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVerifiedusersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.verifyotp = function () {
            // if ($scope.currentcontext.isnew == true) {
            if (!$scope.item.Inputotp) {
                utl.Alert.showErrorMsg($translate.instant('Enter Your OTP'));
                return;
            }
            var options = {
                action: 'SystemSettings/OtpVerify/UpdateOtpVerify',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.getVerifiedusers
            };
            utl.Http.doAction(options);
            // }
            if ($scope.currentcontext.isnew == false) {
                $scope.item.IsNew = $scope.currentcontext.isnew;
                if (!$scope.item.Inputotp) {
                    utl.Alert.showErrorMsg($translate.instant('Enter Your OTP'));
                    return;
                }
                var options = {
                    action: 'SystemSettings/OtpVerify/UpdateForgotOtpVerify',
                    data: {
                        Data: $scope.item
                    },
                    type: 'post',
                    onComplete: $scope.forgotverifyotpCallback
                };
                utl.Http.doAction(options);
            }
        };
            $scope.PatInfoCallback = function (scope, data, options, hasError) {
                $scope.selectedPatient = data;
                if ($scope.selectedPatient.Title) {
                    $scope.item.Title = $scope.selectedPatient.Title.Description;
                }
                $scope.item.PatientId = $scope.selectedPatient.Id;
                $scope.item.FirstName = $scope.selectedPatient.FirstName;
                $scope.item.LastName = $scope.selectedPatient.LastName;
                $scope.item.Age = $scope.selectedPatient.Age;
                $scope.item.DOB = $scope.selectedPatient.DOB;
                $scope.item.Mobile = $scope.selectedPatient.Mobile;
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
                if ($scope.selectedPatient.Gender) {
                    $scope.item.Gender = $scope.selectedPatient.Gender.Description;
                }
                if ($scope.selectedPatient.Encounters) {
                    if ($scope.selectedPatient.Encounters.length > 0) {
                        for (var idxencounter in $scope.selectedPatient.Encounters) {
                            var encounters = $scope.selectedPatient.Encounters[idxencounter];
                            $scope.item.EncounterId = encounters.Id;
                        }
                    }
                }
                $scope.getPatientProfilePic();
            };
            $scope.patientChange = function (pageNo) {
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


            $timeout(function () {
                removeFloatingNav();
            }, 100);

            function removeFloatingNav() {
                $rootScope.app.layout.isCollapsed = true;
            };
            $scope.getUsersCallback = function (scope, data, options, hasError) {
                if (data.Data.length == 0) {
                    utl.Alert.showErrorMsg($translate.instant('Mobile No is not registered'));
                } else {
                    var UserData = data.Data[0];
                    $scope.item.UserId = UserData.Id;

                    // $scope.item.OldPassword = UserData.Password;
                    // $scope.getPrevList();
                }
            };

            $scope.getUsers = function () {
                var inputData = {
                    Params: [{
                        Key: 26,
                        Value: $scope.item.Mobile
                    }],
                };
                var options = {
                    action: 'SystemSettings/user/GetUsers',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getUsersCallback
                };

                utl.Http.doAction(options);
            };

            $scope.lookupCallback = function (scope, data, options, hasError) {
                forEach(data, function (value, key) {
                    $scope.lookup[key] = value;
                    if (key == 'Country' && $scope.item.CountryId === 1) {
                        $scope.item.CountryId = value[1].Id;
                        $scope.item.CountryCode = value[1].CountryCode;
                    }
                });
                $scope.getList();
                $scope.getUsers();
                $scope.patientChange();

            };

            $scope.initLookup = function () {
                var inputData = [{
                    "Key": "Country"
                }]
                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.lookupCallback
                };
                utl.Http.doAction(options);
            };

            $scope.initLookup();

        }

        FeedbackOtpVerifyController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$cookies'];

    })();