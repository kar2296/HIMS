(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionguarantorFormController', admissionguarantorFormController);

    function admissionguarantorFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};
        $scope.currentcontext.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentcontext.id = parseInt($stateParams.mlcid);
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsAllFacility: false
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'IPManagement/admissionguarantor/GetAdmissionGuarantorById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                // utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.admissiontab.admission');
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if ($scope.item.IsAllFacility == true) {
                $scope.item.FacilityId = -1;
            }
            if ($scope.item.IsAllFacility == false) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            var actionName = 'IPManagement/admissionguarantor/AddAdmissionGuarantor';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/admissionguarantor/UpdateaAdmissionGuarantor';
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "GuarantorType" },
                { "Key": "TPA" },
                { "Key": "ServiceRateCategory" },
                { "Key": "GuarantorClientType" },
                // { "Key": "Pincode" },
                // { "Key": "City" },
                // { "Key": "District" },
                // { "Key": "State" },
                // { "Key": "Country" }

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

    admissionguarantorFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();