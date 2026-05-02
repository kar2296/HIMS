(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietplanTabController', dietplanTabController);

    function dietplanTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('patientemr.patientdietplan-list.pagetitle.lbl'), state: 'patientemr.dietplantab.dietplan', canDisable: false },
            { title: $translate.instant('Patient Diet Plan List'), state: 'patientemr.dietplantab.dietplanlist', canDisable: false },
        ];

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        var vm = this;
        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        // $scope.openModal = function (appKey, stateParams) {
        //     utl.Modal.open(appKey, {
        //         params: stateParams,
        //         confirmCallback: $scope.getItem
        //     });
        // }
        $scope.addNew = function () {
            $state.go('patientemr.dietplantab.dietplan', { id: 0 });
        }
        // $scope.dietplanHistory = function () {
        //     utl.Modal.open('patientemr.dietplanform', {
        //         params: { id: 0 },
        //         confirmCallback: $scope.getList
        //     }
        //     );
        // };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.dietplanHistory = function () {
          
                utl.Modal.open('patientemr.dietplanform', {
                    params: { id: 0},
                    confirmCallback: $scope.getList
                });
         

        }
        $scope.dietOrder = function () {
            utl.Modal.open('patientemr.patientdietorder', {
                params: { id: 0 },
                confirmCallback: $scope.referralCallBack
            });
        }

    }

    dietplanTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();