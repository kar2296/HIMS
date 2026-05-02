(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('investigationSettingsController', investigationSettingsController);

function investigationSettingsController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {};
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data[0];
        $scope.currentcontext.id = $scope.item.Id;
    };

    $scope.getItem = function (pageNo) {

        var inputData = { 
            Params :[
             /* { Key: 1, Value: $scope.currentfilter.name ? $scope.currentfilter.name : "" } */
            ],
            PageContext:{
                PageSize: 25,
                PageNumber: 1
            }
        };

        var options = {
             action: 'lis/investigationsettings/GetInvestigationSettings',
            data: inputData,
            type: 'post',
            onComplete: $scope.getItemCallback
        };
        utl.Http.doAction(options);
    };
    $scope.backToList = function () {
       $state.go('app.investigationsettings');
    }
    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };
    $scope.clear = function () {
        $scope.item = {};
    };
    $scope.saveItem = function () {
       if(!utl.Validator.validate($scope)) {
            return;
        }
        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }
            
        var actionName = 'lis/investigationsettings/AddInvestigationsettings';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'lis/investigationsettings/UpdateInvestigationsettings';
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
                            { "Key": "Organization" },
                            { "Key": "STATUS" }

                        ]
        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        $scope.$doAction(options);
    }
    
    $scope.initLookup();
}

investigationSettingsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();