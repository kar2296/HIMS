(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('revenuesummaryreportController', revenuesummaryreportController);

    function revenuesummaryreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.itemwisecollectionsummaryopreport = function () {
            $state.go('app.itemwisecollectionsummaryopreport', { context: 'revenuesummary' })
        }
        $scope.discount = function () {
            $state.go('app.discountreports')
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
            $state.go('app.outstandingreports')
        }
        $scope.labsummary = function () {
            $state.go('app.labsummaryreports')
        }
        $scope.ipdue = function () {
            $state.go('app.ipduereportprivate')
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
            $state.go('app.cancelreport')
        }
        $scope.refundreport = function () {
            $state.go('app.refundreport')
        }
        $scope.generalexpensereport = function () {
            $state.go('app.generalexpensereport')
        }
        $scope.ipinsurancereport = function () {
            $state.go('app.ipinsurancereport');
        }
        $scope.ipdiscountreport = function () {
            $state.go('app.ipdiscountreport')
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
            $state.go('app.opbillreport')
        }
        $scope.directbillreport = function () {
            $state.go('app.directbillreport')
        }
        $scope.ipbillreport = function () {
            $state.go('app.ipbillreport')
        }
        $scope.collectiondetailbycashierreport = function () {
            $state.go('app.collectiondetailbycashierreport')
        }
        $scope.ipcollectiondetailbycashierreport = function () {
            $state.go('app.ipcollectiondetailbycashierreport')
        }
        $scope.currentoccupancyreport = function () {
            $state.go('app.currentoccupancyreport')
        }
        $scope.iprefundreport = function () {
            $state.go('app.iprefundreport')
        }
        $scope.ipcancelreport = function () {
            $state.go('app.ipcancelreport')
        }
        $scope.collectionsummaryopip = function () {
            $state.go('app.collectionsummaryopip')
        }
        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', { context: 'billingreport' })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'billingreport' })
        }
        $scope.revenuesummarybycategory = function () {
            $state.go('app.revenuesummarybycategory', { context: 'revenuesummary' })
        }
        $scope.revenuesummarybydoctor = function () {
            $state.go('app.revenuesummarybydoctor', { context: 'revenuesummary' })
        }
        $scope.revenuesummarybydept = function () {
            $state.go('app.revenuesummarybydept', { context: 'revenuesummary' })
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
            $state.go('app.itemwisecollectionsummaryipreport', { context: 'revenuesummary' })
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
        $scope.insuranceagingreport = function () {
            $state.go('app.insuranceagingreport', { context: 'revenuesummary' })
        }
        $scope.dailyrevbybillingreport = function () {
            $state.go('app.dailyrevbybillingreport');
        }
        $scope.backtoList = function () {
            $state.go('app.billingsdashboard');
        }

    }
    revenuesummaryreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();