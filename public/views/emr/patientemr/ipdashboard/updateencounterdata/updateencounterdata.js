(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('UpdateEncounterDataController', UpdateEncounterDataController);

    function UpdateEncounterDataController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = parseInt(modalConfig.params.eid);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getEncounter = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'Visit/Visit/GetEncounterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getEncounterCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
            $state.reload();
        };

        $scope.UpdateEncData = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                $scope.item.Id = $scope.currentcontext.id;
                var options = {
                    action: 'Visit/Visit/UpdateEncounter',
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounter();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "FileRack" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
        // loadData();
    }

    UpdateEncounterDataController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();