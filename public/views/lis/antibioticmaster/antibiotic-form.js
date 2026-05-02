(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('AntibioticFormController', AntibioticFormController);

    function AntibioticFormController($scope, $stateParams, $state, $translate, utl, modalConfig, $uibModalInstance) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            AssetId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.currentcontext = {};
        // $scope.currentcontext.id = $stateParams.id;
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
                    action: 'lis/AntibioticMaster/GetAntibioticMasterById',
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
        $scope.saveandApprove = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.backToList = function() {
            $scope.confirmCallback();
        }
        $scope.clear = function() {
            $scope.item = {};
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'lis/AntibioticMaster/AddAntibioticMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/AntibioticMaster/UpdateAntibioticMaster';
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
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "OrgIsolation" },
                { "Key": "ActiveStatus" },
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

    AntibioticFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'modalConfig', '$uibModalInstance'];

})();