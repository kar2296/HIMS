(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityvendorMasterFormController', facilityvendorMasterFormController);

    function facilityvendorMasterFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsActive: true,
            isDisabled: false,
            VendorTypeId: -1,
            BusinessDomainId: -1,
            DistributionTypeId: -1,
            SupplyTypeId: -1,
            PaymentTermsId: -1,
            CurrencyCodeId: -1,
            Activefrom: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/vendorfacilitymap/GetVendorFacilityMapById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.facilityvendormasters');
        };

        $scope.addNew = function () {
            $state.go('app.facilityvendormasters', { id: 0 });
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('inventory.facilitymaster.vendor.lbl'));
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/vendorfacilitymap/AddVendorFacilityMap';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/vendorfacilitymap/UpdateVendorFacilityMap';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "VendorType" },
                { "Key": "BusinessDomain" },
                { "Key": "DistributionType" },
                { "Key": "PaymentTerms" },
                { "Key": "CurrencyCode" },
                { "Key": "SupplyType" }

            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        };

        $scope.initLookup();
    }

    facilityvendorMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();