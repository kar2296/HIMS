(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newgeneralvendormasterFacilityMapController', newgeneralvendormasterFacilityMapController);

    function newgeneralvendormasterFacilityMapController($scope, $stateParams, $state, $translate) {
        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.VendorMasterId = $state.params.VendorMasterId;
        $scope.item.VendorCode = $state.params.VendorCode;
        $scope.item.VendorName = $state.params.VendorName;
        $scope.item.VendorDescription = $state.params.VendorDescription;
        $scope.item.VendorTypeId = $state.params.VendorTypeId;
        $scope.item.Pincode = $state.params.Pincode;
        $scope.item.Area = $state.params.Area;
        $scope.item.City = $state.params.City;
        $scope.item.State = $state.params.State;
        $scope.item.Country = $state.params.Country;
        $scope.item.MobileNumber = $state.params.MobileNumber;
        $scope.item.PhoneNumber = $state.params.PhoneNumber;
        $scope.item.FaxNumber = $state.params.FaxNumber;
        $scope.item.EmailAddress = $state.params.EmailAddress;
        $scope.item.ManufacturerName = $state.params.ManufacturerName;
        $scope.item.ContactPerson = $state.params.ContactPerson;
        $scope.item.BusinessDomainId = $state.params.BusinessDomainId;
        $scope.item.DistributionTypeId = $state.params.DistributionTypeId;
        $scope.item.PaymentTermsId = $state.params.PaymentTermsId;
        $scope.item.LicenceCode = $state.params.LicenceCode;
        $scope.item.AddressLine1 = $state.params.AddressLine1;
        $scope.item.AddressLine2 = $state.params.AddressLine2;
        $scope.item.AddressLine3 = $state.params.AddressLine3;
        $scope.item.VendorUrl = $state.params.VendorUrl;
        $scope.item.LeadTime = $state.params.LeadTime;
        $scope.item.CurrencyCodeId = $state.params.CurrencyCodeId;
        $scope.item.IsActive = $state.params.IsActive;
        $scope.item.ActiveFrom = $state.params.ActiveFrom;
        $scope.item.ActiveTo = $state.params.ActiveTo;
        $scope.item.ActiveStatusId = $state.params.ActiveStatusId;
        $scope.item.Comments = $state.params.Comments;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{ Key: 0, Value: $scope.currentcontext.id }]
                };

                var options = {
                    action: 'pharmacy/vendormaster/GetFacilities',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                $scope.$doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.vendormastertabgeneral.vendormastergeneral');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.saveItem = function () {
            for (var idx in $scope.item.map) {
                var item = $scope.item.map[idx];
                item.VendorMasterId = $scope.item.VendorMasterId;
                item.VendorCode = $scope.item.VendorCode;
                item.VendorName = $scope.item.VendorName;
                item.VendorDescription = $scope.item.VendorDescription;
                item.VendorTypeId = $scope.item.VendorTypeId;
                item.Pincode = $scope.item.Pincode;
                item.Area = $scope.item.Area;
                item.City = $scope.item.City;
                item.State = $scope.item.State;
                item.Country = $scope.item.Country;
                item.MobileNumber = $scope.item.MobileNumber;
                item.PhoneNumber = $scope.item.PhoneNumber;
                item.FaxNumber = $scope.item.FaxNumber;
                item.EmailAddress = $scope.item.EmailAddress;
                item.ManufacturerName = $scope.item.ManufacturerName;
                item.ContactPerson = $scope.item.ContactPerson;
                item.BusinessDomainId = $scope.item.BusinessDomainId;
                item.DistributionTypeId = $scope.item.DistributionTypeId;
                item.PaymentTermsId = $scope.item.PaymentTermsId;
                item.LicenceCode = $scope.item.LicenceCode;
                item.AddressLine1 = $scope.item.AddressLine1;
                item.AddressLine2 = $scope.item.AddressLine2;
                item.AddressLine3 = $scope.item.AddressLine3;
                item.VendorUrl = $scope.item.VendorUrl;
                item.LeadTime = $scope.item.LeadTime;
                item.CurrencyCodeId = $scope.item.CurrencyCodeId;
                item.IsActive = $scope.item.IsActive;
                item.ActiveFrom = $scope.item.ActiveFrom;
                item.ActiveTo = $scope.item.ActiveTo;
                item.ActiveStatusId = $scope.item.ActiveStatusId;
                item.Comments = $scope.item.Comments;
            }

            var actionName = 'pharmacy/vendormaster/MapFacilities';

            var options = {
                action: actionName,
                data: { Data: $scope.item.map },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            $scope.$doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility", Request: { Params: [{ Key: 4, Value: true }] } }
            ];

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

    newgeneralvendormasterFacilityMapController.$inject = ['$scope', '$stateParams', '$state', '$translate'];

})();