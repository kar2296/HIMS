(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureAliasFormController', procedureAliasFormController);

function procedureAliasFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.procedurealiasid);
    $scope.currentcontext.procedureid = parseInt($stateParams.id);

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/ProcedureAlias/GetProcedureAliasById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.proceduretab.procedurealiases');
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
            
        var actionName = 'clinicalmaster/ProcedureAlias/AddProcedureAlias';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/ProcedureAlias/UpdateProcedureAlias';
        }
      
        $scope.item.ProcedureId = $scope.currentcontext.procedureid;
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.initLookup = function () {
        $scope.lookup = {};
        $scope.getItem();
    }
    
    $scope.initLookup();
}

procedureAliasFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();