(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemalertinfoController', itemalertinfoController);

    function itemalertinfoController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.currentfilter = {
            title: 'ROL for ',
            itemcode: null,
            itemname: null,
            genericid: 0,
            itemmasterid: 0,
            storemasterid: 0,
            lineindex: null
        };

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

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // if ($scope.currentfilter.genericid > 0) {
            var inputData = {
                Params: [
                    // {
                    //     Key: 8,
                    //     Value: $scope.currentfilter.genericid
                    // },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.itemmasterid
                    }
                ]
            };

            var options = {
                action: 'pharmacy/ItemStoreMap/GetItemStoreMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
            // } else {
            //     utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.genericname.lbl'));

            //     return false;
            // }
        };


        $scope.backToList = function () {
            $state.go('app.pharmacyalternates', {
                genericid: 0
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                $scope.confirmCallback({
                    ItemData: entity,
                    itemid: $scope.currentfilter.itemmasterid,
                    lineindex: $scope.currentfilter.lineindex
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "MinQty", displayName: $translate.instant('Min Qty') },
                { field: "MaxQty", displayName: $translate.instant('Max Qty') },
                { field: "LeadTime", displayName: $translate.instant('Lead Time') },
                { field: "ROLQty", displayName: $translate.instant('Reorder Qty') },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            // enableFullRowSelection: true
        };

        // vm.gridConfig.enableRowSelection = true;
        // vm.gridConfig.multiSelect = false;
        // vm.gridConfig.onRegisterApi = function (gridApi) {
        //     $scope.gridApi = gridApi;
        //     gridApi.selection.on.rowSelectionChanged($scope, function (entity) {
        //         $scope.confirmCallback({
        //             ItemData: entity,
        //             itemid: $scope.currentfilter.itemmasterid,
        //             lineindex: $scope.currentfilter.lineindex
        //         });
        //     });
        // };

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

    itemalertinfoController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();