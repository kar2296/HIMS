(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('userDeptMapController', userDeptMapController);

    function userDeptMapController($scope, $stateParams, $state, $translate, utl) {
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.item = {};

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }]
                };

                var options = {
                    action: 'SystemSettings/User/GetDepartments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            // $state.go('app.usertab.general', { id:0 });
            $state.go('app.usertab.general');
        }

        $scope.clear = function () {
            $scope.item = {};
        };
        $scope.save = function () {
            $scope.item.PatientStatus = 'Draft'
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            $scope.item.PatientStatus = 'Active'
            $scope.saveItem();
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //     $scope.showErrorMsg(common.validationmsg.lbl);
            //     return;
            // }

            var actionName = 'SystemSettings/User/MapDepartments';

            var options = {
                action: actionName,
                data: { Data: $scope.item.map },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Department", Request: {
                        Params: [{ Key: 5, Value: 2 },
                        { Key: 14, Value: [utl.Session.getCurrentFacilityId(),] }
                        ]
                    }
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    userDeptMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();