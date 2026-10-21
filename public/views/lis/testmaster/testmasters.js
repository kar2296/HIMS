(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testMastersListController', testMastersListController);

    function testMastersListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            dept: -1,
            subdept: -1,
            type: -1,
            codemnemonicsnamedesc: '',
            ActiveStatusId: 2,
            code: '',
            name: '',
            FacilityId: -1
        };

        $scope.advancedfilter = {
            IsProfile: undefined,
            IsSeparateWorkOrder: undefined,
            IsDirectBill: undefined,
            IsSeparateSampleId: undefined,
            Methodology: ''
        };

        $scope.lookup = {
            Department: [],
            SubDepartment: [],
            Facility: [],
            ActiveStatus: [],
            TESTMASTERTYP: []
        };

        vm.gridConfig = {
            data: [],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.refreshReactProps = function () {
            var dataList = vm.gridConfig.data || [];
            var pager = vm.gridConfig.pagerObj || { totalItems: 0, currentPage: 1, pageSize: 25 };
            $scope.reactProps = {
                items: dataList,
                totalItems: pager.totalItems || dataList.length,
                currentPage: pager.currentPage || 1,
                pageSize: pager.pageSize || 25,
                currentfilter: angular.copy($scope.currentfilter),
                advancedfilter: angular.copy($scope.advancedfilter),
                lookup: angular.copy($scope.lookup || {}),
                facilityName: (utl.Session && utl.Session.getCurrentFacilityName) ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL'
            };
            $scope.$applyAsync();
        };

        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (!hasError && res) {
                vm.gridConfig.data = res.Data || [];
                vm.gridConfig.pagerObj.totalItems = res.PageContext ? res.PageContext.TotalRecords : (res.Data ? res.Data.length : 0);
            }
            $scope.refreshReactProps();
        };

        $scope.getList = function (pageNo) {
            if (pageNo) {
                vm.gridConfig.pagerObj.currentPage = pageNo;
            }

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.codemnemonicsnamedesc },
                    { Key: 3, Value: $scope.currentfilter.type },
                    { Key: 4, Value: $scope.currentfilter.dept },
                    { Key: 5, Value: $scope.currentfilter.subdept },
                    { Key: 15, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 2, Value: $scope.advancedfilter.IsProfile },
                    { Key: 10, Value: $scope.advancedfilter.IsSeparateWorkOrder },
                    { Key: 11, Value: $scope.advancedfilter.IsDirectBill },
                    { Key: 12, Value: $scope.advancedfilter.IsSeparateSampleId },
                    { Key: 13, Value: $scope.advancedfilter.Methodology }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/testmaster/GetTestmasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Grid Actions
        $scope.addNew = function () {
            $state.go('app.testmastertab.testmaster', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl') || 'Deleted successfully');
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/testmaster/DeleteTestmaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit') {
                $state.go('app.testmastertab.testmaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    TestName: entity.Code + ' - ' + entity.Name,
                    TestCode: entity.Code
                });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        };

        // React bridge handler
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'backtoList') {
                $scope.backtoList();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (actionName === 'search') {
                if (payload) {
                    if (payload.codemnemonicsnamedesc !== undefined) $scope.currentfilter.codemnemonicsnamedesc = payload.codemnemonicsnamedesc;
                    if (payload.dept !== undefined) $scope.currentfilter.dept = payload.dept;
                    if (payload.subdept !== undefined) $scope.currentfilter.subdept = payload.subdept;
                    if (payload.FacilityId !== undefined) $scope.currentfilter.FacilityId = payload.FacilityId;
                    if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
                    if (payload.IsProfile !== undefined) $scope.advancedfilter.IsProfile = payload.IsProfile ? true : undefined;
                    if (payload.IsSeparateWorkOrder !== undefined) $scope.advancedfilter.IsSeparateWorkOrder = payload.IsSeparateWorkOrder ? true : undefined;
                    if (payload.IsDirectBill !== undefined) $scope.advancedfilter.IsDirectBill = payload.IsDirectBill ? true : undefined;
                    if (payload.IsSeparateSampleId !== undefined) $scope.advancedfilter.IsSeparateSampleId = payload.IsSeparateSampleId ? true : undefined;
                    if (payload.Methodology !== undefined) $scope.advancedfilter.Methodology = payload.Methodology || '';
                }
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter.codemnemonicsnamedesc = '';
                $scope.currentfilter.dept = -1;
                $scope.currentfilter.subdept = -1;
                $scope.currentfilter.FacilityId = -1;
                $scope.currentfilter.ActiveStatusId = 2;
                $scope.advancedfilter.IsProfile = undefined;
                $scope.advancedfilter.IsSeparateWorkOrder = undefined;
                $scope.advancedfilter.IsDirectBill = undefined;
                $scope.advancedfilter.IsSeparateSampleId = undefined;
                $scope.advancedfilter.Methodology = '';
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                var p = (payload && payload.page) ? payload.page : 1;
                vm.gridConfig.pagerObj.currentPage = p;
                $scope.getList(p);
            }
            $scope.refreshReactProps();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Organization" },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "TESTMASTERTYP" },
                { "Key": "Department" },
                { "Key": "SubDepartment" },
                { "Key": "LOCATION" },
                {
                    "Key": "SampleMaster",
                    Request: {
                        Params: [{ Key: 3, Value: 2 }]
                    }
                },
                { "Key": "SAMPLEVOLUME" },
                { "Key": "TATGROUP" },
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

        $scope.initLookup();
        $scope.refreshReactProps();
    }

    testMastersListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();