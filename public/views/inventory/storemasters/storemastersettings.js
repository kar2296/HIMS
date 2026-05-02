(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storemasterSettingController', storemasterSettingController);

    function storemasterSettingController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.currentcontext = {};
        $scope.item.StoreMasterId = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.StoreMasterId }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/StoreSetting/GetStoreSettings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.storemastertab.storemaster');
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.addNew = function () {
            $state.go('app.storemastertab.storemaster', { id: 0 });
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'pharmacy/StoreSetting/AddStoreSetting';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'pharmacy/StoreSetting/UpdateStoreSetting';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
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
                { "Key": "Organization" },
                { "Key": "Facility" },
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.item.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                }
            ]
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

    storemasterSettingController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();