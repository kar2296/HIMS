(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('userTaxDetailFormController', userTaxDetailFormController);

function userTaxDetailFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.item = {};
    

        $scope.currentfilter = {
              name : '',
                          ActiveFrom: utl.Formatter.getCurrentDate()

        };
    $scope.currentcontext =  {};
    $scope.currentcontext.userid = parseInt($stateParams.id);
    $scope.currentcontext.id = 0;
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data[0];
        if($scope.item){
            $scope.currentcontext.id = $scope.item.Id;
        }
    };

    $scope.getItem = function (pageNo) {
        var inputData = { 
            Params :[
                { Key: 2, Value: $scope.currentcontext.userid} 
            ],
            PageContext:{
                PageSize: 25,
                PageNumber: 1
            }
        };                

        var options = {
            action: 'SystemSettings/usertaxdetail/GetUserTaxDetails',
            data: inputData,
            type: 'post',
            onComplete: $scope.getItemCallback
        };
        utl.Http.doAction(options);        
    };

    $scope.backToList = function () {
       // $state.go('app.usertab.general', { id:0 });
       $state.go('app.usertab.general');
    }

  $scope.clear = function() {
        $scope.item = {};
         $scope.currentfilter = {};
    };
 
      $scope.save = function () {
        $scope.item.PatientStatus = 'Draft'
        $scope.saveItem();
    };

    $scope.saveAndApprove = function () {
        $scope.item.PatientStatus = 'Active'
        $scope.saveItem();
    };

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
    };

    $scope.saveItem = function () {
        
        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }
            
        var actionName = 'SystemSettings/Usertaxdetail/AddUserTaxDetail';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'SystemSettings/Usertaxdetail/UpdateUserTaxDetail';
        }
      
        $scope.item.UserId = $scope.currentcontext.userid;
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
        /*var inputData = [ 
                ];

        var options = {
            action: '',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);*/
        $scope.getItem();
    }
    
    $scope.initLookup();  
        $scope.item.ActiveFrom = new Date();
  
}

userTaxDetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();