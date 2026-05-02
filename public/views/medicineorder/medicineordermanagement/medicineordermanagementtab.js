(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MedicineOrderManagementTabController', MedicineOrderManagementTabController);

    function MedicineOrderManagementTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);s

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
            title: $translate.instant('patientportal.medicineorder.pendingorders.lbl'),
            state: 'app.medicineordermanagementtab.medcineorderpendingorder',
            canDisable: false
        },
        {
            title: $translate.instant('patientportal.medicineorder.completeorders.lbl'),
            state: 'app.medicineordermanagementtab.medicineordercompleteorder',
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

    MedicineOrderManagementTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();