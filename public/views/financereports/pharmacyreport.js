(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacyreportController', pharmacyreportController);

    function pharmacyreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.itemwisesalesprofitreport = function () {
            $state.go('app.itemwisesalesprofitreport')
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
        $scope.pharmacystockreport = function () {
            $state.go('app.pharmacystockreport')
        }
        $scope.pharmacybilldetailreport = function () {
            $state.go('app.pharmacybilldetailreport', { context: 'pharmacyreport' })
        }
        $scope.pharmacydiscountreport = function () {
            $state.go('app.pharmacydiscountreport', { context: 'pharmacyreport' })
        }
        $scope.pharmacycollectionreport = function () {
            $state.go('app.pharmacycollectionreport', { context: 'pharmacyreport' })
        }
        $scope.pharmacyduereport = function () {
            $state.go('app.pharmacyduereport', { context: 'pharmacyreport' })
        }
        $scope.pharmacycollectionsummaryreport = function () {
            $state.go('app.pharmacycollectionsummaryreport', { context: 'pharmacyreport' })
        }
        $scope.pharmacyschedulereport = function () {
            $state.go('app.pharmacyschedulereport', { context: 'pharmacyreport' })
        }
        $scope.pharmacydmschedulereport = function () {
            $state.go('app.pharmacy-schedulereport')
        }
        $scope.pharmacyschedulexreport = function () {
            $state.go('app.pharmacyschedulexreport', { context: 'pharmacyreport' })
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
        $scope.ippharmacyissuevoucherreport = function () {
            $state.go('app.ippharmacyissuevoucherreport', { context: 'pharmacyreport' })
        }
        $scope.ippharmacyreturnvoucherreport = function () {
            $state.go('app.ippharmacyreturnvoucherreport', { context: 'pharmacyreport' })
        }
        $scope.stockstatusreport = function () {
            $state.go('app.stockstatusreport')
        }
        $scope.stockstatusbatchreport = function () {
            $state.go('app.stockstatusbatchreport')
        }
        $scope.stocknonmovementreport = function () {
            $state.go('app.stocknonmovementreport', { context: 'pharmacyreport' })
        } 
        $scope.stockstatusproductsummaryreport = function () {
            $state.go('app.stockstatusproductsummaryreport')
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

    pharmacyreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();