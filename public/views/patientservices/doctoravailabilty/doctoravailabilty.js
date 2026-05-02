(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('psdrdoctoravailabiltyController', psdrdoctoravailabiltyController);

    function psdrdoctoravailabiltyController($rootScope, $scope, $stateParams, $state, $filter, utl, $cookies, $translate, Upload, $timeout) {
        var vm = this;

        $scope.currencontext = {};
        $scope.currentfilter = {
            doctorname: '',
            speciality: ''
        };
        $scope.DoctorDisplay = [];
        $scope.canShowGrid = false;
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.canShowGrid = true;
            $scope.gridData = res.Data;
            $scope.DoctorDisplay = $scope.gridData;
            // if ($scope.currentfilter.doctorname != '') {
            //     $scope.currentfilter.speciality == '';
            // }
            // if ($scope.currentfilter.speciality != '') {
            //     $scope.currentfilter.doctorname == null;
            // }
            // vm.gridConfig.pagerObj.totalItems = res.Data.length;
        };

        $scope.getList = function (pageNo) {
            // if ($scope.currentfilter.doctorname != '') {
            //     $scope.currentfilter.speciality = '';
            // }
            // if ($scope.currentfilter.speciality != '' && $scope.currentfilter.doctorname != '') {
            //     $scope.currentfilter.doctorname == ''
            // }
            var inputData = {
                Params: [
                    { Key: 6, Value: $scope.currentfilter.doctorname },
                    { Key: 7, Value: $scope.currentfilter.speciality },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Appointment/DoctorDisplay/GetDoctorDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        vm.gridConfig = {
            columnDefs: [
                //       { field: "FirstName", displayName: $translate.instant('registration.patientsearch.name.lbl') },
                //       { field: "Age", displayName: $translate.instant('registration.patientsearch.age.lbl') },
                {
                    //           field: "DOB", displayName: $translate.instant('registration.patientsearch.dob.lbl'),
                    //          cellTemplate: "<ngformatdate date-val='row.entity.DOB'></ngformatdate>"
                },
                // { field: "AddressLine1", displayName: $translate.instant('registration.patientsearch.address.lbl') },
                //       { field: "City", displayName: $translate.instant('registration.patientsearch.city.lbl') },
                // { field: "Country", displayName: $translate.instant('registration.patientsearch.country.lbl') },
                //       { field: "Mobile", displayName: $translate.instant('registration.patientsearch.mobile.lbl') },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' }
                //     ]
                // }
                // { field: "Id", name: 'Patient Details', cellTemplate: 'patientListTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.pshome = function () {
            $state.go('app.patientservices');
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
        $scope.pshome = function () {
            $state.go('app.patientservices');
        }
        $scope.home = function () {
            $state.go('app.patientservices');
        }
        // if ($scope.currentfilter.doctorname != '') {
        //     $scope.getList();
        // }
        // if ($scope.currentfilter.speciality != '') {
        //     $scope.getList();
        // }
    }

    psdrdoctoravailabiltyController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$filter', 'utl', '$cookies', '$translate', 'Upload', '$timeout'];

})();