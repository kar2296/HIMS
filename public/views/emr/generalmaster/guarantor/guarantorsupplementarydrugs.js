(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorsupplementaryDrugsFormController', guarantorsupplementaryDrugsFormController);

    function guarantorsupplementaryDrugsFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;
        $scope.currentcontext = {
            guarantorid: parseInt($stateParams.gid)
        };
        $scope.currentfilter={
            ItemMasterId:-1,
            ItemCategoryId:-1
        }

        $scope.Details = [];

        $scope.addNewLineItem = function () {
            var detail = getNewItem();
            $scope.Details.push(detail);
        };

        $scope.IsNewSupplimentaryMap = true;

        function getNewItem() {
            var detail = {
                GuarantorId: $scope.currentcontext.guarantorid,
                Id: 0,
                FacilityId: utl.Session.getCurrentFacilityId(),
                SupplementaryTypeId: 2,
                ServiceItemId: -1,
                ItemMasterId: -1,
                Quantity: 1,
                ServiceCategoryId: -1,
                ItemCategoryId: -1,
                PrintOrder: null,
                GuarantorSupplementaryStatus: 0,
                Status: 1,
            };
            return detail;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.IsNewSupplimentaryMap = false;
                $scope.Details = data.Data;
                $scope.addNewLineItem();
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.guarantorid && $scope.currentcontext.guarantorid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.guarantorid },
                        { Key: 2, Value: 1 },
                        { Key: 3, Value: $scope.currentfilter.ItemMasterId },
                        //{ Key: 4, Value: $scope.currentfilter.ServiceCategoryId },
                        //{ Key: 5, Value: $scope.currentfilter.ItemCategoryId },
                    ]
                };
                var options = {
                    action: 'generalmaster/GuarantorSupplementary/GetGuarantorSupplementarys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.guarantortab.general');
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [8, 9, 27, 13]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        function getLinesForSave() {
            var result = [];
            if ($scope.IsNewSupplimentaryMap) {
                for (var idx in $scope.Details) {
                    var item = $scope.Details[idx];
                    if (item.ItemMasterId > 0 && item.Status == 1) {
                        result.push(item);
                    }
                }
                return result;
            }
            else {
                for (var idx in $scope.Details) {
                    var item = $scope.Details[idx];
                    if (item.ItemMasterId > 0) {
                        result.push(item);
                    }
                }
                return result;
            }
        }

        $scope.saveItem = function () {
            var Details = getLinesForSave();
            var inputData = { Data: Details };
            var options = {
                action: 'generalmaster/GuarantorSupplementary/ManageGuarantorSupplementary',
                data: inputData,
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            var lastidx = $scope.Details.length - 1;
            if ($scope.Details.indexOf(item) === lastidx) {
                $scope.addNewLineItem();
            }
        };

        $scope.deleteDetail = function (item) {
            var lastidx = $scope.Details.length - 1;
            if ($scope.Details.indexOf(item) !== lastidx) {
                var name = item.ItemName || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        $scope.clear = function () {
            $scope.Details = [];
            $scope.addNewLineItem();
        };

        $scope.DrugItemChanged = function (v) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.Details, { pivotkey: 'ItemMasterId', displaykey: 'ItemName' });
            if (isDuplicate) {
                v.ItemMasterId = '';
                v.ItemName = '';
                return;
            }
            var item = v.SelectedItem;
            v.ItemCategoryId = item.CategoryId;
            $scope.addNewLineItem();
        };

        vm.drugitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Item Rate', field: 'ItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselecteddrugitem,
            presearch: presearchdrugitem,
            postsearch: postsearchdrugitem
        };

        function formatselecteddrugitem() {
            var selectedItem = vm.drugitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.drugitemcontrolconfig.rowdata) {
                result = [vm.drugitemcontrolconfig.rowdata.ItemCode, vm.drugitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchdrugitem() {
            var query = vm.drugitemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                    //{ Key: 8, Value: 2 },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.drugitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.drugitemcontrolconfig.searchparams = inputData;
        }

        function postsearchdrugitem() {
            for (var idx in vm.drugitemcontrolconfig.result) {
                var item = vm.drugitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.ItemRate = item.MrPrice;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
           // $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ServiceCategory" },
                { "Key": "ItemCategory" },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "GuarantorSupplementaryStatus" }
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

    guarantorsupplementaryDrugsFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();