(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('NewpackageTariffFormController', NewpackageTariffFormController);

    function NewpackageTariffFormController($scope, $stateParams, $state, $translate, utl, $filter) {
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
        $scope.selfdetails = [];
        $scope.insdetails = [];
        // $scope.currentcontext.option = 'self';
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.options = [{
                key: 'self',
                name: $translate.instant('Self')
            },
            {
                key: 'others',
                name: $translate.instant('Others')
            }
        ];

        // $scope.canShowSelf = function () {
        //     return $scope.currentcontext.option == 'self';
        // }

        // $scope.canShowOthers = function () {
        //     return $scope.currentcontext.option == 'others';
        // }

        $scope.addselfLineItem = function() {
            var detail = getNewItem();
            if ($scope.currentcontext.id > 0) {
                detail.IPPackageId = $scope.currentcontext.id;
            }
            $scope.selfdetails.push(detail);
        };

        $scope.addinsLineItem = function() {
            var detail = getNewItem();
            if ($scope.currentcontext.id > 0) {
                detail.IPPackageId = $scope.currentcontext.id;
            }
            $scope.insdetails.push(detail);
        };

        function getNewItem() {
            var detail = {
                Id: 0,
                WardId: -1,
                TariffTypeId: -1,
                GuarantorId: -1,
                GuarantorTypeId: -1,
                ActualAmount: 0,
                PackageAmount: 0,
                IPPackageDetails: [],
                Status: 1
            };
            return detail;
        }

        $scope.addNew = function() {
            $state.go('app.multipackage', { id: 0 });
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
        };

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
        };

        $scope.deleteDetail = function(idx, item) {
            var name = item.TestName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            // $scope.selfdetails = [];
            $scope.insdetails = [];
            if (res.Data.length > 0) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    // if (item.GuarantorTypeId == 1) {
                    //     $scope.selfdetails.push(item);
                    // }
                    // if (item.GuarantorTypeId != 1) {
                    $scope.insdetails.push(item);
                    // }
                }
            }
            // $scope.details = result;
        };

        $scope.getDetails = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{ Key: 1, Value: $scope.currentcontext.id }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                if ($scope.currentcontext.TariffTypeId > 0) {
                    inputData.Params.push({
                        Key: 2,
                        Value: $scope.currentcontext.TariffTypeId
                    });
                }
                var options = {
                    action: 'clinicalmaster/IPPackageTariffDetail/GetIPPackageTariffDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                // $scope.addselfLineItem();
                $scope.addinsLineItem();
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
            $state.go('app.multipackages', { id: 0 });
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


        $scope.addselfctgryDetail = function(response) {
            $scope.selfdetails[response.idx].IPPackageDetails = response.data;
            $scope.selfdetails[response.idx].PackageAmount = response.PackageAmount;
            $scope.selfdetails[response.idx].ActualAmount = response.ActualAmount
            $scope.calAmt();
        };

        $scope.addselfctgry = function(index, item) {
            utl.Modal.openFixedDialog('app.multipackage', {
                params: {
                    index: index,
                    IPPackageDetails: item.IPPackageDetails,
                    WardId: item.WardId,
                    Id: item.Id,
                    TariffTypeId: item.TariffTypeId
                },
                confirmCallback: $scope.addselfctgryDetail
            });
        }

        $scope.addinsctgryDetail = function(response) {
            $scope.insdetails[response.idx].IPPackageDetails = response.data;
            $scope.insdetails[response.idx].PackageAmount = response.PackageAmount;
            $scope.insdetails[response.idx].ActualAmount = response.ActualAmount
            $scope.calAmt();
        };

        $scope.addinsctgry = function(index, item) {
            utl.Modal.openFixedDialog('app.multipackage', {
                params: {
                    index: index,
                    IPPackageDetails: item.IPPackageDetails,
                    WardId: item.WardId,
                    Id: item.Id,
                    TariffTypeId: item.TariffTypeId
                },
                confirmCallback: $scope.addinsctgryDetail
            });
        }


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
            $scope.TotalActAmount = 0;
            $scope.TotalPackAmount = 0;
            for (var idx in $scope.selfdetails) {
                $scope.TotalActAmount += parseFloat($scope.selfdetails[idx].ActualAmount);
                $scope.TotalPackAmount += parseFloat($scope.selfdetails[idx].PackageAmount);
            }
            for (var idx in $scope.insdetails) {
                $scope.TotalActAmount += parseFloat($scope.insdetails[idx].ActualAmount);
                $scope.TotalPackAmount += parseFloat($scope.insdetails[idx].PackageAmount);
            }
            $scope.item.ActualAmount = $scope.TotalActAmount;
            $scope.item.PackageAmount = $scope.TotalPackAmount;
        };

        $scope.calpackageAmt = function(index, item) {
            $scope.item.PackageAmount = 0;
            for (var idx in $scope.details) {
                $scope.item.PackageAmount += parseFloat($scope.details[idx].PackageAmount);
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
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                var actionName = 'clinicalmaster/IPPackage/AddIPPackageByTariff';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'clinicalmaster/IPPackage/UpdateIPPackageByTariff';
                }

                var inputData = { Header: $scope.item, Details: lines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg($translate.instant('Select Category....'));
                return;
            }
        };

        function checkMandatoryFields() {
            if (!$scope.item.IsUnlimitedServices || $scope.item.IsUnlimitedServices == false) {
                $scope.alldetails = [];
                if ($scope.selfdetails.length > 0) {
                    for (var sx in $scope.selfdetails) {
                        var selfinfo = $scope.selfdetails[sx];
                        $scope.alldetails.push(selfinfo);
                    }
                }
                if ($scope.insdetails.length > 0) {
                    for (var inx in $scope.insdetails) {
                        var insinfo = $scope.insdetails[inx];
                        $scope.alldetails.push(insinfo);
                    }
                }
                var activeRecords = $filter('filterArrayItems')($scope.alldetails, [
                    { search: 1, fields: ['Status'] }
                ]);
                for (var idx in activeRecords) {
                    var item = activeRecords[idx];
                    if (!item.IPPackageDetails || item.IPPackageDetails.length == 0) {
                        utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                        return false;
                    }
                }
                return true;
            } else {
                return true;
            }
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.selfdetails) {
                var item = $scope.selfdetails[idx];
                if (item.WardId > 0) {
                    item.GuarantorTypeId = 1;
                    item.GuarantorId = 1;
                    result.push(item);
                }
            }
            for (var idx in $scope.insdetails) {
                var item = $scope.insdetails[idx];
                if (item.WardId > 0) {
                    item.GuarantorTypeId = item.GuarantorTypeId;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.GetGuarantorCallback = function(scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            $scope.lookup["ServiceRateCategory"] = data["ServiceRateCategory"];
        };

        $scope.getGuarantor = function(item, idx) {
            item.GuarantorId = -1;
            item.TariffTypeId = -1;
            var inputData = [{
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                                Key: 2,
                                Value: item.GuarantorTypeId
                            },
                            {
                                Key: 7,
                                Value: [-1, utl.Session.getCurrentFacilityId()]
                            }
                        ]
                    }
                },
                {
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                                Key: 6,
                                Value: item.GuarantorTypeId
                            },
                            {
                                Key: 5,
                                Value: [-1, utl.Session.getCurrentFacilityId()]
                            }
                        ]
                    }
                }
            ];
            $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
        }

        $scope.initLookupCall = function(inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };


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
                { "Key": "ServiceRateCategory" },
                { "Key": "DiscountMode" },
                { "Key": "DiscountType" },
                { "Key": "Guarantor" },
                { "Key": "GuarantorType" },
                { "Key": "Ward" },
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

    NewpackageTariffFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();