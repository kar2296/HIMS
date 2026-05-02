(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockmanagementreportController', stockmanagementreportController);

    function stockmanagementreportController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.SelectedAssetManageId = 1
        $scope.items = [];
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.patientlist = function () {
            $state.go('app.patientlistreports')
        }
        $scope.collectionreport = function () {
            $state.go('app.collectionreports')
        }
        $scope.dailybills = function () {
            $state.go('app.dailybillreports')
        }
        $scope.discount = function () {
            $state.go('app.discountreports')
        }
        $scope.outstanding = function () {
            $state.go('app.outstandingreports')
        }
        $scope.pharmacyduecollectreport = function () {
            $state.go('app.pharmacyduecollectreport')
        }
        $scope.labsummary = function () {
            $state.go('app.labsummaryreports')
        }
        $scope.collectionreportbyuser = function () {
            $state.go('app.collectionreportbyusers')
        }
        $scope.tatrrep = function () {
            $state.go('app.tatrrep')
        }
        $scope.testmasterprice = function () {
            $state.go('app.testmasterprice')
        }
        $scope.masterprice = function () {
            $state.go('app.itempricedetailsreport', { context: 'pharmacyreports' })
        }
        $scope.testmasterwithparameter = function () {
            $state.go('app.testmasterwithparameter')
        }
        $scope.monthlyrevenuebytest = function () {
            $state.go('app.monthlyrevenuebytest')
        }
        $scope.cancelreport = function () {
            $state.go('app.cancelreport')
        }
        $scope.refundreport = function () {
            $state.go('app.refundreport')
        }
        $scope.usermasterreport = function () {
            $state.go('app.usermasterreport')
        }
        $scope.purchaseorderreport = function () {
            $state.go('app.purchaseorderreport')
        }
        $scope.grnreport = function () {
            $state.go('app.grnreport')
        }
        $scope.pendingporeport = function () {
            $state.go('app.pendingporeport')
        }
        $scope.rackdetailsbystorereport = function () {
            $state.go('app.rackdetailsbystorereport', { context: 'pharmacyreports' })
        }
        $scope.stockissuevocherreport = function () {
            $state.go('app.stockissuevocherreport', { context: 'pharmacyreports' })
        }
        $scope.stockindentreport = function () {
            $state.go('app.stockindentreport', { context: 'pharmacyreports' })
        }
        $scope.medicineexpiryreport = function () {
            $state.go('app.medicineexpiryreport', { context: 'pharmacyreports' })
        }
        $scope.medicineexpiredreport = function () {
            $state.go('app.medicineexpiredreport', { context: 'pharmacyreports' })
        }
        $scope.pharmacystockreport = function () {
            $state.go('app.pharmacystockreport')
        }
        $scope.pharmacybilldetailreport = function () {
            $state.go('app.pharmacybilldetailreport')
        }
        $scope.pharmacydiscountreport = function () {
            $state.go('app.pharmacydiscountreport')
        }
        $scope.pharmacycollectionreport = function () {
            $state.go('app.pharmacycollectionreport')
        }
        $scope.pharmacyduereport = function () {
            $state.go('app.pharmacyduereport')
        }
        $scope.pharmacycollectionsummaryreport = function () {
            $state.go('app.pharmacycollectionsummaryreport')
        }
        $scope.pharmacyschedulereport = function () {
            $state.go('app.pharmacyschedulereport')
        }
        $scope.pharmacydmschedulereport = function () {
            $state.go('app.pharmacy-schedulereport')
        }
        $scope.pharmacyschedulexreport = function () {
            $state.go('app.pharmacyschedulexreport')
        }
        $scope.purchasevendorreport = function () {
            $state.go('app.purchasevendorreport')
        }
        $scope.purchasevendorpendingreport = function () {
            $state.go('app.purchasevendorpendingreport')
        }
        $scope.vendordetailreport = function () {
            $state.go('app.vendordetailreport')
        }
        $scope.itemmasterreport = function () {
            $state.go('app.itemmasterreport', { context: 'pharmacyreports' })
        }
        $scope.suppliermasterreport = function () {
            $state.go('app.suppliermasterreport')
        }
        $scope.storemasterreport = function () {
            $state.go('app.storemasterreport')
        }
        $scope.stockmovementreport = function () {
            $state.go('app.stockmovementreport', { context: 'pharmacyreports' })
        }
        $scope.purchasereturnreport = function () {
            $state.go('app.purchasereturnreport')
        }
        $scope.ippharmacyissuevoucherreport = function () {
            $state.go('app.ippharmacyissuevoucherreport')
        }
        $scope.ippharmacyreturnvoucherreport = function () {
            $state.go('app.ippharmacyreturnvoucherreport')
        }
        $scope.stockstatusreport = function () {
            $state.go('app.stockstatusreport', { context: 'pharmacyreports' })
        }
        $scope.stockstatusbatchreport = function () {
            $state.go('app.stockstatusbatchreport', { context: 'pharmacyreports' })
        }
        $scope.stocknonmovementreport = function () {
            $state.go('app.stocknonmovementreport', { context: 'pharmacyreports' })
        }
        $scope.stockstatusproductsummaryreport = function () {
            $state.go('app.stockstatusproductsummaryreport', { context: 'pharmacyreports' })
        }
        $scope.pharmacycollectionsummarycashier = function () {
            $state.go('app.pharmacycollectionsummarycashier')
        }
        $scope.pharmacyreturnreportforotc = function () {
            $state.go('app.pharmacyreturnreportforotc')
        }
        $scope.pharmacycardcollectionreport = function () {
            $state.go('app.pharmacycardcollectionreport')
        }
        $scope.staffcreditbillreport = function () {
            $state.go('app.staffcreditbillreport')
        }
        $scope.staffpendingpaymentreport = function () {
            $state.go('app.staffpendingpaymentreport')
        }
        $scope.staffcreditreturnreport = function () {
            $state.go('app.staffcreditreturnreport')
        }
        $scope.salesgstreport = function () {
            $state.go('app.salesgstreport')
        }
        $scope.returngstreport = function () {
            $state.go('app.returngstreport')
        }
        $scope.purchasesalesgstreport = function () {
            $state.go('app.purchasesalesgstreport')
        }
        $scope.purchasereturngstreport = function () {
            $state.go('app.purchasereturngstreport')
        }
        $scope.staffcreditsummaryreport = function () {
            $state.go('app.staffcreditsummaryreport')
        }
        $scope.consolidatesalesgstreport = function () {
            $state.go('app.consolidatesalesgstreport')
        }
        $scope.consolidatepurchasegstreport = function () {
            $state.go('app.consolidatepurchasegstreport')
        }
        $scope.stocksummaryproductgstreport = function () {
            $state.go('app.stocksummaryproductgstreport')
        }
        $scope.consolidateinputgstsummary = function () {
            $state.go('app.consolidateinputgstsummary')
        }
        $scope.consolidateoutputgstsummary = function () {
            $state.go('app.consolidateoutputgstsummary')
        }
        $scope.itemwantedlist = function () {
            $state.go('app.itemwantedlist')
        }
        $scope.opticalstockstatusreport = function () {
            $state.go('app.opticalstockstatusreport')
        }

        // $scope.backtoList = function () {
        //     if($scope.Context=='frontoffice'){
        //     $state.go('app.pharmacydashboard');
        //     }else if($scope.Context=='billing'){
        //         $state.go('app.billingsdashboard');
        //     }else if($scope.Context=='nursing'){
        //         $state.go('app.nursingdashboard');
        //     }else if($scope.Context=='pharmacy'){
        //         $state.go('app.pharmacydashboard');
        //     }else if($scope.Context=='store'){
        //         $state.go('app.storedashboard');
        //     }else if($scope.Context=='lab'){
        //         $state.go('app.labdashboard');
        //     }else if($scope.Context=='ris'){
        //         $state.go('app.ris_dashboard');
        //     }
        // }
        $scope.backtoReport = function () {
            $state.go('app.pharmacydashboard')
        };

    }

    stockmanagementreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();