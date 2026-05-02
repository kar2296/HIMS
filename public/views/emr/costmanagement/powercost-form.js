(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('powerCostFormController', powerCostFormController);

    function powerCostFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
			 FacilityId:  utl.Session.getCurrentFacilityId(),
    
            BatteryBackupId: 1 //no-battery
        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.costdetailid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'CostManagement/PowerCost/GetPowerCostById',
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
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.costtab.powercost', { id: 0 });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'CostManagement/PowerCost/AddPowerCost';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'CostManagement/PowerCost/UpdatePowerCost';
            }
            $scope.item.CostDetailId = $scope.currentcontext.costdetailid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        //autosearch related code starts - 
        vm.servicerequestcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Asset Name', field: 'AssetName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-assetname' },
                { header: 'Asset Type', field: 'AssetTypeId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-assettype' },
                { header: 'Serial Number', field: 'Serial', datatype: 'string', headercls: 'td-name', fieldcls: 'td-serialnumber' },
                { header: 'Model Number', field: 'ModelNum', datatype: 'string', headercls: 'td-name', fieldcls: 'td-modelnumber' },
                { header: 'Manufacturer', field: 'ManufacturerId', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Vendor', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-vendor' }
            ],
            searchparams: {},
            result: {},
            api: 'AssetManagement/Asset/GetAssets',
            formatdisplay: formatselectedpurchaseitem,
            presearch: presearchpurchaseitem,
            postsearch: postsearchpurchaseitem
        };

        function formatselectedpurchaseitem() {
            var selectedItem = vm.servicerequestcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.AssetName].join(' ');
                $scope.item.ManufacturerId = selectedItem.ManufacturerId;
                $scope.item.VendorId = selectedItem.VendorId;
                $scope.item.AssetTypeId = selectedItem.AssetTypeId;
                $scope.item.Serial = selectedItem.Serial;
                $scope.item.AssetName = selectedItem.AssetName;
                $scope.item.ModelNum = selectedItem.ModelNum;
            } else if (vm.servicerequestcontrolconfig.rowdata) {
                result = [vm.servicerequestcontrolconfig.rowdata.AssetName,
                vm.servicerequestcontrolconfig.rowdata.AssetTypeId,
                vm.servicerequestcontrolconfig.rowdata.Serial,
                vm.servicerequestcontrolconfig.rowdata.ModelNum,
                vm.servicerequestcontrolconfig.rowdata.ManufacturerId,
                vm.servicerequestcontrolconfig.rowdata.VendorId,
                ].join(' ');
            }
            return result;
        }

        function presearchpurchaseitem() {
            var query = vm.servicerequestcontrolconfig.query;

            //Search only active 
            var inputData = {
                Params: [
                    // //  { Key: 4, Value: $scope.item.AssetName },
                    // { Key: 4, Value: $scope.item.ActiveStatusId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.servicerequestcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 14, Value: query });
            }

            vm.servicerequestcontrolconfig.searchparams = inputData;
        }

        function postsearchpurchaseitem() {
            for (var idx in vm.servicerequestcontrolconfig.result) {
                var item = vm.servicerequestcontrolconfig.result[idx];
                item.AssetName = item.AssetName;
                item.AssetTypeId = item.AssetType.Description;
                item.Serial = item.Serial;
                item.ModelNum = item.ModelNum;
                item.ManufacturerId = item.Manufacturer.Description;
                item.VendorId = item.VendorId;
            }
        }
        //autosearch related code ends - - 
        $scope.computeAmount = function (item) {
            item.Cost = item.KWHunit * 7;
        }
         $scope.computepowercost = function (item) {
            item.PowerCost = item.Cost/item.AvgProcedure;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PowerPhase" },
                { "Key": "BatteryBackup" },
                { "Key": "Wattage" }
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

    powerCostFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();