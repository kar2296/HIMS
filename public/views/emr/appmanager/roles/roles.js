(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleListController', roleListController);

    function roleListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.lookup = {
            ActiveStatus: [],
            Facility: []
        };
        $scope.currentfilter = {
            CodeName: '',
            rolename: '',
            rolecode: '',
            FacilityId: -1,
            ActiveStatusId: 2
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            data: [],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: vm.gridConfig.pagerObj.totalItems,
                pageSize: vm.gridConfig.pagerObj.pageSize,
                currentPage: vm.gridConfig.pagerObj.currentPage,
                lookup: $scope.lookup,
                currentfilter: $scope.currentfilter
            };
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (!hasError && res) {
                vm.gridConfig.data = res.Data || [];
                vm.gridConfig.pagerObj.totalItems = (res.PageContext && res.PageContext.TotalRecords !== undefined)
                    ? res.PageContext.TotalRecords
                    : (res.Data ? res.Data.length : 0);
            } else {
                vm.gridConfig.data = [];
                vm.gridConfig.pagerObj.totalItems = 0;
            }
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.CodeName || ''
                    },
                    {
                        Key: 4,
                        Value: ($scope.currentfilter.FacilityId && $scope.currentfilter.FacilityId > 0) ? $scope.currentfilter.FacilityId : null
                    },
                    {
                        Key: 3,
                        Value: ($scope.currentfilter.ActiveStatusId && $scope.currentfilter.ActiveStatusId > 0) ? $scope.currentfilter.ActiveStatusId : null
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/role/GetRoles',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Grid Actions
        $scope.addNew = function () {
            $state.go('app.roletab.general', {
                id: 0
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/role/DeleteRole',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit') {
                $state.go('app.roletab.general', {
                    id: entity.Id,
                    code: entity.RoleCode
                });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RoleName);
            } else if (actionType === 'rolecontrolmap') {
                utl.Modal.open('app.rolecontrolmap', {
                    params: {
                        id: entity.Id,
                        role: entity.RoleName
                    },
                    confirmCallback: $scope.getList
                });
            }
        };

        $scope.handleReactAction = function (actionName, payload) {
            $timeout(function () {
                if (actionName === 'addNew') {
                    $scope.addNew();
                } else if (actionName === 'edit') {
                    $scope.handleEvents('edit', payload);
                } else if (actionName === 'delete') {
                    $scope.onDeleteConfirmed(payload.Id);
                } else if (actionName === 'rolecontrolmap') {
                    $scope.handleEvents('rolecontrolmap', payload);
                } else if (actionName === 'filterChange') {
                    if (payload && payload.currentfilter) {
                        angular.extend($scope.currentfilter, payload.currentfilter);
                    }
                    if (payload && payload.pageContext) {
                        vm.gridConfig.pagerObj.currentPage = payload.pageContext.currentPage || 1;
                        vm.gridConfig.pagerObj.pageSize = payload.pageContext.pageSize || 25;
                    }
                    $scope.getList();
                }
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    Key: 'ActiveStatus'
                },
                {
                    Key: 'Facility',
                    Request: {
                        Params: [{ Key: 12, Value: utl.Session.getCurrentOrgId() }]
                    }
                }
            ];
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

    roleListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();