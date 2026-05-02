(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentTabController', appointmentTabController);

function appointmentTabController($scope, $stateParams, $state, $translate) {
    
    var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

    $scope.tabs = [
        {title : $translate.instant('appointment.appointmenttab.tabdetails.lbl'), state : 'app.appointmenttab.details', canDisable : false },
        {title : $translate.instant('appointment.appointmenttab.taborder.lbl'), state : 'app.appointmenttab.order',  canDisable : canDisableTab}
    ];
    
    $scope.backToList = function () {
       $state.go('app.appointments');
    }

    $scope.switchTab = function(tab) {
        $state.go(tab.state);    
    }
}

appointmentTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();