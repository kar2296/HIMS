(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockTransferlistsController', StockTransferlistsController);

    function StockTransferlistsController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            TransferNumber: '',
            TransferTypeId: 3,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            ToStoreMasterId: -1,
            RequestNumber: ''
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.advancedfilter = {
            FromDate: null,
            ToDate: null,
            FromFacility: -1,
            ToFacility: -1,
            CreatedUser: -1,
            ApprovedUser: -1
        };


        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                // From: utl.Formatter.getCurrentDate(),
                // To: utl.Formatter.getCurrentDate(),

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.stocktransfers.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.stocktransfers.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.requestedby.lbl', model: 'RequestedBy', options: $scope.lookup.RequestedUser, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.stocktransfers.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.transferedby.lbl', model: 'TransferedBy', options: $scope.lookup.TranferedUser, position: { r: 2, c: 0 } },
                    { type: 'text', translate: 'inventory.stocktransfers.acceptedno.lbl', model: 'AcceptanceNumber', position: { r: 2, c: 1 } },],
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
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];

                item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);

                vm.gridConfig.data.push(item);

            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {
            if ($scope.currentfilter.TransferNumber) {
                (($scope.advancedfilter.From = '') || ($scope.advancedfilter.To = '') || ($scope.currentfilter.TransferDate = '')
                    || ($scope.currentfilter.StoreMasterId = '') || ($scope.currentfilter.ToStoreMasterId = '')
                    || ($scope.currentfilter.TransferStatusId = '') || ($scope.currentfilter.FacilityId = '') || ($scope.currentfilter.TransferTypeId = ''))
            }
            var fromDate = null;
            var toDate = null;
            // if ($scope.advancedfilter.From !== '' || $scope.advancedfilter.To !== '') {
            //     $scope.currentfilter.TransferDate = '';

            // fromDate = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00');
            // toDate = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59');
            //  }

            // else {
            //     fromDate = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 00:00:00');
            //     toDate = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 23:59:59');
            // }
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.TransferNumber },
                    { Key: 2, Value: $scope.currentfilter.TransferTypeId },
                    { Key: 3, Value: $scope.currentfilter.TransferStatusId },
                    //{ Key: 4, Value: [fromDate, toDate] },
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 7, Value: $scope.currentfilter.ToStoreMasterId },
                    { Key: 8, Value: $scope.currentfilter.RequestNumber },
                    { Key: 10, Value: $scope.advancedfilter.RequestedBy },
                    { Key: 11, Value: $scope.advancedfilter.ApprovedBy },
                    { Key: 12, Value: $scope.advancedfilter.TransferedBy },
                    { Key: 13, Value: $scope.advancedfilter.AcceptanceNumber },
                    { Key: 1, Value: $scope.advancedfilter.TransferNumber },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if ($scope.currentfilter.FromDate||$scope.currentfilter.ToDate) {
                fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
                toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push({ Key: 4, Value: [fromDate, toDate] });

            }

            if ($scope.advancedfilter.From || $scope.advancedfilter.To) {


                fromDate = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00');
                toDate = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push({ Key: 4, Value: [fromDate, toDate] });
            }
            var options = {
                action: 'pharmacy/StockTransfer/GetStockTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.stocktransfer', { id: 0 });
        }

        $scope.filter = function () {
            $state.go('app.stocktransfers.transferfilter', { transferfilterid: 0 });
        }


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
        }

        $scope.showPatientInfo = function (item) {

        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.stocktransfer', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.TransferIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.stocktransfer-view', { id: entity.Id, StockTransferId: entity.Id, TransferStatusId: entity.TransferStatusId });
            }
        }
        $scope.getPatientInfo = function (row) {
            console.log(row);
        }
        vm.gridConfig = {
            columnDefs: [{
                field: "TransferDate",
                displayName: $translate.instant('inventory.stocktransfers.transferdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransferDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.TransferDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "TransferNumber", displayName: $translate.instant('inventory.stocktransfers.transfernumber.lbl') },
            { field: "FromStore.StoreName", displayName: $translate.instant('inventory.stocktransfers.mystore.lbl') },
            { field: "ToStore.StoreName", displayName: $translate.instant('inventory.stocktransfers.tostore.lbl') },
            { field: "TransferType.Description", displayName: $translate.instant('inventory.stocktransfers.transfertype.lbl') },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('inventory.stocktransfers.netamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TransferedBy",
                displayName: $translate.instant('inventory.stocktransfers.transferedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TranferedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.TranferedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.TranferedUser.LastName}}</span>" + "</div>"
            },
            { field: "TransferStatus.Description", displayName: $translate.instant('inventory.stocktransfers.transferstatus.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.TransferStatusId==2||entity.TransferStatusId==3||entity.TransferStatusId==4||entity.TransferStatusId==5||entity.TransferStatusId==6"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        function setDefaults() {
            //Setting default status filters starts
            var TransferredId = utl.Lookup.getDefault($scope.lookup.TransferStatus, 'Transferred');
            var AcceptedId = utl.Lookup.getDefault($scope.lookup.TransferStatus, 'Accepted');
            var RejectedId = utl.Lookup.getDefault($scope.lookup.TransferStatus, 'Rejected');
            $scope.currentfilter.TransferStatusId = TransferredId + "," + AcceptedId + "," + RejectedId;
            //Setting default status filters ends
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });

            setDefaults();
            $scope.getList();
            initDynamicForm();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "TransferStatus", Default: false },
                { "Key": "TransferType" },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            // {
                            //     Key: 6,
                            //     Value: utl.Session.getCurrentFacilityId(),
                            // },
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
        }

        $scope.initLookup();
    }
    StockTransferlistsController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();