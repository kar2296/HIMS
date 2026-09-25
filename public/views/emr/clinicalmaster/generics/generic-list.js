(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('genericListController', genericListController);

    function genericListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            GenericName: "",
            AllergenTypeId: -1,
            ActiveStatusId: 2,
            ScheduleTypeId: -1,
            IsPrescribed: null
        };
        $scope.advancedfilter = {
            ScheduleTypeId: -1,
            IsPrescribed: null
        };

        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
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
                    { Key: 1, Value: $scope.currentfilter.GenericName },
                    { Key: 2, Value: $scope.currentfilter.AllergenTypeId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.ScheduleTypeId !== -1 ? $scope.currentfilter.ScheduleTypeId : $scope.advancedfilter.ScheduleTypeId },
                    { Key: 5, Value: $scope.currentfilter.IsPrescribed !== null ? $scope.currentfilter.IsPrescribed : $scope.advancedfilter.IsPrescribed }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/GenericMaster/GetGenericMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.generics', {
                params: { id: Id },
                confirmCallback: function () {
                    $scope.initLookup();
                }
            });
        };

        $scope.addNew = function () {
            $scope.openModal(0);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/GenericMaster/DeleteGenericMaster',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GenericName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('clinicalmaster.generic-list.code.lbl') },
                { field: "GenericName", displayName: $translate.instant('clinicalmaster.generic-list.name.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.generic-list.description.lbl') },
                { field: "ScheduleType.Description", displayName: $translate.instant('clinicalmaster.generic-list.scheduletype.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.generic-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
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
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AllergenType" },
                { "Key": "ActiveStatus" },
                { "Key": "ScheduleType" }
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
                    GenericName: $scope.currentfilter.GenericName,
                    AllergenTypeId: $scope.currentfilter.AllergenTypeId,
                    ActiveStatusId: $scope.currentfilter.ActiveStatusId,
                    ScheduleTypeId: $scope.currentfilter.ScheduleTypeId,
                    IsPrescribed: $scope.currentfilter.IsPrescribed
                },
                lookup: {
                    AllergenType: ($scope.lookup && $scope.lookup.AllergenType) || [],
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || [],
                    ScheduleType: ($scope.lookup && $scope.lookup.ScheduleType) || []
                }
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.GenericName = payload && payload.value !== undefined ? payload.value : '';
                $scope.getList();
            } else if (actionName === 'scheduleTypeFilterChange') {
                $scope.currentfilter.ScheduleTypeId = payload && payload.value;
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

    genericListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();