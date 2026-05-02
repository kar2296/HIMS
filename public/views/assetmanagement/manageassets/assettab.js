(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetTabController', assetTabController);

    function assetTabController($scope, $stateParams, $state, $translate) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);
        // var tabvm = this;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.Status = $stateParams.Status;
        $scope.isRequested = false;
        $scope.tabs = [{
                title: $translate.instant('assetmanagement.assettab.tabdetails.lbl'),
                state: 'app.assettab.details',
                canDisable: false
            },
            {
                title: $translate.instant('assetmanagement.assettab.tabassetwarrenty.lbl'),
                state: 'app.assettab.assetwarranties',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('assetmanagement.assettab.tabassetmaintanance.lbl'),
                state: 'app.assettab.assetmaintanance',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('assetmanagement.assettab.tabassetaccessories.lbl'),
                state: 'app.assettab.assetaccessories',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('assetmanagement.assettab.tabassetdocuments.lbl'),
                state: 'app.assettab.assetdocuments',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('assetmanagement.assettab.insurance.lbl'),
                state: 'app.assettab.insurance',
                canDisable: canDisableTab
            },

        ];

        $scope.backToList = function () {
            $state.go('app.assets');
        }
        $scope.addNew = function () {
            $state.go('app.assettab.details', {
                id: 0,
                Status:''
            });
            $scope.isRequested = true;
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    assetTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();