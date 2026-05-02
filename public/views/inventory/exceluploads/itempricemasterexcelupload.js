(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ItemPriceMasterExceluploadController', ItemPriceMasterExceluploadController);

    function ItemPriceMasterExceluploadController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};

        $scope.backtoDashboard = function () {
            $state.go('app.exceluploads');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.importitemmasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.itemUpload = function() {
            $scope.openModal(0,false);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 30,
                        Value: From
                    },
                    {
                        Key: 31,
                        Value: To
                    },
                    {
                        Key: 32,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Pharmacy/ItemMaster/GetItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "ItemCode",
                displayName: $translate.instant('reports.itemcode.lbl')
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "GenericName",
                displayName: $translate.instant('reports.generic.lbl')
            },
            {
                field: "CategoryName",
                displayName: $translate.instant('Category Name'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ItemCategory.CategoryName}}</span>" + "</div>"
            },            
            {
                field: "ManufacturerName",
                displayName: $translate.instant('reports.manu.lbl')
            },
            {
                field: "DrugName",
                displayName: $translate.instant('Drug Name')
            },
            {
                field: "CostPrice",
                displayName: $translate.instant('Cost Price')
            },
            {
                field: "MrPrice",
                displayName: $translate.instant('MrPrice')
            },
            // {
            //     field: "TotalQty",
            //     displayName: $translate.instant('reports.totalqty.lbl')
            // },
            // {
            //     field: "NetUcp",
            //     displayName: $translate.instant('Total UCP'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetUcp | displaycurrency}}</span>" + "</div>"
            //     // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalUcp | displaycurrency}}&nbsp;</span>' + '</div>',
            // },
            // {
            //     field: "NetMrp",
            //     displayName: $translate.instant('Total MRP'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetMrp | displaycurrency}}</span>" + "</div>"
            //     // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalMrp | displaycurrency}}&nbsp;</span>' + '</div>',
            // },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },]
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

    ItemPriceMasterExceluploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();