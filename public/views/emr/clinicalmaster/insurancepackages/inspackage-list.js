(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('NewpackageListController', NewpackageListController);

    function NewpackageListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            ActiveStatusId: 2,
            IPPackageCode: ''
        };

        $scope.advancedfilter = {
            From: '',
            To: '',
            ApprovedBy: utl.Session.getCurrentUserId()
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = (res && res.Data) || [];
            vm.gridConfig.pagerObj.totalItems = (res && res.PageContext) ? res.PageContext.TotalRecords : 0;
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.IPPackageCode },
                    { Key: 8, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/IPPackage/GetTariffIPPackages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.multitariffpackage', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/IPPackage/DeleteIPPackage',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.multitariffpackage', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.IPPackageName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "IPPackageCode", displayName: $translate.instant('clinicalmaster.package-list.code.lbl') },
                { field: "IPPackageName", displayName: $translate.instant('clinicalmaster.package-list.packagename.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.package-list.department.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.package-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><i class="fa fa-trash " aria-hidden="true"></i></span>\
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
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: vm.gridConfig.pagerObj.totalItems || 0,
                currentPage: vm.gridConfig.pagerObj.currentPage || 1,
                pageSize: vm.gridConfig.pagerObj.pageSize || 25,
                pagerObj: {
                    totalItems: vm.gridConfig.pagerObj.totalItems || 0,
                    currentPage: vm.gridConfig.pagerObj.currentPage || 1,
                    pageSize: vm.gridConfig.pagerObj.pageSize || 25,
                    startIndex: (vm.gridConfig.pagerObj.currentPage - 1) * vm.gridConfig.pagerObj.pageSize
                },
                currentfilter: angular.copy($scope.currentfilter),
                lookup: angular.copy($scope.lookup || {})
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                if (payload) {
                    if (payload.IPPackageCode !== undefined) $scope.currentfilter.IPPackageCode = payload.IPPackageCode;
                    if (payload.DepartmentId !== undefined) $scope.currentfilter.DepartmentId = payload.DepartmentId;
                    if (payload.FacilityId !== undefined) $scope.currentfilter.FacilityId = payload.FacilityId;
                    if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
                }
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter.IPPackageCode = '';
                $scope.currentfilter.DepartmentId = -1;
                $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();
                $scope.currentfilter.ActiveStatusId = 2;
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit' || actionName === 'view') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName](payload);
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "ActiveStatus" },
                { "Key": "Facility" }
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

    NewpackageListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();