(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('HomeaddressDetailsController', HomeaddressDetailsController);

    function HomeaddressDetailsController($scope, $stateParams, $state, $translate, $filter, utl, Upload, $timeout) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;
        $scope.currentcontext = {};
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.orderdata = $stateParams.orderid;
        $scope.currentcontext.id = $scope.orderdata;
        $scope.vcategoryid = $stateParams.ctgryid;
        $scope.vsubcategoryid = $stateParams.subctgryid;
        $scope.currentcontext.islab = $stateParams.islab;
        $scope.currentcontext.isvaccines = $stateParams.isvaccines;
        $scope.lookup = {};
        $scope.VOrderDetails = [];
        $scope.item = {
            RequestTypeId: 1,
            OrderConsultTypeId: 2,
            PaymentModeId: 2,
            OrderModeId: 2,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            VirtualOrderStatusId: 1,
        }
        $scope.item.FacilityId = $stateParams.facid;
        $scope.currentcontext.islab = $stateParams.islab;
        $scope.vDetails = $stateParams.details;
        $scope.item = $stateParams.slotinfo;
        $scope.VirtualOrderDetails = $scope.vDetails;
        $scope.detailsinfo = $scope.VirtualOrderDetails[0];
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.slotdata = $stateParams.slotinfo;
        $scope.ctypeId = parseInt($stateParams.ctypeId);
        $scope.item.VirtualCategoryId = $scope.currentcontext.vcategoryid;
        $scope.item.VirtualSubCategoryId = $scope.currentcontext.vsubcategoryid;
        $scope.item.CategoryTypeId = $scope.ctypeId;
        if ($scope.slotdata) {
            var Datefrom = $filter('date')($scope.slotdata.AppointmentDate, 'yyyy-MM-dd 00:00:00');
            $scope.item.AppointmentDate = Datefrom;
            $scope.item.OrderScheduleDate = Datefrom;;
            $scope.item.StartTime = $scope.slotdata.StartTime;
            $scope.item.EndTime = $scope.slotdata.EndTime;
        }
        $scope.next = function() {
            $state.go('patientportal.otherpersondetails', {
                details: $scope.vDetails,
                slotinfo: $scope.item,
                ctgryInfo: $scope.ctgryInfo,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId,
                isvaccines: $scope.currentcontext.isvaccines,
                islab: $scope.currentcontext.islab,
                token: $scope.Token
            });
        }
        $scope.backToList = function() {
            $state.go('patientportal.virtualserviceselection', {
                drdata: $scope.drdetail,
                slotinfo: $scope.slotdata
            });
        };

        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function() {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.Area = '';
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = '';
            var address2 = '';
            var city = '';
            var area = '';
            var state = '';
            var country = '';
            var pincode = '';
            for (var i = 0; i < addressComponents.length; i++) {
                if (i == 0)
                    $scope.clearpreviousaddress();

                var addressType = addressComponents[i].types[0];
                if (addressType) {
                    if ('premise' == addressType) { // Address 1
                        address1 = addressComponents[i].long_name;
                    } else if ('sublocality_level_1' == addressType) { // Address 2
                        address2 = addressComponents[i].long_name;
                    } else if ('route' == addressType) { // Area
                        city = addressComponents[i].long_name;
                    } else if ('locality' == addressType) { // city
                        area = addressComponents[i].long_name;
                    } else if ('administrative_area_level_1' == addressType) { // state
                        state = addressComponents[i].long_name;
                    } else if ('country' == addressType) { // country
                        country = addressComponents[i].long_name;
                    } else if ('postal_code' == addressType) { // pincode
                        pincode = addressComponents[i].long_name;
                    }
                }
            }
            $scope.item.Address = name + ' ' + address1 + ' ' + address2 + ' ' + city +' '+ area + ' ' + state + ' ' + country + ' ' + pincode;
            // $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
            if (pincode)
            if (pincode)
                $scope.getPincodeData(pincode);
        });

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function(scope, res, options, hasError) {
            if (res.Data) {
                if (res.Data.length > 0) {
                    $scope.item.PinCodeId = res.Data[0].Id;
                    $scope.item.Area = res.Data[0].Area;
                    $scope.item.CityId = res.Data[0].CityId;
                    $scope.item.StateId = res.Data[0].StateId;
                    $scope.item.CountryId = res.Data[0].CountryId;
                }
            }
        };

        $scope.getPincodeData = function(pincode) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: pincode
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/PincodeMaster/GetPincodeMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPincodeDataCallback
            };
            utl.Http.doAction(options);
        };

        $scope.enablegoogleaddopt = function() {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function() {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */

    }

    HomeaddressDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'Upload', '$timeout'];

})();