(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VendorMasterExceluploadController', VendorMasterExceluploadController);

    function VendorMasterExceluploadController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};

        $scope.openModal = function (Id) {
            utl.Modal.open('app.importvendormasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.vendorUpload = function() {
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
                        Key: 14,
                        Value: From
                    },
                    {
                        Key: 15,
                        Value: To
                    },
                    {
                        Key: 16,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Pharmacy/VendorMaster/GetVendorMasters',
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
                field: "VendorCode",
                displayName: $translate.instant('inventory.vendormasters.code.lbl')
            },
            {
                field: "VendorName",
                displayName: $translate.instant('inventory.vendormasters.name.lbl')
            },

            {
                field: "VendorType.Description",
                displayName: $translate.instant('inventory.vendormasters.type.lbl')
            },
            // {
            //     field: "DistributionType.Description",
            //     displayName: $translate.instant('inventory.vendormaster.distributiontype.lbl')
            // },

            {
                field: "MobileNumber",
                displayName: $translate.instant('inventory.vendormasters.number.lbl')
            },
            {
                field: "EmailAddress",
                displayName: $translate.instant('inventory.vendormasters.email.lbl')
            },
            {
                field: "City",
                displayName: $translate.instant('inventory.vendormasters.city.lbl')
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('inventory.vendormasters.status.lbl')
            },
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

    VendorMasterExceluploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();