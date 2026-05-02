(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ManageeventFormController', ManageeventFormController);

    function ManageeventFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        vm.gridConfig = {};
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.Data = [];
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),

        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);



        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            //$scope.applyFilter();
        };

        $scope.getDetails = function () {
            if ($scope.item.Id && $scope.item.Id > 0) {

                var inputData = {
                    Params: [

                    ]
                };

                var options = {
                    action: 'AssetManagement/AssetAuditDetail/GetAssetAuditDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $state.go('app.manageevent');
        }


        var check = [];
        $scope.getbutton = function (button, value) {
            // check.push(value)
            $scope.item.Content += value + ',';
        }





        $scope.save = function () {
            if ($scope.currentcontext.id == 0) { $scope.item.AuditStatusId = 1; }

            $scope.saveItem();
        };
        $scope.saveAndAudit = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AuditStatusId = 3;
            $scope.saveItem();
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetails();

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'SystemSettings/facility/GetFacilityById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };
        $scope.clear = function () {
            $scope.item = {};
        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/AssetAudit/AddAssetAudit';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/AssetAudit/UpdateAssetAudit';
            }
            var inputData = { Header: $scope.item, Details: $scope.gridData };
            var options = {
                action: actionName,
                data: { Data: inputData },
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
                { "Key": "Facility" },
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

    ManageeventFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();