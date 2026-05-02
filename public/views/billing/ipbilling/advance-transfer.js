(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('advanceTransferFormController', advanceTransferFormController);

    function advanceTransferFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        var vm = this;
        //$scope.billinfo = [];
        $scope.advanceDetails = [];
        $scope.adjustedDetails = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = -1;
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //if (modalConfig.params && modalConfig.params.billinfo)
        //$scope.billinfo = modalConfig.params.billinfo;

        if (modalConfig.params && modalConfig.params.id)
            $scope.currentcontext.id = modalConfig.params.id;
        if (modalConfig.params && modalConfig.params.EncounterId)
            $scope.currentcontext.EncounterId = modalConfig.params.EncounterId;

        $scope.getList = function (PatientId) {
            var inputData = {
                Params: [
                    { Key: 2, Value: PatientId },
                    { Key: 4, Value: 1 },
                    { Key: 18, Value: [$scope.currentcontext.EncounterId] }
                ],
                PageContext: {
                    PageSize: 100,
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
            //vm.gridConfig.data = data.Data;
            //$scope.advanceDetails = data.Data;
            //vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;

            for (var idx in data.Data) {
                var recdata = data.Data[idx];
                recdata.AmountPaid = parseFloat(recdata.AmountPaid).toFixed(2);
                recdata.AmountAdjusted = parseFloat(recdata.AmountAdjusted).toFixed(2);
                $scope.advanceDetails.push(recdata);
            }
        };

        $scope.computeAdvance = function (item) {
            if (parseFloat(item.AdjustAmount) > 0 && parseFloat(item.AdjustAmount) > (parseFloat(item.AmountPaid) - parseFloat(item.AmountAdjusted))) {
                item.AdjustAmount = 0;
                utl.Alert.showErrorMsg('Adjusting Amount Should Not exceed Actual Advance Paid');
            }

            //$scope.TotalGrossAmount = 0;
            //$scope.TotalDiscountAmount = 0;
            //$scope.TotalGstAmount = 0;
            //$scope.TotalInGstAmount = 0;
            //$scope.TotalCGstAmount = 0;
            //$scope.TotalSGstAmount = 0;
            //$scope.TotalNetAmount = 0;
            //$scope.OtherCharges = 0;
            //$scope.TotalCreditAmount = 0;
            //$scope.RoundOff = 0;

            //calculatetotalAmount();
        };

        $scope.AdjustAdvance = function () {
            for (var idx in $scope.advanceDetails) {
                var adjdata = $scope.advanceDetails[idx];
                if (parseFloat(adjdata.AdjustAmount) > 0) {
                    $scope.adjustedDetails.push(adjdata);
                }
            }
            $scope.confirmCallback({ AdjustedData: $scope.adjustedDetails });
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList($scope.currentcontext.id);
            $scope.action();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
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
        }

        $scope.initLookup();
    }

    advanceTransferFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();