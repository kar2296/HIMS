(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipadjustagainstAdvanceFormController', ipadjustagainstAdvanceFormController);

    function ipadjustagainstAdvanceFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        var vm = this;

        $scope.HitAdjusted = 0;
        $scope.advanceDetails = [];
        $scope.receiptwithadjustmentDetail = [];
        $scope.encounter = {};
        $scope.currentcontext = {
            id: -1,
            ismodal: modalConfig && modalConfig.params ? true : false,
            BalanceAmount: 0,
            ipflag: 0,
        };
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if (modalConfig.params && modalConfig.params.id)
            $scope.currentcontext.id = modalConfig.params.id;
        if (modalConfig.params && modalConfig.params.EncounterId)
            $scope.currentcontext.EncounterId = modalConfig.params.EncounterId;
        if (modalConfig.params && modalConfig.params.balanceamount)
            $scope.currentcontext.BalanceAmount = modalConfig.params.balanceamount;

        if (modalConfig.params && modalConfig.params.ipflag)
            $scope.currentcontext.ipflag = modalConfig.params.ipflag;

        $scope.getList = function(PatientId) {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: PatientId
                    },
                    {
                        Key: 4,
                        Value: 5
                    },
                    {
                        Key: 5,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.SingleSelection = function(SelectedItem) {
            for (var idx in $scope.advanceDetails) {
                var adjdata = $scope.advanceDetails[idx];
                adjdata.IsAdjustmentReceipt = true;
                if (SelectedItem.Id == adjdata.Id) {
                    SelectedItem.IsSelected = true;
                    adjdata.AdjustAmount = 0;
                } else {
                    adjdata.IsSelected = false;
                    adjdata.AdjustAmount = 0;
                }
            }
        }

        $scope.getListCallback = function(scope, data, options, hasError) {
            var TotAmountAvailable = 0;
            for (var idx in data.Data) {
                var recdata = data.Data[idx];
                recdata.IsSelected = false;
                recdata.AmountPaid = parseFloat(recdata.AmountPaid).toFixed(2);
                recdata.AmountAdjusted = parseFloat(recdata.AmountAdjusted).toFixed(2);
                var advbalance = recdata.AmountPaid - recdata.AmountAdjusted;
                if (advbalance <= 0) {
                    recdata.FullAmountAdjusted = true;
                    recdata.AmountAvailable = 0;
                    recdata.AdjustAmount = 0;
                } else {
                    recdata.FullAmountAdjusted = false;
                    recdata.AmountAvailable = advbalance;
                    recdata.AdjustAmount = 0;
                }
                TotAmountAvailable += recdata.AmountAvailable;
                $scope.advanceDetails.push(recdata);
            }

            if (!$scope.currentcontext.BalanceAmount && $scope.currentcontext.ipflag) {
                $scope.currentcontext.BalanceAmount = TotAmountAvailable;
            }

        };


        $scope.getEncounterInfo = function() {
            if ($scope.currentcontext.EncounterId) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.EncounterId
                    }]
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getEncounterInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getEncounterInfoCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.encounter.PatientName = '';
                if ($scope.encounter.Patient &&
                    $scope.encounter.Patient.Title &&
                    $scope.encounter.Patient.Title.Description)
                    $scope.encounter.PatientName += $scope.encounter.Patient.Title.Description;

                if ($scope.encounter.Patient &&
                    $scope.encounter.Patient.FirstName)
                    $scope.encounter.PatientName += ' ' + $scope.encounter.Patient.FirstName;

            }
        }


        $scope.computeAdvance = function(item) {
            if (parseFloat(item.AdjustAmount) > 0 && parseFloat(item.AdjustAmount) > (parseFloat(item.AmountPaid) - parseFloat(item.AmountAdjusted))) {
                item.AdjustAmount = 0;
                utl.Alert.showErrorMsg('Adjusting Amount Should Not exceed Actual Advance Paid');
            }
        };

        $scope.AdjustAdvance = function() {
            var AdjustingAmount = 0;
            $scope.receiptwithadjustmentDetail = [];
            for (var idx in $scope.advanceDetails) {
                var adjdata = $scope.advanceDetails[idx];
                if (adjdata.IsSelected) {
                    adjdata.IsAdjustmentReceipt = true;
                    adjdata.AdjustmentReceiptId = null;
                    adjdata.RoundOffValue = 0;
                    adjdata.PatientBillId = 0;
                    adjdata.EncounterTypeId = $scope.encounter.EncounterTypeId;
                    adjdata.AdjustAmount = parseFloat(adjdata.AdjustAmount)
                    if (adjdata.AdjustAmount > 0) {
                        AdjustingAmount = AdjustingAmount + parseFloat(adjdata.AdjustAmount);
                        $scope.receiptwithadjustmentDetail.push(adjdata);
                    }
                }
            }
            if (AdjustingAmount > $scope.currentcontext.BalanceAmount) {
                utl.Alert.showErrorMsg('Adjusting Amount Should Not Greater Than Actual Bill/Due Amount.');
                $scope.receiptwithadjustmentDetail = [];
                return false;
            } else if (AdjustingAmount <= 0) {
                utl.Alert.showErrorMsg('Adjusting Amount should not be zero...');
                $scope.receiptwithadjustmentDetail = [];
                return false;
            } else {
                var PatientName = '';
                if ($scope.encounter.PatientName) PatientName = $scope.encounter.PatientName;
                $scope.receiptdata = {
                    AmountPaid: AdjustingAmount,
                    CurrencyTypeId: 1,
                    DepartmentId: $scope.encounter.DepartmentId,
                    TDSAmount: 0,
                    Disallowance: 0,
                    DoctorId: $scope.encounter.DoctorId,
                    EncounterId: $scope.encounter.Id,
                    EncounterTypeId: $scope.encounter.EncounterTypeId,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    GuarantorId: $scope.encounter.GuarantorId,
                    GuarantorTypeId: $scope.encounter.GuarantorTypeId,
                    OrganizationId: $scope.encounter.OrganizationId,
                    PatientBillId: 0,
                    PatientId: $scope.encounter.PatientId,
                    PatientName: PatientName,
                    PaymentTypeId: 7, // Adjustment
                    ReceiptDateTime: new Date(),
                    ReceiptGeneratedById: utl.Session.getCurrentUserId(),
                    ReceiptStatusId: 1, // Completed
                    ReceiptTypeId: 6, // Adjustment
                };

                $scope.HitAdjusted = 1;
                var actionName = 'billing/PatientPaymentDetails/ManageReceiptWithAdjustment';
                var options = {
                    action: actionName,
                    data: {
                        Data: [{
                            Receipt: $scope.receiptdata,
                            Adjustment: $scope.receiptwithadjustmentDetail
                        }]
                    },
                    type: 'post',
                    onComplete: $scope.confirmCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounterInfo();
            $scope.getList($scope.currentcontext.id);
            $scope.action();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "ReceiptType"
                },
                {
                    "Key": "ReceiptStatus"
                },
                {
                    "Key": "CardType"
                }
            ]
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

    ipadjustagainstAdvanceFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();