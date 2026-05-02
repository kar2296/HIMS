(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('groupTabController', groupTabController);

    function groupTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        var canShowTab = parseInt($stateParams.id) > 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('appmanager.grouptab.tabgeneral.lbl'),
                state: 'app.grouptab.general',
                canShow: true
            },
            {
                title: $translate.instant('appmanager.grouptab.tabgrouprolemap.lbl'),
                state: 'app.grouptab.role',
                canShow: true
            },
            // {title : $translate.instant('appmanager.grouptab.tabgroupfacilitymap.lbl'), state : 'app.grouptab.facility', canShow : true},
        ];

        $scope.backToList = function () {
            $state.go('app.groups');
        }
        $scope.addNew = function () {
            $state.go('app.grouptab.general', {
                id: 0
            });
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
    }

    groupTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();