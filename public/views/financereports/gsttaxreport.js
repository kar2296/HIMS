(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('gstreportController', gstreportController);

    function gstreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.itempricedetailsreport')
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
        $scope.stockissuevocherreport = function () {
            $state.go('app.stockissuevocherreport')
        }
        $scope.stockindentreport = function () {
            $state.go('app.stockindentreport')
        }
        $scope.medicineexpiryreport = function () {
            $state.go('app.medicineexpiryreport')
        }
        $scope.medicineexpiredreport = function () {
            $state.go('app.medicineexpiredreport')
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
            $state.go('app.itemmasterreport')
        }
        $scope.suppliermasterreport = function () {
            $state.go('app.suppliermasterreport')
        }
        $scope.storemasterreport = function () {
            $state.go('app.storemasterreport')
        }
        $scope.stockmovementreport = function () {
            $state.go('app.stockmovementreport')
        }
        $scope.purchasereturnreport = function () {
            $state.go('app.purchasereturnreport')
        }
        $scope.stockstatusreport = function () {
            $state.go('app.stockstatusreport')
        }
        $scope.stockstatusbatchreport = function () {
            $state.go('app.stockstatusbatchreport')
        }
        $scope.stocknonmovementreport = function () {
            $state.go('app.stocknonmovementreport')
        } 
        $scope.stockstatusproductsummaryreport = function () {
            $state.go('app.stockstatusproductsummaryreport')
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
            $state.go('app.stocknonmovementreport')
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
            $state.go('app.salesgstreport', { context: 'gsttaxreport' })
        }
        $scope.returngstreport = function () {
            $state.go('app.returngstreport', { context: 'gsttaxreport' })
        }
        $scope.purchasesalesgstreport = function () {
            $state.go('app.purchasesalesgstreport', { context: 'gsttaxreport' })
        }
        $scope.purchasereturngstreport = function () {
            $state.go('app.purchasereturngstreport', { context: 'gsttaxreport' })
        }
        $scope.staffcreditsummaryreport = function () {
            $state.go('app.staffcreditsummaryreport')
        }
        $scope.consolidatesalesgstreport = function () {
            $state.go('app.consolidatesalesgstreport', { context: 'gsttaxreport' })
        }
        $scope.consolidatepurchasegstreport = function () {
            $state.go('app.consolidatepurchasegstreport', { context: 'gsttaxreport' })
        }
        $scope.stocksummaryproductgstreport = function () {
            $state.go('app.stocksummaryproductgstreport', { context: 'gsttaxreport' })
        }
        $scope.consolidateinputgstsummary = function () {
            $state.go('app.consolidateinputgstsummary', { context: 'gsttaxreport' })
        }
        $scope.consolidateoutputgstsummary = function () {
            $state.go('app.consolidateoutputgstsummary', { context: 'gsttaxreport' })
        }
        $scope.overallconsolidategst = function () {
            $state.go('app.overallconsolidategst', { context: 'gsttaxreport' })
        }
        $scope.backtoReport = function () {
            $state.go('app.financereporttab.gsttaxreport')
        };
    }
    gstreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();