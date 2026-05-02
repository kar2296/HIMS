(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualBillInfoController', VirtualBillInfoController);

    function VirtualBillInfoController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.isSaveandApprove = true;
        $scope.PatientBillInfo = [];
        $scope.PatientBillInfoDetails = [];
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentcontext.oid = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;


        $scope.getVirtualBillsCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.currentcontext.id = $scope.item.Id;
            $scope.getvitualbillDetails();
        };

        $scope.VirtualBills = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.oid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    }
                ]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualBill/GetVirtualBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVirtualBillsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getvitualbillDetailsCallback = function (scope, res, options, hasError) {
            $scope.VirtualBillDetails = res.Data;
        };

        $scope.getvitualbillDetails = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.id
                }, ]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualBillDetail/GetVirtualBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvitualbillDetailsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.setIndexforTableIndex = function () {
            for (var idx in $scope.VirtualBillDetails) {
                if ($scope.VirtualBillDetails[idx].Status == 1) {
                    $scope.VirtualBillDetails[idx].itemidxdesc = 'desc' + idx;
                }
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.VirtualBills();
        };

        $scope.initLookup = function () {
            var inputData = [];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    VirtualBillInfoController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();