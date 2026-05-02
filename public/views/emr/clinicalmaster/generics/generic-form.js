(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('genericFormController', genericFormController);

    function genericFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsPrescribed: false,
            IsActive: true,
            ScheduleTypeId: -1
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/GenericMaster/GetGenericMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            if ($scope.item.IsActive === true) { $scope.item.ActiveStatusId = 2; } else { $scope.item.ActiveStatusId = 3; }
            $scope.saveItem();
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.addNew = function () {
            $state.go('app.generics', { id: 0 });
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/GenericMaster/AddGenericMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/GenericMaster/UpdateGenericMaster';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        if (!$scope.currentcontext.id || $scope.currentcontext.id === 0) {
            $scope.item.IsActive = true;
        }

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getMaxId();
        };

        $scope.getMaxId = function () {
            $scope.genericmasterclinicalcode =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'genericmasterclinicalcode');
            if ($scope.genericmasterclinicalcode && !$scope.currentcontext.id) {
                var options = {
                    action: 'clinicalmaster/GenericMaster/GetMaxId',
                    data: {
                        Id: 0
                    },
                    type: 'post',
                    onComplete: $scope.getMaxIdCallback
                };
                utl.Http.doAction(options);
            }
        }

        function ZeroPadding(num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }

        $scope.getMaxIdCallback = function (scope, data, options, hasError) {
            var StartingNr = '0001';

            if (data)
                StartingNr = ZeroPadding(data, 4);

            $scope.genericmasterclinicalcodeprefix =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'genericmasterclinicalcodeprefix');
            if ($scope.genericmasterclinicalcodeprefix) {
                StartingNr = $scope.genericmasterclinicalcodeprefix + '' + StartingNr;
            }

            if (StartingNr)
                $scope.item.Code = StartingNr;

        }


        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AllergenType" },
                { "Key": "ScheduleType" }
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

    genericFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();