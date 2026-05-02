(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientServicesController', PatientServicesController);

    function PatientServicesController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $cookies, Upload, $timeout) {
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

        // $scope.defaultregistration = function () {
        //     $state.go('app.defaultregistration'); 
        // }
        $scope.defaultregistration = function () {
            $state.go('self.selfnewregistration'); 
        }
        $scope.doctorappointment = function () {
            $state.go('app.patdoctorappointment'); 
        }
        $scope.availabilty = function () {
            $state.go('app.doctoravailabilty'); 
        }
        $scope.feedbackist = function () {
            $state.go('app.patient-feedback'); 
        }

    }

    PatientServicesController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$cookies', 'Upload', '$timeout'];

})();