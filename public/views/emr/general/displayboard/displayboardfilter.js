(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('displayboardListController', displayboardListController);
    function displayboardListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorName: -1,
            DepartmentId: -1,
            LocationId: -1,
            DisplayStatusId: 1,
            DisplayNoId: -1
        };
        $scope.addNew = function () {
            $scope.openModal($scope.currentfilter.DisplayNoId, $scope.currentfilter.LocationId);
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.openModal = function (Id, LocId) {
            utl.Modal.open('app.displayboards', {
                params: { id: Id, locid: LocId }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DisplayNo" },
                { "Key": "LOCATION" },
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
    displayboardListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();