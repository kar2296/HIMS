(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('customerMasterFormController', customerMasterFormController);

    function customerMasterFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            OrganizationId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            IsActive: true,
            isDisabled: false,
            CustomerTypeId: -1,
            PaymentTermsId: 3,
            CurrencyCodeId: 1,
            ProfitPercentage: 0,
            Activefrom: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/customermaster/GetCustomerMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.customermasters');
        };

        $scope.addNew = function () {
            $state.go('app.customermasters', { id: 0 });
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('inventory.customermaster.codealreadyexist.lbl'));
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {};
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

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/customermaster/AddCustomerMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/customermaster/UpdateCustomerMaster';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                    $scope.item.ProfitPercentage = value[0].StoreMaster.ProfitPercentage;
                }
            });

            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PaymentTerms" },
                { "Key": "CurrencyCode" },
                { "Key": "CustomerType" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [
                            { Key: 1, Value: utl.Session.getCurrentUserId() },
                            { Key: 2, Value: $scope.item.FacilityId },
                            { Key: 5, Value: 2 }
                        ]
                    },
                    Default: false
                }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        };

        $scope.initLookup();
    }

    customerMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();