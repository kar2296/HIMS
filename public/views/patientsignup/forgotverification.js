(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ForgotVerifyController', ForgotVerifyController);

    function ForgotVerifyController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl, Upload, $cookies) {
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
            IsForgotPwd: true
        };
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.CanShowUserInfo = true;
        $scope.CanShowForgotUserInfo = false;
        $scope.currentcontext.isnew = $stateParams.isnew;

        $scope.CanShowVerifyOtp = false;
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

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.SelectedCountry = function (selectedItem) {
            $scope.item.CountryCode = selectedItem.CountryCode;
        };

        $scope.screenChange = function (type) {
            if (type == 'pwd') {
                $scope.CanShowUserInfo = true;
                $scope.CanShowForgotUserInfo = false;
                if ($scope.item.IsForgotPwd == true) {
                    $scope.item.IsForgotSwid = false;
                    $scope.item.IsForgotPwd = true;
                } else {
                    $scope.item.IsForgotSwid = false;
                    $scope.item.IsForgotPwd = true;
                }
            }
            if (type == 'swid') {
                $scope.item.UserName = '';
                $scope.CanShowUserInfo = false;
                $scope.CanShowForgotUserInfo = true;
                if ($scope.item.IsForgotSwid == true) {
                    $scope.item.IsForgotSwid = true;
                    $scope.item.IsForgotPwd = false;
                } else {
                    $scope.item.IsForgotSwid = true;
                    $scope.item.IsForgotPwd = false;
                }
            }
        }

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('Mobile No Already Exists'));
            }
        }

        $scope.sendotpCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('OTP Sended Your Mobile Phone'));
            console.log('otp is', data.Otp)
            $scope.CanShowVerifyOtp = true;
            $scope.item.Id = data.Id;
            $scope.item.Otp = data.Otp;
        };

        $scope.sendotp = function () {
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

        $scope.getPrevList = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.Mobile
                },],
            };
            var options = {
                action: 'SystemSettings/OtpVerify/GetOtpVerifys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPrevListCallback = function (scope, data, options, hasError) {
            if (data.Data.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Mobile No is not registered'));
            } else {
                var otpdata = data.Data[0];
                $scope.item.Id = otpdata.Id;
                $scope.getForgotOtp();
            }
        };

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
            utl.Alert.showSuccessMsg($translate.instant('OTP Verified'));
            if (data.IsOtpVerified == true) {
                $state.go('self.patientsignup', {
                    mobile: $scope.item.Mobile,
                    countryid: $scope.item.CountryId
                })
            }
        };

        $scope.forgotverifyotpCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('OTP Verified'));
            if (data.IsForgotOtpVerified == true) {
                $state.go('self.verifypasswordchange', {
                    userid: $scope.item.UserId
                })
            }
        };

        $scope.verifyotp = function () {
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
                if ($scope.item.ForgotOtp != $scope.item.Inputotp) {
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Valid OTP'));
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

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getUsersCallback = function (scope, data, options, hasError) {
            if (data.Data.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Valid Swostha Id'));
            } else {
                var UserData = data.Data[0];
                $scope.item.UserId = UserData.Id;
                $scope.item.Mobile = UserData.Mobile;
                $scope.item.User = UserData.FirstName;
                $scope.item.OldPassword = UserData.Password;
                $scope.getPrevList();
            }
        };

        $scope.getUsers = function () {
            var inputData = {
                Params: [{
                    Key: 25,
                    Value: $scope.item.UserName
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
        $scope.SendUserSmsCallback = function (scope, data, options, hasError) {
            if (data == true) {
                utl.Modal.openFixedDialog('self.confirmusermsg', {
                    params: {
                        userinfo: $scope.item
                    }
                });
                // utl.Alert.showSuccessMsg($translate.instant('UserId Sent to Your Registered Mobile Number'));
            }
        }

        $scope.SendUserSms = function () {
            var options = {
                action: 'SystemSettings/user/SendUserNameSms',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.SendUserSmsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.sendusernameCallback = function (scope, data, options, hasError) {
            if (data.Data.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Entered Data Not Matched'));
            } else {
                var UserData = data.Data[0];
                $scope.item.UserId = UserData.Id;
                $scope.item.Mobile = UserData.Mobile;
                $scope.item.User = UserData.FirstName;
                $scope.item.UserName = UserData.UserName;
                $scope.item.OldPassword = UserData.Password;
                $scope.SendUserSms();
            }
        };

        $scope.sendusername = function () {
            var FrDob = $filter('date')($scope.item.DOB, 'yyyy-MM-dd 00:00:00');
            var ToDob = $filter('date')($scope.item.DOB, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 26,
                    Value: $scope.item.Mobile
                }, {
                    Key: 27,
                    Value: [FrDob, ToDob]
                }],
            };
            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.sendusernameCallback
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

    ForgotVerifyController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$cookies'];

})();