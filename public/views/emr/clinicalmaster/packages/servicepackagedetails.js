(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('servicePackagedetailsController', servicePackagedetailsController);

    function servicePackagedetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        $scope.item = {};
        $scope.serviceDetails = [];
        $scope.finalIncServiceDetails = [];
        $scope.finalExcServiceDetails = [];
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

        $scope.addNew = function() {
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

        $scope.backToList = function() {
            $scope.cancelCallback();
        };

        $scope.clear = function() {
            forEach($scope.serviceDetails, function(v, k) {
                v.Status = 2;
            });
            $scope.addNew();
        };

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
            if ($scope.serviceDetails.length == 0) {}
        };

        $scope.deleteServiceDetail = function(idx, item) {
            if (item.ServiceItemId != -1)
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            else
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.package-form.deleteitem.lbl'));

        };

        $scope.saveItem = function() {
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
                if (item.IsExclusion == true) {
                    if (item.Id > 0) {
                        $scope.finalExcServiceDetails.push(item);
                    } else if (item.Status == 1) {
                        $scope.finalExcServiceDetails.push(item);
                    }
                } else {
                    if (item.Id > 0) {
                        $scope.finalIncServiceDetails.push(item);
                    } else if (item.Status == 1) {
                        $scope.finalIncServiceDetails.push(item);
                    }
                }
            }
            $scope.confirmCallback({
                idx: $scope.currentcontext.index,
                incdata: $scope.finalIncServiceDetails,
                excdata: $scope.finalExcServiceDetails,
                Amount: $scope.TotalAmount
            });
        };

        if ($scope.serviceDetails.length == 0)
            $scope.addNew();

        $scope.calAmt = function(item) {
            if (item.ServiceItemId > 0) {
                item.Amount = item.Rate * item.Quantity;
                item.TotalAmount = item.Rate * item.Quantity;
                $scope.TotalAmount = 0;
                for (var idx in $scope.serviceDetails) {
                    $scope.TotalAmount += parseFloat($scope.serviceDetails[idx].Amount);
                }
            }
        };

        $scope.ServiceItemChanged = function(item) {
            item.ServiceItemId = item.ServiceItemId;
            item.ServiceItemCode = item.ItemCode;
            item.ServiceItemName = item.Name;
            item.Quantity = 1;
            item.ServiceCategoryId = $scope.servicecategoryid;
            $scope.calAmt(item)
            if (item != null) {
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.serviceratecategory }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.Rate = ServiceTraiffobj[0].Rate;
                    $scope.calAmt(item)
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
                result = [selectedItem.Name + '(' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ItemCode, vm.serviceitemcontrolconfig.rowdata.Name].join(' ');
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

        $scope.ServiceChanged = function() {
            for (var idx in $scope.serviceDetails) {
                var serData = $scope.serviceDetails[idx];
                $scope.ServiceItemChanged(serData);
            }
        }

        $scope.LoadServiceItemsCallback = function(scope, res, options, hasError) {
            $scope.serviceDetails = [];
            for (var idx in res.Data) {
                var serviceInfo = res.Data[idx];
                serviceInfo.ServiceItemId = serviceInfo.Id;
                serviceInfo.Id = 0;
                $scope.serviceDetails.push(serviceInfo);
            }
            $scope.ServiceChanged();
        };

        $scope.LoadServiceItems = function() {

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.servicecategoryid },
                    { Key: 4, Value: 2 }
                ],
            };

            var options = {
                action: 'clinicalmaster/serviceitem/GetServiceItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.LoadServiceItemsCallback
            };

            utl.Http.doAction(options);
        };


        $scope.LoadServiceItems();
    }

    servicePackagedetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();