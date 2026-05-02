(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCenterProfileFormController', LabCenterProfileFormController);

    function LabCenterProfileFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            OrganizationId: 1,
            FacilityTypeId: 4,
            ResultFormatTypeId: -1
        };

        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        $scope.currentcontext.file1 = null;
        if ($stateParams.tp == 'dt') {
            $stateParams.id = utl.Session.getCurrentFacilityId();
        }
        $scope.currentcontext.id = parseInt($stateParams.id);
        // $scope.currentcontext.id = utl.Session.getCurrentFacilityId();
        // $scope.currentcontext.id = parseInt($stateParams.id);
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
            $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
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

        //getFacilityLogo
        $scope.getFacilityLogoCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Logo = data.Logo;
        };

        $scope.getFacilityLogo = function() {
            if ($scope.item.LogoPath) {
                var inputData = { Id: $scope.item.Id, LogoPath: $scope.item.LogoPath };
                var options = {
                    action: 'SystemSettings/facility/GetFacilityLogo',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getFacilityLogoCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.numberonly = function(e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.getSecondLogoCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.SecondLogo = data.Logo;
        };

        $scope.getSecondLogo = function() {
            if ($scope.item.SecondLogoPath) {
                var inputData = { Id: $scope.item.Id, SecondLogoPath: $scope.item.SecondLogoPath };
                var options = {
                    action: 'SystemSettings/facility/GetSecondFacilityLogo',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getSecondLogoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.getFacilityLogo();
            $scope.getSecondLogo();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'SystemSettings/facility/GetFacilityById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.facilitys');
        }


        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.labcenterprofiletab.labcenterprofile', {
                id: options.data.Data.Id,
                resid: options.data.Data.ResultFormatTypeId
            });
            // $scope.backToList();
        };

        $scope.clear = function() {
            $scope.item = {};
        }

        $scope.saveItem = function() {
            var geocoder = new google.maps.Geocoder();
            var address = $scope.item.AddressLine1;
            geocoder.geocode({ 'address': address }, function(results, status) {

                if (status == google.maps.GeocoderStatus.OK) {
                    var latitude = results[0].geometry.location.lat();
                    var longitude = results[0].geometry.location.lng();
                    var lat = '';
                    var lng = '';
                    lat = latitude;
                    lng = longitude;
                    $scope.item.Lat = lat;
                    $scope.item.Lng = lng;
                    console.log(latitude);
                    console.log(longitude);
                    if ($scope.item.IsGstRegistered && (!$scope.item.GstNumber || !$scope.item.RegistrationNo || !$scope.item.TaxActiveFrom || !$scope.item.TaxActiveTo)) {
                        utl.Alert.showErrorMsg($translate.instant('appmanager.facility.gstrequiredfieldmsg.lbl'));
                        return;
                    } else {

                        var actionName = ''
                        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                            actionName = 'SystemSettings/Facility/UpdateFacility';
                        } else {
                            actionName = 'SystemSettings/Facility/AddFacility';
                        }

                        // //TODO
                        // //$scope.item.OrganizationId = 0;
                        // var options = {
                        //     action: actionName,
                        //     data: {Data : $scope.item },
                        //     type: 'post',
                        //     onComplete: $scope.saveItemCallback
                        // };
                        // utl.Http.doAction(options);

                        if ($scope.currentcontext.file) {
                            var actionUrl = utl.Http.getRootPath() + actionName;
                            Upload.upload({
                                url: actionUrl,
                                data: {
                                    file: $scope.currentcontext.file,
                                    Data: $scope.item
                                }
                            }).then(function(resp) { //upload function returns a promise
                                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                                    $scope.currentcontext.file = null;
                                    $scope.backToList();
                                },
                                function(resp) { //catch error
                                    console.log('Error status: ' + resp.status);
                                    utl.Alert.showErrorMsg('Error status: ' + resp.status);
                                },
                                function(evt) {
                                    console.log(evt);
                                });
                            return false;
                        } else if ($scope.currentcontext.file1) {
                            var actionUrl = utl.Http.getRootPath() + actionName;
                            Upload.upload({
                                url: actionUrl,
                                data: {
                                    file: $scope.currentcontext.file1,
                                    Data: $scope.item
                                }
                            }).then(function(resp) { //upload function returns a promise
                                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                                    $scope.currentcontext.file1 = null;
                                    $scope.backToList();
                                },
                                function(resp) { //catch error
                                    console.log('Error status: ' + resp.status);
                                    utl.Alert.showErrorMsg('Error status: ' + resp.status);
                                },
                                function(evt) {
                                    console.log(evt);
                                });
                            return false;
                        } else {
                            var options = {
                                action: actionName,
                                data: {
                                    Data: $scope.item,
                                    file: $scope.currentcontext.file
                                },
                                type: 'post',
                                onComplete: $scope.saveItemCallback
                            };
                            utl.Http.doAction(options);
                        }
                    }
                }

            });


        };
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "FacilityType" },
                { "Key": "Language" },
                { "Key": "Organization" },
                { "Key": "Pincode" },
                { "Key": "City" },
                { "Key": "State" },
                { "Key": "Country" },
                { "Key": "ResultFormatType", Default: false },
            ]
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

    LabCenterProfileFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();