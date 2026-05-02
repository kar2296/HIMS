(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchasemanagementreportController', purchasemanagementreportController);

    function purchasemanagementreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.itempricedetailsreport', {
                context: 'storereports'
            })
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
            $state.go('app.purchaseorderreport', {
                context: 'purchasestorereports'
            })
        }
        $scope.purchaseorderdetailreport = function () {
            $state.go('app.purchaseorderdetailreport')
        }
        $scope.grnreport = function () {
            $state.go('app.grnreport', {
                context: 'purchasestorereports'
            })
        }
        $scope.pendingporeport = function () {
            $state.go('app.pendingporeport', {
                context: 'purchasestorereports'
            })
        }
        $scope.vendoroutstandingreport = function () {
            $state.go('app.vendoroutstandingreport')
        }
        $scope.stockissuevocherreport = function () {
            $state.go('app.stockissuevocherreport', {
                context: 'purchasestorereports'
            })
        }
        $scope.stockindentreport = function () {
            $state.go('app.stockindentreport', {
                context: 'storereports'
            })
        }
        $scope.medicineexpiryreport = function () {
            $state.go('app.medicineexpiryreport', {
                context: 'storereports'
            })
        }
        $scope.medicineexpiredreport = function () {
            $state.go('app.medicineexpiredreport', {
                context: 'storereports'
            })
        }
        $scope.purchasevendorreport = function () {
            $state.go('app.purchasevendorreport', {
                context: 'purchasestorereports'
            })
        }
        $scope.purchasevendorpendingreport = function () {
            $state.go('app.purchasevendorpendingreport', {
                context: 'purchasestorereports'
            })
        }
        $scope.vendordetailreport = function () {
            $state.go('app.vendordetailreport', {
                context: 'purchasestorereports'
            })
        }
        $scope.itemmasterreport = function () {
            $state.go('app.itemmasterreport', {
                context: 'storereports'
            })
        }
        $scope.suppliermasterreport = function () {
            $state.go('app.suppliermasterreport')
        }
        $scope.storemasterreport = function () {
            $state.go('app.storemasterreport')
        }
        $scope.stockmovementreport = function () {
            $state.go('app.stockmovementreport', {
                context: 'storereports'
            })
        }
        $scope.purchasereturnreport = function () {
            $state.go('app.purchasereturnreport', {
                context: 'purchasestorereports'
            })
        }
        $scope.stockstatusreport = function () {
            $state.go('app.stockstatusreport', {
                context: 'storereports'
            })
        }
        $scope.stockstatusbatchreport = function () {
            $state.go('app.stockstatusbatchreport', {
                context: 'storereports'
            })
        }
        $scope.stocknonmovementreport = function () {
            $state.go('app.stocknonmovementreport', {
                context: 'storereports'
            })
        }
        $scope.stockstatusproductsummaryreport = function () {
            $state.go('app.stockstatusproductsummaryreport', {
                context: 'storereports'
            })
        }
        $scope.rackdetailsbystorereport = function () {
            $state.go('app.rackdetailsbystorereport', {
                context: 'storereports'
            })
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
        $scope.stockadjustmentreport = function () {
            $state.go('app.stockadjustmentreport')
        }
        $scope.openingstockentryreport = function () {
            $state.go('app.openingstockentryreport')
        }
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        };
    }
    purchasemanagementreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();