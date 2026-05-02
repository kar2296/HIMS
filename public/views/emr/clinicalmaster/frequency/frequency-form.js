(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('frequencyMasterFormController', frequencyMasterFormController);

function frequencyMasterFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));
    
    $scope.item = {
        IsActive : true,
        FacilityId : utl.Session.getCurrentFacilityId()
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/FrequencyMaster/GetFrequencyMasterById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };
       $scope.clear = function(){
           $scope.item = {};
       }
    $scope.backToList = function () {
       $state.go('app.frequencies');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        // $scope.backToList();  // 13-02-17
    };

    $scope.saveItem = function () {
        
        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }
             if(!utl.Validator.validate($scope)) {
            return;
        }
        var actionName = 'clinicalmaster/FrequencyMaster/AddFrequencyMaster';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/FrequencyMaster/UpdateFrequencyMaster';
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
                    { "Key": "Facility" },
                    { "Key": "FrequencyType" },
                    { "Key": "FrequencySIGCode" },
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

frequencyMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();