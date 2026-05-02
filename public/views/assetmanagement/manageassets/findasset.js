(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findassetListController', findassetListController);

    function findassetListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                AssetTypeId: -1,
                ManufacturerId: -1,
                ActiveStatusId: -1,
                FacilityId: utl.Session.getCurrentFacilityId(),
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'select', translate: 'assetmanagement.assettransfer.institution.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 0, c: 0 } },
                    { type: 'select', translate: 'assetmanagement.assets.type.lbl', model: 'AssetTypeId', options: $scope.lookup.AssetType, position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'assetmanagement.assets.description.lbl', model: 'Description', position: { r: 0, c: 2 } },
                    { type: 'text', translate: 'assetmanagement.assets.modelname.lbl', model: 'ModelName', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'assetmanagement.assets.modelno.lbl', model: 'ModelNum', position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'assetmanagement.findasset.status.lbl', model: 'ActiveStatusId', options: $scope.lookup.ActiveStatus, position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'assetmanagement.findasset.manufacturer.lbl', model: 'ManufacturerId', options: $scope.lookup.Manufacturer, position: { r: 2, c: 0 } },
                    { position: { r: 2, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }
            $scope.getList();
        }

        //Dynamic form  ends
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
        };

        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.modeldata.AssetTypeId },
                    { Key: 4, Value: $scope.modeldata.ActiveStatusId },
                    { Key: 5, Value: $scope.modeldata.ModelNum },
                    { Key: 6, Value: $scope.modeldata.ModelName },
                    { Key: 7, Value: $scope.modeldata.Description },
                    { Key: 8, Value: $scope.modeldata.ManufacturerId },
                    { Key: 17, Value: $scope.modeldata.FacilityId },
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'AssetManagement/Asset/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            columnDefs: [
                { field: "AssetType.Description", displayName: $translate.instant('assetmanagement.assets.type.lbl') },
                { field: "Description", displayName: $translate.instant('assetmanagement.assets.description.lbl') },
                { field: "ModelName", displayName: $translate.instant('assetmanagement.assets.modelname.lbl'), },
                { field: "ModelNum", displayName: $translate.instant('assetmanagement.assets.modelno.lbl'), },
                { field: "ActiveStatus.Description", displayName: $translate.instant('assetmanagement.assets.status.lbl') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.confirmCallback({ aid: row.entity.Id });
            });
        };
        //Grid selection related code ends

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {"Key": "Company" },
                { "Key": "AssetType" },
                { "Key": "Manufacturer" },
                { "Key": "ModelNum" },
                { "Key": "ModelName" },
                { "Key": "Description" },
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

    findassetListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();