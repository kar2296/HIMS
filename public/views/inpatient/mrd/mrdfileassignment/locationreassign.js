(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LocationReassignController', LocationReassignController);

    function LocationReassignController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.currentcontext.rackid = parseInt(modalConfig.params.rackid);
        $scope.currentcontext.self = modalConfig.params.self;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.item.RackId = $scope.currentcontext.rackid;
        $scope.item.Self = $scope.currentcontext.self;
        // $scope.savelocation = function () {
        //     $scope.confirmCallback({ Rack: $scope.item.RackId, Self: $scope.item.Self });
        // };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.UpdateLocation = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                $scope.item.Id = $scope.currentcontext.id;
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

    LocationReassignController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();