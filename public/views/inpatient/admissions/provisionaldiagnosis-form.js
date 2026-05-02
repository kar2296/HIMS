(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissiondiagnosisFormController', admissiondiagnosisFormController);

    function admissiondiagnosisFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.mlcid);
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.DiagnosisCodeScheme = selectedItem.DiagnosisCodeScheme;
            $scope.item.Code = selectedItem.Code;
            $scope.item.Description = selectedItem.Description;
        }

        $scope.item = {
            IsActive: true
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'IPManagement/admissiondiagnosis/GetAdmissionDiagnosisById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                // utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.admissiontab.admission');
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

            var actionName = 'IPManagement/admissiondiagnosis/AddAdmissionDiagnosis';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/admissiondiagnosis/UpdateAdmissionDiagnosis';
            }

            $scope.item.PatientId = $scope.currentcontext.patientid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            // utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DiagnosisCodeScheme" },
                { "Key": "DiagnosisVersion" },
                { "Key": "CodeRegion" },
                { "Key": "Speciality" },
                { "Key": "BodySite" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            // utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    admissiondiagnosisFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();