(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BillingRemarksController', BillingRemarksController);

    function BillingRemarksController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.ordertat = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;



        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            $scope.item.Id = $scope.currentcontext.eid;
            $scope.item.BillingStatusId = 1;
            var actionName = 'Visit/Visit/UpdateEncounter';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.reactProps.item = $scope.item;
            $scope.$applyAsync();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.eid && $scope.currentcontext.eid > 0) {
                var options = {
                    action: 'Visit/Visit/GetEncounterById',
                    data: { Id: $scope.currentcontext.eid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "BillingStatus"
            }, ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to BillingRemarksScreen.tsx).
        // All API calls/business logic above are untouched.
        // ---------------------------------------------------------------
        $scope.reactProps = {
            item: $scope.item,
            isModal: $scope.currentcontext.ismodal
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'itemFieldChange':
                    $scope.item[payload.field] = payload.value;
                    break;
                case 'saveItem':
                    $scope.saveItem();
                    break;
                case 'cancel':
                    $scope.cancelCallback();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };
    }

    BillingRemarksController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();
