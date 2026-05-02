(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('NewpackageFormController', NewpackageFormController);

    function NewpackageFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsActive: true,
            ServiceRateCategoryId: -1,
            DepartmentId: -1,
            GuarantorTypeId: -1,
            DisocuntTypeId: -1,
            GuarantorId: -1,
            DisountModeId: -1
        };

        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.Packdetails = [];
        $scope.finalPackdetails = [];
        $scope.currentcontext.index = 0;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.index = parseInt(modalConfig.params.index);
            $scope.Packdetails = modalConfig.params.IPPackageDetails || [];
            $scope.currentcontext.tariffId = modalConfig.params.Id;
            // $scope.servicecategoryid = modalConfig.params.ServiceCategoryId;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            $scope.TotalAmount = 0;
            for (var idx in $scope.Packdetails) {
                $scope.TotalAmount += parseFloat($scope.Packdetails[idx].Amount);
            }
        }
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.options = [{
            key: 'self',
            name: $translate.instant('Self')
        },
        {
            key: 'insurance',
            name: $translate.instant('Insurance')
        }
        ];

        $scope.canShowSelf = function () {
            return $scope.currentcontext.option == 'self';
        }

        $scope.canShowInsurance = function () {
            return $scope.currentcontext.option == 'insurance';
        }

        $scope.addNewLineItem = function () {
            var detail = getNewItem();
            if ($scope.currentcontext.id > 0) {
                detail.IPPackageId = $scope.currentcontext.id;
            }
            $scope.Packdetails.push(detail);
        };

        function getNewItem() {
            var detail = {
                Id: 0,
                ServiceCategoryId: -1,
                Amount: 0,
                ActualAmount: 0,
                PackageAmount: 0,
                IPPackageServiceInclusions: [],
                IPPackageServiceExclusions: [],
                Status: 1
            };
            return detail;
        }

        $scope.addNew = function () {
            $state.go('app.multitariffpackage', {
                id: 0
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            $scope.Packdetails.splice(-1, 1);
            for (var idx in $scope.Packdetails) {
                var item = $scope.Packdetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.IPPackageId = $scope.currentcontext.id;
                }
                if (!checkExist(itemFromModal) && (itemFromModal.IPPackageId)) {
                    $scope.Packdetails.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
        };

        $scope.ServiceRateCatChange = function (SelectedSerRateCat) {
            $scope.currentfilter.ServiceRateCategoryId = SelectedSerRateCat.Id;
            $scope.currentfilter.ServiceRateCategoryName = SelectedSerRateCat.Text;
        };

        $scope.packageChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.Packdetails, {
                pivotkey: 'ServiceCategoryId',
                displaykey: 'ServiceCategoryName'
            });
            if (isDuplicate) {
                item.ServiceCategoryName = '';
                item.ServiceCategoryId = '';
                return;
            }

            item.ServiceCategoryName = item.SelectedItem.ServiceCategoryName;
            item.ServiceCategoryCode = item.SelectedItem.ServiceCategoryCode;

            var lastIndex = $scope.Packdetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
                $scope.calAmt(idx, item)
                $scope.calpackageAmt(idx, item)
            }
            // utl.Modal.open('app.servicepackagedetails', {
            //     params: {
            //         index: idx,
            //         IPPackageServiceExclusions: item.IPPackageServiceExclusions,
            //         ServiceCategoryId: item.ServiceCategoryId,
            //         ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
            //     },
            //     confirmCallback: $scope.servicePackageDetail
            // });
        };

        $scope.servicePackageDetail = function (response) {
            $scope.Packdetails[response.idx].IPPackageServiceInclusions = response.incdata;
            $scope.Packdetails[response.idx].IPPackageServiceExclusions = response.excdata;
            $scope.Packdetails[response.idx].Amount = response.Amount;
            $scope.Packdetails[response.idx].ActualAmount = response.Amount
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.deleteDetail = function (idx, item) {
            var name = item.TestName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            // var result = [];
            // for (var idx in res.Data) {
            //     var item = res.Data[idx];
            //     result.push(item);
            // }
            if (res.Data.length > 0) {
                $scope.Packdetails = result;
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.tariffId
                    }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'clinicalmaster/IPPackageDetail/GetIPPackageDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }

        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            // $scope.GuarantorTypeChange();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'clinicalmaster/IPPackage/GetIPPackageById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.multipackages', {
                id: 0
            });
        };

        $scope.SaveandDraft = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.Clear = function () {
            $scope.item = {};
            $scope.Packdetails = [];
            $scope.addNewLineItem();
        };

        $scope.serviceinclusionDetail = function (response) {
            $scope.Packdetails[response.idx].IPPackageServiceInclusions = response.data;
            $scope.Packdetails[response.idx].Amount = response.Amount;
            $scope.Packdetails[response.idx].ActualAmount = response.Amount
        };

        $scope.serviceinclusion = function (item, index) {
            utl.Modal.open('app.servicepackage', {
                params: {
                    index: index,
                    IPPackageServiceInclusions: item.IPPackageServiceInclusions,
                    ServiceCategoryId: item.ServiceCategoryId,
                    ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
                },
                confirmCallback: $scope.serviceinclusionDetail
            });
        };

        $scope.serviceexclusionDetail = function (response) {
            $scope.Packdetails[response.idx].IPPackageServiceExclusions = response.data;
        };

        $scope.serviceexclusiondetails = function (item, index) {
            utl.Modal.open('app.servicepackageexclusion', {
                params: {
                    index: index,
                    IPPackageServiceExclusions: item.IPPackageServiceExclusions,
                    ServiceCategoryId: item.ServiceCategoryId,
                    ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
                },
                confirmCallback: $scope.serviceexclusionDetail
            });
        };

        $scope.serviceCategoryChange = function (selectedCategory, item) {
            item.ServiceGroupId = selectedCategory.ServiceGroupId;
        };

        $scope.GuarantorTypeChange = function (SelectedGuarantorType) {
            $scope.lookup.SelectedGuarantor = [];
            $scope.item.GuarantorId = -1;
            $scope.item.ServiceRateCategoryId = -1;
            var len = $scope.lookup.Guarantor.length;
            for (var i = 0; i < len; i++) {
                if ($scope.lookup.Guarantor[i].Id > 0) {
                    if (SelectedGuarantorType.Id == $scope.lookup.Guarantor[i].GuarantorTypeId) {
                        $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                    }
                } else {
                    $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                }
            }

            if ($scope.lookup.SelectedGuarantor && $scope.lookup.SelectedGuarantor.length > 1) {
                $scope.item.GuarantorId = $scope.lookup.SelectedGuarantor[1].Id;
                $scope.item.GuarantorName = $scope.lookup.SelectedGuarantor[1].Text;
                $scope.item.ServiceRateCategoryId = $scope.lookup.SelectedGuarantor[1].ServiceRateCategoryId;
            }
        };

        $scope.GuarantorChange = function (SelectedGuarantor) {
            $scope.item.GuarantorId = SelectedGuarantor.Id;
            $scope.item.GuarantorName = SelectedGuarantor.Text;
            $scope.item.ServiceRateCategoryId = SelectedGuarantor.ServiceRateCategoryId;
        };

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientdietorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.completeOrder = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientdietorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        function removeLastEntryBeforeSave() {
            var item = $scope.Packdetails[$scope.Packdetails.length - 1];
            if (!item.IPPackageId || item.IPPackageId == -1) {
                $scope.Packdetails.splice(-1, 1);
            }
        }

        $scope.caldisc = function (item) {
            item.DiscountValue = item.PackageAmount - item.ActualAmount;
        };

        $scope.calAmt = function (index, item) {
            $scope.TotalAmount = 0;
            for (var idx in $scope.Packdetails) {
                $scope.TotalAmount += parseFloat($scope.Packdetails[idx].ActualAmount);
            }
        };

        $scope.calpackageAmt = function (index, item) {
            $scope.item.ActualAmount = 0;
            for (var idx in $scope.Packdetails) {
                $scope.item.ActualAmount += parseFloat($scope.Packdetails[idx].PackageAmount);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    loadData();
                }
            } else if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                loadData();
            }
        };

        $scope.saveItem = function () {
            // for (var idx in $scope.Packdetails) {
            //     var item = $scope.Packdetails[idx];
            //     if (item.ServiceItemId == 0 || item.ServiceItemId == -1) {
            //         if (item.Status == 1) {
            //             utl.Alert.showErrorMsg($translate.instant('clinicalmaster.package-form.saveitem.lbl'));
            //             return false;
            //         }
            //     }
            // }

            for (var idx in $scope.Packdetails) {
                var item = $scope.Packdetails[idx];
                if (item.Id > 0 && item.ServiceCategoryId > 0) {
                    $scope.finalPackdetails.push(item);
                } else if (item.Status == 1 && item.ServiceCategoryId > 0) {
                    $scope.finalPackdetails.push(item);
                }
            }
            $scope.confirmCallback({
                idx: $scope.currentcontext.index,
                data: $scope.finalPackdetails,
                ActualAmount: $scope.TotalAmount,
                PackageAmount: $scope.item.ActualAmount
            });
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            // var lines = getLinesForSave();
            // var actionName = 'clinicalmaster/IPPackage/AddIPPackage';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     actionName = 'clinicalmaster/IPPackage/UpdateIPPackage';
            // }
            // var inputData = { Header: $scope.item, Details: lines };
            // var options = {
            //     action: actionName,
            //     data: { Data: inputData },
            //     type: 'post',
            //     onComplete: $scope.saveItemCallback
            // };
            // utl.Http.doAction(options);
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.Packdetails, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.ServiceCategoryId > -1) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.Packdetails) {
                var item = $scope.Packdetails[idx];
                if (item.ServiceCategoryId > -1) {
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getDetails();
        }

        vm.packagecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'ServiceCategoryCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Name',
                field: 'ServiceCategoryName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/servicecategory/GetServiceCategorys',
            formatdisplay: formatselectedpackage,
            presearch: presearchpackage,
            postsearch: postsearchpackage
        };

        function formatselectedpackage() {
            var selectedItem = vm.packagecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceCategoryName + '(' + selectedItem.ServiceCategoryCode + ')'].join('  ');
            } else if (vm.packagecontrolconfig.rowdata) {
                result = [vm.packagecontrolconfig.rowdata.ServiceCategoryName, vm.packagecontrolconfig.rowdata.ServiceCategoryCode,].join(' ');
            }

            return result;
        }

        function presearchpackage() {
            var query = vm.packagecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.packagecontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }
            vm.packagecontrolconfig.searchparams = inputData;
        }

        function postsearchpackage() {
            for (var idx in vm.packagecontrolconfig.result) {
                var item = vm.packagecontrolconfig.result[idx];
                item.ServiceCategoryName = item.ServiceCategoryName
                item.ServiceCategoryCode = item.ServiceCategoryCode;
            }
        }

        loadData();
    }

    NewpackageFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();