(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DhobiIssueBookListController', DhobiIssueBookListController);

    function DhobiIssueBookListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            LinenStockTransferStatusId: 3,
            FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            LinenStockTransferDate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.LinenStockTransferDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.LinenStockTransferDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    // { Key: 3, Value: [From, To] },
                    // { Key: 3, Value: $scope.currentfilter.LinenStockTransferDate },
                    { Key: 2, Value: $scope.currentfilter.LinenStockTransferNo },
                    { Key: 6, Value: $scope.currentfilter.LinenStockTransferStatusId },
                    { Key: 4, Value: From },
                    { Key: 5, Value: To },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'LinenAndLaundry/LinenStockTransfer/GetLinenStockTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onEnter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ProcedureId = -1;
                $scope.getList();
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'LinenAndLaundry/LinenStockTransfer/DeleteLinenStockTransfer',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.dhobiissuebookform', { id: 0 });
        };
        $scope.linendashboard = function () {
            $state.go('app.linendashboard');
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                $state.go('app.dhobiissuebookform', { id: row.entity.Id });
            }
            if (actionType == 'edit') {
                $state.go('app.dhobiissuebookform', { id: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('linenandlaundry.dhobiissuebook.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{rowRenderIndex+ 1}} </span> </div>"
                },
                {
                    field: "LinenStockTransferDate",
                    displayName: $translate.instant('linenandlaundry.dhobiissuebook.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.LinenStockTransferDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.LinenStockTransferDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "LinenStockTransferNo", displayName: $translate.instant('linenandlaundry.dhobiissuebook.issueno.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('linenandlaundry.dhobiissuebook.stockingpoint.lbl') },
                { field: "ToDepartment.DepartmentName", displayName: $translate.instant('linenandlaundry.dhobiissuebook.todepartment.lbl') },

                {
                    field: "IssuedUser",
                    displayName: $translate.instant('linenandlaundry.dhobiissuebook.dobhiname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.IssuedUser.Title.Description}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.IssuedUser.FirstName}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.IssuedUser.LastName}}</span>" + "</div>"
                },

                { field: "LinenStockTransferStatus.Description", displayName: $translate.instant('linenandlaundry.dhobiissuebook.status.lbl') },
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
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
                                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"  uib-tooltip="View"  tooltip-placement="bottom"   ng-show="row.entity.LinenStockTransferStatusId==3||row.entity.LinenStockTransferStatusId==4||row.entity.LinenStockTransferStatusId==5||row.entity.LinenStockTransferStatusId==6"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  uib-tooltip="Edit"  tooltip-placement="bottom"   ng-show="row.entity.LinenStockTransferStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  uib-tooltip="Delete"  tooltip-placement="bottom"  ng-show="row.entity.LinenStockTransferStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        // function setDefaults() {
        //     var ActiveId = utl.Lookup.getDefault($scope.lookup.ActiveStatus, 'Active');
        //     $scope.currentfilter.ActiveStatusId = ActiveId;
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "LinenStockTransferStatus" },


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

    DhobiIssueBookListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();