(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('messagesNewController', messagesNewController);

    function messagesNewController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.mlcoffid);
            $scope.currentcontext.encounterid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'Visit/EncounterMLCOfficer/GetEncounterMLCOfficerById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.backToList = function () {
            $scope.confirmCallback($scope.item);
        }

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.EncounterId = $scope.currentcontext.encounterid;
            $scope.confirmCallback($scope.item);
        }

        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getItem();
        // }

        // $scope.initLookup = function () {
        //     var inputData = [
        //         { "Key": "MlcType" }
        //     ];

        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     // utl.Http.doAction(options);
        // }

        // $scope.initLookup();
        $scope.getItem();
    }

    messagesNewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();