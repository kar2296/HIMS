(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceItemListController', serviceItemListController);

    function serviceItemListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Code: '',
            Name: '',
            DepartmentId: -1,
            CategoryId: -1,
            ActiveStatusId: 2,
            file: null,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DiagnosisId: -1,
                FacilityId: utl.Session.getCurrentFacilityId(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'select', translate: ' clinicalmaster.serviceitem-form.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 0, c: 0 } },
                    { type: 'select', translate: 'clinicalmaster.serviceitem-list.subcategory.lbl', model: 'SubCategoryId', options: $scope.lookup.ServiceSubCategory, position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'clinicalmaster.serviceitem-form.masterype.lbl', model: 'MasterTypeId', options: $scope.lookup.MasterType, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'clinicalmaster.serviceitem-form.subdepartment.lbl', model: 'SubDepartmentId', options: $scope.lookup.Department, position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'clinicalmaster.serviceitem-form.masteritem.lbl', model: 'MasterName', position: { r: 2, c: 0 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.ispackage.lbl', model: 'IsPackage', position: { r: 2, c: 1 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.isorderable.lbl', model: 'IsOrderable', position: { r: 3, c: 0 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.israteeditable.lbl', model: 'IsRateEditable', position: { r: 3, c: 1 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.iszerobill.lbl', model: 'IsZeroBill', position: { r: 4, c: 0 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.issurgicalprocedure.lbl', model: 'IsSurgicalProcedure', position: { r: 4, c: 1 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.equipmenthour.lbl', model: 'IsEquipmentHour', position: { r: 5, c: 0 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.equipmentdaily.lbl', model: 'IsEquipmentDaily', position: { r: 5, c: 1 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.bedchargehour.lbl', model: 'IsBedChargeHour', position: { r: 6, c: 0 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.bedchargedaily.lbl', model: 'IsBedChargeDaily', position: { r: 6, c: 1 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.isnightcharge.lbl', model: 'IsNightCharge', position: { r: 7, c: 0 } },
                    { type: 'checkbox', translate: 'clinicalmaster.serviceitem-form.candiscountproportionate.lbl', model: 'CanDiscountProportionate', position: { r: 7, c: 1 } },
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
        //Dynamic form  ends
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Code },
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 34, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: $scope.advancedfilter.SubCategoryId },
                    { Key: 8, Value: $scope.advancedfilter.FacilityId },
                    { Key: 9, Value: $scope.advancedfilter.MasterTypeId },
                    { Key: 10, Value: $scope.advancedfilter.SubDepartmentId },
                    { Key: 12, Value: $scope.advancedfilter.MasterName },
                    { Key: 11, Value: $scope.advancedfilter.IsPackage },
                    { Key: 15, Value: $scope.advancedfilter.IsOrderable },
                    { Key: 16, Value: $scope.advancedfilter.IsRateEditable },
                    { Key: 17, Value: $scope.advancedfilter.IsZeroBill },
                    { Key: 18, Value: $scope.advancedfilter.IsSurgicalProcedure },
                    { Key: 19, Value: $scope.advancedfilter.IsEquipmentHour },
                    { Key: 20, Value: $scope.advancedfilter.IsEquipmentDaily },
                    { Key: 21, Value: $scope.advancedfilter.IsBedChargeHour },
                    { Key: 22, Value: $scope.advancedfilter.IsBedChargeDaily },
                    { Key: 23, Value: $scope.advancedfilter.IsNightCharge },
                    { Key: 24, Value: $scope.advancedfilter.CanDiscountProportionate },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/serviceitem/GetServiceItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.exportServiceItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        }

        $scope.exportServiceItem = function () {
            if (!(vm.gridConfig.data)) {
                utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            }
            else {
                if (vm.gridConfig.data) {
                    var actionName = 'SystemSettings/MasterExport/MasterExportXL';
                    var options = {
                        action: actionName,
                        data: {
                            Data: {
                                'targetcontext': 'ServiceItemMaster',
                                'Code': $scope.currentfilter.Code,
                                'DepartmentId': $scope.currentfilter.DepartmentId,
                                'CategoryId': $scope.currentfilter.CategoryId,
                                'ActiveStatus': $scope.currentfilter.ActiveStatusId,
                                'SubCategoryId': $scope.advancedfilter.SubCategoryId,
                                'FacilityId': $scope.advancedfilter.FacilityId,
                                'MasterTypeId': $scope.advancedfilter.MasterTypeId,
                                'SubDepartmentId': $scope.advancedfilter.SubDepartmentId,
                                'IsPackage': $scope.advancedfilter.IsPackage,
                                'MasterName': $scope.advancedfilter.MasterName,
                            }
                        },
                        type: 'post',
                        onComplete: $scope.exportServiceItemCallback
                    };

                    utl.Http.doAction(options);
                }
            }
        }

        $scope.uploadServiceItem = function () {
            utl.Alert.showSuccessMsg('please wait....');
        }


        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.serviceitemtab.details', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/serviceitem/DeleteServiceItem',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.serviceitemtab.details', { id: entity.Id, TestmasterId: entity.MasterItemId, ServiceName: entity.ItemCode + ' - ' + entity.Name });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ItemCode", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemcode.lbl') },
                { field: "Name", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemname.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.description.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.serviceitem-list.department.lbl') },
                { field: "ParentCategory.ServiceCategoryName", displayName: $translate.instant('clinicalmaster.serviceitem-list.category.lbl') },
                // { field: "SubCategory.ServiceCategoryName", displayName: $translate.instant('clinicalmaster.serviceitem-list.subcategory.lbl') },
                // { field: "Facility.FacilityName", displayName: $translate.instant('clinicalmaster.serviceitem-list.facility.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.status.lbl') },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                //     ]
                // }
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{ actiontype: 'edit', display: 'common.editaction.lbl' }]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "SubDepartment" },
                { "Key": "ActiveStatus" },
                { "Key": "ServiceSubCategory" },
                { "Key": "ServiceCategory" },
                { "Key": "ServiceGroup" },
                { "Key": "MasterType" },
                { "Key": "Facility" }
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

    serviceItemListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();