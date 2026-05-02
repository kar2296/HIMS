(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientMedicationDetailController', patientMedicationDetailController);

function patientMedicationDetailController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentfilter= {
        PerformedDate : utl.Formatter.getCurrentDate()
    };

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false ,
        prescriptiondetail : {}
    };

    if ($scope.currentcontext.ismodal) {
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

        if(modalConfig.params.current_item) {
            $scope.item =  modalConfig.params.current_item;
        }

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }

    $scope.item.PatientId = $scope.currentcontext.pid;

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.cancelCallback();
        }
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        $scope.confirmCallback($scope.item);
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
    }
    
    $scope.initLookup = function () {
        var inputData = [
                        {"Key": "Drug"},
                        {"Key": "DrugRoute"},
                        {"Key": "DrugFrequency"}, 
                        {"Key": "PatientMedicationStatus"}
                ];

        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    }

    // $scope.fillMasterInfo = function(selectedItem) {        
    //     $scope.item.GenericId = selectedItem.GenericId;
    //     $scope.item.DrugFormId = selectedItem.DrugFormId;
    //     $scope.item.DrugCode = selectedItem.DrugCode;
    //     $scope.item.DrugName = selectedItem.DrugName;
    //     $scope.item.DrugRouteId = selectedItem.DrugRouteId;
    //     $scope.item.DrugFrequencyId = selectedItem.DrugFrequencyId;        
    // }    
    
    $scope.initLookup();
}

patientMedicationDetailController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();