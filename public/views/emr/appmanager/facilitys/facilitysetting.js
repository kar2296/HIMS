(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilitySettingController', facilitySettingController);

function facilitySettingController($scope, $stateParams, $state, $translate, utl,$uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {
        isNew : true
    };
    if (modalConfig && modalConfig.params) {
            $scope.currentcontext.facilityid = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        if(data.Data.length > 0) {
            $scope.item = data.Data[0];
            $scope.currentcontext.isNew = false;
        }
            $scope.item.FacilityId = $scope.currentcontext.facilityid;
    };

    $scope.getItem = function (pageNo) {
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
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };
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
        
        if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'SystemSettings/Facilitysetting/UpdateFacilitySetting';
        if ($scope.currentcontext.isNew) {
            actionName = 'SystemSettings/Facilitysetting/AddFacilitySetting';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.getItem();
}

facilitySettingController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();