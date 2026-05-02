(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('wardmasterListController', wardmasterListController);

    function wardmasterListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            WardTypeId: -1,
            WardName: '',
            ActiveStatusId: 2
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 1, Value: $scope.currentfilter.WardTypeId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.WardName }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/WardMaster/GetWardMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function() {
            $state.go('app.wardtab.detail', { id: 0 });
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'generalmaster/WardMaster/DeleteWardMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.wardtab.detail', { id: entity.Id, wardname: entity.WardName });
            }
            if (actionType == 'user') {
                $state.go('app.wardtab.user', { id: entity.Id, wardname: entity.WardName });
            }
            if (actionType == 'room') {
                $state.go('app.wardtab.room', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Code);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.wardmaster-list.facility.lbl') },
                { field: "Code", displayName: $translate.instant('generalmaster.wardmaster-list.code.lbl') },
                { field: "WardName", displayName: $translate.instant('generalmaster.wardmaster-list.name.lbl') },
                // { field: "Description", displayName: $translate.instant('generalmaster.wardmaster-list.description.lbl') },
                { field: "LocationMaster.LocationName", displayName: $translate.instant('generalmaster.wardmaster-list.location.lbl') },
                // { field: "WardType.Description", displayName: $translate.instant('generalmaster.wardmaster-list.type.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.wardmaster-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" style="display:flex;justify-content:space-around;">\
       <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1 || entity.ActiveStatusId==2 || entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
          <span class="grid-action" title="User Association" ng-click="handleEvents(\'user\',entity)"ng-show=" entity.ActiveStatusId==2"><i class="fas fa-handshake"></i></span>\
                <span class="grid-action" title="Room" ng-click="handleEvents(\'room\',entity)"ng-show=" entity.ActiveStatusId==2"><i class="fas fa-person-booth"></i></span>\
                                <span class="grid-action"  ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1 || entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" },
                { "Key": "WardType" },
                { "Key": "ServiceRateCategory" }
            ];

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

    wardmasterListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();