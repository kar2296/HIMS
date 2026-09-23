(function () {
    'use strict';

    /**
     * Hollow controller for the React antibiotic culture popup
     * (src/react-components/legacy-screens/AntibioticCultureScreen.tsx), opened as modal
     * 'app.antibiotic-culture'. Closes with { data: <culture report HTML> } like before.
     */
    angular
        .module('app.pages')
        .controller('AntibioticCultureController', AntibioticCultureController);

    function AntibioticCultureController($scope, $translate, utl, $uibModalInstance, modalConfig) {
        var params = (modalConfig && modalConfig.params) || {};
        var t = function (key) { return $translate.instant(key); };

        $scope.reactProps = {
            context: {
                patientId: parseInt(params.pid, 10) || 0,
                encounterId: parseInt(params.eid, 10) || 0,
                orderId: parseInt(params.orderid, 10) || 0,
                workOrderId: parseInt(params.id, 10) || 0
            },
            labels: {
                title: t('lis.antiobiotics.culture.lbl'),
                specimen: t('lis.antiobiotics.specimen.lbl'),
                organism: t('lis.antiobiotics.orgisolate.lbl'),
                gramStain: t('lis.antiobiotics.gramstain.lbl'),
                site: t('Site'),
                microNo: t('Micro No.'),
                growth: t('Growth'),
                cultureReport: t('Culture Report'),
                remarks: t('Remarks'),
                save: t('common.saveaction.lbl'),
                saved: t('common.successmsg.lbl')
            }
        };

        // Called from React event handlers (outside a digest), hence $applyAsync.
        $scope.onClose = function (result) {
            $scope.$applyAsync(function () { $uibModalInstance.close(result); });
        };
        $scope.onCancel = function () {
            $scope.$applyAsync(function () { $uibModalInstance.dismiss(); });
        };
        // Organism map maintenance is still an AngularJS popup; the React screen reloads its lookups after it closes.
        $scope.openLegacyModal = function (name, modalParams, onClosed) {
            $scope.$applyAsync(function () {
                var done = function () { if (typeof onClosed === 'function') { onClosed(); } };
                utl.Modal.open(name, { params: modalParams || {}, confirmCallback: done, cancelCallback: done });
            });
        };
    }

    AntibioticCultureController.$inject = ['$scope', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();
