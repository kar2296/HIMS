(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('psdropfeedbackController', psdropfeedbackController);

    function psdropfeedbackController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $cookies, Upload, $timeout) {
        var vm = this;

        $scope.currentcontext = {
            // view: 'searchbyid'
        };
        $scope.currentfilter = {
            patientname: ''
        }
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
        $scope.canShowGrid = false;
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.canShowGrid = true;
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            vm.gridConfig.pagerObj.totalItems = res.Data.length;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.patientname },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        // $scope.bookdoctorappointment = function () {
        //     $scope.currentcontext.view = 'newuser';
        // }
        // $scope.searchbyid = function () {
        //     $scope.currentcontext.view = 'searchbyid';
        // }
        
        $scope.defaultregistration = function () {
            $state.go('app.defaultregistration');
        }
        $scope.home = function () {
            $state.go('app.feedbacklist'); 
        }
        $scope.pshome = function () {
            $state.go('app.patientservices');
        }
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'Patient Details', cellTemplate: 'patientListTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        if ($scope.currentfilter.patientname != '') {
            $scope.getList();
        }
    }

    psdropfeedbackController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$cookies', 'Upload', '$timeout'];

})();