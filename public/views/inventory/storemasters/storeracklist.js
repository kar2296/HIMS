(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('storerackListController', storerackListController);

    function storerackListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            ActiveStatusId: 2,
            RackId: 0,
            RackCode: null,
            RackName: null,
            RackDescription: null
        };
        $scope.currentfilter.StoreMasterId = parseInt($stateParams.id);

        $scope.getListCallback = function(scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];

                /*
                if (item.ActiveStatusId != 1 && item.ActiveStatusId != 3) {
                    vm.gridConfig.data.push(item);
                }
                */

                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;

        };

        $scope.getList = function(pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.RackCode },
                    { Key: 5, Value: $scope.currentfilter.RackName }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/storerack/GetStoreRacks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function(Id) {
            utl.Modal.open('app.storemastertab.storerack', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.addNew = function() {
            $scope.openModal(0);
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'pharmacy/storerack/DeleteStoreRack',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'view') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RackName);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('inventory.storeracks.facilityname.lbl') },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.storeracks.storename.lbl') },
                { field: "RackId", displayName: $translate.instant('inventory.storeracks.rackid.lbl') },
                { field: "RackCode", displayName: $translate.instant('inventory.storeracks.rackcode.lbl') },
                { field: "RackName", displayName: $translate.instant('inventory.storeracks.rackname.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.storeracks.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    \</div>',
                                    handleEvent: $scope.handleEvents,
                    /*
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="entity.ActiveStatusId==2"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    \</div>',
                    */
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
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

    storerackListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();