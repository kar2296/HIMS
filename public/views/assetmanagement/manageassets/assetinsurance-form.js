(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetInsuranceFormController', assetInsuranceFormController);

    function assetInsuranceFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),


        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.assetid = parseInt($stateParams.id);
            $scope.item.AssetCode = $stateParams.AssetCode;
            $scope.item.AssetName = $stateParams.AssetName;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.AssetCode = $stateParams.AssetCode;
            $scope.item.AssetName = $stateParams.AssetName;
            if (data.ActiveStatusId == 2)
                $scope.item.isRequested = true;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/AssetInsurance/GetAssetInsuranceById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.assettab.AssetInsurance', {
                id: 0
            });
        }

        $scope.SetChangePeriodEnd = function (item) {
            item.Periodenddate = moment(item.PeriodEnd);
            $scope.checkinstalldate(item);
        };
        $scope.checkinstalldate = function (item) {
            if (item.Periodenddate < utl.Formatter.getCurrentDate()) {
                utl.Alert.showErrorMsg($translate.instant('Installation Date Should Be a Future Date'));
                $scope.item.PeriodEnd = '';
            }
        };

        $scope.Save = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
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

            var actionName = 'AssetManagement/AssetInsurance/AddAssetInsurance';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/AssetInsurance/UpdateAssetInsurance';
            }
            $scope.item.AssetId = $scope.currentcontext.assetid;

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.numberwithDeconly = function (e) {
            if ((e.charCode >= 48 && e.charCode <= 57) || (e.charCode == 46)) {
                return;
            } else
                e.preventDefault();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PolicyType"
            },
            {
                "Key": "INSURANCE"
            },
            {
                "Key": "ActiveStatus"
            }
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

    assetInsuranceFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();