(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorTabController', DoctorTabController);

    function DoctorTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {


        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('virtualhealth.doctors.tabgeneral.lbl'),
                state: 'app.doctortab.doctorform',
                canDisable: false
            },
            {
                title: $translate.instant('virtualhealth.doctors.tabconsultationservice.lbl'),
                state: 'app.doctortab.docconsultcharges',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('virtualhealth.doctors.tabcategorymap.lbl'),
                state: 'app.doctortab.doccategorymap',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('virtualhealth.doctors.tabsessionmap.lbl'),
                state: 'app.doctortab.docsessions',
                canDisable: canDisableTab
            },
        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.backToList = function () {
            $state.go('app.doctorlist');
        }
        $scope.addNew = function () {
            $state.go('app.doctortab.doctorform', {
                id: 0
            });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    DoctorTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();