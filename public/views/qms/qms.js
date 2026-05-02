(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('QMSForRegistrationController', QMSForRegistrationController);

    function QMSForRegistrationController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $cookies, Upload, $timeout) {
        var vm = this;

        $scope.currentcontext = {};

        $scope.item = {};
        $scope.item1 = {};
        $scope.item.GenderId = -1;
        $scope.item.QMSReasonId = -1;
        $scope.item.RegisteredDate = utl.Formatter.getCurrentDate();
        $scope.item.IsNewPatientRegsitration = true;
        $scope.item.IsOldPatientRegsitration = false;
        $scope.item.ShowTokenNo = false;

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

        $scope.addNew = function () {
            $state.reload();
            $scope.item.IsNewPatientRegsitration = true;
            $scope.item.IsOldPatientRegsitration = false;
        };

        $scope.getOldPatients = function () {
            $scope.item.IsOldPatientRegsitration = true;
            $scope.item.IsNewPatientRegsitration = false;
            $scope.PatientQMSDetails = [];
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.PatientQMSDetails = res.Data;
        };

        $scope.getList = function () {
            if ($scope.item.MobileFilter || $scope.item.PatientName) {
                var inputData = {
                    Params: [
                        { Key: 6, Value: $scope.item.MobileFilter },
                        { Key: 9, Value: $scope.item.PatientName }
                    ],
                    PageContext: { PageSize: -1, PageNumber: -1 }
                };

                var options = {
                    action: 'Registration/QMS/GetQMS',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.ShowTokenNo = true;
            $scope.item.IsNewPatientRegsitration = true;
            $scope.item.IsOldPatientRegsitration = false;
        };

        $scope.getItem = function () {
            if ($scope.item.Id && $scope.item.Id > 0) {

                var options = {
                    action: 'Registration/QMS/GetQMSById',
                    data: { Id: $scope.item.Id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
           /*  $scope.item.Id = data;
            if ($scope.item.Id > 0) {
                $scope.getItem();
            } */
            $scope.addNew();
            $scop.getLastTokenNo();
        };

        $scope.saveItem = function () {

            if (!$scope.item.FirstName || $scope.item.FirstName == '') {
                utl.Alert.showErrorMsg($translate.instant('registration.qms.firstnamemissingerror.lbl'));
                return;
            }

            if (!$scope.item.Mobile || $scope.item.Mobile == '') {
                utl.Alert.showErrorMsg($translate.instant('registration.qms.mobilemissingerror.lbl'));
                return;
            }

            var actionName = 'Registration/QMS/AddQMS';
            if ($scope.item.id && $scope.item.id > 0) {
                actionName = 'Registration/QMS/UpdateQMS';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.createTokenForOldPatientCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            /* $scope.item.Id = data;
            if ($scope.item.Id > 0) {
                $scope.getItem();
            } */
            $scope.addNew();
            $scop.getLastTokenNo();
        };

        $scope.createTokenForOldPatient = function (OldQMSId, PatientId) {

            $scope.item1.Id = OldQMSId;
            $scope.item1.PatientId = PatientId;

            var actionName = 'Registration/QMS/createTokenForOldPatient';
            var options = {
                action: actionName,
                data: { Data: $scope.item1 },
                type: 'post',
                onComplete: $scope.createTokenForOldPatientCallback
            };
            utl.Http.doAction(options);
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.getLastTokenNoCallback = function (scope, data, options, hasError) {
            $scope.item.LastTokenNo = data - 1;
            $scope.item.ShowTokenNo = true;
        };

        $scope.getLastTokenNo = function () {

            var options = {
                action: 'Registration/QMS/GetLastTokenCount',
                data: {},
                type: 'post',
                onComplete: $scope.getLastTokenNoCallback
            };
            utl.Http.doAction(options);

        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getLastTokenNo();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Title" },
                { "Key": "Gender" },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [
                            { Key: 0, Value: utl.Session.getCurrentFacilityId() }
                        ]
                    }
                },
                { "Key": "QMSReason" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();

    }

    QMSForRegistrationController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$cookies', 'Upload', '$timeout'];

})();