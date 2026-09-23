(function () {
    'use strict';

    /**
     * Hollow controller for the React "Dispensed Items" picker
     * (src/react-components/legacy-screens/DispensedItemsPickerScreen.tsx), opened as modal
     * 'app.emrpick-from-dispenselist' from Medicine Return. Closes with { ReturnData, IsPicked } like before.
     */
    angular
        .module('app.pages')
        .controller('emrpickfromdispenseListController', emrpickfromdispenseListController);

    function emrpickfromdispenseListController($scope, $translate, $uibModalInstance, modalConfig) {
        var params = (modalConfig && modalConfig.params) || {};
        var t = function (key) { return $translate.instant(key); };

        $scope.reactProps = {
            context: {
                encounterId: parseInt(params.encounterid, 10) || 0,
                patientId: parseInt(params.patientid, 10) || 0
            },
            labels: {
                title: t('pickdispenselist.pagetitle.lbl'),
                itemName: t('pickdispenselist.itemname.lbl'),
                billedQty: t('pickdispenselist.billedquantity.lbl'),
                returnedQty: t('pickdispenselist.returnedquantity.lbl'),
                transitQty: t('pickdispenselist.returntransitquantity.lbl'),
                returnQty: t('pickdispenselist.returnquantity.lbl'),
                batchId: t('pickdispenselist.batchid.lbl'),
                expiryDate: t('pickdispenselist.expirydate.lbl'),
                load: t('pickdispenselist.load.lbl'),
                exceedsBilled: t('pickdispenselist.actualquantity.lbl'),
                alreadyReturned: t('Billed Quantity Already Returned'),
                confirmLoad: t('pickdispenselist.confirmloadmsg.lbl'),
                selectOne: t('pickdispenselist.returnmaxquantity.lbl'),
                confirmTitle: t('common.confirm-modal-header.lbl'),
                yes: t('common.yeskey.lbl'),
                no: t('common.nokey.lbl')
            }
        };

        // Called from React event handlers (outside a digest), hence $applyAsync.
        $scope.onClose = function (result) {
            $scope.$applyAsync(function () { $uibModalInstance.close(result); });
        };
        $scope.onCancel = function () {
            $scope.$applyAsync(function () { $uibModalInstance.dismiss(); });
        };
    }

    emrpickfromdispenseListController.$inject = ['$scope', '$translate', '$uibModalInstance', 'modalConfig'];

})();
