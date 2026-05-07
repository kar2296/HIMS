(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugTallManFormController', drugTallManFormController);

function drugTallManFormController($scope, $stateParams, $state, $translate, utl) {
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "item.TallmanContent".split('.');
                var current = parts[0] === 'vm' ? (typeof vm !== 'undefined' ? vm : $scope.vm) : (parts[0] === 'cvm' ? (typeof cvm !== 'undefined' ? cvm : $scope.cvm) : $scope);
                var startIndex = (parts[0] === 'vm' || parts[0] === 'cvm') ? 1 : 0;
                for (var i = startIndex; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id); 
//  13-02-17
        $scope.item = {};
        $scope.backToForm = function () {
            $state.go('app.drugtab.details');
        }
//  13-02-17
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/DrugMaster/GetDrugMasterById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.getItem();
    };

    $scope.saveItem = function () {
        
       if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'clinicalmaster/DrugMaster/UpdateDrugMaster';
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };
    
     $scope.getItem();
}

drugTallManFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();