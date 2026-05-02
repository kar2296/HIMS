(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorCategorymapController', DoctorCategorymapController);

    function DoctorCategorymapController($scope, $stateParams, $state, $translate, utl) {
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.item = {};

        // $scope.item.map.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    }]
                };

                var options = {
                    action: 'SystemSettings/User/GetCategory',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.doctortab.doctorform');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.saveItem = function () {

            var actionName = 'SystemSettings/User/MapCategory';

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item.map
                },
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
            var inputData = [{
                "Key": "VirtualCategory"
            }];

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

    DoctorCategorymapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();