(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('estimateBillDiscountController', estimateBillDiscountController);

    estimateBillDiscountController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig'];

    function estimateBillDiscountController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.DiscountModeId = 1;
            $scope.currentcontext.BillDiscount = 0;
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.totnet = modalConfig.params.totnet;
            $scope.currentcontext.BillDiscount = modalConfig.params.estimatebilldist;
            $scope.currentcontext.DiscountModeId = modalConfig.params.estimatebilldisttypeid;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.confirmCallback({
                eid: $scope.item.Id,
                EstimatedBillDist: $scope.item.EstimatedBillDist,
                EstimatedBillDistTypeId: $scope.item.EstimatedBillDistTypeId
            });
        };

        $scope.saveAndApprove = function () {
            $scope.item.Id = $scope.currentcontext.eid;
            $scope.item.EstimatedBillDist = $scope.currentcontext.TotDiscAmount;
            $scope.item.EstimatedBillDistTypeId = $scope.currentcontext.DiscountModeId;
            var actionName = 'Encounter/Visit/UpdateEncounter';
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.DiscountChange = function () {
            try {
                if ($scope.currentcontext.totnet > 0) {
                    if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) {
                        $scope.currentcontext.TotDiscAmount = (parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.currentcontext.totnet);
                        $scope.currentcontext.TotDiscAmount = ($scope.currentcontext.TotDiscAmount).toFixed(2);
                    } else if ($scope.currentcontext.DiscountModeId == 1) {
                        $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                    }
                } else {
                    $scope.currentcontext.TotDiscAmount = 0;
                }
                if(parseFloat($scope.currentcontext.TotDiscAmount) > parseFloat($scope.currentcontext.totnet)){
                    $scope.currentcontext.TotDiscAmount = 0;
                }
            } catch (e) {
                $scope.currentcontext.TotDiscAmount = 0;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.currentcontext.DiscountModeId = 1;
            $scope.DiscountChange();
            $('#discountvalue').focus();
        };

        //React bridge: replaces the single <ui-select> for Discount Mode.
        $scope.handleReactAction = function (actionType, payload) {
            if (actionType == 'discountModeChange') {
                $scope.currentcontext.DiscountModeId = payload.id;
                $scope.DiscountChange();
            }
        };

        $scope.refreshReactProps = function () {
            $scope.reactPropsContainer = {
                reactProps: {
                    discountModeOptions: ($scope.lookup && $scope.lookup.DiscountMode) || [],
                    discountModeId: $scope.currentcontext.DiscountModeId
                },
                onAction: $scope.handleReactAction
            };
        };

        $scope.$watch('currentcontext.DiscountModeId', function () {
            $scope.refreshReactProps();
        });

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DiscountMode" },
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

})();
