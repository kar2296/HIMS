(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientServicesDefaultController', PatientServicesDefaultController);

    function PatientServicesDefaultController($rootScope, $scope, $stateParams, $state, $translate, $filter,$cookies, utl, Upload, $timeout) {
        var vm = this;

        $scope.currencontext = {};
         //logout
         $scope.logoutCallback = function (scope, res, options, hasError) {

            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k, { path: '/' });
            });

            $state.go('page.login');
        };

        $scope.logout = function () {
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };

            utl.Http.doAction(options);
        };


        $scope.newregistration = function () {
            $state.go('app.newregistration');
        }
        $scope.registeredpatients = function () {
            $state.go('app.registeredpatients');
        }
        $scope.home = function () {
            $state.go('app.patientservices');
        }
        $scope.pshome = function () {
            $state.go('app.patientservices');
        }

        // --- React Bridge ---
        // Hollowed per REACT_MIGRATION_GUIDE.md: the template now mounts
        // <react-component name="DefaultRegistrationScreen">, which forwards every
        // click here by action name. All the actual logic (session/state/navigation)
        // stays exactly as it was above -- nothing here is new business logic.
        $scope.handleReactAction = function (actionName) {
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };

    }

    PatientServicesDefaultController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter','$cookies', 'utl', 'Upload', '$timeout'];

})();