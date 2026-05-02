(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RevenueReportController', RevenueReportController);

    function RevenueReportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.ipadmissionreport', {
                context: 'billingreport'
            })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', {
                context: 'billingreport'
            })
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
            $state.go('app.itemwisecollectionsummaryipreport', {
                context: 'revenuereport'
            })
        }
        $scope.itemwisecollectionsummaryopandipreport = function () {
            $state.go('app.itemwisecollectionsummaryopandipreport', {
                context: 'revenuereport'
            })
        }
        $scope.itemwisecollectionsummaryopreport = function () {
            $state.go('app.itemwisecollectionsummaryopreport', {
                context: 'revenuereport'
            })
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
        $scope.referraldoctorrevenuedetailsreport = function () {
            $state.go('app.referraldoctorrevenuedetailsreport', {
                context: 'revenuereport'
            })
        }
        $scope.departmenttestwiserevenuereport = function () {
            $state.go('app.departmenttestwiserevenuereport', {
                context: 'revenuereport'
            })
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
    RevenueReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();