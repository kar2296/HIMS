(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('externalProviderTabController', externalProviderTabController);

    function externalProviderTabController($scope, $stateParams, $state, $translate, utl) {
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('lis.externalprovidermaster.externalprovider.lbl'), state: 'app.externalprovidertab.externalproviders', canDisable: false },
            { title: $translate.instant('lis.externalprovidermaster.pricemapping.lbl'), state: 'app.externalprovidertab.pricemapping', canDisable: canDisableTab }
        ];


        $scope.backToList = function () {
            $state.go('app.externalprovider');
        }




        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }
    externalProviderTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();