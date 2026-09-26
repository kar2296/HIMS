(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugListController', drugListController);

    function drugListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            DrugName: "",
            DrugTypeId: -1,
            ActiveStatusId: 2,
            GenericId: -1
        };


        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {};

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'checkbox', translate: 'clinicalmaster.drug-list.calculatefrequeny.lbl', model: 'IsCalculateFrequencyQty', position: { r: 0, c: 0 } },

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

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DrugName },
                    { Key: 2, Value: $scope.currentfilter.DrugTypeId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.GenericId },
                    { Key: 7, Value: $scope.advancedfilter.IsCalculateFrequencyQty }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/DrugMaster/GetDrugMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.drugtab.details', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/DrugMaster/DeleteDrugMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.drugtab.details', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DrugName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "DrugType.Description", displayName: $translate.instant('clinicalmaster.drug-list.drugtype.lbl') },
                { field: "DrugCode", displayName: $translate.instant('clinicalmaster.drug-list.drugcode.lbl') },
                { field: "DrugName", displayName: $translate.instant('clinicalmaster.drug-list.drugname.lbl') },
                { field: "", displayName: $translate.instant('clinicalmaster.drug-list.dosage.lbl') },
                { field: "", displayName: $translate.instant('clinicalmaster.drug-list.frequency.lbl') },
                { field: "", displayName: $translate.instant('clinicalmaster.drug-list.duration.lbl') },
             
                // { field: "Description", displayName: $translate.instant('clinicalmaster.drug-list.description.lbl') },
                { field: "GenericMaster.GenericName", displayName: $translate.instant('clinicalmaster.drug-list.generic.lbl') },
                // { field: "IsCalculateFrequencyQty", displayName: $translate.instant('clinicalmaster.drug-list.calculatefrequeny.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.drug-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
       handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.totalItems) || 0,
                currentPage: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.currentPage) || 1,
                pageSize: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.pageSize) || 25,
                pagerObj: vm.gridConfig.pagerObj,
                currentfilter: $scope.currentfilter,
                advancedfilter: $scope.advancedfilter || {},
                lookup: $scope.lookup || {}
            };
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                if (payload) {
                    if (payload.DrugName !== undefined) $scope.currentfilter.DrugName = payload.DrugName;
                    if (payload.DrugTypeId !== undefined) $scope.currentfilter.DrugTypeId = payload.DrugTypeId;
                    if (payload.GenericId !== undefined) $scope.currentfilter.GenericId = payload.GenericId;
                    if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
                    if (payload.IsCalculateFrequencyQty !== undefined) {
                        $scope.advancedfilter = $scope.advancedfilter || {};
                        $scope.advancedfilter.IsCalculateFrequencyQty = payload.IsCalculateFrequencyQty;
                    }
                }
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter.DrugName = '';
                $scope.currentfilter.DrugTypeId = -1;
                $scope.currentfilter.GenericId = -1;
                $scope.currentfilter.ActiveStatusId = 2;
                if ($scope.advancedfilter) $scope.advancedfilter.IsCalculateFrequencyQty = false;
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DrugType" },
                { "Key": "Generic" },
                { "Key": "ActiveStatus" },
                { "Key": "ScheduleType" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    drugListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();