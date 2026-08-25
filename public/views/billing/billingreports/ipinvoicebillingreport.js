(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillingReportController', IPBillingReportController);

    function IPBillingReportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.ipduereportprivate', { context: 'ipinvoicebillingreport' })
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
            $state.go('app.ipinsurancereport', { context: 'ipinvoicebillingreport' })
        }
        $scope.ipdiscountreport = function () {
            $state.go('app.ipdiscountreport', { context: 'ipinvoicebillingreport' })
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
            $state.go('app.ipbillreport', { context: 'ipinvoicebillingreport' })
        }
        $scope.collectiondetailbycashierreport = function () {
            $state.go('app.collectiondetailbycashierreport')
        }
        $scope.ipcollectiondetailbycashierreport = function () {
            $state.go('app.ipcollectiondetailbycashierreport', { context: 'ipinvoicebillingreport' })
        }
        $scope.currentoccupancyreport = function () {
            $state.go('app.currentoccupancyreport', { context: 'ipinvoicebillingreport' })
        }
        $scope.iprefundreport = function () {
            $state.go('app.iprefundreport', { context: 'ipinvoicebillingreport' })
        }
        $scope.ipcancelreport = function () {
            $state.go('app.ipcancelreport', { context: 'ipinvoicebillingreport' })
        }
        $scope.collectionsummaryopip = function () {
            $state.go('app.collectionsummaryopip')
        }
        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', { context: 'ipinvoicebillingreport' })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'ipinvoicebillingreport' })
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
            $state.go('app.itemwisecollectionsummaryipreport')
        }
        $scope.itemwisecollectionsummaryopreport = function () {
            $state.go('app.itemwisecollectionsummaryopreport')
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
        $scope.opipcollectionsummarybycashier = function () {
            $state.go('app.opipcollectionsummarybycashier');
        }
        $scope.opcollectionsummarybycashier = function () {
            $state.go('app.opcollectionsummarybycashier');
        }
        $scope.ipcollectionsummarybycashier = function () {
            $state.go('app.ipcollectionsummarybycashier');
        }
        $scope.overallcollectionsummary = function () {
            $state.go('app.overallcollectionsummary');
        }
        $scope.overallcollectioncashier = function () {
            $state.go('app.overallcollectioncashier');
        }
        $scope.insurancecreditsummary = function () {
            $state.go('app.insurancecreditsummary');
        }
        $scope.insuranceoutstandingsummary = function () {
            $state.go('app.insuranceoutstandingsummary');
        }
        $scope.revenuesummarybyserviceitem = function () {
            $state.go('app.revenuesummarybyserviceitem')
        }
        $scope.opduecollectreport = function () {
            $state.go('app.opduecollectreport')
        }
        $scope.ipduecollectreport = function () {
            $state.go('app.ipduecollectreport')
        }
        $scope.ipoccupancyreportwithadvance = function () {
            $state.go('app.ipoccupancyreportwithadvance',{ context: 'ipinvoicebillingreport' })
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

        // ---- React bridge (UI-MODERNIZATION RETROFIT) ----
        // No async data here -- visibility of each of the 12 real report
        // rows is privilege-gated via the real HasAccess()
        // (utl.Ctrl.getPrivilegeCtrl), called here and passed through as
        // booleans rather than reimplemented. The ~48 other $state.go
        // functions on this controller have no UI trigger in the real
        // template and are intentionally not covered by this bridge -- see
        // the disclosure comment in BillingIpInvoiceReportScreen.tsx.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                canIpBillReport: $scope.HasAccess('CollectionReportsForIP', 'ipbillreport'),
                canIpCollectionDetailByCashier: $scope.HasAccess('CollectionReportsForIP', 'ipcollectiondetailbycashierreport'),
                canIpCollectionSummaryByCashier: $scope.HasAccess('CollectionReportsForIP', 'ipcollectionsummarybycashier'),
                canIpRefundReport: $scope.HasAccess('CollectionReportsForIP', 'iprefundreport'),
                canIpDueCollectReport: $scope.HasAccess('CollectionReportsForIP', 'ipduecollectreport'),
                canCurrentOccupancyReport: $scope.HasAccess('CollectionReportsForIP', 'currentoccupancyreport'),
                canIpCancelReport: $scope.HasAccess('CollectionReportsForIP', 'ipcancelreport'),
                canIpDiscountReport: $scope.HasAccess('CollectionReportsForIP', 'ipdiscountreport'),
                canIpInsuranceReport: $scope.HasAccess('CollectionReportsForIP', 'ipinsurancereport'),
                canIpDue: $scope.HasAccess('CollectionReportsForIP', 'ipdue'),
                canIpAdmissionReport: $scope.HasAccess('CollectionReportsForIP', 'ipadmissionreport'),
                canIpDischargeReport: $scope.HasAccess('CollectionReportsForIP', 'ipdischargereport'),
                canIpOccupancyReportWithAdvance: $scope.HasAccess('CollectionReportsForIP', 'ipoccupancyreportwithadvance')
            };
        };
        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName) {
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

    }
    IPBillingReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();