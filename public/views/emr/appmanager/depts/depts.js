(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('deptListController', deptListController);

    function deptListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.lookup = {
            DepartmentType: [],
            ActiveStatus: [],
            Speciality: [],
            CostCenter: [],
            Facility: [],
            Department: []
        };

        $scope.currentfilter = {
            CodeName: '',
            DepartmentName: '',
            departmentcode: '',
            departmenttypeid: -1,
            ActiveStatusId: 2,
            FacilityId: -1,
            ParentDepartmentId: -1
        };

        $scope.advancedfilter = {
            SpecialityId: -1,
            PhoneNo: '',
            IsEmergency: '',
            IsAdmittingDept: '',
            IncludeMRDRequired: '',
            IsPatientFlowMandatory: '',
            CostCenterId: -1,
            ParentDepartmentId: -1
        };

        $timeout(function () {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }, 100);

        vm.gridConfig = {
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
                vm.gridConfig.pagerObj.totalItems = res.PageContext ? res.PageContext.TotalRecords : (res.Data ? res.Data.length : 0);
            }
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.CodeName },
                    { Key: 2, Value: $scope.currentfilter.departmentcode },
                    { Key: 3, Value: $scope.currentfilter.departmenttypeid },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 6, Value: $scope.advancedfilter.SpecialityId },
                    { Key: 7, Value: $scope.advancedfilter.PhoneNo },
                    { Key: 12, Value: $scope.advancedfilter.CostCenterId },
                    { Key: 6, Value: $scope.currentfilter.ParentDepartmentId },
                    { Key: 14, Value: $scope.currentfilter.FacilityId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/department/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Grid Actions
        $scope.addNew = function () {
            $state.go('app.dept', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl') || 'Deleted successfully');
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/department/DeleteDepartment',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit' || actionType === 'view') {
                $state.go('app.dept', { id: entity.Id });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DepartmentName);
            }
        };

        // React bridge handler
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'handleEvents' && payload) {
                $scope.handleEvents(payload.actionType, payload.entity);
            } else if (actionName === 'getList') {
                if (payload) {
                    if (payload.page) vm.gridConfig.pagerObj.currentPage = payload.page;
                    if (payload.pageSize) vm.gridConfig.pagerObj.pageSize = payload.pageSize;
                    if (payload.filters) angular.extend($scope.currentfilter, payload.filters);
                }
                $scope.getList();
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { Key: 'DepartmentType' },
                { Key: 'ActiveStatus' },
                { Key: 'Speciality' },
                { Key: 'CostCenter' },
                {
                    Key: 'Facility',
                    Request: {
                        Params: [{ Key: 12, Value: utl.Session.getCurrentOrgId() }]
                    }
                },
                {
                    Key: 'Department',
                    Request: {
                        Params: [{ Key: 4, Value: true }]
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
        $scope.refreshReactProps();
    }

    deptListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();