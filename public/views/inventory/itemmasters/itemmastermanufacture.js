(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ItemmasterManufactureFormController', ItemmasterManufactureFormController);

    function ItemmasterManufactureFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            OrganizationId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsActive: true,
            isDisabled: false,
            Activefrom: utl.Formatter.getCurrentDate(),
            VendorTypeId:2
        };

        $scope.currentcontext = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        //$scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();
        $scope.getMaxId = function () {

            if (!$scope.currentcontext.id) {
                var options = {
                    action: 'pharmacy/vendormaster/GetMaxId',
                    data: {
                        Data: {}
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
            var StartingNr = '001';

            if (data)
                StartingNr = ZeroPadding(data, 3);

            $scope.prefix = '';
            StartingNr = 'MANU' + '' + StartingNr;

            if (StartingNr)
                $scope.item.VendorCode = StartingNr;

        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/vendormaster/GetVendorMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.vendormasters');
        }

        $scope.addNew = function () {
            $state.go('app.vendormasters', { id: 0 });
        }
        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg('Vendor Code Already Exist');
            }
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
            else
            $scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/vendormaster/AddVendorMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/vendormaster/UpdateVendorMaster';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getMaxId();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "VendorType" },
                { "Key": "BusinessDomain" },
                { "Key": "DistributionType" },
                { "Key": "PaymentTerms" },
                { "Key": "CurrencyCode" }

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

    ItemmasterManufactureFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();