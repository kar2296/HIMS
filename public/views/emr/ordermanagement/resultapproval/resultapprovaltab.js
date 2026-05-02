(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('resultApprovalTabController', resultApprovalTabController);

    function resultApprovalTabController($scope, $stateParams, $state, $translate, utl) {

        $scope.tabs = [
            { title: $translate.instant('ordermanagement.resultapprovaltab.tabapprovalmyorders.lbl'), state: 'app.resultapprovaltab.approvalmyorders', canDisable: false },
            { title: $translate.instant('ordermanagement.resultapprovaltab.tabapprovalallorders.lbl'), state: 'app.resultapprovaltab.approvalallorders', canDisable: false },
            { title: $translate.instant('ordermanagement.resultapprovaltab.tabapprovalotherorders.lbl'), state: 'app.resultapprovaltab.otherresultapproval', canDisable: false }
        ];
        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }

        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        }
    }

    resultApprovalTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();