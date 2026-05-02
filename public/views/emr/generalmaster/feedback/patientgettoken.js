(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientGetTokenController', PatientGetTokenController);

    function PatientGetTokenController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, Upload, $cookies) {
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
            CountryId: 1
        };
        $scope.lookup = {};
        $scope.currentcontext = {};

        $scope.currentcontext.isnew = $stateParams.isnew;

        $scope.CanShowVerifyOtp = false;
        //logout
        $scope.logoutCallback = function(scope, res, options, hasError) {
            var cookies = $cookies.getAll();
            angular.forEach(cookies, function(v, k) {
                $cookies.remove(k, {
                    path: '/'
                });
            });
            $state.go('page.login');
        };
        $scope.logout = function() {
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };
            utl.Http.doAction(options);
        };

        $scope.numberonly = function(e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.SelectedCountry = function(selectedItem) {
            $scope.item.CountryCode = selectedItem.CountryCode;
        };

        $scope.errorItemCallback = function(data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('Mobile No Already Exists'));
            }
        }

        $scope.afterSave = function(data, options) {
            utl.Alert.showSuccessMsg($translate.instant('OTP Sended Your Mobile Phone'));
            console.log('otp is', data.Otp)
            $scope.CanShowVerifyOtp = true;
            $scope.item.Id = data.Id;
            $scope.item.Otp = data.Otp;
        };

        function handleExistData(data) {
            var confirmOptions = {
                messageKey: 'Mobile No Already Exists! Do You Want to Continue?',
                placeholder: { patientcount: (data * -1) },
                onSuccessMethod: function() {
                    $scope.item.OverrideDuplicate = true;
                    $scope.sendotp();
                }
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.sendotpCallback = function(scope, data, options, hasError) {
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
        $scope.patientfeedback = function () {
           
        }

        $scope.sendotp = function() {
            if ($scope.currentcontext.isnew == true) {
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
            }
            if ($scope.currentcontext.isnew == false) {
                $scope.getUsers()
            };
        };

        $scope.getPrevList = function() {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.Mobile
                }, ],
            };
            var options = {
                action: 'SystemSettings/OtpVerify/GetOtpVerifys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPrevListCallback = function(scope, data, options, hasError) {
            if (data.Data.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Mobile No is not registered'));
            } else {
                var otpdata = data.Data[0];
                $scope.item.Id = otpdata.Id;
                $scope.getForgotOtp();
            }
        };
        $scope.backToList = function () {
            $state.go('app.patient-feedback');
            
        }
        $scope.home = function () { 
            $state.go('app.patient-feedback');
            
        }

        $scope.getForgotOtpCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('OTP Sended Your Mobile Phone'));
            console.log('otp is', data.ForgotOtp)
            $scope.CanShowVerifyOtp = true;
            $scope.item.Id = data.Id;
            $scope.item.ForgotOtp = data.ForgotOtp;
        };

        $scope.getForgotOtp = function() {
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

        $scope.verifyotpCallback = function(scope, data, options, hasError) {
            if (data.IsOtpVerified == true) {
                utl.Alert.showSuccessMsg($translate.instant('OTP Verified'));
                $state.go('self.patientsignup', {
                    mobile: $scope.item.Mobile,
                    countryid: $scope.item.CountryId
                })
            } else {
                utl.Alert.showErrorMsg($translate.instant('Invalid OTP'));
            }
        };

        $scope.forgotverifyotpCallback = function(scope, data, options, hasError) {
            if (data.IsForgotOtpVerified == true) {
                utl.Alert.showSuccessMsg($translate.instant('OTP Verified'));
                $state.go('self.verifypasswordchange', {
                    mobile: $scope.item.Mobile
                })
            } else {
                utl.Alert.showErrorMsg($translate.instant('Invalid OTP'));
            }
        };

        $scope.verifyotp = function() {
            if ($scope.currentcontext.isnew == true) {
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
                    onComplete: $scope.verifyotpCallback
                };
                utl.Http.doAction(options);
            }
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

        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getUsersCallback = function(scope, data, options, hasError) {
            if (data.Data.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Mobile No is not registered'));
            } else {
                var UserData = data.Data[0];
                $scope.item.UserId = UserData.Id;
                $scope.item.User = UserData.FirstName;
                $scope.item.OldPassword = UserData.Password;
                $scope.getPrevList();
            }
        };

        $scope.getUsers = function() {
            var inputData = {
                Params: [{
                    Key: 25,
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                if (key == 'Country' && $scope.item.CountryId === 1) {
                    $scope.item.CountryId = value[1].Id;
                    $scope.item.CountryCode = value[1].CountryCode;
                }
            });
        };

        $scope.initLookup = function() {
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

    PatientGetTokenController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$cookies'];

})();