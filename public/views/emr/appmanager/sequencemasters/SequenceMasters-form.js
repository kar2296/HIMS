(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('sequencemastersFormController', sequencemastersFormController);

    function sequencemastersFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));


        $scope.item = {
            IsActive: true
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        //     $scope.item = {
        //     ActiveStatusId : true,
        // };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'General/SequenceMasters/GetSequenceMastersById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function() {
            $scope.item.ActiveStatusId = 2;
            $scope.saveItem();
        }
        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal)
                $scope.confirmCallback();
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'General/SequenceMasters/AddSequenceMasters';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'General/SequenceMasters/UpdateSequenceMasters';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" }
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

    sequencemastersFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();