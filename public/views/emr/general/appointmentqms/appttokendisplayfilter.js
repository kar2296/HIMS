(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('AppnmttokenfilterController', AppnmttokenfilterController);
    function AppnmttokenfilterController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.Items = [];
        $scope.currentfilter = {
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            TokenStatusId: 2
        };
        $scope.addNew = function () {
            $scope.openModal($scope.currentfilter.LocationId);
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.appnmttokendisplay', {
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
               { "Key": "QmsLocation" },
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
    AppnmttokenfilterController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();