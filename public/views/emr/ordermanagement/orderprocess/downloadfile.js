(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('downloadFormController', downloadFormController);

        downloadFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig', '$timeout'];

    function downloadFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;
        $scope.URL= "";
        $scope.FileName = "";
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.URL= modalConfig.params.url;
            $scope.FileName = modalConfig.params.filename;
            $scope.currentcontext.EncounterId = modalConfig.params.eid;
            $scope.currentcontext.PatientId = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.backToList = function () {
            $scope.confirmCallback();
        }


    }



})();