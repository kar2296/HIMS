(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('screenFormController', screenFormController);

function screenFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.item = {
         IsEnabled : true
    };
    
    vm.currentcontext = {
        id : $stateParams.id,
        moduleId : $stateParams.moduleId   
    }

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if (parseInt(vm.currentcontext.id) > 0) {

            var options = {
                action: 'SystemSettings/screen/GetScreenById',
                data: { Id : parseInt(vm.currentcontext.id) },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.screens', { moduleId : vm.currentcontext.moduleId });
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
            
        var actionName = 'SystemSettingsscreen/AddScreen';
        if (vm.currentcontext.id && parseInt(vm.currentcontext.id) > 0) {
            actionName = 'SystemSettingsscreen/UpdateScreen';
        }
      
        $scope.item.ModuleId = vm.currentcontext.moduleId;
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
        var inputData =
        [
            {
                "Key" : "Module"
            } 
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

screenFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();