(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('adjustagainstAdvanceFormController', adjustagainstAdvanceFormController);

    function adjustagainstAdvanceFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        var vm = this;

        $scope.advanceDetails = [];
        $scope.adjustedDetails = [];
        $scope.currentcontext = {
            id: -1,
            ismodal: modalConfig && modalConfig.params ? true : false,
            BalanceAmount: 0
        };
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if (modalConfig.params && modalConfig.params.id)
            $scope.currentcontext.id = modalConfig.params.id;
        if (modalConfig.params && modalConfig.params.EncounterId)
            $scope.currentcontext.EncounterId = modalConfig.params.EncounterId;
        if (modalConfig.params && modalConfig.params.balanceamount)
            $scope.currentcontext.BalanceAmount = modalConfig.params.balanceamount;

        $scope.getList = function (PatientId) {
            var inputData = {
                Params: [
                    { Key: 2, Value: PatientId },
                    { Key: 4, Value: 5 },
                    { Key: 5, Value: 1 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            for (var idx in data.Data) {
                var recdata = data.Data[idx];
                recdata.AmountPaid = parseFloat(recdata.AmountPaid).toFixed(2);
                recdata.AmountAdjusted = parseFloat(recdata.AmountAdjusted).toFixed(2);
                var advbalance = recdata.AmountPaid - recdata.AmountAdjusted;
                if (advbalance <= 0) {
                    recdata.FullAmountAdjusted = true;
                    recdata.AmountAvailable = 0;
                    recdata.AdjustAmount = 0;
                } else {
                    recdata.FullAmountAdjusted = false;
                    recdata.AmountAvailable = advbalance;
                    recdata.AdjustAmount = 0;
                }
                $scope.advanceDetails.push(recdata);
            }
        };

        $scope.computeAdvance = function (item) {
            if (parseFloat(item.AdjustAmount) > 0 && parseFloat(item.AdjustAmount) > (parseFloat(item.AmountPaid) - parseFloat(item.AmountAdjusted))) {
                item.AdjustAmount = 0;
                utl.Alert.showErrorMsg('Adjusting Amount Should Not exceed Actual Advance Paid');
            }
        };

        $scope.AdjustAdvance = function () {
            var AdjustingAmount = 0;
            for (var idx in $scope.advanceDetails) {
                var adjdata = $scope.advanceDetails[idx];
                if (parseFloat(adjdata.AdjustAmount) > 0) {
                    AdjustingAmount = AdjustingAmount + parseFloat(adjdata.AdjustAmount);
                    $scope.adjustedDetails.push(adjdata);
                }
            }

            if (AdjustingAmount > $scope.currentcontext.BalanceAmount) {
                utl.Alert.showErrorMsg('Adjusting Amount Should Not Greater Than Actual Bill/Due Amount.');
                $scope.adjustedDetails = [];
                return false;
            } else {
                $scope.confirmCallback({ AdjustedData: $scope.adjustedDetails });
            }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList($scope.currentcontext.id);
            $scope.action();
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
                { "Key": "ReceiptType" },
                { "Key": "ReceiptStatus" },
                { "Key": "CardType" }
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

    adjustagainstAdvanceFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();