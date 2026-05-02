(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('cssdwashingformController', cssdwashingformController);

    function cssdwashingformController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true
        };
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentfilter.id = parseInt(modalConfig.params.id);
            $scope.currentfilter.smid = parseInt(modalConfig.params.storeMasterId);
            $scope.currentfilter.imid = parseFloat(modalConfig.params.itemMasterId)
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // console.log($scope.currentcontext);

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'CSSDManagement/CSSDPreparation/GetCSSDPreparationById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function() {
            $scope.confirmCallback();
        }
        $scope.clear = function() {
            $scope.item = {};
        }
        $scope.addNew = function() {
            $state.go('app.allergies', { id: 0 });
        }
        $scope.saveAndApprove = function() {
            $scope.item.SterileStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'CSSDManagement/CSSDPreparation/AddCSSDPreparation';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'CSSDManagement/CSSDPreparation/UpdateCSSDPreparation';
            }
            $scope.item.StoreMasterId = $scope.currentfilter.smid;
            $scope.item.ItemMasterId = $scope.currentfilter.imid;
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
            //  $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "WashingMachineType" },
                { "Key": "WashingType" },
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

        $scope.initLookup();
    }

    cssdwashingformController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();