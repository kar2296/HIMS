(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('gstMasterFormController', gstMasterFormController);

    function gstMasterFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
            GstId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsParent: false,
            IsAllFacility: false
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            //$scope.item = data;
            $scope.item.Id = data.Id;
            $scope.item.GstId = data.ChildGstId;
            $scope.item.GstCode = data.GstCode;
            $scope.item.GstName = data.GstName;
            $scope.item.GstDescription = data.GstDescription;
            $scope.item.GstPercentage = data.GstPercentage;
            $scope.item.FacilityId = data.FacilityId;
            $scope.item.IsActive = data.IsActive;
            $scope.item.ActiveStatusId = data.ActiveStatusId;
            $scope.item.Status = data.Status;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/gstmaster/GetGstMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.gstmasters');
        };

        $scope.addNew = function () {
            $state.go('app.gstmaster', { id: 0 });
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.item.ChildGstId = $scope.item.GstId;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            }
            else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.item.ChildGstId = $scope.item.GstId;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsAllFacility == true) {
                $scope.item.FacilityId = -1;
            }
            if ($scope.item.IsAllFacility == false) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            var actionName = 'Pharmacy/gstmaster/AddGstMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Pharmacy/gstmaster/UpdateGstMaster';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "GstMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        };

        $scope.initLookup();
    }

    gstMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();