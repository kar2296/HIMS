(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otregisterTabController', otregisterTabController);

    function otregisterTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        $scope.currentcontext = {
            id: parseInt($stateParams.id)
        };
        $scope.userid = utl.Session.getUserTypeId();
        if (utl.Session.getUserTypeId() == 2) {
            $scope.userid = utl.Session.getUserTypeId();
        }

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.SelectedItem = {};
        $scope.tabs = [
            { title: $translate.instant('otregister-form.pagetitle.lbl'), state: 'app.otregistertab.otregister', canDisable: false },
            { title: $translate.instant('otregisterequipment-tab.pagetitle.lbl'), state: 'app.otregistertab.equipmentsused', canDisable: canDisableTab },
            // { title: $translate.instant('otregistermaterialrequest-tab.pagetitle.lbl'), state: 'app.otregistertab.materialrequests', canDisable: canDisableTab },
            // { title: $translate.instant('otregistermaterialissue-tab.pagetitle.lbl'), state: 'app.otregistertab.materialissues', canDisable: canDisableTab },
            // { title: $translate.instant('otregistermaterialreturn-tab.pagetitle.lbl'), state: 'app.otregistertab.materialreturns', canDisable: canDisableTab },
            // { title: $translate.instant('otregistersurgicalnote-tab.pagetitle.lbl'), state: 'app.otregistertab.surgicalnote', canDisable: canDisableTab },
            // { title: $translate.instant('otregisteranesthesiannote-tab.pagetitle.lbl'), state: 'app.otregistertab.anesthesiannote', canDisable: canDisableTab },
            // { title: $translate.instant('otregistermaterialissue-tab.document.lbl'), state: 'app.otregistertab.documents', canDisable: canDisableTab },
            // { title: $translate.instant('otregistermaterialissue-tab.otnotes.lbl'), state: 'app.otregistertab.otnotes', canDisable: canDisableTab }
        ];

        $scope.findRequests = function () { };

        $scope.otSchedule = function () { };

        // $scope.addNew = function () {
        //     $state.go('app.otregister', { id: 0 });
        // };

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };

        $scope.addNew = function () {
            $state.go('app.otregistertab.otregister', { id: 0, eid: 0, pid: 0 });
        };
    }

    otregisterTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();