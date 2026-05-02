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

        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        $scope.currentcontext.file1 = null;

        $scope.currentcontext.id = parseInt($stateParams.id);


        //getFacilityLogo
        $scope.getFacilityLogoCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Logo = data.Logo;
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
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.preferenceCallback = function (scope, res, options, hasError) {
            //console.log(res);
            $scope.item.IsDirectLabSync = false;
            $scope.item.IsPharmacybasedonStore = false;
            $scope.item.IsItemExactSearch = false;
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
            // if (parseInt(res.Data[0].PreferenceValue) == 1)
            //     $scope.item.IsDirectLabSync = true;
        };

        $scope.getFacilitypreference = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: 'general'
                    },
                    {
                        Key: 3,
                        Value: $scope.item.FacilityId
                    },
                    {
                        Key: 2,
                        Value: ['directlabsync', 'pharseqbasedonstore',
                            'itemexactsearch'
                        ]
                    },

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
            $scope.currentcontext.SecondLogo = data.Logo;
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
            $scope.item = data;
            $scope.getFacilityLogo();
            $scope.getSecondLogo();
            $scope.getFacilitypreference();
        };

        $scope.getItem = function (pageNo) {
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
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.saveItem = function () {
            if ($scope.item.IsGstRegistered && (!$scope.item.GstNumber || !$scope.item.RegistrationNo || !$scope.item.TaxActiveFrom || !$scope.item.TaxActiveTo)) {
                utl.Alert.showErrorMsg($translate.instant('appmanager.facility.gstrequiredfieldmsg.lbl'));
                return;
            } else {

                if (!utl.Validator.validate($scope)) {
                    return;
                }

                console.log($scope.item);

                var actionName = 'SystemSettings/Facility/AddFacility';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'SystemSettings/Facility/UpdateFacility';
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
                    }).then(function (resp) { //upload function returns a promise
                            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                            $scope.currentcontext.file = null;
                            $scope.backToList();
                        },
                        function (resp) { //catch error
                            console.log('Error status: ' + resp.status);
                            utl.Alert.showErrorMsg('Error status: ' + resp.status);
                        },
                        function (evt) {
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
                    }).then(function (resp) { //upload function returns a promise
                            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                            $scope.currentcontext.file1 = null;
                            $scope.backToList();
                        },
                        function (resp) { //catch error
                            console.log('Error status: ' + resp.status);
                            utl.Alert.showErrorMsg('Error status: ' + resp.status);
                        },
                        function (evt) {
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
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "FacilityType"
                },
                {
                    "Key": "Language"
                },
                {
                    "Key": "Organization"
                },
                {
                    "Key": "Pincode"
                },
                {
                    "Key": "City"
                },
                {
                    "Key": "State"
                },
                {
                    "Key": "Country"
                }
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

    facilityFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();