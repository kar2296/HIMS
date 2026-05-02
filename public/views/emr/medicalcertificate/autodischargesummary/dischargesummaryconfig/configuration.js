(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargeSummaryConfigController', dischargeSummaryConfigController);

    dischargeSummaryConfigController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

    function dischargeSummaryConfigController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        //Preference code
        angular.extend(this, utl.Ctrl.getUPCtrl({ $scope: $scope }));

        $scope.currentcontext = {
            PrefKey: '',
            Selected: null,
            MasterList: [],
            SelectedList: []
        };


        if (modalConfig && modalConfig.params) {
            var cfg = modalConfig.params.cfg;

            $scope.currentcontext.PrefKey = cfg.prefkey;
            $scope.currentcontext.MasterList = cfg.master;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        function saveUPSuccess() {
            $scope.confirmCallback();
        }

        $scope.saveItem = function () {
            var inputData = { selected: $scope.currentcontext.SelectedList }
            $scope.saveUP($scope.currentcontext.PrefKey, inputData, saveUPSuccess);
        }

        //get up
        function getUserPrefCallback(prefValue) {
            if (prefValue) {
                $scope.currentcontext.SelectedList = prefValue.selected;
                $scope.currentcontext.MasterList = _.differenceBy($scope.currentcontext.MasterList, $scope.currentcontext.SelectedList, 'Id');
            }
        }
        $scope.getUP($scope.currentcontext.PrefKey, getUserPrefCallback);
    }


})();