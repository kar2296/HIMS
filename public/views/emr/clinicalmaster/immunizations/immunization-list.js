(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('immunizationListController', immunizationListController);

    function immunizationListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ImmunizationName: "",
            ImmunizationFrequencyId: -1,
            ActiveStatusId: 2,
            ConditionId: -1
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
                    { Key: 1, Value: $scope.currentfilter.ImmunizationName },
                    { Key: 4, Value: $scope.currentfilter.ConditionId },
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 3, Value: $scope.currentfilter.ImmunizationFrequencyId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/Immunization/GetImmunizations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.immunizations', {
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
                action: 'clinicalmaster/Immunization/DeleteImmunization',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ImmunizationName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ImmunizationName", displayName: $translate.instant('clinicalmaster.immunization-list.immunizationname.lbl') },
                { field: "Frequency.Description", displayName: $translate.instant('clinicalmaster.immunization-list.frequency.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.immunization-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' }
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
                { "Key": "ActiveStatus" },
                { "Key": "Condition" },
                { "Key": "Frequency" }
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
                    ImmunizationName: $scope.currentfilter.ImmunizationName,
                    ImmunizationFrequencyId: $scope.currentfilter.ImmunizationFrequencyId,
                    ConditionId: $scope.currentfilter.ConditionId,
                    ActiveStatusId: $scope.currentfilter.ActiveStatusId
                },
                lookup: {
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || [],
                    Condition: ($scope.lookup && $scope.lookup.Condition) || [],
                    Frequency: ($scope.lookup && $scope.lookup.Frequency) || []
                }
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.ImmunizationName = payload && payload.value !== undefined ? payload.value : '';
                $scope.getList();
            } else if (actionName === 'frequencyFilterChange') {
                $scope.currentfilter.ImmunizationFrequencyId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'conditionFilterChange') {
                $scope.currentfilter.ConditionId = payload && payload.value;
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

    immunizationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();