(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetreconcileListController', AssetreconcileListController);

    function AssetreconcileListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DepartmentId: utl.Session.getCurrentDepartmentId(),
            AuditNameId: -1,
            LocationId: -1,
            AuditStatusId: 3,
        };
        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.AssetId },
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.LOCATIONId },
                    { Key: 4, Value: $scope.currentfilter.StartDate },
                    { Key: 5, Value: $scope.currentfilter.AuditName },
                    { Key: 6, Value: $scope.currentfilter.AuditStatusId },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/AssetAudit/GetAssetAudits',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            $state.go('app.assetreconciles', { id: 0 });
        }



        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/AssetAudit/DeleteAssetAudit',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {

                $state.go('app.assetreconciles', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AllergyName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "StartDate", displayName: $translate.instant('assetmanagement.assetaudit.startdate.lbl'), cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StartDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.StartDate| date: 'HH:mm'}}</span>" + "</div>" },
                { field: "Department.DepartmentName", displayName: $translate.instant('assetmanagement.assetaudit.department.lbl') },
                { field: "LOCATION.Description", displayName: $translate.instant('assetmanagement.assetaudit.location.lbl') },
                {
                    field: "AuditName", displayName: $translate.instant('assetmanagement.assetaudit.auditname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + '<span>'
                        + "{{entity.AuditName.Title.Description}}&nbsp;</span>"
                        + "<span >&nbsp;{{entity.AuditName.FirstName}}&nbsp;</span>"
                        + "<span >&nbsp;{{entity.AuditName.LastName}}</span>"
                        + "</span></div>"
                },
                { field: "AuditStatus.Description", displayName: $translate.instant('assetmanagement.assetaudit.auditstatus.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                { "Key": "LOCATION" },
                {
                    "Key": "Department",
                    Request: {
                        Params: [
                            { Key: 5, Value: 2 },
                            { Key: 17, Value: curdeptids }, // Institution dept filter
                        ]
                    }
                },
                { "Key": "User" },
                { "Key": "AuditStatus" },
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

    AssetreconcileListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];

})();