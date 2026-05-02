(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorsupplementaryServicesFormController', guarantorsupplementaryServicesFormController);

    function guarantorsupplementaryServicesFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;
        $scope.currentcontext = {
            guarantorid: parseInt($stateParams.gid)
        };

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
                SupplementaryTypeId: 1,
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
            }
            else $scope.addNewLineItem();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.guarantorid && $scope.currentcontext.guarantorid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.guarantorid },
                        { Key: 2, Value: 1 }
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
                    if (item.ServiceItemId > 0 && item.Status == 1) {
                        result.push(item);
                    }
                }
                return result;
            } else {
                for (var idx in $scope.Details) {
                    var item = $scope.Details[idx];
                    if (item.ServiceItemId > 0) {
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
                var name = item.ServiceName || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        $scope.clear = function () {
            $scope.Details = [];
            $scope.addNewLineItem();
        };

        $scope.ServiceItemChanged = function (v) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.Details, { pivotkey: 'ServiceItemId', displaykey: 'ServiceName' });
            if (isDuplicate) {
                v.ServiceId = '';
                v.ServiceName = '';
                return;
            }
            var item = v.SelectedItem;
            v.ServiceCategoryId = item.CategoryId;
            $scope.addNewLineItem();
        };

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'ServiceItem Rate', field: 'ServiceItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0)
                    item.ServiceItemRate = item.ServiceItemTariffDetails[0].Rate;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "ServiceCategory" }
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

    guarantorsupplementaryServicesFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();