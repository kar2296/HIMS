(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('opbillinginfoFormController', opbillinginfoFormController);

function opbillinginfoFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

    $scope.item = {
        IsActive : true
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'generalmaster/opbillinginfoMaster/GetopbillinginfoMasterById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.opbilling');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {

        if(!utl.Validator.validate($scope)) {
            return;
        }

        var actionName = 'generalmaster/opbillinginfoMaster/AddopbillinginfoMaster';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'generalmaster/opbillinginfoMaster/UpdateopbillinginfoMaster';
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
        var inputData = [
                            {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
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

opbillinginfoFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();