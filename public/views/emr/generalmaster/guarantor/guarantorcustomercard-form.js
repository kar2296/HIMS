(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorcustomercardFormController', guarantorcustomercardFormController);

    function guarantorcustomercardFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            GuarantorCustomerId: -1,
            GuarantorId: -1,
            GuarantorCardTypeId: -1,
            CardMasterTypeId: -1,
            CardMasterId: -1,
            CardCode: '',
            CardName: '',
            CardDescription: '',
            PolicyNo: '',
            PolicyName: '',
            CreditLimit: 0,
            ApprovalLimit: 0,
            DeductableLimit: 0,
            DeductableLoadId: 0,
            ActiveFrom: utl.Formatter.getCurrentDate(),
            IsActive: true
        };

        $scope.Item = [];
        $scope.Details = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.guarantorid = parseInt($stateParams.gid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getServiceCategorysCallback = function (scope, res, options, hasError) {
            var item = [];
            if (res.Data.length > 0) {
                res.Data.forEach((v, i) => {
                    var item = {
                        ServiceCategoryId: v.Id,
                        ServiceCategoryCode: v.ServiceCategoryCode,
                        ServiceCategoryName: v.ServiceCategoryName,
                        DeductableLoadId: 0,
                        DeductablePercentage: 0,
                        DeductableAmount: 0,
                        Status: 1,
                    };
                    $scope.Details.push(item);
                });
            }
        };

        $scope.getServiceCategorys = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 5, Value: 1 }
                ],
                PageContext: { PageSize: 250, PageNumber: 1 }
            };

            var options = {
                action: 'clinicalmaster/servicecategory/GetServiceCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getServiceCategorysCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getGuarantorCustomerCardCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var guarantorCustomerCard = res.Data[0];
                $scope.item.Id = guarantorCustomerCard.Id;
                $scope.item.GuarantorCustomerCardId = guarantorCustomerCard.Id;
                $scope.item.GuarantorCustomerId = guarantorCustomerCard.GuarantorCustomerId;
                $scope.item.GuarantorId = guarantorCustomerCard.GuarantorId;
                $scope.item.GuarantorCardTypeId = guarantorCustomerCard.GuarantorCardTypeId;
                $scope.item.CardMasterTypeId = guarantorCustomerCard.CardMasterTypeId;
                $scope.item.CardMasterId = guarantorCustomerCard.CardMasterId;
                $scope.item.CardCode = guarantorCustomerCard.CardCode;
                $scope.item.CardName = guarantorCustomerCard.CardName;
                $scope.item.CardDescription = guarantorCustomerCard.CardDescription;
                $scope.item.PolicyNo = guarantorCustomerCard.PolicyNo;
                $scope.item.PolicyName = guarantorCustomerCard.PolicyName;
                $scope.item.CreditLimit = guarantorCustomerCard.CreditLimit;
                $scope.item.ApprovalLimit = guarantorCustomerCard.ApprovalLimit;
                $scope.item.DeductableLimit = guarantorCustomerCard.DeductableLimit;
                $scope.item.DeductableLoadId = guarantorCustomerCard.DeductableLoadId;
                $scope.item.ActiveStatusId = guarantorCustomerCard.ActiveStatusId;
                $scope.item.ActiveFrom = guarantorCustomerCard.ActiveFrom;
                $scope.item.ActiveTo = guarantorCustomerCard.ActiveTo;
                $scope.item.IsActive = guarantorCustomerCard.IsActive;
                $scope.item.Status = guarantorCustomerCard.Status;
                if (guarantorCustomerCard.GuarantorCustomerCardDeductables) {
                    for (var gccdidx in guarantorCustomerCard.GuarantorCustomerCardDeductables) {
                        var gccditem = guarantorCustomerCard.GuarantorCustomerCardDeductables[gccdidx];
                        if (gccditem.ServiceCategoryId > 0) {
                            $scope.Details.push(gccditem);
                        }
                    }
                }
            }
        };

        $scope.getGuarantorCustomerCards = function () {
            var inputData = {
                Params: [{ Key: 0, Value: $scope.currentcontext.id }],
            };

            var options = {
                action: 'generalmaster/GuarantorCustomerCard/GetGuarantorCustomerCards',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGuarantorCustomerCardCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [8, 9, 27, 13]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.clear = function () {
            $scope.ServiceCategoryDetails = [];
            $scope.item = {};
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandapprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var servicecategorys = [];
            var servicecategorys = getLinesForSave();

            var actionName = 'generalmaster/GuarantorCustomerCard/AddGuarantorCustomerCard';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/GuarantorCustomerCard/UpdateGuarantorCustomerCard';
            }

            $scope.item.GuarantorId = $scope.currentcontext.guarantorid;

            var inputData = { Header: $scope.item, Details: servicecategorys };

            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.Details) {
                var item = $scope.Details[idx];
                item.GuarantorCustomerId = $scope.item.GuarantorCustomerId;
                item.GuarantorId = $scope.currentcontext.guarantorid;
                item.DeductableLimit = 0;
                item.ActiveStatusId = $scope.item.ActiveStatusId;
                item.ActiveFrom = $scope.item.ActiveFrom;
                item.ActiveTo = $scope.item.ActiveTo;
                item.IsActive = $scope.item.IsActive;
                item.Status = 1;

                if (item.Id > 0) {
                    if (item.ServiceCategoryId > 0) {
                        result.push(item);
                    }
                } else {
                    if (item.ServiceCategoryId > 0 && item.Status == 1) {
                        result.push(item);
                    }
                }
            }

            return result;
        }

        $scope.onGuarantorCustomerSelect = function (selectedItem) {
            $scope.item.CustomerTypeId = selectedItem.CustomerTypeId;
            $scope.item.CustomerCode = selectedItem.CustomerCode;
            $scope.item.CustomerName = selectedItem.CustomerName;
            $scope.item.PolicyNo = selectedItem.PolicyNo;
            $scope.item.PolicyName = selectedItem.PolicyName;
            $scope.item.CreditLimit = selectedItem.CreditLimit;
            $scope.item.ApprovalLimit = selectedItem.ApprovalLimit;
            $scope.item.ActiveFrom = selectedItem.ActiveFrom;
            $scope.item.ActiveTo = selectedItem.ActiveTo;
        };

        $scope.onGuarantorCardSelected = function (selectedItem) {
            $scope.item.CardMasterTypeId = selectedItem.CardMasterTypeId;
            $scope.item.CardMasterId = selectedItem.CardMasterId;
            $scope.item.CardCode = selectedItem.Code;
            $scope.item.CardName = selectedItem.CardName;
            $scope.item.CardDescription = selectedItem.Description;
        };

        $scope.onDeductableLoadSelected = function (selectedItem) {
            for (var idx in $scope.Details) {
                if ($scope.Details[idx].ServiceCategoryId > 0) {
                    $scope.Details[idx].DeductableLoadId = selectedItem.Id;
                    $scope.Details[idx].DeductablePercentage = parseFloat(selectedItem.Id * 10).toFixed(2);
                }
            }
        };

        vm.guarantorcustomercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                /* { header: 'Customer Type', field: 'CustomerType', datatype: 'string', headercls: 'td-customertype', fieldcls: 'td-customertype' }, */
                { header: 'Customer Code', field: 'CustomerCode', datatype: 'string', headercls: 'td-customercode', fieldcls: 'td-customercode' },
                { header: 'Customer Name', field: 'CustomerName', datatype: 'string', headercls: 'td-customername', fieldcls: 'td-customername' },
                { header: 'Policy No', field: 'PolicyNo', datatype: 'string', headercls: 'td-policyno', fieldcls: 'td-policyno' },
                { header: 'Policy Name', field: 'PolicyName', datatype: 'string', headercls: 'td-policyname', fieldcls: 'td-policyname' },
                { header: 'Credit Limit', field: 'CreditLimit', datatype: 'string', headercls: 'td-creditlimit', fieldcls: 'td-creditlimit' },
                { header: 'Approval Limit', field: 'ApprovalLimit', datatype: 'string', headercls: 'td-approvallimit', fieldcls: 'td-approvallimit' }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/GuarantorCustomer/GetGuarantorCustomers',
            formatdisplay: formatselectedguarantorcustomer,
            presearch: presearchguarantorcustomer,
            postsearch: postsearchguarantorcustomer
        };

        function formatselectedguarantorcustomer() {
            var selectedItem = vm.guarantorcustomercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.CustomerName;

                $scope.item.CustomerTypeId = selectedItem.CustomerTypeId;
                $scope.item.CustomerCode = selectedItem.CustomerCode;
                $scope.item.CustomerName = selectedItem.CustomerName;
                $scope.item.PolicyNo = selectedItem.PolicyNo;
                $scope.item.PolicyName = selectedItem.PolicyName;
                $scope.item.CreditLimit = selectedItem.CreditLimit;
                $scope.item.ApprovalLimit = selectedItem.ApprovalLimit;
            } else if (vm.guarantorcustomercontrolconfig.rowdata) {
                result = [vm.guarantorcustomercontrolconfig.rowdata.CustomerName].join(' ');
            }
            return result;
        }

        function presearchguarantorcustomer() {
            var query = vm.guarantorcustomercontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.guarantorid },
                    { Key: 2, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.guarantorcustomercontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 4,
                    Value: query
                });
            }

            vm.guarantorcustomercontrolconfig.searchparams = inputData;
        }

        function postsearchguarantorcustomer() {
            for (var idx in vm.guarantorcustomercontrolconfig.result) {

                var item = vm.guarantorcustomercontrolconfig.result[idx];
                /*
                item.CustomerType = '';
                if (item.CustomerType) {
                    item.CustomerType = item.CustomerType.Description;
                }
                */
                item.CustomerCode = item.CustomerCode;
                item.CustomerName = item.CustomerName;
                item.PolicyNo = item.PolicyNo;
                item.PolicyName = item.PolicyName;
                item.CreditLimit = item.CreditLimit;
                item.ApprovalLimit = item.ApprovalLimit;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            if ($scope.currentcontext.id > 0) {
                $scope.getGuarantorCustomerCards();
            } else {
                $scope.getServiceCategorys();
            }

            //$scope.getGuarantorCustomerCards();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "CardMasterType" },
                { "Key": "ServiceCategory" },
                { "Key": "DeductableLoad" },
                {
                    "Key": "GuarantorCardType",
                    Request: {
                        Params: [
                            { Key: 3, Value: $scope.currentcontext.guarantorid }
                        ]
                    }
                },
                {
                    "Key": "GuarantorCustomer",
                    Request: {
                        Params: [
                            { Key: 1, Value: $scope.currentcontext.guarantorid },
                            { Key: 2, Value: 2 }
                        ]
                    }
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

        $scope.initLookup();
    }

    guarantorcustomercardFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();