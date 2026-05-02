(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('packageFormController', packageFormController);

    function packageFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
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
        $scope.details = [];

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.addNewLineItem = function() {
            var detail = getNewItem();
            if ($scope.currentcontext.id > 0) {
                detail.IPPackageId = $scope.currentcontext.id;
            }
            $scope.details.push(detail);
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

        $scope.addNew = function() {
            $state.go('app.package', { id: 0 });
        };

        $scope.onDetailSave = function(itemFromModal) {
            var isaddnew = true;
            $scope.details.splice(-1, 1);
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
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
                    $scope.details.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
        };

        $scope.ServiceRateCatChange = function(SelectedSerRateCat) {
            $scope.currentfilter.ServiceRateCategoryId = SelectedSerRateCat.Id;
            $scope.currentfilter.ServiceRateCategoryName = SelectedSerRateCat.Text;
        };

        $scope.packageChanged = function(idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.details, { pivotkey: 'ServiceCategoryId', displaykey: 'ServiceCategoryName' });
            if (isDuplicate) {
                item.ServiceCategoryName = '';
                item.ServiceCategoryId = '';
                return;
            }

            item.ServiceCategoryName = item.SelectedItem.ServiceCategoryName;
            item.ServiceCategoryCode = item.SelectedItem.ServiceCategoryCode;

            var lastIndex = $scope.details.length - 1;
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

        $scope.servicePackageDetail = function(response) {
            $scope.details[response.idx].IPPackageServiceInclusions = response.incdata;
            $scope.details[response.idx].IPPackageServiceExclusions = response.excdata;
            $scope.details[response.idx].Amount = response.Amount;
            $scope.details[response.idx].ActualAmount = response.Amount
        };

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
        };

        $scope.deleteDetail = function(idx, item) {
            var name = item.TestName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            var result = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                result.push(item);
            }

            $scope.details = result;
        };

        $scope.getDetails = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{ Key: 1, Value: $scope.currentcontext.id }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
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

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            // $scope.GuarantorTypeChange();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'clinicalmaster/IPPackage/GetIPPackageById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.packages', { id: 0 });
        };

        $scope.SaveandDraft = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function() {
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

        $scope.Clear = function() {
            $scope.item = {};
            $scope.details = [];
            $scope.addNewLineItem();
        };

        $scope.serviceinclusionDetail = function(response) {
            $scope.details[response.idx].IPPackageServiceInclusions = response.data;
            $scope.details[response.idx].Amount = response.Amount;
            $scope.details[response.idx].ActualAmount = response.Amount
        };

        $scope.serviceinclusion = function(item, index) {
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

        $scope.serviceexclusionDetail = function(response) {
            $scope.details[response.idx].IPPackageServiceExclusions = response.data;
        };

        $scope.serviceexclusiondetails = function(item, index) {
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

        $scope.serviceCategoryChange = function(selectedCategory, item) {
            item.ServiceGroupId = selectedCategory.ServiceGroupId;
        };

        $scope.GuarantorTypeChange = function(SelectedGuarantorType) {
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

        $scope.GuarantorChange = function(SelectedGuarantor) {
            $scope.item.GuarantorId = SelectedGuarantor.Id;
            $scope.item.GuarantorName = SelectedGuarantor.Text;
            $scope.item.ServiceRateCategoryId = SelectedGuarantor.ServiceRateCategoryId;
        };

        $scope.saveCancelled = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientdietorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.completeOrder = function() {
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
            var item = $scope.details[$scope.details.length - 1];
            if (!item.IPPackageId || item.IPPackageId == -1) {
                $scope.details.splice(-1, 1);
            }
        }

        $scope.caldisc = function(item) {
            item.DiscountValue = item.PackageAmount - item.ActualAmount;
        };

        $scope.calAmt = function(index, item) {
            $scope.TotalAmount = 0;
            for (var idx in $scope.details) {
                $scope.TotalAmount += parseFloat($scope.details[idx].ActualAmount);
            }
        };

        $scope.calpackageAmt = function(index, item) {
            $scope.item.ActualAmount = 0;
            for (var idx in $scope.details) {
                $scope.item.ActualAmount += parseFloat($scope.details[idx].PackageAmount);
            }
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    loadData();
                }
            } else if (typeof(data) == "number") {
                $scope.currentcontext.id = data;
                loadData();
            }
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var lines = getLinesForSave();
            var actionName = 'clinicalmaster/IPPackage/AddIPPackage';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/IPPackage/UpdateIPPackage';
            }

            var inputData = { Header: $scope.item, Details: lines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.details, [
                { search: 1, fields: ['Status'] }
            ]);
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
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
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
            options: [
                { header: 'Code', field: 'ServiceCategoryCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'ServiceCategoryName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
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
                result = [vm.packagecontrolconfig.rowdata.ServiceCategoryName, vm.packagecontrolconfig.rowdata.ServiceCategoryCode, ].join(' ');
            }

            return result;
        }

        function presearchpackage() {
            var query = vm.packagecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.packagecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ServiceCategory" },
                { "Key": "ServiceRateCategory" },
                { "Key": "DiscountMode" },
                { "Key": "DiscountType" },
                { "Key": "ServiceCategory" },
                { "Key": "GuarantorType" },
                { "Key": "SelectedGuarantor" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Facility" },
                {
                    Key: 'Department',
                    Request: { Params: [{ Key: 5, Value: 2 }] }
                }
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

    packageFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();