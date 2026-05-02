(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCertificateController', LabCertificateController);

    function LabCertificateController($http, $scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        // console.log( $scope.$stateParams.id, '***********************');
        $scope.item = {};
        // $scope.LabData = {};
        $scope.currentcontext = {};
        // $scope.$stateParams = {};
        // $scope.currentcontext.id = parseInt($stateParams.woid);
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
        //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.PatientPhoto = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.Patient.PhotoPath) {
                var inputData = { PhotoPath: $scope.item.Patient.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getMedUserSignPicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.MedSignPhoto = data.SignPath;
        };

        $scope.getMedUserSignPic = function () {
            if ($scope.item.MedUser.SignPath) {
                var inputData = { SignPath: $scope.item.MedUser.SignPath };
                var options = {
                    action: 'SystemSettings/User/GetUserSignPic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getMedUserSignPicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getTechUserSignPicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.TechSignPhoto = data.SignPath;
        };

        $scope.getTechUserSignPic = function () {
            if ($scope.item.Techuser.SignPath) {
                var inputData = { SignPath: $scope.item.Techuser.SignPath };
                var options = {
                    action: 'SystemSettings/User/GetUserSignPic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getTechUserSignPicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getPatientProfilePic();
            $scope.getMedUserSignPic();
            $scope.getTechUserSignPic();
            $scope.getDetails();
        };


        $scope.getItem = function () {
            if ($scope.$stateParams.id) {

                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorderById',
                    data: {
                        Id: $scope.$stateParams.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.LabData = [];
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.LabData = res.Data || [];
        };

        $scope.getDetails = function () {
            if ($scope.$stateParams.id) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.$stateParams.id
                    }],
                    PageContext: {
                        PageSize: -1,
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
                Id:$scope.currentcontext.id,
            };
            var options = {
                action: 'lis/patientworkorder/PrintVirtualPatientWorkorder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.getItem();
    }

    LabCertificateController.$inject = ['$http', '$scope', '$stateParams', '$state', '$translate', 'utl'];

})();