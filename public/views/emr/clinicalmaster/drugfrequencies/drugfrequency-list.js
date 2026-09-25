(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugFrequencyListController', drugFrequencyListController);

    function drugFrequencyListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Name: "",
            FacilityId: utl.Session.getCurrentFacilityId(),
            DrugFrequencyTypeId: -1,
            ActiveStatusId: 2
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
                    { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.DrugFrequencyTypeId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/DrugFrequency/GetDrugFrequencys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.drugfrequencytab.details', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/DrugFrequency/DeleteDrugFrequency',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit') {
                $state.go('app.drugfrequencytab.details', { id: entity.Id });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('clinicalmaster.drugfrequency-list.code.lbl') },
                { field: "Name", displayName: $translate.instant('clinicalmaster.drugfrequency-list.name.lbl') },
                { field: "DrugFrequencyType.Description", displayName: $translate.instant('clinicalmaster.drugfrequency-list.type.lbl') },
                { field: "DrugFrequencySIGCode.Description", displayName: $translate.instant('clinicalmaster.drugfrequency-list.sigcode.lbl') },
                { field: "NoOfTimes", displayName: $translate.instant('clinicalmaster.drugfrequency-list.nooftimes.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.drugfrequency-list.status.lbl') },
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
                { "Key": "Facility" },
                { "Key": "DrugFrequencyType" },
                { "Key": "DrugFrequencySIGCode" },
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
                    Name: $scope.currentfilter.Name,
                    FacilityId: $scope.currentfilter.FacilityId,
                    DrugFrequencyTypeId: $scope.currentfilter.DrugFrequencyTypeId,
                    ActiveStatusId: $scope.currentfilter.ActiveStatusId
                },
                lookup: {
                    Facility: ($scope.lookup && $scope.lookup.Facility) || [],
                    DrugFrequencyType: ($scope.lookup && $scope.lookup.DrugFrequencyType) || [],
                    DrugFrequencySIGCode: ($scope.lookup && $scope.lookup.DrugFrequencySIGCode) || [],
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || []
                }
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.Name = payload && payload.value !== undefined ? payload.value : '';
                $scope.getList();
            } else if (actionName === 'typeFilterChange') {
                $scope.currentfilter.DrugFrequencyTypeId = payload && payload.value;
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

    drugFrequencyListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();