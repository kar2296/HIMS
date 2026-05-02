(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugFrequencyCategoryFormController', drugFrequencyCategoryFormController);

function drugFrequencyCategoryFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);
    $scope.currentcontext.drugfrequencyid = parseInt($stateParams.drugfrequencyid);
    $scope.item.DrugFrequencyId = $scope.currentcontext.drugfrequencyid;

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/DrugFrequencyCategory/GetDrugFrequencyCategoryById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.drugfrequencytab.frequencycategories');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        
        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }
            
        var actionName = 'clinicalmaster/DrugFrequencyCategory/AddDrugFrequencyCategory';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/DrugFrequencyCategory/UpdateDrugFrequencyCategory';
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
        if ($scope.item.Activefrom == null) 
            $scope.item.Activefrom = new Date();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "FrequencyCategory" },
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

drugFrequencyCategoryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();