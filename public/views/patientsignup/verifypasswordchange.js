(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PasswordChangeController', PasswordChangeController);

    function PasswordChangeController($scope, $state, $stateParams, $translate, utl, $cookies) {
        var vm = this;

        $scope.item = {
            NewPassword: '',
            ConfirmPassword: '',
            OldPassword: ''
        };

        $scope.currentcontext = {};
        $scope.currentcontext.mobile = $stateParams.mobile;
        $scope.currentcontext.userid = parseInt($stateParams.userid);

        $scope.clear = function () {
            $scope.item = {};
        }

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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.logout();
        };

        $scope.saveItem = function () {
            if ($scope.ValidatePwd()) {
                if (!utl.Validator.validate($scope)) {
                    return;
                }

                var actionName = 'SystemSettings/User/changepassword';

                var options = {
                    action: actionName,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // Validate Pwd Criteria starts
        $scope.ValidatePwd = function () {
            if ($scope.currentcontext.pwd) {
                var condition = $scope.currentcontext.pwd;
                if (($scope.item.ConfirmPassword.length < condition.MinPwdLength) || ($scope.item.ConfirmPassword.length > condition.MaxPwdLength)) {
                    utl.Alert.showErrorMsg($translate.instant('appmanager.changepassword.invalidpwdtype.lbl'));
                    return false;
                }
                if (!condition.IsSpecialCharacterAllowedinPwd) {
                    if (/^[a-zA-Z0-9- ]*$/.test($scope.item.NewPassword) == false) {
                        utl.Alert.showErrorMsg($translate.instant('appmanager.changepassword.specialcharacter.lbl'));
                        return false;
                    }
                }
            }
            return true;
        }

        $scope.getUsersCallback = function (scope, data, options, hasError) {
            var UserData = data;
            $scope.item.UserId = UserData.Id;
            $scope.item.OldPassword = UserData.Password;
        };

        $scope.getUsers = function () {
            if ($scope.currentcontext.userid && $scope.currentcontext.userid > 0) {
                var options = {
                    action: 'SystemSettings/User/GetUserById',
                    data: { Id: $scope.currentcontext.userid },
                    type: 'post',
                    onComplete: $scope.getUsersCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getUsers();

    }

    PasswordChangeController.$inject = ['$scope', '$state', '$stateParams', '$translate', 'utl', '$cookies'];

})();