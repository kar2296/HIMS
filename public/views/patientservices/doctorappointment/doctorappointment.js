(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientServicesdoctorController', PatientServicesdoctorController);

    function PatientServicesdoctorController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $cookies, Upload, $timeout) {
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

        $scope.defaultregistration = function () {
            $state.go('app.defaultregistration');
        }
        $scope.home = function () {
            $state.go('app.patientservices');
        }
        $scope.patdoctorslist = function () {
            $state.go('app.patdoctorslist');
        }
        $scope.pshome = function () {
            $state.go('app.patientservices');
        }

    }

    PatientServicesdoctorController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$cookies', 'Upload', '$timeout'];

})();