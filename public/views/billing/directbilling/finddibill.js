(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('finddirectbillListController', finddirectbillListController);

    function finddirectbillListController($scope, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        var context = modalConfig && modalConfig.params ? modalConfig.params.context : 'DG';
        var facilityId = parseInt(utl.Session.getCurrentFacilityId()) || 1;

        vm.reactProps = {
            context: context,
            modalParams: modalConfig ? modalConfig.params : {},
            facilityId: facilityId,
            onSelect: function (data) {
                if ($uibModalInstance && $uibModalInstance.close) {
                    $uibModalInstance.close(data);
                }
            },
            onClose: function () {
                if ($uibModalInstance && $uibModalInstance.dismiss) {
                    $uibModalInstance.dismiss('cancel');
                }
            },
            onPatientInfo: function (patientId) {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: patientId
                    }
                });
            }
        };
    }

    finddirectbillListController.$inject = ['$scope', 'utl', '$uibModalInstance', 'modalConfig'];
})();