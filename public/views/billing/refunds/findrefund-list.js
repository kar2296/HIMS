(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findrefundListController', findrefundListController);

    function findrefundListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.patientid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/opbilling/Getopbillings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.backToList = function () {
            $state.go('app.opbilling', { opbillingid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/opbilling/Deleteopbilling',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('', { opbillingid: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "Date", displayName: $translate.instant('billing.findbill-list.date.lbl') },

                { field: "IpNumber", displayName: $translate.instant('billing.findbill-list.ipnumber.lbl') },
                { field: "PatientName", displayName: $translate.instant('billing.findbill-list.patientname.lbl') },
                { field: "ConsDoctor", displayName: $translate.instant('billing.findbill-list.consdoctor.lbl') },
                                { field: "ConsDoctor", displayName: $translate.instant('billing.receipt-form.gurantorname.lbl') },

                { field: "Status", displayName: $translate.instant('billing.findbill-list.status.lbl') },
                { field: "BillAmount", displayName: $translate.instant('billing.findbill-list.billamount.lbl') },

                { field: "PaidAmount", displayName: $translate.instant('billing.findbill-list.paidamount.lbl') },
                { field: "DueAmount", displayName: $translate.instant('billing.findbill-list.dueamount.lbl') },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "opbillingType" }
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

    findrefundListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();