(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VaccineCertificateController', VaccineCertificateController);

    function VaccineCertificateController($http,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        // console.log($stateParams.id, '***********************');
        $scope.item = {};
        $scope.VaccineData = {};
        $scope.currentcontext = {};
        // $stateParams.id = parseInt($stateParams.woid);
        // $scope.confirmCallback = $uibModalInstance.close;
        // $scope.cancelCallback = $uibModalInstance.dismiss;

        selfUserLogin();

        function selfUserLogin() {
            var options = {
                action: 'auth/getClientToken',
                data: {
                    userName: 'selfuser',
                    password: 'pwd',
                    userList: $scope.userData
                },
                type: 'post',
                onComplete: (scope, data) => {
                    console.log('jjjjjj', data);
                    var clientToken = data.token;
                    localStorage.setItem('token', clientToken)
                    $http.defaults.headers.post.Authorization = `bearer ${localStorage.getItem('token')}`;
                    $scope.getItem();
                }
            };
            utl.Http.doAction(options);
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetails();
        };

        $scope.getItem = function () {
            if ($stateParams.id) {

                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorderById',
                    data: {
                        Id: $stateParams.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.VaccineData = res.Data[0];
        };

        $scope.getDetails = function () {
            if ($stateParams.id) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $stateParams.id
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'lis/patientworkorderdetails/GetPatientWorkorderdetailss',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.print = function () {
            var inputData = {
                Id: $stateParams.id,
            };
            var options = {
                action: 'lis/patientworkorder/PrintPatientVaccineWorkorder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        // $scope.getItem();
    }

    VaccineCertificateController.$inject = ['$http','$scope', '$stateParams', '$state', '$translate', 'utl'];

})();