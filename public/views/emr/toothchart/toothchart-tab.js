(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ToothChartTabController', ToothChartTabController);

    function ToothChartTabController($scope, $stateParams, $state, $translate, utl) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);
        // var tabvm = this;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        $scope.pid = $stateParams.pid;
        $scope.eid = $stateParams.eid;

        $scope.tabs = [];

        $scope.getPatientAge = function() {
            if ($scope.pid && $scope.pid > 0) {
                var options = {
                    action: 'registration/Patient/GetPatientById',
                    data: { Id: $scope.pid },
                    type: 'post',
                    onComplete: $scope.getPatientAgeCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientAgeCallback = function(scope, data, options, hasError) {
            if (data.DOB) {
                var Age = utl.Formatter.getAgeFromDOB(data.DOB);
                if (Age > 12) {
                    $scope.tabs = [
                        { title: $translate.instant('patientemr.toothchart.adultcharttab.lbl'), state: 'patientemr.toothcharttab.toothchart', canDisable: false },
                    ];
                    $scope.switchTab($scope.tabs[0]);
                } else {
                    $scope.tabs = [
                        { title: $translate.instant('patientemr.toothchart.childcharttab.lbl'), state: 'patientemr.toothcharttab.childtoothchart', canDisable: canDisableTab },
                    ];
                    $scope.switchTab($scope.tabs[0]);
                }
            }
        };

        $scope.getPatientAge();



        $scope.backToList = function() {
            $state.go('app.costs');
        }
        $scope.addNew = function() {
            $state.go('app.costtab.details', { id: 0 });
        }
        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        }
        $scope.doctor_dashboard = function() {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        }

        $scope.switchTab = function(tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    ToothChartTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();