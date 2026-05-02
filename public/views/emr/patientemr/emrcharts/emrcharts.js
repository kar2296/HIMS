(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('emrchartsController', emrchartsController);

    function emrchartsController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.SelectedAssetManageId = 1
        $scope.items = [];
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.positionbpchart = function () {
            $state.go('patientemr.positionbpcharttab.positionbpchart', {
              pid: $scope.currentcontext.pid,
              context: $scope.pagecontext
            });
          };
    
          $scope.diabeteschart = function () {
            $state.go('patientemr.diabetescharttab.currentlist', {
              pid: $scope.currentcontext.pid,
              context: $scope.pagecontext
            });
          };
    
          $scope.cdcharts = function () {
            $state.go('patientemr.cdcharttab.cdchartcurrentlist', {
              pid: $scope.currentcontext.pid,
              context: $scope.pagecontext
            });
          };
    }
    emrchartsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();