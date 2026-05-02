(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDietOrderDetailFormController', patientDietOrderDetailFormController);

    function patientDietOrderDetailFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            //   IsAttender: true

        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            if (modalConfig.params.current_item) {
                $scope.item = modalConfig.params.current_item;
            }

            if (modalConfig.params.itemid) {
                $scope.item.DietItemId = parseInt(modalConfig.params.itemid);
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;


        $scope.saveItem = function () {
            $scope.confirmCallback($scope.item);
        }
        function setDefaults() {
            if ($scope.item.DietItemId > 0) {
                var test = utl.Lookup.getObject($scope.lookup.DietItemMaster, $scope.item.DietItemId);
                $scope.fillMasterInfo(diet);
            }
        }
        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.DietName = selectedItem.DietName;
            $scope.item.DietItemCode = selectedItem.DietItemCode;
            $scope.item.Description = selectedItem.Description;
            $scope.item.DietItemTypeId = selectedItem.DietItemTypeId;
            $scope.item.DietCategoryId = selectedItem.DietCategoryId;
            $scope.item.DietFrequencyId = selectedItem.DietFrequencyId;
            // $scope.item.Quantity = 1;
            // $scope.item.TestPrice = 10;
            // $scope.item.Discount = 0;
            // $scope.item.TaxCost = 0;
            // $scope.item.NetAmount = 10;
            // $scope.item.Status = 1;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DietItemType" },
                { "Key": "DietCategory" },
                { "Key": "DietFrequency" }
            ];

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

    patientDietOrderDetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();