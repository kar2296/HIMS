(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('assignedpackageInfoController', assignedpackageInfoController);

    function assignedpackageInfoController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsActive: true,
            ServiceRateCategoryId: -1,
            DepartmentId: -1,
            GuarantorTypeId: -1,
            DisocuntTypeId: -1,
            GuarantorId: -1,
            DisountModeId: -1
        };

        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.details = [];
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            var result = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                result.push(item);
            }
            $scope.details = result;
        };

        $scope.getDetails = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{ Key: 1, Value: $scope.currentcontext.id }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };

                var options = {
                    action: 'clinicalmaster/IPPackageDetail/GetIPPackageDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            // $scope.GuarantorTypeChange();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'clinicalmaster/IPPackage/GetIPPackageById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        function loadData() {
            $scope.getItem();
            $scope.getDetails();
        }

        vm.packagecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'ServiceCategoryCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'ServiceCategoryName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/servicecategory/GetServiceCategorys',
            formatdisplay: formatselectedpackage,
            presearch: presearchpackage,
            postsearch: postsearchpackage
        };

        function formatselectedpackage() {
            var selectedItem = vm.packagecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceCategoryName + '(' + selectedItem.ServiceCategoryCode + ')'].join('  ');
            } else if (vm.packagecontrolconfig.rowdata) {
                result = [vm.packagecontrolconfig.rowdata.ServiceCategoryName, vm.packagecontrolconfig.rowdata.ServiceCategoryCode, ].join(' ');
            }

            return result;
        }

        function presearchpackage() {
            var query = vm.packagecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.packagecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.packagecontrolconfig.searchparams = inputData;
        }

        function postsearchpackage() {
            for (var idx in vm.packagecontrolconfig.result) {
                var item = vm.packagecontrolconfig.result[idx];
                item.ServiceCategoryName = item.ServiceCategoryName
                item.ServiceCategoryCode = item.ServiceCategoryCode;
            }
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ServiceCategory" },
                { "Key": "ServiceRateCategory" },
                { "Key": "DiscountMode" },
                { "Key": "DiscountType" },
                { "Key": "ServiceCategory" },
                { "Key": "GuarantorType" },
                { "Key": "SelectedGuarantor" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Facility" },
                {
                    Key: 'Department',
                    Request: { Params: [{ Key: 5, Value: 2 }] }
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

    assignedpackageInfoController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();