(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newgeneralvendorMasterFormController', newgeneralvendorMasterFormController);

    function newgeneralvendorMasterFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.item = {
            OrganizationId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsActive: true,
            isDisabled: false,
            VendorTypeId: 1,
            SupplyTypeId: 2,
            BusinessDomainId: -1,
            DistributionTypeId: -1,
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
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/vendormaster/GetVendorMasterById',
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
            $state.go('app.newvendormastersgeneral');
        }

        $scope.addNew = function () {
            $state.go('app.newvendormastersgeneral', {
                id: 0
            });
        }
        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg('Vendor Code Already Exist');
            }
        }
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
        }

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/vendormaster/AddVendorMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/vendormaster/UpdateVendorMaster';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getMaxId = function () {
            $scope.medicalvendorcode =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'medicalvendorcode');

            $scope.nonmedicalvendorcode =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'nonmedicalvendorcode');

            if ($scope.medicalvendorcode
                && $scope.item.VendorTypeId == 1
                && $scope.item.SupplyTypeId == 1
                && !$scope.currentcontext.id) {
                var options = {
                    action: 'pharmacy/vendormaster/GetMaxId',
                    data: {
                        Data: {
                            VendorTypeId: 1,
                            SupplyTypeId: 1
                        }
                    },
                    type: 'post',
                    onComplete: $scope.getMaxIdCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.nonmedicalvendorcode
                && $scope.item.VendorTypeId == 1
                && $scope.item.SupplyTypeId == 2
                && !$scope.currentcontext.id) {
                var options = {
                    action: 'pharmacy/vendormaster/GetMaxId',
                    data: {
                        Data: {
                            VendorTypeId: 1,
                            SupplyTypeId: 2
                        }
                    },
                    type: 'post',
                    onComplete: $scope.getMaxIdCallback
                };
                utl.Http.doAction(options);
            }
        }

        function ZeroPadding(num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }

        $scope.getMaxIdCallback = function (scope, data, options, hasError) {
            var StartingNr = '0001';

            if (data)
                StartingNr = ZeroPadding(data, 4);

            $scope.prefix = '';

            if ($scope.item.VendorTypeId == 1 && $scope.item.SupplyTypeId == 1) {
                $scope.prefix =
                    utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'medicalvendorcodeprefix');
            } else if ($scope.item.VendorTypeId == 1 && $scope.item.SupplyTypeId == 2) {
                $scope.prefix =
                    utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'nonmedicalvendorcodeprefix');
            }

            if ($scope.prefix) {
                StartingNr = $scope.prefix + '' + StartingNr;
            }

            if (StartingNr)
                $scope.item.VendorCode = StartingNr;

        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getMaxId();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "VendorType"
            },
            {
                "Key": "BusinessDomain"
            },
            {
                "Key": "DistributionType"
            },
            {
                "Key": "PaymentTerms"
            },
            {
                "Key": "CurrencyCode"
            },
            {
                "Key": "SupplyType"
            },
            {
                "Key": "GstMaster",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },]
                }
            },
            {
                "Key": "SupplierCategory"
            }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        }



        $scope.initLookup();
    }

    newgeneralvendorMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();