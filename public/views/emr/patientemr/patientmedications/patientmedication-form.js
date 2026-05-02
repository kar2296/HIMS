(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientMedicationFormController', patientMedicationFormController);

function patientMedicationFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.item = {
        DrugId : -1,
        PatientMedicationStatusId : 1
    };

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    } else {
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
    }

    $scope.item.PatientId = $scope.currentcontext.pid;

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'emr/patientmedication/GetPatientMedicationById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        } else {
            $state.go('patientemr.patientmedications', {pid : $scope.currentcontext.pid});
        }
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {

        // if(!$scope.item_form.isValid()) {
        //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
        //    return;
        // }

        var actionName = 'emr/patientmedication/AddPatientMedication';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'emr/patientmedication/UpdatePatientMedication';
        }

        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
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

    $scope.fillMasterInfo = function(selectedItem) {
        $scope.item.GenericId = selectedItem.GenericId;
        $scope.item.DrugFormId = selectedItem.DrugFormId;
        $scope.item.DrugCode = selectedItem.DrugCode;
        $scope.item.DrugName = selectedItem.DrugName;
        $scope.item.DrugRouteId = selectedItem.DrugRouteId;
        $scope.item.DrugFrequencyId = selectedItem.DrugFrequencyId;
    }

    $scope.initLookup();
}

patientMedicationFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();