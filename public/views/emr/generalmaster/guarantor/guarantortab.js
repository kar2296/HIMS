(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorTabController', guarantorTabController);

    function guarantorTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('generalmaster.guarantortab.tabgeneral.lbl'),
                state: 'app.guarantortab.general',
                canDisable: false
            },
            // { title: $translate.instant('generalmaster.guarantortab.tabguarantorgst.lbl'), state: 'app.guarantortab.guarantorgst', canDisable: canDisableTab },
            // { title: $translate.instant('generalmaster.guarantortab.tabguarantorcardtypes.lbl'), state: 'app.guarantortab.guarantorcardtypes', canDisable: canDisableTab },
            { title: $translate.instant('generalmaster.guarantortab.tabagreements.lbl'), state: 'app.guarantortab.guarantoragreements', canDisable: canDisableTab },
            // { title: $translate.instant('generalmaster.guarantortab.tabcustomers.lbl'), state: 'app.guarantortab.guarantorcustomers', canDisable: canDisableTab },
            // { title: $translate.instant('generalmaster.guarantortab.tabcustomercards.lbl'), state: 'app.guarantortab.guarantorcustomercards', canDisable: canDisableTab },
            {
                title: $translate.instant('generalmaster.guarantortab.tabsupplementaryservices.lbl'),
                state: 'app.guarantortab.guarantorsupplementaryservices',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('generalmaster.guarantortab.tabsupplementarydrugs.lbl'),
                state: 'app.guarantortab.guarantorsupplementarydrugs',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('generalmaster.guarantortab.tabchecklist.lbl'),
                state: 'app.guarantortab.guarantorchecklist',
                canDisable: canDisableTab
            }
        ];

        $scope.backToList = function () {
            $state.go('app.guarantors');
        }

        $scope.addNew = function () {
            $state.go('app.guarantortab.general', {
                gid: 0
            });
        }

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
    }

    guarantorTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();