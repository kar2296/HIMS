(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('testInstcMasterFormController', testInstcMasterFormController);

function testInstcMasterFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   
    
    $scope.item = {
        IsActive : true
    }; 

    $scope.currentcontext =  {}; 
    
    $scope.currentcontext.testmasterid = parseInt($stateParams.id);
 

    $scope.getListCallback = function (scope, res, options, hasError) {
        $scope.item = res.Data[0]; 
    };

    $scope.getList = function (pageNo) {

        var inputData = { 
            Params :[ 
              { Key: 1, Value: $scope.currentcontext.testmasterid }
            ],
            PageContext:{
                PageSize: 0,
                PageNumber: 100
            }
        };

            var options = {
                action: 'lis/testmaster/GetTestmasterInsts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

    $scope.backToList = function () {
       $state.go('app.testmastertab.testmaster');
    }
 $scope.back = function () {
       $state.go('app.testmasters');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
       // $scope.backToList();
    };

    $scope.clear = function () {
        $scope.item = {};
    };

    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }

        $scope.item.TestmasterId = $scope.currentcontext.testmasterid;      
        var actionName = 'lis/testmaster/AddTestmasterInst';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'lis/testmaster/UpdateTestmasterInst';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };
 
    $scope.getList();
}

testInstcMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();