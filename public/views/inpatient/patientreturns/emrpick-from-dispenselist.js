(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('emrpickfromdispenseListController', emrpickfromdispenseListController);

    function emrpickfromdispenseListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.lookup = {};
        $scope.selectedPatient = {};

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.PatientId = modalConfig.params.patientid;
            $scope.currentcontext.StoreMasterId = modalConfig.params.storemasterid;
            $scope.currentcontext.EncounterId = modalConfig.params.encounterid;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.selectallchk = false;
        $scope.PatientStockReturnDetails = [];
        $scope.PatientBillDetails = [];
        $scope.addNewLineItem = function () {
            var PatientBillDetail = {
                PatientBillDetailId: 0,
                PatientBillId: 0,
                ItemMasterId: 0,
                ItemName: '',
                ItemCode: '',
                IsSupplementary: false,
                Quantity: 0,
                ReturnedQuantity: 0,
                ReturnQuantity: 0,
                ReturnTransitQuantity: 0,
                ReceivedQuantity: 0,
                BatchId: '',
                ExpiryDate: null,
                StockItemId: 0,
                StockSerialItemId: 0,
                Rate: 0,
                GSTId: 0,
                GSTPercentage: 0,
                GSTAmount: 0,
                UnitGSTAmount: 0,
                InGstId: 0,
                InGstPercentage: 0,
                InGstAmount: 0,
                UnitInGstAmount: 0,
                CGstId: 0,
                CGstPercentage: 0,
                CGstAmount: 0,
                UnitCGstAmount: 0,
                SGstId: 0,
                SGstPercentage: 0,
                SGstAmount: 0,
                UnitSGstAmount: 0,
                Status: 1
            };
            $scope.PatientBillDetails.push(PatientBillDetail);
        };

        $scope.ChangeReturnQty = function (item) {
            if (parseInt(item.ReturnQuantity) > (parseInt(item.Quantity) - parseInt(item.ReturnTransitQuantity))) {
                item.ReturnQuantity = 0;
                utl.Alert.showErrorMsg($translate.instant('pickdispenselist.actualquantity.lbl'));
            }
            if (item.ReturnTransitQuantity > 0) {
                if ((parseInt(item.ReturnTransitQuantity) - parseInt(item.Quantity)) == 0) {
                    item.ReturnQuantity = 0;
                    utl.Alert.showErrorMsg($translate.instant('Billed Quantity Already Returned'));
                }
            }
        };

        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.PatientBillDetails) {
                currentSelection.push($scope.PatientBillDetails[idx]);
            }
            return currentSelection;
        }

        function selectionChangedCal() {
            var Selectionrow = getSelectionRows();
        }

        $scope.SelectAll = function (chk) {
            for (var idx in $scope.PatientBillDetails) {
                $scope.PatientBillDetails[idx].select = chk;
            }

            selectionChangedCal();
        };

        function getReturnSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.PatientBillDetails) {
                if ($scope.PatientBillDetails[idx].select) {
                    if (parseInt($scope.PatientBillDetails[idx].ReturnQuantity) > 0) {
                        currentSelection.push($scope.PatientBillDetails[idx]);
                    }
                }
            }
            return currentSelection;
        }
        }

        $scope.Load = function () {
            var selectedlines = getReturnSelectionRows();
            if (selectedlines.length > 0) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'pickdispenselist.confirmloadmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onLoadConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else {
                utl.Alert.showErrorMsg($translate.instant('pickdispenselist.returnmaxquantity.lbl'));

                return false;
            }
        };

        $scope.onLoadConfirmed = function () {
            var returnlines = getReturnSelectionRows();

            $scope.confirmCallback({
                ReturnData: returnlines,
                IsPicked: 1
            });
        };

        var groupBy_ItemId_BatchId = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupBy_ItemId_BatchId(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.getDispensedItemListCallback = function (scope, res, options, hasError) {
            $scope.PatientBillDetails = [];
            $scope.PatientStockReturnDetails = res.Data[0].Encounter.PatientStockReturnDetails || [];
            //var groupedReturnedItems = groupBy_ItemId_BatchId($scope.PatientStockReturnDetails, ['ItemMasterId', 'StockSerialItemId']);
            if (res.Data.length > 0) {
                if (res.Data[0].PatientBill) {
                    if (res.Data[0].PatientBill.Patient) {
                        $scope.selectedPatient = res.Data[0].PatientBill.Patient;
                        $scope.item.TitleId = $scope.selectedPatient.TitleId;
                        $scope.item.GenderId = $scope.selectedPatient.GenderId;
                        $scope.item.Age = $scope.selectedPatient.Age;
                    }
                }
            }

            var groupedDispensedItems = groupBy_ItemId_BatchId(res.Data, ['ItemMasterId', 'StockSerialItemId']);
            for (var gdidx in groupedDispensedItems) {
                if (parseInt(gdidx) > 0) {
                    var groupedItems = groupedDispensedItems[gdidx];
                    for (var gidx in groupedItems) {
                        var groupedItem = groupedItems[gidx];
                        var G_PatientBillDetailId = 0;
                        var G_PatientBillId = 0;
                        var G_ItemMasterId = 0;
                        var G_ItemName = '';
                        var G_ItemCode = '';
                        var G_IsSupplementary = false;
                        var G_Quantity = 0;
                        var G_ReturnedQuantity = 0;
                        var G_ReturnQuantity = 0;
                        var G_ReturnTransitQuantity = 0;
                        var G_ReceivedQuantity = 0;
                        var G_BatchId = '';
                        var G_ExpiryDate = null;
                        var G_StockItemId = 0;
                        var G_StockSerialItemId = 0;
                        var G_Rate = 0;
                        var G_GSTId = 0;
                        var G_GSTPercentage = 0;
                        var G_GSTAmount = 0;
                        var G_UnitGSTAmount = 0;
                        var G_InGstId = 0;
                        var G_InGstPercentage = 0;
                        var G_InGstAmount = 0;
                        var G_UnitInGstAmount = 0;
                        var G_CGstId = 0;
                        var G_CGstPercentage = 0;
                        var G_CGstAmount = 0;
                        var G_UnitCGstAmount = 0;
                        var G_SGstId = 0;
                        var G_SGstPercentage = 0;
                        var G_SGstAmount = 0;
                        var G_UnitSGstAmount = 0;
                        var G_UnitDiscountAmount = 0;
                        var G_ServiceCategoryId = 0;
                        var G_MasterItemId = 0;
                        var G_MasterItemId = 0;
                        var G_MasterName = '';

                        var itemqty = 0;
                        var itemreturnedqty = 0;
                        var rate = 0;
                        for (var i = 0, len = groupedItem.length; i < len; i++) {
                            var itemqty = 0;
                            G_ItemMasterId = groupedItem[i].ItemMasterId;
                            G_ItemName = groupedItem[i].ItemName;
                            G_ItemCode = groupedItem[i].ItemCode;
                            G_IsSupplementary = groupedItem[i].IsSupplementary;
                            if (groupedItem[i].IsPharmacySale == 1 && (groupedItem[i].PharmacySaleTypeId == 2 || groupedItem[i].PharmacySaleTypeId == 6)) {
                                itemqty = groupedItem[i].Quantity;
                            }
                            if (groupedItem[i].IsPharmacySale == 1) {
                                rate = groupedItem[i].Rate;
                            }
                            if (groupedItem[i].ReturnedQuantity > 0) {
                                itemreturnedqty = groupedItem[i].ReturnedQuantity;
                            } else if (groupedItem[i].IsPharmacyReturn == 1 && groupedItem[i].PharmacyReturnTypeId == 6) {
                                itemreturnedqty = groupedItem[i].Quantity;
                            }
                            G_Quantity += itemqty;
                            G_ReturnedQuantity = itemreturnedqty;
                            G_ReturnQuantity = 0;
                            G_Rate = rate;
                            var TransitReturnQty = 0;
                            var ReturnQuantity = 0;
                            for (var k = 0, ken = $scope.PatientStockReturnDetails.length; k < ken; k++) {
                                if (G_ItemMasterId == $scope.PatientStockReturnDetails[k].ItemMasterId &&
                                    groupedItem[i].StockSerialItemId == $scope.PatientStockReturnDetails[k].StockSerialItemId) {
                                    ReturnQuantity = ReturnQuantity + $scope.PatientStockReturnDetails[k].ReturnQuantity;
                                    TransitReturnQty = TransitReturnQty + $scope.PatientStockReturnDetails[k].ReturnQuantity;
                                }
                            }

                            G_ReturnTransitQuantity = TransitReturnQty;
                            G_ReceivedQuantity = 0;
                            G_PatientBillDetailId = groupedItem[i].Id;
                            G_PatientBillId = groupedItem[i].PatientBillId;
                            G_BatchId = groupedItem[i].BatchId;
                            G_Quantity = G_Quantity;
                            // G_Quantity = groupedItem[i].Quantity;
                            G_ReturnedQuantity = G_ReturnedQuantity;
                            //                         G_ReturnedQuantity = ReturnQuantity;
                            G_ReturnQuantity = groupedItem[i].ReturnQuantity;
                            G_ExpiryDate = groupedItem[i].ExpiryDate;
                            G_StockItemId = groupedItem[i].StockItemId;
                            G_StockSerialItemId = groupedItem[i].StockSerialItemId;
                            G_ServiceCategoryId = groupedItem[i].ServiceCategoryId;
                            G_MasterItemId = groupedItem[i].MasterItemId;
                            G_MasterName = groupedItem[i].MasterName;
                            G_Rate = G_Rate;
                            G_GSTId = groupedItem[i].GSTId;
                            G_GSTPercentage = groupedItem[i].GSTPercentage;
                            G_GSTAmount = groupedItem[i].GSTAmount;
                            G_UnitGSTAmount = groupedItem[i].UnitGSTAmount;
                            G_InGstId = groupedItem[i].InGstId;
                            G_InGstPercentage = groupedItem[i].InGstPercentage;
                            G_InGstAmount = groupedItem[i].InGstAmount;
                            G_UnitInGstAmount = groupedItem[i].UnitInGstAmount;
                            G_CGstId = groupedItem[i].CGstId;
                            G_CGstPercentage = groupedItem[i].CGstPercentage;
                            G_CGstAmount = groupedItem[i].CGstAmount;
                            G_UnitCGstAmount = groupedItem[i].UnitCGstAmount;
                            G_SGstId = groupedItem[i].SGstId;
                            G_SGstPercentage = groupedItem[i].SGstPercentage;
                            G_SGstAmount = groupedItem[i].SGstAmount;
                            G_UnitSGstAmount = groupedItem[i].UnitSGstAmount;
                            G_UnitDiscountAmount = groupedItem[i].UnitDiscountAmount;
                        }
                        var PatientBillDetail = {
                            PatientBillDetailId: G_PatientBillDetailId,
                            PatientBillId: G_PatientBillId,
                            ItemMasterId: G_ItemMasterId,
                            ItemName: G_ItemName,
                            ItemCode: G_ItemCode,
                            IsSupplementary: G_IsSupplementary,
                            Quantity: G_Quantity,
                            Quantity: G_Quantity,
                            ServiceCategoryId: G_ServiceCategoryId,
                            MasterName: G_MasterName,
                            ReturnedQuantity: G_ReturnedQuantity,
                            ReturnQuantity: G_ReturnQuantity,
                            ReturnTransitQuantity: G_ReturnTransitQuantity,
                            ReceivedQuantity: G_ReceivedQuantity,
                            BatchId: G_BatchId,
                            ExpiryDate: G_ExpiryDate,
                            StockItemId: G_StockItemId,
                            StockSerialItemId: G_StockSerialItemId,
                            Rate: G_Rate,
                            GSTId: G_GSTId,
                            GSTPercentage: G_GSTPercentage,
                            GSTAmount: G_GSTAmount,
                            UnitGSTAmount: G_UnitGSTAmount,
                            InGstId: G_InGstId,
                            InGstPercentage: G_InGstPercentage,
                            InGstAmount: G_InGstAmount,
                            UnitInGstAmount: G_UnitInGstAmount,
                            CGstId: G_CGstId,
                            CGstPercentage: G_CGstPercentage,
                            CGstAmount: G_CGstAmount,
                            UnitCGstAmount: G_UnitCGstAmount,
                            SGstId: G_SGstId,
                            SGstPercentage: G_SGstPercentage,
                            SGstAmount: G_SGstAmount,
                            UnitSGstAmount: G_UnitSGstAmount,
                            UnitDiscountAmount: G_UnitDiscountAmount,
                            Status: 1
                        }
                        if (PatientBillDetail.Quantity > 0) {
                            $scope.PatientBillDetails.push(PatientBillDetail);
                        }
                    }
                }
            }

            $scope.PatientBillDetails.sort($scope.custom_sort);
        }

        $scope.custom_sort = function (a, b) {
            if (a.ItemName < b.ItemName)
                return -1;
            if (a.ItemName > b.ItemName)
                return 1;
            return 0;
        };

        $scope.getPatientDispensedItems = function () {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.EncounterId
                    },
                    // {
                    //     Key: 14,
                    //     Value: $scope.currentcontext.StoreMasterId
                    // },
                    {
                        Key: 4,
                        Value: 3
                    },
                    // { Key: 23, Value: 27 },
                    { Key: 24, Value: 1 },
                    {
                        Key: 25,
                        Value: 0
                    }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/patientbilldetails/GetPatientPharmacyBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDispensedItemListCallback
            };

            utl.Http.doAction(options);
        };

        function loadData() {
            if ($scope.currentcontext.EncounterId > 0) {
                $scope.getPatientDispensedItems();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [];

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

    emrpickfromdispenseListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();