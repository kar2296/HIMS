(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('servicepackageFormController', servicepackageFormController);

    function servicepackageFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        $scope.item = {};
        $scope.serviceDetails = [];
        $scope.finalServiceDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.index = 0;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.index = parseInt(modalConfig.params.index);
            $scope.serviceDetails = modalConfig.params.IPPackageServiceInclusions || [];
            $scope.serviceratecategory = modalConfig.params.ServiceRateCategoryId;
            $scope.servicecategoryid = modalConfig.params.ServiceCategoryId;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            $scope.TotalAmount = 0;
            for (var idx in $scope.serviceDetails) {
                $scope.TotalAmount += parseFloat($scope.serviceDetails[idx].Amount);
            }
        }

        $scope.addNew = function () {
            var newItem = {
                Id: 0,
                ServiceCategoryId: 0,
                ServiceItemId: 0,
                ServiceItemCode: '',
                ServiceItemName: '',
                Quantity: 1,
                Rate: 0,
                Amount: 0,
                TotalAmount: 0,
                Status: 1
            }
            $scope.serviceDetails.push(newItem);
        };

        $scope.backToList = function () {
            $scope.cancelCallback();
        };

        $scope.clear = function () {
            forEach($scope.serviceDetails, function (v, k) {
                v.Status = 2;
            });
            $scope.addNew();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            if ($scope.serviceDetails.length == 0) { }
        };

        $scope.deleteServiceDetail = function (idx, item) {
            if (item.ServiceItemId != -1)
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            else
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.package-form.deleteitem.lbl'));

        };

        $scope.saveItem = function () {
            for (var idx in $scope.serviceDetails) {
                var item = $scope.serviceDetails[idx];
                if (item.ServiceItemId == 0 || item.ServiceItemId == -1) {
                    if (item.Status == 1) {
                        utl.Alert.showErrorMsg($translate.instant('clinicalmaster.package-form.saveitem.lbl'));
                        return false;
                    }
                }
            }

            for (var idx in $scope.serviceDetails) {
                var item = $scope.serviceDetails[idx];
                if (item.Id > 0) {
                    $scope.finalServiceDetails.push(item);
                } else if (item.Status == 1) {
                    $scope.finalServiceDetails.push(item);
                }
            }
            $scope.confirmCallback({ idx: $scope.currentcontext.index, data: $scope.finalServiceDetails, Amount: $scope.TotalAmount });
        };

        if ($scope.serviceDetails.length == 0)
            $scope.addNew();

        $scope.calAmt = function (index, item) {
            if (item.ServiceItemId > 0) {
                item.Amount = item.Rate * item.Quantity;
                item.TotalAmount = item.Rate * item.Quantity;
                $scope.TotalAmount = 0;
                for (var idx in $scope.serviceDetails) {
                    $scope.TotalAmount += parseFloat($scope.serviceDetails[idx].Amount);
                }
            }
        };

        $scope.ServiceItemChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.serviceDetails, { pivotkey: 'ServiceItemId', displaykey: 'ServiceName' });
            if (isDuplicate) {
                item.ServiceId = '';
                item.ServiceName = '';
                return;
            }
            var ServiceItemobj = item.SelectedItem;
            item.ServiceItemId = ServiceItemobj.Id;
            item.ServiceItemCode = ServiceItemobj.ItemCode;
            item.ServiceItemName = ServiceItemobj.Name;
            item.Rate = ServiceItemobj.ServiceItemRate;
            item.ServiceCategoryId = $scope.servicecategoryid;
            $scope.calAmt(idx, item)
            if (ServiceItemobj != null) {
                var ServiceTraiffobj = (ServiceItemobj.ServiceItemTariffDetails, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.Rate = ServiceTraiffobj[0].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[1].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[2].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[3].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[4].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[5].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[6].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[7].ServiceItemRate;
                    item.Rate = ServiceTraiffobj[8].ServiceItemRate;
                    $scope.calAmt(idx, item)
                    $scope.addNewLineItem();
                }
            }
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
                    { Key: 3, Value: $scope.servicecategoryid },
                    { Key: 4, Value: 2 }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
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
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.serviceratecategory }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                }
            }
        }
    }

    servicepackageFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();