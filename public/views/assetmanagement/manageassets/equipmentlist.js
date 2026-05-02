(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('equipmentListController', equipmentListController);

    function equipmentListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            DepartmentId: -1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext = {};
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                ModelNum: " ",
                Serial: "",
                GRNNum: "",
                PONum: "",
                PurchaseValue: "",
                CurrentValue: "",
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),


            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'text', translate: 'assetmanagement.filter.modelnum.lbl', model: 'ModelNum', position: { r: 0, c: 0 } },
                    { type: 'text', translate: 'assetmanagement.filter.serial.lbl', model: 'Serial', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'assetmanagement.filter.grn#.lbl', model: 'GRNNum', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'assetmanagement.filter.po#.lbl', model: 'PONum', position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'assetmanagement.filter.purchasevalue.lbl', model: 'PurchaseValue', position: { r: 2, c: 0 } },
                    { type: 'text', translate: 'assetmanagement.filter.currentvalue.lbl', model: 'CurrentValue', position: { r: 2, c: 1 } },

                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
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
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            // item.InstallationCharges = parseFloat(item.InstallationCharges).toFixed(2);
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.AssetTypeId },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 7, Value: $scope.currentfilter.Description },
                    { Key: 17, Value: $scope.currentfilter.FacilityId },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/EquipmentList/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.labequipmentlist', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.labequipmentform', { id: 0 });
            // $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/EquipmentList/DeleteAsset',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                var deptname = '';
                if (entity.Department && entity.Department.DepartmentName)
                    deptname = entity.Department.DepartmentName;
                $state.go('app.labequipmentform', { id: entity.Id, IsProfile: entity.IsProfile, AssetName: entity.Id + ' - ' + entity.AssetName + ' - ' + deptname });
            }
            else if (actionType == 'Active') {
                $scope.Update(entity.Id, 2);
            }
            else if (actionType == 'Inactive') {
                $scope.Update(entity.Id, 3);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AssetName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "AssetCode", displayName: $translate.instant('assetmanagement.asset.assetcode.lbl') },
                { field: "AssetName", displayName: $translate.instant('assetmanagement.asset.assetname.lbl') },
                { field: "Description", displayName: $translate.instant('assetmanagement.assets.description.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('assetmanagement.assets.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                { "Key": "AssetType" },
                { "Key": "AssetCategory" },
                {
                    "Key": "Department",
                    Request: {
                        Params: [
                            { Key: 5, Value: 2 },
                            { Key: 17, Value: curdeptids }, // Institution dept filter
                        ]
                    }
                },
                { "Key": "ActiveStatus" },
                { "Key": "ModelNum" },
                { "Key": "ModelName" },
                { "Key": "Description" },
                { "Key": "Manufacturer" },
                { "Key": "Serial" },
                { "Key": "PONum" },
                { "Key": "GRNNum" },
                { "Key": "ModelNum" },
                { "Key": "PurchaseValue" },
                { "Key": "CurrentValue" },
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

    equipmentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();