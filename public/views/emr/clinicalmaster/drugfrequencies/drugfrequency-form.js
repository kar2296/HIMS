(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugFrequencyFormController', drugFrequencyFormController);

function drugFrequencyFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   
    
    $scope.item = {
        IsActive : true
    };
    $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/DrugFrequency/GetDrugFrequencyById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };
        $scope.clear = function(){
            $scope.item={};
        }
    $scope.backToList = function () {
       $state.go('app.drugfrequencies');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList(); // 13-02-17
    };

    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'clinicalmaster/DrugFrequency/AddDrugFrequency';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/DrugFrequency/UpdateDrugFrequency';
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
                    { "Key": "DrugFrequencyType" },
                    { "Key": "DrugFrequencySIGCode" },
                    { "Key": "Facility" }
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

drugFrequencyFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();