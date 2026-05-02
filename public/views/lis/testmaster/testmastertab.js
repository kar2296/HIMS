(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testmasterTabController', testmasterTabController);

    function testmasterTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('lis.testmastertab.tabtestmaster.lbl'),
                state: 'app.testmastertab.testmaster',
                canDisable: false
            },
            // {
            //     title: $translate.instant('lis.testmastertab.tabtestfacility.lbl'),
            //     state: 'app.testmastertab.testmasterfacilitymap',
            //     canDisable: canDisableTab
            // },
            {
                title: $translate.instant('lis.testmastertab.tabtestanalyte.lbl'),
                state: 'app.testmastertab.testmasteranalytemaps',
                canDisable: canDisableTab
            },
            // {
            //     title: $translate.instant('lis.testmastertab.tabtestdiagnosis.lbl'),
            //     state: 'app.testmastertab.testdiagnosismappings',
            //     canDisable: canDisableTab
            // },
            // {
            //     title: $translate.instant('lis.testmastertab.tabtesttemplate.lbl'),
            //     state: 'app.testmastertab.testtemplatemasters',
            //     canDisable: canDisableTab
            // },
            // { title: $translate.instant('lis.testmastertab.tabinstruction.lbl'), state: 'app.testmastertab.testinstructionmasters', canDisable: canDisableTab },
             { title: $translate.instant('lis.testmastertab.tabbom.lbl'), state: 'app.testmastertab.testbommasters', canDisable: canDisableTab }

        ];

        $scope.backToList = function () {
            $state.go('app.testmasters');
        }
        $scope.addNew = function () {
            $state.reload();
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    testmasterTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();