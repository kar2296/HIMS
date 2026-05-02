(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('outpatientreportController', outpatientreportController);

    function outpatientreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.patientlistreports', {
                context: 'outpatientreport'
            })
        }
        $scope.collectionreport = function () {
            $state.go('app.collectionreports', {
                context: 'outpatientreport'
            })
        }
        $scope.dailybills = function () {
            $state.go('app.dailybillreports', {
                context: 'outpatientreport'
            })
        }
        $scope.discount = function () {
            $state.go('app.discountreports', {
                context: 'outpatientreport'
            })
        }
        $scope.outstanding = function () {
            $state.go('app.outstandingreports', {
                context: 'outpatientreport'
            })
        }
        $scope.labsummary = function () {
            $state.go('app.labsummaryreports', {
                context: 'outpatientreport'
            })
        }
        $scope.collectionreportbyuser = function () {
            $state.go('app.collectionreportbyusers', {
                context: 'outpatientreport'
            })
        }
        $scope.tatrrep = function () {
            $state.go('app.tatrrep', {
                context: 'outpatientreport'
            })
        }
        $scope.testmasterprice = function () {
            $state.go('app.testmasterprice', {
                context: 'outpatientreport'
            })
        }
        $scope.wardandbedlist = function () {
            $state.go('app.wardandbedlistreport', {
                context: 'outpatientreport'
            })
        }
        $scope.testmasterwithparameter = function () {
            $state.go('app.testmasterwithparameter', {
                context: 'outpatientreport'
            })
        }
        $scope.monthlyrevenuebytest = function () {
            $state.go('app.monthlyrevenuebytest', {
                context: 'outpatientreport'
            })
        }
        $scope.cancelreport = function () {
            $state.go('app.cancelreport', {
                context: 'outpatientreport'
            })
        }
        $scope.refundreport = function () {
            $state.go('app.refundreport', {
                context: 'outpatientreport'
            })
        }
        $scope.usermasterreport = function () {
            $state.go('app.usermasterreport', {
                context: 'outpatientreport'
            })
        }
        $scope.opserviceitemreport = function () {
            $state.go('app.opserviceitemreport', {
                context: 'outpatientreport'
            })
        }
        $scope.ipserviceitemreport = function () {
            $state.go('app.ipserviceitemreport', {
                context: 'outpatientreport'
            })
        }
        $scope.availablebeds = function () {
            $state.go('app.availablebedsreports', {
                context: 'outpatientreport'
            })
        }
        $scope.purchaseorderreport = function () {
            $state.go('app.purchaseorderreport', {
                context: 'outpatientreport'
            })
        }
        $scope.grnreport = function () {
            $state.go('app.grnreport', {
                context: 'outpatientreport'
            })
        }
        $scope.pendingporeport = function () {
            $state.go('app.pendingporeport', {
                context: 'outpatientreport'
            })
        }
        $scope.stockissuevocherreport = function () {
            $state.go('app.stockissuevocherreport', {
                context: 'outpatientreport'
            })
        }
        $scope.stockindentreport = function () {
            $state.go('app.stockindentreport', {
                context: 'outpatientreport'
            })
        }
        $scope.medicineexpiryreport = function () {
            $state.go('app.medicineexpiryreport', {
                context: 'outpatientreport'
            })
        }
        $scope.medicineexpiredreport = function () {
            $state.go('app.medicineexpiredreport', {
                context: 'outpatientreport'
            })
        }
        $scope.pharmacystockreport = function () {
            $state.go('app.pharmacystockreport', {
                context: 'outpatientreport'
            })
        }
        $scope.pharmacybilldetailreport = function () {
            $state.go('app.pharmacybilldetailreport', {
                context: 'outpatientreport'
            })
        }
        $scope.pharmacycollectionsummaryreport = function () {
            $state.go('app.pharmacycollectionsummaryreport', {
                context: 'outpatientreport'
            })
        }
        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', {
                context: 'outpatientreport'
            })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', {
                context: 'outpatientreport'
            })
        }
        $scope.bedtransferreport = function () {
            $state.go('app.bedtransferreport', {
                context: 'outpatientreport'
            })
        }
        $scope.outpatientreport = function () {
            $state.go('app.outpatientreport', {
                context: 'outpatientreport'
            })
        }
        $scope.inactivepatientreport = function () {
            $state.go('app.inactivepatientreport', {
                context: 'outpatientreport'
            })
        }
        $scope.deseasedpatientreport = function () {
            $state.go('app.deseasedpatientreport', {
                context: 'outpatientreport'
            })
        }
        $scope.ipadmissioninsurancereport = function () {
            $state.go('app.ipadmissioninsurancereport', {
                context: 'outpatientreport'
            })
        }
        $scope.doctorlistreport = function () {
            $state.go('app.doctorlistreport', {
                context: 'outpatientreport'
            })
        }
        $scope.insurancelistreport = function () {
            $state.go('app.insurancelistreport', {
                context: 'outpatientreport'
            })
        }
        $scope.opreferraldoctorreport = function () {
            $state.go('app.opreferraldoctorreport', {
                context: 'outpatientreport'
            })
        }
        $scope.ipoccupancyreport = function () {
            $state.go('app.ipoccupancyreport', {
                context: 'outpatientreport'
            })
        }
        $scope.outpatientsummaryreport = function () {
            $state.go('app.outpatientsummaryreport', {
                context: 'outpatientreport'
            })
        }
        $scope.ipoccupancybyward = function () {
            $state.go('app.ipoccupancybyward', {
                context: 'outpatientreport'
            })
        }
        $scope.outpatientsummarybydoctor = function () {
            $state.go('app.outpatientsummarybydoctor', {
                context: 'outpatientreport'
            })
        }
        $scope.outpatientsummarybyinsurance = function () {
            $state.go('app.outpatientsummarybyinsurance', {
                context: 'outpatientreport'
            })
        }
        $scope.appointmentschedulereport = function () {
            $state.go('app.appointmentschedulereport', {
                context: 'outpatientreport'
            })
        }
        $scope.appointmentcancelledreport = function () {
            $state.go('app.appointmentcancelledreport', {
                context: 'outpatientreport'
            })
        }
        $scope.appointmentreschedulereport = function () {
            $state.go('app.appointmentreschedulereport', {
                context: 'outpatientreport'
            })
        }
        $scope.appointmentpatientfromappreport = function () {
            $state.go('app.appointmentpatientfromappreport', {
                context: 'outpatientreport'
            })
        }
        $scope.videoconsultationpatientlist = function () {
            $state.go('app.videoconsultationpatientlist', {
                context: 'outpatientreport'
            })
        }
        $scope.daycarereport = function () {
            $state.go('app.daycarereport')
        }
        $scope.mlcreport = function () {
            $state.go('app.mlcreport')
        }
        $scope.emergencypatientreport = function () {
            $state.go('app.emergencypatientreport')
        }
        $scope.daycaretoadmissionpatient = function () {
            $state.go('app.daycaretoadmissionpatient')
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
    outpatientreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();