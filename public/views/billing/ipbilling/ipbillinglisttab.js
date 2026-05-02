(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipbillinglistTabController', ipbillinglistTabController);

    function ipbillinglistTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('billing.ipbillingtab.inpatients.lbl'), state: 'app.ipbilling-listtab.inpatients', canDisable: false },
            { title: $translate.instant('billing.ipbillingtab.dischargedpatients.lbl'), state: 'app.ipbilling-listtab.dischargedpatients', canDisable: canDisableTab }
        ];

        tabvm.currentcontext = {
            patientid: 0
        };

        $scope.openattachments = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.item.PatientId, itemid: $scope.item.Id },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }


        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }

        $scope.addNewFull = function () {
            $state.go('app.fullbillingtab.basic', { id: 0 });
        }

        $scope.addNewQuick = function () {
            $state.go('app.quickbilling', { id: 0 });
        }

        //Patient picker related code starts
        function patientPickerCallback(patientdata) {
            $state.go('app.fullbillingtab.basic', { id: patientdata.pid });
        }

        $scope.pickPatient = function () {
            utl.Modal.open('app.patientpicker', {
                params: {},
                confirmCallback: patientPickerCallback
            });
        }
        //Patient picker related code ends

        //Reload banner code starts
        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        tabvm.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }
        //Reload banner code ends
    }

    ipbillinglistTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();