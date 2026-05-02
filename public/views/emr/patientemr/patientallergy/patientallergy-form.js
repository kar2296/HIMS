(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAllergyFormController', patientAllergyFormController);

    function patientAllergyFormController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.item = {
        StartDate : utl.Formatter.getCurrentDate(),
        EncounterId : utl.Session.getEncounterId(),
        PatientAllergyStatusId : 1
    };
    angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

        if(modalConfig.params.itemid) {
            $scope.item.AllergyId = parseInt(modalConfig.params.itemid);
        }

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
                action: 'emr/patientallergy/GetPatientAllergyById',
                data: { Id: $scope.currentcontext.id,  PatientId : $scope.currentcontext.pid},
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
            } else {
                $scope.setFocusTitle();
            }
        };
        $scope.setFocusTitle = function () {
            if ($scope.currentcontext.id <= 0) {
                $scope.startinterval = $interval(function () {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }
        $scope.callTitleFocus = function () {
            if ($scope.currentcontext.id <= 0) {
                console.log("test print by ");
                var uiSelect = angular.element(document.getElementById('allergy'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
            $interval.cancel($scope.startinterval);
        }
    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        } else {
            $state.go('patientemr.patientallergies', {pid : $scope.currentcontext.pid});
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

        var actionName = 'emr/patientallergy/AddPatientAllergy';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'emr/patientallergy/UpdatePatientAllergy';
        }

        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    //setDefaults
    function setDefaults() {
        if($scope.item.AllergyId > 0) {
            var allergy = utl.Lookup.getObject($scope.lookup.Allergy, $scope.item.AllergyId);
            $scope.fillMasterInfo(allergy);
        }
    }

    //lookup
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        setDefaults();
        $scope.getItem();
    }

    $scope.initLookup = function () {
        var inputData = [
                    { "Key": "Allergy" },
                    { "Key": "AllergyType" },
                    { "Key": "AllergySeverity" },
                    { "Key": "ADRScore" },
                    { "Key": "PatientAllergyStatus" }
                ];

        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    }

    $scope.fillMasterInfo = function(selectedItem)
    {
        $scope.item.AllergyTypeId = selectedItem.AllergyTypeId;
        $scope.item.AllergyName = selectedItem.AllergyName;
        $scope.item.Description = selectedItem.Description;
    }

    $scope.initLookup();
}

    patientAllergyFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();