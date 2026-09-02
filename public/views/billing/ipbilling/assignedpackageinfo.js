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

        // ------------------------------------------------------------------
        // React bridge for this modal's seven live <ui-select> controls.
        // All seven render through the shared BridgeLookupSelectScreen; no new
        // React component. Nothing else changes: the package workflow, its
        // amounts and limits, eligibility and assignment rules, the line-item
        // repeat, the two API calls
        // (clinicalmaster/IPPackage/GetIPPackageById and
        // clinicalmaster/IPPackageDetail/GetIPPackageDetails) with their exact
        // payloads, and the modal callbacks are all untouched.
        //
        // PER-ROW MOUNT CHECK: the template's only ng-repeat
        // ("item in details | filter:{Status:1}") starts at live line 226; all
        // seven selects are at lines 43-167, above and outside it. No React
        // root is created per row.
        //
        // Every one of the seven is a READ-ONLY display control: each carries a
        // literal ng-disabled="true", so none of them has ever been editable.
        // None has a name, a required attribute, an ng-change, an on-select, a
        // tabindex, an id or allow-clear -- so no validator shim is added
        // (this screen's item_form gains no validator from them), no change
        // handler is invented, and no selected object is ever needed. The two
        // that carry class="filter-combo" keep it.
        //
        //   item.GuarantorTypeId        lookup.GuarantorType
        //   item.GuarantorId            lookup.Guarantor
        //   item.DisountModeId          lookup.DiscountMode      (field name
        //                               is misspelled in the source; kept)
        //   item.ServiceRateCategoryId  lookup.ServiceRateCategory
        //   item.DisocuntTypeId         lookup.DiscountType      (also
        //                               misspelled in the source; kept)
        //   item.FacilityId             lookup.Facility          filter-combo
        //   item.DepartmentId           lookup.Department
        //
        // DOCUMENTED, NOT CORRECTED: two of the models are misspelled in the
        // original template and in the API payloads -- DisountModeId and
        // DisocuntTypeId. Both are reproduced exactly; renaming either would
        // change the property the server sees.
        //
        // The ui-select-match truncated the selected text at 20 or 15
        // characters with a trailing "..."; as on every other converted
        // ui-select, that is not reproduced -- a native select ellipsizes on
        // its own width.
        //
        // $scope.item is populated asynchronously by GetIPPackageById, so the
        // props are rebuilt from $watchGroup on reference/primitive reads.
        function apiSelectProps(field, lookupKey, extra) {
            var props = {
                options: ($scope.lookup && $scope.lookup[lookupKey]) || [],
                value: $scope.item ? $scope.item[field] : null,
                disabled: true
            };
            if (extra) {
                for (var k in extra) { if (extra.hasOwnProperty(k)) { props[k] = extra[k]; } }
            }
            return props;
        }

        // Read-only controls: the dispatcher is a no-op, matching
        // ng-disabled="true", which never let a change reach the model.
        function apiNoop() {}

        $scope.refreshAssignedPackageProps = function() {
            $scope.reactPropsGuarantorTypeContainer = {
                reactProps: apiSelectProps('GuarantorTypeId', 'GuarantorType'), onAction: apiNoop };
            $scope.reactPropsGuarantorContainer = {
                reactProps: apiSelectProps('GuarantorId', 'Guarantor'), onAction: apiNoop };
            $scope.reactPropsDiscountModeContainer = {
                reactProps: apiSelectProps('DisountModeId', 'DiscountMode'), onAction: apiNoop };
            $scope.reactPropsServiceRateCategoryContainer = {
                reactProps: apiSelectProps('ServiceRateCategoryId', 'ServiceRateCategory'), onAction: apiNoop };
            $scope.reactPropsDiscountTypeContainer = {
                reactProps: apiSelectProps('DisocuntTypeId', 'DiscountType', { className: 'filter-combo' }), onAction: apiNoop };
            $scope.reactPropsFacilityContainer = {
                reactProps: apiSelectProps('FacilityId', 'Facility', { className: 'filter-combo' }), onAction: apiNoop };
            $scope.reactPropsDepartmentContainer = {
                reactProps: apiSelectProps('DepartmentId', 'Department'), onAction: apiNoop };
        };

        $scope.refreshAssignedPackageProps();

        $scope.$watchGroup([
            function() { return $scope.lookup; },
            function() { return $scope.item && $scope.item.GuarantorTypeId; },
            function() { return $scope.item && $scope.item.GuarantorId; },
            function() { return $scope.item && $scope.item.DisountModeId; },
            function() { return $scope.item && $scope.item.ServiceRateCategoryId; },
            function() { return $scope.item && $scope.item.DisocuntTypeId; },
            function() { return $scope.item && $scope.item.FacilityId; },
            function() { return $scope.item && $scope.item.DepartmentId; }
        ], $scope.refreshAssignedPackageProps);

        $scope.initLookup();
    }

    assignedpackageInfoController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();