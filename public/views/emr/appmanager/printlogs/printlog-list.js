(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('printListController', printListController);

    function printListController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            PrintDate: utl.Formatter.getCurrentDate()
        };
        // $scope.item = {
            // PrintDate: utl.Formatter.getCurrentDate()
        // }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.PrintDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.PrintDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                     { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    // { Key: 3, Value: $scope.currentfilter.PrintDate },
                    { Key: 4, Value: $scope.currentfilter.ObjectTypeId },
                    { Key: 5, Value: From },
                    { Key: 6, Value: To },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'General/EntityPrintHistory/GetEntityPrintHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.printlog', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'General/EntityPrintHistory/DeleteEntityPrintHistory',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.printlog', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Display);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('appmanager.print-list.facility.lbl') },
                { field: "ObjectId", displayName: $translate.instant('appmanager.print-list.objectname.lbl') },
                { field: "ObjectType.Description", displayName: $translate.instant('appmanager.print-list.objecttype.lbl') },
                // { field: "PrintedBy.User", displayName: $translate.instant('appmanager.print-list.printedby.lbl') },
                {
                    field: "PrintBy", displayName: $translate.instant('appmanager.print-list.printedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span>'
                    + "{{row.entity.PrintBy.Title.Description}}</span>"
                    + "<span >&nbsp;{{row.entity.PrintBy.FirstName}}</span>"
                    + "<span >&nbsp;{{row.entity.PrintBy.LastName}}</span>"
                    + "</span></div>"
                },
                { field: "PrintDate", displayName: $translate.instant('appmanager.print-list.printon.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.PrintDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.PrintDate| date: 'HH:mm'}}</span>" + "</div>" },
                { field: "Reason", displayName: $translate.instant('appmanager.print-list.reason.lbl') },

              
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         // { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                //     ]
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { Key: "ObjectName" },
                { Key: "ActiveStatus" },
                { Key: "ObjectType" },
                { Key: "User" },
                { Key: "PrintType" },
                { Key: "Facility" },
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

    printListController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();