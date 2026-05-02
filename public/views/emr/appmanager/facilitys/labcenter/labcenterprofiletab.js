(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCenterProfileTabController', LabCenterProfileTabController);

    function LabCenterProfileTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout, utl) {

        if ($stateParams.tp == 'dt') {
            $stateParams.id = utl.Session.getCurrentFacilityId();
        }

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('Details'),
                state: 'app.labcenterprofiletab.labcenterprofile',
                canDisable: false
            },
            {
                title: $translate.instant('Tests'),
                state: 'app.labcenterprofiletab.labcentertestlist',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('Configure Slots'),
                state: 'app.labcenterprofiletab.labcenterslotslist',
                canDisable: canDisableTab
            },
        ];
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.backToList = function() {
            $state.go('app.facilitys');
        }
        $scope.switchTab = function(tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    LabCenterProfileTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout', 'utl'];
})();