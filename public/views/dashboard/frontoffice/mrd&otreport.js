(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('mrd&otreportController', mrd&otreportController);

    function mrd&otreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.wardandbedlist = function () {
            $state.go('app.wardandbedlistreport')
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
        $scope.opserviceitemreport = function () {
            $state.go('app.opserviceitemreport')
        }
        $scope.ipserviceitemreport = function () {
            $state.go('app.ipserviceitemreport')
        }
        $scope.availablebeds = function () {
            $state.go('app.availablebedsreports')
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
        $scope.pharmacydiscountreport = function () {
            $state.go('app.pharmacydiscountreport')
        }
        $scope.pharmacyduereport = function () {
            $state.go('app.pharmacyduereport')
        }
        $scope.pharmacyreturnreport = function () {
            $state.go('app.pharmacyreturnreport')
        }
        $scope.pharmacyschedulereport = function () {
            $state.go('app.pharmacyschedulereport')
        }
        $scope.pharmacyschedulexreport = function () {
            $state.go('app.pharmacyschedulexreport')
        }
        $scope.pharmacycardcollectionreport = function () {
            $state.go('app.pharmacycardcollectionreport')
        }
        $scope.pharmacycollectionreport = function () {
            $state.go('app.pharmacycollectionreport')
        }
        $scope.pharmacyrefundreport = function () {
            $state.go('app.pharmacyrefundreport')
        }
        $scope.pharmacycollectionsummaryreport = function () {
            $state.go('app.pharmacycollectionsummaryreport')
        }
        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', { context: 'ipopreport' })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'ipopreport' })
        }
        $scope.bedtransferreport = function () {
            $state.go('app.bedtransferreport')
        }
        $scope.outpatientreport = function () {
            $state.go('app.outpatientreport')
        }
        $scope.inactivepatientreport = function () {
            $state.go('app.inactivepatientreport')
        }
        $scope.ipadmissioninsurancereport = function () {
            $state.go('app.ipadmissioninsurancereport')
        }
        $scope.doctorlistreport = function () {
            $state.go('app.doctorlistreport')
        }
        $scope.insurancelistreport = function () {
            $state.go('app.insurancelistreport')
        }
        $scope.ipreferraldoctorreport = function () {
            $state.go('app.ipreferraldoctorreport')
        }
        $scope.opreferraldoctorreport = function () {
            $state.go('app.opreferraldoctorreport')
        }
        $scope.ipoccupancyreport = function () {
            $state.go('app.ipoccupancyreport')
        }
        $scope.outpatientsummaryreport = function () {
            $state.go('app.outpatientsummaryreport')
        }
        $scope.ipoccupancybyward = function () {
            $state.go('app.ipoccupancybyward')
        }
        $scope.ipadmissionsummarybydoctor = function () {
            $state.go('app.ipadmissionsummarybydoctor')
        }
        $scope.outpatientsummarybydoctor = function () {
            $state.go('app.outpatientsummarybydoctor')
        }
        $scope.outpatientsummarybyinsurance = function () {
            $state.go('app.outpatientsummarybyinsurance')
        }
        $scope.ipadmissionsummarybyinsurance = function () {
            $state.go('app.ipadmissionsummarybyinsurance')
        }
        $scope.departmentlistreport = function () {
            $state.go('app.departmentlistreport')
        }
        $scope.diagnosissummaryforippatient = function () {
            $state.go('app.diagnosissummaryforippatient')
        }
        $scope.otschedulereport = function () {
            $state.go('app.otschedulereport', { context: 'mrdandotreports' })
        }
        $scope.surgeryentryreports = function () {
            $state.go('app.surgeryentryreports', { context: 'mrdandotreports' })
        }
        // $scope.backtoList = function () {
        //     if ($scope.Context == 'frontoffice') {
        //         $state.go('app.frontdashboard');
        //     } else if ($scope.Context == 'billing') {
        //         $state.go('app.billingsdashboard');
        //     } else if ($scope.Context == 'nursing') {
        //         $state.go('app.nursingdashboard');
        //     } else if ($scope.Context == 'pharmacy') {
        //         $state.go('app.pharmacydashboard');
        //     } else if ($scope.Context == 'store') {
        //         $state.go('app.storedashboard');
        //     } else if ($scope.Context == 'lab') {
        //         $state.go('app.labdashboard');
        //     } else if ($scope.Context == 'ris') {
        //         $state.go('app.ris_dashboard');
        //     }
        // }
        $scope.backtoList = function () {
            $state.go('app.frontdashboard');
        }
    }
    mrd&otreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();