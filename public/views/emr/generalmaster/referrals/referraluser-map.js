(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralUserMapController', referralUserMapController);

function referralUserMapController($scope, $stateParams, $state, $translate, utl) {
    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id); 

    $scope.item = { };
         $scope.fillDefaultValues = function(){
       
    }
    if(!$scope.currentcontext.id || $scope.currentcontext.id == 0){
        $scope.fillDefaultValues();
    }
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item.map = data;
    };

    $scope.getItem = function (pageNo) {
	    if ( $scope.currentcontext.id && $scope.currentcontext.id > 0) {
            var inputData = {
                Params:[
                    { Key: 0 , Value:$scope.currentcontext.id }]
            };

            var options = {
                action: 'generalmaster/Referral/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.referraltab.details');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };
        $scope.clear = function(){
        $scope.item = {};
        $scope.fillDefaultValues();
    }
    $scope.saveItem = function () {
        
        // if(!$scope.item_form.isValid()) {
        // $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        // return;
        // }
            
        var actionName = 'generalmaster/Referral/MapUsers';
    
        var options = {
            action: actionName,
            data: {Data : $scope.item.map },
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
                            {
                "Key": "User",
                Request: {
                    Params: [{
                        Key: 5,
                        Value: 2
                    }]
                }
            },
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

referralUserMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();