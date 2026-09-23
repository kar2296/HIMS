(function () {
    'use strict';

    /**
     * Hollow controller for the React test template screen
     * (src/react-components/legacy-screens/TestTemplateMasterScreen.tsx).
     */
    angular
        .module('app.pages')
        .controller('testTemplateMastersFormController', testTemplateMastersFormController);

    function testTemplateMastersFormController($scope, $stateParams, $state, $translate) {
        $scope.reactProps = {
            testMasterId: parseInt($stateParams.id, 10) || 0,
            labels: {
                title: $translate.instant('lis.testtemplatemasters.pagetitle.lbl'),
                male: $translate.instant('lis.testtemplatemasters.male.lbl'),
                female: $translate.instant('lis.testtemplatemasters.female.lbl'),
                back: $translate.instant('common.backaction.lbl'),
                save: $translate.instant('common.saveaction.lbl'),
                cancel: $translate.instant('common.cancelaction.lbl'),
                saved: $translate.instant('common.successmsg.lbl')
            }
        };

        // Called from React event handlers (outside a digest), hence $applyAsync.
        $scope.navigateTo = function (stateName, params) {
            $scope.$applyAsync(function () {
                $state.go(stateName, params || {});
            });
        };
    }

    testTemplateMastersFormController.$inject = ['$scope', '$stateParams', '$state', '$translate'];

})();
