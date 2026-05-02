(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LinenItemMasterListController', LinenItemMasterListController);

    function LinenItemMasterListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            LinenTypeId: -1,
            LinenCategoryId: -1,
            StatusId: -1,
            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        $scope.currentcontext.BincodeId = parseInt($stateParams.id);
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Code },
                    { Key: 3, Value: $scope.currentfilter.LinenTypeId },
                    { Key: 4, Value: $scope.currentfilter.LinenCategoryId },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'linenandlaundry/linenitemmaster/GetLinenItemMaster',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.linenitemmaster', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
        //Grid Actions
        // $scope.addNew = function() {
        //    $state.go('app.remark', { id:0 });


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'linenandlaundry/linenitemmaster/DeleteLinenItemMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                $scope.openModal(row.entity.Id);
                //$state.go('app.remark', { id:row.entity.Id });
            }
            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
                //$state.go('app.remark', { id:row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Code);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('linenandlaundry.linenitemmaster-list.code.lbl') },
                { field: "Name", displayName: $translate.instant('linenandlaundry.linenitemmaster-list.name.lbl') },
                { field: "LinenType.Description", displayName: $translate.instant('linenandlaundry.linenitemmaster-list.linentype.lbl') },
                { field: "LinenCategory.Description", displayName: $translate.instant('linenandlaundry.linenitemmaster-list.linencategory.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('linenandlaundry.linenitemmaster-list.status.lbl') },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                //     ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" uib-tooltip="View"  tooltip-placement="bottom"  ng-show="row.entity.ActiveStatusId==2||row.entity.ActiveStatusId==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  uib-tooltip="Edit"  tooltip-placement="bottom"   ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  uib-tooltip="Delete"  tooltip-placement="bottom"  ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                    actions: []
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
                { "Key": "LinenType" },
                { "Key": "LinenCategory" },
                { "Key": "ActiveStatus" }
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

    LinenItemMasterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();