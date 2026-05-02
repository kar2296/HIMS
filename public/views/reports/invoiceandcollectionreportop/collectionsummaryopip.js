(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CollectionSummaryOPIPController', CollectionSummaryOPIPController);

    function CollectionSummaryOPIPController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),

        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.custom_sort = function (a, b) {
            if (b.Value && a.Value && b.Value.DisplayOrder && a.Value.DisplayOrder)
                return a.Value.DisplayOrder - b.Value.DisplayOrder;
            else
                return 0;
        }
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.CollectionSummary = [];
            $scope.FacilityInfo = res;
            if (res.billoprefund) {
                for (var idx in res.billoprefund)
                    $scope.FacilityInfo.billreceipt.push(res.billoprefund[idx]);
            }
            if (res.docshare) {
                for (var idx in res.docshare)
                    $scope.FacilityInfo.billreceipt.push(res.docshare[idx]);
            }
            if (res.billing) {
                for (var idx in res.billing)
                    $scope.FacilityInfo.billreceipt.push(res.billing[idx]);
            }
            if ($scope.FacilityInfo.billreceipt)
                $scope.FacilityInfo.billreceipt.sort($scope.custom_sort);
            for (var idx in $scope.FacilityInfo.billreceipt) {
                var collectionbill = $scope.FacilityInfo.billreceipt[idx];
                if (collectionbill.Key != 'Net Amount OP' && collectionbill.Key != 'Net Amount IP') {
                    $scope.CollectionSummary.push(collectionbill);
                } else if (collectionbill.Key == 'Net Amount OP') {
                    collectionbill.Value.CashAmount = collectionbill.Value.CashAmount - $scope.CollectionSummary[2].Value.CashAmount;
                    collectionbill.Value.CardAmount = collectionbill.Value.CardAmount - $scope.CollectionSummary[2].Value.CardAmount;
                    collectionbill.Value.OtherAmount = collectionbill.Value.OtherAmount - $scope.CollectionSummary[2].Value.OtherAmount;
                    collectionbill.Value.UPIAmount = collectionbill.Value.UPIAmount - $scope.CollectionSummary[2].Value.UPIAmount;
                    collectionbill.Value.BillAmount = collectionbill.Value.BillAmount - $scope.CollectionSummary[2].Value.BillAmount;
                    $scope.CollectionSummary.push(collectionbill);
                } else if (collectionbill.Key == 'Net Amount IP') {
                    collectionbill.Value.CashAmount = collectionbill.Value.CashAmount - $scope.FacilityInfo.billreceipt[8].Value.CashAmount;
                    collectionbill.Value.CardAmount = collectionbill.Value.CardAmount - $scope.FacilityInfo.billreceipt[8].Value.CardAmount;
                    collectionbill.Value.OtherAmount = collectionbill.Value.OtherAmount - $scope.FacilityInfo.billreceipt[8].Value.OtherAmount;
                    collectionbill.Value.UPIAmount = collectionbill.Value.UPIAmount - $scope.FacilityInfo.billreceipt[8].Value.UPIAmount;
                    collectionbill.Value.BillAmount = collectionbill.Value.BillAmount - $scope.FacilityInfo.billreceipt[8].Value.BillAmount;
                    $scope.CollectionSummary.push(collectionbill);
                }
            }
            $scope.totalbillcollection = {
                TotalBillAmt: 0,
                TotalDiscAmt: 0,
                TotalCashAmt: 0,
                TotalCardAmt: 0,
                TotalOtherAmt: 0,
                TotalUPIAmt: 0,
                Key: '',
            }
            var totalopcollection = $scope.CollectionSummary[4].Value;
            var totalipcollection = $scope.CollectionSummary[10].Value;
            var doccollection = $scope.CollectionSummary[11].Value;
            $scope.totalbillcollection.Key = 'Total';
            $scope.totalbillcollection.TotalDiscAmt = ($scope.CollectionSummary[12].Value.BillDiscount + $scope.CollectionSummary[13].Value.BillDiscount) ;
            $scope.totalbillcollection.TotalBillAmt = (totalopcollection.BillAmount + totalipcollection.BillAmount) - (doccollection.BillAmount);
            $scope.totalbillcollection.TotalCashAmt = (totalopcollection.CashAmount + totalipcollection.CashAmount) - (doccollection.CashAmount);
            $scope.totalbillcollection.TotalCardAmt = (totalopcollection.CardAmount + totalipcollection.CardAmount) - (doccollection.CardAmount);
            $scope.totalbillcollection.TotalOtherAmt = (totalopcollection.OtherAmount + totalipcollection.OtherAmount) - (doccollection.OtherAmount);
            $scope.totalbillcollection.TotalUPIAmt = (totalopcollection.UPIAmount + totalipcollection.UPIAmount) - (doccollection.UPIAmount);

        };

        $scope.GetFacilityDashboardOptions = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }
            $scope.currentcontext.FromDate = $scope.currentfilter.From;
            $scope.currentcontext.ToDate = $scope.currentfilter.To;

            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'billreceipt'
                    },
                    {
                        Key: 'billoprefund'
                    },
                    {
                        Key: 'docshare'
                    },
                    {
                        Key: 'billing'
                    }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardsReport',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $scope.currentfilter.From;
            var To = $scope.currentfilter.To;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                }
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintCollectionSummaryOPIP',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'opinvoicebillingreport') {
                $state.go('app.billingreportstab.opinvoicebillingreport');
            }
            if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }

        };


        // $scope.LoadDashboard = function () {
        //     $scope.GetFacilityDashboardOptions();
        // }
        // $scope.LoadDashboard();
    }

    CollectionSummaryOPIPController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();