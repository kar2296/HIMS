(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatescreenTabController', templatescreenTabController);

    function templatescreenTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) === 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('clinicalmaster.profile-list.manage-profiles.lbl'), state: 'app.templatescreentab.templatescreen', canDisable: canDisableTab, icon: 'fa-id-card' },
            { title: $translate.instant('clinicalmaster.profilesection.pagetitle.lbl'), state: 'app.templatescreentab.templatescreensection', canDisable: canDisableTab, icon: 'fa-layer-group' },
            { title: $translate.instant('clinicalmaster.profileuser-form.parentpagetitle.lbl'), state: 'app.templatescreentab.templatescreenusers', canDisable: canDisableTab, icon: 'fa-user-nurse' },
        ];

        $scope.reactProps = {
            id: parseInt($stateParams.id || 0),
            name: $stateParams.Name || '',
            activeState: $state.current.name,
            tabs: $scope.tabs
        };

        $scope.handleAction = function (actionName, payload) {
            $scope.$evalAsync(function () {
                if (actionName === 'switchTab' && payload && payload.state) {
                    $scope.switchTab(payload.tab || { state: payload.state });
                } else if (actionName === 'addNew') {
                    $scope.addNew();
                } else if (actionName === 'backToList') {
                    $scope.backToList();
                }
            });
        };

        $scope.backToList = function () {
            $state.go('app.templatescreens');
        };
        $scope.addNew = function () {
            $state.go('app.templatescreentab.templatescreen', {
                id: 0
            });
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };
    }

    templatescreenTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();