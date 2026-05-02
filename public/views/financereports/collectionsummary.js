(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('collectionsummaryController', collectionsummaryController);

    function collectionsummaryController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.discountreports', { context: 'collectionsummary' })
        }
        $scope.doctorinvtds = function () {
            $state.go('app.doctorinvtds')
        }
        $scope.collectiondetailbycashierreport = function () {
            $state.go('app.collectiondetailbycashierreport')
        }
        $scope.billingservice = function () {
            $state.go('app.serviceitemreport')
        }
        $scope.billingpackage = function () {
            $state.go('app.packagedetails')
        }
        $scope.billingGroup = function () {
            $state.go('app.servicegroupdetails')
        }
        $scope.outstandingreports = function () {
            $state.go('app.outstandingreports', { context: 'collectionsummary' })
        }
        $scope.labsummary = function () {
            $state.go('app.labsummaryreports')
        }
        $scope.ipdue = function () {
            $state.go('app.ipduereportprivate', { context: 'collectionsummary' })
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
        $scope.testmasterwithparameter = function () {
            $state.go('app.testmasterwithparameter')
        }
        $scope.monthlyrevenuebytest = function () {
            $state.go('app.monthlyrevenuebytest')
        }
        $scope.cancelreport = function () {
            $state.go('app.cancelreport', { context: 'collectionsummary' })
        }
        $scope.refundreport = function () {
            $state.go('app.refundreport', { context: 'collectionsummary' })
        }
        $scope.generalexpensereport = function () {
            $state.go('app.generalexpensereport', { context: 'collectionsummary' })
        }
        $scope.insurancereceiptreport = function () {
            $state.go('app.insurancereceiptreport', { context: 'collectionsummary' })
        }
        $scope.insurancepaymentdetailswithpatient = function () {
            $state.go('app.insurancepaymentdetailswithpatient', { context: 'collectionsummary' })
        }
        $scope.insurancetdsreport = function () {
            $state.go('app.insurancetdsreport', { context: 'collectionsummary' })
        }
        $scope.insurancedisallowancereport = function () {
            $state.go('app.insurancedisallowancereport', { context: 'collectionsummary' })
        }
        $scope.ipinsurancereport = function () {
            $state.go('app.ipinsurancereport', { context: 'collectionsummary' })
        }
        $scope.ipdiscountreport = function () {
            $state.go('app.ipdiscountreport', { context: 'collectionsummary' })
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
        $scope.pharmacystockreport = function () {
            $state.go('app.pharmacystockreport')
        }
        $scope.pharmacybilldetailreport = function () {
            $state.go('app.pharmacybilldetailreport')
        }
        $scope.opbillreport = function () {
            $state.go('app.opbillreport', { context: 'collectionsummary' })
        }
        $scope.directbillreport = function () {
            $state.go('app.directbillreport', { context: 'collectionsummary' })
        }
        $scope.ipbillreport = function () {
            $state.go('app.ipbillreport', { context: 'collectionsummary' })
        }
        $scope.collectiondetailbycashierreport = function () {
            $state.go('app.collectiondetailbycashierreport', { context: 'collectionsummary' })
        }
        $scope.ipcollectiondetailbycashierreport = function () {
            $state.go('app.ipcollectiondetailbycashierreport', { context: 'collectionsummary' })
        }
        $scope.currentoccupancyreport = function () {
            $state.go('app.currentoccupancyreport', { context: 'collectionsummary' })
        }
        $scope.iprefundreport = function () {
            $state.go('app.iprefundreport', { context: 'collectionsummary' })
        }
        $scope.ipcancelreport = function () {
            $state.go('app.ipcancelreport', { context: 'collectionsummary' })
        }
        $scope.collectionsummaryopip = function () {
            $state.go('app.collectionsummaryopip', { context: 'collectionsummary' })
        }
        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', { context: 'collectionsummary' })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'collectionsummary' })
        }
        $scope.revenuesummarybycategory = function () {
            $state.go('app.revenuesummarybycategory')
        }
        $scope.revenuesummarybydoctor = function () {
            $state.go('app.revenuesummarybydoctor')
        }
        $scope.revenuesummarybydept = function () {
            $state.go('app.revenuesummarybydept')
        }
        $scope.doctorinvoicereport = function () {
            $state.go('app.doctorinvoicereport')
        }
        $scope.doctorpaymentreport = function () {
            $state.go('app.doctorpaymentreport')
        }
        $scope.outstandingpaymentreport = function () {
            $state.go('app.outstandingpaymentreport')
        }
        $scope.itemwisecollectionsummaryipreport = function () {
            $state.go('app.itemwisecollectionsummaryipreport', { context: 'collectionsummary' })
        }
        $scope.doctorrevenuereport = function () {
            $state.go('app.doctorrevenuereport')
        }
        $scope.surgeryreport = function () {
            $state.go('app.surgeryschedulereports');
        }
        $scope.surgeryentry = function () {
            $state.go('app.surgeryentryreports');
        }
        $scope.surgeryprocedure = function () {
            $state.go('app.surgeryschedulebyprocedure');
        }
        $scope.irdsalesreport = function () {
            $state.go('app.irdsalesreport')
        }
        $scope.userwisecollectionsummary = function () {
            $state.go('app.userwisecollectionsummary', { context: 'collectionsummary' })
        }
        $scope.backtoList = function () {
            // if ($scope.Context == 'frontoffice') {
            //     $state.go('app.frontdashboard');
            // } else if ($scope.Context == 'billing') {
            $state.go('app.billingsdashboard');
            // } else if ($scope.Context == 'nursing') {
            //     $state.go('app.nursingdashboard');
            // } else if ($scope.Context == 'pharmacy') {
            //     $state.go('app.pharmacydashboard');
            // } else if ($scope.Context == 'store') {
            //     $state.go('app.storedashboard');
            // } else if ($scope.Context == 'lab') {
            //     $state.go('app.labdashboard');
            // } else if ($scope.Context == 'ris') {
            //     $state.go('app.ris_dashboard');
            // }
        }

    }
    collectionsummaryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();