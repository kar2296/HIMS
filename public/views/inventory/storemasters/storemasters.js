(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storeMastersListController', storeMastersListController);

    function storeMastersListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            StoreCode: '',
            StoreName: '',
            StoreTypeId: -1,
            DepartmentId: -1,
            StoreSubTypeId: -1,
            ActiveStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                From: '',
                To: '',
                ReferralId: -1,
                PinCode: '',
                VisitDate: '',
                Country: '',
                VisitTypeId: -1,
                State: '',
                GuarantorId: -1,
                CityTown: '',
                IsAdmitted: false,
                StorePolicyId: -1,
                Area: ''
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'select', translate: 'inventory.storemaster.storetype.lbl', model: 'StoreTypeId', options: $scope.lookup.StoreType, position: { r: 0, c: 0 } },
                    { type: 'select', translate: 'inventory.storemaster.storepolicy.lbl', model: 'StorePolicyId', options: $scope.lookup.StorePolicy, position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.storemaster.storesubtype.lbl', model: 'StoreSubTypeId', options: $scope.lookup.StoreSubType, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.storemaster.department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 1, c: 1 } }
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
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    //{ Key: 1, Value: $scope.currentfilter.StoreCode },
                    { Key: 1, Value: $scope.currentfilter.storename },
                    { Key: 2, Value: $scope.currentfilter.StoreTypeId },
                    { Key: 3, Value: $scope.currentfilter.StoreSubTypeId },
                    { Key: 5, Value: $scope.currentfilter.DepartmentId },
                    { Key: 6, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/storemaster/GetStoreMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.storemastertab.storemaster', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/storemaster/DeleteStoreMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.storemastertab.storemaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    StoreCode: entity.StoreCode,
                    StoreName: entity.StoreName + '-' + entity.StoreCode,
                    StoreTypeId: entity.StoreTypeId,
                    StoreType: entity.StoreType.Description
                });
            }
            if (actionType == 'view') {
                $state.go('app.storemastertab.storemaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    StoreCode: entity.StoreCode,
                    StoreName: entity.StoreName,
                    StoreTypeId: entity.StoreTypeId,
                    StoreType: entity.StoreType.Description
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.StoreName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "StoreCode", displayName: $translate.instant('inventory.storemasters.code.lbl') },
                { field: "StoreName", displayName: $translate.instant('inventory.storemasters.name.lbl') },
                // { field: "Facility.FacilityName", displayName: $translate.instant('inventory.storemaster.facility.lbl') },
                { field: "StoreType.Description", displayName: $translate.instant('inventory.storemaster.storetype.lbl') },
                // { field: "StoreSubType.Description", displayName: $translate.instant('inventory.storemaster.storesubtype.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('inventory.storemaster.department.lbl') },
                { field: "LicenseNo", displayName: $translate.instant('inventory.storemaster.licenseno.lbl') },
                { field: "TinNo", displayName: $translate.instant('inventory.storemaster.tinno.lbl') },
                { field: "ExpiryWarningDays", displayName: $translate.instant('inventory.storemaster.expirywarningdays.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.storemasters.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    \
                                    </div>', handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "StoreType" },
                { "Key": "StorePolicy" },
                { "Key": "Facility" },
                { "Key": "StoreSubType" },
                { "Key": "StoreType" },
                { "Key": "Department" }
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

    storeMastersListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();