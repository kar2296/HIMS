(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousOrderListController', previousOrderListController);

function previousOrderListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    $scope.items = [];
    $scope.currentcontext =  {};
     $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext.pid = modalConfig.params.pid;
    
        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
            var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                item.CanShowDetails = !item.CanShowDetails;
            } else {
                item.CanShowDetails = false;
            }
        }
    }

        $scope.custom_sort = function (a, b) {
            return new Date(b.OrderRequestDate).getTime() - new Date(a.OrderRequestDate).getTime();
        }
    $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
        $scope.items = res.Data;
        
            for (var idx in $scope.items) {
            var item = $scope.items[idx];
                if (idx == 0) {
                item.CanShowDetails = true;
            } else {
                item.CanShowDetails = false;
            }
        }

    };

    $scope.getList = function () {

        var inputData = { 
                Params: [
                { Key: 2, Value: $scope.currentcontext.pid }
            ],
                PageContext: {
                PageSize: 100,
                PageNumber: 1
            }
        };

        var options = {
            action: 'emr/patientorder/GetPatientOrders',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

        $scope.handleEvents = function (actionType, row) {
    }

    $scope.getList();
}
 
previousOrderListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();