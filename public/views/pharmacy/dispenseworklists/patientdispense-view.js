(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientDispenseViewController', PatientDispenseViewController);

    function PatientDispenseViewController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({ $scope: $scope }));


        $scope.SelectedIndex = -1;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.PatientDispenseInfo = [];
        $scope.PatientDispenseDetails = [];

        $scope.selectedPatient = {};
        $scope.itemUsedBatches = {};

        $scope.SaveImdDMPrint = 0;

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreTypeId: 0,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            DispenseTypeId: 3,
            DispenseStatusId: 0,
            PatientRequestStatusId: 0,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            TotalNetAmountBeforeGst: 0,
            TotalNetAmount: 0,
            DispensedValue: 0,
            Comments: null,
            isDisabled: false,
            DispenseNumber: null,
            PatientRequestNumber: null,
            PatientStockRequestId: 0,
            RequestedBy: 0,
            RequestedDate: null,
            DisplayDispenseStatus: null,
            ReadOnly: true,
            TitleId: 0,
            GenderId: 0,
            Age: 0,
            DrugServiceCategoryId: 0,
            DrugServiceGroupId: 0,
            NonDrugServiceCategoryId: 0,
            NonDrugServiceGroupId: 0
        };

        $scope.lookup = {};
        $scope.selectedPatient = {};

        $scope.currentrequest = {
            Id: -1,
            PatientRequestStatusId: -1
        };

        $scope.currentcontext = {
            id: -1,
            patientstockrequestid: -1,
            patientdispenseid: -1,
            storemasterid: -1,
        };

        // $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        // $scope.currentcontext.CanMD_DMPrint = utl.Privilege.hasPrivilege('CanMD_DMPrint');
        // $scope.currentcontext.CanMD_Dispense = utl.Privilege.hasPrivilege('CanMD_Dispense');
        // $scope.currentcontext.CanMD_PreviousOrder = utl.Privilege.hasPrivilege('CanMD_PreviousOrder');
        // $scope.currentcontext.CanHistory = utl.Privilege.hasPrivilege('CanHistory');



        $scope.previousOrders = function () {
            utl.Modal.open('app.patientpreviousorders', {
                params: {
                    patientdispenseid: $scope.currentcontext.patientdispenseid,
                    itemmasterid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.dispenseattachments', {
                params: { patientdispenseid: 0, itemmasterid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.patientdispenseid = $state.params.PatientDispenseId;
        $scope.currentcontext.storemasterid = $state.params.StoreMasterId;
        $scope.item.DispenseDateTime = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.patientdispenseDetails = [];

        $scope.canShowPrintBtn = true;
        $scope.canShowSaveBtn = true;
        $scope.canShowDispenseBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;
        $scope.canShowCompleteBtn = false;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.DispenseStatusId != 1 || $scope.item.DispenseStatusId != 2 || $scope.item.DispenseStatusId != 3 || $scope.item.DispenseStatusId != 4 || $scope.item.DispenseStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowTransferBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
            }
            // When In Draft Status
            if ($scope.item.DispenseStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowDispenseBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
            }
            // When In Approved Status
            if ($scope.item.DispenseStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.DispenseStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Completed Status
            if ($scope.item.DispenseStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.DispenseStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.DispenseStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowDispenseBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
        };

        $scope.addNewLineItem = function () {
            var patientdispenseDetail = {
                Id: 0,
                PatientStockRequestDetailId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUomId: 0,
                RequestedQuantity: 0,
                ReceivedQuantity: 0,
                DispensedQuantity: 0,
                TransitQuantity: 0,
                QuantityBeforeDispense: 0,
                TotalAvailableQuantity: 0,
                BatchQuantity: 0,
                BalanceRequestedQuantity: 0,
                PurchasePrice: 0,
                GstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                InGstId: 0,
                InGstPercentage: 0,
                InUnitGstAmount: 0,
                InGstAmount: 0,
                CGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                CGstId: 0,
                CGstPercentage: 0,
                CUnitGstAmount: 0,
                CGstAmount: 0,
                SGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                SGstId: 0,
                SGstPercentage: 0,
                SUnitGstAmount: 0,
                SGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                BatchDetails: [],
                BatchDetail: { Id: 0, StockItemId: 0, ItemMasterId: 0, StoreMasterId: 0, BatchId: '', Quantity: 0, ExpiryDate: null, Ucp: 0, Mrp: 0, Rev: 0, SerialDetails: null },
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                Ucp: 0,
                Mrp: 0,
                IsFullyDispensed: false,
                IsAlternateIssued: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                patientdispenseDetail.PatientDispenseId = $scope.currentcontext.id;
            }
            $scope.patientdispenseDetails.push(patientdispenseDetail);
        };

        $scope.Clear = function () {
            $scope.patientdispenseDetails = [];
            $scope.addNewLineItem();
        };
        $scope.patientrequestdetails = function (PatientRequestId) {
            utl.Modal.open('app.patientrequestprofile', {
                params: { prid: $scope.item.PatientStockRequestId },
                confirmCallback: $scope.getList
            });
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'Billing/PatientDispense/PrintPatientDispense',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        /* PatientDispense dotmatrix print starts */



        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));
                return false;
            } else {
                var dmPrintInput = preparePrintData();
                $scope.printPatientDispenseView(dmPrintInput);
                if ($scope.FindOldBillFlag != 1)
                $scope.Clear();

            }
        };

        function preparePrintData() {
            console.log('preparePrintData starts');
            var currentBill = $scope.PatientDispenseInfo[0];
            var vIPOPNO = '';
            var vGST = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vTinNo = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vFDOB = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';

            if (currentBill.Encounter) vIPOPNO = '' + currentBill.Encounter.VisitIdentifier;
            if (currentBill.Facility) vGST = '' + currentBill.Facility.GstNumber;

            if (currentBill.Doctor) {
                if (currentBill.Doctor.Title) vUTitle = currentBill.Doctor.Title.Description;
                if (currentBill.Doctor.FirstName) vUFirstName = currentBill.Doctor.FirstName;
                if (currentBill.Doctor.LastName) vULastName = currentBill.Doctor.LastName;
            }
            if (currentBill.ApprovedUser) {
                if (currentBill.ApprovedUser.Title) vCTitle = currentBill.ApprovedUser.Title.Description;
                if (currentBill.ApprovedUser.FirstName) vCFirstName = currentBill.ApprovedUser.FirstName;
                if (currentBill.ApprovedUser.LastName) vCLastName = currentBill.ApprovedUser.LastName;
            }
            if (currentBill.Patient) {
                if (currentBill.Patient.Title) vPTitle = currentBill.Patient.Title.Description;
                if (currentBill.Patient.FirstName) vPFirstName = currentBill.Patient.FirstName;
                if (currentBill.Patient.LastName) vPLastName = currentBill.Patient.LastName;
                if (currentBill.Patient.MRN) vMRN = currentBill.Patient.MRN;
                if (currentBill.Patient.Age) vAge = '' + currentBill.Patient.Age;
                if (currentBill.Patient.DOB) vDOB = '' + currentBill.Patient.DOB;
                if (currentBill.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(currentBill.Patient.DOB);
                if (currentBill.Patient.Gender) vGender = '' + currentBill.Patient.Gender.Description;
            } else {
                vPFirstName = currentBill.PatientName;
            }

            if (currentBill.DispenseStore) vTinNo = currentBill.DispenseStore.TinNo;

            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: (vUTitle + '.' +
                    vUFirstName + ' ' + vULastName) || '',
                licenseno: '' + currentBill.DispenseStore.LicenseNo,
                billno: '' + currentBill.DispenseNumber,
                patientname: vPTitle + '.' +
                    vPFirstName + ' ' + vPLastName,
                GstNo: vGST,
                TinNo: vTinNo,
                MRN: vMRN,
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                billdate: utl.Formatter.getDateTimeString(currentBill.DispenseDateTime),
                totalamount: currentBill.TotalGrossAmount,
                totDiscont: currentBill.DiscountAmount,
                billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName
            };

            dmPrintInput.lines = [];
            var islno = 1;
            for (var idx in currentBill.PatientDispenseDetails) {
                var billDetail = currentBill.PatientDispenseDetails[idx];
                var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                var manu = billDetail.ManufacturerName;
                if (manu && manu.length > 3) {
                    manu = manu.substring(0, 3);
                }

                var batchid = billDetail.BatchId;
                if (batchid && batchid.length > 4) {
                    batchid = batchid.substring(0, 4);
                }

                var cgstamt = billDetail.CGstAmount.toFixed(2);
                var sgstamt = billDetail.SGstAmount.toFixed(2);

                var vHSN = '';
                if (billDetail.ItemMaster)
                    if (billDetail.ItemMaster.ProductRegNo)
                        vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                var vSCH = '';
                if (billDetail.ScheduleTypeDescription)
                    vSCH = billDetail.ScheduleTypeDescription;

                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    desc: billDetail.ItemName,
                    hsn: vHSN,
                    sch: vSCH,
                    batch: batchid,
                    exp: expiryDate,
                    qty: billDetail.DispensedQuantity,
                    mrp: billDetail.Mrp.toFixed(2),
                    value: billDetail.NetAmountBeforeGST,
                    cgstper: billDetail.CGstPercentage,
                    cgstamt: cgstamt,
                    sgstper: billDetail.SGstPercentage,
                    sgstamt: sgstamt,
                    totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                    amount: billDetail.Amount.toFixed(2),
                    mfr: manu,
                    netamount: billDetail.NetAmount.toFixed(2)
                };

                dmPrintInput.lines.push(detail);
            }

            console.log('preparePrintData ends');
            return dmPrintInput;
        }


        /* PatientDispense dotmatrix print ends */

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.dispensehistory', {});
        };

        $scope.History = function (item, idx) {
            utl.Modal.open('app.patientdispensehistory', {
                params: {
                    storemasterid: $scope.item.StoreMasterId,
                    itemmasterid: item.ItemMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.Stock = function (selectedItem, idx) {
            utl.Modal.open('app.stockdetails', {
                params: { itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.getPatientDispenseDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientDispenseDetails = res.Data || [];
            for (var idx in $scope.PatientDispenseDetails) {
                var dispenseitem = $scope.PatientDispenseDetails[idx];
                if (dispenseitem.ItemMasterId > 0) {
                    var DispenseBatchDetail = {
                        Id: 0,
                        StockItemId: 0,
                        ItemMasterId: 0,
                        StoreMasterId: 0,
                        BatchId: '',
                        Quantity: 0,
                        ExpiryDate: null,
                        Ucp: 0,
                        Mrp: 0,
                        GstId: 0,
                        GstPercentage: 0,
                        InGstId: 0,
                        InGstPercentage: 0,
                        CGstId: 0,
                        CGstPercentage: 0,
                        SGstId: 0,
                        SGstPercentage: 0,
                        SerialDetails: null
                    };
                    dispenseitem.BatchDetails = [];
                    DispenseBatchDetail.BatchId = dispenseitem.BatchId;
                    dispenseitem.BatchDetails.push(DispenseBatchDetail);
                    dispenseitem.MrPrice = dispenseitem.Mrp;
                    dispenseitem.ServedQuantity = dispenseitem.PatientStockRequestDetail.DispensedQuantity;
                }
            }
            // calculatetotalAmount();
        };

        $scope.getPatientDispenseDetails = function (pageNo) {
            if ($scope.currentcontext.patientdispenseid && $scope.currentcontext.patientdispenseid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.patientdispenseid }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'billing/patientdispensedetails/GetPatientDispenseDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientDispenseDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };
        
        $scope.getPatientDispenseInfoById = function () {
            var SearchDispenseId = $scope.currentcontext.patientdispenseid;
            if (SearchDispenseId && SearchDispenseId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchDispenseId },
                        { Key: 6, Value: $scope.currentcontext.storemasterid }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Billing/PatientDispense/GetPatientDispenses',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDispenseInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.Clear();
            }
        };

        $scope.getDispenseInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientDispenseInfo = res.Data || [];
            if ($scope.PatientDispenseInfo && $scope.PatientDispenseInfo.length > 0) {
                $scope.PatientDispenseInfo.forEach(patientdispense => {
                    if (patientdispense.Patient) {
                        $scope.selectedPatient = patientdispense.Patient;
                        $scope.item.TitleId = patientdispense.Patient.TitleId;
                        $scope.item.GenderId = patientdispense.Patient.GenderId;
                        $scope.item.Age = patientdispense.Patient.Age;
                    }
                    $scope.item.DispenseStatusId = patientdispense.DispenseStatusId;
                    if (patientdispense.DispenseStatusId == 1) {
                        $scope.item.ReadOnly = true;
                        $scope.item.isDisabled = false;
                        $scope.item.DisplayDispenseStatus = 'Draft';
                    } else if (patientdispense.DispenseStatusId == 2) {
                        $scope.item.ReadOnly = true;
                        $scope.item.isDisabled = true;
                        $scope.item.DisplayDispenseStatus = 'Dispensed';
                    } else if (patientdispense.DispenseStatusId == 3) {
                        $scope.item.ReadOnly = true;
                        $scope.item.isDisabled = true;
                        $scope.item.DisplayDispenseStatus = 'Cancelled';
                    }

                    $scope.item.PatientStockRequestId = patientdispense.PatientStockRequestId;
                    $scope.item.PatientRequestNumber = patientdispense.PatientRequestNumber;
                    $scope.item.DispenseNumber = patientdispense.DispenseNumber;
                    $scope.item.DispenseDateTime = patientdispense.DispenseDateTime;
                    $scope.item.DispensedBy = patientdispense.DispensedBy;
                    $scope.item.DispenseTypeId = patientdispense.DispenseTypeId;
                    $scope.item.DispensePriorityId = patientdispense.DispensePriorityId;
                    $scope.item.ApprovedDateTime = patientdispense.ApprovedDateTime;
                    $scope.item.ApprovedBy = patientdispense.ApprovedBy;

                    $scope.item.OrganizationId = patientdispense.OrganizationId;
                    $scope.item.FacilityId = patientdispense.FacilityId;
                    $scope.item.DepartmentId = patientdispense.DepartmentId;
                    $scope.item.StoreMasterId = patientdispense.StoreMasterId;
                    $scope.item.PatientId = patientdispense.PatientId;
                    $scope.item.PatientMRN = patientdispense.PatientMRN;
                    $scope.item.PatientName = patientdispense.PatientName;
                    $scope.item.PatientTypeId = patientdispense.PatientTypeId;
                    $scope.item.EncounterId = patientdispense.EncounterId;
                    $scope.item.EncounterTypeId = patientdispense.EncounterTypeId;
                    $scope.item.LocationId = patientdispense.LocationId;
                    $scope.item.WardId = patientdispense.WardId;
                    $scope.item.WardName = '';
                    if (patientdispense.WardMaster) {
                        $scope.item.WardName = patientdispense.WardMaster.WardName;
                    }
                    $scope.item.RoomId = patientdispense.RoomId;
                    $scope.item.RoomName = '';
                    if (patientdispense.WardRoomMaster) {
                        $scope.item.RoomName = patientdispense.WardRoomMaster.RoomNo;
                    }
                    $scope.item.WardRoom = $scope.item.WardName + ' / ' + $scope.item.RoomName;
                    $scope.item.BedId = patientdispense.BedId;
                    $scope.item.GuarantorId = patientdispense.GuarantorId;
                    $scope.item.GuarantorTypeId = patientdispense.GuarantorTypeId;
                    $scope.item.GuarantorName = patientdispense.GuarantorName;
                    $scope.item.DoctorId = patientdispense.DoctorId;
                    $scope.item.DoctorName = patientdispense.DoctorName;
                    $scope.item.ReferralId = patientdispense.ReferralId;
                    $scope.item.ReferralName = patientdispense.ReferralName;
                    $scope.item.RemarkId = patientdispense.RemarkId;
                    $scope.item.Comments = patientdispense.Comments;

                    $scope.item.DispensedValue = patientdispense.DispensedValue;
                    $scope.item.TotalGrossAmount = patientdispense.TotalGrossAmount;
                    $scope.item.DiscountModeId = patientdispense.DiscountModeId;
                    $scope.item.DiscountValue = patientdispense.DiscountValue;
                    $scope.item.DiscountAmount = patientdispense.DiscountAmount;
                    $scope.item.TotalGstAmount = patientdispense.TotalGstAmount;
                    $scope.item.TotalInGstAmount = patientdispense.TotalInGstAmount;
                    $scope.item.TotalCGstAmount = patientdispense.TotalCGstAmount;
                    $scope.item.TotalSGstAmount = patientdispense.TotalSGstAmount;
                    $scope.item.TotalNetAmountBeforeGst = patientdispense.TotalNetAmountBeforeGst;
                    $scope.item.TotalNetAmount = patientdispense.TotalNetAmount;
                    $scope.item.DispensedValue = patientdispense.DispensedValue;

                    $scope.patientdispenseDetails = patientdispense.PatientDispenseDetails || [];
                    for (var idx in $scope.patientdispenseDetails) {
                        var dispenseitem = $scope.patientdispenseDetails[idx];
                        if (dispenseitem.ItemMasterId > 0) {
                            dispenseitem.TotalAvailableQuantity = 0;
                            dispenseitem.ReceivedQuantity = dispenseitem.DispensedQuantity;
                            dispenseitem.UnitCostPrice = dispenseitem.Ucp;
                            dispenseitem.MrPrice = dispenseitem.Mrp;
                            if (dispenseitem.ItemMaster) {
                                if (dispenseitem.ItemMaster.StockItem !== null) {
                                    dispenseitem.TotalAvailableQuantity = dispenseitem.ItemMaster.StockItem.Quantity;
                                }
                                if ($scope.item.DispenseStatusId == 2) {
                                    dispenseitem.IsFullyDispensed = true;
                                }
                            }
                        }
                    }

                    // calculatetotalAmount();
                    $scope.applyVisibilityRules();
                });
            }
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.computeAmount = function (item) {
            if (item.DispensedQuantity === null) {
                item.Quantity = 0;
                item.Amount = 0;
                item.GrossAmount = 0;
                item.GSTAmount = 0;
                item.GstAmount = 0;
                item.InGstAmount = 0;
                item.CGstAmount = 0;
                item.SGstAmount = 0;
                item.NetAmount = 0;
                item.NetAmountBeforeGST = 0;
                item.NetAmountBeforeGst = 0;
                utl.Alert.showErrorMsg('Qty Should not be Empty.!');
                return false;
            } else if (item.DispensedQuantity === 0) {
                item.Quantity = 0;
                item.Amount = 0;
                item.GrossAmount = 0;
                item.GSTAmount = 0;
                item.GstAmount = 0;
                item.InGstAmount = 0;
                item.CGstAmount = 0;
                item.SGstAmount = 0;
                item.NetAmount = 0;
                item.NetAmountBeforeGST = 0;
                item.NetAmountBeforeGst = 0;
            } else {
                if (item.DispensedQuantity > item.QuantityBeforeDispense) {
                    item.DispensedQuantity = 0;
                    item.Quantity = 0;
                    item.Amount = 0;
                    item.GrossAmount = 0;
                    item.GSTAmount = 0;
                    item.GstAmount = 0;
                    item.InGstAmount = 0;
                    item.CGstAmount = 0;
                    item.SGstAmount = 0;
                    item.NetAmount = 0;
                    item.NetAmountBeforeGST = 0;
                    item.NetAmountBeforeGst = 0;
                    utl.Alert.showErrorMsg('Entered Qty is Greater Than Available Qty.!');
                    return false;
                } else {
                    item.GrossAmount = item.MrPrice * item.DispensedQuantity;
                    item.NetAmount = item.MrPrice * item.DispensedQuantity;
                    item.Quantity = item.DispensedQuantity;
                    item.TransitQuantity = item.DispensedQuantity;

                    item.Amount = parseFloat((item.MrPrice * item.DispensedQuantity).toFixed(2));
                    item.GrossAmount = parseFloat((item.MrPrice * item.DispensedQuantity).toFixed(2));
                    item.GSTAmount = parseFloat((item.UnitGstAmount * item.DispensedQuantity).toFixed(2));
                    item.GstAmount = parseFloat((item.UnitGstAmount * item.DispensedQuantity).toFixed(2));
                    item.InGstAmount = parseFloat((item.UnitInGstAmount * item.DispensedQuantity).toFixed(2));
                    item.CGstAmount = parseFloat((item.UnitCGstAmount * item.DispensedQuantity).toFixed(2));
                    item.SGstAmount = parseFloat((item.UnitSGstAmount * item.DispensedQuantity).toFixed(2));
                    item.NetAmount = parseFloat((item.MrPrice * item.DispensedQuantity).toFixed(2));
                    item.NetAmountBeforeGST = parseFloat((item.NetAmount - item.GstAmount).toFixed(2));
                    item.NetAmountBeforeGst = parseFloat((item.NetAmount - item.GstAmount).toFixed(2));
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.TotalNetAmount = 0;
            $scope.DispensedValue = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.patientdispenseDetails) {
                var activeitem = $scope.patientdispenseDetails[idx];
                if (activeitem.ItemMasterId > 0 && activeitem.DispensedQuantity > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeitem.GrossAmount).toFixed(4));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + activeitem.GstAmount).toFixed(4));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + activeitem.InGstAmount).toFixed(4));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + activeitem.CGstAmount).toFixed(4));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + activeitem.SGstAmount).toFixed(4));
                    $scope.TotalNetAmountBeforeGst = parseFloat(($scope.TotalNetAmountBeforeGst + activeitem.NetAmountBeforeGst).toFixed(4));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + activeitem.NetAmount).toFixed(4));
                    $scope.DispensedValue = parseFloat(($scope.DispensedValue + activeitem.NetAmount).toFixed(4));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmountBeforeGst = $scope.TotalNetAmountBeforeGst;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.DispensedValue = $scope.DispensedValue;
        }

        $scope.backToList = function () {
            $state.go('app.dispenseworklisttab.patientdispenses', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientDispenseInfoById();
                $scope.getPatientDispenseDetails();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
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
        };

        $scope.getPharmacyPrintPreference = function () {
            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('dmprint', 'pharmacydmprintenable');

            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('print', 'laserprintenable');

            if ($scope.dmprintpreferences)
                if ($scope.dmprintpreferences <= 0)
                    $('#btndmprint').hide();


            if ($scope.printpreferences)
                if ($scope.printpreferences <= 0)
                    $('#btnprint').hide();
        };

        $scope.getPharmacyPrintPreference();

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "DispenseType" },
                { "Key": "DispenseStatus" },
                { "Key": "ServiceCategory" },
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
            ];

            $scope.getLookUp(inputData);
            loadData();
        };

        $scope.getLookUp = function (inputData) {
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

    PatientDispenseViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();