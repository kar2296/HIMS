(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalItemMasterListController', OpticalItemMasterListController);

    function OpticalItemMasterListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ItemCode: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            ItemName: '',
            ActiveStatusId: 2,
            OpticalProductTypeId: -1
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.OpticalProductTypeId },
                    { Key: 7, Value: $scope.currentfilter.ItemCode },
                    { Key: 5, Value: $scope.currentfilter.IsActive },
                    { Key: 6, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/OpticalItemMaster/GetOpticalItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.opticalitemmastertab.opticalitemmaster', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/OpticalItemMaster/DeleteOpticalItemMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.opticalitemmastertab.opticalitemmaster', { id: entity.Id, OpticalProductTypeId: entity.OpticalProductTypeId, ItemCode: entity.ItemCode, ItemName: entity.ItemName });
            }
              else if
                (actionType == 'view') {
                $state.go('app.opticalitemmastertab.opticalitemmaster', { id: entity.Id, OpticalProductTypeId: entity.OpticalProductTypeId, ItemCode: entity.ItemCode, ItemName: entity.ItemName });
            }

            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ItemName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('inventory.opticalitemmaster.filter_facility.lbl') },
                { field: "ItemCode", displayName: $translate.instant('inventory.opticalitemmaster.filter_itemcode.lbl') },
                { field: "ItemName", displayName: $translate.instant('inventory.opticalitemmaster.filter_itemname.lbl') },
                { field: "OpticalProductType.Description", displayName: $translate.instant('inventory.opticalitemmaster.filter_producttype.lbl') },
                { field: "Rate", displayName: $translate.instant('inventory.opticalitemmaster.rate.lbl') },
                { field: "GSTPercentage", displayName: $translate.instant('inventory.opticalitemmaster.gst.lbl') },
                { field: "HikePercentage", displayName: $translate.instant('inventory.opticalitemmaster.hike.lbl') },
                { field: "SalesPrice", displayName: $translate.instant('inventory.opticalitemmaster.salesprice.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.opticalitemmaster.filter_status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate:
                    '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><i class=" fa fa-times icon" aria-hidden="true"> </i></span>\
                        \
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" },
                { "Key": "OpticalProductType" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    OpticalItemMasterListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];

})();