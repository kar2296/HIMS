(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureTemplateFormController', procedureTemplateFormController);

function procedureTemplateFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.proceduretemplateid);
    $scope.currentcontext.procedureid = parseInt($stateParams.id);
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/ProcedureTemplate/GetProcedureTemplateById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.proceduretab.proceduretemplates');
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
            
        var actionName = 'clinicalmaster/ProcedureTemplate/AddProcedureTemplate';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/ProcedureTemplate/UpdateProcedureTemplate';
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

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                    { "Key": "ProcedureTemplateType" },
                    { "Key": "ProcedureTemplateGroup" },
                    { "Key": "ProcedureTemplateCategory" },
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

procedureTemplateFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();