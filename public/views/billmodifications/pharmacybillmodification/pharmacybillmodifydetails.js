(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyBillModifyDetailController', PharmacyBillModifyDetailController);

    function PharmacyBillModifyDetailController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;
        $scope.PatientBillDetails = [];
        $scope.CategoryTotalAmt = 0;
        $scope.AfterReducedTotalAmt = 0;
        $scope.ReducedTotalAmt = 0;
        $scope.ReducedAmt = 0;
        if (modalConfig && modalConfig.params) {
            $scope.PatientId = modalConfig.params.pid;
            $scope.EncounterId = modalConfig.params.eid;
            $scope.ReceiveAMT = modalConfig.params.ireceiveamt;
            $scope.PatientBillId = modalConfig.params.PatientBillId;
            $scope.TotBillAmt = modalConfig.params.TotNetAmount;
            $scope.TotBillDiscAmt = modalConfig.params.TotDiscAmount;
            $scope.TotGstAmount = modalConfig.params.TotGstAmount;
            $scope.TotInGstAmount = modalConfig.params.TotInGstAmount;
            $scope.TotCGstAmount = modalConfig.params.TotCGstAmount;
            $scope.TotSGstAmount = modalConfig.params.TotSGstAmount;
            try {
                $scope.ReceiveAMT = parseFloat($scope.ReceiveAMT).toFixed(2);
            } catch (ex) {
                $scope.ReceiveAMT = parseFloat(modalConfig.params.ireceiveamt).toFixed(2);
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.computeAmount = function (index, item) {
            if (item.ServiceId > 0) {
                item.TotGstAmt = 0;
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
                        item.UnitPrice = parseFloat(item.GrossAmount) - parseFloat(item.DiscountAmount);
                        item.UnitGSTAmount = parseFloat((item.UnitPrice / 100) * item.GSTPercentage);
                        item.UnitInGstAmount = parseFloat((item.UnitPrice / 100) * item.InGstPercentage);
                        item.UnitCGstAmount = parseFloat((item.UnitPrice / 100) * item.CGstPercentage);
                        item.UnitSGstAmount = parseFloat((item.UnitPrice / 100) * item.SGstPercentage);

                        item.GSTAmount = parseFloat(item.UnitGSTAmount);
                        item.InGstAmount = parseFloat(item.UnitInGstAmount);
                        item.CGstAmount = parseFloat(item.UnitCGstAmount);
                        item.SGstAmount = parseFloat(item.UnitSGstAmount);
item.NetAmountBeforeGST = item.NetAmount-item.GSTAmount;
                        item.TotGstAmt += item.GSTAmount;
                        item.TotInGstAmount += item.InGstAmount;
                        item.TotCGstAmount += item.CGstAmount;
                        item.TotSGstAmt += item.SGstAmount;
                    }
                }
            }
            $scope.AfterReducedCalculateTotalAmt();
        };

        $scope.AfterReducedCalculateTotalAmt = function () {
            $scope.AfterReducedTotalAmt = 0;
            $scope.AfterReducedAmt = 0;
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
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
                            $scope.AfterReducedAmt += item.Rate * item.Quantity;
                            $scope.AfterReducedTotalAmt = parseFloat($scope.AfterReducedAmt).toFixed(2);
                        } else {
                            $scope.AfterReducedAmt += item.GrossAmount - item.DiscountAmount;
                            $scope.AfterReducedTotalAmt = parseFloat($scope.AfterReducedAmt).toFixed(2);
                        }
                    }
                }
            }

            $scope.ReducedAmt = parseFloat($scope.CategoryTotalAmt) - parseFloat($scope.AfterReducedTotalAmt);
            $scope.ReducedTotalAmt = parseFloat($scope.ReducedAmt).toFixed(2);
        }

        $scope.CalculateTotalAmt = function () {
            $scope.CategoryTotalAmt = 0;
            $scope.BfrGstAmt = 0;
            $scope.CategoryAmt = 0;
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if (item.ServiceId > 0) {
                    if (item.Quantity > 0) {
                        if (item.Rate > 0) {
                            item.Amount = item.Rate * item.Quantity;
                            item.GrossAmount = item.Rate * item.Quantity;
                            item.UnitPrice = parseFloat(((item.Rate) * (item.GSTPercentage / 100)).toFixed(2));
                            item.UnitGSTAmount = parseFloat(((item.UnitPrice / 100) * item.GSTPercentage).toFixed(2));
                            item.GSTAmount = parseFloat((item.UnitGSTAmount * item.Quantity).toFixed(2));
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
                            $scope.CategoryAmt += item.Rate * item.Quantity;
                            $scope.BfrGstAmt += item.GSTAmount;
                        } else {
                            $scope.CategoryAmt += item.GrossAmount - item.DiscountAmount;
                            $scope.BfrGstAmt += item.GSTAmount;
                            // $scope.CategoryTotalAmt = parseFloat($scope.CategoryAmt).toFixed(2);
                        }
                    }
                }
            }
            $scope.CategoryTotalAmt = parseFloat($scope.CategoryAmt).toFixed(2);
            $scope.AfterReducedTotalAmt = parseFloat($scope.CategoryTotalAmt).toFixed(2);
        };


        $scope.update = function () {
            var itemgst = 0;
            var itemingst = 0;
            var itemcgst = 0;
            var itemsgst = 0;
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                item.TotBillAmt = parseFloat($scope.TotBillAmt) - parseFloat($scope.ReducedTotalAmt);
                item.BillDiscountModeId = 1;
                item.TotBillDiscAmt = $scope.TotBillDiscAmt + parseFloat(item.DiscountAmount);
                item.Final_PatientBillId = $scope.PatientBillId;
                item.ReducedTotalAmt = $scope.ReducedTotalAmt;
                item.NetAmount = item.GrossAmount - item.DiscountAmount;

                item.UnitGSTAmount = parseFloat(((item.NetAmount / 100) * item.GSTPercentage).toFixed(2));
                item.GSTAmount = parseFloat((item.UnitGSTAmount).toFixed(2));
                itemgst += item.GSTAmount;
                item.TotGstAmount = itemgst;

                item.UnitInGstAmount = parseFloat(((item.NetAmount / 100) * item.InGstPercentage).toFixed(2));
                item.InGstAmount = parseFloat((item.UnitInGstAmount).toFixed(2));
                itemingst += item.InGstAmount;
                item.TotInGstAmount = itemingst;

                item.UnitCGstAmount = parseFloat(((item.NetAmount / 100) * item.CGstPercentage).toFixed(2));
                item.CGstAmount = parseFloat((item.UnitCGstAmount).toFixed(2));
                itemcgst += item.CGstAmount;
                item.TotCGstAmount = itemcgst;

                item.UnitSGstAmount = parseFloat(((item.NetAmount / 100) * item.SGstPercentage).toFixed(2));
                item.SGstAmount = parseFloat((item.UnitSGstAmount).toFixed(2));
                itemsgst += item.SGstAmount;
                item.TotSGstAmount = itemsgst;
            }
            var actionName = 'billing/PatientbillDetails/UpdateInsuranceBillModifed';
            var options = {
                action: actionName,
                data: $scope.PatientBillDetails,
                type: 'post',
                onComplete: $scope.updateCallback
            };
            utl.Http.doAction(options);
            //}
        };

        $scope.updateCallback = function (scope, data, options, hasError) {
            $scope.confirmCallback({
                method: 'refresh',
                categoryid: $scope.CategoryId,
                categoryname: $scope.ServiceCategoryName
            });
        };

        $scope.deleteBill = function (index, bill) {
            bill.Status = 2;
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.PatientBillDetails = [];
            for (var idx in data.Data) {
                var saleditem = data.Data[idx];
                if (saleditem.DiscountModeId == 2) {
                    if (saleditem.DiscountPercentage) {
                        saleditem.DiscountAmount = parseFloat(((parseFloat(saleditem.DiscountPercentage) / 100) * saleditem.Amount).toFixed(2));
                        // saleditem.DiscountAmount = saleditem.DiscountPercentage;
                    }
                }
                if (saleditem.DiscountModeId == 1) {
                    if (saleditem.DiscountAmount) {
                        saleditem.DiscountAmount = saleditem.DiscountAmount;
                    }
                }
                if (saleditem.ProportionateDiscount) {
                    saleditem.DiscountAmount = saleditem.ProportionateDiscount;
                }
                $scope.PatientBillDetails.push(saleditem);
            }
            // $scope.PatientBillDetails = data.Data;
            $timeout(function () {
                $scope.CalculateTotalAmt();
            }, 1000);
        };


        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.PatientBillId
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
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

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.getList();

    }

    PharmacyBillModifyDetailController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter', '$timeout'];

})();