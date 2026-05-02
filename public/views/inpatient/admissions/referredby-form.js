(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionreferralFormController', admissionreferralFormController);

    function admissionreferralFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),

        };

        $scope.currentcontext = {};
        $scope.fillDefaultValues = function () {

        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }
        $scope.currentcontext.ismodal = modalConfig && modalConfig.params ? true : false

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        else {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
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
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            if ($scope.item.IsActive == true)
            { $scope.item.ActiveStatusId = 2; }
            else
            { $scope.item.ActiveStatusId = 3 }
            $scope.saveItem();
        }
        $scope.backToList = function (data) {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback(data);
            }
            else {
                $state.go('app.referrals');
            }
        }
        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList(data);
        };

        $scope.saveItem = function () {

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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ReferralType" },
                { "Key": "MarketingPerson" },
                { "Key": "Pincode" },
                { "Key": "City" },
                { "Key": "State" },
                { "Key": "Country" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
        $scope.item.ActiveFrom = new Date();
    }

    admissionreferralFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();