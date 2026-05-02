(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('opVisitCancelController', opVisitCancelController);

    function opVisitCancelController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            BannerPatientId: -1,
            Remarks: '',
            Bill: {},
            EncounterId: -1,
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.BannerPatientId = modalConfig.params.pid;
            $scope.currentcontext.EncounterId = modalConfig.params.eid;
            $scope.currentcontext.Bill = modalConfig.params.bill;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.saveAndApprove = function () {
            if(savehitcompleted == 1) {
                utl.Alert.showErrorMsg('please wait processing....');
                return;
            }
            if (!$scope.currentcontext.Remarks) {
                utl.Alert.showErrorMsg('Visit Cancel Remarks is required');
                return;
            }
            if (!$scope.currentcontext.EncounterId || $scope.currentcontext.EncounterId < 0) {
                utl.Alert.showErrorMsg('Patient is not a registered patient');
                return;
            }
            var actionName = 'registration/patient/OPVisitCancel';
            savehitcompleted = 1;
            var options = {
                action: actionName,
                data: { Data:  $scope.currentcontext  },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg('Visit Cancelled');
            $scope.confirmCallback({pid: $scope.currentcontext.BannerPatientId });
            savehitcompleted = 0;
        }

        $scope.errorItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
        };

        $scope.clear = function () {
            $scope.currentcontext.Remarks = '';
            $scope.currentcontext.Bill= {};
            $scope.currentcontext.EncounterId= -1;
            savehitcompleted = 0;
        }


        //Lookup
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        // }
        // $scope.initLookup = function () {
        //     var inputData = [];
        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     utl.Http.doAction(options);
        // }
        // $scope.initLookup();


    }

    opVisitCancelController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();