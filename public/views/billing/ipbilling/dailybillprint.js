(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dailyPrintController', dailyPrintController);

    function dailyPrintController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.isFinalized = modalConfig.params.isFinalized;
            $scope.currentcontext.isGuarantor = modalConfig.params.isGuarantor;
            $scope.currentcontext.PrintUser = modalConfig.params.PrintUser;
            $scope.currentcontext.fromdate = modalConfig.params.fromdate;
            $scope.currentcontext.todate = utl.Formatter.getCurrentDate();
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.print = function () {
            var From = $filter('date')($scope.currentcontext.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    FromDate: From,
                    ToDate: To,
                    isFinalized: $scope.currentcontext.isFinalized,
                    isGuarantor: $scope.currentcontext.isGuarantor,
                    PrintUser: $scope.currentcontext.PrintUser
                }
            };
            var options = {
                action: 'billing/patientbills/PrintDailyInpatientBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };
    }

    dailyPrintController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();