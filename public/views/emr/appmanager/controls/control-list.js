(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('controlListController', controlListController);

    function controlListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: '',
            ActiveStatusId: 2,
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentfilter.Display },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 6, Value: $scope.currentfilter.ParentControlId },
                    /* { Key: 1, Value: $scope.currentfilter.name ? $scope.currentfilter.name : "" } */
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/Control/GetControls',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.control', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/Control/DeleteControl',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.control', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.SRef);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Display", displayName: $translate.instant('appmanager.control-list.display.lbl') },
                { field: "ControlType", displayName: $translate.instant('appmanager.control-list.controltype.lbl') },
                { field: "ControlPosition", displayName: $translate.instant('appmanager.control-list.controlposition.lbl') },
                { field: "SRef", displayName: $translate.instant('appmanager.control-list.sref.lbl') },
                { field: "ParentControl.Display", displayName: $translate.instant('appmanager.control-form.parentcontrol.lbl') },
                { field: "DisplayOrder", displayName: $translate.instant('appmanager.control-list.displayorder.lbl') },
                { field: "Context", displayName: $translate.instant('appmanager.control-form.context.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('appmanager.control-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                   \
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    \
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-show="row.entity.ActiveStatusId == 3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                   \
                                                </div>',
                    actions: [

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
                { "Key": "ActiveStatus" },
                { "Key": "Control" },

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

    controlListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();