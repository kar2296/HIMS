(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceBillEntryFormController', ServiceBillEntryFormController);

    function ServiceBillEntryFormController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            ServiceBillDate: utl.Formatter.getCurrentDate(),
            CreatedBy: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            //ServiceBillStatusId: 2,
            //CreatedBy: utl.Session.getCurrentUserId(),
        };
        $scope.isDisabled = false;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Vendor Code',
                field: 'VendorCode',
                datatype: 'string',
                headercls: 'td-vendorcode',
                fieldcls: 'td-vendorcode'
            },
            {
                header: 'Vendor Name',
                field: 'VendorName',
                datatype: 'string',
                headercls: 'td-vendorname',
                fieldcls: 'td-vendorname'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.VendorId = selectedItem.VendorMasterId;
                $scope.item.VendorCode = selectedItem.VendorCode;
                $scope.item.VendorName = selectedItem.VendorName;
                result = [selectedItem.VendorName + '(' + selectedItem.VendorCode + ')'].join('    ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [{ Key: 4, Value: 2 }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };
            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: $scope.item.VendorId });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 2, Value: query });
            }
            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {
                var item = vm.vendorcontrolconfig.result[idx];
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
            }
        }

        $scope.save = function () {
            $scope.item.ServiceBillStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandapprove = function () {
            $scope.item.ServiceBillStatusId = 2;
            $scope.saveItem();
        };

        $scope.numberwithdecimal = function (e) {
            if ((e.charCode >= 48 && e.charCode <= 57) || (e.charCode == 46)) {
                return;
            } else
                e.preventDefault();
        }
        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.currentcontext.id == 0) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
            }
            // When In Draft Status
            if ($scope.item.ServiceBillStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Approved Status
            if ($scope.item.ServiceBillStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Authorized Status
            if ($scope.item.ServiceBillStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.ServiceBillStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.ServiceBillStatusId == 1) {
                //$scope.item.isDisabled = false;
                $scope.isDisabled = false;
                $scope.item.DisplayRequestStatus = 'Draft';
            }
            if ($scope.item.ServiceBillStatusId == 2) {
                //$scope.item.isDisabled = false;
                $scope.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Approved';
            }
            if ($scope.item.ServiceBillStatusId == 3) {
                //$scope.item.isDisabled = false;
                $scope.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Authorized';
            }
            if ($scope.item.ServiceBillStatusId == 4) {
                //$scope.item.isDisabled = false;
                $scope.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Cancelled';
            }
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/ServiceBillEntry/GetServiceBillEntryById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };
        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'pharmacy/ServiceBillEntry/AddServiceBillEntry';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/ServiceBillEntry/UpdateServiceBillEntry';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.CancelBill = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are You Sure,You Want To Cancel Bill?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelBillConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelBillConfirmed = function () {
            $scope.item.ServiceBillStatusId = 4;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };
        $scope.printWagesServices = function () {
          
            var inputData = {
                Id: $scope.currentcontext.id

            };
            
            var options = {
                
                action: 'pharmacy/ServiceBillEntry/PrintWagesServices', 
                data: inputData,
                type: 'post'
            };
           
            utl.Http.doPrint(options);
          
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ServiceBillType" },
                { "Key": "Department" },
                { "Key": "User" },
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
    ServiceBillEntryFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();