(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemMastersBybranchController', itemMastersBybranchController);

    function itemMastersBybranchController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.advancedfilter = {};
        $scope.currentfilter = {
            ItemMasterId: -1,
            ItemCode: '',
            ItemName: '',
            ProductTypeId: -1,
            CategoryId: parseInt(utl.Session.getCurrentItemCategoryId()),
            SubCategoryId: parseInt(utl.Session.getCurrentItemSubCategoryId()),
            FacilityId: utl.Session.getCurrentFacilityId(),
            IndicationId: -1,
            GenericId: -1,
            ActiveStatusId: 2
        };

        vm.drugindicationcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Indication Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Indication Name', field: 'Indications', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/Indication/GetIndications',
            formatdisplay: formatselecteddrugindication,
            presearch: presearchdrugindication,
            postsearch: postsearchdrugindication
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        function formatselecteddrugindication() {
            var selectedItem = vm.drugindicationcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.IndicationId = selectedItem.Id;
                $scope.item.Code = selectedItem.IndicationCode;
                $scope.item.Indications = selectedItem.Indications;
                result = [selectedItem.Indications + ' (' + selectedItem.Code + ')'].join(' ');
            } else if (vm.drugindicationcontrolconfig.rowdata) {
                result = [vm.drugindicationcontrolconfig.rowdata.Indications, vm.drugindicationcontrolconfig.rowdata.IndicationCode].join(' ');
            }
            return result;
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function presearchdrugindication() {
            var query = vm.drugindicationcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.drugindicationcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 2, Value: query });
            }

            vm.drugindicationcontrolconfig.searchparams = inputData;
        }

        function postsearchdrugindication() {
            for (var idx in vm.drugindicationcontrolconfig.result) {
                var item = vm.drugindicationcontrolconfig.result[idx];

                item.Code = item.Code;
                item.Indications = item.Indications;
            }
        }

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
                    { Key: 3, Value: $scope.currentfilter.ItemCode },
                    { Key: 11, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 6, Value: $scope.currentfilter.ProductTypeId },
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 13, Value: $scope.currentfilter.GenericId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/ItemFacilityMap/GetItemFacilityMaps',
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
                $state.go('app.itemmasterbybranch', {
                    id: res.Data[0].Id,
                    IsProfile: res.Data[0].IsProfile,
                    ItemCode: res.Data[0].ItemCode,
                    ItemName: res.Data[0].ItemName,
                    ItemDescription: res.Data[0].ItemDescription,
                    ItemShortDescription: res.Data[0].ItemShortDescription,
                    CategoryId: res.Data[0].CategoryId,
                    SubCategoryId: res.Data[0].SubCategoryId,
                    ProductTypeId: res.Data[0].ProductTypeId,
                    SubProductTypeId: res.Data[0].SubProductTypeId,
                    GenericId: res.Data[0].GenericId,
                    GenericCode: res.Data[0].GenericCode,
                    GenericName: res.Data[0].GenericName,
                    ManufacturerId: res.Data[0].ManufacturerId,
                    ManufacturerCode: res.Data[0].ManufacturerCode,
                    ManufacturerName: res.Data[0].ManufacturerName,
                    BaseUomId: res.Data[0].BaseUomId,
                    PurchaseUomId: res.Data[0].PurchaseUomId,
                    SaleUomId: res.Data[0].SaleUomId,
                    ScheduleTypeId: res.Data[0].ScheduleTypeId,
                    GstId: res.Data[0].GstId,
                    InGstId: res.Data[0].InGstId,
                    CGstId: res.Data[0].CGstId,
                    SGstId: res.Data[0].SGstId,
                    ProductRegNo: res.Data[0].ProductRegNo,
                    IsBatchMandatory: res.Data[0].IsBatchMandatory,
                    IsExpiryMandatory: res.Data[0].IsExpiryMandatory,
                    ItemPrice: res.Data[0].ItemPrice,
                    CostPrice: res.Data[0].CostPrice,
                    MrPrice: res.Data[0].MrPrice,
                    DrugId: res.Data[0].DrugId,
                    DrugCode: res.Data[0].DrugCode,
                    DrugName: res.Data[0].DrugName,
                    IsCssd: res.Data[0].IsCssd,
                    HSNId: res.Data[0].HSNId,
                    HSNCode: res.Data[0].HSNCode,
                    HSNName: res.Data[0].HSNName,
                    IsConsignment: res.Data[0].IsConsignment,
                    IsGenericAllow: res.Data[0].IsGenericAllow,
                    IsBillable: res.Data[0].IsBillable,
                    IsManufacture: res.Data[0].IsManufacture,
                    IsControlled: res.Data[0].IsControlled,
                    IsColdChain: res.Data[0].IsColdChain,
                    IsAsset: res.Data[0].IsAsset,
                    IsDescriptionEdit: res.Data[0].IsDescriptionEdit,
                    IsHighAlert: res.Data[0].IsHighAlert,
                    IsNarcotic: res.Data[0].IsNarcotic,
                    IsReusable: res.Data[0].IsReusable,
                    IsMRPRequired: res.Data[0].IsMRPRequired,
                    CanEditPriceForGrn: res.Data[0].CanEditPriceForGrn,
                    IsConsumable: res.Data[0].IsConsumable,
                    Min: res.Data[0].Min,
                    Max: res.Data[0].Max,
                    ActiveStatusId: res.Data[0].ActiveStatusId,
                    IsActive: res.Data[0].IsActive,
                    ActiveFrom: res.Data[0].ActiveFrom,
                    ActiveTo: res.Data[0].ActiveTo,
                    ImagePath: res.Data[0].ImagePath
                });
            }
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentfilter.ItemMasterId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.itemmasterbybranch', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
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
                $state.go('app.itemmasterbybranch', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    ItemCode: entity.ItemCode,
                    ItemName: entity.ItemName,
                    ItemDescription: entity.ItemDescription,
                    ItemShortDescription: entity.ItemShortDescription,
                    CategoryId: entity.CategoryId,
                    SubCategoryId: entity.SubCategoryId,
                    ProductTypeId: entity.ProductTypeId,
                    SubProductTypeId: entity.SubProductTypeId,
                    GenericId: entity.GenericId,
                    GenericCode: entity.GenericCode,
                    GenericName: entity.GenericName,
                    ManufacturerId: entity.ManufacturerId,
                    ManufacturerCode: entity.ManufacturerCode,
                    ManufacturerName: entity.ManufacturerName,
                    BaseUomId: entity.BaseUomId,
                    PurchaseUomId: entity.PurchaseUomId,
                    SaleUomId: entity.SaleUomId,
                    ScheduleTypeId: entity.ScheduleTypeId,
                    GstId: entity.GstId,
                    InGstId: entity.InGstId,
                    CGstId: entity.CGstId,
                    SGstId: entity.SGstId,
                    ProductRegNo: entity.ProductRegNo,
                    IsBatchMandatory: entity.IsBatchMandatory,
                    IsExpiryMandatory: entity.IsExpiryMandatory,
                    ItemPrice: entity.ItemPrice,
                    CostPrice: entity.CostPrice,
                    MrPrice: entity.MrPrice,
                    DrugId: entity.DrugId,
                    DrugCode: entity.DrugCode,
                    DrugName: entity.DrugName,
                    IsCssd: entity.IsCssd,
                    HSNId: entity.HSNId,
                    HSNCode: entity.HSNCode,
                    HSNName: entity.HSNName,
                    IsConsignment: entity.IsConsignment,
                    IsGenericAllow: entity.IsGenericAllow,
                    IsBillable: entity.IsBillable,
                    IsManufacture: entity.IsManufacture,
                    IsControlled: entity.IsControlled,
                    IsColdChain: entity.IsColdChain,
                    IsAsset: entity.IsAsset,
                    IsDescriptionEdit: entity.IsDescriptionEdit,
                    IsHighAlert: entity.IsHighAlert,
                    IsNarcotic: entity.IsNarcotic,
                    IsReusable: entity.IsReusable,
                    IsMRPRequired: entity.IsMRPRequired,
                    CanEditPriceForGrn: entity.CanEditPriceForGrn,
                    IsConsumable: entity.IsConsumable,
                    Min: entity.Min,
                    Max: entity.Max,
                    ActiveStatusId: entity.ActiveStatusId,
                    IsActive: entity.IsActive,
                    ActiveFrom: entity.ActiveFrom,
                    ActiveTo: entity.ActiveTo,
                    ImagePath: entity.ImagePath
                });
            } else if (actionType == 'view') {
                $state.go('app.itemmasterbybranch', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    ItemCode: entity.ItemCode,
                    ItemName: entity.ItemName,
                    ItemDescription: entity.ItemDescription,
                    ItemShortDescription: entity.ItemShortDescription,
                    CategoryId: entity.CategoryId,
                    SubCategoryId: entity.SubCategoryId,
                    ProductTypeId: entity.ProductTypeId,
                    SubProductTypeId: entity.SubProductTypeId,
                    GenericId: entity.GenericId,
                    GenericCode: entity.GenericCode,
                    GenericName: entity.GenericName,
                    ManufacturerId: entity.ManufacturerId,
                    ManufacturerCode: entity.ManufacturerCode,
                    ManufacturerName: entity.ManufacturerName,
                    BaseUomId: entity.BaseUomId,
                    PurchaseUomId: entity.PurchaseUomId,
                    SaleUomId: entity.SaleUomId,
                    ScheduleTypeId: entity.ScheduleTypeId,
                    GstId: entity.GstId,
                    InGstId: entity.InGstId,
                    CGstId: entity.CGstId,
                    SGstId: entity.SGstId,
                    ProductRegNo: entity.ProductRegNo,
                    IsBatchMandatory: entity.IsBatchMandatory,
                    IsExpiryMandatory: entity.IsExpiryMandatory,
                    ItemPrice: entity.ItemPrice,
                    CostPrice: entity.CostPrice,
                    MrPrice: entity.MrPrice,
                    DrugId: entity.DrugId,
                    DrugCode: entity.DrugCode,
                    DrugName: entity.DrugName,
                    IsCssd: entity.IsCssd,
                    HSNId: entity.HSNId,
                    HSNCode: entity.HSNCode,
                    HSNName: entity.HSNName,
                    IsConsignment: entity.IsConsignment,
                    IsGenericAllow: entity.IsGenericAllow,
                    IsBillable: entity.IsBillable,
                    IsManufacture: entity.IsManufacture,
                    IsControlled: entity.IsControlled,
                    IsColdChain: entity.IsColdChain,
                    IsAsset: entity.IsAsset,
                    IsDescriptionEdit: entity.IsDescriptionEdit,
                    IsHighAlert: entity.IsHighAlert,
                    IsNarcotic: entity.IsNarcotic,
                    IsReusable: entity.IsReusable,
                    IsMRPRequired: entity.IsMRPRequired,
                    CanEditPriceForGrn: entity.CanEditPriceForGrn,
                    IsConsumable: entity.IsConsumable,
                    Min: entity.Min,
                    Max: entity.Max,
                    ActiveStatusId: entity.ActiveStatusId,
                    IsActive: entity.IsActive,
                    ActiveFrom: entity.ActiveFrom,
                    ActiveTo: entity.ActiveTo,
                    ImagePath: entity.ImagePath
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GstName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ItemCode", displayName: $translate.instant('inventory.itemmasters.code.lbl') },
                {
                    field: "ItemName", displayName: $translate.instant('inventory.itemmasters.name.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents' style=\"width:300px;\">"
                        + '<a  uib-tooltip="&nbsp;{{entity.ItemName}}  / {{entity.ItemCode}} " tooltip-placement="right" >'
                        + "<span >{{entity.ItemName}}</span>"
                        + "</div>"
                },
                // { field: "ItemName", displayName: $translate.instant('inventory.itemmasters.name.lbl') },
                { field: "ItemCategory.CategoryName", displayName: $translate.instant('inventory.itemmasters.categoryid.lbl') },
                { field: "ItemSubCategory.SubCategoryName", displayName: $translate.instant('inventory.itemmaster.subcategoryId.lbl') },
                { field: "GenericMaster.GenericName", displayName: $translate.instant('inventory.itemmasters.genericid.lbl') },
                { field: "ProductType.ProductTypeName", displayName: $translate.instant('inventory.itemmasters.producttypeid.lbl') },
                { field: "IsActive", displayName: $translate.instant('inventory.itemmasters.isactive.lbl') },
                { field: "IsExpiryMandatory", displayName: $translate.instant('inventory.itemmasters.isexpirymandatory.lbl') },
                { field: "IsBillable", displayName: $translate.instant('inventory.itemmasters.isbillable.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemmasters.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><i class="btn btn-danger btn-rounded fa fa-times" aria-hidden="true"></i></span>\
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
                // item.AllergenType = item.AllergenType.Description;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            if ($stateParams.filter_itemmasterid > 0) {
                $scope.currentfilter.ItemMasterId = $stateParams.filter_itemmasterid;
                $scope.getItem();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                {
                    "Key": "ProductType",
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

    itemMastersBybranchController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();