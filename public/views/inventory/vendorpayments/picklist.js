(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PickListController', PickListController);

    function PickListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.lookup = {
            StoreUsers: []
        };
        $scope.currentcontext = {
            DefaultStoreId: 0,
            LoggedInUserId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.id = modalConfig.params.id;
        $scope.currentcontext.vid = modalConfig.params.vid;

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                PoStatusId: -1,
                StoreMasterId: $scope.currentcontext.DefaultStoreId,
                FromStoreMasterId: -1,
                ApprovedBy: utl.Session.getCurrentUserId(),
                TypeId: -1,
                VendorMasterId: -1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [

                    {
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
                        translate: 'Type',
                        model: 'TypeId',
                        options: $scope.lookup.PickType,
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                ],
                actions: [
                    {
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-success'
                    }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }
            $scope.getgrnList();
            // if ($scope.defaultdata.TypeId == -1) {
            //     $scope.getgrnList();
            //     $scope.getprnList();
            // }
            // if ($scope.defaultdata.TypeId == 1) {
            //     $scope.getgrnList();
            // }
            // if ($scope.defaultdata.TypeId == 2) {
            //     $scope.getprnList();
            // }
        };
        $scope.Loadgrid = function () {
            var gridInfo = {};
            $scope.GridList = [];
            if ($scope.GrnList.length > 0) {
                for (var gdx in $scope.GrnList) {
                    var gridInfo = {};
                    var grnllist = $scope.GrnList[gdx];
                    gridInfo.PickType = 'Grn';
                    gridInfo.PickTypeId = 1;
                    gridInfo.Id = grnllist.Id;
                    gridInfo.Date = grnllist.GrnDate;
                    gridInfo.IdNumber = grnllist.GrnNumber;
                    gridInfo.InvoiceNumber = grnllist.InvoiceNumber;
                    gridInfo.InvAmt = grnllist.TotalInvoiAmount;
                    gridInfo.RecAmt = grnllist.ReceivedAmount;
                    gridInfo.BlnceAmt = grnllist.BalanceAmount;
                    gridInfo.NetAmt = '';
                    $scope.GridList.push(gridInfo);
                }
            }
            if ($scope.PrnList.length > 0) {
                var gridInfo = {};
                for (var rdx in $scope.PrnList) {
                    var prnlist = $scope.PrnList[rdx];
                    gridInfo.PickType = 'Return';
                    gridInfo.PickTypeId = 2;
                    gridInfo.Id = prnlist.Id;
                    gridInfo.Date = prnlist.PrnDate;
                    gridInfo.IdNumber = prnlist.PrnNumber;
                    gridInfo.InvoiceNumber = '';
                    gridInfo.InvAmt = '';
                    gridInfo.RecAmt = '';
                    gridInfo.BlnceAmt = '';
                    gridInfo.NetAmt = prnlist.TotalNetAmount;
                    $scope.GridList.push(gridInfo);
                }
            }
            vm.gridConfig.data = $scope.GridList;
        }


        $scope.getprnListCallback = function (scope, res, options, hasError) {
            $scope.PrnList = [];
            $scope.PrnList = res.Data;
            $scope.Loadgrid();
            // if ($scope.defaultdata.TypeId == -1 || $scope.defaultdata.TypeId == 2) {

            // }
            // var items = $scope.gridData;
            // vm.gridConfig.data = items;
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getprnList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');;

            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: $scope.currentcontext.vid
                    },
                    {
                        Key: 9,
                        Value: FrmDate
                    },
                    {
                        Key: 10,
                        Value: ToDate
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };


            var options = {
                action: 'pharmacy/PurchaseReturn/GetPurchaseReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getprnListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getgrnListCallback = function (scope, res, options, hasError) {
            $scope.GrnList = [];
            $scope.GrnList = res.Data;
            if ($scope.defaultdata.TypeId == -1 || $scope.defaultdata.TypeId == 2) {
                $scope.getprnList();
            }
            // var items = $scope.gridData;
            // vm.gridConfig.data = items;
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getgrnList = function (pageNo) {
            if ($scope.defaultdata.TypeId == -1 || $scope.defaultdata.TypeId == 1) {
                var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
                var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
                var inputData = {
                    Params: [
                        {
                            Key: 8,
                            Value: FrmDate
                        },
                        {
                            Key: 9,
                            Value: ToDate
                        },
                        {
                            Key: 4,
                            Value: $scope.currentcontext.vid
                        }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
                var options = {
                    action: 'pharmacy/grn/GetGrnList',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getgrnListCallback
                };

                utl.Http.doAction(options);
            } else {
                $scope.getprnList();
            }
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
                    selectId: entity.Id,
                    picktypeId: entity.PickTypeId

                });
                //                 }
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
            {
                field: "Date",
                displayName: $translate.instant('inventory.findpo-list.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Date | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.Date| date: 'HH:mm'}}</span>" + "</div>"
            },
            // {
            //     field: "PrnDate",
            //     displayName: $translate.instant('inventory.findpo-list.date.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PrnDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PrnDate| date: 'HH:mm'}}</span>" + "</div>"
            // },
            //{ field: "PurchaseOrderDetail.ItemCode", displayName: $translate.instant('inventory.findpo-list.item.lbl') },
            //{ field: "PoDate", displayName: $translate.instant('inventory.findpo-list.date.lbl') },
            {
                field: "PickType",
                displayName: $translate.instant('Type')
            },
            {
                field: "IdNumber",
                displayName: $translate.instant('Grn/Return #')
            },
            // {
            //     field: "PrnNumber",
            //     displayName: $translate.instant('Return #')
            // },
            {
                field: "InvoiceNumber",
                displayName: $translate.instant('Invoice #')
            },
            {
                field: "TotalInvoiAmount",
                displayName: $translate.instant('Gross Amount'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.InvAmt | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('Return Amount'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmt | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "ReceivedAmount",
                displayName: $translate.instant('Paid Amount'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.RecAmt | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "BalanceAmount",
                displayName: $translate.instant('Pending Amount'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.BlnceAmt | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            initDynamicForm();
            $scope.getgrnList();
            $scope.getprnList();
        };
        // $scope.SelectedStoreUsers = function () {
        //     var inputData = {
        //         Params: [{
        //             Key: 3,
        //             Value: $scope.currentcontext.DefaultStoreId
        //         }],
        //         PageContext: {
        //             PageSize: 100,
        //             PageNumber: 1
        //         }
        //     };
        //     var options = {
        //         action: 'pharmacy/storeusermap/GetStoreUserMaps',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getStoreUserCallback
        //     };

        //     utl.Http.doAction(options);
        // }

        // $scope.getStoreUserCallback = function (scope, res, options, hasError) {
        //     var StoreUser = {};
        //     var StoreUserData = res.Data || [];
        //     for (var suidx in StoreUserData) {
        //         StoreUser = {
        //             Id: StoreUserData[suidx].UserId,
        //             UserId: StoreUserData[suidx].UserId,
        //             Text: StoreUserData[suidx].User.FirstName
        //         }
        //         $scope.lookup.StoreUsers.push(StoreUser);
        //     }
        // }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PickType"
            },
            {
                "Key": "VendorMaster",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }]
                }
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

    PickListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();