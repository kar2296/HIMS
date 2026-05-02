(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('groupFacilityMapController', groupFacilityMapController);

function groupFacilityMapController($scope, $stateParams, $state, $translate, utl) {
    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);

    $scope.item = { };

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
                action: 'SystemSettings/Group/GetFacilities',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToForm = function () {
            $state.go('app.grouptab.general');
        }
       $scope.clear = function() {
        $scope.item = {};
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
        //    $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }

        var actionName = 'SystemSettings/Group/MapFacilities';

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
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
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

groupFacilityMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();