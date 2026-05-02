(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('generalstorereportController', generalstorereportController);

    function generalstorereportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.itempricedetailsreport', { context: 'storereports' })
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
        $scope.stockissuevochergeneralreport = function () {
            $state.go('app.stockissuevochergeneralreport')
        }
        $scope.stockindentgeneralreport = function () {
            $state.go('app.stockindentgeneralreport')
        }
        $scope.medicineexpiryreport = function () {
            $state.go('app.medicineexpiryreport', { context: 'storereports' })
        }
        $scope.medicineexpiredreport = function () {
            $state.go('app.medicineexpiredreport', { context: 'storereports' })
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
            $state.go('app.itemmasterreport', { context: 'storereports' })
        }
        $scope.suppliermasterreport = function () {
            $state.go('app.suppliermasterreport')
        }
        $scope.storemasterreport = function () {
            $state.go('app.storemasterreport')
        }
        $scope.stockmovementgeneralreport = function () {
            $state.go('app.stockmovementgeneralreport')
        }
        $scope.purchasereturnreport = function () {
            $state.go('app.purchasereturnreport')
        }
        $scope.stockstatusgeneralreport = function () {
            $state.go('app.stockstatusgeneralreport')
        }
        $scope.stockstatusbatchgeneralreport = function () {
            $state.go('app.stockstatusbatchgeneralreport')
        }
        $scope.stocknonmovementreport = function () {
            $state.go('app.stocknonmovementreport', { context: 'storereports' })
        } 
        $scope.stockstatusproductsummarygeneralreport = function () {
            $state.go('app.stockstatusproductsummarygeneralreport')
        } 
        $scope.rackdetailsbystorereport = function () {
            $state.go('app.rackdetailsbystorereport', { context: 'storereports' })
        } 
        $scope.itemreorderlistreport = function () {
            $state.go('app.itemreorderlistreport')
        } 
        $scope.producttypereport = function () {
            $state.go('app.producttypereport')
        } 
        $scope.genericmasterreport = function () {
            $state.go('app.genericmasterreport')
        } 
        $scope.manufacturermasterreport = function () {
            $state.go('app.manufacturermasterreport')
        } 
        $scope.grnreportbyitem = function () {
            $state.go('app.grnreportbyitem')
        } 
        $scope.invoicesummarybysupplier = function () {
            $state.go('app.invoicesummarybysupplier')
        } 
        $scope.stockadjustmentgeneralreport = function () {
            $state.go('app.stockadjustmentgeneralreport')
        }
        $scope.openingstockentrygeneralreport = function () {
            $state.go('app.openingstockentrygeneralreport')
        }
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        };
    }
    generalstorereportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();