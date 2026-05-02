(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietMultipleorderController', dietMultipleorderController);

    function dietMultipleorderController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.mlcid);
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.currentfilter = {
            registereddate: utl.Formatter.getCurrentDate()
        };
        $scope.backToList = function () {
            $state.go('app.dietmultipleorders');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

       $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                    {
                        
                    }

            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            // utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    dietMultipleorderController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();