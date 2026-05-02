(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InsuranceUpdateFormController', InsuranceUpdateFormController);

    function InsuranceUpdateFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentcontext.id = modalConfig.params.id;
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function () {
            var options = {
                action: 'billing/patientbills/GetPatientBillsById',
                data: {
                    Id: $scope.currentcontext.id
                },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.saveItem = function () {

            var actionName = 'billing/patientbills/UpdatePatientBillsInsurance';

            var inputData = {
                Header: $scope.item,
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
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
                    "Key": "PaymentType"
                },
                {
                    'Key': 'Bank'
                },
                {
                    'Key': 'AdvanceNo'
                },
                {
                    'Key': 'CardType'
                },
                {
                    'Key': 'CurrencyType'
                },
                {
                    "Key": "Terminal"
                },
                {
                    "Key": "GuarantorType"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [
                            // {
                            //     Key: 2,
                            //     Value: 1
                            // },
                            {
                                Key: 7,
                                Value: [-1, utl.Session.getCurrentFacilityId()]
                            }
                        ]
                    }
                },
                // { "Key": "User" },
            ]
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

    InsuranceUpdateFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();