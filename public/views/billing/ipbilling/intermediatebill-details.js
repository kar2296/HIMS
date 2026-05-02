(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('intermediatebillDetailsController', intermediatebillDetailsController);

    function intermediatebillDetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;

        $scope.IntermediateBillDetails = [];
        $scope.IntermediateReturnDetails = [];
        $scope.IsPharmacyBill = -1;
        $scope.TotalBillAmount = 0;
        $scope.TotalReturnAmount = 0;
        $scope.TotalAmount = 0;

        if (modalConfig && modalConfig.params) {
            $scope.PatientId = modalConfig.params.pid;
            $scope.EncounterId = modalConfig.params.eid;
            $scope.CategoryId = modalConfig.params.cid;
            $scope.ServiceCategoryName = modalConfig.params.categoryname;
            $scope.IsSupplementary = modalConfig.params.issupplementary;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getPharmacyBillListCallback = function (scope, data, options, hasError) {
            $scope.IntermediateBillDetails = [];
            var totalbillamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];

                totalbillamount = totalbillamount + (item.BillAmount)
                $scope.IntermediateBillDetails.push(item);
            }
            $scope.TotalBillAmount = totalbillamount;
            $scope.TotalAmount = $scope.TotalBillAmount + 0;
        };

        $scope.getPharmacyBillList = function () {
            if ($scope.CategoryId == 49) {
                $scope.IsPharmacyBill = 1;
            }
            var inputData = {
                Params: [
                    { Key: 4, Value: 3 },
                    { Key: 6, Value: 3 },
                    { Key: 16, Value: $scope.EncounterId },
                    { Key: 19, Value: 2 },
                    { Key: 21, Value: $scope.IsPharmacyBill }
                ]
            };

            var options = {
                action: 'Billing/PatientBills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPharmacyBillListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPharmacyReturnListCallback = function (scope, data, options, hasError) {
            $scope.IntermediateReturnDetails = [];
            var totalreturnamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.BillAmount = -1 * item.BillAmount;

                totalreturnamount = totalreturnamount + (item.BillAmount)
                $scope.IntermediateReturnDetails.push(item);
            }
            $scope.TotalReturnAmount = totalreturnamount;
            $scope.TotalAmount = $scope.TotalAmount + $scope.TotalReturnAmount;
        };

        $scope.getPharmacyReturnList = function () {
            if ($scope.CategoryId == 49) {
                $scope.IsPharmacyReturn = 1;
            }
            var inputData = {
                Params: [
                    { Key: 4, Value: 3 },
                    { Key: 6, Value: 3 },
                    { Key: 16, Value: $scope.EncounterId },
                    { Key: 19, Value: 2 },
                    { Key: 41, Value: $scope.IsPharmacyReturn }
                ]
            };

            var options = {
                action: 'Billing/PatientBills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPharmacyReturnListCallback
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

        $scope.getListCallback = function (scope, data, options, hasError) {
            var BillDetailedItems = [];
            $scope.ClaimServiceCategoryBills = [];
            $scope.SelfServiceCategoryBills = [];
            $scope.ServiceCategoryBills = [];
            for (var billidx in data.Data) {
                var billitem = data.Data[billidx];
                for (var billdetailidx in billitem.PatientBillDetails) {
                    var billdetailitem = billitem.PatientBillDetails[billdetailidx];
                    billdetailitem.BillDateTime = $filter('date')(billitem.BillDateTime, 'dd-MMM-yyyy');
                    billdetailitem.Comments = billitem.BillNumber;
                    billdetailitem.DoctorName = billitem.DoctorName;
                    BillDetailedItems.push(billdetailitem);
                }
            }

            var groupedBillCategorys = groupBy_Bill_Category(BillDetailedItems, ['ServiceCategoryId', 'Comments']);
            for (var groupbillcatidx in groupedBillCategorys) {
                var cb_totalamount = 0;
                var sb_totalamount = 0;
                if ($scope.CategoryId == parseInt(groupbillcatidx)) {
                    var groupedBills = groupedBillCategorys[groupbillcatidx];
                    for (var groupedbillidx in groupedBills) {
                        var groupedbill = groupedBills[groupedbillidx];
                        var CB_BillDateTime = null;
                        var CB_PatientBillId = 0;
                        var CB_BillNumber = '';
                        var CB_Doctor = '';
                        var CB_Amount = 0;
                        var CB_Discount = 0;
                        var CB_NetAmount = 0;

                        var SB_BillDateTime = null;
                        var SB_PatientBillId = 0;
                        var SB_BillNumber = '';
                        var SB_Doctor = '';
                        var SB_Amount = 0;
                        var SB_Discount = 0;
                        var SB_NetAmount = 0;

                        for (var i = 0, len = groupedbill.length; i < len; i++) {
                            var cb_itemamount = 0;
                            var cb_itemdiscountamount = 0;
                            var cb_itemnetamount = 0;

                            var sb_itemamount = 0;
                            var sb_itemdiscountamount = 0;
                            var sb_itemnetamount = 0;

                            if (groupedbill[i].IsSupplementary) {
                                sb_itemamount = groupedbill[i].Amount;
                                sb_itemdiscountamount = groupedbill[i].DiscountAmount;
                                sb_itemnetamount = groupedbill[i].NetAmount;

                                SB_BillDateTime = groupedbill[i].BillDateTime;
                                SB_PatientBillId = groupedbill[i].PatientBillId;
                                SB_BillNumber = groupedbill[i].Comments;
                                SB_Doctor = groupedbill[i].DoctorName;
                                SB_Amount += sb_itemamount;
                                SB_Discount += sb_itemdiscountamount;
                                SB_NetAmount += sb_itemnetamount;

                                sb_totalamount += sb_itemnetamount;
                            } else {
                                cb_itemamount = groupedbill[i].Amount;
                                cb_itemdiscountamount = groupedbill[i].DiscountAmount;
                                cb_itemnetamount = groupedbill[i].NetAmount;

                                CB_BillDateTime = groupedbill[i].BillDateTime;
                                CB_PatientBillId = groupedbill[i].PatientBillId;
                                CB_BillNumber = groupedbill[i].Comments;
                                CB_Doctor = groupedbill[i].DoctorName;
                                CB_Amount += cb_itemamount;
                                CB_Discount += cb_itemdiscountamount;
                                CB_NetAmount += cb_itemnetamount;

                                cb_totalamount += cb_itemnetamount;
                            }
                        }

                        var ClaimServiceCategoryBill = {
                            BillDateTime: CB_BillDateTime, PatientBillId: CB_PatientBillId, BillNumber: CB_BillNumber,
                            DoctorName: CB_Doctor, Amount: CB_Amount,
                            Discount: CB_Discount, NetAmount: CB_NetAmount, Status: 1
                        }
                        if (Math.abs(ClaimServiceCategoryBill.NetAmount) > 0) {
                            $scope.ClaimServiceCategoryBills.push(ClaimServiceCategoryBill);
                        }

                        var SelfServiceCategoryBill = {
                            BillDateTime: SB_BillDateTime, PatientBillId: SB_PatientBillId, BillNumber: SB_BillNumber,
                            DoctorName: SB_Doctor, Amount: SB_Amount,
                            Discount: SB_Discount, NetAmount: SB_NetAmount, Status: 1
                        }
                        if (Math.abs(SelfServiceCategoryBill.NetAmount) > 0) {
                            $scope.SelfServiceCategoryBills.push(SelfServiceCategoryBill);
                        }
                    }

                    if ($scope.IsSupplementary) {
                        $scope.ServiceCategoryBills = $scope.SelfServiceCategoryBills.sort($scope.custom_sort);
                        $scope.TotalAmount = sb_totalamount;
                    } else {
                        $scope.ServiceCategoryBills = $scope.ClaimServiceCategoryBills.sort($scope.custom_sort);
                        $scope.TotalAmount = cb_totalamount;
                    }
                }
            }
        };

        $scope.custom_sort = function (a, b) {
            if (a.PatientBillId < b.PatientBillId)
                return -1;
            if (a.PatientBillId > b.PatientBillId)
                return 1;
            return 0;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 3 },
                    { Key: 6, Value: 3 },
                    { Key: 16, Value: $scope.EncounterId },
                    { Key: 19, Value: 2 }
                ]
            };

            var options = {
                action: 'Billing/PatientBills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            /*
            if ($scope.CategoryId == 49) {
                $scope.getPharmacyBillList();
                $scope.getPharmacyReturnList();
            } else {
                $scope.getList();
            }
            */
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

    intermediatebillDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter', '$timeout'];

})();