(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousMedicationListController', previousMedicationListController);

function previousMedicationListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    $scope.items = [];
    $scope.currentcontext =  {};

    $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.confirmCallback = $uibModalInstance.close;
    $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

    $scope.toggleCanShowDetails = function(clickedItem) {
        for(var idx in $scope.items) {
            var item = $scope.items[idx];
            if(item.Id == clickedItem.Id) {
                item.CanShowDetails = !item.CanShowDetails;
            } else {
                item.CanShowDetails = false;
            }
        }
    }

    $scope.getListCallback = function (scope, res, options, hasError) {
        $scope.items = res.Data;

        for(var idx in $scope.items) {
            var item = $scope.items[idx];
            if(idx == 0) {
                item.CanShowDetails = true;
            } else {
                item.CanShowDetails = false;
            }
        }
    };

    $scope.getList = function () {

        var inputData = {
            Params :[
                { Key: 2, Value: $scope.currentcontext.pid }
            ],
            PageContext:{
                PageSize: 100,
                PageNumber: 1
            }
        };

        var options = {
            action: 'emr/prescription/GetPrescriptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
        $scope.repeat = function (idx, item) {
            $state.go('patientemr.prescription', { id: 0, pid: $scope.currentcontext.pid, copyid: item.Id });
            $scope.confirmCallback();
        }

    $scope.getList();
}

previousMedicationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();