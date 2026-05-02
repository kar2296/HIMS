(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatescreenTabController', templatescreenTabController);

    function templatescreenTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) === 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('clinicalmaster.profile-list.manage-profiles.lbl'), state: 'app.templatescreentab.templatescreen', canDisable: canDisableTab },
            { title: $translate.instant('clinicalmaster.profilesection.pagetitle.lbl'), state: 'app.templatescreentab.templatescreensection', canDisable: canDisableTab },
            { title: $translate.instant('clinicalmaster.profileuser-form.parentpagetitle.lbl'), state: 'app.templatescreentab.templatescreenusers', canDisable: canDisableTab },
            // { title: $translate.instant('clinicalmaster.profileprintconfig.pagetitle.lbl'), state: 'app.templatescreentab.templatescreenprintconfig', canDisable: canDisableTab },
        ];

        $scope.backToList = function () {
            $state.go('app.templatescreens');
        };
        $scope.addNew = function () {
            $state.go('app.templatescreentab.templatescreen', {
                id: 0
            });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };
    }

    templatescreenTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();