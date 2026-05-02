(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LHRCVoucherFormController', LHRCVoucherFormController);

    function LHRCVoucherFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            CreatedBy: utl.Session.getCurrentUserId(),
            VoucherDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            PaymentTypeId: 1
        };
        $scope.VoucherDetails = [];
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.addNewLineItem = function () {
            var voucherDetail = {
                Id: 0,
                PatientId: null,
                AmbulanceName: '',
            };

            if ($scope.currentcontext.id > 0) {
                voucherDetail.LHRCVoucherId = $scope.currentcontext.id;
            }
            $scope.VoucherDetails.push(voucherDetail);
        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'Billing/LHRCVoucher/GetLHRCVoucherById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };
        $scope.applyVisibilityRules = function () {
            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.CanShowSave = true;
                $scope.CanShowSaveandApprove = true;
                $scope.CanShowCancel = false;
            }
            if ($scope.item.VoucherStatusId == 1) {
                $scope.CanShowSave = false;
                $scope.CanShowSaveandApprove = true;
                $scope.CanShowCancel = false;
            }
            if ($scope.item.VoucherStatusId == 2) {
                $scope.CanShowSave = false;
                $scope.CanShowSaveandApprove = false;
                $scope.CanShowCancel = true;
            }
            if ($scope.item.VoucherStatusId == 3) {
                $scope.CanShowSave = false;
                $scope.CanShowSaveandApprove = false;
                $scope.CanShowCancel = false;
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.VoucherDetails = res.Data || [];
            for (var idx in $scope.VoucherDetails) {
                $scope.VoucherDetails[idx].Id = 0;
            }
            $scope.addNewLineItem();
        };

        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
                    ]
                };
                var options = {
                    action: 'Billing/LHRCVoucherDetail/GetLHRCVoucherDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };
        $scope.save = function () {
            // $scope.item.VoucherStatusId = 1;
            $scope.saveItem(1);
        };
        $scope.saveAndApprove = function () {
            // $scope.item.VoucherStatusId = 2;
            $scope.saveItem(2);
        };
        $scope.cancel = function () {
            // $scope.item.VoucherStatusId = 3;
            $scope.saveItem(3);
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function (VoucherStatusId) {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var lines = getLinesForSave();
            var actionName = 'Billing/LHRCVoucher/AddLHRCVoucher';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/LHRCVoucher/UpdateLHRCVoucher';
            }
            $scope.item.VoucherStatusId = VoucherStatusId;
            var inputData = { Header: $scope.item, Details: lines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.PrintLHRCVoucher = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
            action: 'Billing/LHRCVoucher/PrintLHRCVoucher',
            data: inputData,
            type: 'post'
            };
            utl.Http.doPrint(options);

        };
        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.VoucherDetails) {
                var item = $scope.VoucherDetails[idx];
                if ($scope.item.VoucherAmount != '') {
                    item.PatientId = $scope.item.PatientId;
                    item.AmbulanceName = $scope.item.AmbulanceName;
                    item.DriverName = $scope.item.DriverName;
                    item.VehicleName = $scope.item.VehicleName;
                    item.PayTo = $scope.item.PayTo;
                    item.VoucherAmount = $scope.item.VoucherAmount;
                    item.Mobile = $scope.item.Mobile;
                    item.Remarks = $scope.item.Remarks;
                    result.push(item);
                }
            }
            return result;
        }
        $scope.clear = function () {
            $scope.item = {};
        };
        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    var pid = $scope.item.PatientId;
                    if (!pid) {
                        utl.Alert.showErrorMsg($translate.instant('Not a Registered Patient'));
                        $('#pid').val("");
                    }
                }
            }
        };

        $scope.numberwithdecimal = function (e) {
            if ((e.charCode >= 48 && e.charCode <= 57) || (e.charCode == 46)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        function loadData() {
            $scope.getItem();
            $scope.getDetails();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "User" },
                { "Key": "VoucherType" },
                { "Key": "VoucherStatus" },
                { "Key": "PaymentType" },
                { "Key": "Bank" },
                { "Key": "CardType" },
                { "Key": "Terminal" },
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

    LHRCVoucherFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();