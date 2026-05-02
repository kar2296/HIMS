(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('B2BCustomerTabController', B2BCustomerTabController);

    function B2BCustomerTabController($scope, $stateParams, $state, $translate, utl) {
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            // { title: $translate.instant('lis.externalprovidermaster.pagetitle1.lbl'), state: 'app.externalprovidertab.externalproviders', canDisable: false },
            // { title: $translate.instant('lis.externalprovidermaster.pricemapping.lbl'), state: 'app.externalprovidertab.pricemapping', canDisable: canDisableTab }
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
    B2BCustomerTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();