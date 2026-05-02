(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPSupplementaryCategoryDetailsController', IPSupplementaryCategoryDetailsController);

    function IPSupplementaryCategoryDetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;
        $scope.SupplementaryCategoryDetails = [];
        if (modalConfig && modalConfig.params) {
            $scope.PatientId = modalConfig.params.pid;
            $scope.PatientBillCategoryId = modalConfig.params.id;
            $scope.EncounterId = modalConfig.params.eid;
            $scope.PatientBillId = modalConfig.params.bid;
            $scope.ModifiedPatientBillId = modalConfig.params.mbid;
            $scope.CategoryId = modalConfig.params.cid;
            $scope.ServiceCategoryName = modalConfig.params.cname;
            $scope.IsGuarantor = modalConfig.params.isguarantor;
            $scope.IsSupplementary = modalConfig.params.issupplementary;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.deleteSupplementaryCategoryDetail = function (idx, selectedItem) {
            if (selectedItem.ServiceId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.ServiceId > 0) {
                item.Status = 2;
            }
        };

        $scope.computeAmount = function (index, item) {
            if (item.ServiceId > 0) {
                if (item.Quantity > 0) {
                    if (item.Rate > 0) {
                        item.Amount = item.Rate * item.Quantity;
                        item.GrossAmount = item.Rate * item.Quantity;
                    } else {
                        item.Amount = 0;
                        item.GrossAmount = 0;
                    }
                } else {
                    item.Amount = 0;
                    item.GrossAmount = 0;
                }
                if (item.DiscountAmount == undefined || isNaN(item.DiscountAmount) || item.DiscountAmount == null) {
                    item.DiscountAmount = 0;
                } else {
                    if (item.GrossAmount < item.DiscountAmount) {
                        utl.Alert.showErrorMsg('Enter a Valid Item Amount');
                        item.DiscountAmount = 0;
                        item.NetAmount = item.Rate * item.Quantity;
                    } else {
                        item.NetAmount = item.GrossAmount - item.DiscountAmount;
                    }
                }
            }
        };

        $scope.updateSupplementaryCategoryDetails = function () {
            $scope.ModifiedPatientBillCategoryDetails = [];
            var CategoryId = 0;
            var CategoryGrossAmount = 0;
            var CategoryDiscountAmount = 0;
            var CategoryGstAmount = 0;
            var CategoryNetAmount = 0;

            var C_GuarantorGrossAmount = 0;
            var C_GuarantorDiscountAmount = 0;
            var C_GuarantorGstAmount = 0;
            var C_GuarantorNetAmount = 0;

            var C_SupplementaryGrossAmount = 0;
            var C_SupplementaryDiscountAmount = 0;
            var C_SupplementaryGstAmount = 0;
            var C_SupplementaryNetAmount = 0;

            for (var idx in $scope.SupplementaryCategoryDetails) {
                var item = $scope.SupplementaryCategoryDetails[idx];
                var c_grossamount = 0;
                var c_discountamount = 0;
                var c_gstamount = 0;
                var c_netamount = 0;

                var g_grossamount = 0;
                var g_discountamount = 0;
                var g_gstamount = 0;
                var g_netamount = 0;

                var s_grossamount = 0;
                var s_discountamount = 0;
                var s_gstamount = 0;
                var s_netamount = 0;

                if (item.ServiceId > 0) {
                    CategoryId = item.ServiceCategoryId;
                    if (item.Status == 1) {
                        c_grossamount = item.GrossAmount;
                        c_discountamount = 0;
                        c_gstamount = 0;
                        c_netamount = item.NetAmount;

                        CategoryGrossAmount += c_grossamount;
                        CategoryDiscountAmount += 0;
                        CategoryGstAmount += 0;
                        CategoryNetAmount += c_netamount;

                        if (item.IsSupplementary == 1) {
                            s_grossamount = item.GrossAmount;
                            s_discountamount = 0;
                            s_gstamount = 0;
                            s_netamount = item.NetAmount;

                            C_SupplementaryGrossAmount += s_grossamount;
                            C_SupplementaryDiscountAmount += 0;
                            C_SupplementaryGstAmount += 0;
                            C_SupplementaryNetAmount += s_netamount;
                        } else {
                            g_grossamount = item.GrossAmount;
                            g_discountamount = 0;
                            g_gstamount = 0;
                            g_netamount = item.NetAmount;

                            C_GuarantorGrossAmount += g_grossamount;
                            C_GuarantorDiscountAmount += 0;
                            C_GuarantorGstAmount += 0;
                            C_GuarantorNetAmount += g_netamount;
                        }
                    }
                    $scope.ModifiedPatientBillCategoryDetails.push(item);
                }
            }

            $scope.ModifiedPatientBillCategorys = [];
            var ModifiedPatientBillCategory = {
                Id: $scope.PatientBillCategoryId,
                ModifiedPatientBillId: $scope.ModifiedPatientBillId,
                PatientBillId: $scope.PatientBillId,
                EncounterId: $scope.EncounterId,
                ServiceCategoryId: CategoryId,
                CategoryGrossAmount: CategoryGrossAmount,
                CategoryDiscountAmount: CategoryDiscountAmount,
                CategoryGstAmount: CategoryGstAmount,
                CategoryNetAmount: CategoryNetAmount,
                GuarantorGrossAmount: C_GuarantorGrossAmount,
                GuarantorDiscountAmount: 0,
                GuarantorGstAmount: 0,
                GuarantorNetAmount: C_GuarantorNetAmount,
                SupplementaryGrossAmount: C_SupplementaryGrossAmount,
                SupplementaryDiscountAmount: 0,
                SupplementaryGstAmount: 0,
                SupplementaryNetAmount: C_SupplementaryNetAmount,
                ModifiedPatientBillCategoryDetails: $scope.ModifiedPatientBillCategoryDetails,
                Status: 1
            }

            $scope.ModifiedPatientBillCategorys.push(ModifiedPatientBillCategory);

            $scope.ModifiedPatientBill = {};
            $scope.ModifiedPatientBill.Id = $scope.ModifiedPatientBillId;

            $scope.saveItem();

        };

        $scope.saveItem = function () {
            var actionName = 'BillModification/ModifiedPatientBills/ModifiyPatientBillDetails';
            var inputData = { Header: $scope.ModifiedPatientBill, Details: $scope.ModifiedPatientBillCategorys };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.ModifiedPatientBillId = options.data.Data.Header.Id;
            } else {
                $scope.ModifiedPatientBillId = data;
            }
            $scope.confirmCallback({
                ModifiedPatientBillId: $scope.ModifiedPatientBillId
            });
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.SupplementaryCategoryDetails = [];
            $timeout(function () {
                $scope.SupplementaryCategoryDetails = data.Data;
            }, 1000);
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.PatientBillCategoryId },
                    { Key: 2, Value: $scope.ModifiedPatientBillId },
                    { Key: 6, Value: $scope.EncounterId },
                    { Key: 7, Value: 3 },
                    { Key: 8, Value: $scope.CategoryId },
                    { Key: 12, Value: true }
                ]
            };

            var options = {
                action: 'BillModification/ModifiedPatientBillCategoryDetails/GetModifiedPatientBillCategoryDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    IPSupplementaryCategoryDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter', '$timeout'];

})();