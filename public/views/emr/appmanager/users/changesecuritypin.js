(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ChangeSecurityPinController', ChangeSecurityPinController);

    function ChangeSecurityPinController($scope, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            NewPassword: '',
            ConfirmPassword: '',
            OldPassword: ''
        };

        $scope.currentcontext = {
            facilityid: utl.Session.getCurrentFacilityId()
        };

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            // if ($scope.ValidatePwd()) {
                if (!utl.Validator.validate($scope)) {
                    return;
                }

                var actionName = 'SystemSettings/User/ChangeSecurityPin';

                var options = {
                    action: actionName,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            // }
        };
    }

    ChangeSecurityPinController.$inject = ['$scope', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();