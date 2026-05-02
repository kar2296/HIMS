(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillListController', IPBillListController);

    function IPBillListController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.PatientBillId = 0;
        $scope.EncounterId = 0;
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentfilter = {
            BillNumber: null,
            BillDateTime: utl.Formatter.getCurrentDate(),
            NameMrn: null,
            VisitNumber: null,
            FromDate: null,
            ToDate: null
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            $scope.currentfilter.FromDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.ToDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 23:59:59');
            if (($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) ||
                $scope.currentfilter.BillNumber || $scope.currentfilter.NameMrn) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentfilter.BillNumber },
                        { Key: 4, Value: 3 },
                        { Key: 6, Value: 2 },
                        { Key: 13, Value: $scope.currentfilter.NameMrn },
                        { Key: 19, Value: 2 },
                        { Key: 41, Value: 1 }, // CASH ONLY
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                if ($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) {
                    inputData.Params.push({ Key: 1, Value: [$scope.currentfilter.FromDate, $scope.currentfilter.ToDate] });
                }

                $scope.insurancebillmodified =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'insurancebillmodified');
                if (!$scope.insurancebillmodified) {
                    inputData.Params.push({ Key: 9, Value: 1 });
                }

                var options = {
                    action: 'Billing/PatientBills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.addNew = function () {
            $state.go('app.receipt-form', { id: 0 });
        };

        function receiptPicker(receiptData) {
            $state.go('app.receipt-form', { id: receiptData.rid });
        }

        $scope.pickPatient = function () {
            utl.Modal.open('app.receiptpicker', {
                params: {},
                confirmCallback: receiptPicker
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientPaymentDetails/DeletePatientPaymentDetails',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }

            $scope.getList();
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientBillCategories) {
                var item = $scope.PatientBillCategories[idx];
                result.push(item);
            }
            return result;
        }

        $scope.Modify = function () {
            $scope.item.ModifiedBillNumber = $scope.ModifiedBillNumber;
            $scope.item.ModifiedBillDateTime = $scope.ModifiedBillDateTime;
            $scope.item.PatientBillId = $scope.PatientBillId || 0;
            $scope.item.BillNumber = $scope.BillNumber;
            $scope.item.BillDateTime = $scope.BillDateTime;
            $scope.item.BillTypeId = $scope.BillTypeId || 0;
            $scope.item.BillPriorityId = $scope.BillPriorityId || 0;
            $scope.item.ModifiedBillAmount = $scope.ModifiedBillAmount || 0;
            $scope.item.ModifiedBillDiscount = $scope.ModifiedBillDiscount || 0;
            $scope.item.BillAmount = $scope.BillAmount || 0;
            $scope.item.BillDiscount = $scope.BillDiscount || 0;
            $scope.item.BillDiscountTypeId = $scope.BillDiscountTypeId || 0;
            $scope.item.DiscountApprovedBy = $scope.DiscountApprovedBy || 0;
            $scope.item.BillDiscountModeId = $scope.BillDiscountModeId || 2;
            $scope.item.DiscountModeValue = $scope.DiscountModeValue || 0;
            $scope.item.RoundOffValue = $scope.RoundOffValue || 0;
            $scope.item.BilledCounter = $scope.BilledCounter || 0;
            $scope.item.PaidAmount = $scope.PaidAmount || 0;
            $scope.item.IsPaidFully = $scope.IsPaidFully || 0;
            $scope.item.OutStandingAmount = $scope.OutStandingAmount || 0;
            $scope.item.ServiceTax = $scope.ServiceTax || 0;
            $scope.item.EducationCess = $scope.EducationCess || 0;
            $scope.item.GstAmount = $scope.GstAmount || 0;
            $scope.item.InGstAmount = $scope.InGstAmount || 0;
            $scope.item.CGstAmount = $scope.CGstAmount || 0;
            $scope.item.SGstAmount = $scope.SGstAmount || 0;
            $scope.item.BillGeneratedBy = $scope.BillGeneratedBy || 0;
            $scope.item.BillApprovedBy = $scope.BillApprovedBy || 0;
            $scope.item.BillModifiedBy = $scope.BillModifiedBy || 0;
            $scope.item.IsIntermediateBill = $scope.IsIntermediateBill || 0;
            $scope.item.ParentBillId = $scope.ParentBillId || 0;
            $scope.item.ParentReturnId = $scope.ParentReturnId || 0;
            $scope.item.IsPackageBill = $scope.IsPackageBill || 0;
            $scope.item.PackageDiscount = $scope.PackageDiscount || 0;
            $scope.item.OrganizationId = $scope.OrganizationId || 0;
            $scope.item.FacilityId = $scope.FacilityId || 0;
            $scope.item.DepartmentId = $scope.DepartmentId || 0;
            $scope.item.StoreMasterId = $scope.StoreMasterId || 0;
            $scope.item.PatientId = $scope.PatientId || 0;
            $scope.item.PatientName = $scope.PatientName;
            $scope.item.TitleId = $scope.TitleId || 0;
            $scope.item.GenderId = $scope.GenderId || 0;
            $scope.item.Age = $scope.Age || 0;
            $scope.item.DOB = $scope.DOB;
            $scope.item.Mobile = $scope.Mobile;
            $scope.item.PatientTypeId = $scope.PatientTypeId || 0;
            $scope.item.OTIdentifier = $scope.OTIdentifier;
            $scope.item.EncounterId = $scope.EncounterId || 0;
            $scope.item.EncounterTypeId = $scope.EncounterTypeId || 0;
            $scope.item.AdmissionDate = $scope.AdmissionDate || null;
            $scope.item.DischargeDate = $scope.DischargeDate || null;
            $scope.item.RoomId = $scope.RoomId || 0;
            $scope.item.BedId = $scope.BedId || 0;
            $scope.item.WardId = $scope.WardId || 0;
            $scope.item.OTRoomId = $scope.OTRoomId || 0;
            $scope.item.OTRegisterId = $scope.OTRegisterId || 0;
            $scope.item.ProcedureId = $scope.ProcedureId || 0;
            $scope.item.GuarantorId = $scope.GuarantorId || 0;
            $scope.item.GuarantorTypeId = $scope.GuarantorTypeId || 0;
            $scope.item.GuarantorName = $scope.GuarantorName;
            $scope.item.PrivateDueId = $scope.PrivateDueId || 0;
            $scope.item.GuarantorDueId = $scope.GuarantorDueId || 0;
            $scope.item.FamilyLinkId = $scope.FamilyLinkId || 0;
            $scope.item.TransferEncounterId = $scope.TransferEncounterId || 0;
            $scope.item.TransferPatientId = $scope.TransferPatientId || 0;
            $scope.item.TransferAmount = $scope.TransferAmount || 0;
            $scope.item.ServiceRateCategoryId = $scope.ServiceRateCategoryId || 0;
            $scope.item.ServiceRateCategoryName = $scope.ServiceRateCategoryName;
            $scope.item.TpaId = $scope.TpaId || 0;
            $scope.item.RateCategoryId = $scope.RateCategoryId || 0;
            $scope.item.DoctorId = $scope.DoctorId || 0;
            $scope.item.DoctorName = $scope.DoctorName;
            $scope.item.ReferralId = $scope.ReferralId || 0;
            $scope.item.ReferralName = $scope.ReferralName;
            $scope.item.CancelAmount = $scope.CancelAmount || 0;
            $scope.item.CancelReason = $scope.CancelReason;
            $scope.item.CancelledBy = $scope.CancelledBy || 0;
            $scope.item.Comments = $scope.Comments;
            $scope.item.IsManualBill = $scope.IsManualBill || 0;
            $scope.item.ManualBillNumber = $scope.ManualBillNumber;
            $scope.item.ManualBillDate = $scope.ManualBillDate;
            $scope.item.ManualBillComments = $scope.ManualBillComments;
            $scope.item.PatientBillStatusId = $scope.PatientBillStatusId || 0;
            $scope.item.ModifiedPatientBillStatusId = $scope.ModifiedPatientBillStatusId || 0;
            $scope.item.CreditVocher = $scope.CreditVocher || 0;
            $scope.item.ToBeRefunded = $scope.ToBeRefunded || 0;
            $scope.item.RefundedAmount = $scope.RefundedAmount || 0;
            $scope.item.CNAmount = $scope.CNAmount || 0;
            $scope.item.FSTypeId = $scope.FSTypeId || 0;
            $scope.item.PatientOrderId = $scope.PatientOrderId || 0;
            $scope.item.IsThisPrescription = $scope.IsThisPrescription || 0;
            $scope.item.PrescriptionId = $scope.PrescriptionId || 0;
            $scope.item.IsPharmacyBill = $scope.IsPharmacyBill || 0;
            $scope.item.PharmacySaleTypeId = $scope.PharmacySaleTypeId || 0;
            $scope.item.IsPharmacyReturn = $scope.IsPharmacyReturn || 0;
            $scope.item.PharmacyReturnTypeId = $scope.PharmacyReturnTypeId || 0;
            $scope.item.TDSAmount = $scope.TDSAmount || 0;
            $scope.item.Disallowed = $scope.Disallowed || 0;
            $scope.item.IsClaimed = $scope.IsClaimed || 0;
            $scope.item.IsConsolidatePay = $scope.IsConsolidatePay || 0;
            $scope.item.IsRegCumBill = $scope.IsRegCumBill || 0;
            $scope.item.ChecklistStatusId = $scope.ChecklistStatusId || 0;

            var lines = getLinesForSave();

            var actionName = 'BillModification/ModifiedPatientBills/AddModifiedPatientBills';

            var inputData = { Header: $scope.item, Details: lines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        var groupBy_Bill_Category = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupBy_Bill_Category(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            var BillDetailedItems = [];
            $scope.PatientBillCategories = [];
            if (res.Data && res.Data.length > 0) {
                for (var billidx in res.Data) {
                    var billitem = res.Data[billidx];
                    for (var billitemidx in billitem.PatientBillDetails) {
                        var billdetailitem = billitem.PatientBillDetails[billitemidx];
                        BillDetailedItems.push(billdetailitem);
                    }
                }

                var G_Bill_Categories = groupBy_Bill_Category(BillDetailedItems, ['ServiceCategoryId']);
                for (var gbcidx in G_Bill_Categories) {
                    var G_Bill_Category = G_Bill_Categories[gbcidx];
                    var PatientBillCategory = {
                        ModifiedPatientBillId: 0,
                        PatientBillId: $scope.PatientBillId,
                        EncounterId: $scope.EncounterId,
                        ServiceCategoryId: 0,
                        CategoryGrossAmount: 0,
                        CategoryDiscountAmount: 0,
                        CategoryGstAmount: 0,
                        CategoryNetAmount: 0,
                        SupplementaryGrossAmount: 0,
                        SupplementaryDiscountAmount: 0,
                        SupplementaryGstAmount: 0,
                        SupplementaryNetAmount: 0,
                        GuarantorGrossAmount: 0,
                        GuarantorDiscountAmount: 0,
                        GuarantorGstAmount: 0,
                        GuarantorNetAmount: 0,
                        PatientBillCategoryDetails: [],
                        Status: 1
                    }

                    var ServiceCategoryId = 0;

                    var C_GrossAmount = 0;
                    var C_DiscountAmount = 0;
                    var C_GstAmount = 0;
                    var C_NetAmount = 0;

                    var G_GrossAmount = 0;
                    var G_DiscountAmount = 0;
                    var G_GstAmount = 0;
                    var G_NetAmount = 0;

                    var S_GrossAmount = 0;
                    var S_DiscountAmount = 0;
                    var S_GstAmount = 0;
                    var S_NetAmount = 0;

                    $scope.PatientBillCategoryDetails = [];
                    for (var i = 0, len = G_Bill_Category.length; i < len; i++) {
                        var PatientBillCategoryDetail = {};

                        PatientBillCategoryDetail.ModifiedPatientBillCategoryId = 0;
                        PatientBillCategoryDetail.PatientBillStatusId = G_Bill_Category[i].PatientBillStatusId;
                        PatientBillCategoryDetail.PatientBillDetailId = G_Bill_Category[i].Id;
                        PatientBillCategoryDetail.PatientBillId = G_Bill_Category[i].PatientBillId;
                        PatientBillCategoryDetail.ServiceId = G_Bill_Category[i].ServiceId || 0;
                        PatientBillCategoryDetail.ServiceCode = G_Bill_Category[i].ServiceCode;
                        PatientBillCategoryDetail.ServiceName = G_Bill_Category[i].ServiceName;
                        PatientBillCategoryDetail.ServiceTypeId = G_Bill_Category[i].ServiceTypeId || 0;
                        PatientBillCategoryDetail.ServiceGroupId = G_Bill_Category[i].ServiceGroupId || 0;
                        PatientBillCategoryDetail.ServiceCategoryId = G_Bill_Category[i].ServiceCategoryId || 0;
                        PatientBillCategoryDetail.MasterTypeId = G_Bill_Category[i].MasterTypeId || 0;
                        PatientBillCategoryDetail.MasterItemId = G_Bill_Category[i].MasterItemId || 0;
                        PatientBillCategoryDetail.MasterName = G_Bill_Category[i].MasterName;
                        PatientBillCategoryDetail.AliasId = G_Bill_Category[i].AliasId || 0;
                        PatientBillCategoryDetail.AliasName = G_Bill_Category[i].AliasName;
                        PatientBillCategoryDetail.EncounterId = G_Bill_Category[i].EncounterId || 0;
                        PatientBillCategoryDetail.Quantity = G_Bill_Category[i].Quantity || 0;
                        PatientBillCategoryDetail.ReturnedQuantity = G_Bill_Category[i].ReturnedQuantity || 0;
                        PatientBillCategoryDetail.StockItemId = G_Bill_Category[i].StockItemId || 0;
                        PatientBillCategoryDetail.StockSerialItemId = G_Bill_Category[i].StockSerialItemId || 0;
                        PatientBillCategoryDetail.BatchId = G_Bill_Category[i].BatchId;
                        PatientBillCategoryDetail.ExpiryDate = G_Bill_Category[i].ExpiryDate;
                        PatientBillCategoryDetail.Rate = G_Bill_Category[i].Rate || 0;
                        PatientBillCategoryDetail.Amount = G_Bill_Category[i].Amount || 0;
                        PatientBillCategoryDetail.GrossAmount = G_Bill_Category[i].GrossAmount || 0;
                        PatientBillCategoryDetail.GrossGstAmount = G_Bill_Category[i].GrossGSTAmount || 0;
                        PatientBillCategoryDetail.DiscountPercentage = G_Bill_Category[i].DiscountPercentage || 0;
                        PatientBillCategoryDetail.UnitDiscountAmount = G_Bill_Category[i].UnitDiscountAmount || 0;
                        PatientBillCategoryDetail.DiscountAmount = G_Bill_Category[i].DiscountAmount || 0;
                        PatientBillCategoryDetail.UnitProportionateDiscount = G_Bill_Category[i].UnitProportionateDiscount || 0;
                        PatientBillCategoryDetail.ProportionateDiscount = G_Bill_Category[i].ProportionateDiscount || 0;
                        PatientBillCategoryDetail.DoctorDiscountAmount = G_Bill_Category[i].DoctorDiscountAmount || 0;
                        PatientBillCategoryDetail.EducationCess = G_Bill_Category[i].EducationCess || 0;
                        PatientBillCategoryDetail.GstId = G_Bill_Category[i].GSTId || 0;
                        PatientBillCategoryDetail.GstPercentage = G_Bill_Category[i].GSTPercentage || 0;
                        PatientBillCategoryDetail.UnitGstAmount = G_Bill_Category[i].UnitGSTAmount || 0;
                        PatientBillCategoryDetail.GstAmount = G_Bill_Category[i].GSTAmount || 0;
                        PatientBillCategoryDetail.InGstId = G_Bill_Category[i].InGstId || 0;
                        PatientBillCategoryDetail.InGstPercentage = G_Bill_Category[i].InGstPercentage || 0;
                        PatientBillCategoryDetail.UnitInGstAmount = G_Bill_Category[i].UnitInGstAmount || 0;
                        PatientBillCategoryDetail.InGstAmount = G_Bill_Category[i].InGstAmount || 0;
                        PatientBillCategoryDetail.CGstId = G_Bill_Category[i].CGstId || 0;
                        PatientBillCategoryDetail.CGstPercentage = G_Bill_Category[i].CGstPercentage || 0;
                        PatientBillCategoryDetail.UnitCGstAmount = G_Bill_Category[i].UnitCGstAmount || 0;
                        PatientBillCategoryDetail.CGstAmount = G_Bill_Category[i].CGstAmount || 0;
                        PatientBillCategoryDetail.SGstId = G_Bill_Category[i].SGstId || 0;
                        PatientBillCategoryDetail.SGstPercentage = G_Bill_Category[i].SGstPercentage || 0;
                        PatientBillCategoryDetail.UnitSGstAmount = G_Bill_Category[i].UnitSGstAmount || 0;
                        PatientBillCategoryDetail.SGstAmount = G_Bill_Category[i].SGstAmount || 0;
                        PatientBillCategoryDetail.NetAmountBeforeGst = G_Bill_Category[i].NetAmountBeforeGst || 0;
                        PatientBillCategoryDetail.NetAmount = G_Bill_Category[i].NetAmount || 0;
                        PatientBillCategoryDetail.ReceivedAmount = G_Bill_Category[i].ReceivedAmount || 0;
                        PatientBillCategoryDetail.DoctorId = G_Bill_Category[i].DoctorId || 0;
                        PatientBillCategoryDetail.DoctorName = G_Bill_Category[i].DoctorName;
                        PatientBillCategoryDetail.IsPackageItem = G_Bill_Category[i].IsPackageItem || 0;
                        PatientBillCategoryDetail.PackageId = G_Bill_Category[i].PackageId || 0;
                        PatientBillCategoryDetail.PackageName = G_Bill_Category[i].PackageName;
                        PatientBillCategoryDetail.OrderId = G_Bill_Category[i].OrderId || 0;
                        PatientBillCategoryDetail.OrderDetailId = G_Bill_Category[i].OrderDetailId || 0;
                        PatientBillCategoryDetail.OrderTypeId = G_Bill_Category[i].OrderTypeId || 0;
                        PatientBillCategoryDetail.OrderStatusId = G_Bill_Category[i].OrderStatusId || 0;
                        PatientBillCategoryDetail.OrderDateTime = G_Bill_Category[i].OrderDateTime;
                        PatientBillCategoryDetail.OTRegisterId = G_Bill_Category[i].OTRegisterId || 0;
                        PatientBillCategoryDetail.ProcedureId = G_Bill_Category[i].ProcedureId || 0;
                        PatientBillCategoryDetail.PrescriptionId = G_Bill_Category[i].PrescriptionId || 0;
                        PatientBillCategoryDetail.PrescriptionDetailId = G_Bill_Category[i].PrescriptionDetailId || 0;
                        PatientBillCategoryDetail.PrescriptionTypeId = G_Bill_Category[i].PrescriptionTypeId || 0;
                        PatientBillCategoryDetail.PrescriptionStatusId = G_Bill_Category[i].PrescriptionStatusId || 0;
                        PatientBillCategoryDetail.PrescriptionDate = G_Bill_Category[i].PrescriptionDate;
                        PatientBillCategoryDetail.ServiceRateCategoryId = G_Bill_Category[i].ServiceRateCategoryId || 0;
                        PatientBillCategoryDetail.ServiceRateCategoryName = G_Bill_Category[i].ServiceRateCategoryName;
                        PatientBillCategoryDetail.IsModified = G_Bill_Category[i].IsModified || 0;
                        PatientBillCategoryDetail.IsSupplementary = G_Bill_Category[i].IsSupplementary || 0;
                        PatientBillCategoryDetail.IsBillable = G_Bill_Category[i].IsBillable || 0;
                        PatientBillCategoryDetail.IsPharmacyCredit = G_Bill_Category[i].IsPharmacyCredit || 0;
                        PatientBillCategoryDetail.IsPharmacySale = G_Bill_Category[i].IsPharmacySale || 0;
                        PatientBillCategoryDetail.PharmacySaleTypeId = G_Bill_Category[i].PharmacySaleTypeId || 0;
                        PatientBillCategoryDetail.IsPharmacyReturn = G_Bill_Category[i].IsPharmacyReturn || 0;
                        PatientBillCategoryDetail.PharmacyReturnTypeId = G_Bill_Category[i].PharmacyReturnTypeId || 0;
                        PatientBillCategoryDetail.IsDoctorDiscount = G_Bill_Category[i].IsDoctorDiscount || 0;
                        PatientBillCategoryDetail.IsGstDoctor = G_Bill_Category[i].IsGstDoctor || 0;
                        PatientBillCategoryDetail.StartDateTime = G_Bill_Category[i].StartDateTime;
                        PatientBillCategoryDetail.EndDateTime = G_Bill_Category[i].EndDateTime;
                        PatientBillCategoryDetail.DiscountTypeId = G_Bill_Category[i].DiscountTypeId || 0;
                        PatientBillCategoryDetail.DiscountModeId = G_Bill_Category[i].DiscountModeId || 0;
                        PatientBillCategoryDetail.DiscountAuthorizedBy = G_Bill_Category[i].DiscountAuthorizedBy || 0;
                        PatientBillCategoryDetail.DoctorShare = G_Bill_Category[i].DoctorShare || 0;
                        PatientBillCategoryDetail.ReferalShare = G_Bill_Category[i].ReferalShare || 0;
                        PatientBillCategoryDetail.CNAmount = G_Bill_Category[i].CNAmount || 0;
                        PatientBillCategoryDetail.CancelReason = G_Bill_Category[i].CancelReason;
                        PatientBillCategoryDetail.CancelledBy = G_Bill_Category[i].CancelledBy || 0;
                        PatientBillCategoryDetail.IsInvoicedDoctorShare = G_Bill_Category[i].IsInvoicedDoctorShare || 0;
                        PatientBillCategoryDetail.ItemMasterId = G_Bill_Category[i].ItemMasterId || 0;
                        PatientBillCategoryDetail.ItemCode = G_Bill_Category[i].ItemCode;
                        PatientBillCategoryDetail.ItemName = G_Bill_Category[i].ItemName;
                        PatientBillCategoryDetail.ScheduleTypeId = G_Bill_Category[i].ScheduleTypeId || 0;
                        PatientBillCategoryDetail.ScheduleTypeDescription = G_Bill_Category[i].ScheduleTypeDescription;
                        PatientBillCategoryDetail.GenericId = G_Bill_Category[i].GenericId || 0;
                        PatientBillCategoryDetail.GenericName = G_Bill_Category[i].GenericName;
                        PatientBillCategoryDetail.IsPrescribed = G_Bill_Category[i].IsPrescribed || 0;
                        PatientBillCategoryDetail.ManufacturerId = G_Bill_Category[i].ManufacturerId || 0;
                        PatientBillCategoryDetail.ManufacturerName = G_Bill_Category[i].ManufacturerName;
                        PatientBillCategoryDetail.StoreMasterId = G_Bill_Category[i].StoreMasterId || 0;
                        PatientBillCategoryDetail.DepartmentId = G_Bill_Category[i].DepartmentId || 0;
                        PatientBillCategoryDetail.IsNightCharge = G_Bill_Category[i].IsNightCharge || 0;
                        PatientBillCategoryDetail.Comments = G_Bill_Category[i].Comments;
                        PatientBillCategoryDetail.Status = G_Bill_Category[i].Status;

                        ServiceCategoryId = PatientBillCategoryDetail.ServiceCategoryId;

                        C_GrossAmount += PatientBillCategoryDetail.GrossAmount;
                        C_DiscountAmount += PatientBillCategoryDetail.DiscountAmount;
                        C_GstAmount += PatientBillCategoryDetail.GSTAmount;
                        C_NetAmount += PatientBillCategoryDetail.NetAmount;

                        if (G_Bill_Category[i].IsSupplementary) {
                            S_GrossAmount += PatientBillCategoryDetail.GrossAmount;
                            S_DiscountAmount += PatientBillCategoryDetail.DiscountAmount;
                            S_GstAmount += PatientBillCategoryDetail.GSTAmount;
                            S_NetAmount += PatientBillCategoryDetail.NetAmount;
                        } else {
                            G_GrossAmount += PatientBillCategoryDetail.GrossAmount;
                            G_DiscountAmount += PatientBillCategoryDetail.DiscountAmount;
                            G_GstAmount += PatientBillCategoryDetail.GSTAmount;
                            G_NetAmount += PatientBillCategoryDetail.NetAmount;
                        }

                        $scope.PatientBillCategoryDetails.push(PatientBillCategoryDetail);
                    }

                    PatientBillCategory.ModifiedPatientBillId = 0;
                    PatientBillCategory.PatientBillId = $scope.PatientBillId;
                    PatientBillCategory.EncounterId = $scope.EncounterId;
                    PatientBillCategory.ServiceCategoryId = ServiceCategoryId;
                    PatientBillCategory.CategoryGrossAmount = C_GrossAmount;
                    PatientBillCategory.CategoryDiscountAmount = C_DiscountAmount;
                    PatientBillCategory.CategoryGstAmount = C_GstAmount;
                    PatientBillCategory.CategoryNetAmount = C_NetAmount;
                    PatientBillCategory.SupplementaryGrossAmount = S_GrossAmount;
                    PatientBillCategory.SupplementaryDiscountAmount = S_DiscountAmount;
                    PatientBillCategory.SupplementaryGstAmount = S_GstAmount;
                    PatientBillCategory.SupplementaryNetAmount = S_NetAmount;
                    PatientBillCategory.GuarantorGrossAmount = G_GrossAmount;
                    PatientBillCategory.GuarantorDiscountAmount = G_DiscountAmount;
                    PatientBillCategory.GuarantorGstAmount = G_GstAmount;
                    PatientBillCategory.GuarantorNetAmount = G_NetAmount;
                    PatientBillCategory.PatientBillCategoryDetails = $scope.PatientBillCategoryDetails;
                    PatientBillCategory.Status = 1;

                    $scope.PatientBillCategories.push(PatientBillCategory);
                }

                $scope.Modify();
            }
        };

        $scope.getBillInfoByBillId = function () {
            var SearchBillId = $scope.item.PatientBillId;
            var SearchEncounterId = $scope.item.EncounterId;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [
                        { Key: 4, Value: 3 },
                        { Key: 6, Value: 3 },
                        { Key: 16, Value: SearchEncounterId }
                    ],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else { }
        };

        $scope.onModifyConfirmed = function () {
            $scope.item.IsModified = 1;
            $scope.getBillInfoByBillId();
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'modify') {
                $scope.item.PatientBillId = entity.Id;
                $scope.item.EncounterId = entity.EncounterId;
                $scope.ModifiedBillNumber = entity.BillNumber;
                $scope.ModifiedBillDateTime = utl.Formatter.getCurrentDate();
                $scope.PatientBillId = entity.Id;
                $scope.BillNumber = entity.BillNumber;
                $scope.BillDateTime = entity.BillDateTime;
                $scope.BillTypeId = entity.BillTypeId;
                $scope.BillPriorityId = entity.BillPriorityId;
                $scope.ModifiedBillAmount = entity.BillAmount;
                $scope.ModifiedBillDiscount = entity.BillDiscount;
                $scope.BillAmount = entity.BillAmount;
                $scope.BillDiscount = entity.BillDiscount;
                $scope.BillDiscountTypeId = entity.BillDiscountTypeId;
                $scope.DiscountApprovedBy = entity.DiscountApprovedBy;
                $scope.BillDiscountModeId = entity.BillDiscountModeId;
                $scope.DiscountModeValue = entity.DiscountModeValue;
                $scope.RoundOffValue = entity.RoundOffValue;
                $scope.BilledCounter = entity.BilledCounter;
                $scope.PaidAmount = entity.PaidAmount;
                $scope.IsPaidFully = entity.IsPaidFully;
                $scope.OutStandingAmount = entity.OutStandingAmount;
                $scope.ServiceTax = entity.ServiceTax;
                $scope.EducationCess = entity.EducationCess;
                $scope.GstAmount = entity.GstAmount;
                $scope.InGstAmount = entity.InGstAmount;
                $scope.CGstAmount = entity.CGstAmount;
                $scope.SGstAmount = entity.SGstAmount;
                $scope.BillGeneratedBy = entity.BillGeneratedBy;
                $scope.BillApprovedBy = entity.BillApprovedBy;
                $scope.BillModifiedBy = entity.BillModifiedBy;
                $scope.IsIntermediateBill = entity.IsIntermediateBill;
                $scope.ParentBillId = entity.ParentBillId;
                $scope.ParentReturnId = entity.ParentReturnId;
                $scope.IsPackageBill = entity.IsPackageBill;
                $scope.PackageDiscount = entity.PackageDiscount;
                $scope.OrganizationId = entity.OrganizationId;
                $scope.FacilityId = entity.FacilityId;
                $scope.DepartmentId = entity.DepartmentId;
                $scope.StoreMasterId = entity.StoreMasterId;
                $scope.PatientId = entity.PatientId;
                $scope.PatientName = entity.PatientName;
                $scope.TitleId = entity.TitleId;
                $scope.GenderId = entity.GenderId;
                $scope.Age = entity.Age;
                $scope.DOB = entity.DOB;
                $scope.Mobile = entity.Mobile;
                $scope.PatientTypeId = entity.PatientTypeId;
                $scope.OTIdentifier = entity.OTIdentifier;
                $scope.EncounterId = entity.EncounterId;
                $scope.EncounterTypeId = entity.EncounterTypeId;
                if (entity.Encounter) {
                    $scope.AdmissionDate = entity.Encounter.AdmissionDate;
                    $scope.DischargeDate = entity.Encounter.DischargeDate;
                }
                $scope.RoomId = entity.RoomId;
                $scope.BedId = entity.BedId;
                $scope.WardId = entity.WardId;
                $scope.OTRoomId = entity.OTRoomId;
                $scope.OTRegisterId = entity.OTRegisterId;
                $scope.ProcedureId = entity.ProcedureId;
                $scope.GuarantorId = entity.GuarantorId;
                $scope.GuarantorTypeId = entity.GuarantorTypeId;
                $scope.GuarantorName = entity.GuarantorName;
                $scope.PrivateDueId = entity.PrivateDueId;
                $scope.GuarantorDueId = entity.GuarantorDueId;
                $scope.FamilyLinkId = entity.FamilyLinkId;
                $scope.TransferEncounterId = entity.TransferEncounterId;
                $scope.TransferPatientId = entity.TransferPatientId;
                $scope.TransferAmount = entity.TransferAmount;
                $scope.ServiceRateCategoryId = entity.ServiceRateCategoryId;
                $scope.ServiceRateCategoryName = entity.ServiceRateCategoryName;
                $scope.TpaId = entity.TpaId;
                $scope.RateCategoryId = entity.RateCategoryId;
                $scope.DoctorId = entity.DoctorId;
                $scope.DoctorName = entity.DoctorName;
                $scope.ReferralId = entity.ReferralId;
                $scope.ReferralName = entity.ReferralName;
                $scope.CancelAmount = entity.CancelAmount;
                $scope.CancelReason = entity.CancelReason;
                $scope.CancelledBy = entity.CancelledBy;
                $scope.Comments = entity.Comments;
                $scope.IsManualBill = entity.IsManualBill;
                $scope.ManualBillNumber = entity.ManualBillNumber;
                $scope.ManualBillDate = entity.ManualBillDate;
                $scope.ManualBillComments = entity.ManualBillComments;
                $scope.PatientBillStatusId = entity.PatientBillStatusId;
                $scope.ModifiedPatientBillStatusId = entity.ModifiedPatientBillStatusId;
                $scope.CreditVocher = entity.CreditVocher;
                $scope.ToBeRefunded = entity.ToBeRefunded;
                $scope.RefundedAmount = entity.RefundedAmount;
                $scope.CNAmount = entity.CNAmount;
                $scope.FSTypeId = entity.FSTypeId;
                $scope.PatientOrderId = entity.PatientOrderId;
                $scope.IsThisPrescription = entity.IsThisPrescription;
                $scope.PrescriptionId = entity.PrescriptionId;
                $scope.IsPharmacyBill = entity.IsPharmacyBill;
                $scope.PharmacySaleTypeId = entity.PharmacySaleTypeId;
                $scope.IsPharmacyReturn = entity.IsPharmacyReturn;
                $scope.PharmacyReturnTypeId = entity.PharmacyReturnTypeId;
                $scope.TDSAmount = entity.TDSAmount;
                $scope.Disallowed = entity.Disallowed;
                $scope.IsClaimed = entity.IsClaimed;
                $scope.IsConsolidatePay = entity.IsConsolidatePay;
                $scope.IsRegCumBill = entity.IsRegCumBill;
                $scope.ChecklistStatusId = entity.ChecklistStatusId;

                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billmodifications.ipbill.modifymsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onModifyConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "BillNumber", displayName: $translate.instant('billmodifications.ipbill.billnumber.lbl') },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('billmodifications.ipbill.billdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime '></ngformatdate>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientmrn.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{entity.Patient.MRN}}</a>' + '</div>'
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>{{entity.Patient.LastName}}</a>' + '</div>'
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientagegender.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billmodifications.ipbill.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billmodifications.ipbill.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billmodifications.ipbill.dueamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <a class="grid-action" ng-click="handleEvents(\'modify\',entity)" \
                                        translate="common.modifyaction.lbl" ng-show="entity.IsModified == 0"></a>\
                                    </div>',
                                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" }
            ]
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

    IPBillListController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();