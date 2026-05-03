(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('frontDashboardController', frontDashboardController);

    function frontDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId() || '0'),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }

        // For React Bridge
        $scope.permissions = {
            Registration: $scope.HasAccess('FrontOfficeDashboard', 'Registration'),
            Appointments: $scope.HasAccess('FrontOfficeDashboard', 'Appointments'),
            OPbilling: $scope.HasAccess('FrontOfficeDashboard', 'OPbilling'),
            DirectBilling: $scope.HasAccess('FrontOfficeDashboard', 'DirectBilling'),
            LabBilling: $scope.HasAccess('FrontOfficeDashboard', 'LabBilling'),
            Admissions: $scope.HasAccess('FrontOfficeDashboard', 'Admissions'),
            BedTransfer: $scope.HasAccess('FrontOfficeDashboard', 'BedTransfer'),
            CurrentIpPatients: $scope.HasAccess('FrontOfficeDashboard', 'CurrentIpPatients'),
            FrontOfficeReports: $scope.HasAccess('FrontOfficeDashboard', 'FrontOfficeReports')
        };

        $scope.handleNavigation = function(stateName, params) {
            $timeout(function() {
                $state.go(stateName, params);
            });
        };

        // Proxy fetch calls through AngularJS utl.Http to automatically handle authentication tokens
        $scope.apiFetch = function(action, payload) {
            return new Promise(function(resolve, reject) {
                var options = {
                    action: action,
                    data: payload,
                    type: 'post',
                    onComplete: function(scope, res) {
                        resolve(res);
                    },
                    onError: function(err) {
                        reject(err);
                    }
                };
                utl.Http.doAction(options);
            });
        };

        $scope.reactProps = {
            currentcontext: $scope.currentcontext,
            permissions: $scope.permissions,
            onNavigate: $scope.handleNavigation,
            apiFetch: $scope.apiFetch
        };

        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/
    }
    frontDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();