(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReferralFollowupTabController', ReferralFollowupTabController);

    function ReferralFollowupTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.tabs = [{
                title: $translate.instant('patientemr.patientorder-list.neworder.lbl'),
                state: 'patientemr.referralfollowuptab.referralfollowup'
            },
            // {
            //     title: $translate.instant('patientemr.patientorder-list.currentlist.lbl'),
            //     state: 'patientemr.referralfollowuptab.currentreferrallist'
            // },
            {
                title: $translate.instant('patientemr.patientorder-list.history.lbl'),
                state: 'patientemr.referralfollowuptab.prevreferrallist'
            },
            // {
            //     title: $translate.instant('Past Visit'),
            //     state: 'patientemr.orderhistory'
            // },
        ];
        $scope.switchTab = function(tab) {
            $state.go(tab.state);
        }
        $scope.doctor_dashboard = function() {
            $state.go('app.virtualdashboard');
        };
        $scope.checkedinpatients = function() {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function() {
            $state.go('app.bedmanagementtab.inpatient');
        };

        // if ($scope.CanAllOutPatients) {
        //     $scope.switchTab($scope.tabs[0]);
        // }
    }



    ReferralFollowupTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();