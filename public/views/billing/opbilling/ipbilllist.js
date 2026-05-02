(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipBillListController', ipBillListController);

    function ipBillListController($scope, $filter, $stateParams,
        $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentcontext.eid = 0;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.SelectAll = function (chk) {
            $scope.PatientBillDetails.forEach((val, idx) => {
                if (!val.isCompleted) {
                    val.isEditable = chk;
                }
            });
        };

        $scope.calcAmt = function () {
            $scope.currentcontext.BillAmount = 0;
            $scope.currentcontext.BillDiscount = 0;
            $scope.currentcontext.TotalNet = 0;
            $scope.PatientBillDetails.forEach((val, idx) => {
                if (val.isEditable) {
                    val.GrossAmount = parseFloat(val.Quantity) * parseFloat(val.Rate);
                    $scope.currentcontext.BillAmount = parseFloat($scope.currentcontext.BillAmount) + parseFloat(val.GrossAmount);
                    val.Amount = (parseFloat(val.Quantity) * parseFloat(val.Rate)) - parseFloat(val.DiscountAmount);
                    $scope.currentcontext.TotalNet += val.Amount;
                    $scope.currentcontext.BillDiscount += parseFloat(val.DiscountAmount);
                }
            });
        };

        $scope.load = function () {
            var SelectedIPDetailList = getSelectionRows();
            if (SelectedIPDetailList.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.notselection-msg.lbl'));
                return;
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.opbilling-list.loadipbill.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.loadIPDetails,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };
        $scope.loadIPDetails = function () {
            var SelectedIPDetailList = getSelectionRows();
            $scope.confirmCallback({ data: SelectedIPDetailList });
        }

        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if (item.isEditable)
                    currentSelection.push(item);
            }
            return currentSelection;
        }

        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        };

        $scope.canEditable = function (item, flag) {
            item.isEditable = flag;
            $scope.calcAmt();
        };


        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.PatientBillDetails = res.Data;
            $scope.PatientBillDetails.forEach((v, i) => {
                v.isEditable = false;
                if (v.Rate > 0) v.isCompleted = false;
                else v.isCompleted = true;
            });
            $scope.calcAmt();
        };

        $scope.getDetails = function () {
            var FromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.eid },
                    { Key: 4, Value: 3 },
                    { Key: 5, Value: $scope.currentfilter.ServiceCategoryId },
                    { Key: 6, Value: $scope.currentfilter.FromDate },
                    { Key: 7, Value: $scope.currentfilter.ToDate },
                    { Key: 12, Value: true },
                ]
            };
            var options = {
                action: 'Billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            $scope.Encounter = data.Data[0];
            $scope.currentcontext.PatientId = $scope.Encounter.PatientId;
            $scope.currentfilter.FromDate = $scope.Encounter.AdmissionDate;
            $scope.currentfilter.ToDate = new Date();
            $scope.getDetails();
        };

        $scope.getEncounters = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid }
                ]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounters();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ServiceCategory" },
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

    ipBillListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];


})();