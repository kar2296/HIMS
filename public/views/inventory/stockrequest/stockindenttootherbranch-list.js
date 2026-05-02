(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockIndenttootherbranchListController', StockIndenttootherbranchListController);

    function StockIndenttootherbranchListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            ToStoreMasterId: -1,
            RequestStatusId: 0,
            StockPriorityId: -1,
            StockRequestTypeId: 1,
            RequestNumber: '',
            RequestedDate: utl.Formatter.getCurrentDate()
        };

        // $scope.backtoList = function () {
        //     if ($scope.Context == 'pharmacy') {
        //         $state.go('app.pharmacydashboard');
        //     } else if ($scope.Context == 'nursing') {
        //         $state.go('app.nursingdashboard');
        //     }else if($scope.Context=='store'){
        //         $state.go('app.storedashboard');
        //     } else if ($scope.Context == 'surgery') {
        //         $state.go('app.surgerydashboard')
        //     }
        // }
        $scope.backtoList = function () {
            $state.go('app.storedashboard');
        }
        $scope.advancedfilter = {
            FromDate: null,
            ToDate: null,
            FromFacility: -1,
            ToFacility: -1,
            CreatedUser: -1,
            ApprovedUser: -1
        };

        function initDynamicForm() {
            $scope.advancedfilterDefault = {

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'date',
                    translate: 'inventory.stockrequests.fromdate.lbl',
                    model: 'FromDate',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'inventory.stockrequests.todate.lbl',
                    model: 'ToDate',
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
                    translate: 'inventory.stockrequests.createdby.lbl',
                    model: 'CreatedUserId',
                    options: $scope.lookup.CreatedUser,
                    position: {
                        r: 2,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'inventory.stockrequests.approvedby.lbl',
                    model: 'ApprovedUserId',
                    options: $scope.lookup.ApprovedUser,
                    position: {
                        r: 2,
                        c: 1
                    }
                }
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
                item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {

            var From = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.RequestNumber
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.StockRequestTypeId
                },
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
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.ToStoreMasterId
                },
                // { Key: 9, Value: $scope.advancedfilter.ApprovedUser },
                // { Key: 10, Value: $scope.advancedfilter.CreatedUser },
                // { Key: 13, Value: $scope.advancedfilter.FromFacility },
                // { Key: 14, Value: $scope.advancedfilter.ToFacility },
                {
                    Key: 15,
                    Value: $scope.currentfilter.StockPriorityId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockrequest/GetStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.stockindenttootherbranchform', {
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

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.stockindenttootherbranchform', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RequestIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.stockindenttootherbranchform', {
                    id: entity.Id
                });
            }
        };

        var rowtpl = '<div ng-class="{\'priority\':entity.StockPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "RequestNumber",
                displayName: $translate.instant('inventory.stockrequests.indentno.lbl')
            },
            {
                field: "RequestedDate",
                displayName: $translate.instant('inventory.stockrequests.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.RequestedDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "FromStore.StoreName",
                displayName: $translate.instant('inventory.stockrequests.mystore.lbl')
            },
            {
                field: "ToStore.StoreName",
                displayName: $translate.instant('inventory.stockrequests.tostore.lbl')
            },
            {
                field: "StockRequestType.Description",
                displayName: $translate.instant('inventory.stockrequests.requesttype.lbl')
            },
            // {
            //     field: "TotalNetAmount",
            //     displayName: $translate.instant('inventory.stockrequests.netamount.lbl'),
            //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            // },
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
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.RequestStatusId==2||entity.RequestStatusId==3||entity.RequestStatusId==4||entity.RequestStatusId==5||entity.RequestStatusId==6"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.RequestStatusId==1"><i class="fas fa-calendar-plus"></i></i></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.RequestStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
            var PartiallyTransferedId = utl.Lookup.getDefault($scope.lookup.RequestStatus, 'PartiallyTransfered');
            //var TransferedId = utl.Lookup.getDefault($scope.lookup.RequestStatus, 'TransferedId');
            $scope.currentfilter.RequestStatusId = RequestedId + "," + AuthorizedId + "," + PartiallyTransferedId;
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
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
                "Key": "ToStore"
            },
            {
                "Key": "StockPriority"
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

        $scope.initLookup();
    }

    StockIndenttootherbranchListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();