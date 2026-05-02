(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ticksheetmasterFormController', ticksheetmasterFormController);

function ticksheetmasterFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   
    
    $scope.item = {
        IsActive : true
    }; 

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;

        if ($scope.item.Activefrom == null) 
            $scope.item.Activefrom = new Date();

    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'lis/ticksheetmaster/GetTicksheetmasterById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.ticksheetmasters');
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
            
        var actionName = 'lis/ticksheetmaster/AddTicksheetmaster';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'lis/ticksheetmaster/UpdateTicksheetmaster';
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
                            { "Key": "TicksheetType" },
                            { "Key": "Department" },
                            { "Key": "SubDepartment" },
                            { "Key": "TestMaster" }
                        ]
        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        $scope.$doAction(options);
    } 
    
    $scope.onTestSelected = function (selectedItem) {
        //do selectedItem.PropertyName like selectedItem.Name or selectedItem.Key 
        //whatever property your list has.
        console.log(selectedItem);
        //$scope.item.TestName= selectedItem
     }
    
    $scope.initLookup();
}

ticksheetmasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();