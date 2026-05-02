(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pickfromissueListController', pickfromissueListController);

    function pickfromissueListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.lookup = {};
        $scope.selectedPatient = {};

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.OTRegisterId = modalConfig.params.otregisterid;
            $scope.currentcontext.PatientId = modalConfig.params.patientid;
            $scope.currentcontext.EncounterId = modalConfig.params.encounterid;
            $scope.currentcontext.id = modalConfig.params.id;

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
            if (parseInt(item.ReturnQuantity) > (parseInt(item.Quantity) - (parseInt(item.ReturnedQuantity) + parseInt(item.ReturnTransitQuantity)))) {
                item.ReturnQuantity = 0;
                utl.Alert.showErrorMsg('Return Qty Should not Exceed than Actual Billed Qty.');
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
                utl.Alert.showErrorMsg('Please Select atleast one item to Return.');
                return false;
            }
        };

        $scope.onLoadConfirmed = function () {
            var returnlines = getReturnSelectionRows();

            $scope.confirmCallback({ ReturnData: returnlines, IsPicked: 1 });
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
                var groupedItems = groupedDispensedItems[gdidx];
                for (var gidx in groupedItems) {
                    var groupedItem = groupedItems[gidx];
                    var G_ItemMasterId = 0;
                    var G_ItemName = '';
                    var G_ItemCode = '';
                    var G_CategoryId = 0;
                    var G_SubCategoryId = 0;
                    var G_ProductTypeId = 0;
                    var G_SubProductTypeId = 0;
                    var G_GenericId = 0;
                    var G_GenericName = '';
                    var G_ManufacturerId = 0;
                    var G_ManufacturerName = '';
                    var G_ScheduleTypeId = 0;
                    var G_ScheduleTypeDescription = '';
                    var G_BaseUomId = 0;
                    var G_SaleUomId = 0;
                    var G_Quantity = 0;
                    var G_ReturnedQuantity = 0;
                    var G_QuantityBeforeReceive = 0;
                    var G_ReturnQuantity = 0;
                    var G_AcceptedQuantity = 0;
                    var G_StockItemId = 0;
                    var G_StockSerialItemId = 0;
                    var G_StoreMasterId = 0;
                    var G_DepartmentId = 0;
                    var G_FacilityId = 0;
                    var G_OrganizationId = 1;
                    var G_BatchId = null;
                    var G_ExpiryDate = null;
                    var G_Ucp = 0;
                    var G_Mrp = 0;
                    var G_Amount = 0;
                    var G_GrossAmount = 0;
                    var G_GrossGstAmount = 0;
                    var G_DiscountModeId = 2;
                    var G_DiscountValue = 0;
                    var G_DiscountAmount = 0;
                    var G_DoctorDiscountAmount = 0;
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
                    var G_NetAmountBeforeGst = 0;
                    var G_NetAmount = 0;
                    var G_DoctorId = 0;
                    var G_DoctorName = null;
                    var G_IsGstDoctor = 0;
                    var G_Comments = null;
                    var G_ServiceTypeId = 0;
                    var G_ServiceGroupId = 0;
                    var G_ServiceCategoryId = 0;
                    var G_MasterName = null;
                    var G_MasterItemId = 0;
                    var G_MasterTypeId = 0;

                    for (var i = 0, len = groupedItem.length; i < len; i++) {
                        var itemqty = 0;
                        var itemreturnedqty = 0;

                        G_ItemMasterId = groupedItem[i].ItemMasterId;
                        G_ItemName = groupedItem[i].ItemName;
                        G_ItemCode = groupedItem[i].ItemCode;
                        G_CategoryId = 0;
                        G_SubCategoryId = 0;
                        G_ProductTypeId = 0;
                        G_SubProductTypeId = 0;
                        G_GenericId = groupedItem[i].GenericId;
                        G_GenericName = groupedItem[i].GenericName;
                        G_ManufacturerId = groupedItem[i].ManufacturerId;
                        G_ManufacturerName = groupedItem[i].ManufacturerName;
                        G_ScheduleTypeId = groupedItem[i].ScheduleTypeId;
                        G_ScheduleTypeDescription = groupedItem[i].ScheduleTypeDescription;
                        G_BaseUomId = 0;
                        G_SaleUomId = 0;
                        if (groupedItem[i].IsPharmacySale == 1 && groupedItem[i].PharmacySaleTypeId == 2) {
                            itemqty = groupedItem[i].Quantity;
                        } else if (groupedItem[i].IsPharmacyReturn == 1 && groupedItem[i].PharmacyReturnTypeId == 2) {
                            itemreturnedqty = groupedItem[i].Quantity;
                        }
                        G_Quantity += itemqty;
                        G_ReturnedQuantity += itemreturnedqty;
                        G_QuantityBeforeReceive = 0;
                        G_ReturnQuantity = 0;
                        G_AcceptedQuantity = 0;
                        G_StockItemId = groupedItem[i].StockItemId;
                        G_StockSerialItemId = groupedItem[i].StockSerialItemId;
                        G_StoreMasterId = 0;
                        G_DepartmentId = groupedItem[i].DepartmentId;
                        G_FacilityId = 0;
                        G_OrganizationId = 1;
                        G_BatchId = groupedItem[i].BatchId;
                        G_ExpiryDate = groupedItem[i].ExpiryDate;
                        G_Ucp = groupedItem[i].Rate;
                        G_Mrp = groupedItem[i].Rate;
                        G_Amount = 0;
                        G_GrossAmount = 0;
                        G_GrossGstAmount = 0;
                        G_DiscountModeId = 2;
                        G_DiscountValue = 0;
                        G_DiscountAmount = 0;
                        G_DoctorDiscountAmount = 0;
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
                        G_NetAmountBeforeGst = 0;
                        G_NetAmount = 0;
                        G_DoctorId = groupedItem[i].DoctorId;
                        G_DoctorName = groupedItem[i].DoctorName;
                        G_IsGstDoctor = 0;
                        G_Comments = null;
                        G_ServiceTypeId = groupedItem[i].ServiceTypeId;
                        G_ServiceGroupId = groupedItem[i].ServiceGroupId;
                        G_ServiceCategoryId = groupedItem[i].ServiceCategoryId;
                        G_MasterName = groupedItem[i].MasterName;
                        G_MasterItemId = groupedItem[i].MasterItemId;
                        G_MasterTypeId = groupedItem[i].MasterTypeId;
                    }

                    var PatientBillDetail = {
                        PatientBillDetailId: 0,
                        PatientBillId: 0,
                        ItemMasterId: G_ItemMasterId,
                        ItemName: G_ItemName,
                        ItemCode: G_ItemCode,
                        CategoryId: G_CategoryId,
                        SubCategoryId: G_SubCategoryId,
                        ProductTypeId: G_ProductTypeId,
                        SubProductTypeId: G_SubProductTypeId,
                        GenericId: G_GenericId,
                        GenericName: G_GenericName,
                        ManufacturerId: G_ManufacturerId,
                        ManufacturerName: G_ManufacturerName,
                        ScheduleTypeId: G_ScheduleTypeId,
                        ScheduleTypeDescription: G_ScheduleTypeDescription,
                        BaseUomId: G_BaseUomId,
                        SaleUomId: G_SaleUomId,
                        Quantity: G_Quantity,
                        ReturnedQuantity: G_ReturnedQuantity,
                        QuantityBeforeReceive: G_QuantityBeforeReceive,
                        ReturnQuantity: G_ReturnQuantity,
                        AcceptedQuantity: G_AcceptedQuantity,
                        StockItemId: G_StockItemId,
                        StockSerialItemId: G_StockSerialItemId,
                        StoreMasterId: G_StoreMasterId,
                        DepartmentId: G_DepartmentId,
                        FacilityId: G_FacilityId,
                        OrganizationId: G_OrganizationId,
                        BatchId: G_BatchId,
                        ExpiryDate: G_ExpiryDate,
                        Ucp: G_Ucp,
                        Mrp: G_Mrp,
                        Amount: G_Amount,
                        GrossAmount: G_GrossAmount,
                        GrossGstAmount: G_GrossGstAmount,
                        DiscountModeId: G_DiscountModeId,
                        DiscountValue: G_DiscountValue,
                        DiscountAmount: G_DiscountAmount,
                        DoctorDiscountAmount: G_DoctorDiscountAmount,
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
                        NetAmountBeforeGst: G_NetAmountBeforeGst,
                        NetAmount: G_NetAmount,
                        DoctorId: G_DoctorId,
                        DoctorName: G_DoctorName,
                        IsGstDoctor: G_IsGstDoctor,
                        Comments: G_Comments,
                        ServiceTypeId: G_ServiceTypeId,
                        ServiceGroupId: G_ServiceGroupId,
                        ServiceCategoryId: G_ServiceCategoryId,
                        MasterName: G_MasterName,
                        MasterItemId: G_MasterItemId,
                        MasterTypeId: G_MasterTypeId,
                        Status: 1
                    }

                    $scope.PatientBillDetails.push(PatientBillDetail);
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
                Params: [
                    { Key: 3, Value: $scope.currentcontext.EncounterId },
                    { Key: 4, Value: 3 },
                    // { Key: 23, Value: 27 },
                    { Key: 24, Value: 1 },
                    { Key: 25, Value: $scope.currentcontext.OTRegisterId }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/patientbilldetails/GetPatientOTPharmacyBillDetails',
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

    pickfromissueListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();