(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientPortalTopbarController', patientPortalTopbarController);

    function patientPortalTopbarController($scope, $stateParams, $state, $translate, utl) {
        //var vm = this;

        $scope.patientInfo = {};

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.patientInfo = res.Data[0];
            var gender = $scope.patientInfo.Gender && $scope.patientInfo.Gender.Description ? $scope.patientInfo.Gender.Description : '';
            utl.Session.setPatientGender(gender);
            utl.Session.setPatientDOB($scope.patientInfo.DOB);


            $scope.getPatientProfilePic();
        };
        $scope.patientprofile = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentcontext.pid
                }
            });
        };

        $scope.messages = function () {
            $state.go('patientportal.messages');
        }

        $scope.changepwd = function () {
            utl.Modal.open('app.changepassword', {
                params: {}
            });
        }
        $scope.myprofile = function () {
            utl.Modal.open('app.userinfo', {
                params: {}
            });
        }

        $scope.logoutCallback = function (scope, res, options, hasError) {

            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k, {
                    path: '/'
                });
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

        $scope.gotoState = function (toState) {
            $state.go(toState);
        }

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.pid
                    },],
                    PageContext: {
                        PageSize: 0,
                        PageNumber: 25
                    }
                };

                var options = {
                    action: 'registration/patient/GetPatients',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.patientInfo.PhotoPath) {
                var inputData = {
                    Id: $scope.patientInfo.Id,
                    PhotoPath: $scope.patientInfo.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getMsgCountCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.messagesCount = res.Data.length;
        };

        $scope.getMsgCount = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/Message/GetMessages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMsgCountCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getItem();
        $scope.getMsgCount();
    }

    patientPortalTopbarController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();