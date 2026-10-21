(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryorderListController', surgeryorderListController);

    function surgeryorderListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ProcedureCodeSchemeId: -1,
            Code: "",
            ProcedureName: "",
            ProcedureTypeId: -1,
            ActiveStatusId: 2
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: vm.gridConfig.pagerObj ? vm.gridConfig.pagerObj.totalItems : 0,
                currentPage: vm.gridConfig.pagerObj ? vm.gridConfig.pagerObj.currentPage : 1,
                pageSize: vm.gridConfig.pagerObj ? vm.gridConfig.pagerObj.pageSize : 25,
                pagerObj: vm.gridConfig.pagerObj,
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup || {},
                isLoading: false
            };
            $scope.$evalAsync();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data || [];
            vm.gridConfig.pagerObj.totalItems = res.PageContext ? res.PageContext.TotalRecords : 0;
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.ProcedureName || ""
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ProcedureCodeSchemeId !== undefined ? $scope.currentfilter.ProcedureCodeSchemeId : -1
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.Code || ""
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ProcedureTypeId !== undefined ? $scope.currentfilter.ProcedureTypeId : -1
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId !== undefined ? $scope.currentfilter.ActiveStatusId : 2
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/procedure/GetProcedures',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Grid Actions
        $scope.addNew = function () {
            utl.Modal.openFixedDialog('app.surgeryorder-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.openFixedDialog('app.surgeryorder-form', {
                    params: {
                        id: entity.Id,
                        IsProfile: entity.IsProfile,
                        ProcedureName: entity.ProcedureName
                    },
                    confirmCallback: $scope.initLookup
                });
            }
        };

        // React Bridge Action Dispatcher
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                if (payload) {
                    $scope.currentfilter.Code = payload.code || '';
                    $scope.currentfilter.ProcedureName = '';
                    if (payload.procedureTypeId !== undefined) $scope.currentfilter.ProcedureTypeId = payload.procedureTypeId;
                    if (payload.activeStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.activeStatusId;
                }
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter = {
                    ProcedureCodeSchemeId: -1,
                    Code: "",
                    ProcedureName: "",
                    ProcedureTypeId: -1,
                    ActiveStatusId: 2
                };
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                if (payload && payload.page) vm.gridConfig.pagerObj.currentPage = payload.page;
                if (payload && payload.pageSize) vm.gridConfig.pagerObj.pageSize = payload.pageSize;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload.entity || payload);
            } else if (actionName === 'refresh') {
                $scope.getList();
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName](payload);
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "ProcedureName",
                    displayName: $translate.instant('billingmaster.procedureservice-list.procedurename.lbl')
                },
                {
                    field: "Code",
                    displayName: $translate.instant('surgeryorder.code.lbl')
                },
                {
                    field: "ProcedureType.Description",
                    displayName: $translate.instant('surgeryorder.type.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('billingmaster.procedureservice-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                       </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                        actiontype: 'edit',
                        display: 'common.editaction.lbl'
                    }]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
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
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ProcedureCodeScheme" },
                { "Key": "ProcedureCategory" },
                { "Key": "ActiveStatus" },
                { "Key": "Department" },
                { "Key": "ProcedureType" }
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

    surgeryorderListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();