(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('BillingsDashboardController', BillingsDashboardController);

    function BillingsDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        var currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59')
        };

        // Pass API fetch through AngularJS
        $scope.apiFetch = function(action, payload) {
            return new Promise(function(resolve, reject) {
                var options = {
                    action: action,
                    data: payload,
                    type: 'post',
                    onComplete: function(scope, res) { resolve(res); },
                    onError: function(err) { reject(err); }
                };
                utl.Http.doAction(options);
            });
        };

        $scope.navigateTo = function(stateName, params) {
            $state.go(stateName, params);
        };

        // Construct privileges map for React
        var privileges = {
            'QuickRegistration': utl.Privilege.hasAccess('CanQuickRegistration'),
            'Billing_OPPatients': utl.Privilege.hasAccess('CanBilling_OPPatients'),
            'Billing_DirectBilling': utl.Privilege.hasAccess('CanBilling_DirectBilling'),
            'BillingReports': utl.Privilege.hasAccess('CanBillingReports'),
            'Billing_LabBilling': utl.Privilege.hasAccess('CanBilling_LabBilling'),
            'billing_CurrentIpBilling': utl.Privilege.hasAccess('Canbilling_CurrentIpBilling'),
            'Discharged_IP_Billing': utl.Privilege.hasAccess('CanDischarged_IP_Billing'),
            'Billing_Admissions': utl.Privilege.hasAccess('CanBilling_Admissions'),
            'Billing_CurrentIPPatients': utl.Privilege.hasAccess('CanBilling_CurrentIPPatients')
        };

        $scope.reactProps = {
            context: currentcontext,
            privileges: privileges,
            apiFetch: $scope.apiFetch,
            navigateTo: $scope.navigateTo
        };

        $timeout(function() {
            $rootScope.app.layout.isCollapsed = true;
        }, 100);
    }
    BillingsDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();