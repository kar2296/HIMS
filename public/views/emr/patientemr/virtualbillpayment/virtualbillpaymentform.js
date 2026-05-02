(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualBillPaymentFormController', VirtualBillPaymentFormController);

    function VirtualBillPaymentFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "PaymentType",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: 2
                        }]
                    }
                },
                {
                    "Key": "Bank"
                },
                {
                    "Key": "CardType"
                },
                {
                    "Key": "Terminal"
                },
            ]
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
    VirtualBillPaymentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();