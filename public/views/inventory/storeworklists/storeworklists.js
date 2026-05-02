(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StoreWorklistsController', StoreWorklistsController);

    function StoreWorklistsController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ToStoreMasterId: -1,
            StoreMasterId: 0,
            RequestStatusId: 3,
            WorklistStatusId: 2,
            StockRequestTypeId: 1,
            RequestNumber: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
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

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',

                controls: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    type: 'date',
                    translate: 'inventory.stockrequests.fromdate.lbl',
                    model: 'From',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'inventory.stockrequests.todate.lbl',
                    model: 'To',
                    position: {
                        r: 0,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.stockrequests.fromfacility.lbl',
                    model: 'FromFacility',
                    options: $scope.lookup.Facility,
                    position: {
                        r: 1,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.stockrequests.tofacility.lbl',
                    model: 'ToFacility',
                    options: $scope.lookup.Facility,
                    position: {
                        r: 1,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.stockrequests.tostore.lbl',
                    model: 'ToStoreMasterId',
                    options: $scope.lookup.ToStore,
                    position: {
                        r: 2,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.stockrequests.createdby.lbl',
                    model: 'CreatedUser',
                    options: $scope.lookup.CreatedUser,
                    position: {
                        r: 2,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.stockrequests.approvedby.lbl',
                    model: 'ApprovedUser',
                    options: $scope.lookup.ApprovedUser,
                    position: {
                        r: 3,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.stockrequests.priority.lbl',
                    model: 'StockPriorityId',
                    options: $scope.lookup.StockPriority,
                    position: {
                        r: 3,
                        c: 1
                    }
                },
                    // { type: 'select', translate: 'stockrequests.location.lbl', model: 'LocationId', options: $scope.lookup.Location, position: { r: 4, c: 0 } },
                    // { type: 'select', translate: 'stockrequests.remark.lbl', model: 'RemarkId', options: $scope.lookup.Remark, position: { r: 4, c: 1 } }
                ],
                actions: [{
                    type: 'apply',
                    translate: 'common.applyaction.lbl',
                    cls: 'btn-primary'
                },
                {
                    type: 'reset',
                    translate: 'common.resetaction.lbl',
                    cls: 'btn-danger'
                }
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

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];

                item.TotalNetAmount = parseFloat(item.TotalNetAmount).toFixed(2);
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentfilter.RequestNumber },
                    // { Key: 2, Value: $scope.currentfilter.StockRequestTypeId },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.RequestStatusId
                    },
                    // { Key: 4, Value: [fromDate, toDate] },
                    {
                        Key: 11,
                        Value: From
                    },
                    {
                        Key: 12,
                        Value: To
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.ToStoreMasterId
                    },
                    // { Key: 9, Value: $scope.advancedfilter.ApprovedUser },
                    // { Key: 10, Value: $scope.advancedfilter.CreatedUser },
                    // { Key: 13, Value: $scope.advancedfilter.FromFacility },
                    // { Key: 14, Value: $scope.advancedfilter.ToFacility },
                    // { Key: 15, Value: $scope.currentfilter.StockPriorityId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            // if ($scope.currentfilter.RequestedDate) {
            //     fromDate = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 00:00:00');
            //     toDate = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 23:59:59');
            //     inputData.Params.push({ Key: 4, Value: [fromDate, toDate] });

            // }

            // if ($scope.advancedfilter.From || $scope.advancedfilter.To) {


            //     fromDate = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00');
            //     toDate = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59');
            //     inputData.Params.push({ Key: 4, Value: [fromDate, toDate] });
            // }
            // var options = {
            //     action: 'pharmacy/StockTransfer/GetStockTransfers',
            //     data: inputData,
            //     type: 'post',
            //     onComplete: $scope.getListCallback
            // };

            var options = {
                action: 'pharmacy/stockrequest/GetStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.storeworklist', {
                id: 0
            });
        };

        $scope.filter = function () {
            $state.go('app.stockrequests.admissionfilter', {
                admissionfilterid: 0
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/stockrequest/DeleteStockRequest',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.stocktransferdetails = function (stockrequestId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    stockrequestid: stockrequestId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'issue') {
                $state.go('app.storeworklist', {
                    id: entity.Id,
                    StockRequestId: entity.Id,
                    StoreMasterId: entity.ToStoreMasterId,
                    tostoreid: entity.StoreMasterId,
                    RequestStatusId: entity.RequestStatusId,
                    StockTransferId: entity.StockTransferId
                });
            } else if (actionType == 'view') {
                $state.go('app.stockrequest-view', {
                    id: entity.Id,
                    StockRequestId: entity.Id,
                    RequestStatusId: entity.RequestStatusId
                });
            } else if (actionType == 'transfers') {
                //$scope.stocktransferdetails(entity.Id);
            }
        };

        var rowtpl = '<div ng-class="{\'priority\':entity.StockPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            rowTemplate: rowtpl,
            enableColumnResizing: true,
            columnDefs: [{
                field: "RequestedDate",
                displayName: $translate.instant('inventory.stockrequests.requestdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.RequestedDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "RequestNumber",
                displayName: $translate.instant('inventory.stockrequests.requestnumber.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents(\'transfers\',row)">' +
                    "{{entity.RequestNumber}}" +
                    "</a></div>"
            },
            {
                field: "ToStore.StoreName",
                displayName: $translate.instant('My Store')
            },
            {
                field: "FromStore.StoreName",
                displayName: $translate.instant('From Store')
            },
            {
                field: "StockRequestType.Description",
                displayName: $translate.instant('inventory.stockrequests.requesttype.lbl')
            },
            {
                field: "RequestedUser",
                displayName: $translate.instant('inventory.stockrequests.requestedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.RequestedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "RequestStatus.Description",
                displayName: $translate.instant('inventory.stockrequests.requeststatus.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'issue\',entity)" ng-show="entity.RequestStatusId==2||entity.RequestStatusId==3||entity.RequestStatusId==4"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'issue\',entity)"ng-show="entity.RequestStatusId==5||entity.RequestStatusId==6"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        function setDefaults() {
            var RequestedId = utl.Lookup.getDefault($scope.lookup.RequestStatus, 'Requested');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.RequestStatus, 'Authorized');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.RequestStatus, 'Completed');
            $scope.currentfilter.RequestStatusId = RequestedId + "," + AuthorizedId + "," + CompletedId;
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
            var inputData = [{
                "Key": "RequestStatus",
                Default: false
            },
            {
                "Key": "StockRequestType"
            },
            {
                "Key": "FromStore"
            },
            {
                "Key": "ToStore",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: utl.Session.getCurrentFacilityId(),
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
            }
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

    StoreWorklistsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();