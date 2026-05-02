(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storemasterStaffDiscountController', storemasterStaffDiscountController);

    function storemasterStaffDiscountController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.StoreMasterId = modalConfig.params.StoreMasterId;
        $scope.currentcontext.Id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            IsActive: true,
            RdoUser: false,
            FacilityId: utl.Session.getCurrentFacilityId(),
            Status: 1,
            UserTypeId: -1,
            StaffDiscountTypeId: 1,
            StaffDiscountPercentage: 0,
            ActiveFrom: utl.Formatter.getCurrentDate()
        };

        $scope.item.StoreMasterId = $scope.currentcontext.StoreMasterId;
        $scope.item.StoreCode = modalConfig.params.StoreCode;
        $scope.item.StoreName = modalConfig.params.StoreName;
        $scope.item.StoreTypeId = modalConfig.params.StoreTypeId;
        $scope.item.StoreType = modalConfig.params.StoreType;

        var IsProfile = modalConfig.params.IsProfile;
        var StoreCode = modalConfig.params.StoreCode;
        var StoreName = modalConfig.params.StoreName;
        var StoreType = modalConfig.params.StoreType;

        $scope.getStoreStaffDiscount = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.Id }
                ]
            };

            var options = {
                action: 'pharmacy/StaffDiscount/GetStaffDiscounts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getStoreStaffDiscountCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getStoreStaffDiscountCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.item.StaffDiscountId = $scope.item.Id;
            if ($scope.item.StoreMaster) {
                $scope.item.StoreTypeId = $scope.item.StoreMaster.StoreTypeId;
                $scope.item.StoreCode = $scope.item.StoreMaster.StoreCode;
                $scope.item.StoreName = $scope.item.StoreMaster.StoreName;
            }
            if ($scope.item.StoreType) {
                $scope.item.StoreType = $scope.item.StoreType.Description;
            }
            $scope.item.RdoUser = true;
            $scope.currentcontext.StoreMasterId = $scope.item.StoreMasterId;
            if ($scope.item.ActiveStatusId == 2) {
                $scope.item.IsActive = true;
            } else {
                $scope.item.IsActive = false;
            }
        };

        $scope.backToList = function () {
            $state.go('app.storemastertab.storemasterstaffdiscounts');
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'THIS_USER_ALREADY_MAPPED') {
                utl.Alert.showErrorMsg('Staff Already Mapped With This Store');
            }
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/StaffDiscount/AddStaffDiscount';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'pharmacy/StaffDiscount/UpdateStaffDiscount';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            if ($scope.item.UserId > 0)
                utl.Http.doAction(options);
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.UserTypeId = selectedItem.UserTypeId;
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.FacilityId },
                    { Key: 3, Value: $scope.item.UserTypeId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.StoreMaster = IsProfile ? $scope.lookup.StoreMaster : $scope.lookup.StoreMaster;
            if ($scope.currentcontext.Id > 0) {
                $scope.getStoreStaffDiscount();
            } else {
                $scope.getMasterStore();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.item.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                { "Key": "Facility" },
                { "Key": "UserType" },
                { "Key": "StaffDiscountType" }
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

    storemasterStaffDiscountController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();