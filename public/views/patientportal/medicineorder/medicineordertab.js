(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MedicineOrdeTabController', MedicineOrdeTabController);

    function MedicineOrdeTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);s

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
            title: $translate.instant('patientportal.medicineorder.prescriptionupload.lbl'),
            state: 'patientportal.medicineordertab.prescriptionupload',
            canDisable: false
        },
        // {
        //     title: $translate.instant('patientportal.medicineorder.medicinandproducts.lbl'),
        //     state: 'patientportal.medicineordertab.medicinandproducts',
        //     canDisable: false
        // },
        {
            title: $translate.instant('patientportal.medicineorder.orderhistory.lbl'),
            state: 'patientportal.medicineordertab.orderhistory',
            canDisable: false
        },
        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }

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

    MedicineOrdeTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();