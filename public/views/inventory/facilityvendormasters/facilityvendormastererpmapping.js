(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityvendormasterERPMapFormController', facilityvendormasterERPMapFormController);

    function facilityvendormasterERPMapFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            ActiveFrom: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        $scope.currentcontext.vendorfacilitymapid = parseInt($stateParams.id);
        $scope.currentcontext.id = parseInt($stateParams.vendorerpmapid);
        $scope.item.VendorMasterId = $state.params.VendorMasterId;
        $scope.item.VendorCode = $state.params.VendorCode;
        $scope.item.VendorName = $state.params.VendorName;

        var IsProfile = $state.params.IsProfile;
        var VendorMasterId = $state.params.VendorMasterId;
        var VendorCode = $state.params.VendorCode;
        var VendorName = $state.params.VendorName;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/vendormaster/GetVendorErpMapById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.facilityvendormastertab.facilityvendormastererpmappings');
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/vendormaster/AddVendorErpMap';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/vendormaster/UpdateVendorErpMap';
            }

            $scope.item.VendorFacilityMapId = $scope.currentcontext.vendorfacilitymapid;

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
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ErpAccountType" },
                { "Key": "ErpSubAccountType" },
                { "Key": "ErpGLClassType" },
                { "Key": "Bank" },
                { "Key": "VendorMaster" }
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

    facilityvendormasterERPMapFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();