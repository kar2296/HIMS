(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('privilegeController', privilegeController);

    function privilegeController($scope, $stateParams, $state, $translate, utl) {

        $scope.privcontext = {
            items: []
        };

        $scope.privilegeMap = utl.Session.getObject('session-roleprivmap');

        //roleCode: { objectTypeCode: { actionCode: true }}
        /*$scope.privilegeMap = {
            'OPR': {
                'OPbilling': { 'Cancel': false, 'ORIGINAL_PRINT': false },
                'Receipts': { 'Cancel': false, 'ORIGINAL_PRINT': false },
                'Refunds': { 'Cancel': false, 'ORIGINAL_PRINT': false }
            },
            'RADIOLOGY': true,
            'PHYS': true,
            'PHARMACYE': true,
            'PHARMACYI': true,
            'PATIENT PORTAL': true,
            'opclinics': true,
            'NURSINGI': true,
            'NURSE': true,
            'LABT': true,
            'LABI': true,
            'IPBilling': true,
            'INSURANCE': true,
            'Generalstore': true,
            'DischargeSummary': true,
            'DIETICIAN': true,
            'BILL': {
                'OPbilling': { 'Cancel': false, 'ORIGINAL_PRINT': false },
                'Receipts': { 'Cancel': false, 'ORIGINAL_PRINT': false },
                'Refunds': { 'Cancel': false, 'ORIGINAL_PRINT': false }
            },
            'IPBilling': {
                'OPbilling': { 'Cancel': false, 'ORIGINAL_PRINT': false },
                'Receipts': { 'Cancel': false, 'ORIGINAL_PRINT': false },
                'Refunds': { 'Cancel': false, 'ORIGINAL_PRINT': false }
            },
            'AUD': true,
            'Admission': true,
            'ADMINISTRATOR': true,
            'ADMIN': true,
            'ACC': { 'Order': { 'ORIGINAL_PRINT': false, 'Approve': false } }
        };
        */

        $scope.HasAccess = function (entity, action) {
            // console.log('entity '+entity);
            // console.log('action '+action);
            // console.log('HasPrivilege : userroles - ' + utl.Session.getUserRoles());
            try {
                var currentRoles = utl.Session.getUserRoles();
                if (!Array.isArray(currentRoles)) {
                    currentRoles = [currentRoles];
                }
                var result = false;
                var iscomputed = false;
                for (var idx in currentRoles) {
                    var role = currentRoles[idx];
                    if ($scope.privilegeMap[role]
                        && $scope.privilegeMap[role][entity]
                        && typeof $scope.privilegeMap[role][entity][action] == 'boolean') {
                        iscomputed = true;
                        result |= $scope.privilegeMap[role][entity][action];
                    }
                }
                if (iscomputed == true) {
                    return result ? true : false;
                } else {
                    return true;
                }
            } catch (ex) {
                console.log(ex);
                return false;
            }

        }
    }

    privilegeController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();