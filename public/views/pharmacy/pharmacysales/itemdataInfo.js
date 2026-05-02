(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemdataInfoController', itemdataInfoController);

    function itemdataInfoController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.currentfilter = {
            title: 'Alert for ',
            itemcode: null,
            itemname: null,
            genericid: 0,
            itemmasterid: 0,
            storemasterid: 0,
            lineindex: null
        };
        $scope.Item = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

            if (parseInt(modalConfig.params.itemmasterid) > 0) {
                $scope.currentfilter.itemmasterid = parseInt(modalConfig.params.itemmasterid);
            } else {
                $scope.currentfilter.itemmasterid = 0;
            }

            if (parseInt(modalConfig.params.genericid) > 0) {
                $scope.currentfilter.genericid = parseInt(modalConfig.params.genericid);
                if (parseInt(modalConfig.params.storemasterid) > 0) {
                    $scope.currentfilter.storemasterid = parseInt(modalConfig.params.storemasterid);
                } else {
                    $scope.currentfilter.storemasterid = 0;
                }
            } else {
                $scope.currentfilter.genericid = 0;
                $scope.currentfilter.storemasterid = 0;
            }

            $scope.currentfilter.itemcode = modalConfig.params.itemcode;
            $scope.currentfilter.itemname = modalConfig.params.itemname;
            $scope.currentfilter.lineindex = modalConfig.params.lineindex;
        }
        $scope.backToList = function () {
            $state.go('app.pharmacy-sales', {
                genericid: 0
            });
        };
        $scope.getItemInfoCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            if ($scope.item.IsLASADrug == true) {
                $scope.Item.LASA = 'Yes';
            }
            if ($scope.item.IsLASADrug == false) {
                $scope.Item.LASA = 'No';
            }
            if ($scope.item.IsEmergency == true) {
                $scope.Item.Emergency = 'Yes';
            }
            if ($scope.item.IsEmergency == false) {
                $scope.Item.Emergency = 'No';
            }
            if ($scope.item.IsHighAlert == true) {
                $scope.Item.HighAlert = 'Yes';
            }
            if ($scope.item.IsHighAlert == false) {
                $scope.Item.HighAlert = 'No';
            }
            if ($scope.item.IsHighAlert == true) {
                $scope.Item.HighAlert = 'Yes';
            }
            if ($scope.item.IsHighAlert == false) {
                $scope.Item.HighAlert = 'No';
            }
            $scope.Item.ScheduleType = $scope.item.ScheduleType.Description;
        };

        $scope.getItemInfo = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentfilter.itemmasterid
                }]
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItemInfo();
        };

        $scope.initLookup = function () {
            var inputData = [];
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

    itemdataInfoController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();