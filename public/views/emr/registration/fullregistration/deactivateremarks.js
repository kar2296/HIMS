(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DeactivateRemarksController', DeactivateRemarksController);

    function DeactivateRemarksController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.ordertat = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        // $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.item = modalConfig.params.item;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.saveremarks = function () {
            // $scope.item.DeactivateRemarks = itemFromModal.DeactivateRemarks;
            $scope.item.PatientStatus = 'Inactive';
            $scope.item.PatientStatusId = 3;
            $scope.item.DeactivatedDate = utl.Formatter.getCurrentDate();
            var message = "";
            message = $scope.item.Title ? $scope.item.Title.Description : "";
            message += message != "" ? ("." + $scope.item.FirstName) : $scope.item.FirstName;
            message += $scope.item.MRN ? (" / MRN-" + $scope.item.MRN) : "";
            utl.Dialog.confirmDeactivate($scope.saveItem, message);
            // $scope.confirmCallback($scope.item);
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback($scope.item);
        }

        $scope.saveItem = function () {

            var options = {
                action: 'registration/patient/UpdatePatient',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [
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
        // loadData();

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to DeactivateRemarksScreen.tsx).
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
                case 'saveremarks':
                    $scope.saveremarks();
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

    DeactivateRemarksController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();