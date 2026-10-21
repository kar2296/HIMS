(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AntibioticListController', AntibioticListController);

    function AntibioticListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2,
            AnbioticTypeId: -1,
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
                    { Key: 3, Value: $scope.currentfilter.AnbioticTypeId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: $scope.pagerObj.pageSize,
                    PageNumber: $scope.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/AntibioticMaster/GetAntibioticMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.antibiotic-form', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.addNew = function () {
            $scope.openModal(0);
        };

        $scope.backToForm = function () {
            $state.go('app.analyzertestmaster');
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/AntibioticMaster/DeleteAntibioticMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit' || actionType == 'view') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AntibioticName || entity.ProviderName);
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
                            if (payload.AnbioticTypeId !== undefined) $scope.currentfilter.AnbioticTypeId = payload.AnbioticTypeId;
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
                            $scope.openModal(payload.Id);
                        }
                        break;
                    case 'delete':
                        if (payload && payload.Id !== undefined) {
                            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, payload.Id, payload.AntibioticName);
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
                { "Key": "ActiveStatus" },
                { "Key": "AntibioticType" }
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

    AntibioticListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();