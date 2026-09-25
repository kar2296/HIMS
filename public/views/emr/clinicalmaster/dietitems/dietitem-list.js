(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietitemListController', dietitemListController);

    function dietitemListController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DietCategoryId: -1,
            DietItemTypeId: -1,
            ActiveStatusId: 2,
            DietItemCode: ''
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DietItemTypeId },
                    { Key: 2, Value: $scope.currentfilter.DietCategoryId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.DietItemCode }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/DietItemMaster/GetDietItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.dietitem', {
                params: { id: Id },
                confirmCallback: function () {
                    $scope.initLookup();
                }
            });
        };

        //Grid Actions
        $scope.addNew = function () {
            $scope.openModal(0);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/DietItemMaster/DeleteDietItemMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DietName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "DietItemCode", displayName: $translate.instant('clinicalmaster.diet-list.displayid.lbl') },
                { field: "DietName", displayName: $translate.instant('clinicalmaster.diet-list.allergyname.lbl') },
                { field: "DietItemType.Description", displayName: $translate.instant('clinicalmaster.diet-list.type.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.diet-list.description.lbl') },
                { field: "DietCategory.Description", displayName: $translate.instant('clinicalmaster.diet-list.filter_category.lbl') },
                { field: "DietFrequency.Description", displayName: $translate.instant('clinicalmaster.diet-list.frequency.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.diet-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                             </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DietItemType" },
                { "Key": "DietCategory" },
                { "Key": "DietFrequency" },
                { "Key": "ActiveStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.totalItems) || 0,
                currentPage: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.currentPage) || 1,
                pageSize: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.pageSize) || 25,
                filters: {
                    DietItemCode: $scope.currentfilter.DietItemCode,
                    DietItemTypeId: $scope.currentfilter.DietItemTypeId,
                    DietCategoryId: $scope.currentfilter.DietCategoryId,
                    ActiveStatusId: $scope.currentfilter.ActiveStatusId
                },
                lookup: {
                    DietItemType: ($scope.lookup && $scope.lookup.DietItemType) || [],
                    DietCategory: ($scope.lookup && $scope.lookup.DietCategory) || [],
                    DietFrequency: ($scope.lookup && $scope.lookup.DietFrequency) || [],
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || []
                }
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.DietItemCode = payload && payload.value !== undefined ? payload.value : '';
                $scope.getList();
            } else if (actionName === 'typeFilterChange') {
                $scope.currentfilter.DietItemTypeId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'categoryFilterChange') {
                $scope.currentfilter.DietCategoryId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'statusFilterChange') {
                $scope.currentfilter.ActiveStatusId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (actionName === 'refresh') {
                $scope.getList();
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    dietitemListController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl'];

})();