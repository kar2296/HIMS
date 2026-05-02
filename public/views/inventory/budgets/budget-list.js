(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('budgetListController', budgetListController);

    function budgetListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];


        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DateFrom: utl.Formatter.getCurrentDate(),
            DateTo: utl.Formatter.getCurrentDate(),
            DepartmentId: -1,
            ActiveStatusId:-1
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DepartmentId },
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/Budget/GetBudgets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.budget', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/Budget/DeleteBudget',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.budget', { id: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.PrNumber);
            } else if (actionType == 'view') {

                $state.go('app.budget', { id: row.entity.Id });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "CreatedAt",
                displayName: $translate.instant('inventory.budget-list.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"


            },
            //{ field: "RequestedDate", displayName: $translate.instant('inventory.purchaserequests.requesteddate.lbl'), cellTemplate: "<ngformatdate date-val='row.entity.RequestedDate'></ngformatdate>" },
            { field: "Department.DepartmentName", displayName: $translate.instant('inventory.budget-list.department.lbl') },
            {
                field: "DateFrom", displayName: $translate.instant('inventory.budget-list.datefrom.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.DateFrom | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.DateFrom| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "DateTo", displayName: $translate.instant('inventory.budget-list.dateto.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.DateTo | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.DateTo| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PackageAmount", displayName: $translate.instant('inventory.budget-list.budgetamount.lbl'),
                cellTemplate: '<div class ="ui-grid-cell-contents">' + '<span>{{row.entity.PackageAmount|displaycurrency}}&nbsp;</span>' + '</div>'
            },
            { field: "ConsumedCost", displayName: $translate.instant('inventory.budget-list.consumedamount.lbl') },
            { field: "PendingCost", displayName: $translate.instant('inventory.budget-list.balamount.lbl') },

            { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.budget-list.status.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.ActiveStatusId==2||row.entity.ActiveStatusId==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                actions: [
                    //{ actiontype: 'edit', display: 'common.editaction.lbl' },
                    //{ actiontype: 'delete', display: 'common.deleteaction.lbl' },
                    //{ actiontype: 'history', display: 'common.history.lbl' }
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
                { "Key": "Department" },
                { "Key": "ActiveStatus" },
                { "Key": "Facility" },

                { "Key": "ItemCategory" },
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
    budgetListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();