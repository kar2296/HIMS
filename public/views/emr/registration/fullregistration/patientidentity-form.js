(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientidentityFormController', patientidentityFormController);

function patientidentityFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));
    $scope.item = {};

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.patientidentityid);
    $scope.currentcontext.patientid = parseInt($stateParams.id);

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'registration/patientidentity/GetPatientIdentityById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.fullregistrationtab.patientids');
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
            
        var actionName = 'registration/patientidentity/AddPatientIdentity';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'registration/patientidentity/UpdatePatientIdentity';
        }
      
        $scope.item.PatientId = $scope.currentcontext.patientid;
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
                            { "Key": "PatientIdentityType" }
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

    // ---------------------------------------------------------------
    // REACT BRIDGE WIRING (migrated to PatientIdentityFormScreen.tsx). All
    // API calls/business logic above are untouched -- this only maps $scope
    // state into reactProps and dispatches UI actions back into the
    // existing functions above.
    // ---------------------------------------------------------------
    function refreshDerivedFlags() {
        $scope.reactProps.canUpdatePatientInfo = typeof $scope.canUpdatePatientInfo === 'function' ? $scope.canUpdatePatientInfo() : true;
    }

    $scope.reactProps = {
        item: $scope.item,
        lookup: $scope.lookup,
        canUpdatePatientInfo: true
    };
    refreshDerivedFlags();

    var origLookupCallback = $scope.lookupCallback;
    $scope.lookupCallback = function (scope, data, options, hasError) {
        origLookupCallback(scope, data, options, hasError);
        $scope.reactProps.lookup = $scope.lookup;
        refreshDerivedFlags();
    };

    var origGetItemCallback = $scope.getItemCallback;
    $scope.getItemCallback = function (scope, data, options, hasError) {
        origGetItemCallback(scope, data, options, hasError);
        $scope.reactProps.item = $scope.item;
        refreshDerivedFlags();
    };

    $scope.handleReactAction = function (actionName, payload) {
        switch (actionName) {
            case 'itemFieldChange':
                $scope.item[payload.field] = payload.value;
                break;
            case 'saveItem':
                $scope.saveItem();
                break;
            case 'backToList':
                $scope.backToList();
                break;
            default:
                break;
        }
        $scope.$applyAsync();
    };
}

patientidentityFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();