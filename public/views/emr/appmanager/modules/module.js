
(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('moduleFormController', moduleFormController);

function moduleFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   

    $scope.item = {
        IsEnabled : true
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);    

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'SystemSettings/module/GetModuleById',
                data: { Id : $scope.currentcontext.id},
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.modules');
    }
      $scope.addNew = function() {
        $state.go('app.module', { id:0 });
    }
 $scope.clear = function() {
        $scope.item = {};
    }
    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        
        // if(!$scope.item_form.isValid()) {
        //     $scope.showErrorMsg($scope.i18n.appmanager.common.validationmsg.lbl);
        //     return;
        // }
            
        var actionName = 'SystemSettingsmodule/AddModule';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'SystemSettingsmodule/UpdateModule';
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
        // var options = {
        //     action: 'SystemSettings/module/GetModuleLookups',
        //     data: null,
        //     type: 'get',
        //     onComplete: $scope.lookupCallback
        // };
        // utl.Http.doAction(options);
        $scope.getItem();
    }
    
    $scope.initLookup();
}

moduleFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();