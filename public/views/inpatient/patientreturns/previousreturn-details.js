(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PreviousReturnDetailController', PreviousReturnDetailController);

    function PreviousReturnDetailController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            TotalQuantity: 0
        };
        $scope.currentfilter = {
            title: 'Previous Return Details Of: ',
            patientmrn: null,
            patientname: null
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentfilter.patientid = parseInt(modalConfig.params.patientid);
            // $scope.currentfilter.patientmrn = modalConfig.params.patientmrn;
            // $scope.currentfilter.patientname = modalConfig.params.patientname;
            $scope.currentfilter.encounterid = modalConfig.params.encounterid;
            $scope.currentfilter.storemasterid = modalConfig.params.storemasterid;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.stockDetails = res.Data || [];
            for (var idx in $scope.stockDetails) {
                var stockitem = $scope.stockDetails[idx];
                if (stockitem.PatientId > 0) {
                    $scope.item.TotalAmount =$scope.item.TotalAmount+(stockitem.TotalNetAmount);
                }
            }

            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.currentfilter.patientid },
                    { Key: 16, Value: $scope.currentfilter.encounterid },
                    { Key: 9, Value: $scope.currentfilter.storemasterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.backToList = function () {
            $state.go('app.purchaseorder', { itemmasterid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/purchaseorder/DeleteStockSerialItem',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('', { itemid: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "ToStore.StoreName", displayName: $translate.instant('inventory.stockdetails.store.lbl') },
                { field: "PatientReturnNumber", displayName: $translate.instant('inventory.stockdetails.returnno.lbl') },
                { field: "ReturnedUser.FirstName", displayName: $translate.instant('inventory.stockdetails.returnedby.lbl') },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findbill-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PatientReturnDateTime'></ngformatdate>"
                },
                // {
                //     field: "PatientReturnDateTime",
                //     displayName: $translate.instant('inventory.stockdetails.returneddate.lbl'),
                //     cellTemplate: "<ngformatdate date-val='row.entity.PatientReturnDateTime'></ngformatdate>"
                // },
                { field: "TotalNetAmount", displayName: $translate.instant('inventory.stockdetails.netamount.lbl') },
                { field: "PatientReturnStatus.Description", displayName: $translate.instant('inventory.stockdetails.status.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "StoreMaster" },
                { "Key": "Facility" }
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

    PreviousReturnDetailController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();