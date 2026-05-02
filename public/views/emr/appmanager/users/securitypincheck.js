(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('securityPINValidationController', securityPINValidationController);

    function securityPINValidationController($scope, $translate, utl, $timeout, $uibModalInstance, modalConfig) {
        var vm = this;

        var savehitcompleted = 0;

        $scope.item = {
            UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            SecurityPin: ''
        };

        $scope.currentcontext = {
            facilityid: utl.Session.getCurrentFacilityId()
        };

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.clear = function () {
            $scope.item.SecurityPin = '';
            $timeout(function () {
                $('#securitypin').focus();
            }, 500);
        };

        $scope.backToList = function () {
            $scope.cancelCallback();
        };

        $scope.saveItemCallback = function (scope, res, options, hasError) {
            if (res && res.Data &&
                res.Data.length > 0) {
                $scope.confirmCallback({ pinstatus: true });
            } else {
                savehitcompleted = 0;
                utl.Alert.showErrorMsg($translate.instant('appmanager.securitypincheck.invalidpin.lbl'));
            }
        };

        $scope.errorItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.confirmCallback({ pinstatus: false });
        };

        $timeout(function () {
            $('#securitypin').focus();
        }, 500);

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return false;


            if (!utl.Validator.validate($scope)) {
                return;
            }
            var inputparams = {
                Params: [
                    { Key: 0, Value: $scope.item.UserId },
                    { Key: 16, Value: $scope.item.SecurityPin }
                ],
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1
                }
            }

            savehitcompleted = 1;

            var actionName = 'SystemSettings/User/GetUsers';
            var options = {
                action: actionName,
                data: inputparams,
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };
    }

    securityPINValidationController.$inject = ['$scope', '$translate', 'utl', '$timeout', '$uibModalInstance', 'modalConfig'];

})();