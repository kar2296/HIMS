(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('lisordertatController', lisordertatController);

    function lisordertatController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.ordertat = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = modalConfig.params.pid ? parseInt(modalConfig.params.pid) : null;
            $scope.currentcontext.oid = modalConfig.params.oid ? parseInt(modalConfig.params.oid) : null;
            $scope.currentcontext.odid = modalConfig.params.odid ? parseInt(modalConfig.params.odid) : null;
            $scope.currentcontext.testtypeid = modalConfig.params.testtypeid ? parseInt(modalConfig.params.testtypeid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.isLoading = false;

        function updateReactProps() {
            $scope.reactProps = {
                ordertat: $scope.ordertat || [],
                isLoading: !!$scope.isLoading,
                currentcontext: $scope.currentcontext
            };
        }

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'close':
                    if ($scope.cancelCallback) {
                        $scope.cancelCallback();
                    }
                    break;
                case 'refresh':
                    $scope.getList();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            var rawData = (res && res.Data) ? res.Data : [];
            $scope.PreviousOrderDetails = [];
            for (var idx in rawData) {
                var item = rawData[idx];
                if ($scope.currentcontext.testtypeid === 1) {
                    if (item.PatientOrderDetail && item.PatientOrderDetail.DepartmentId === 8) {
                        $scope.PreviousOrderDetails.push(item);
                    }
                } else if ($scope.currentcontext.testtypeid === 2) {
                    if (item.PatientOrderDetail && item.PatientOrderDetail.DepartmentId === 62) {
                        $scope.PreviousOrderDetails.push(item);
                    }
                } else if ($scope.currentcontext.testtypeid === 3) {
                    if (item.PatientOrderDetail && item.PatientOrderDetail.DepartmentId === 60) {
                        $scope.PreviousOrderDetails.push(item);
                    }
                } else {
                    $scope.PreviousOrderDetails.push(item);
                }
            }

            // If filtered list is empty, fallback to rawData
            if ($scope.PreviousOrderDetails.length === 0 && rawData.length > 0) {
                $scope.PreviousOrderDetails = rawData;
            }

            $scope.ordertat = $scope.PreviousOrderDetails;
            $scope.isLoading = false;
            updateReactProps();
        };

        $scope.getList = function () {
            $scope.isLoading = true;
            updateReactProps();

            var params = [];
            if ($scope.currentcontext.pid) params.push({ Key: 4, Value: $scope.currentcontext.pid });
            if ($scope.currentcontext.oid) params.push({ Key: 5, Value: $scope.currentcontext.oid });
            if ($scope.currentcontext.odid) params.push({ Key: 6, Value: $scope.currentcontext.odid });

            var inputData = {
                Params: params,
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

        updateReactProps();
        $scope.getList();
    }

    lisordertatController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();