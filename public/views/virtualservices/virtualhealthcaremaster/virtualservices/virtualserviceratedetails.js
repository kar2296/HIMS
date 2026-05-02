(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualServiceRateController', VirtualServiceRateController);

    function VirtualServiceRateController($scope, $stateParams, $state, $translate, utl, $filter) {
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
                StatusId: true,
                FacilityId: utl.Session.getCurrentFacilityId(),
                EffectiveFrom: utl.Formatter.getCurrentDate(),
                ServiceRtCat: [],
                Facilitylookup: []
            };
            vm.items.push(lineItem);
            $scope.InitialFacilityLoad(lineItem);
            $scope.facilitychange(lineItem);
        };

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
                }
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.serviceitemid
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            if ($scope.UserFacilityList && $scope.UserFacilityList.length < 2) {
                inputData.Params.push({
                    Key: 5,
                    Value: utl.Session.getCurrentFacilityId()
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
            $state.go('app.virtualtab.virtualserviceform', {
                id: $scope.currentcontext.serviceitemid
            });
        };

        $scope.back = function () {
            $state.go('app.virtualserviceitems', {
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
                } else if (item.ServiceRateCategoryId == -1 || item.FacilityId == -1 || !validrate || !item.EffectiveFrom) {
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getUserFacilityList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ServiceRateCategory"
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
                    "Key": "CurrencyType"
                },
                {
                    "Key": "DiscountMode"
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

    VirtualServiceRateController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();