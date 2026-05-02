(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inventoryreportController', inventoryreportController);

    function inventoryreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.purchaseorderreport', { context: 'inventoryreport' })
        }
        $scope.grnreport = function () {
            $state.go('app.grnreport', { context: 'inventoryreport' })
        }
        $scope.pendingporeport = function () {
            $state.go('app.pendingporeport', { context: 'inventoryreport' })
        }
        $scope.stockissuevocherreport = function () {
            $state.go('app.stockissuevocherreport', { context: 'inventoryreport' })
        }
        $scope.stockindentreport = function () {
            $state.go('app.stockindentreport', { context: 'inventoryreport' })
        }
        $scope.medicineexpiryreport = function () {
            $state.go('app.medicineexpiryreport', { context: 'inventoryreport' })
        }
        $scope.medicineexpiredreport = function () {
            $state.go('app.medicineexpiredreport', { context: 'inventoryreport' })
        }
        $scope.purchasevendorreport = function () {
            $state.go('app.purchasevendorreport', { context: 'inventoryreport' })
        }
        $scope.purchasevendorpendingreport = function () {
            $state.go('app.purchasevendorpendingreport', { context: 'inventoryreport' })
        }
        $scope.vendordetailreport = function () {
            $state.go('app.vendordetailreport', { context: 'inventoryreport' })
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
            $state.go('app.stockmovementreport', { context: 'inventoryreport' })
        }
        $scope.purchasereturnreport = function () {
            $state.go('app.purchasereturnreport', { context: 'inventoryreport' })
        }
        $scope.stockstatusreport = function () {
            $state.go('app.stockstatusreport', { context: 'inventoryreport' })
        }
        $scope.stockstatusbatchreport = function () {
            $state.go('app.stockstatusbatchreport', { context: 'inventoryreport' })
        }
        $scope.stocknonmovementreport = function () {
            $state.go('app.stocknonmovementreport', { context: 'inventoryreport' })
        }
        $scope.stockstatusproductsummaryreport = function () {
            $state.go('app.stockstatusproductsummaryreport', { context: 'inventoryreport' })
        }
        $scope.dailypurchasesummary = function () {
            $state.go('app.dailypurchasesummary', { context: 'inventoryreport' })
        }
        $scope.backtoReport = function () {
            $state.go('app.storereports')
        };
    }
    inventoryreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();