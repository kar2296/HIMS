(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LinenStockEntryListController', LinenStockEntryListController);

    function LinenStockEntryListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            LinenStockEntryStatusId:2,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            EnteredDate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.EnteredDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.EnteredDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.LinenStockEntryNumber },
                    // { Key: 3, Value: [From, To] },
                    // { Key: 3, Value: $scope.currentfilter.EnteredDate },
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.LinenStockEntryStatusId },
                    { Key: 5, Value:From},
                    { Key: 6, Value:To},
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'LinenAndLaundry/LinenStockEntry/GetLinenStockEntrys',
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
                action: 'LinenAndLaundry/LinenStockEntry/DeleteLinenStockEntry',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.linenstockentryform', { id: 0 });
        };

        $scope.linendashboard = function () {
            $state.go('app.linendashboard');
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                $state.go('app.linenstockentryform', { id: row.entity.Id });
            }
            if (actionType == 'edit') {
                $state.go('app.linenstockentryform', { id: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('linenandlaundry.linenstockentry.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{rowRenderIndex+ 1}} </span> </div>"
                },
                {
                    field: "EnteredDate",
                    displayName: $translate.instant('linenandlaundry.linenstockentry.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.EnteredDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.EnteredDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "LinenStockEntryNumber", displayName: $translate.instant('linenandlaundry.linenstockentry.entryno.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('linenandlaundry.linenstockentry.stockpoint.lbl') },

                {
                    field: "EnterBy",
                    displayName: $translate.instant('linenandlaundry.linenstockentry.entredby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.EnterBy.Title.Description}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.EnterBy.FirstName}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.EnterBy.LastName}}</span>" + "</div>"
                },
                {
                    field: "ApprovedUser",
                    displayName: $translate.instant('linenandlaundry.linenstockentry.approvedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.ApprovedUser.Title.Description}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.ApprovedUser.FirstName}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.ApprovedUser.LastName}}</span>" + "</div>"
                },

                { field: "StockEntryStatus.Description", displayName: $translate.instant('linenandlaundry.linenstockentry.status.lbl') },
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
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"  uib-tooltip="View"  tooltip-placement="bottom" ng-show="row.entity.LinenStockEntryStatusId==2||row.entity.LinenStockEntryStatusId==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  uib-tooltip="Edit"  tooltip-placement="bottom"   ng-show="row.entity.LinenStockEntryStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  uib-tooltip="Delete"  tooltip-placement="bottom"  ng-show="row.entity.LinenStockEntryStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
                { "Key": "StockEntryStatus" },


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

    LinenStockEntryListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();