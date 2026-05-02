(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('prescriptionalternatesController', prescriptionalternatesController);

    function prescriptionalternatesController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.currentfilter = {
            title: 'Alternates for ',
            drugcode: null,
            drugname: null,
            genericid: 0,
            drugid: 0,
            pharmacyid: 0,
            lineindex: null
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

            if (parseInt(modalConfig.params.drugid) > 0) {
                $scope.currentfilter.drugid = parseInt(modalConfig.params.drugid);
            } else {
                $scope.currentfilter.drugid = 0;
            }

            if (parseInt(modalConfig.params.genericid) > 0) {
                $scope.currentfilter.genericid = parseInt(modalConfig.params.genericid);
                if (parseInt(modalConfig.params.pharmacyid) > 0) {
                    $scope.currentfilter.pharmacyid = parseInt(modalConfig.params.pharmacyid);
                } else {
                    $scope.currentfilter.pharmacyid = 0;
                }
            } else {
                $scope.currentfilter.genericid = 0;
                $scope.currentfilter.pharmacyid = 0;
            }

            $scope.currentfilter.drugcode = modalConfig.params.drugcode;
            $scope.currentfilter.drugname = modalConfig.params.drugname;
            $scope.currentfilter.lineindex = modalConfig.params.lineindex;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentfilter.genericid > 0) {
                var inputData = {
                    Params: [
                        { Key: 8, Value: $scope.currentfilter.genericid },
                        { Key: 21, Value: $scope.currentfilter.pharmacyid }
                    ]
                };

                var options = {
                    action: 'pharmacy/itemmaster/GetGenericItems',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.genericname.lbl'));

                return false;
            }
        };


        $scope.backToList = function () {
            $state.go('app.prescriptionalternates', { genericid: 0 });
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "GenericMaster.Code", displayName: $translate.instant('billing.pharmacyalternates.genericcode.lbl') },
                { field: "GenericMaster.GenericName", displayName: $translate.instant('billing.pharmacyalternates.genericname.lbl') },
                { field: "DrugCode", displayName: $translate.instant('billing.pharmacyalternates.drugcode.lbl') },
                { field: "DrugName", displayName: $translate.instant('billing.pharmacyalternates.drugname.lbl') },
                { field: "StockItem.Quantity", displayName: $translate.instant('billing.pharmacyalternates.availableqty.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.confirmCallback({ ItemData: row.entity, drugid: $scope.currentfilter.drugid, lineindex: $scope.currentfilter.lineindex });
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
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

    prescriptionalternatesController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();