(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemMastersListController', facilityitemMastersListController);

    function facilityitemMastersListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.advancedfilter = {};
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ItemMasterId: -1,
            ItemCode: '',
            ItemName: '',
            ProductTypeId: -1,
            CategoryId: parseInt(utl.Session.getCurrentItemCategoryId()),
            SubCategoryId: parseInt(utl.Session.getCurrentItemSubCategoryId()),
            IndicationId: -1,
            GenericId: -1,
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            if ($scope.currentfilter.CategoryId == 0) {
                $scope.currentfilter.CategoryId = -1;
            }
            if ($scope.currentfilter.SubCategoryId == 0) {
                $scope.currentfilter.SubCategoryId = -1;
            }
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.ItemCode },
                    { Key: 3, Value: $scope.currentfilter.ItemName },
                    { Key: 6, Value: $scope.currentfilter.ProductTypeId },
                    { Key: 7, Value: $scope.currentfilter.CategoryId },
                    { Key: 8, Value: $scope.currentfilter.SubCategoryId },
                    { Key: 11, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 13, Value: $scope.currentfilter.GenericId },
                    { Key: 22, Value: $scope.currentfilter.IndicationId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemFacilityMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getItemCallback = function (scope, res, options, hasError) {
            /*
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            */

            if (res.Data.length > 0) {
                $state.go('app.facilityitemmastertab.facilityitemmaster', {
                    id: res.Data[0].Id,
                    IsProfile: res.Data[0].IsProfile,
                    FacilityId: res.Data[0].FacilityId,
                    ItemMasterId: res.Data[0].ItemMasterId,
                    ItemCode: res.Data[0].ItemCode,
                    ItemName: res.Data[0].ItemName,
                    CategoryId: res.Data[0].CategoryId,
                    SubCategoryId: res.Data[0].SubCategoryId,
                    ProductTypeId: res.Data[0].ProductTypeId,
                    SubProductTypeId: res.Data[0].SubProductTypeId,
                    GenericName: res.Data[0].GenericName,
                    GstId: res.Data[0].GstId,
                    InGstId: res.Data[0].InGstId,
                    CGstId: res.Data[0].CGstId,
                    SGstId: res.Data[0].SGstId,
                    IsBillable: res.Data[0].IsBillable
                });
            }
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.ItemMasterId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemFacilityMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.facilityitemmastertab.facilityitemmaster', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/itemmaster/DeleteItemMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.facilityitemmastertab.facilityitemmaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    FacilityId: entity.FacilityId,
                    ItemMasterId: entity.ItemMasterId,
                    ItemCode: entity.ItemCode,
                    ItemName: entity.ItemName,
                    CategoryId: entity.CategoryId,
                    SubCategoryId: entity.SubCategoryId,
                    ProductTypeId: entity.ProductTypeId,
                    SubProductTypeId: entity.SubProductTypeId,
                    GenericName: entity.GenericName,
                    GstId: entity.GstId,
                    InGstId: entity.InGstId,
                    CGstId: entity.CGstId,
                    SGstId: entity.SGstId,
                    IsBillable: entity.IsBillable
                });
            } else if (actionType == 'view') {
                $state.go('app.facilityitemmastertab.facilityitemmaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    FacilityId: entity.FacilityId,
                    ItemMasterId: entity.ItemMasterId,
                    ItemCode: entity.ItemCode,
                    ItemName: entity.ItemName,
                    CategoryId: entity.CategoryId,
                    SubCategoryId: entity.SubCategoryId,
                    ProductTypeId: entity.ProductTypeId,
                    SubProductTypeId: entity.SubProductTypeId,
                    GenericName: entity.GenericName,
                    GstId: entity.GstId,
                    InGstId: entity.InGstId,
                    CGstId: entity.CGstId,
                    SGstId: entity.SGstId,
                    IsBillable: entity.IsBillable
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ItemName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ItemCode", displayName: $translate.instant('inventory.itemmasters.code.lbl') },
                { field: "ItemName", displayName: $translate.instant('inventory.itemmasters.name.lbl') },
                { field: "ItemCategory.CategoryName", displayName: $translate.instant('inventory.itemmasters.categoryid.lbl') },
                { field: "ItemSubCategory.SubCategoryName", displayName: $translate.instant('inventory.itemmaster.subcategoryId.lbl') },
                { field: "GenericMaster.GenericName", displayName: $translate.instant('inventory.itemmasters.genericid.lbl') },
                { field: "ProductType.ProductTypeName", displayName: $translate.instant('inventory.itemmasters.producttypeid.lbl') },
                // { field: "IsActive", displayName: $translate.instant('inventory.itemmasters.isactive.lbl') },
                // { field: "IsExpiryMandatory", displayName: $translate.instant('inventory.itemmasters.isexpirymandatory.lbl') },
                // { field: "IsBillable", displayName: $translate.instant('inventory.itemmasters.isbillable.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemmasters.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    \</div>',
                                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        function initDynamicForm() {
            $scope.advancedfilterDefault = {};

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'checkbox', translate: 'inventory.itemmaster.isbatchmandatory.lbl', model: 'IsBatchMandatory', position: { r: 1, c: 0 } },
                    { type: 'checkbox', translate: 'inventory.itemmaster.isbillable.lbl', model: 'IsBillable', position: { r: 1, c: 1 } },
                    { type: 'checkbox', translate: 'inventory.itemmaster.isexpirymandatory.lbl', model: 'IsExpiryMandatory', position: { r: 2, c: 0 } },
                    { type: 'checkbox', translate: 'inventory.itemmaster.ismanufacture.lbl', model: 'IsManufacture', position: { r: 2, c: 1 } },
                    { type: 'checkbox', translate: 'inventory.itemmaster.ismrprequired.lbl', model: 'IsMRPRequired', position: { r: 3, c: 0 } },
                    { type: 'checkbox', translate: 'inventory.itemmaster.isreusable.lbl', model: 'IsReusable', position: { r: 3, c: 1 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-success' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        vm.Genericitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Generic Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Allergen Type',
                field: 'AllergenType',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedGenericitem,
            presearch: presearchgenericitem,
            postsearch: postsearchGenericitem
        };

        function formatselectedGenericitem() {
            var selectedItem = vm.Genericitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('    ');
            } else if (vm.Genericitemcontrolconfig.rowdata) {
                result = [vm.Genericitemcontrolconfig.rowdata.GenericName, vm.Genericitemcontrolconfig.rowdata.Code].join(' ');
            }
            return result;
            $scope.getList();
        }

        function presearchgenericitem() {
            var query = vm.Genericitemcontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.Genericitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 3, Value: 2 });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.Genericitemcontrolconfig.searchparams = inputData;
        }

        function postsearchGenericitem() {
            for (var idx in vm.Genericitemcontrolconfig.result) {
                var item = vm.Genericitemcontrolconfig.result[idx];
                item.Code = item.Code;
                item.GenericName = item.GenericName;
                item.AllergenType = item.AllergenType.Description;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            if ($stateParams.filter_itemmasterid > 0) {
                $scope.currentfilter.ItemMasterId = $stateParams.filter_itemmasterid;
                $scope.currentfilter.FacilityId = $stateParams.filter_facilityid;

                $scope.getItem();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "ProductType" },
                {
                    "Key": "ItemCategory",
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
                {
                    "Key": "ItemSubCategory",
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
            ]
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

    facilityitemMastersListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();