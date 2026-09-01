(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GeneralExpensesFormController', GeneralExpensesFormController);

    function GeneralExpensesFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            UserId: utl.Session.getCurrentUserId(),
            ExpenseDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            PaymentTypeId: 1
            // ExpenseTypeId: 2,
        };
        $scope.currentcontext = {};
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        $scope.EnableSaveButton = true;
        $scope.EnablePrintButton = false;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.MaxExpenseAmount = utl.FacilitySetting.getFacilitySettingValue('billing', 'maxexpenseamount');
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.item.UserId = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }



        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.ExpenseStatusId == 2)
                $scope.item.isRequested = true;
            if ($scope.item.ExpenseStatusId == 2 || $scope.item.ExpenseStatusId == 3) {
                $scope.IsDisabled = true;
                $scope.EnableSaveButton = false;
                $scope.EnablePrintButton = true;
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'Billing/GeneralExpenses/GetGeneralExpensesById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'Billing/GeneralExpenses/PrintGeneralExpenses',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.DefaultPrint = function (ExpenseId) {
            var inputData = {
                Id: ExpenseId
            };
            var options = {
                action: 'Billing/GeneralExpenses/PrintGeneralExpenses',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };


        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
            $scope.DefaultPrint(data);
        };
        $scope.save = function () {
            $scope.item.ExpenseStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {
            $scope.item.ExpenseStatusId = 2;
            $scope.saveItem();
        }

        $scope.Cancel = function () {
            $scope.item.ExpenseStatusId = 3;
            $scope.saveItem();
        }

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.item.PaymentTypeId == 5 || $scope.item.PaymentTypeId == 6 ||
                    $scope.item.PaymentTypeId == 11) {
                    if (!$scope.item.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                    if (!$scope.item.CardTypeId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select CardType!...'));
                        return;
                    }
                    // if (!$scope.item.TerminalNoId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select TerminalNo!...'));
                    //     return;
                    // }
                }
                if ($scope.item.PaymentTypeId == 5 || $scope.item.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizeNumber || $scope.item.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                if ($scope.item.PaymentTypeId == 11) {
                    if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter UPIRef#!...'));
                        return;
                    }
                }
            }

            var actionName = 'Billing/GeneralExpenses/AddGeneralExpenses';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/GeneralExpenses/UpdateGeneralExpenses';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.MaxAmountValidation = function () {
            if ($scope.MaxExpenseAmount > 0 && $scope.MaxExpenseAmount != null &&
                $scope.MaxExpenseAmount != undefined && $scope.MaxExpenseAmount != NaN &&
                $scope.MaxExpenseAmount != 0) {
                var MaxExpenseAmount = parseFloat($scope.MaxExpenseAmount);
                var ExpenseAmount = parseFloat($scope.item.ExpenseAmount);
                if (ExpenseAmount > MaxExpenseAmount) {
                    utl.Alert.showErrorMsg('Maximum Limit is ' + MaxExpenseAmount);
                    $scope.item.ExpenseAmount = 0;
                }
            }
        }

        //React bridge: the five <ui-select> controls on this form (Expense Type,
        //Payment Type, Bank, Terminal, Card Type) render through the shared
        //BridgeLookupSelectScreen. None of them had an ng-change in the
        //original, so each dispatch only writes the same $scope.item field the
        //ng-model wrote. The ng-disabled expressions are passed through
        //unchanged ($scope.IsDisabled for the first two, item.isCompleted for
        //the payment-detail three). Every other control stays native.
        $scope.handleExpenseTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.ExpenseTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handlePaymentTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.PaymentTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleBankAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.BankId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleTerminalAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.TerminalNoId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleCardTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.CardTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };

        $scope.refreshReactProps = function () {
            var lk = $scope.lookup || {};
            $scope.reactPropsExpenseTypeContainer = {
                reactProps: { options: lk.GeneralExpenseType || [], value: $scope.item.ExpenseTypeId, disabled: $scope.IsDisabled },
                onAction: $scope.handleExpenseTypeAction
            };
            $scope.reactPropsPaymentTypeContainer = {
                reactProps: { options: lk.PaymentType || [], value: $scope.item.PaymentTypeId, disabled: $scope.IsDisabled },
                onAction: $scope.handlePaymentTypeAction
            };
            $scope.reactPropsBankContainer = {
                reactProps: { options: lk.Bank || [], value: $scope.item.BankId, disabled: $scope.item.isCompleted },
                onAction: $scope.handleBankAction
            };
            $scope.reactPropsTerminalContainer = {
                reactProps: { options: lk.Terminal || [], value: $scope.item.TerminalNoId, disabled: $scope.item.isCompleted },
                onAction: $scope.handleTerminalAction
            };
            $scope.reactPropsCardTypeContainer = {
                reactProps: { options: lk.CardType || [], value: $scope.item.CardTypeId, disabled: $scope.item.isCompleted },
                onAction: $scope.handleCardTypeAction
            };
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "GeneralExpenseStatus" },
                { "Key": "GeneralExpenseType" },
                { "Key": "PaymentType" },
                { "Key": "Bank" },
                { "Key": "CardType" },
                { "Key": "Terminal" },
                {
                    "Key": "RequestedUser",
                    Request: {
                        Params: [
                            { Key: 1, Value: utl.Session.getCurrentUserId() },
                        ]
                    },
                    Default: false
                }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    GeneralExpensesFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();