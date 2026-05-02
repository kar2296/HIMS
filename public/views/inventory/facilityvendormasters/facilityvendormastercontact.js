(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityvendormasterContactFormController', facilityvendormasterContactFormController);

    function facilityvendormasterContactFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            isDisabled: false,
            IsActive: true,
            ActiveFrom: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        $scope.currentcontext.vendorfacilitymapid = parseInt($stateParams.id);
        $scope.currentcontext.id = parseInt($stateParams.vendorcontactid);
        $scope.item.VendorMasterId = $state.params.VendorMasterId;
        $scope.item.VendorCode = $state.params.VendorCode;
        $scope.item.VendorName = $state.params.VendorName;

        var IsProfile = $state.params.IsProfile;
        var VendorMasterId = $state.params.VendorMasterId;
        var VendorCode = $state.params.VendorCode;
        var VendorName = $state.params.VendorName;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.ActiveStatusId == 2) {
                $scope.item.isDisabled = true;
            }
            if ($scope.item.ActiveStatusId == 3) {
                $scope.item.isDisabled = true;
            }
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

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/vendormaster/GetVendorContactById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.facilityvendormastertab.facilityvendormastercontacts');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.VendorFacilityMapId = $scope.currentcontext.vendorfacilitymapid;
            var actionName = 'pharmacy/vendormaster/AddVendorContact';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/vendormaster/UpdateVendorContact';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.VendorMaster = IsProfile ? $scope.lookup.VendorMaster : $scope.lookup.VendorMaster;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ContactType" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    facilityvendormasterContactFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();