(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('externalprovidersformController', externalprovidersformController);

function externalprovidersformController($scope, $stateParams, $state, $translate, utl) {
   var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

    $scope.item = {
        IsActive : true
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;

      /*   if ($scope.item.Activefrom == null)
            $scope.item.Activefrom = new Date();*/
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'lis/externalproviders/GetExternalprovidersById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.externalproviderslist');
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

        var actionName = 'lis/externalproviders/AddExternalproviders';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'lis/externalproviders/UpdateExternalproviders';
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
                            { "Key": "Organization" },
                            {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                            { "Key": "TestMaster" },
                            { "Key": "Department" , "Request": {
                                 "Params": [{'Key': 2, 'Value': 'OTHLAB'}]
                            }},
                            { "Key": "STATUS" },
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

externalprovidersformController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();