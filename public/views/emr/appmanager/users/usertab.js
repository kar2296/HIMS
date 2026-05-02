(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('userTabController', userTabController);

    function userTabController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);s

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('appmanager.usertab.tabgeneral.lbl'),
                state: 'app.usertab.general',
                canDisable: false
            },
            // {
            //     title: $translate.instant('appmanager.usertab.tabuserdeptmap.lbl'),
            //     state: 'app.usertab.usrdeptmap',
            //     canDisable: canDisableTab
            // },
            {title : $translate.instant('appmanager.usertab.tabuserfacilitymap.lbl'), state : 'app.usertab.userfacilitymap', canDisable : canDisableTab},
            // {
            //     title: $translate.instant('appmanager.usertab.tabuserspecialitymap.lbl'),
            //     state: 'app.usertab.userspecialitymap',
            //     canDisable: canDisableTab
            // },
            // {title : $translate.instant('appmanager.usertab.tabuserteams.lbl'), state : 'app.usertab.userteams', canDisable : canDisableTab},
            // {title : $translate.instant('appmanager.usertab.tabusertaxdetail.lbl'), state : 'app.usertab.usertaxdetail', canDisable : canDisableTab},
            {
                title: $translate.instant('appmanager.usertab.tabconsultationservice.lbl'),
                state: 'app.usertab.consultationservice',
                canDisable: canDisableTab
            },
            // {title : $translate.instant('appmanager.usertab.tabuserweeklyholidays.lbl'), state : 'app.usertab.userweeklyholidays', canDisable : canDisableTab}
        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);
    
        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.backToList = function () {
            $state.go('app.users');
        }
        $scope.addNew = function () {
            $state.go('app.usertab.general', {
                id: 0
            });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    userTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();