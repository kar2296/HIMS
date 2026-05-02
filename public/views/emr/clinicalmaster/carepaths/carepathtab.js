(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('carepathTabController', carepathTabController);

    function carepathTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('clinicalmaster.carepathtab.tabdetails.lbl'), state: 'app.carepathtab.details', canDisable: false },
            { title: $translate.instant('clinicalmaster.carepathtab.tabcarepathassesments.lbl'), state: 'app.carepathtab.carepathassesments', canDisable: canDisableTab },
            { title: $translate.instant('clinicalmaster.carepathtab.carepathclinicalorders.lbl'), state: 'app.carepathtab.carepathclinicalorders', canDisable: canDisableTab },
            { title: $translate.instant('clinicalmaster.carepathtab.carepathprescriptions.lbl'), state: 'app.carepathtab.prescriptions', canDisable: canDisableTab },
             { title: $translate.instant('clinicalmaster.carepathtab.procedueres.lbl'), state: 'app.carepathtab.procedueres', canDisable: canDisableTab },
             { title: $translate.instant('clinicalmaster.carepathtab.questeriesections.lbl'), state: 'app.carepathtab.sections', canDisable: canDisableTab }
        ];

        $scope.backToList = function () {
            $state.go('app.carepath');
        }
        $scope.addNew = function () {
            $state.go('app.carepathtab.details', { id: 0 });
        }
             
 $scope.switchTab = function(tab) {
        if(!canDisableTab){
            $state.go(tab.state);
        }    
    }
    }

    carepathTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();