(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetMaintananceListController', assetMaintananceListController);

    function assetMaintananceListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.assetid = parseInt($stateParams.id);

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                EventDescription: '',
                EventDate: utl.Formatter.getCurrentDate(),
                MaintananceDate: utl.Formatter.getCurrentDate(),
                MaintananceDescription: '',
                PerformedBy: '',
                Cost: 0,
                Status: 1,
                StatusId: true
            };
            vm.items.push(lineItem);
        }
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            // $scope.addNewLineItem();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.assetid
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'AssetManagement/AssetMaintanance/GetAssetMaintanances',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.item = {
            TotalMaintenance: '',
            Completed: '',
            Pending: '',

            NextSchedule: null,
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        }
        $scope.backToList = function () {
            $state.go('app.assettab.details', {
                id: $scope.currentcontext.assetid
            });
        }
        $scope.back = function () {
            $state.go('app.assettab.assetwarranties', {
                id: $scope.currentcontext.assetid
            });
        }
        $scope.addNew = function () {
            $scope.addNewLineItem();
        }

        $scope.serviceChanged = function (idx) {
            var lastIndex = vm.items.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function (idx, item) {
            var name = item.EventDescription || '';
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
                    action: 'AssetManagement/AssetMaintanance/ManageAssetMaintanances',
                    data: { Data: lines },
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
        }


        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [{
                search: 1,
                fields: ['Status']
            }]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.EventDescription && !item.Cost) {
                    continue;
                }
                else if ((!item.EventDescription == '' && item.Cost == 0) || (item.EventDescription == '' && item.Cost > 0)) {
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
                if (item.EventDate) {
                    item.AssetId = $scope.currentcontext.assetid;
                    result.push(item);

                }
            }
            return result;
        }

        $scope.computeNetAmount = function (item) {
            if (item.Quantity && item.Amount) {
                item.NetAmount = item.Quantity * item.Amount;
            }
        }
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "TestMaster" },
                // { "Key": "ServiceItemDiscountType"}
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

    assetMaintananceListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();