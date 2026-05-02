(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('wardfilterController', wardfilterController);
    function wardfilterController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.Items = [];
        $scope.currentfilter = {
            WardId: -1
        };
        $scope.addNew = function () {
            $scope.openModal($scope.currentfilter.WardId);
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.warddisplay', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Ward" },
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
    wardfilterController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();