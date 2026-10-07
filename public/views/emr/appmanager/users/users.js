(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('userListController', userListController);

    function userListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.lookup = {
            UserType: [],
            Department: [],
            Group: [],
            ActiveStatus: [],
            Facility: [],
            Organization: [],
            Speciality: [],
            clinicalrole: [],
            DoctorShareClass: [],
            Gender: []
        };

        $scope.currentfilter = {
            username: '',
            facilityid: utl.Session.getCurrentFacilityId(),
            usertypeid: -1,
            DepartmentId: -1,
            groupid: -1,
            ActiveStatusId: 2
        };

        $scope.advancedfilter = {
            OrgId: -1,
            DepartmentId: -1,
            SpecialityId: -1,
            ClinicalRoleId: -1,
            Mobile: '',
            PincodeId: -1,
            CountryId: -1,
            StateId: -1,
            CityId: -1,
            Area: '',
            DoctorShareClassId: -1,
            GenderId: -1
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
            },
            data: []
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                totalItems: vm.gridConfig.pagerObj.totalItems || 0,
                pageSize: vm.gridConfig.pagerObj.pageSize || 25,
                currentPage: vm.gridConfig.pagerObj.currentPage || 1,
                lookup: $scope.lookup || {},
                currentfilter: $scope.currentfilter || {},
                advancedfilter: $scope.advancedfilter || {}
            };
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (!hasError && res) {
                vm.gridConfig.data = res.Data || [];
                vm.gridConfig.pagerObj.totalItems = res.PageContext ? res.PageContext.TotalRecords : (res.Data ? res.Data.length : 0);
            } else {
                vm.gridConfig.data = [];
                vm.gridConfig.pagerObj.totalItems = 0;
            }
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.username },
                    { Key: 2, Value: $scope.currentfilter.facilityid },
                    { Key: 3, Value: $scope.currentfilter.usertypeid },
                    { Key: 4, Value: $scope.currentfilter.groupid },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 32, Value: 8 }, // Not a Patient
                    { Key: 6, Value: $scope.advancedfilter.OrgId },
                    { Key: 7, Value: $scope.currentfilter.DepartmentId },
                    { Key: 8, Value: $scope.advancedfilter.SpecialityId },
                    { Key: 9, Value: $scope.advancedfilter.ClinicalRoleId },
                    { Key: 10, Value: $scope.advancedfilter.PincodeId },
                    { Key: 11, Value: $scope.advancedfilter.CountryId },
                    { Key: 12, Value: $scope.advancedfilter.StateId },
                    { Key: 13, Value: $scope.advancedfilter.CityId },
                    { Key: 14, Value: $scope.advancedfilter.Area },
                    { Key: 15, Value: $scope.advancedfilter.DoctorShareClassId },
                    { Key: 16, Value: $scope.advancedfilter.Mobile },
                    { Key: 17, Value: $scope.advancedfilter.GenderId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Actions
        $scope.addNew = function () {
            $state.go('app.usertab.general', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl') || 'User deleted successfully');
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/user/DeleteUser',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit' || actionType === 'view') {
                $state.go('app.usertab.general', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    UserName: entity.UserName
                });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.UserName);
            }
        };

        // React bridge action dispatcher
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'handleEvents' && payload) {
                $scope.handleEvents(payload.actionType, payload.entity);
            } else if (actionName === 'getList' || actionName === 'filterChange') {
                if (payload) {
                    if (payload.page) vm.gridConfig.pagerObj.currentPage = payload.page;
                    if (payload.pageSize) vm.gridConfig.pagerObj.pageSize = payload.pageSize;
                    if (payload.pageContext) {
                        if (payload.pageContext.currentPage) vm.gridConfig.pagerObj.currentPage = payload.pageContext.currentPage;
                        if (payload.pageContext.pageSize) vm.gridConfig.pagerObj.pageSize = payload.pageContext.pageSize;
                    }
                    if (payload.filters) angular.extend($scope.currentfilter, payload.filters);
                    if (payload.currentfilter) angular.extend($scope.currentfilter, payload.currentfilter);
                    if (payload.advancedfilter) angular.extend($scope.advancedfilter, payload.advancedfilter);
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
                { Key: 'Facility' },
                { Key: 'Organization' },
                { Key: 'Department' },
                { Key: 'Speciality' },
                { Key: 'clinicalrole' },
                { Key: 'DoctorShareClass' },
                { Key: 'UserType' },
                { Key: 'Group' },
                { Key: 'ActiveStatus' },
                { Key: 'Gender' }
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

    userListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();