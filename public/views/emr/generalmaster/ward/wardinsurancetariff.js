(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('WardInsuranceTariffController', WardInsuranceTariffController);

    function WardInsuranceTariffController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentcontext.wardid = parseInt($stateParams.id);
        vm.items = [];
        $scope.addNewLineItem = function() {
            var lineItem = {
                Id: 0,
                Status: 1,
                WardId: $scope.currentcontext.wardid,
                InsuranceId: -1,
                RateTypeId: $scope.item.RateTypeId || -1,
                FacilityId: utl.Session.getCurrentFacilityId(),
            };
            vm.items.push(lineItem);
        };

        $scope.getWardInfoCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.RateTypeId = data.ServiceRateCategoryId;
            $scope.addNewLineItem();
        };

        $scope.getWardInfo = function(pageNo) {
            if ($scope.currentcontext.wardid && $scope.currentcontext.wardid > 0) {
                var options = {
                    action: 'generalmaster/wardmaster/GetwardmasterById',
                    data: { Id: $scope.currentcontext.wardid },
                    type: 'post',
                    onComplete: $scope.getWardInfoCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.items = res.Data;
            // if (res.Data.length == 0) {

            // }
            if (res.Data.length > 0) {
                $scope.addNewLineItem();
            }
        };

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.wardid
                    },
                    {
                        Key: 4,
                        Value: utl.Session.getCurrentFacilityId(),
                    }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };


            var options = {
                action: 'generalmaster/WardInsuranceTariff/GetWardInsuranceTariffs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function() {
            vm.items = [];
            $scope.addNewLineItem();
        };

        $scope.backToList = function() {
            $state.go('app.wardtab.detail');
        };

        $scope.addNew = function() {
            $scope.addNewLineItem();
        };

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
            $scope.saveItem();
        };

        $scope.deleteItem = function(idx, item) {
            var name = item.Rate || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
            $scope.initLookup();
        };

        $scope.saveItem = function() {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'generalmaster/WardInsuranceTariff/ManageWardInsuranceTariff',
                    data: {
                        Data: lines
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [{
                search: 1,
                fields: ['Status']
            }]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.RateTypeId == -1 || item.GuarantorTypeId == -1) {
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
                // if (item.Rate) {
                item.WardId = $scope.currentcontext.wardid;
                result.push(item);
                // }
            }
            return result;
        }

        $scope.GetGuarantorCallback = function(scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            $scope.lookup["ServiceRateCategory"] = data["ServiceRateCategory"];
        };

        $scope.getGuarantor = function(item, idx) {
            item.GuarantorId = -1;
            item.TariffTypeId = -1;
            var inputData = [{
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                                Key: 2,
                                Value: item.GuarantorTypeId
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
                                Value: item.GuarantorTypeId
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

        $scope.initLookupCall = function(inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };


        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getList();
            $scope.getWardInfo();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Guarantor" },
                { "Key": "GuarantorType" },
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

    WardInsuranceTariffController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();