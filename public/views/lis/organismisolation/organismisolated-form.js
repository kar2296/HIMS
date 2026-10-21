(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrgIsolatedFormController', OrgIsolatedFormController);

    function OrgIsolatedFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            AssetId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id || 0);

        $scope.reactProps = {
            id: $scope.currentcontext.id,
            item: $scope.item,
            lookup: {}
        };

        $scope.syncReactProps = function () {
            $scope.reactProps = {
                id: $scope.currentcontext.id,
                item: $scope.item,
                lookup: $scope.lookup
            };
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data || {};
            if ($scope.item.IsActive === undefined) {
                $scope.item.IsActive = true;
            }
            $scope.syncReactProps();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'lis/OrgIsolation/GetOrgIsolationById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.backToList = function () {
            $state.go('app.organismsisolations');
        };

        $scope.clear = function () {
            $scope.item = {};
            $scope.syncReactProps();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!$scope.item.Code || !$scope.item.OrgIsolationName) {
                utl.Alert.showErrorMsg($translate.instant('Please fill in required fields.'));
                return;
            }

            var actionName = 'lis/OrgIsolation/AddOrgIsolation';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/OrgIsolation/UpdateOrgIsolation';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        // React bridge
        $scope.handleAction = function (actionName, payload) {
            $scope.$evalAsync(function () {
                switch (actionName) {
                    case 'formChange':
                        if (payload) {
                            angular.extend($scope.item, payload);
                        }
                        break;
                    case 'save':
                        if (payload) {
                            angular.extend($scope.item, payload);
                        }
                        $scope.save();
                        break;
                    case 'saveAndApprove':
                        if (payload) {
                            angular.extend($scope.item, payload);
                        }
                        $scope.saveandApprove();
                        break;
                    case 'backToList':
                        $scope.backToList();
                        break;
                }
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.syncReactProps();
            $scope.getItem();
        };

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
                { "Key": "AntibioticType" },
                { "Key": "ActiveStatus" },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    OrgIsolatedFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();