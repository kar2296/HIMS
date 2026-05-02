(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReorderFormController', ReorderFormController);

    function ReorderFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };


        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.Id = modalConfig.params.id;
        $scope.currentcontext.ItemMasterId = modalConfig.params.itemmasterid;
        $scope.currentcontext.ItemCode = modalConfig.params.itemcode;
        $scope.currentcontext.ItemName = modalConfig.params.itemname;

        $scope.item = {
            IsActive: true,
            ActiveFrom: utl.Formatter.getCurrentDate(),
            PurchaseUomId: 1,
            RankId: 1,
            DiscountModeId: 2
        };

        $scope.backToList = function () {
            $state.go('app.reordersetuplist');
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
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {

                var options = {
                    action: 'pharmacy/ItemStoreMap/GetItemStoreMapById',
                    data: {
                        Id: $scope.currentcontext.Id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
            // $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'pharmacy/ItemStoreMap/UpdateItemStoreMap';

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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                // {
                //     "Key": "StoreMaster"
                // },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 5,
                            Value: 2
                        },
                        {
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        ]
                    },
                    Default: false
                }
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

    ReorderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();