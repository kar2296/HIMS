(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyteMasterListController', analyteMasterListController);

    function analyteMasterListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: '',
            codemnemonicsnamedesc: '',
            code: '',
            ActiveStatusId: 2,
            type: -1,
            vtype: -1,
            mnemonics: '',
            FacilityId: (utl.Session && utl.Session.getCurrentFacilityId) ? utl.Session.getCurrentFacilityId() : 1
        };

        $scope.lookup = {
            ANALYTETYPE: [],
            ANALYTEUOM: [],
            ANALYTEVALUETYPE: [],
            ActiveStatus: [],
            Facility: []
        };

        vm.gridConfig = {
            data: [],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
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
                    { Key: 2, Value: $scope.currentfilter.type },
                    { Key: 3, Value: $scope.currentfilter.vtype },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 5, Value: $scope.currentfilter.FacilityId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/analytemaster/GetAnalytemasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Grid Actions
        $scope.addNew = function () {
            $state.go('app.analytetab.analytemaster', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl') || 'Deleted successfully');
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/analytemaster/DeleteAnalytemaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit') {
                $state.go('app.analytetab.analytemaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    AnalyteName: entity.Code + ' - ' + entity.Name
                });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            } else if (actionType === 'view') {
                $state.go('app.analytetab.analytemaster', {
                    id: entity.Id
                });
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
                    if (payload.type !== undefined) $scope.currentfilter.type = payload.type;
                    if (payload.vtype !== undefined) $scope.currentfilter.vtype = payload.vtype;
                    if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
                    if (payload.FacilityId !== undefined) $scope.currentfilter.FacilityId = payload.FacilityId;
                }
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter.codemnemonicsnamedesc = '';
                $scope.currentfilter.type = -1;
                $scope.currentfilter.vtype = -1;
                $scope.currentfilter.ActiveStatusId = 2;
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
                { "Key": "ANALYTETYPE" },
                { "Key": "ANALYTEUOM" },
                { "Key": "ANALYTEVALUETYPE" },
                {
                    "Key": "SampleMaster",
                    Request: {
                        Params: [{ Key: 3, Value: 2 }]
                    }
                },
                { "Key": "GRAPHTYPE" },
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

    analyteMasterListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();