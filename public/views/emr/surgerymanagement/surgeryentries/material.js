(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MaterialController', MaterialController);

    function MaterialController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.SelectedIndex = -1;

        $scope.PatientBillInfo = [];
        $scope.DeletedPatientBills = [];
        $scope.PatientBillDetails = [];

        $scope.selectedPatient = {};
        $scope.itemUsedBatches = {};

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            PatientId: -1,
            PatientName: '',
            DoctorId: -1,
            DoctorName: '',
            BillDate: utl.Formatter.getCurrentDate(),
            BillDateTime: null,
            BillNumber: '',
            GuarantorTypeId: -1,
            GuarantorId: -1,
            GuarantorName: '',
            StoreMasterId: 0,
            DepartmentId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientBillStatusId: 1,
            PatientBillStatus: null,
            PatientStatusId: 0,
            PharmacySaleTypeId: 2,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            TotalNetAmount: 0,
            IsPharmacyBill: 1,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            RdoPatientId: false,
            RdoGuarantorId: false,
            RdoDoctorId: false,
            RdoStoreMasterId: false,
            RdoWardId: false,
            RdoRoomId: false,
            DrugServiceCategoryId: 0,
            DrugServiceGroupId: 0,
            NonDrugServiceCategoryId: 0,
            NonDrugServiceGroupId: 0
        };

        $scope.currentcontext = {
            id: 0,
            ApprovedById: -1,
            CanCancelBill: utl.Privilege.hasPrivilege('CanCancelBill'),
            PatientBillStatusId: 1,
            PharmacyBillStatusId: 0,
            PatientStatusId: 1,
            otregisterid: parseInt($stateParams.id)
        };


        $scope.StoreChange = function (SelectedStore) {
            $scope.clear();
        };

        $scope.applyVisibilityRules = function () {
            if ($scope.item.PatientBillStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
            }
            if ($scope.item.PatientBillStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
            }
            if ($scope.item.PatientBillStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
            }
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientBillDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }
            var PatientBillDetail = {
                Id: 0,
                BillDateTime: utl.Formatter.getCurrentDate(),
                ServiceId: -1,
                ServiceCode: null,
                ServiceName: null,
                ItemMasterId: -1,
                ItemCode: null,
                ItemName: null,
                ScheduleTypeId: 0,
                ScheduleTypeDescription: null,
                StoreMasterId: 0,
                ItemTypeId: 0,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: '',
                MasterItemId: 0,
                EncounterId: 0,
                PatientBillStatusId: 0,
                MasterTypeId: 0,
                StockSerialItemId: 0,
                StockItemId: 0,
                Quantity: 0,
                BatchQuantity: 0,
                TotalQuantity: 0,
                BatchId: '',
                SelectedBatchId: '',
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    ItemMasterId: 0,
                    StoreMasterId: 0,
                    BatchId: '',
                    SelectedBatchId: '',
                    Quantity: 0,
                    ExpiryDate: null,
                    Ucp: 0,
                    Mrp: 0,
                    GSTId: 0,
                    GSTPercentage: 0,
                    InGstId: 0,
                    InGstPercentage: 0,
                    CGstId: 0,
                    CGstPercentage: 0,
                    SGstId: 0,
                    SGstPercentage: 0,
                    SerialDetails: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false
                },
                ExpiryDate: null,
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                Ucp: 0.00,
                Mrp: 0.00,
                Rate: 0.00,
                Amount: 0.00,
                GrossAmount: 0.00,
                GrossGSTAmount: 0.00,
                DiscountPercentage: 0.00,
                DiscountAmount: 0.00,
                DoctorDiscountAmount: 0.00,
                EducationCess: 0.00,
                UnitGSTAmount: 0.00,
                GSTAmount: 0.00,
                NetAmountBeforeGST: 0.00,
                NetAmount: 0.00,
                GSTId: 0,
                GSTPercentage: 0,
                TaxCode: '',
                DoctorId: 0,
                DoctorName: '',
                IsPackageItem: 0,
                PackageId: 0,
                PackageName: '',
                OrderId: 0,
                OrderDetailId: 0,
                OrderTypeId: 0,
                OrderDateTime: null,
                ServiceRateCategoryId: 0,
                ServiceRateCategoryName: '',
                IsModified: 0,
                IsSupplimentary: 0,
                IsBillable: 0,
                IsPharmacySale: 1,
                IsDoctorDiscount: 0,
                IsGstDoctor: 0,
                StartDateTime: null,
                EndDateTime: null,
                DiscountTypeId: 0,
                DiscountModeId: 0,
                DiscountAuthorizedBy: 0,
                DoctorShare: 0,
                ReferalShare: 0,
                CNAmount: 0,
                CancelReason: 0,
                CancelledBy: 0,
                Comments: '',
                DepartmentId: 0,
                GenericName: null,
                UnitCostPrice: 0.00,
                MrPrice: 0.00,
                InGstId: 0,
                CGstId: 0,
                SGstId: 0,
                InGstPercentage: 0,
                CGstPercentage: 0,
                SGstPercentage: 0,
                UnitInGstAmount: 0,
                UnitCGstAmount: 0,
                UnitSGstAmount: 0,
                InGstAmount: 0,
                CGstAmount: 0,
                SGstAmount: 0,
                RdoItemMasterId: false,
                tabindex: $scope.tabindexmap.detailtabindex++,
                Status: 1
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetail.PatientBillId = $scope.currentcontext.id;
            }
            $scope.PatientBillDetails.push(PatientBillDetail);

            $scope.SelectedIndex = $scope.PatientBillDetails.length;
        };

        $scope.onBatchSelected = function (pharmacyItem, selectedMasterItem, idx) {
            //Check If SelectedBatchId Allowed
            var existing = $scope.itemUsedBatches[pharmacyItem.ItemMasterId].indexOf(pharmacyItem.BatchId);
            var modified = $scope.itemUsedBatches[pharmacyItem.ItemMasterId].indexOf(pharmacyItem.SelectedBatchId);
            if (modified == -1) {
                pharmacyItem.StockSerialItemId = selectedMasterItem.Id;
                pharmacyItem.StockItemId = selectedMasterItem.StockItemId;
                pharmacyItem.BatchId = selectedMasterItem.BatchId;
                pharmacyItem.SelectedBatchId = selectedMasterItem.BatchId;
                pharmacyItem.BatchQuantity = selectedMasterItem.Quantity;
                pharmacyItem.UnitCostPrice = selectedMasterItem.Ucp;
                pharmacyItem.MrPrice = selectedMasterItem.Mrp;
                pharmacyItem.Quantity = 0.00;
                pharmacyItem.Amount = 0.00;
                pharmacyItem.GrossAmount = 0.00;
                pharmacyItem.DiscountAmount = 0.00;
                pharmacyItem.GSTAmount = 0.00;
                pharmacyItem.InGstAmount = 0.00;
                pharmacyItem.CGstAmount = 0.00;
                pharmacyItem.SGstAmount = 0.00;
                pharmacyItem.NetAmount = 0.00;

                pharmacyItem.GSTId = selectedMasterItem.GstId;
                pharmacyItem.GSTPercentage = selectedMasterItem.GstPercentage;
                pharmacyItem.UnitGSTAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.GstPercentage).toFixed(4));

                pharmacyItem.InGstId = selectedMasterItem.InGstId;
                pharmacyItem.InGstPercentage = selectedMasterItem.InGstPercentage;
                pharmacyItem.UnitInGstAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.InGstPercentage).toFixed(4));

                pharmacyItem.CGstId = selectedMasterItem.CGstId;
                pharmacyItem.CGstPercentage = selectedMasterItem.CGstPercentage;
                pharmacyItem.UnitCGstAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.CGstPercentage).toFixed(4));

                pharmacyItem.SGstId = selectedMasterItem.SGstId;
                pharmacyItem.SGstPercentage = selectedMasterItem.SGstPercentage;
                pharmacyItem.UnitSGstAmount = parseFloat(((pharmacyItem.MrPrice / 100) * selectedMasterItem.SGstPercentage).toFixed(4));

                if (selectedMasterItem.ExpiryAlert) {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = true;
                    pharmacyItem.ExpiryStop = false;
                    pharmacyItem.ExpiryProceed = false;
                    pharmacyItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                } else if (selectedMasterItem.ExpiryStop) {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = false;
                    pharmacyItem.ExpiryStop = true;
                    pharmacyItem.ExpiryProceed = false;
                    pharmacyItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                } else {
                    pharmacyItem.ExpiryDate = null;
                    pharmacyItem.ExpiryAlert = false;
                    pharmacyItem.ExpiryStop = false;
                    pharmacyItem.ExpiryProceed = true;
                    pharmacyItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                }

                if (existing > -1) {
                    $scope.itemUsedBatches[pharmacyItem.ItemMasterId].splice(existing, 1);
                }
                $scope.itemUsedBatches[pharmacyItem.ItemMasterId].push(pharmacyItem.BatchId);
            } else if (modified > -1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.batchalert2.lbl') + pharmacyItem.ItemName);
                pharmacyItem.SelectedBatchId = pharmacyItem.BatchId;
            }

            $scope.CalculateNetAmt();
        };

        $scope.ServiceItemChanged = function (idx, selectedItem) {
            var prevItem = selectedItem.PreviousItem;
            var SelectedMasterItem = selectedItem.SelectedItem;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
            if (SelectedMasterItem.ItemMaster.GenericMaster)
                selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericMaster.GenericName;
            if (SelectedMasterItem.ItemMaster.ScheduleType) {
                selectedItem.ScheduleTypeId = SelectedMasterItem.ItemMaster.ScheduleTypeId;
                selectedItem.ScheduleTypeDescription = SelectedMasterItem.ItemMaster.ScheduleType.Description;
            } else {
                selectedItem.ScheduleTypeId = 0;
                selectedItem.ScheduleTypeDescription = '';
            }

            if (SelectedMasterItem.ItemMaster.SubCategoryId == 1) {
                selectedItem.ServiceTypeId = 0;
                selectedItem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                selectedItem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
            } else if (SelectedMasterItem.ItemMaster.SubCategoryId == 2) {
                selectedItem.ServiceTypeId = 0;
                selectedItem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                selectedItem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
            } else {
                selectedItem.ServiceTypeId = 0;
                selectedItem.ServiceGroupId = 0;
                selectedItem.ServiceCategoryId = 0;
                selectedItem.MasterName = '';
                selectedItem.MasterItemId = 0;
                selectedItem.MasterTypeId = 0;
            }

            if (prevItem && prevItem.ItemMasterId != SelectedMasterItem.ItemMasterId) {
                selectedItem.BatchDetails = [];
                selectedItem.Quantity = 0;
                selectedItem.ExpiryAlert = false;
                selectedItem.ExpiryStop = false;
                selectedItem.ExpiryProceed = false;
                var existing = $scope.itemUsedBatches[prevItem.ItemMasterId].indexOf(prevItem.BatchId);
                if (existing > -1) {
                    $scope.itemUsedBatches[prevItem.ItemMasterId].splice(existing, 1);
                }
                $scope.CalcualteAmt(selectedItem);
            }

            var stockserialitems = null;
            if (SelectedMasterItem.ItemMaster.StockItem &&
                SelectedMasterItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                stockserialitems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
                var usedBatches = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                for (var batid = 0; batid < stockserialitems.length; batid++) {
                    var serialitem = stockserialitems[batid];
                    if (serialitem.Quantity > 0 && usedBatches.indexOf(serialitem.BatchId) == -1) {
                        serialitem.SerialDetails = [
                            ' Batch: ', serialitem.BatchId,
                            ' | Qty: ', serialitem.Quantity,
                            ' | Expiry: ', $filter('date')(serialitem.ExpiryDate, 'd-MMM-y'),
                            ' | UCP: ', serialitem.Ucp,
                            ' | MRP: ', serialitem.Mrp
                        ].join(' ');

                        var TodayDate = new Date().toISOString().slice(0, 10);
                        var CurDate = new Date(TodayDate);

                        var FutureDate = serialitem.ExpiryDate.slice(0, 10);
                        var ExpDate = new Date(FutureDate);

                        var ExpiryDays = Math.round((ExpDate - CurDate) / (1000 * 60 * 60 * 24));

                        if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                            serialitem.ExpiryStop = true;
                        } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                            serialitem.ExpiryAlert = true;
                        } else {
                            serialitem.ExpiryProceed = true;
                        }

                        selectedItem.BatchDetails.push(serialitem);
                    }
                }

                if (selectedItem.BatchDetails && selectedItem.BatchDetails.length > 0) {
                    selectedItem.StockSerialItemId = selectedItem.BatchDetails[0].Id;
                    selectedItem.StockItemId = selectedItem.BatchDetails[0].StockItemId;
                    selectedItem.BatchId = selectedItem.BatchDetails[0].BatchId;
                    selectedItem.SelectedBatchId = selectedItem.BatchId;
                    selectedItem.BatchQuantity = selectedItem.BatchDetails[0].Quantity;
                    selectedItem.TotalQuantity = SelectedMasterItem.ItemMaster.StockItem.Quantity;
                    selectedItem.UnitCostPrice = selectedItem.BatchDetails[0].Ucp;
                    selectedItem.MrPrice = selectedItem.BatchDetails[0].Mrp;

                    selectedItem.GSTId = selectedItem.BatchDetails[0].GstId;
                    selectedItem.GSTPercentage = selectedItem.BatchDetails[0].GstPercentage;
                    selectedItem.UnitGSTAmount = parseFloat(((selectedItem.MrPrice / 100) * selectedItem.GSTPercentage).toFixed(4));

                    selectedItem.InGstId = selectedItem.BatchDetails[0].InGstId;
                    selectedItem.InGstPercentage = selectedItem.BatchDetails[0].InGstPercentage;
                    selectedItem.UnitInGstAmount = parseFloat(((selectedItem.MrPrice / 100) * selectedItem.InGstPercentage).toFixed(4));

                    selectedItem.CGstId = selectedItem.BatchDetails[0].CGstId;
                    selectedItem.CGstPercentage = selectedItem.BatchDetails[0].CGstPercentage;
                    selectedItem.UnitCGstAmount = parseFloat(((selectedItem.MrPrice / 100) * selectedItem.CGstPercentage).toFixed(4));

                    selectedItem.SGstId = selectedItem.BatchDetails[0].SGstId;
                    selectedItem.SGstPercentage = selectedItem.BatchDetails[0].SGstPercentage;
                    selectedItem.UnitSGstAmount = parseFloat(((selectedItem.MrPrice / 100) * selectedItem.SGstPercentage).toFixed(4));

                    if (selectedItem.BatchDetails[0].ExpiryAlert) {
                        selectedItem.ExpiryDate = null;
                        selectedItem.ExpiryAlert = true;
                        selectedItem.ExpiryDate = selectedItem.BatchDetails[0].ExpiryDate;
                    } else if (selectedItem.BatchDetails[0].ExpiryStop) {
                        selectedItem.ExpiryDate = null;
                        selectedItem.ExpiryStop = true;
                        selectedItem.ExpiryDate = selectedItem.BatchDetails[0].ExpiryDate;
                    } else {
                        selectedItem.ExpiryDate = null;
                        selectedItem.ExpiryProceed = true;
                        selectedItem.ExpiryDate = selectedItem.BatchDetails[0].ExpiryDate;
                    }

                    $scope.itemUsedBatches[selectedItem.ItemMasterId] = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                    $scope.itemUsedBatches[selectedItem.ItemMasterId].push(selectedItem.BatchId);
                } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.batchalert.lbl') + selectedItem.ItemName);

                    return false;
                }
            }

            selectedItem.PreviousItem = {};
            selectedItem.PreviousItem.BatchId = selectedItem.BatchId;
            selectedItem.PreviousItem.ItemMasterId = selectedItem.ItemMasterId;

            var PharItemLineDetails = [];
            for (var pildid = 0; pildid < $scope.PatientBillDetails.length; pildid++) {
                var PharItemLineDetail = $scope.PatientBillDetails[pildid];
                if (PharItemLineDetail.Status == 1) {
                    PharItemLineDetails.push(PharItemLineDetail);
                }
            }

            var lastIndex = PharItemLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.CalcualteAmt = function (item) {
            if (item.Quantity > item.BatchQuantity) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.availqty.lbl'));

                item.Quantity = 0;
            } else if (item.Quantity === null) { } else {
                item.Rate = item.MrPrice;
                item.Amount = item.Quantity * item.Rate;
                item.GSTAmount = item.UnitGSTAmount * item.Quantity;
                item.InGstAmount = item.UnitInGstAmount * item.Quantity;
                item.CGstAmount = item.UnitCGstAmount * item.Quantity;
                item.SGstAmount = item.UnitSGstAmount * item.Quantity;
                item.NetAmount = item.Amount;
                item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;

                $scope.CalculateNetAmt();
            }
        };

        $scope.CalculateNetAmt = function () {
            var itemwisegrossamount = 0;
            var itemwisegstamount = 0;
            var itemwiseingstamount = 0;
            var itemwisecgstamount = 0;
            var itemwisesgstamount = 0;
            var itemwisenetamount = 0;

            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                if ($scope.PatientBillDetails[i].Status == 1) {
                    var itemgrossamount = 0;
                    var itemgstamount = 0;
                    var itemingstamount = 0;
                    var itemcgstamount = 0;
                    var itemsgstAmount = 0;
                    var itemnetamount = 0;

                    itemgrossamount = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                    itemgstamount = isNaN(parseFloat($scope.PatientBillDetails[i].GSTAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].GSTAmount);
                    itemingstamount = isNaN(parseFloat($scope.PatientBillDetails[i].InGstAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].InGstAmount);
                    itemcgstamount = isNaN(parseFloat($scope.PatientBillDetails[i].CGstAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].CGstAmount);
                    itemsgstAmount = isNaN(parseFloat($scope.PatientBillDetails[i].SGstAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].SGstAmount);
                    itemnetamount = isNaN(parseFloat($scope.PatientBillDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].NetAmount);

                    itemwisegrossamount += itemgrossamount;
                    itemwisegstamount += itemgstamount;
                    itemwiseingstamount += itemingstamount;
                    itemwisecgstamount += itemcgstamount;
                    itemwisesgstamount += itemsgstAmount;
                    itemwisenetamount += itemnetamount;
                }
            }

            $scope.item.TotalGrossAmount = itemwisegrossamount;
            $scope.item.TotalGstAmount = itemwisegstamount;
            $scope.item.TotalInGstAmount = itemwiseingstamount;
            $scope.item.TotalCGstAmount = itemwisecgstamount;
            $scope.item.TotalSGstAmount = itemwisesgstamount;
            $scope.item.TotalNetAmount = itemwisenetamount;
        };

        $scope.clear = function () {
            $state.reload();
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.amountConversion = function (amount) {
            if (amount !== undefined) {
                return parseFloat(amount).toFixed(2);
            } else {
                return '0.00';
            }
        };

        function PatientIPPharmacyBillPickerCallback(patientbilldata) {
            $scope.currentcontext.id = patientbilldata.BillId;
            $scope.currentcontext.PharmacyBillStatusId = patientbilldata.BillStatusId;
            $scope.getBillInfoByBillId();
        }

        $scope.findBill = function () {
            utl.Modal.open('app.find-ip-pharmacy-sales', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: PatientIPPharmacyBillPickerCallback
            });
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.add_new = function () {
            $state.go('app.ip-pharmacy-sales', {
                id: 0,
                pid: $scope.currentcontext.pid
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.originalprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'billing/patientbills/PrintIPPharmacyBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: false
                }
            };
            var options = {
                action: 'billing/patientbills/PrintIPPharmacyBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: true,
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'billing/patientbills/PrintPharmacyBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.deletePatientBillDetails = function (idx, item) {
            if (item.ItemMasterId != -1) {
                var existing = $scope.itemUsedBatches[item.ItemMasterId].indexOf(item.SelectedBatchId);
                $scope.itemUsedBatches[item.ItemMasterId].splice(existing, 1);

                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            var index = $scope.PatientBillDetails.indexOf(item);
            $scope.DeletedPatientBills.push(item);
            $scope.PatientBillDetails.splice(index, 1);
            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex < 0) {
                $scope.addNewLineItem();
            }
            $scope.CalculateNetAmt();
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.PatientName = patientbills.PatientName;
                    $scope.item.DoctorId = patientbills.DoctorId;
                    $scope.item.DoctorName = patientbills.DoctorName;
                    $scope.item.BillDate = patientbills.BillDateTime;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                    $scope.item.BillNumber = patientbills.BillNumber;
                    $scope.item.GuarantorTypeId = patientbills.GuarantorTypeId;
                    $scope.item.GuarantorId = patientbills.GuarantorId;
                    $scope.item.GuarantorName = patientbills.GuarantorName;
                    $scope.item.StoreMasterId = patientbills.StoreMasterId;
                    $scope.item.DepartmentId = patientbills.DepartmentId;
                    $scope.item.FacilityId = patientbills.FacilityId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                    $scope.item.PatientStatusId = patientbills.PatientBillStatusId;
                    $scope.item.PharmacySaleTypeId = patientbills.PharmacySaleTypeId;
                    $scope.item.TotalGrossAmount = patientbills.BillAmount;
                    $scope.item.TotalGstAmount = patientbills.GSTAmount;
                    $scope.item.TotalInGstAmount = patientbills.InGstAmount;
                    $scope.item.TotalCGstAmount = patientbills.CGstAmount;
                    $scope.item.TotalSGstAmount = patientbills.SGstAmount;
                    $scope.item.TotalNetAmount = patientbills.BillAmount;
                    $scope.item.IsPharmacyBill = 1;

                    if ($scope.item.PatientBillStatusId == 3) {
                        $scope.item.RdoPatientId = true;
                        $scope.item.RdoGuarantorId = true;
                        $scope.item.RdoDoctorId = true;
                        $scope.item.RdoStoreMasterId = true;
                        $scope.item.RdoWardId = true;
                        $scope.item.RdoRoomId = true;
                    }

                    $scope.currentcontext.id = patientbills.Id;
                    $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;

                    $scope.PatientBillDetails = [];
                    $scope.PatientBillDetails = patientbills.PatientBillDetails;
                    for (var saledidx in $scope.PatientBillDetails) {
                        var saleditem = $scope.PatientBillDetails[saledidx];
                        saleditem.BatchDetails = [];
                        if (saleditem.ItemMasterId > 0) {
                            saleditem.ExpiryProceed = true;
                            saleditem.MrPrice = saleditem.Rate;
                            saleditem.SelectedBatchId = saleditem.BatchId;
                            var SaledBatchDetail = {
                                Id: 0,
                                StockItemId: 0,
                                ItemMasterId: 0,
                                StoreMasterId: 0,
                                BatchId: '',
                                SelectedBatchId: '',
                                Quantity: 0,
                                ExpiryDate: null,
                                Ucp: 0,
                                Mrp: 0,
                                SerialDetails: null
                            };

                            SaledBatchDetail.Id = saleditem.StockSerialItemId;
                            SaledBatchDetail.StockItemId = saleditem.StockItemId;
                            SaledBatchDetail.ItemMasterId = saleditem.ItemMasterId;
                            SaledBatchDetail.StoreMasterId = saleditem.StoreMasterId;
                            SaledBatchDetail.BatchId = saleditem.BatchId;
                            SaledBatchDetail.SelectedBatchId = saleditem.BatchId;
                            SaledBatchDetail.Quantity = saleditem.Quantity;
                            SaledBatchDetail.ExpiryDate = saleditem.ExpiryDate;
                            SaledBatchDetail.Ucp = saleditem.Rate;
                            SaledBatchDetail.Mrp = saleditem.Rate;

                            SaledBatchDetail.SerialDetails = [
                                ' Batch: ', saleditem.BatchId,
                                ' | Qty: ', saleditem.Quantity,
                                ' | Expiry: ', saleditem.ExpiryDate,
                                ' | UCP: ', saleditem.Rate,
                                ' | MRP: ', saleditem.Rate
                            ].join(' ');

                            saleditem.BatchDetails.push(SaledBatchDetail);
                        }

                        if ($scope.item.PatientBillStatusId == 3) {
                            saleditem.RdoItemMasterId = true;
                        }
                    }

                    $scope.applyVisibilityRules();
                    $scope.CalculateNetAmt();
                });
            }
        };

        $scope.getBillInfoByBillNumber = function () {
            var SearchBillnumber = $scope.item.BillNumber;
            if ($scope.currentcontext.id <= 0 && (SearchBillnumber && SearchBillnumber.length > 0)) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: SearchBillnumber
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getBillInfoByBillId = function () {
            var SearchBillId = $scope.currentcontext.id;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchBillId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;

            $scope.getBillInfoByBillId();
            $scope.applyVisibilityRules();

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.completeBill = function (action) {
            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billing-details.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: action,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveDraft = function () {
            $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem(1);
        };

        $scope.saveAndApprove = function () {
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber === null) {
                $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            }
            $scope.saveItem(3);
        };

        $scope.onCancelConfirmed = function (reason) {
            $scope.item.CancelReason = reason;
            $scope.saveItem(2);
        };

        $scope.saveBillCancelled = function () {
            $scope.saveItem(3);
        };

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.opbilling-list.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.CancelReceipt,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function (StatusId) {
            if ($scope.item.IsEncounter === false) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.patientalert.lbl'));
                $scope.clear();
                return false;
            }

            $scope.item.PatientBillStatusId = StatusId;

            if (!$scope.PatientBillDetails || $scope.PatientBillDetails.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));

                return false;
            } else {
                var ItemCount = 0;
                var ItemCheck = 0;
                var CheckExpiry = 0;
                var ItemName = null;
                if ($scope.PatientBillDetails.length === 1) {
                    for (var idx1 in $scope.PatientBillDetails) {
                        var item1 = $scope.PatientBillDetails[idx1];
                        if (item1 && item1.ItemMasterId < 0) {
                            ItemCount = 1;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && item1.Quantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else if (item1.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    for (var idx in $scope.PatientBillDetails) {
                        var item = $scope.PatientBillDetails[idx];
                        if (item && item.ItemMasterId >= 0 && item.Quantity <= 0) {
                            ItemCheck = 1;
                            ItemName = item.ItemName;
                            break;
                        } else if (item.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                }

                if (ItemCount == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.itemalert.lbl'));
                    return false;
                }

                if (ItemCheck == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.qtyalert.lbl') + ItemName);
                    return false;
                }

                if (CheckExpiry == 1) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.expiryalert.lbl') + ItemName);

                    return false;
                }
            }

            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.item.BillTypeId = 3;
            $scope.item.BillPriorityId = 1;
            $scope.item.BillAmount = $scope.item.TotalGrossAmount;
            $scope.item.GSTAmount = $scope.item.TotalGstAmount;
            $scope.item.InGstAmount = $scope.item.TotalInGstAmount;
            $scope.item.CGstAmount = $scope.item.TotalCGstAmount;
            $scope.item.SGstAmount = $scope.item.TotalSGstAmount;
            $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();
            $scope.item.BillApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.PharmacyBillStatusId = $scope.currentcontext.PharmacyBillStatusId;
            $scope.item.PatientTypeId = 0;
            if ($scope.item.IsEncounter)
                $scope.item.EncounterId = $scope.encounter.Id;
            $scope.item.EncounterTypeId = 2;
            if ($scope.item.CancelReason)
                $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            else
                $scope.item.CancelledBy = 0;

            if (checkMandatoryFields()) {
                var pharmacyitemlines = getLinesForSave();
                var paymentlines = [];
                var actionName = 'billing/patientbills/AddPatientPharmacyBills';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientbills/UpdatePatientPharmacyBills';
                }

                var inputData = {
                    Header: $scope.item,
                    Details: pharmacyitemlines,
                    paymentDetail: paymentlines
                };

                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };

                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.PatientBillDetails, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if ((item.RxName) && (!item.ItemMasterId || !item.ItemName || !item.Quantity > 0 || item.MrPrice > 0 ||
                    item.Amount > 0 || !item.Discount >= 0 || item.TaxRate >= 0 || !item.NetAmount > 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var piidx in $scope.PatientBillDetails) {
                var pharmacyitem = $scope.PatientBillDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && pharmacyitem.Quantity > 0) {
                    pharmacyitem.BillDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ServiceId = pharmacyitem.ItemMasterId;
                    pharmacyitem.ServiceCode = pharmacyitem.ItemCode;
                    pharmacyitem.ServiceName = pharmacyitem.ItemName;
                    pharmacyitem.ServiceTypeId = pharmacyitem.ServiceTypeId;
                    pharmacyitem.ServiceGroupId = pharmacyitem.ServiceGroupId;
                    pharmacyitem.ServiceCategoryId = pharmacyitem.ServiceCategoryId;
                    pharmacyitem.MasterName = pharmacyitem.MasterName;
                    pharmacyitem.MasterItemId = pharmacyitem.MasterItemId;
                    pharmacyitem.EncounterId = $scope.item.EncounterId;
                    pharmacyitem.PatientBillStatusId = $scope.item.PatientBillStatusId;
                    pharmacyitem.MasterTypeId = pharmacyitem.MasterTypeId;
                    pharmacyitem.Quantity = pharmacyitem.Quantity;
                    pharmacyitem.ReturnedQuantity = 0;
                    pharmacyitem.StockItemId = pharmacyitem.StockItemId;
                    pharmacyitem.StockSerialItemId = pharmacyitem.StockSerialItemId;
                    pharmacyitem.BatchId = pharmacyitem.BatchId;
                    pharmacyitem.ExpiryDate = pharmacyitem.ExpiryDate;
                    pharmacyitem.Rate = pharmacyitem.MrPrice;
                    pharmacyitem.Amount = pharmacyitem.Amount;
                    pharmacyitem.GrossAmount = pharmacyitem.Amount;
                    pharmacyitem.GrossGSTAmount = 0;
                    pharmacyitem.DiscountAmount = 0;
                    pharmacyitem.DoctorDiscountAmount = 0;
                    pharmacyitem.EducationCess = 0;
                    pharmacyitem.GSTAmount = pharmacyitem.GSTAmount;
                    pharmacyitem.NetAmountBeforeGST = pharmacyitem.NetAmountBeforeGST;
                    pharmacyitem.NetAmount = pharmacyitem.NetAmount;
                    pharmacyitem.GSTId = pharmacyitem.GSTId;
                    pharmacyitem.GSTPercentage = pharmacyitem.GSTPercentage;
                    pharmacyitem.TaxCode = pharmacyitem.TaxCode;
                    pharmacyitem.InGstId = pharmacyitem.InGstId;
                    pharmacyitem.InGstPercentage = pharmacyitem.InGstPercentage;
                    pharmacyitem.InGstAmount = pharmacyitem.InGstAmount;
                    pharmacyitem.CGstId = pharmacyitem.CGstId;
                    pharmacyitem.CGstPercentage = pharmacyitem.CGstPercentage;
                    pharmacyitem.CGstAmount = pharmacyitem.CGstAmount;
                    pharmacyitem.SGstId = pharmacyitem.SGstId;
                    pharmacyitem.SGstPercentage = pharmacyitem.SGstPercentage;
                    pharmacyitem.SGstAmount = pharmacyitem.SGstAmount;
                    pharmacyitem.DoctorId = $scope.item.DoctorId;
                    pharmacyitem.DoctorName = $scope.item.DoctorName;
                    pharmacyitem.IsPackageItem = 0;
                    pharmacyitem.PackageId = 0;
                    pharmacyitem.PackageName = '';
                    pharmacyitem.OrderId = 0;
                    pharmacyitem.OrderDetailId = 0;
                    pharmacyitem.OrderTypeId = 0;
                    pharmacyitem.OrderDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.ServiceRateCategoryId = 0;
                    pharmacyitem.ServiceRateCategoryName = '';
                    pharmacyitem.IsModified = 0;
                    pharmacyitem.IsSupplimentary = 0;
                    pharmacyitem.IsBillable = 0;
                    pharmacyitem.IsDoctorDiscount = 0;
                    pharmacyitem.IsGstDoctor = 0;
                    pharmacyitem.StartDateTime = null;
                    pharmacyitem.EndDateTime = null;
                    pharmacyitem.DiscountTypeId = 0;
                    pharmacyitem.DiscountModeId = 0;
                    pharmacyitem.DiscountAuthorizedBy = 0;
                    pharmacyitem.DoctorShare = 0;
                    pharmacyitem.ReferalShare = 0;
                    pharmacyitem.CNAmount = 0;
                    pharmacyitem.CancelReason = 0;
                    pharmacyitem.CancelledBy = 0;
                    pharmacyitem.ItemMasterId = pharmacyitem.ItemMasterId;
                    pharmacyitem.GenericName = pharmacyitem.GenericName;
                    pharmacyitem.ItemCode = pharmacyitem.ItemCode;
                    pharmacyitem.ItemName = pharmacyitem.ItemName;
                    pharmacyitem.ScheduleTypeId = pharmacyitem.ScheduleTypeId;
                    pharmacyitem.ScheduleTypeDescription = pharmacyitem.ScheduleTypeDescription;
                    pharmacyitem.StoreMasterId = $scope.item.StoreMasterId;
                    pharmacyitem.Comments = '';
                    pharmacyitem.DepartmentId = $scope.item.DepartmentId;

                    result.push(pharmacyitem);
                }
            }
            for (var idx in $scope.DeletedPatientBills) {
                var item = $scope.DeletedPatientBills[idx];
                if (item.Id > 0) {
                    result.push(item);
                }
            }
            return result;
        }
        $scope.getOtregisterCallback = function (scope, data, options, hasError) {
            $scope.item.PatientId = data.PatientId;
            $scope.item.EncounterId = data.EncounterId;
            $scope.item.OTRegisterId = data.Id;
            $scope.patientChange();
        };

        $scope.getOtregisterById = function () {
            var options = {
                action: 'OtManagement/OtRegister/GetOtRegisterById',
                data: { Id: $scope.currentcontext.otregisterid },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOtregisterById();

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.FacilityId = $scope.selectedPatient.FacilityId;

            if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                var encounter = $scope.selectedPatient.Encounters[0] || {};
                var encGuarantor = encounter.EncounterGuarantors.length > 0 ? encounter.EncounterGuarantors[0] : { GuarantorTypeId: -1 };
                $scope.item.GuarantorTypeId = encGuarantor.GuarantorTypeId;
            }

            $scope.fnencounter();
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [{
                    Key: 14,
                    Value: 1
                },
                {
                    Key: 4,
                    Value: $scope.item.PatientId
                }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVisitIndentifier
            };

            utl.Http.doAction(options);
        };

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            $scope.encounter = [];
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;
            } else {
                utl.Alert.showErrorMsg($translate.instant('common.billing.pharmacy.visitalert.lbl'));
            }
        };

        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Patient Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Ward Name', field: 'WardName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Room No.', field: 'RoomNo', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Bed No.', field: 'BedNo', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchencounter,
            formatdisplay: formatselectedencounter,
            postsearch: postsearchencounter
        };

        function formatselectedencounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {

                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.GuarantorTypeId = selectedItem.PatientGuarantor.GuarantorTypeId;
                $scope.item.GuarantorId = selectedItem.PatientGuarantor.GuarantorId;
                $scope.item.GuarantorName = selectedItem.PatientGuarantor.GuarantorName;
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DoctorName = selectedItem.DoctorName;
                $scope.item.DepartmentId = selectedItem.DepartmentId;

                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.LocationId = selectedItem.LocationId;
                $scope.item.WardId = selectedItem.WardId;
                $scope.item.RoomId = selectedItem.RoomId;

                result = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');

                $scope.item.PatientName = result;
            } else if (vm.patientcontrolconfig.rowdata) {
                result = [vm.patientcontrolconfig.rowdata.Patient.Title.Description, vm.patientcontrolconfig.rowdata.Patient.FirstName].join(' ');
            }
            $scope.patientChange();
            $scope.addNewLineItem();
            return result;
        }

        function presearchencounter() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 15, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 11, Value: query });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchencounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.PatientName = item.Patient.FirstName;
                item.WardName = item.WardMaster.WardName;
                item.RoomNo = item.WardRoomMaster.RoomNo;
                item.BedNo = item.WardRoomBedMaster.BedNo;
            }
        }

        vm.pharmacyitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Item Code',
                field: 'ItemCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Item Name',
                field: 'ItemName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Product Type Name',
                field: 'ProductTypeName',
                datatype: 'string',
                headercls: 'td-producttypename',
                fieldcls: 'td-producttypename'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
            },
            {
                header: 'Manufacturer Name',
                field: 'ManufacturerName',
                datatype: 'string',
                headercls: 'td-manufacturername',
                fieldcls: 'td-manufacturername'
            },
            {
                header: 'Stock-In-Hand',
                field: 'StockInHand',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemStoreMaps',
            formatdisplay: formatselectedpharmacyitem,
            presearch: presearchpharmacyitem,
            postsearch: postsearchpharmacyitem
        };

        function formatselectedpharmacyitem() {
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.pharmacyitemcontrolconfig.rowdata) {
                result = [vm.pharmacyitemcontrolconfig.rowdata.ItemCode, vm.pharmacyitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.StoreMasterId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.pharmacyitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                if (item.ItemMaster.StockItem !== null) {
                    item.StockInHand = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.StockInHand = 0;
                }
            }
        }

        function loadData() {
            $scope.applyVisibilityRules();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                    $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                }
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'DRUG') {
                            $scope.item.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'NONDRUG') {
                            $scope.item.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });

            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department"
            },
            {
                Key: 'Doctor',
                Request: {
                    Params: [{ Key: 5, Value: 2 }]

                }
            },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "Title"
            },
            {
                "Key": "Gender"
            },
            {
                "Key": "Ward"
            },
            {
                "Key": "Room"
            },
            {
                "Key": "UserStores",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId(),
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                },
                Default: false
            },
            { "Key": "ServiceCategory" }
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


    MaterialController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];
})();