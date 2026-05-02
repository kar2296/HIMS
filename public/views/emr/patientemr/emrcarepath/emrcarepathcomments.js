(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('carePathCommentsController', carePathCommentsController);

    function carePathCommentsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.PageTitle = '';

        $scope.observationconfig = {
            tablist: modalConfig.params.tablist,
            actiontype: modalConfig.params.actiontype
        };

        if($scope.observationconfig.tablist)
        {
            if ($scope.observationconfig.tablist == 1) // Assesment
            {
                $scope.PageTitle =  $translate.instant('clinicalmaster.carepathassessment-form.addnew-tooltip.lbl');
            }
            else if ($scope.observationconfig.tablist == 2) // Investigation
            {
                $scope.PageTitle =  $translate.instant('clinicalmaster.carepathclinicalorders.pagetitle.lbl');
            }
            else if ($scope.observationconfig.tablist == 3) // Prescrition
            {
                $scope.PageTitle =  $translate.instant('clinicalmaster.carepathprescriptions.pagetitle.lbl');
            }
            else if ($scope.observationconfig.tablist == 4) // Procedure
            {
                $scope.PageTitle =  $translate.instant('clinicalmaster.carepathprocedures.pagetitle.lbl');
            }
            else if ($scope.observationconfig.tablist == 5) // Questionary
            {
                $scope.PageTitle =  $translate.instant('clinicalmaster.carepathsectios.pagetitle.lbl');
            }
        }

        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
        }
    }

    carePathCommentsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();