(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrganismIsolatedListController', OrganismIsolatedListController);

    function OrganismIsolatedListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2,
            codemnemonicsnamedesc: '',
            Code: '',
            MnemonicName: ''
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id || 0);

        $scope.pagerObj = { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 };

        $scope.reactProps = {
            items: [],
            totalItems: 0,
            currentPage: 1,
            pageSize: 25,
            currentfilter: $scope.currentfilter,
            lookup: {}
        };

        $scope.syncReactProps = function () {
            $scope.reactProps = {
                items: $scope.Items,
                totalItems: $scope.pagerObj.totalItems,
                currentPage: $scope.pagerObj.currentPage,
                pageSize: $scope.pagerObj.pageSize,
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup
            };
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Items = res.Data || [];
            $scope.pagerObj.totalItems = res.PageContext ? res.PageContext.TotalRecords : (res.Data ? res.Data.length : 0);
            if (vm.gridConfig) {
                vm.gridConfig.data = res.Data;
                vm.gridConfig.pagerObj.totalItems = $scope.pagerObj.totalItems;
            }
            $scope.syncReactProps();
        };

        $scope.getList = function () {
            var searchVal = $scope.currentfilter.codemnemonicsnamedesc || $scope.currentfilter.Code || '';
            var inputData = {
                Params: [
                    { Key: 1, Value: searchVal },
                    { Key: 2, Value: searchVal },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: $scope.pagerObj.pageSize,
                    PageNumber: $scope.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/OrgIsolation/GetOrgIsolations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.orgisolted-form', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        // Grid Actions
        $scope.addNew = function () {
            $state.go('app.organismtab.orgisolted-form', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/OrgIsolation/DeleteOrgIsolation',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.organismtab.orgisolted-form', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.OrgIsolationName || entity.ProviderName);
            }
        };

        // React component action bridge
        $scope.handleAction = function (actionName, payload) {
            $scope.$evalAsync(function () {
                switch (actionName) {
                    case 'search':
                        if (payload) {
                            $scope.currentfilter.codemnemonicsnamedesc = payload.codemnemonicsnamedesc || payload.Code || '';
                            $scope.currentfilter.Code = payload.Code || '';
                            $scope.currentfilter.MnemonicName = payload.MnemonicName || '';
                        }
                        $scope.pagerObj.currentPage = 1;
                        $scope.getList();
                        break;
                    case 'filterChange':
                        if (payload) {
                            if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
                            if (payload.codemnemonicsnamedesc !== undefined) $scope.currentfilter.codemnemonicsnamedesc = payload.codemnemonicsnamedesc;
                        }
                        $scope.pagerObj.currentPage = 1;
                        $scope.getList();
                        break;
                    case 'pageChange':
                        if (payload && payload.page) {
                            $scope.pagerObj.currentPage = payload.page;
                            $scope.getList();
                        }
                        break;
                    case 'addNew':
                        $scope.addNew();
                        break;
                    case 'view':
                    case 'edit':
                        if (payload && payload.Id !== undefined) {
                            $state.go('app.organismtab.orgisolted-form', { id: payload.Id });
                        }
                        break;
                    case 'delete':
                        if (payload && payload.Id !== undefined) {
                            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, payload.Id, payload.OrgIsolationName);
                        }
                        break;
                }
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.syncReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
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
    }

    OrganismIsolatedListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();