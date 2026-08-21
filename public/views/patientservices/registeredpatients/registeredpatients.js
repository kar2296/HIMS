(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientServicesalreadyController', PatientServicesalreadyController);

    function PatientServicesalreadyController($rootScope, $scope, $stateParams, $state, $filter, utl,$cookies,$translate, Upload, $timeout) {
        var vm = this;

        $scope.currencontext = {};
        $scope.currentfilter = {
            patientname: '',
        };
        $scope.canShowGrid = false;
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.canShowGrid = true;
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            vm.gridConfig.pagerObj.totalItems = res.Data.length;
            $scope.refreshReactProps();
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
        vm.gridConfig = {
            columnDefs: [
                { field: "FirstName", displayName: $translate.instant('registration.patientsearch.name.lbl') },
                { field: "Age", displayName: $translate.instant('registration.patientsearch.age.lbl') },
                {
                    field: "DOB", displayName: $translate.instant('registration.patientsearch.dob.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.DOB'></ngformatdate>"
                },
               // { field: "AddressLine1", displayName: $translate.instant('registration.patientsearch.address.lbl') },
                { field: "City", displayName: $translate.instant('registration.patientsearch.city.lbl') },
               // { field: "Country", displayName: $translate.instant('registration.patientsearch.country.lbl') },
                { field: "Mobile", displayName: $translate.instant('registration.patientsearch.mobile.lbl') },
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

        // --- React Bridge ---
        // Hollowed per REACT_MIGRATION_GUIDE.md: the template now mounts
        // <react-component name="RegisteredPatientsScreen">. React only renders the
        // search box, results table and pagination from reactProps and forwards every
        // interaction back here by action name via handleReactAction -- getList(),
        // the real 'registration/patient/GetPatients' API call, and all other logic
        // above are untouched.
        $scope.refreshReactProps = function () {
            vm.reactProps = {
                patientname: $scope.currentfilter.patientname,
                canShowGrid: $scope.canShowGrid,
                gridData: $scope.gridData || [],
                pagerObj: vm.gridConfig.pagerObj
            };
            $scope.reactProps = vm.reactProps;
        };
        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                // React owns the input's live typing state; only hand the value to
                // Angular at search time (Enter key or the search button), same as the
                // original ng-model value was only ever read by getList(). Setting it
                // here and calling getList() (which is async/digest-aware) avoids
                // needing a manual $scope.$apply for a case the bridge doesn't cover.
                $scope.currentfilter.patientname = payload && payload.value !== undefined ? payload.value : '';
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
                $scope.getList();
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };

        if ($scope.currentfilter.patientname != '') {
            $scope.getList();
        }
    }

    PatientServicesalreadyController.$inject = ['$rootScope', '$scope', '$stateParams', '$state','$filter', 'utl','$cookies','$translate', 'Upload', '$timeout'];

})();