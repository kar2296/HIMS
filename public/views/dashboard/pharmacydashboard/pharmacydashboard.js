(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacydashboardController', PharmacydashboardController);

    function PharmacydashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        };

        // Pre-compute all privileges once and pass as map
        var privilegeMap = {
            canMedicineSales: utl.Privilege.hasAccess('PharmacyDashboard', 'MedicineSales') || utl.Privilege.hasAccess('CanMedicineSales'),
            canMedicineReturns: utl.Privilege.hasAccess('PharmacyDashboard', 'MedicineReturns') || utl.Privilege.hasAccess('CanMedicineReturns'),
            canStockIndent: utl.Privilege.hasAccess('PharmacyDashboard', 'StockIndent') || utl.Privilege.hasAccess('CanStockIndent'),
            canStockReceives: utl.Privilege.hasAccess('PharmacyDashboard', 'StockReceives') || utl.Privilege.hasAccess('CanStockReceives'),
            canStockStatus: utl.Privilege.hasAccess('PharmacyDashboard', 'StockStatus') || utl.Privilege.hasAccess('CanStockStatus'),
            canStockMovement: utl.Privilege.hasAccess('PharmacyDashboard', 'StockMovement') || utl.Privilege.hasAccess('CanStockMovement'),
            canMedicineCreditBills: utl.Privilege.hasAccess('PharmacyDashboard', 'MedicineCreditBills') || utl.Privilege.hasAccess('CanMedicineCreditBills'),
            canMedicineCreditReturns: utl.Privilege.hasAccess('PharmacyDashboard', 'MedicineCreditReturns') || utl.Privilege.hasAccess('CanMedicineCreditReturns'),
            canPharmacyReports: utl.Privilege.hasAccess('PharmacyDashboard', 'PharmacyReports') || utl.Privilege.hasAccess('CanPharmacyReports'),
            canDirectPharmacySales: utl.Privilege.hasAccess('PharmacyDashboard', 'DirectPharmacySales') || utl.Privilege.hasAccess('CanDirectPharmacySales'),
            canDirectMedicineReturns: utl.Privilege.hasAccess('PharmacyDashboard', 'DirectMedicineReturns') || utl.Privilege.hasAccess('CanDirectMedicineReturns'),
            canStaffCredits: utl.Privilege.hasAccess('PharmacyDashboard', 'StaffCredits') || utl.Privilege.hasAccess('CanStaffCredits'),
            canStaffCreditPayment: utl.Privilege.hasAccess('PharmacyDashboard', 'StaffCreditPayment') || utl.Privilege.hasAccess('CanStaffCreditPayment'),
            canStaffCreditReturns: utl.Privilege.hasAccess('PharmacyDashboard', 'StaffCreditReturns')
        };

        // Navigation handler for React Component
        $scope.handleNavigation = function(stateName, params) {
            $state.go(stateName, params);
        };

        $scope.reactProps = {
            privileges: privilegeMap,
            context: $scope.currentcontext
        };

        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
    }
    PharmacydashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];
})();