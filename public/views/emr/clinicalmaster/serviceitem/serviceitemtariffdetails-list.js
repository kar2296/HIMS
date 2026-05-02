(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceItemTariffDetailListController', serviceItemTariffDetailListController);

    function serviceItemTariffDetailListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.UserFacilityList = [];
        $scope.currentcontext.serviceitemid = parseInt($stateParams.id);
        $scope.currentcontext.testmasterid = $stateParams.TestmasterId;

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                Status: 1,
                ShareTypeId: 2,
                StatusId: true,
                FacilityId: utl.Session.getCurrentFacilityId(),
                EffectiveFrom: utl.Formatter.getCurrentDate(),
                ServiceRtCat: [],
                Facilitylookup: []
            };
            vm.items.push(lineItem);
            $scope.InitialFacilityLoad(lineItem);
            // $scope.facilitychange(lineItem);
        };

        $scope.alltariff = function () {
            $state.go('app.serviceitemtab.serviceitemtariffdetails', {
                id: $scope.currentcontext.serviceitemid
            });
        }
        $scope.selftariff = function () {
            $state.go('app.serviceitemtab.selftariffrate', {
                id: $scope.currentcontext.serviceitemid
            });
        }
        $scope.instariff = function () {
            $state.go('app.serviceitemtab.insurancetariffrate', {
                id: $scope.currentcontext.serviceitemid
            });
        }


        $scope.InitialFacilityLoad = function (item) {
            item.Facilitylookup = [];
            for (var idx in $scope.lookup.Facility) {
                var lookupfacility = $scope.lookup.Facility[idx];
                if ($scope.UserFacilityList && $scope.UserFacilityList.length < 2) {
                    if (lookupfacility.Id == item.FacilityId)
                        item.Facilitylookup.push(lookupfacility);
                } else {
                    item.Facilitylookup.push(lookupfacility);
                }
            }
        };

        $scope.getUserFacilityListCallback = function (scope, data, options, hasError) {
            for (var idx in data) {
                $scope.UserFacilityList.push(data[idx].FacilityId);
            }
            $scope.getList();
        };

        $scope.getUserFacilityList = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: utl.Session.getCurrentUserId()
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            }

            var options = {
                action: 'SystemSettings/User/GetFacilities',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUserFacilityListCallback
            }

            utl.Http.doAction(options);
        };

        $scope.facilitychange = function (item) {
            item.ServiceRtCat = [];
            for (var idx in $scope.lookup.ServiceRateCategory) {
                var lookupserratcat = $scope.lookup.ServiceRateCategory[idx];
                if (lookupserratcat.FacilityId == item.FacilityId) {
                    item.ServiceRtCat.push(lookupserratcat);
                } else if (lookupserratcat.FacilityId == -1) {
                    item.ServiceRtCat.push(lookupserratcat);
                }
            }
        };

        $scope.calcDrShare = function (item) {
            if (item.ShareTypeId == 2) {
                item.DoctorShare = (item.DoctorShareValue / 100) * item.Rate;
            }
            if (item.ShareTypeId == 1) {
                item.DoctorShare = item.DoctorShareValue;
            }
        };

        $scope.InsertTarifflistCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            $scope.lookup["ServiceRateCategory"] = data["ServiceRateCategory"];
            if ($scope.lookup.Guarantor.length > 1 && $scope.lookup.ServiceRateCategory.length > 1) {
                for (var sx in $scope.lookup.ServiceRateCategory) {
                    var rtctgy = $scope.lookup.ServiceRateCategory[sx];
                    if (rtctgy.Id > 0) {
                        var lineItem = {
                            Id: 0,
                            Status: 1,
                            TariffTypeId: $scope.currentcontext.TariffTypeId,
                            ServiceRateCategoryId: rtctgy.Id,
                            InsuranceId: -1,
                            ShareTypeId: 2,
                            StatusId: true,
                            FacilityId: utl.Session.getCurrentFacilityId(),
                            EffectiveFrom: utl.Formatter.getCurrentDate(),
                            ServiceRtCat: [],
                            Facilitylookup: []
                        };
                        vm.items.push(lineItem);
                    }
                }
            }
        };

        $scope.InsertTarifflist = function () {
            var inputData = [{
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.TariffTypeId
                    },
                    {
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            }, {
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: $scope.currentcontext.TariffTypeId
                    },
                    {
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }
                    ]
                }
            }];
            $scope.initLookupCall(inputData, $scope.InsertTarifflistCallback);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            if ($scope.currentcontext.TariffTypeId > 0 && res.Data.length == 0) {
                $scope.InsertTarifflist();
            }
            if (!$scope.currentcontext.TariffTypeId && res.Data.length == 0) {
                $scope.addNewLineItem();
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.serviceitemid
                },
                {
                    Key: 5,
                    Value: utl.Session.getCurrentFacilityId()
                }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            if ($scope.currentcontext.TariffTypeId > 0) {
                inputData.Params.push({
                    Key: 6,
                    Value: $scope.currentcontext.TariffTypeId
                });
            }

            var options = {
                action: 'clinicalmaster/serviceitemtariffdetail/GetServiceItemTariffDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        };

        $scope.backToList = function () {
            $state.go('app.serviceitemtab.details', {
                id: $scope.currentcontext.serviceitemid
            });
        };

        $scope.back = function () {
            $state.go('app.serviceitems', {
                id: $scope.currentcontext.serviceitemid
            });
        };

        $scope.addNew = function () {
            $scope.addNewLineItem();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.Rate || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'clinicalmaster/serviceitemtariffdetail/ManageSerivceItemTariffDetail',
                    data: {
                        Data: lines
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [{
                search: 1,
                fields: ['Status']
            }]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var validrate = false;
                var item = activeRecords[idx];
                try {
                    var vrate = parseFloat(item.Rate);
                    validrate = true;
                } catch (ex) {
                    validrate = false;
                }

                if (idx == lastIndex && !item.AliasId && !item.AliasName) {
                    continue;
                } else if (item.ServiceRateCategoryId == -1 || item.FacilityId == -1 || !validrate) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.Rate) {
                    item.ServiceItemId = $scope.currentcontext.serviceitemid;
                    item.TestmasterId = $scope.currentcontext.testmasterid;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            $scope.lookup["ServiceRateCategory"] = data["ServiceRateCategory"];
        };

        $scope.getGuarantor = function (item, idx) {
            item.GuarantorId = -1;
            item.ServiceRateCategoryId = -1;
            var inputData = [{
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: item.TariffTypeId
                    },
                    {
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }
                    ]
                }
            },
            {
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: item.TariffTypeId
                    },
                    {
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }
                    ]
                }
            }
            ];
            $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
        }

        $scope.initLookupCall = function (inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getUserFacilityList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": 'Facility',
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "EncounterType"
            },
            {
                "Key": "Guarantor"
            },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "CurrencyType"
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

        $scope.initLookup();
    }

    serviceItemTariffDetailListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();