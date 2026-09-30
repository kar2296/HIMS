(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('groupTabController', groupTabController);

    function groupTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {
        var groupId = parseInt($stateParams.id) || 0;
        var canDisable = groupId === 0;

        $scope.tabs = [
            {
                title: $translate.instant('appmanager.grouptab.tabgeneral.lbl'),
                state: 'app.grouptab.general',
                canDisable: false,
                icon: 'fa-id-badge'
            },
            {
                title: $translate.instant('appmanager.grouptab.tabgrouprolemap.lbl'),
                state: 'app.grouptab.role',
                canDisable: canDisable,
                icon: 'fa-user-tag'
            },
            {
                title: 'Facility Mapping',
                state: 'app.grouptab.facility',
                canDisable: canDisable,
                icon: 'fa-hospital'
            }
        ];

        $scope.reactProps = {
            groupId: groupId,
            activeState: $state.current.name,
            tabs: $scope.tabs
        };

        $scope.handleReactAction = function (actionName, payload) {
            $timeout(function () {
                if (actionName === 'backToList') {
                    $state.go('app.groups');
                } else if (actionName === 'addNew') {
                    $state.go('app.grouptab.general', { id: 0 });
                } else if (actionName === 'switchTab') {
                    if (payload && payload.state) {
                        $state.go(payload.state, { id: groupId });
                    }
                }
            });
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }
    }

    groupTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();