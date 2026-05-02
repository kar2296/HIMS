(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('generalboardListController', generalboardListController);
    function generalboardListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.Items = [];
        $scope.currentfilter = {
            LocationId: -1,
            DisplayNoId: -1,
            GeneralDisplayStatusId: 2
        };
        $scope.addNew = function () {
            $scope.openModal($scope.currentfilter.DisplayNoId);
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.generalboards', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DisplayNo" },
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
    generalboardListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();