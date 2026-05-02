(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemmasterUOMConversionController', itemmasterUOMConversionController);

    function itemmasterUOMConversionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.Items = [];
        $scope.item = {};
        $scope.currentfilter = {};
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ItemMasterId = parseInt($stateParams.id);
        $scope.item.ItemCode = $state.params.ItemCode;
        $scope.item.ItemName = $state.params.ItemName;

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                ItemMasterId: parseInt($stateParams.id),
                ItemCode: $state.params.ItemCode,
                ItemName: $state.params.ItemName,
                UomTypeId: -1,
                UomTypeCode: '',
                UomTypeName: '',
                UomId: -1,
                UomCode: '',
                UomName: '',
                Status: 1,
                StatusId: true
            };

            vm.items.push(lineItem);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.item.ItemMasterId }
                ],
                PageContext: {
                    PageSize: 400,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/uomconversion/GetUomConversions',
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

        $scope.addNew = function () {
            $scope.addNewLineItem();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            //$scope.saveItem();
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.UomTypeName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                //var lines = getLinesForSave();
                var res = getLinesForSave();
                var lines = [];
                if (res.isValid)
                    lines = res.lines;
                else
                    return false;
                var options = {
                    action: 'pharmacy/uomconversion/ManageUomConversions',
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
                if (idx == lastIndex && !item.UomTypeId && !item.UomId) {
                    continue;
                } else if (!item.UomTypeId || !item.UomId) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;
            var isValid = false;
            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.UomTypeId > 0 && item.UomId > 0 && item.Status == 1) {
                    //result.push(item);
                    if (duplicateUomTypes(item)) {
                        result.push(item);
                        isValid = true;
                    } else {
                        return {
                            isValid: false,
                            lines: []
                        };
                    }
                }
            }
            //return result;
            return {
                isValid: isValid,
                lines: result
            };
        }

        function duplicateUomTypes(item) {
            var duplicateCount = 0;
            for (var idx in vm.items) {
                var uomitem = vm.items[idx];
                if (uomitem.UomTypeId == item.UomTypeId && uomitem.Status == 1) {
                    duplicateCount = duplicateCount + 1;
                }
            }

            if (duplicateCount > 1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.facilitymaster.duplicateuom.lbl'));
                return false;
            }

            return true;
        }

        $scope.backToFacilityItemList = function () {
            $state.go('app.facilityitemmasters', {
                filter_itemmasterid: $scope.currentcontext.id,
                filter_facilityid: utl.Session.getCurrentFacilityId()
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "UomType" },
                {
                    "Key": "UomMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
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

    itemmasterUOMConversionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();