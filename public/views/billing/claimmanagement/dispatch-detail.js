(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimdispatchController', claimdispatchController);

    function claimdispatchController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            DispatchedById: utl.Session.getCurrentUserId(),
            DispatchedOn: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.item.SubmittedOn = modalConfig.params.SubmittedOn;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item.SubmittedOn = new Date($scope.item.SubmittedOn);
        // $scope.item.PatientId = $scope.currentcontext.pid;

        //get patient profile

        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.confirmCallback($scope.item);
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DischargeType" },
                { "Key": "User" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }



        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                dispatchedById: $scope.item.DispatchedById,
                dispatchedByOptions: ($scope.lookup && $scope.lookup.User) || []
            };
        };

        $scope.handleReactAction = function (actionType, payload) {
            // DispatchedById is always disabled in the original markup (ng-disabled="true"),
            // so no dispatch case is needed here; refreshReactProps re-syncs after lookup load.
        };

        $scope.initLookup();
    }

    claimdispatchController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();