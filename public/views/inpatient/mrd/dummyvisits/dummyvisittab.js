(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dummyVisittabController', dummyVisittabController);

    function dummyVisittabController($scope, $stateParams, $state, $translate, utl, $filter) {
        var tabvm = this;


        $scope.tabs = [
            { title: $translate.instant('dummyvisit.oppagetitle.lbl'), state: 'app.dummyvisits.additionalopvisit', canDisable: false },
            { title: $translate.instant('dummyvisit.ippagetitle.lbl'), state: 'app.dummyvisits.additionalipvisit', canDisable: false },
            { title: $translate.instant('dummyvisit.iplaborderpagetitle.lbl'), state: 'app.dummyvisits.additionaliplaborder', canDisable: false }
        ];

        tabvm.currentcontext = {
            id: 0
        };

        $scope.switchTab = function (tab) {
                $state.go(tab.state);
        }

        $scope.switchTab($scope.tabs[0]);

    }

    dummyVisittabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();