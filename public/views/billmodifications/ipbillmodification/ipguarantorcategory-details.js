(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPGuarantorCategoryDetailsController', IPGuarantorCategoryDetailsController);

    function IPGuarantorCategoryDetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;
        $scope.SupplementaryDetails = [];
        $scope.CategoryTotalAmt = 0;
        $scope.AfterReducedTotalAmt = 0;
        $scope.ReducedTotalAmt = 0;
        if (modalConfig && modalConfig.params) {
            $scope.PatientId = modalConfig.params.pid;
            $scope.EncounterId = modalConfig.params.eid;
            $scope.CategoryId = modalConfig.params.cid;
            $scope.ReceiveAMT = modalConfig.params.ireceiveamt;
            $scope.PatientBillId = modalConfig.params.PatientBillId;
            $scope.DoctorId = modalConfig.params.DoctorId;
            $scope.DOA = modalConfig.params.DOA;
            $scope.DOD = modalConfig.params.DOD;
            $scope.GuarantorId = modalConfig.params.GuarantorId;
            $scope.GuarantorTypeId = modalConfig.params.GuarantorTypeId;
            $scope.TotBillAmt = modalConfig.params.TotNetAmount;
            $scope.TotBillDiscAmt = modalConfig.params.TotDiscAmount;
            try {
                $scope.ReceiveAMT = parseFloat($scope.ReceiveAMT);
            } catch (ex) { $scope.ReceiveAMT = modalConfig.params.ireceiveamt; }

            $scope.ServiceCategoryName = modalConfig.params.categoryname;
            $scope.IsSupplementary = modalConfig.params.issupplementary;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


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
            $scope.AfterReducedCalculateTotalAmt();
        };

        $scope.AfterReducedCalculateTotalAmt = function () {
            $scope.AfterReducedTotalAmt = 0;
            for (var idx in $scope.SupplementaryDetails) {
                var item = $scope.SupplementaryDetails[idx];
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
                            $scope.AfterReducedTotalAmt += item.Rate * item.Quantity;
                        } else {
                            $scope.AfterReducedTotalAmt += item.GrossAmount - item.DiscountAmount;
                        }
                    }
                }
            }

            $scope.ReducedTotalAmt = $scope.CategoryTotalAmt - $scope.AfterReducedTotalAmt;

        }

        $scope.CalculateTotalAmt = function () {
            $scope.CategoryTotalAmt = 0;
            for (var idx in $scope.SupplementaryDetails) {
                var item = $scope.SupplementaryDetails[idx];
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
                            $scope.CategoryTotalAmt += item.Rate * item.Quantity;
                        } else {
                            $scope.CategoryTotalAmt += item.GrossAmount - item.DiscountAmount;
                        }
                    }
                }
            }
            $scope.AfterReducedTotalAmt = $scope.CategoryTotalAmt;
        };


        $scope.update = function () {
            // if ($scope.ReducedTotalAmt <= 0 || $scope.ReducedTotalAmt > $scope.ReceiveAMT) {
            //     var Msg = 'Reduced Amount should not greater than Cash Received Amount';
            //     utl.Alert.showErrorMsg(Msg);
            //     return false;
            // } else {
                for (var idx in $scope.SupplementaryDetails) {
                    var item = $scope.SupplementaryDetails[idx];
                    item.TotBillAmt = parseFloat($scope.TotBillAmt) - parseFloat($scope.ReducedTotalAmt);
                    item.TotBillDiscAmt = $scope.TotBillDiscAmt;
                    item.Final_PatientBillId = $scope.PatientBillId;
                    item.DOA = $scope.DOA;
                    item.DOD = $scope.DOD;
                    item.GuarantorId = $scope.GuarantorId;
                    item.GuarantorTypeId = $scope.GuarantorTypeId;
                    item.ReducedTotalAmt = $scope.ReducedTotalAmt;
                }
                var actionName = 'billing/PatientbillDetails/UpdateInsuranceBillModifed';
                var options = {
                    action: actionName,
                    data: $scope.SupplementaryDetails,
                    type: 'post',
                    onComplete: $scope.updateCallback
                };
                utl.Http.doAction(options);
            //}
        };

        $scope.updateCallback = function (scope, data, options, hasError) {
            $scope.confirmCallback({
                method: 'refresh', categoryid: $scope.CategoryId,
                categoryname: $scope.ServiceCategoryName
            });
        };

        $scope.deleteBill = function (index, bill) {
            bill.Status = 2;
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.SupplementaryDetails = [];
            $timeout(function () {
                $scope.SupplementaryDetails = data.Data;
                $scope.CalculateTotalAmt();
            }, 1000);
        };



        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 3 },
                    { Key: 3, Value: $scope.EncounterId },
                    { Key: 5, Value: $scope.CategoryId },
                    { Key: 12, Value: true }
                ]
            };

            var options = {
                action: 'Billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getList();



    }

    IPGuarantorCategoryDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter', '$timeout'];

})();