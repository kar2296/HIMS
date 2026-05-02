(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findprListController', findprListController);

    function findprListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.lookup = {};

        $scope.currentcontext = {
            DefaultStoreId: 0,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.id = modalConfig.params.id



        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                // StoreMasterId: 2,
                StoreMasterId: $scope.currentcontext.DefaultStoreId,
                PrStatusId: 3,
                FacilityId: -1, //parseInt(utl.Session.getCurrentFacilityId()) 

            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [{
                        type: 'date',
                        translate: 'inventory.findpo-list.fromdate.lbl',
                        model: 'FromDate',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'inventory.findpo-list.todate.lbl',
                        model: 'ToDate',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.prtype.lbl',
                        model: 'PrTypeId',
                        options: $scope.lookup.PrType,
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.vendorname.lbl',
                        model: 'VendorMasterId',
                        options: $scope.lookup.VendorMaster,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.storename.lbl',
                        model: 'StoreMasterId',
                        options: $scope.lookup.UserStores,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'inventory.findpo-list.prstatus.lbl',
                        model: 'PrStatusId',
                        options: $scope.lookup.PrStatus,
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                    {
                        type: 'text',
                        translate: 'inventory.findpo-list.prno.lbl',
                        model: 'PrNumber',
                        position: {
                            r: 2,
                            c: 0
                        }
                    },

                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    // { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }
            $scope.getList();
        }

        //Dynamic form  ends    
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;

        };

        $scope.getList = function (pageNo) {
            if ($scope.modeldata.PrNumber) {
                $scope.modeldata.FromDate = '';
                $scope.modeldata.ToDate = '';
                $scope.modeldata.PrStatusId = -1;
            }
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00') || null;;
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59') || null;;

            // var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            var inputData = {
                Params: [
                    // {
                    //     Key: 6,
                    //     Value: [FrmDate, ToDate]
                    // },
                    {
                        Key: 9,
                        Value: FrmDate
                    },
                    {
                        Key: 10,
                        Value: ToDate
                    },
                    {
                        Key: 1,
                        Value: $scope.modeldata.PrNumber
                    },
                    {
                        Key: 2,
                        Value: $scope.modeldata.PrTypeId
                    },
                    {
                        Key: 8,
                        Value: $scope.modeldata.VendorMasterId
                    },
                    {
                        Key: 3,
                        Value: $scope.modeldata.StoreMasterId
                    },
                    {
                        Key: 4,
                        Value: $scope.modeldata.PrStatusId
                    },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'pharmacy/purchaserequest/GetPurchaseRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                // if (entity.PoStatusId == 5) {
                //     utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status1.lbl'));
                //     return false;
                // } else if (entity.PoStatusId == 4) {
                //     utl.Alert.showErrorMsg($translate.instant('inventory.findpo-list.status2.lbl'));
                //     return false;
                // } else {
                $scope.confirmCallback({
                    prid: entity.Id,
                    PrStatusId: entity.PrStatusId
                });
                // }
            }
        }
        vm.gridConfig = {
            columnDefs: [{
                    field: "Id",
                    displayName: $translate.instant('Select'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="btn btn-check btn-rounded fa fa-check" aria-hidden="true"></i></span>\
                                    </div>',
                    handleEvent: $scope.handleEvents,
                },
                //{ field: "RequestedDate", displayName: $translate.instant('inventory.findpo-list.date.lbl') },
                {
                    field: "RequestedDate",
                    displayName: $translate.instant('inventory.findpo-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.RequestedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "FromStore.StoreName",
                    displayName: $translate.instant('inventory.findpo-list.storename.lbl')
                },
                {
                    field: "PrNumber",
                    displayName: $translate.instant('inventory.findpo-list.prnumber.lbl'),

                },
                {
                    field: "VendorMaster.VendorName",
                    displayName: $translate.instant('inventory.findpo-list.vendor.lbl')
                },
                {
                    field: "PrStatus.Description",
                    displayName: $translate.instant('inventory.findpo-list.prstatus.lbl')
                },
                // {
                //      field: "PurchaseRequestDetails.ItemCode",
                //     displayName: $translate.instant('inventory.findpo-list.itemcode.lbl'),

                // },
                // {
                //     field: "ItemMaster.ItemName",
                //     displayName: $translate.instant('inventory.findpo-list.itemname.lbl'),

                // },


                // {
                //     field: "StockQty",
                //     displayName: $translate.instant('inventory.findpo-list.stockqty.lbl'),
                // },
                // { field: "MinQty", displayName: $translate.instant('inventory.findpo-list.minqty.lbl') },
                // { field: "MaxQty", displayName: $translate.instant('inventory.findpo-list.maxqty.lbl') },
                // { field: "Rol", displayName: $translate.instant('inventory.findpo-list.rol.lbl') },
                //{ field: "RequestedQuantity", displayName: $translate.instant('inventory.findpo-list.prqty.lbl') }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true


        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (entity.PrStatusId == 4) {
                    utl.Alert.showErrorMsg($translate.instant('Status Cancelled'));
                    return false;
                }
                console.log(entity.Id);
                $scope.confirmCallback({
                    prid: entity.Id
                });
            });
        };
        //Grid selection related code ends

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores') {
                    $scope.currentcontext.DefaultStoreId = value[0].Id;
                }
            });
            initDynamicForm();
            $scope.getList();

        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "PrType"
                },
                {
                    "Key": "VendorMaster"
                },
                {
                    "Key": "PrStatus"
                },
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }, ]
                    }
                },
                {
                    "Key": "FromDate"
                },
                {
                    "Key": "ToDate"
                },
                {
                    "Key": "User"
                },
                {
                    "Key": "UserStores"
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

    findprListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();