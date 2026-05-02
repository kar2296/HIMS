(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('lisordertatController', lisordertatController);

    function lisordertatController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.history = []
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.oid = parseInt(modalConfig.params.oid);
            $scope.currentcontext.odid = parseInt(modalConfig.params.odid);
            $scope.currentcontext.testtypeid = parseInt(modalConfig.params.testtypeid);
            // $scope.currentcontext.TestId = parseInt(modalConfig.params.tid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        //     $scope.history = vm.gridConfig.data;
        // };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.PreviousOrderDetails = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                console.log(item, 'item');
                if ($scope.currentcontext.testtypeid === 1) {
                    if (item.PatientOrderDetail.DepartmentId === 8)
                        $scope.PreviousOrderDetails.push(item)
                } else if ($scope.currentcontext.testtypeid === 2) {
                    if (item.PatientOrderDetail.DepartmentId === 62)
                        $scope.PreviousOrderDetails.push(item)
                } else if ($scope.currentcontext.testtypeid === 3) {
                    if (item.PatientOrderDetail.DepartmentId === 60)
                        $scope.PreviousOrderDetails.push(item)
                }
            }

        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.currentcontext.pid
                    },
                    // { Key: 18, Value: $scope.currentcontext.dpt },
                    { Key: 5, Value: $scope.currentcontext.oid },
                    // { Key: 6, Value: $scope.currentcontext.odid },
                    // { Key: 7, Value: $scope.currentfilter.TestId }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'lis/ordertat/GetOrderTATs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    lisordertatController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();