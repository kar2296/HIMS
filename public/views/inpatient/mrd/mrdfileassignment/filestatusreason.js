(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FileStatusReasonController', FileStatusReasonController);

    function FileStatusReasonController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.currentcontext.statusid = parseInt(modalConfig.params.statusid);
        $scope.currentcontext.misplacereason = modalConfig.params.misplacereason;
        $scope.currentcontext.damagereason = modalConfig.params.damagereason;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.item.MisplacedReason = $scope.currentcontext.misplacereason;
        $scope.item.DamagedReason = $scope.currentcontext.damagereason;

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.ReverseFileStatus = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                $scope.item.Id = $scope.currentcontext.id;
                $scope.item.MRDMovementStatusId = 3;

                var options = {
                    action: 'IPManagement/MRDLocation/UpdateMRDLocationData',
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.UpdateFileStatus = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                $scope.item.Id = $scope.currentcontext.id;
                $scope.item.MRDMovementStatusId = $scope.currentcontext.statusid;

                var options = {
                    action: 'IPManagement/MRDLocation/UpdateMRDLocationData',
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
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

    FileStatusReasonController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();