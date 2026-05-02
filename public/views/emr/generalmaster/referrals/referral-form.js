(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralFormController', referralFormController);

    function referralFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            CountryId: 1
        };

        $scope.currentcontext = {};
        $scope.fillDefaultValues = function() {

        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }
        $scope.currentcontext.ismodal = modalConfig && modalConfig.params ? true : false

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/referral/GetReferralById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function() {
            if ($scope.item.IsActive == true) { $scope.item.ActiveStatusId = 2; } else { $scope.item.ActiveStatusId = 3 }
            $scope.saveItem();
        }
        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.referrals');
            }
        }
        $scope.clear = function() {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/referral/AddReferral';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/referral/UpdateReferral';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        //$scope.saveAndApprove = function (){
        //if (new Date($scope.item.ActiveTo) < new Date()) {

        //  $scope.item.ActiveStatusId = 3;
        //}
        //else if(new Date($scope.item.ActiveTo) > new Date()){
        //  $scope.item.ActiveStatusId = 2;
        //}
        //else{
        //  $scope.item.ActiveStatusId = 1;
        //}
        //  $scope.saveItem();
        //}
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var facilitydata = $scope.lookup.Facility;
            for (var idx in facilitydata) {
                if (facilitydata[idx].Id > 0) {
                    $scope.item.CountryId = facilitydata[idx].CountryId;
                    $scope.item.StateId = facilitydata[idx].StateId;

                    $scope.item.DistrictId = facilitydata[idx].DistrictId;
                    $scope.item.CityId = facilitydata[idx].CityId;

                    $scope.swosthaintegration = facilitydata[idx].IsSwosthaIntegration;
                }
            }
            $scope.getItem();
            $scope.getFacility();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ReferralType" },
                { "Key": "MarketingPerson" },
                 {"Key" : "Speciality"},
                {"Key" : "City"},
                {"Key" : "State"},
                {"Key" : "Country"}
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getFacilityCallback = function (scope, res, options, hasError) {
            $scope.facilityitem = res.Data;
            $scope.item.IsAddressSearch = $scope.facilityitem[0].IsAddressSearch;
            $scope.item.IsAlternateEmailMandatory = $scope.facilityitem[0].IsAlternateEmailMandatory;
            $scope.item.IsAlternateMobileMandatory = $scope.facilityitem[0].IsAlternateMobileMandatory;
            $scope.item.IsPincodeFreeText = $scope.facilityitem[0].IsPincodeFreeText;
            console.log('Facility pincode', $scope.item.IsPincodeFreeText);
        };
        $scope.getFacility = function () {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: utl.Session.getCurrentFacilityId()
                },],
            };

            var options = {
                action: 'SystemSettings/facility/GetFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacilityCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initLookup();
        $scope.item.ActiveFrom = new Date();
    }

    referralFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();