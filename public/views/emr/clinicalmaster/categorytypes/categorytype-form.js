(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('categoryTypeFormController', categoryTypeFormController);

function categoryTypeFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {
        IsActive : true,
        IsAssociatedWithCC : false
    };

    $scope.currentcontext =  {};
    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }

    $scope.canDisableCategoryTypeName = function () {
        return $scope.currentcontext.id > 0;
    }
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/CategoryTypeMaster/GetCategoryTypeMasterById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $scope.confirmCallback();
    }

    $scope.save = function() {
        $scope.item.ActiveStatusId = 1;
        $scope.saveItem();
    }

    $scope.saveAndApprove = function() {
        $scope.item.ActiveStatusId = 2;
        $scope.saveItem();
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'clinicalmaster/CategoryTypeMaster/AddCategoryTypeMaster';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/CategoryTypeMaster/UpdateCategoryTypeMaster';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "CategoryTypeRef" }    
                ];

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

categoryTypeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();