(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityFormController', facilityFormController);

    function facilityFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            CountryId: 1
        };

        $scope.lookup = {
            FacilityType: [],
            Organization: [],
            Language: [],
            Pincode: [],
            City: [],
            State: [],
            Country: []
        };

        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        $scope.currentcontext.file1 = null;
        $scope.currentcontext.id = parseInt($stateParams.id) || 0;

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: angular.copy($scope.item),
                lookup: $scope.lookup,
                facilityId: $scope.currentcontext.id,
                logoBase64: $scope.currentcontext.Logo || null,
                isSaving: false
            };
        };

        // getFacilityLogo
        $scope.getFacilityLogoCallback = function (scope, data, options, hasError) {
            if (!hasError && data) {
                $scope.currentcontext.Logo = data.Logo;
                $scope.refreshReactProps();
            }
        };

        $scope.getFacilityLogo = function () {
            if ($scope.item.LogoPath) {
                var inputData = {
                    Id: $scope.item.Id,
                    LogoPath: $scope.item.LogoPath
                };
                var options = {
                    action: 'SystemSettings/facility/GetFacilityLogo',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getFacilityLogoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.preferenceCallback = function (scope, res, options, hasError) {
            $scope.item.IsDirectLabSync = false;
            $scope.item.IsPharmacybasedonStore = false;
            $scope.item.IsItemExactSearch = false;
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    if (item.PreferenceKey == 'directlabsync') {
                        if (parseInt(item.PreferenceValue) == 1)
                            $scope.item.IsDirectLabSync = true;
                    } else if (item.PreferenceKey == 'pharseqbasedonstore') {
                        if (parseInt(item.PreferenceValue) == 1)
                            $scope.item.IsPharmacybasedonStore = true;
                    } else if (item.PreferenceKey == 'itemexactsearch') {
                        if (parseInt(item.PreferenceValue) == 1)
                            $scope.item.IsItemExactSearch = true;
                    }
                }
            }
            $scope.refreshReactProps();
        };

        $scope.getFacilitypreference = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: 'general'
                },
                {
                    Key: 3,
                    Value: $scope.item.FacilityId || $scope.item.Id
                },
                {
                    Key: 2,
                    Value: ['directlabsync', 'pharseqbasedonstore', 'itemexactsearch']
                }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/FacilityPreference/GetFacilityPreferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.preferenceCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSecondLogoCallback = function (scope, data, options, hasError) {
            if (!hasError && data) {
                $scope.currentcontext.SecondLogo = data.Logo;
            }
        };

        $scope.getSecondLogo = function () {
            if ($scope.item.SecondLogoPath) {
                var inputData = {
                    Id: $scope.item.Id,
                    SecondLogoPath: $scope.item.SecondLogoPath
                };
                var options = {
                    action: 'SystemSettings/facility/GetSecondFacilityLogo',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getSecondLogoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (!hasError && data) {
                $scope.item = angular.extend({}, $scope.item, data);
                $scope.getFacilityLogo();
                $scope.getSecondLogo();
                $scope.getFacilitypreference();
                $scope.refreshReactProps();
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'SystemSettings/facility/GetFacilityById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.facilitys');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Saved successfully');
            $scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {
                IsActive: true,
                CountryId: 1
            };
            $scope.refreshReactProps();
        };

        $scope.saveItem = function () {
            if ($scope.item.IsGstRegistered && (!$scope.item.GstNumber || !$scope.item.RegistrationNo || !$scope.item.TaxActiveFrom || !$scope.item.TaxActiveTo)) {
                utl.Alert.showErrorMsg($translate.instant('appmanager.facility.gstrequiredfieldmsg.lbl') || 'GST fields are required');
                return;
            }

            var actionName = 'SystemSettings/Facility/AddFacility';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'SystemSettings/Facility/UpdateFacility';
            }

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) {
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Saved successfully');
                    $scope.currentcontext.file = null;
                    $scope.backToList();
                }, function (resp) {
                    utl.Alert.showErrorMsg('Error status: ' + resp.status);
                });
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: null
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [{
                Key: 'FacilityType'
            },
            {
                Key: 'Language'
            },
            {
                Key: 'Organization'
            },
            {
                Key: 'Pincode'
            },
            {
                Key: 'City'
            },
            {
                Key: 'State'
            },
            {
                Key: 'Country'
            }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        // React bridge handler
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'backToList') {
                $scope.backToList();
            } else if (actionName === 'fieldChange') {
                if (payload) {
                    angular.extend($scope.item, payload);
                }
            } else if (actionName === 'onAddressUpdate') {
                if (payload) {
                    if (payload.countryid !== undefined) $scope.item.CountryId = payload.countryid === -1 ? null : payload.countryid;
                    if (payload.country !== undefined) $scope.item.Country = payload.country;
                    if (payload.stateid !== undefined) $scope.item.StateId = payload.stateid === -1 ? null : payload.stateid;
                    if (payload.state !== undefined) $scope.item.State = payload.state;
                    if (payload.districtid !== undefined) $scope.item.DistrictId = payload.districtid === -1 ? null : payload.districtid;
                    if (payload.district !== undefined) $scope.item.District = payload.district;
                    if (payload.cityid !== undefined) $scope.item.CityId = payload.cityid === -1 ? null : payload.cityid;
                    if (payload.city !== undefined) $scope.item.City = payload.city;
                    if (payload.areaid !== undefined) $scope.item.WardId = payload.areaid === -1 ? null : payload.areaid;
                    if (payload.area !== undefined) $scope.item.Area = payload.area;
                    if (payload.pincodeid !== undefined) $scope.item.PinCodeId = payload.pincodeid === -1 ? null : payload.pincodeid;
                    if (payload.pincode !== undefined) {
                        $scope.item.PinCode = payload.pincode;
                        $scope.item.Pincode = payload.pincode;
                    }
                }
            } else if (actionName === 'onLogoUpload') {
                if (payload && payload.file) {
                    $scope.currentcontext.file = payload.file;
                }
            } else if (actionName === 'saveItem' || actionName === 'saveAndApprove') {
                if (payload && payload.item) {
                    angular.extend($scope.item, payload.item);
                }
                if (payload && payload.file) {
                    $scope.currentcontext.file = payload.file;
                }
                $scope.saveItem();
            }
        };

        $scope.initLookup();
        $scope.refreshReactProps();
    }

    facilityFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];
})();