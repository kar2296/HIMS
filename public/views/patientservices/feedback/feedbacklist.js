(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('psdrfeedbackController', psdrfeedbackController);

    function psdrfeedbackController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $cookies, Upload, $timeout) {
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

        $scope.back = function () {
            $state.go('app.patientservices'); 
        }
        $scope.generalfeedback = function () {           
            $state.go('app.generalfeedback');
        }
        $scope.opfeedback = function () {           
            $state.go('app.opfeedback'); 
        }
        $scope.ipfeedback = function () {           
            $state.go('app.ipfeedback'); 
        }
       

    }

    psdrfeedbackController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$cookies', 'Upload', '$timeout'];

})();