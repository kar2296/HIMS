(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockRequestotherbranchViewController', StockRequestotherbranchViewController);

    function StockRequestotherbranchViewController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1,
            StockRequestId: -1,
            RequestStatusId: -1
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.StockRequestId = $state.params.StockRequestId;
        $scope.currentcontext.RequestStatusId = $state.params.RequestStatusId;
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ToFacilityId: utl.Session.getCurrentFacilityId(),
            RequestedDate: utl.Formatter.getCurrentDate(),
            StockRequestTypeId: 1,
            ItemCategoryId: 1,
            StockPriorityId: 1,
            ToStoreMasterId: -1,
            StoreMasterId: 0,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            isDisabled: false,
            RequestNumber: null
        };

        $scope.stockrequestDetails = [];

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.RequestStatusId != 1 || $scope.item.RequestStatusId != 2 || $scope.item.RequestStatusId != 3 || $scope.item.RequestStatusId != 4 || $scope.item.RequestStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowHistoryBtn = false;
            }
            // When In Draft Status
            if ($scope.item.RequestStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Approved Status
            if ($scope.item.RequestStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.RequestStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Completed Status
            if ($scope.item.RequestStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.RequestStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowHistoryBtn = true;
            }
        };

        $scope.addNewLineItem = function () {
            var stockrequestDetail = {
                Id: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUomId: 0,
                RequestedQuantity: 0,
                QuantityOnHand: 0,
                PurchasePrice: 0,
                GstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                GstId: 0,
                GstCode: '',
                GstPercentage: 0.00,
                GstAmount: 0.00,
                UnitCostPrice: 0.00,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1
            };

            if ($scope.currentcontext.id > 0) {
                stockrequestDetail.StockRequestId = $scope.currentcontext.id;
            }
            $scope.stockrequestDetails.push(stockrequestDetail);
        };
        $scope.history = function (HistoryId) {
            utl.Modal.open('app.srhistory', {
                // params: { hid: HistoryId },
                // confirmCallback: $scope.getList
            });
        };

        $scope.History = function (item, idx) {
            utl.Modal.open('app.strequesthistory', {
                params: {
                    storemasterid: $scope.item.StoreMasterId,
                    itemmasterid: item.ItemMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.Stock = function (selectedItem, idx) {
            utl.Modal.open('app.stockrequestdetails', {
                params: { storemasterid: $scope.item.StoreMasterId, itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/stockrequest/PrintStockRequest',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/stockrequest/GetStockRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            for (var idx in data.Data) {
                var item = data.Data[idx];

                item.TotalNetAmount = parseFloat(item.TotalNetAmount).toFixed(2);
                vm.gridConfig.data.push(item);
            }
            $scope.item = data;

            if (data.RequestStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayRequestStatus = 'Draft';
            }

            if (data.RequestStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Requested';
            }

            if (data.RequestStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Authorized';
            }

            if (data.RequestStatusId == 4) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Partially Completed';
            }

            if (data.RequestStatusId == 5) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Completed';
            }

            if (data.RequestStatusId == 6) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Cancelled';
            }

            $scope.applyVisibilityRules();
        };

        $scope.getStockRequestDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/stockrequestdetail/GetStockRequestDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStockRequestDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getStockRequestDetailsCallback = function (scope, res, options, hasError) {
            $scope.stockrequestDetails = res.Data || [];
            for (var idx in $scope.stockrequestDetails) {
                var sritem = $scope.stockrequestDetails[idx];
                if (sritem.ItemMasterId > 0) {
                    sritem.GstCode = sritem.GstMaster.GstCode;
                }
            }
        };

        $scope.backToList = function () {
            $state.go('app.storeworklisttab.storeworklists', $scope.currentcontext.id);
        };

        function loadData() {
            $scope.getItem();
            $scope.getStockRequestDetails();
        }

        $scope.computeAmount = function (item) {
            if (item.RequestedQuantity > 0) {
                item.GrossAmount = item.PurchasePrice * item.RequestedQuantity;
                item.NetAmount = item.UnitCostPrice * item.RequestedQuantity;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.stockrequestDetails) {
                if ($scope.stockrequestDetails[idx].Status == 1) {
                    if ($scope.TotalGrossAmount === null) {
                        $scope.TotalGrossAmount = 0;
                    }
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.stockrequestDetails[idx].GrossAmount).toFixed(2));

                    if ($scope.TotalGstAmount === null) {
                        $scope.TotalGstAmount = 0;
                    }
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + ($scope.stockrequestDetails[idx].GstAmount * $scope.stockrequestDetails[idx].RequestedQuantity)).toFixed(2));

                    if ($scope.TotalNetAmount === null) {
                        $scope.TotalNetAmount = 0;
                    }
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.stockrequestDetails[idx].NetAmount).toFixed(2));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.TotalAmount = $scope.TotalNetAmount;
        }

        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                }
            });
        };

        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            {
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
                },
            ];

            $scope.getLookUp(inputData);
            loadData();
        };

        $scope.getLookUp = function (inputData) {
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

    StockRequestotherbranchViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();