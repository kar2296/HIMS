(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('manageDevicesFormController', manageDevicesFormController);

    function manageDevicesFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.item.OrganizationId = utl.Session.getCurrentOrgId(),
            $scope.currentcontext = {};
        $scope.currentcontext.id = modalConfig.params.id;
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/Device/GetDeviceById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.addNew = function () {
            $state.go('app.managedeviceform', { id: 0 });
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveAndApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            }
            else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'pharmacy/Device/AddDevice';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/Device/UpdateDevice';
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" },
                {
                    Key: 'DeviceManufacturer',
                    Request: {
                        Params: [{ Key: 4, Value: utl.Session.getCurrentFacilityId() }]

                    }
                },
            ]
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

    manageDevicesFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();