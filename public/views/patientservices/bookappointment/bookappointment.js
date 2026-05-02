(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PsdrappointmentController', PsdrappointmentController);

    function PsdrappointmentController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $cookies, Upload, $timeout) {
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
        $scope.doctorlist = function () {
            $state.go('app.patdoctorslist');
        }
        $scope.bookingconfirmation = function () {
            $state.go('app.bookingconfirmation');
        }
        $scope.pshome = function () {
            $state.go('app.patientservices');
        }
        //test

        //testttt
     }

     PsdrappointmentController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$cookies', 'Upload', '$timeout'];

})();
