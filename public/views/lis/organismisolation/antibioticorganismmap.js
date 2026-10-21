(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AntibioticOrganismMapController', AntibioticOrganismMapController);

    function AntibioticOrganismMapController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.item = {};
        var organismId = parseInt($stateParams.id || 0);

        $scope.pagerObj = { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 };

        $scope.reactProps = {
            organismId: organismId,
            items: [],
            totalItems: 0,
            currentPage: 1,
            pageSize: 25
        };

        $scope.syncReactProps = function () {
            $scope.reactProps = {
                organismId: organismId,
                items: $scope.Items,
                totalItems: $scope.pagerObj.totalItems,
                currentPage: $scope.pagerObj.currentPage,
                pageSize: $scope.pagerObj.pageSize
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
            var inputData = {
                Params: [
                    { Key: 2, Value: organismId }
                ],
                PageContext: {
                    PageSize: $scope.pagerObj.pageSize,
                    PageNumber: $scope.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/AntibioticMaster/GetAntibioticOrganismMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/AntibioticOrganismMap/DeleteAntibioticOrganismMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item = {};
            $scope.getList();
        };

        $scope.saveItem = function (savePayload) {
            var toSave = savePayload || $scope.item;
            if (!toSave.AntibioticMasterId) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Any Antibiotics'));
                return;
            }

            toSave.OrganismMapId = organismId;
            var actionName = 'lis/AntibioticMaster/AddAntibioticOrganismMap';
            if (toSave.Id && toSave.Id > 0) {
                actionName = 'lis/AntibioticMaster/UpdateAntibioticOrganismMap';
            }

            var options = {
                action: actionName,
                data: { Data: toSave },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        // React bridge
        $scope.handleAction = function (actionName, payload) {
            $scope.$evalAsync(function () {
                switch (actionName) {
                    case 'pageChange':
                        if (payload && payload.page) {
                            $scope.pagerObj.currentPage = payload.page;
                            $scope.getList();
                        }
                        break;
                    case 'saveItem':
                        $scope.saveItem(payload);
                        break;
                    case 'delete':
                        if (payload && payload.Id !== undefined) {
                            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, payload.Id, payload.AntibioticMaster?.AntibioticName || payload.AntibioticName);
                        }
                        break;
                }
            });
        };

        $scope.getList();
    }

    AntibioticOrganismMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();