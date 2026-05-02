(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceSubCategoryFormController', serviceSubCategoryFormController);

    function serviceSubCategoryFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        $scope.currentcontext = {
            selectedtab: 'details',
            button:true,

        }
        initPriority();
        function initPriority() {
            $scope.currentPriority = {
                PriorityId: 1,
                TurnAroundTime: "",
                TurnAroundTimePeriodId: 1,
                TurnAroundTimePeriod: "",
                Priority: "",
                Status: 1
            };
        }

        $scope.addPriority = function () {
            if ($scope.currentPriority.PriorityId == -1 || !$scope.currentPriority.TurnAroundTime ||
                $scope.currentPriority.TurnAroundTimePeriodId == -1) {
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                return;
            }
            $scope.currentPriority.Priority = utl.Lookup.getDesc($scope.lookup.OrderPriority, $scope.currentPriority.PriorityId);
            $scope.currentPriority.TurnAroundTimePeriod = utl.Lookup.getDesc($scope.lookup.DurationPeriod, $scope.currentPriority.TurnAroundTimePeriodId);
            $scope.item.Priorities.push($scope.currentPriority);
            initPriority();

        }

        if (modalConfig.params.current_item) {
            $scope.item = modalConfig.params.current_item;
            $scope.item.Priorities = $scope.item.Priorities || [];

            for (var idx in $scope.item.Priorities) {
                var item = $scope.item.Priorities[idx];
                if (item.OrderPriority) {
                    item.Priority = item.OrderPriority.Description;
                }
                if (item.DurationPeriod) {
                    item.TurnAroundTimePeriod = item.DurationPeriod.Description;
                }
            }
        }

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        // $scope.saveItem = function () {
        //     $scope.confirmCallback($scope.item);
        // }


        $scope.tabs = [
            { title: $translate.instant('clinicalmaster.servicesubcategory-form.tabdetails.lbl'), key: "details" },
            { title: $translate.instant('clinicalmaster.servicesubcategory-form.tabpriority.lbl'), key: "priority" }
        ];


        $scope.backToList = function () {
            $state.go('app.servicesubcategories');
        }

        $scope.switchTab = function (item) {
             $scope.currentcontext.selectedtab = item.key;
            if ($scope.currentcontext.selectedtab == 'priority')
                $scope.currentcontext.button = false;
            else
                $scope.currentcontext.button = true;
        }

        $scope.saveItem = function () {
            $scope.confirmCallback($scope.item);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;


        }
        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        }

        $scope.deleteItem = function (idx, item) {
            var name = item.Priority || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderPriority" },
                { "Key": "DurationPeriod" }
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

    serviceSubCategoryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();