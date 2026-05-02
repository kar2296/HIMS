(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalStockItemListController', OpticalStockItemListController);

    function OpticalStockItemListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.gridData = [];

        $scope.lookup = {};
        $scope.currentfilter = {
            ActiveStatusId: 2,
            StoreMasterId: -1
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        var OpticalItemMasterId = parseInt($stateParams.id);


        $scope.getList = function () {
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.item.FacilityId },
                        { Key: 3, Value: $scope.currentcontext.id },
                        { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                        { Key: 5, Value: $scope.currentfilter.StoreMasterId }
                    ]
                };

                var options = {
                    action: 'pharmacy/OpticalStockItem/GetOpticalStockItems',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            } else {
                $state.go('app.opticalitemmastertab.opticalitemstock', { id: 0 });
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.addNew = function () {
            utl.Modal.openFixedDialog('app.opticalitemstock', {
                params: { id: 0, OpticalItemMasterId: parseInt($stateParams.id), OpticalProductTypeId: parseInt($stateParams.OpticalProductTypeId), ItemCode: $state.params.ItemCode, ItemName: $state.params.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.openModal = function (Id) {
            utl.Modal.openFixedDialog('app.opticalitemstock', {
                params: { id: Id, OpticalItemMasterId: parseInt($stateParams.id), OpticalProductTypeId: parseInt($stateParams.OpticalProductTypeId), ItemCode: $state.params.ItemCode, ItemName: $state.params.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        function setDefaults() {
            var ActiveId = utl.Lookup.getDefault($scope.lookup.ActiveStatus, 'Active');
            $scope.currentfilter.ActiveStatusId = ActiveId;
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('inventory.opticalitemmaster.facility.lbl') },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.opticalitemmaster.store.lbl') },
                { field: "Quantity", displayName: $translate.instant('inventory.opticalitemmaster.qty.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.opticalitemmaster.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate:
                    '<div class="ui-grid-cell-contents">\
                         <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><i class="btn btn-danger btn-rounded fa fa-times" aria-hidden="true"></i</span>\
                        \
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            data: $scope.gridData
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "Facility" },
                {
                    "Key": "StoreMaster", Request: {
                        Params: [
                            { Key: 8, Value: 1 }
                        ]
                    }
                },
            ];

            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function (inputData) {
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

    OpticalStockItemListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();