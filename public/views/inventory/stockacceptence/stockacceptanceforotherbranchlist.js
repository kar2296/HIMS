(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockAcceptenceListForOtherBranchController', StockAcceptenceListForOtherBranchController);

    function StockAcceptenceListForOtherBranchController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.Items = [];
        $scope.currentfilter = {
            TransferNumber: null,
            TransferTypeId: 3,
            TransferStatusId: 2,
            AcceptanceStatusId: 1,
            TransferDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            ToFacilityId: -1,
            StoreMasterId: 0,
            ToStoreMasterId: -1,
            RequestedBy: utl.Session.getCurrentUserId(),
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };


        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.stocktransfers.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.stocktransfers.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.requestedby.lbl', model: 'RequestedBy', options: $scope.lookup.RequestedUser, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.stocktransfers.transferedby.lbl', model: 'TransferedBy', options: $scope.lookup.TranferedUser, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.transfertype.lbl', model: 'TransferTypeId', options: $scope.lookup.TransferType, position: { r: 2, c: 0 } },
                    { type: 'text', translate: 'inventory.stocktransfers.acceptedno.lbl', model: 'AcceptanceNumber', position: { r: 2, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };

        }


        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };
        $scope.backtoList = function () {
            if ($scope.Context == 'pharmacy') {
                $state.go('app.pharmacydashboard');
            } else if ($scope.Context == 'nursing') {
                $state.go('app.nursingdashboard');
            } else if ($scope.Context == 'store') {
                $state.go('app.storedashboard');
            } else if ($scope.Context == 'surgery') {
                $state.go('app.surgerydashboard')
            }
        }
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            // var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 23:59:59') || null;
            // var fromDate = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 00:00:00');
            // var toDate = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentfilter.TransferNumber },
                    // { Key: 2, Value: $scope.advancedfilter.TransferTypeId },
                    // { Key: 3, Value: $scope.currentfilter.TransferStatusId },
                    { Key: 16, Value: $scope.currentfilter.StockTransferAcceptNo },
                    // //{ Key: 4, Value: [fromDate, toDate] },
                    { Key: 14, Value: From },
                    { Key: 15, Value: To },
                    // { Key: 14, Value: FromReq },
                    // { Key: 15, Value: ToReq },
                    // { Key: 5, Value: $scope.currentfilter.FacilityId },
                    // { Key: 7, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 17, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.ToFacilityId },
                    { Key: 7, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 6, Value: $scope.currentfilter.ToStoreMasterId },
                    // { Key: 6, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 8, Value: $scope.currentfilter.RequestNumber },
                    { Key: 9, Value: $scope.currentfilter.AcceptanceStatusId },
                    { Key: 10, Value: $scope.currentfilter.RequestedBy },
                    // { Key: 11, Value: $scope.advancedfilter.ApprovedBy },
                    // { Key: 12, Value: $scope.advancedfilter.TransferedBy },
                    { Key: 13, Value: $scope.currentfilter.AcceptanceNumber },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/StockTransfer/GetStockTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.filter = function () {
            $state.go('app.stocktransfers.transferfilter', { transferfilterid: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/StockTransfer/DeleteStockTransfer',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.stockacceptanceforotherbranchform', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.TransferIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.stockacceptanceforotherbranchform', { id: entity.Id });
            }
        };

        vm.gridConfig = {
            columnDefs: [{
                field: "TransferDate",
                displayName: $translate.instant('inventory.stocktransfers.transferdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransferDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.TransferDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "RequestNumber", displayName: $translate.instant('inventory.stocktransfers.requestno.lbl') },
            { field: "TransferNumber", displayName: $translate.instant('inventory.stocktransfers.transfernumber.lbl') },
            // { field: "ToFacility.FacilityName", displayName: $translate.instant('From Facility') },
            // { field: "FromStore.StoreName", displayName: $translate.instant('inventory.stocktransfers.fromstore.lbl') },
            { field: "ToFacility.FacilityName", displayName: $translate.instant('My Facility') },
            { field: "ToStore.StoreName", displayName: $translate.instant('My Store') },
            { field: "Facility.FacilityName", displayName: $translate.instant('From Facility') },
            { field: "FromStore.StoreName", displayName: $translate.instant('From Store') },
            { field: "AcceptanceNumber", displayName: $translate.instant('inventory.stocktransfers.acceptancenumber.lbl') },
            { field: "TransferType.Description", displayName: $translate.instant('inventory.stocktransfers.transfertype.lbl') },
            {
                field: "RequestedUser",
                displayName: $translate.instant('inventory.stocktransfers.requestedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "TranferedUser",
                displayName: $translate.instant('inventory.stocktransfers.transferedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TranferedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.TranferedUser.LastName}}</span>" + "</div>"
            },
            { field: "AcceptanceStatus.Description", displayName: $translate.instant('inventory.stocktransfers.transferstatus.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.TransferStatusId==2||entity.TransferStatusId==3||entity.TransferStatusId==4||entity.TransferStatusId==5||entity.TransferStatusId==6"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.TransferStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.TransferStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        function setDefaults() {
            //Setting default status filters starts
            var PendingId = utl.Lookup.getDefault($scope.lookup.AcceptanceStatus, 'Pending');
            var AcceptedId = utl.Lookup.getDefault($scope.lookup.AcceptanceStatus, 'Accepted');
            $scope.currentfilter.AcceptanceStatusId = PendingId + "," + AcceptedId;
            //$scope.currentfilter.WorklistStatusId=ApprovedId;
            //Setting default status filters ends
        }

        $scope.getstore = function () {
            // $scope.currentfilter.FacilityId = -1;
            var inputData = [{
                "Key": "ToStore",
                Request: {
                    Params: [
                        {
                            Key: 6,
                            Value: $scope.currentfilter.FacilityId,
                        },
                        {
                            Key: 7,
                            Value: 2
                        }
                    ]
                },
            }];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "RequestedUser" },
                { "Key": "ApprovedUser" },
                { "Key": "TranferedUser" },
                { "Key": "TransferType" },
                { "Key": "Facility" },
                { "Key": "AcceptanceStatus", Default: false },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            {
                                Key: 6,
                                Value: $scope.currentfilter.FacilityId,
                            },
                            {
                                Key: 7,
                                Value: 2
                            }
                        ]
                    },
                },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getLookUpOnSelect = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallbackOnSelect
            };
            utl.Http.doAction(options);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.initLookup();
    }

    StockAcceptenceListForOtherBranchController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();