(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storemasterApprovalMatrixController', storemasterApprovalMatrixController);

    function storemasterApprovalMatrixController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.selectediteminfo = {};
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.storemasterid = parseInt($stateParams.id);
        $scope.currentcontext.id = parseInt($stateParams.storeapprovalmatrixid);
        $scope.lookup = {};
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            UserTypeId: -1,
            UserId: -1,
            PoStatusId: -1,
            PoTypeId: -1,
            StoreMasterId: -1
        };

        var IsProfile = $state.params.IsProfile;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.addUsers = function () {
            var item = {
                Id: 0,
                StoreMasterId: $scope.currentcontext.storemasterid,
                UserId: $scope.item.UserId,
                UserTypeId: $scope.item.UserTypeId,
                PoTypeId: $scope.item.PoTypeId,
                PoStatusId: $scope.item.PoStatusId,
                IsFinalApprover: $scope.item.IsFinalApprover,
                MinPoValue: $scope.item.MinPoValue,
                MaxPoValue: $scope.item.MaxPoValue,
                ActiveFrom: $scope.item.ActiveFrom,
                ActiveTo: $scope.item.ActiveTo,
                Status: 1
            };
            $scope.saveItem();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/storeapprovalmatrix/GetStoreApprovalMatrixById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.UserId = 0;
            $scope.item.UserTypeId = 0;
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/storeapprovalmatrix/AddStoreApprovalMatrix';

            var item = {
                Id: $scope.currentcontext.id,
                StoreMasterId: $scope.currentcontext.storemasterid,
                UserId: $scope.item.UserId,
                FacilityId: $scope.item.FacilityId,
                UserTypeId: $scope.item.UserTypeId,
                PoTypeId: $scope.item.PoTypeId,
                PoStatusId: $scope.item.PoStatusId,
                IsFinalApprover: $scope.item.IsFinalApprover,
                MinPoValue: $scope.item.MinPoValue,
                MaxPoValue: $scope.item.MaxPoValue,
                ActiveFrom: $scope.item.ActiveFrom,
                ActiveTo: $scope.item.ActiveTo,
                Status: 1
            };

            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/storeapprovalmatrix/UpdateStoreApprovalMatrix';
            }

            var options = {
                action: actionName,
                data: { Data: item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            if (item.UserId > 0)
                utl.Http.doAction(options);
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        };

        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     forEach(data, function (value, key) {
        //         $scope.lookup[key] = value;
        //     });
        // };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "UserType" },
                {
                    "Key": "User",
                    Request: {
                        Params: [
                            { Key: 2, Value: $scope.item.FacilityId }
                        ]
                    }
                },
                { "Key": "RequestType" },
                { "Key": "PoType" },
                { "Key": "PoStatus" },
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.item.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                }
            ];

            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initLookup();
        $scope.getItem();
        $scope.getFacilityUsers = function () {
            var inputData = [{
                "Key": "User",
                Request: {
                    Params: [
                        { Key: 2, Value: $scope.item.FacilityId || -1 },
                        { Key: 3, Value: $scope.item.UserTypeId || -1 }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        };
    }

    storemasterApprovalMatrixController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();