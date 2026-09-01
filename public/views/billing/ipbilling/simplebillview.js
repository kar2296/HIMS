(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('simplebillController', simplebillController);

    function simplebillController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.SelectedIndex = -1;

        $scope.item = {
            doadate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};

        $scope.currentcontext.EncounterId = parseInt($stateParams.id);
        $scope.IsLocked = $scope.$parent.Islocked;
        $scope.PatientPaymentDetails = [];
        $scope.currentfilter = {
            DoctorId: -1
        };
        $scope.BillRefreshCount = 0;

        $scope.RefershSplitDetailsCallback = function (scope, res, options, hasError) {
            $scope.ActiveBillsCount = 0;
            if (res.Refreshed && res.IsPackageAssigned) {
                $scope.GetPatientBillPackageSummaryDetails();
            } else if (res.Refreshed) {
                $scope.GetPatientBillSummary();
                $scope.FacilityBlockPendingOrders = utl.FacilitySetting.getFacilitySettingValue('billing', 'pendingordersblock');
                $scope.PendingOrderTestNames = '';
            }

        };

        $scope.RefershSplitDetails = function () {
            var options = {
                action: 'billing/patientbills/PopulateInpatientBills',
                data: {
                    Id: $scope.currentcontext.EncounterId
                },
                type: 'post',
                onComplete: $scope.RefershSplitDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.CalculateNetAmt = function () {
            var itemwiseGrossAmt = 0;
            var itemwiseDiscountAmt = 0;
            $scope.currentcontext.PatientBillDetails.forEach((val, idx) => {
                var itemGrossAmount = 0;
                var itemDiscountAmount = 0;
                if (val.Status == 1) {
                    if (!$scope.EncounterInfo.IsPackageAssigned) {
                        itemGrossAmount = isNaN(parseFloat(val.Amount)) ? 0 : parseFloat(val.Amount);
                        itemDiscountAmount = isNaN(parseFloat(val.DiscountAmount)) ? 0 : parseFloat(val.DiscountAmount);

                        itemwiseGrossAmt += itemGrossAmount;
                        itemwiseDiscountAmt += itemDiscountAmount;
                    }
                }
            });
            var PaidAmount = parseFloat($scope.currentcontext.TotalReceiptAmount);
            if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0)
                $scope.currentcontext.TotPaidAmount = $scope.currentcontext.PaidAmt;
            else
                $scope.currentcontext.TotPaidAmount = (!$scope.currentcontext.PaidAmt) ? PaidAmount : parseFloat($scope.currentcontext.PaidAmt) + PaidAmount;


            $scope.item.GrossAmount = itemwiseGrossAmt;
            $scope.item.DiscountAmount = itemwiseDiscountAmt;
            $scope.item.NetAmount = itemwiseGrossAmt - itemwiseDiscountAmt;

            $scope.currentcontext.TotGrossAmount = 0;
            $scope.currentcontext.TotDiscAmount = 0;
            $scope.currentcontext.TotRefundAmount = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : $scope.currentcontext.ReceiptAmt;
            if ($scope.currentcontext.TotalRefundAmount !== null && $scope.currentcontext.TotalRefundAmount !== 'NaN') {
                $scope.currentcontext.TotRefundAmount = parseFloat($scope.currentcontext.TotalRefundAmount);
            }
            $scope.currentcontext.TotGrossAmount = $scope.item.GrossAmount;
            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.currentcontext.TotDiscAmount = (parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.currentcontext.TotGrossAmount);
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
                if (!$scope.FinalBillInfo)
                    $scope.currentcontext.TotDiscAmount = $scope.currentcontext.TotDiscAmount + itemwiseDiscountAmt;
            } else if (itemwiseDiscountAmt > 0) {
                $scope.currentcontext.TotDiscAmount = itemwiseDiscountAmt;
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotGrossAmount) - parseFloat($scope.currentcontext.TotDiscAmount);
            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                parseFloat($scope.currentcontext.ReceiptAmt) -
                (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
            var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));

            if ($scope.currentcontext.TotDiscAmount > $scope.currentcontext.TotGrossAmount) {
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                $scope.currentcontext.TotDiscAmount = itemwiseDiscountAmt;
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotGrossAmount) - parseFloat($scope.currentcontext.TotDiscAmount);

            var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var RoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue;
                RoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                RoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else {
                RoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            }

            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                parseFloat($scope.currentcontext.ReceiptAmt) -
                (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));

            $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.TotPaidAmount !== 0 ? $scope.currentcontext.TotPaidAmount : 0;
            if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0) {
                $scope.canShowSaveBtn = true;
            }

            /* Discount Limit Validation */
            if ($scope.currentcontext.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit !== null && $scope.currentcontext.TotDiscAmount > $scope.DiscountLimit) {
                        $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                        utl.Alert.showErrorMsg($scope.DiscountAlert);
                        $scope.IsDiscountApproved = false;
                    }
                } else {
                    $scope.DiscountAlert = 'Please Select Discount Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }
            //$scope.$parent.ReceivedAmt = $scope.item.Received;
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.GetPatientBillSummaryCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.PatientBillDetails = [];
            $scope.currentcontext.TotalRefundAmount = 0;
            $scope.currentcontext.TotalReceiptAmount = 0;
            $scope.currentcontext.TotalCNAmount = 0;
            if (res.BillInfo && res.BillInfo.Data.length > 0) {
                $scope.currentcontext.BillInfo = res.BillInfo;
                $scope.ActiveBillsCount = res.BillInfo.Data.length;
                res.BillInfo.Data.forEach((val, idx) => {
                    var GroupGrossAmount = 0;
                    var GroupDiscountAmount = 0;
                    var GroupNetAmount = 0;
                    var GroupSplitGrossAmount = 0;
                    var GroupSplitDiscountAmount = 0;
                    var GroupSplitNetAmount = 0;
                    if (!$scope.EncounterInfo.IsPackageAssigned) {
                        val.PatientBillSplitDetails.forEach((bill, index) => {
                            if (bill.PatientBillDetail) {
                                $scope.currentcontext.PatientBillDetails.push(bill.PatientBillDetail);
                            }
                            GroupGrossAmount += isNaN(parseFloat(bill.ItemAmount)) ? 0 : parseFloat(bill.ItemAmount);
                            GroupDiscountAmount += isNaN(parseFloat(bill.ItemDiscount)) ? 0 : parseFloat(bill.ItemDiscount);

                            GroupSplitGrossAmount += isNaN(parseFloat(bill.SplitItemAmount)) ? 0 : parseFloat(bill.SplitItemAmount);
                            GroupSplitDiscountAmount += isNaN(parseFloat(bill.SplitItemDiscount)) ? 0 : parseFloat(bill.SplitItemDiscount);
                        });
                    }
                    else {
                        $scope.item.PackageDetails = res.BillInfo.Data[0].PackageName;
                        $scope.item.PackageAmount = isNaN(parseFloat(res.PackageInfo.Data[0].PackageAmount))
                            ? 0 : parseFloat(res.PackageInfo.Data[0].PackageAmount);
                        GroupGrossAmount = isNaN(parseFloat(val.PackageAmount)) ? 0 : parseFloat(val.PackageAmount); GroupSplitGrossAmount += isNaN(parseFloat(val.ExclusionAmount)) ? 0 : parseFloat(val.ExclusionAmount);
                    }
                    GroupNetAmount = GroupGrossAmount - GroupDiscountAmount;
                    GroupSplitNetAmount = GroupSplitGrossAmount - GroupSplitDiscountAmount;

                    val.GroupGrossAmount = GroupGrossAmount;
                    val.GroupDiscountAmount = GroupDiscountAmount;
                    val.GroupNetAmount = GroupNetAmount;

                    val.GroupSplitGrossAmount = GroupSplitGrossAmount;
                    val.GroupSplitDiscountAmount = GroupSplitDiscountAmount;
                    val.GroupSplitNetAmount = GroupSplitNetAmount;
                });
                res.BillInfo.Data.sort($scope.custom_sort);
                $scope.PatientBillDetails = res.BillInfo.Data;
                vm.gridConfig.data = res.BillInfo.Data;
            $scope.refreshReactProps();
                if (res.PRFundInfo && res.PRFundInfo.Data.length > 0) {
                    var refundAmount = 0;
                    $scope.refundDetails = res.PRFundInfo.Data;
                    $scope.refundDetails.forEach((val, idx) => {
                        refundAmount += isNaN(parseFloat(val.RefundAmount)) ? 0 : parseFloat(val.RefundAmount);
                    });
                    $scope.currentcontext.TotalRefundAmount = refundAmount;
                }

                if (res.ReceiptInfo && res.ReceiptInfo.Data.length > 0) {
                    var receiptAmount = 0;
                    $scope.ReceiptDetails = res.ReceiptInfo.Data;
                    $scope.ReceiptDetails.forEach((val, idx) => {
                        if (val.ReceiptStatusId == 1)
                            receiptAmount += isNaN(parseFloat(val.AmountPaid)) ? 0 : parseFloat(val.AmountPaid);
                    });
                    $scope.currentcontext.TotalReceiptAmount = receiptAmount;
                }

                $scope.isFinalized = false;

                if (res.FinalBillInfo && res.FinalBillInfo.Id > 0) {
                    $scope.$parent.FinalBillInfo = res.FinalBillInfo;
                    $scope.isFinalized = true;
                    $scope.FinalBillInfo = res.FinalBillInfo;
                    $scope.item.PatientBillStatus = $scope.FinalBillInfo.PatientBillStatus.Description;
                    $scope.item.PatientBillId = $scope.FinalBillInfo.Id;
                    $scope.item.PatientBillStatusId = $scope.FinalBillInfo.PatientBillStatusId;
                    $scope.currentcontext.PaidAmt = $scope.FinalBillInfo.PaidAmount;
                    $scope.item.Id = $scope.FinalBillInfo.Id;
                    $scope.currentcontext.BillDiscount = $scope.FinalBillInfo.BillDiscount;
                    $scope.currentcontext.DiscountApprovedBy = $scope.FinalBillInfo.DiscountApprovedBy;
                    $scope.currentcontext.Comments = $scope.FinalBillInfo.Comments;
                    $scope.currentfilter.DiscountModeId = $scope.FinalBillInfo.BillDiscountModeId;
                    $scope.currentcontext.TotalRefundAmount = $scope.FinalBillInfo.RefundAmount;
                    $scope.currentcontext.FSTypeId = $scope.FinalBillInfo.FSTypeId;
                    $scope.currentcontext.FamilyLinkId = $scope.FinalBillInfo.FamilyLinkId;
                    $scope.currentcontext.TransferEncounterId = $scope.FinalBillInfo.TransferEncounterId;
                    $scope.currentcontext.TransferPatientId = $scope.FinalBillInfo.TransferPatientId;
                    $scope.currentcontext.TransferAmount = $scope.FinalBillInfo.TransferAmount;
                    $scope.currentcontext.SelfCreditApprovedBy = $scope.FinalBillInfo.PrivateDueId;
                    $scope.currentcontext.TDSAmount = $scope.FinalBillInfo.TDSAmount;
                    $scope.currentcontext.Disallowed = $scope.FinalBillInfo.Disallowed;
                    if ($scope.FinalBillInfo.PrivateDueId > 0) {
                        $scope.currentcontext.isSelfGuarantor = true;
                    }
                    $scope.item.GuarantorDueId = $scope.FinalBillInfo.GuarantorDueId;
                    $scope.item.FamilyLinkId = $scope.FinalBillInfo.FamilyLinkId;
                    $scope.item.TransferEncounterId = $scope.FinalBillInfo.TransferEncounterId;
                    $scope.item.TransferPatientId = $scope.FinalBillInfo.TransferPatientId;
                    $scope.item.TransferAmount = $scope.FinalBillInfo.TransferAmount;
                    $scope.HidePrintBtn = false;
                    $scope.canChangeFSType = true;
                    $scope.canShowCancelBtn = true;
                    $scope.item.isCompleted = true;
                } else {
                    $scope.HidePrintBtn = true;
                    $scope.canShowCancelBtn = false;
                }
                $scope.CalculateNetAmt();
            } else {
                $scope.BillRefreshCount++;
                if ($scope.BillRefreshCount < 2) {
                    if (!$scope.item.IsBillLock)
                        $scope.RefershSplitDetails();
                } else
                    $state.go('app.ipbillingtab.billdetails');
            }

            if ($scope.BillCompleted == 1) {
                if ($scope.item.PatientBillStatusId == 3) {
                    if ($scope.item.GuarantorTypeId == 1) $scope.print();
                    else $scope.print5();
                }
            }
        };

        $scope.GetPatientBillSummary = function () {
            var options = {
                action: 'billing/PatientBillSummary/GetPatientBillSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.currentcontext.EncounterId
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.GetPatientBillPackageSummaryDetails = function () {
            var options = {
                action: 'billing/PatientBillPackageSummary/GetPatientBillPackageSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.currentcontext.EncounterId
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            $scope.PatientInfo = $scope.$parent.selectedPatient;
            $scope.EncounterInfo = data;
            $scope.$parent.EncounterDetails = data;
            $scope.item.PatientBillDetails = [];
            $scope.RefershSplitDetails();
        };

        $scope.getEncounter = function () {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.currentcontext.EncounterId
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        //Auto Search items
        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header : 'ServiceRate Catogory', field : 'ServiceRateCategory', datatype: 'string', headercls:'td-category', fieldcls:'td-category' },
                { header: 'ServiceItem Rate', field: 'Rate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            //Search only active patients
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0) {
                    item.Rate = item.ServiceItemTariffDetails[0].Rate;
                }
            }
        }

        $scope.getServiceItem = function (idx, item) {
            var selectedItem = item.SelectedItem;
            item.ServiceGroupId = selectedItem.BillingGroupId;
            item.ServiceSubCategoryId = selectedItem.SubCategoryId;
            item.IsOrderable = selectedItem.IsOrderable;
            item.ServiceCategoryId = selectedItem.CategoryId;
            item.TestCode = selectedItem.ItemCode;
            item.TestName = selectedItem.Name;
            item.TestDescription = selectedItem.Name;
            item.MasterTypeId = selectedItem.MasterTypeId;
            item.TestId = selectedItem.MasterItemId;
            item.TestTypeId = selectedItem.OrderTypeId;
            item.MasterItemId = selectedItem.MasterItemId;
            item.MasterName = selectedItem.MasterName;
            item.IsPackageItem = selectedItem.IsPackage;
            item.IsPackage = selectedItem.IsPackage;
            item.DoctorId = $scope.EncounterInfo.DoctorId;
            item.ServiceName = selectedItem.ServiceName;
            item.DepartmentId = selectedItem.DepartmentId;
            item.IsSupplementary = false;
            if (selectedItem.Supplementary && selectedItem.Supplementary.length > 0)
                item.IsSupplementary = true;
            var ServiceTraiffobj = $filter('filter')(selectedItem.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.EncounterInfo.ServiceRateCategoryId }, true);
            if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                item.ServiceRateCategoryId = ServiceTraiffobj[0].ServiceRateCategoryId;
                item.ServiceRateCategoryName = ServiceTraiffobj[0].Text;
                item.Rate = ServiceTraiffobj[0].Rate;
                item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                item.Amount = item.Quantity * item.Rate;
            }
            var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.EncounterInfo.GuarantorId);
            if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                var ServiceItemAliasobj = $filter('filter')(selectedItem.ServiceItemAliases, { ExternalProviderId: selectedGuarantor.GuarantorId }, true);
                if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                    item.AliasId = ServiceItemAliasobj[0].AliasId;
                    item.AliasName = ServiceItemAliasobj[0].AliasName;
                }
            }
            if (item.Id === 0) {
                var totalLength = $scope.currentcontext.BillInfo.Data.length;
                var loopCount = 0;
                $scope.currentcontext.BillInfo.Data.forEach((val, idx) => {
                    if (item.ServiceCategoryId === val.ServiceCategoryId) {
                        val.PatientBillSplitDetails.push({ PatientBillDetail: item });
                    } else {
                        loopCount++;
                    }
                    if (loopCount == totalLength) {
                        val.PatientBillSplitDetails.push({ PatientBillDetail: item });
                    }
                });

                $scope.currentcontext.PatientBillDetails.push(item);
                $scope.CalculateNetAmt();
            }
        };

        $scope.addNewServiceItem = function () {
            var patientBillDetail = {
                Id: 0,
                ServiceId: 0,
                ServiceName: '',
                Quantity: 1,
                Rate: 0,
                Status: 1
            };
            $scope.item.PatientBillDetails.push(patientBillDetail);
        };

        $scope.updateAmountbyQtyRate = function (item) {
            item.Amount = item.Quantity * item.Rate;
            $scope.CalculateNetAmt();
        };

        $scope.deleteBillDetails = function (item, ServiceName) {
            utl.Dialog.confirmCancel($scope.onCancelConfirmed, item, ServiceName);
        };

        $scope.onCancelConfirmed = function (item) {
            item.PatientBillStatusId = 2;
            item.Status = 2;
            $scope.CalculateNetAmt();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (data) {
                $scope.item.PatientBillDetails = [];
                $scope.currentcontext.PatientBillDetails = [];
                $scope.currentcontext.BillInfo = {};
                if (!$scope.EncounterInfo.IsPackageAssigned)
                    $scope.GetPatientBillSummary();
                else
                    $scope.GetPatientBillPackageSummaryDetails();
            }
        };

        $scope.saveItem = function () {
            var updatedPatientBill = [];
            $scope.currentcontext.PatientBillDetails.forEach((val) => {
                val.GrossAmount = val.Amount;
                if (val.Id > 0) {
                    val.PatientBillStatusId = (val.Status == 2 ? 2 : val.PatientBillStatusId);
                    val.CancelledBy = utl.Session.getCurrentUserId();
                    val.Status = 1;
                    updatedPatientBill.push(val);
                }
                else if (val.Id === 0 && val.Status !== 2) {
                    val.PatientBillId = 0;
                    val.PatientBillStatusId = 3;
                    val.BillDateTime = new Date();
                    updatedPatientBill.push(val);
                }

            });
            var actionName = 'billing/PatientbillDetails/UpdateSimpleViewBill';
            var options = {
                action: actionName,
                data: {
                    Data: {
                        EncounterId: $scope.EncounterInfo.Id,
                        UserId: utl.Session.getCurrentUserId(),
                        BillDetails: updatedPatientBill
                    }
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {
            $scope.item.PatientBillDetails = [];
            if (actionType == 'view') {
                if ($scope.EncounterInfo.IsPackageAssigned)
                    console.log(row.entity.Id);
                else {
                    var patientBillDetails = []; row.entity.PatientBillSplitDetails.forEach((value, idx) => {
                        if (value.PatientBillDetail) {
                            patientBillDetails.push(value.PatientBillDetail);
                        }
                    });
                }
                $scope.item.PatientBillDetails = patientBillDetails;
            }
        };


        //React bridge: replaces the ui-grid="vm.gridConfig" grid with the
        //shared BridgeGridScreen.
        //
        //NOTE: unlike discharged-patients, this screen's cellTemplates are
        //CORRECT for their container -- it is a real <div ui-grid=...>, where
        //row.entity and grid.appScope genuinely exist. Translating them here is
        //a straight port, not a repair: the row's entity supplies the cell
        //values, and the action dispatcher calls $scope.handleEvents with the
        //SAME { entity: ... } wrapper ui-grid passed, so handleEvents keeps
        //reading row.entity.Id and row.entity.PatientBillSplitDetails unchanged.
        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (entity === null) { return; }
            if (actionType == 'rowAction') {
                $scope.handleEvents(payload.key, { entity: entity });
            }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'itemname', header: hdr(0), sortable: true },
                        { key: 'amount', header: hdr(1), align: 'right' }
                    ],
                    actionsHeader: hdr(2) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        return {
                            id: entity.Id,
                            //The original view action carries no ng-show/ng-if.
                            actions: [{ key: 'view', label: '', icon: 'fas fa-eye', variant: 'icon', title: 'View' }],
                            cells: {
                                itemname: entity.ServiceCategory && entity.ServiceCategory.ServiceCategoryName,
                                amount: $filter('displaycurrency')(entity.GroupNetAmount)
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "ServiceCategory.ServiceCategoryName",
                displayName: $translate.instant('billing.billing-details.itemname.lbl'),
            }, {
                field: "GroupNetAmount",
                displayName: $translate.instant('billing.billing-details.amount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.GroupNetAmount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" >\
                <i class="fas fa-eye" aria-hidden="true"></i></span> \
                </div>',

            }],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.refreshReactProps();
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounter();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "PatientGuarantor" }
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

    simplebillController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();