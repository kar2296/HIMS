(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('changePasswordController', changePasswordController);

function changePasswordController($scope, $translate, utl,$uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {
        UserId : utl.Session.getCurrentUserId(),
        UserName : utl.Session.getCurrentUserName(),
        NewPassword : '',
        ConfirmPassword : '',
        OldPassword : ''
    };

    $scope.currentcontext = {
        facilityid : utl.Session.getCurrentFacilityId()
    };

    $scope.confirmCallback = $uibModalInstance.close;
    $scope.cancelCallback = $uibModalInstance.dismiss;
    
    $scope.clear = function() {
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
        if($scope.ValidatePwd()) {
            if(!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'SystemSettings/User/changepassword';
        
            var options = {
                action: actionName,
                data: {Data : $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    // Validate Pwd Criteria starts
    $scope.ValidatePwd = function () {
        
         if($scope.currentcontext.pwd) {
         var condition = $scope.currentcontext.pwd;
             if(($scope.item.ConfirmPassword.length < condition.MinPwdLength) || ($scope.item.ConfirmPassword.length > condition.MaxPwdLength)) {  
                 utl.Alert.showErrorMsg($translate.instant('appmanager.changepassword.invalidpwdtype.lbl'));
                 return false;
             }
             if(!condition.IsSpecialCharacterAllowedinPwd) {
                 if(/^[a-zA-Z0-9- ]*$/.test($scope.item.NewPassword)==false) {
                    utl.Alert.showErrorMsg($translate.instant('appmanager.changepassword.specialcharacter.lbl'));
                    return false;
                }
             }
         }
        
        return true;
    }
    // Validate Pwd Criteria ends

    $scope.getPasswordCriteriaCallback = function (scope, data, options, hasError) {
        if(data.Data.length > 0) {
            $scope.currentcontext.pwd = data.Data[0];            
        }
    };

    $scope.getPasswordCriteria = function (pageNo) {
        if ($scope.currentcontext.facilityid && $scope.currentcontext.facilityid > 0) {

            var inputData = { 
            Params :[
             { Key: 2, Value: $scope.currentcontext.facilityid }
            ]
        };

            var options = {
                action: 'SystemSettings/facilitysetting/GetFacilitySettings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPasswordCriteriaCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.getPasswordCriteria();
}

changePasswordController.$inject = ['$scope', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();