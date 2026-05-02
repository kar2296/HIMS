(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetDisposeTabController', AssetDisposeTabController);

    function AssetDisposeTabController($scope, $stateParams, $state, $translate) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);
        // var tabvm = this;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('Dispose Request'), state: 'app.assetdisposetab.disposerequest', canDisable: false },
            { title: $translate.instant('Condemnation'), state: 'app.assetdisposetab.condemnation', canDisable: canDisableTab },
            { title: $translate.instant('Dispose'), state: 'app.assetdisposetab.dispose', canDisable: canDisableTab },
            { title: $translate.instant('Disposed Asset'), state: 'app.assetdisposetab.disposedasset', canDisable: canDisableTab },

        ];
        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };
        $scope.backToList = function () {
            $state.go('app.assets');
        }
        $scope.addNew = function () {
            $state.go('app.assettab.details', { id: 0 });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    AssetDisposeTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();