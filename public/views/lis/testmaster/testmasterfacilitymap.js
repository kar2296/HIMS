(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testmasterFacilityMapController', testmasterFacilityMapController);

    function testmasterFacilityMapController($scope, $stateParams, $state, $translate, utl) {
        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;

            if ($scope.item.map.length == 0) {
                $scope.item.map = [{
                    TestmasterId: parseInt($stateParams.id),
                    FacilityId: parseInt(utl.Session.getCurrentFacilityId())
                }];
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }]
                };

                var options = {
                    action: 'lis/testmaster/GetFacilities',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                $scope.$doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.testmastertab.testmaster');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //$scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'lis/testmaster/MapFacilities';

            var options = {
                action: actionName,
                data: { Data: $scope.item.map },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            $scope.$doAction(options);
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
            $scope.$doAction(options);
        }

        $scope.initLookup();
    }

    testmasterFacilityMapController.$inject = ['$scope', '$stateParams', '$state', '$translate','utl'];

})();