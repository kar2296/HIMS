(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceItemAliasListController', serviceItemAliasListController);

    function serviceItemAliasListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.serviceitemid = parseInt($stateParams.id);

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                Status: 1,
                StatusId: true,
                AliasTypeId: -1,
                ExternalProviderId: -1,
                Guarantor: [],
            };
            vm.items.push(lineItem);
        }
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            for (var idx in vm.items) {
                var item = vm.items[idx];
                $scope.addDynGuarantor(item);
            }
            $scope.addNewLineItem();
        };

        $scope.addDynGuarantor = function (item) {
            item.Guarantor = [];
            for (var idx1 in $scope.lookup.Guarantor) {
                if (item.AliasTypeId == $scope.lookup.Guarantor[idx1].GuarantorTypeId) {
                    item.Guarantor.push($scope.lookup.Guarantor[idx1]);
                    if (item.ExternalProviderId == -1)
                        item.ExternalProviderId = $scope.lookup.Guarantor[idx1].Id;
                }
            }
        }

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.serviceitemid }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'clinicalmaster/serviceitemalias/GetServiceItemAliass',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        }
        $scope.backToList = function () {
            $state.go('app.serviceitemtab.details', { id: $scope.currentcontext.serviceitemid });
        }
        $scope.back = function () {
            $state.go('app.serviceitems', { id: $scope.currentcontext.serviceitemid });
        }
        $scope.addNew = function () {
            $scope.addNewLineItem();
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function (idx, item) {
            var name = item.AliasName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'clinicalmaster/serviceitemalias/ManageSerivceItemAlias',
                    data: { Data: lines },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [
                { search: 1, fields: ['Status'] }
            ]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.AliasId && !item.AliasName) {
                    continue;
                }
                else if (item.FacilityId == -1 || item.ExternalProviderId == -1 || !item.AliasId || !item.AliasName) {
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
                if (item.AliasId && item.AliasName) {
                    item.ServiceItemId = $scope.currentcontext.serviceitemid;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.setDefaultValues = function (item) {
            item.ExternalProviderId = -1;
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var fullGuarantorType = $scope.lookup.GuarantorType;
            $scope.lookup.GuarantorType = [];
            for (var idx in fullGuarantorType) {
                if (idx > 1) {
                    $scope.lookup.GuarantorType.push(fullGuarantorType[idx]);
                }
            }
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AliasType" },
                { "Key": "Facility" },
                { "Key": "GuarantorType" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Group" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    serviceItemAliasListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();