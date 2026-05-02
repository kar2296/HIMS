(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('frequencyCategoryFormController', frequencyCategoryFormController);

function frequencyCategoryFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {
        ActiveFrom : utl.Formatter.getCurrentDate() //  13-02-17
    }; 

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };
    
    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.frequencyid = parseInt(modalConfig.params.frequencyid);
        $scope.item.FrequencyId = $scope.currentcontext.frequencyid;

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/FrequencyCategory/GetFrequencyCategoryById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal)
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
            
        var actionName = 'clinicalmaster/FrequencyCategory/AddFrequencyCategory';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/FrequencyCategory/UpdateFrequencyCategory';
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
                    { "Key": "ClinicalFrequencyCategory" },
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

frequencyCategoryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();