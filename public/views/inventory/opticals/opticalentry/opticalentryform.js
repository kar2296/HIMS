(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalEntryFormController', OpticalEntryFormController);

    function OpticalEntryFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = $stateParams.id;

        $scope.backToList = function () {
            $state.go('app.privilegecardlist');
        };
        $scope.Receipt = function () {
            $state.go('app.opticalreceipt', { id: $scope.item.Id, pid: $scope.item.PatientId });
        };
        $scope.calculatebalamt = function (item) {
            if (item.AdvanceAmount > 0) {
                item.BalanceAmount = parseInt(item.TotalAmount) - parseInt(item.AdvanceAmount);
            } else {
                item.BalanceAmount = item.TotalAmount;
            }
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            $scope.item.ActiveStatusId = 2;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            var actionName = 'pharmacy/OpticalEntry/AddOpticalEntry';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'pharmacy/OpticalEntry/UpdateOpticalEntry';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/OpticalEntry/GetOpticalEntryById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.currentcontext.Id > 0) {
                $scope.getItem();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "LensType" },

            ];
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

    OpticalEntryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();