(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientDispenseFormController', PatientDispenseFormController);

    function PatientDispenseFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreTypeId: 0,
            StoreSubTypeId: 0,
            SequenceOptionId: 0,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            DispenseTypeId: 1,
            DispenseStatusId: 0,
            PatientRequestStatusId: 0,
            PatientStockRequestRev: 0,
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
            PrescriptionId: 0,
            RequestedBy: 0,
            RequestedDate: null,
            DisplayDispenseStatus: null,
            ReadOnly: true,
            PatientName: '',
            TitleId: 0,
            GenderId: 0,
            Age: 0,
            OTRoomId: 0,
            OTRegisterId: 0,
            ProcedureId: 0,
            OTIdentifier: null
        };

        $scope.lookup = {};
        $scope.selectedPatient = {};
        $scope.selectedEncounter = {
            Description: ''
        };

        $scope.currentrequest = {
            Id: -1,
            PatientRequestStatusId: -1
        };

        $scope.currentcontext = {
            id: -1,
            patientstockrequestid: -1,
            patientdispenseid: -1,
            storemasterid: -1,
            guarantorid: -1
        };
        $scope.currentcontext.isAutoBillLock = 0;
        $scope.currentcontext.isAutoBillLock = utl.FacilitySetting.getFacilitySettingValue('billing', 'isautobilllock');

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        /*
        $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove');
        $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        $scope.currentcontext.CanAttachment = utl.Privilege.hasPrivilege('CanAttachment');
        $scope.currentcontext.CanDelete = utl.Privilege.hasPrivilege('CanDelete');
        $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew');
        $scope.currentcontext.CanSWTransfer = utl.Privilege.hasPrivilege('CanSWTransfer');
        $scope.currentcontext.CanComplete = utl.Privilege.hasPrivilege('CanComplete');
        $scope.currentcontext.CanHistory = utl.Privilege.hasPrivilege('CanHistory');
        $scope.currentcontext.CanSWDMPrint = utl.Privilege.hasPrivilege('CanSWDMPrint');
        */

        $scope.openAttachments = function () {
            utl.Modal.openFixedDialog('app.dispenseattachments', {
                params: {
                    patientdispenseid: 0,
                    itemmasterid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.patientstockrequestid = $state.params.PatientStockRequestId;
        $scope.currentcontext.patientdispenseid = $state.params.PatientDispenseId;
        $scope.currentcontext.storemasterid = $state.params.StoreMasterId;
        $scope.currentcontext.guarantorid = $state.params.GuarantorId;
        $scope.currentcontext.issurgery = $state.params.issurgery;
        $scope.item.DispenseDateTime = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.patientdispenseDetails = [];
        $scope.DeletedpatientdispenseDetails = [];

        $scope.canShowPrintBtn = false;
        $scope.canShowCompleteBtn = false;
        $scope.canShowDispenseBtn = false;
        $scope.canShowRejectBtn = false;

        $scope.DrugServiceCategoryId = 0;
        $scope.DrugServiceGroupId = 0;
        $scope.NonDrugServiceCategoryId = 0;
        $scope.NonDrugServiceGroupId = 0;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.DispenseStatusId != 1 || $scope.item.DispenseStatusId != 2 || $scope.item.DispenseStatusId != 3 || $scope.item.DispenseStatusId != 4 || $scope.item.DispenseStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowDispenseBtn = true;
                $scope.canShowRejectBtn = true;
                $scope.canShowPrintBtn = false;
                $scope.canShowdmPrintBtn = false;

            }
            // When In Draft Status
            if ($scope.item.DispenseStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowDispenseBtn = true;
                $scope.canShowRejectBtn = true;
                $scope.canShowPrintBtn = false;
                $scope.canShowdmPrintBtn = false;
                $scope.canShowPrintBtn = true;
                $scope.canShowdmPrintBtn = true;
            }
            // When In Dispensed Status
            if ($scope.item.DispenseStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDispenseBtn = false;
                $scope.canShowRejectBtn = false;
                $scope.canShowPrintBtn = true;
                $scope.canShowdmPrintBtn = true;
            }
            // When In Accepted Status
            if ($scope.item.DispenseStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDispenseBtn = false;
                $scope.canShowRejectBtn = false;
            }
            // When In Rejected Status
            if ($scope.item.DispenseStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDispenseBtn = false;
                $scope.canShowRejectBtn = false;
            }

            if ($scope.item.AdmissionStatusId == 5 || $scope.item.AdmissionStatusId == 6 || $scope.item.AdmissionStatusId == 7) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDispenseBtn = false;
                $scope.canShowRejectBtn = false;
            }
        };

        $scope.addNewLineItem = function () {
            var patientdispenseDetail = {
                Id: 0,
                ReqItemMasterId: 0,
                PatientStockRequestDetailId: 0,
                PrescriptionDetailId: 0,
                SubCategoryId: 0,
                ServiceTypeId: 0,
                ServiceGroupId: 0,
                ServiceCategoryId: 0,
                MasterName: '',
                MasterItemId: 0,
                DrugName: '',
                DrugId: 0,
                MasterTypeId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                BaseUomId: 0,
                PurchaseUomId: 0,
                MinQuantity: 0,
                MaxQuantity: 0,
                RequestedQuantity: 0,
                ReceivedQuantity: 0,
                DispensedQuantity: 0,
                TransitQuantity: 0,
                QuantityBeforeDispense: 0,
                TotalAvailableQuantity: 0,
                BatchQuantity: 0,
                BalanceRequestedQuantity: 0,
                PurchasePrice: 0,
                GstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                InGstId: 0,
                InGstPercentage: 0,
                InUnitGstAmount: 0,
                InGstAmount: 0,
                CGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                CGstId: 0,
                CGstPercentage: 0,
                CUnitGstAmount: 0,
                CGstAmount: 0,
                SGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                SGstId: 0,
                SGstPercentage: 0,
                SUnitGstAmount: 0,
                SGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                PatientStockRequestDetailRev: 0,
                Status: 1,
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    ItemMasterId: 0,
                    StoreMasterId: 0,
                    BatchId: '',
                    Quantity: 0,
                    ExpiryDate: null,
                    Ucp: 0,
                    Mrp: 0,
                    Rev: 0,
                    SerialDetails: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false
                },
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                Batch: false,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: null,
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                Ucp: 0,
                Mrp: 0,
                IsPharmacyCredit: 1,
                IsFullyDispensed: false,
                IsFallUnderMinQty: false,
                IsSupplementary: false,
                IsAlternateIssued: false,
                SNo: 0,
                CanOpenAlternates: false,
                CanViewStock: false,
                CanDelete: true,
                tabindex: $scope.tabindexmap.detailtabindex++,
                IsNonClaimable: false
            };

            if ($scope.currentcontext.id > 0) {
                patientdispenseDetail.PatientDispenseId = $scope.currentcontext.id;
            }
            $scope.patientdispenseDetails.push(patientdispenseDetail);
            $scope.setIndexforTableIndex();
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.patientdispenseDetails) {
                if ($scope.patientdispenseDetails[idx].Status == 1) {
                    $scope.patientdispenseDetails[idx].SNo = SNo;
                    //$scope.patientdispenseDetail[idx].itemidxdesc = 'desc' + (SNo - 1);
                    //$scope.patientdispenseDetail[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.Clear = function () {
            $scope.patientdispenseDetails = [];
            $scope.addNewLineItem();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.patientdispenseid
            };
            var options = {
                action: 'Billing/PatientDispense/PrintPatientDispense',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));

                return false;
            } else {
                var dmPrintInput = preparePrintData();
                $scope.printPatientDispense(dmPrintInput);
                if ($scope.FindOldBillFlag != 1)
                    $scope.clear();
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


        $scope.history = function (HistoryId) {
            utl.Modal.openFixedDialog('app.dispensehistory', {});
        };

        $scope.history = function (HistoryId) {
            utl.Modal.openFixedDialog('app.dispensehistory', {
                params: {
                    hid: $scope.item.PatientStockRequestId
                }
            });
        };

        $scope.History = function (item, idx) {
            utl.Modal.openFixedDialog('app.patientdispensehistory', {
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
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.openFixedDialog('app.patientrequestdetails', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    },
                })
            }

        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.editPatientDispenseDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.openFixedDialog('app.patientdispensedetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.patientdispenseDetails) {
                var item = $scope.patientdispenseDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.PatientDispenseId = $scope.currentcontext.id;
                }
                $scope.patientdispenseDetails.push(itemFromModal);
            }
        };

        $scope.getPatientDispenseInfoById = function () {
            var SearchDispenseId = $scope.currentcontext.patientdispenseid;
            if (SearchDispenseId && SearchDispenseId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchDispenseId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.storemasterid
                    }
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
                $scope.clear();
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
                        $scope.item.Age = patientdispense.Patient.Age || 0;
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
                            dispenseitem.ExpiryProceed = true;
                            /*
                            var ExpiryDays = GetExpiryDays(sdispenseitem.ExpiryDate);
                            if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                patientdispenseDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                patientdispenseDetail.ExpiryAlert = true;
                            } else {
                                patientdispenseDetail.ExpiryProceed = true;
                            }

                            if (patientdispenseDetail.ExpiryAlert) {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryAlert = true;
                                patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                            } else if (patientdispenseDetail.ExpiryStop) {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryStop = true;
                                patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                            } else {
                                patientdispenseDetail.ExpiryDate = null;
                                patientdispenseDetail.ExpiryProceed = true;
                                patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                            }
                            */
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

                    $scope.applyVisibilityRules();
                    /* $scope.patientdispenseDetails.sort($scope.custom_sort); */
                    $scope.setIndexforTableIndex();
                });
            }
        };

        $scope.previousOrders = function () {
            utl.Modal.openFixedDialog('app.patientpreviousorders', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: $scope.item.EncounterId,
                    patientdispenseid: $scope.currentcontext.patientstockrequestid,
                    itemmasterid: 0
                },
                // confirmCallback: $scope.initLookup,
                // cancelCallback: $scope.initLookup
            });
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.openFixedDialog('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.patientrequestdetails = function (PatientRequestId) {
            utl.Modal.openFixedDialog('app.patientrequestprofile', {
                params: {
                    prid: $scope.item.PatientStockRequestId
                },
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
            calculatetotalAmount();
        };

        $scope.getPatientDispenseDetails = function (pageNo) {
            if ($scope.currentcontext.patientdispenseid && $scope.currentcontext.patientdispenseid > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.patientdispenseid
                    }],
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


        $scope.getPatientRequestInfoById = function () {
            var SearchRequestId = $scope.currentcontext.id;
            var TodayDate = new Date().toISOString().slice(0, 10);
            if (SearchRequestId && SearchRequestId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchRequestId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentcontext.storemasterid
                    },
                    {
                        Key: 19,
                        Value: $scope.currentcontext.guarantorid
                    }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getRequestInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getRequestInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientRequestInfo = res.Data || [];
            if ($scope.PatientRequestInfo && $scope.PatientRequestInfo.length > 0) {
                $scope.PatientRequestInfo.forEach(patientrequest => {
                    if (patientrequest.Patient) {
                        $scope.selectedPatient = patientrequest.Patient;
                        $scope.item.TitleId = patientrequest.Patient.TitleId;
                        $scope.item.GenderId = patientrequest.Patient.GenderId;
                        $scope.item.Age = patientrequest.Patient.Age || 0;
                    }
                    if (patientrequest.Encounter) {
                        $scope.selectedEncounter = patientrequest.Encounter;
                        $scope.item.AdmissionStatusId = patientrequest.Encounter.AdmissionStatusId;
                        $scope.item.IsBillLock = patientrequest.Encounter.IsBillLock;
                        $scope.item.OTRegisterId = patientrequest.OTRegisterId;
                        if (patientrequest.Encounter.AdmissionStatusId == 2) {
                            $scope.selectedEncounter.Description = 'On Admission';
                        } else if (patientrequest.Encounter.AdmissionStatusId == 3) {
                            $scope.selectedEncounter.Description = 'Fit For Discharge';
                        } else if (patientrequest.Encounter.AdmissionStatusId == 4) {
                            $scope.selectedEncounter.Description = 'Clinically Discharged';
                        } else if (patientrequest.Encounter.AdmissionStatusId == 5) {
                            $scope.selectedEncounter.Description = 'Financially Discharged';
                        } else if (patientrequest.Encounter.AdmissionStatusId == 6) {
                            $scope.selectedEncounter.Description = 'Physically Discharged';
                        }

                        if (patientrequest.GuarantorTypeId == 0) {
                            if (patientrequest.Encounter.Guarantor)
                                patientrequest.GuarantorTypeId = patientrequest.Encounter.Guarantor.GuarantorTypeId;
                        }
                    }
                    if (patientrequest.PatientRequestStatusId == 4) {
                        $scope.canShowCompleteBtn = true;
                    }
                    $scope.item.PatientStockRequestId = patientrequest.Id;
                    $scope.item.PatientStockRequestRev = patientrequest.Rev;
                    $scope.item.PrescriptionId = patientrequest.PrescriptionId;
                    $scope.item.PatientRequestNumber = patientrequest.PatientRequestNumber;
                    $scope.item.StoreMasterId = patientrequest.ToStoreId;
                    $scope.item.StoreName = '';
                    $scope.item.PatientId = patientrequest.PatientId;
                    $scope.item.PatientTypeId = patientrequest.PatientTypeId;
                    $scope.item.PatientMRN = patientrequest.PatientMRN;
                    $scope.item.PatientName = patientrequest.PatientName;
                    $scope.item.EncounterId = patientrequest.EncounterId;
                    $scope.item.EncounterTypeId = patientrequest.EncounterTypeId;
                    $scope.item.DoctorId = patientrequest.DoctorId;
                    $scope.item.DoctorName = patientrequest.DoctorName;
                    $scope.item.ReferralId = patientrequest.ReferralId;
                    $scope.item.ReferralName = patientrequest.ReferralName;
                    $scope.item.DepartmentId = patientrequest.DepartmentId;
                    $scope.item.GuarantorId = patientrequest.GuarantorId;
                    $scope.item.GuarantorTypeId = patientrequest.GuarantorTypeId;
                    $scope.item.GuarantorName = patientrequest.GuarantorName;
                    $scope.item.LocationId = patientrequest.LocationId;
                    $scope.item.WardId = patientrequest.WardId;
                    if (patientrequest.Encounter) {
                        $scope.item.CoPayPercent = patientrequest.Encounter.Guarantor.CoPayPercent;
                    }
                    $scope.item.WardName = '';
                    if (patientrequest.WardMaster) {
                        $scope.item.WardName = patientrequest.WardMaster.WardName;
                    }
                    $scope.item.RoomId = patientrequest.RoomId;
                    $scope.item.RoomName = '';
                    if (patientrequest.WardRoomMaster) {
                        $scope.item.RoomName = patientrequest.WardRoomMaster.RoomNo;
                    }
                    $scope.item.WardRoom = $scope.item.WardName + ' / ' + $scope.item.RoomName;
                    $scope.item.BedId = patientrequest.BedId;
                    $scope.item.ToStoreId = patientrequest.ToStoreId;
                    if (patientrequest.ToStore) {
                        $scope.item.StoreTypeId = patientrequest.ToStore.StoreTypeId;
                        $scope.item.StoreSubTypeId = patientrequest.ToStore.StoreSubTypeId;
                        $scope.item.SequenceOptionId = patientrequest.ToStore.SequenceOptionId;
                    }
                    $scope.item.FacilityId = patientrequest.FacilityId;

                    $scope.item.TotalGrossAmount = 0;
                    $scope.item.TotalGstAmount = 0;
                    $scope.item.TotalInGstAmount = 0;
                    $scope.item.TotalCGstAmount = 0;
                    $scope.item.TotalSGstAmount = 0;
                    $scope.item.TotalNetAmountBeforeGst = 0;
                    $scope.item.TotalNetAmount = 0;
                    $scope.item.DispensedValue = 0;

                    $scope.item.RequestedBy = patientrequest.RequestedBy;
                    $scope.item.RequestedDate = patientrequest.RequestedDate;
                    $scope.item.ApprovedBy = patientrequest.ApprovedBy;
                    $scope.item.ApprovedDate = patientrequest.ApprovedDate;
                    $scope.item.AuthorizedBy = patientrequest.AuthorizedBy;
                    $scope.item.AuthorizedDate = patientrequest.AuthorizedDate;

                    $scope.patientstockrequestDetails = patientrequest.PatientStockRequestDetails || [];
                    var patientdispenseDetail = {};
                    var ExpiryDays = null;
                    for (var psridx in $scope.patientstockrequestDetails) {
                        var ReqQty = 0;
                        var psritem = $scope.patientstockrequestDetails[psridx];
                        if (psritem.ItemMasterId > 0) {
                            if (psritem.ItemMaster.SubCategoryId == 1) {
                                psritem.SubCategoryId = 1;
                                psritem.ServiceTypeId = 0;
                                psritem.ServiceGroupId = $scope.DrugServiceGroupId;
                                psritem.ServiceCategoryId = $scope.DrugServiceCategoryId;
                                psritem.MasterName = psritem.ItemMaster.DrugName;
                                psritem.MasterItemId = psritem.ItemMaster.DrugId;
                                psritem.DrugName = psritem.ItemMaster.DrugName;
                                psritem.DrugId = psritem.ItemMaster.DrugId;
                                psritem.MasterTypeId = psritem.ItemMaster.SubCategoryId;
                            } else if (psritem.ItemMaster.SubCategoryId == 2) {
                                psritem.SubCategoryId = 2;
                                psritem.ServiceTypeId = 0;
                                psritem.ServiceGroupId = $scope.NonDrugServiceGroupId;
                                psritem.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                                psritem.MasterName = psritem.ItemMaster.DrugName;
                                psritem.MasterItemId = psritem.ItemMaster.DrugId;
                                psritem.DrugName = psritem.ItemMaster.DrugName;
                                psritem.DrugId = psritem.ItemMaster.DrugId;
                                psritem.MasterTypeId = psritem.ItemMaster.SubCategoryId;
                            } else {
                                psritem.SubCategoryId = 0;
                                psritem.ServiceTypeId = 0;
                                psritem.ServiceGroupId = 0;
                                psritem.ServiceCategoryId = 0;
                                psritem.MasterName = '';
                                psritem.MasterItemId = 0;
                                psritem.DrugName = 0;
                                psritem.DrugId = 0;
                                psritem.MasterTypeId = 0;
                            }
                            if (psritem.ItemMaster.ScheduleType) {
                                psritem.ScheduleTypeDescription = psritem.ItemMaster.ScheduleType.Description;
                            }
                            if (psritem.ItemMaster.Supplementary && psritem.ItemMaster.Supplementary.length > 0) {
                                psritem.IsSupplementary = true;
                            }
                            ReqQty = psritem.RequestedQuantity - psritem.DispensedQuantity;
                            psritem.BalanceRequestedQuantity = ReqQty;
                            // if (psritem.ItemMaster.StockItem !== null) {
                            var stockserialitems = null;
                            if (psritem.ItemMaster.StockItem && psritem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                                if (psritem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                                    stockserialitems = psritem.ItemMaster.StockItem.StockSerialItems;
                                    stockserialitems.sort($scope.custom_multi_sort);
                                    if (stockserialitems.length > 0) {
                                        for (var batid = 0; batid < stockserialitems.length; batid++) {
                                            psritem.TotalAvailableQuantity = psritem.ItemMaster.StockItem.Quantity;
                                            psritem.MinQuantity = psritem.ItemMaster.StockItem.MinQuantity;
                                            psritem.MaxQuantity = psritem.ItemMaster.StockItem.MaxQuantity;
                                            psritem.StockItemRev = psritem.ItemMaster.StockItem.Rev;
                                            if (ReqQty > 0) {
                                                if (stockserialitems[batid].Quantity >= ReqQty) {
                                                    patientdispenseDetail = {
                                                        Id: 0,
                                                        PatientStockRequestDetailId: psritem.Id,
                                                        PrescriptionDetailId: psritem.PrescriptionDetailId,
                                                        ReqItemMasterId: 0,
                                                        ItemMasterId: psritem.ItemMasterId,
                                                        ItemCode: psritem.ItemCode,
                                                        ItemName: psritem.ItemName,
                                                        CategoryId: psritem.ItemMaster.CategoryId,
                                                        SubCategoryId: psritem.ItemMaster.SubCategoryId,
                                                        ProductTypeId: psritem.ItemMaster.ProductTypeId,
                                                        SubProductTypeId: psritem.ItemMaster.SubProductTypeId,
                                                        ServiceTypeId: psritem.ServiceTypeId,
                                                        ServiceGroupId: psritem.ServiceGroupId,
                                                        ServiceCategoryId: psritem.ServiceCategoryId,
                                                        MasterName: psritem.MasterName,
                                                        MasterItemId: psritem.MasterItemId,
                                                        DrugName: psritem.DrugName,
                                                        DrugId: psritem.DrugId,
                                                        MasterTypeId: psritem.MasterTypeId,
                                                        GenericId: psritem.ItemMaster.GenericId,
                                                        GenericName: psritem.ItemMaster.GenericName,
                                                        ManufacturerId: psritem.ItemMaster.ManufacturerId,
                                                        ManufacturerName: psritem.ItemMaster.ManufacturerName,
                                                        ScheduleTypeId: psritem.ItemMaster.ScheduleTypeId,
                                                        ScheduleTypeDescription: psritem.ScheduleTypeDescription,
                                                        BaseUomId: stockserialitems[batid].BaseUomId,
                                                        SaleUomId: stockserialitems[batid].SaleUomId,
                                                        RequestedQuantity: psritem.RequestedQuantity,
                                                        QuantityBeforeDispense: stockserialitems[batid].Quantity,
                                                        DispensedQuantity: ReqQty,
                                                        StockItemId: stockserialitems[batid].StockItemId,
                                                        StockSerialItemId: stockserialitems[batid].Id,
                                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                                        Batch: true,
                                                        BatchId: stockserialitems[batid].BatchId,
                                                        //ExpiryDate: stockserialitems[batid].ExpiryDate,
                                                        ExpiryDate: null,
                                                        ExpiryAlert: false,
                                                        ExpiryStop: false,
                                                        ExpiryProceed: false,
                                                        PurchasePrice: stockserialitems[batid].Ucp,
                                                        UnitCostPrice: stockserialitems[batid].Ucp,
                                                        Ucp: stockserialitems[batid].Ucp,
                                                        MrPrice: stockserialitems[batid].Mrp,
                                                        Mrp: stockserialitems[batid].Mrp,
                                                        IsPharmacyCredit: 1,
                                                        Amount: 0,
                                                        GrossAmount: 0,
                                                        DiscountModeId: 2,
                                                        DiscountValue: 0,
                                                        DiscountAmount: 0,
                                                        DoctorDiscountAmount: 0,
                                                        GstId: stockserialitems[batid].GstId,
                                                        GstPercentage: stockserialitems[batid].GstPercentage,
                                                        UnitGstAmount: 0,
                                                        GstAmount: 0,
                                                        InGstId: stockserialitems[batid].InGstId,
                                                        InGstPercentage: stockserialitems[batid].InGstPercentage,
                                                        UnitInGstAmount: 0,
                                                        InGstAmount: 0,
                                                        CGstId: stockserialitems[batid].CGstId,
                                                        CGstPercentage: stockserialitems[batid].CGstPercentage,
                                                        UnitCGstAmount: 0,
                                                        CGstAmount: 0,
                                                        SGstId: stockserialitems[batid].SGstId,
                                                        SGstPercentage: stockserialitems[batid].SGstPercentage,
                                                        UnitSGstAmount: 0,
                                                        SGstAmount: 0,
                                                        NetAmountBeforeGst: 0,
                                                        NetAmount: 0,
                                                        MinQuantity: psritem.ItemMaster.StockItem.MinQuantity,
                                                        MaxQuantity: psritem.ItemMaster.StockItem.MaxQuantity,
                                                        TotalAvailableQuantity: psritem.ItemMaster.StockItem.Quantity,
                                                        BatchQuantity: stockserialitems[batid].Quantity,
                                                        ReceivedQuantity: psritem.DispensedQuantity,
                                                        TransitQuantity: ReqQty,
                                                        StockItemRev: psritem.ItemMaster.StockItem.Rev,
                                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                                        EncounterId: $scope.item.EncounterId,
                                                        PatientBillStatusId: 3,
                                                        GSTId: stockserialitems[batid].GstId,
                                                        GSTPercentage: stockserialitems[batid].GstPercentage,
                                                        UnitGSTAmount: 0,
                                                        GSTAmount: 0,
                                                        NetAmountBeforeGST: 0,
                                                        IsPharmacySale: 1,
                                                        PharmacySaleTypeId: 2,
                                                        BillDateTime: null,
                                                        ServiceId: psritem.ItemMasterId,
                                                        ServiceCode: psritem.ItemCode,
                                                        ServiceName: psritem.ItemName,
                                                        IsSupplementary: psritem.IsSupplementary,
                                                        Quantity: ReqQty,
                                                        Rate: stockserialitems[batid].Mrp,
                                                        PatientStockRequestDetailRev: psritem.Rev,
                                                        CanOpenAlternates: false,
                                                        CanViewStock: false,
                                                        CanDelete: true,
                                                        IsAlternateIssued: false,
                                                        Status: 1,
                                                        IsNonClaimable: psritem.ItemMaster.IsNonClaimable
                                                    };

                                                    ExpiryDays = GetExpiryDays(stockserialitems[batid].ExpiryDate);
                                                    if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                                        patientdispenseDetail.ExpiryStop = true;
                                                    } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                    } else {
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                    }

                                                    if (patientdispenseDetail.ExpiryAlert) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    } else if (patientdispenseDetail.ExpiryStop) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryStop = true;
                                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    } else {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    }

                                                    if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQuantity) {
                                                        patientdispenseDetail.IsFallUnderMinQty = true;
                                                    } else {
                                                        patientdispenseDetail.IsFallUnderMinQty = false;
                                                    }

                                                    patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.GrossAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                                                    patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                                                    //patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                                                    //patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitCGstAmount = patientdispenseDetail.UnitGSTAmount / 2;
                                                    patientdispenseDetail.UnitSGstAmount = patientdispenseDetail.UnitGSTAmount / 2;
                                                    patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    //patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    //patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.CGstAmount = patientdispenseDetail.GSTAmount / 2;
                                                    patientdispenseDetail.SGstAmount = patientdispenseDetail.GSTAmount / 2;
                                                    patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                                    patientdispenseDetail.PatNetAmount = parseFloat(patientdispenseDetail.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                                                    patientdispenseDetail.InsNetAmount = parseFloat(patientdispenseDetail.NetAmount) - parseFloat(patientdispenseDetail.PatNetAmount);
                                                    patientdispenseDetail.BalanceRequestedQuantity = ReqQty;
                                                    patientdispenseDetail.BatchDetails = stockserialitems;
                                                    $scope.patientdispenseDetails.push(patientdispenseDetail);
                                                    ReqQty = 0;
                                                } else if (stockserialitems[batid].Quantity < ReqQty) {
                                                    patientdispenseDetail = {
                                                        Id: 0,
                                                        PatientStockRequestDetailId: psritem.Id,
                                                        PrescriptionDetailId: psritem.PrescriptionDetailId,
                                                        ReqItemMasterId: 0,
                                                        ItemMasterId: psritem.ItemMasterId,
                                                        ItemCode: psritem.ItemCode,
                                                        ItemName: psritem.ItemName,
                                                        CategoryId: psritem.ItemMaster.CategoryId,
                                                        SubCategoryId: psritem.ItemMaster.SubCategoryId,
                                                        ProductTypeId: psritem.ItemMaster.ProductTypeId,
                                                        SubProductTypeId: psritem.ItemMaster.SubProductTypeId,
                                                        ServiceTypeId: psritem.ServiceTypeId,
                                                        ServiceGroupId: psritem.ServiceGroupId,
                                                        ServiceCategoryId: psritem.ServiceCategoryId,
                                                        MasterName: psritem.MasterName,
                                                        MasterItemId: psritem.MasterItemId,
                                                        DrugName: psritem.DrugName,
                                                        DrugId: psritem.DrugId,
                                                        MasterTypeId: psritem.MasterTypeId,
                                                        GenericId: psritem.ItemMaster.GenericId,
                                                        GenericName: psritem.ItemMaster.GenericName,
                                                        ManufacturerId: psritem.ItemMaster.ManufacturerId,
                                                        ManufacturerName: psritem.ItemMaster.ManufacturerName,
                                                        ScheduleTypeId: psritem.ItemMaster.ScheduleTypeId,
                                                        ScheduleTypeDescription: psritem.ScheduleTypeDescription,
                                                        BaseUomId: stockserialitems[batid].BaseUomId,
                                                        SaleUomId: stockserialitems[batid].SaleUomId,
                                                        RequestedQuantity: psritem.RequestedQuantity,
                                                        QuantityBeforeDispense: stockserialitems[batid].Quantity,
                                                        DispensedQuantity: stockserialitems[batid].Quantity,
                                                        StockItemId: stockserialitems[batid].StockItemId,
                                                        StockSerialItemId: stockserialitems[batid].Id,
                                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                                        Batch: true,
                                                        BatchId: stockserialitems[batid].BatchId,
                                                        //ExpiryDate: stockserialitems[batid].ExpiryDate,
                                                        ExpiryDate: null,
                                                        ExpiryAlert: false,
                                                        ExpiryStop: false,
                                                        ExpiryProceed: false,
                                                        PurchasePrice: stockserialitems[batid].Ucp,
                                                        UnitCostPrice: stockserialitems[batid].Ucp,
                                                        Ucp: stockserialitems[batid].Ucp,
                                                        MrPrice: stockserialitems[batid].Mrp,
                                                        Mrp: stockserialitems[batid].Mrp,
                                                        IsPharmacyCredit: 1,
                                                        Amount: 0,
                                                        GrossAmount: 0,
                                                        DiscountModeId: 2,
                                                        DiscountValue: 0,
                                                        DiscountAmount: 0,
                                                        DoctorDiscountAmount: 0,
                                                        GstId: stockserialitems[batid].GstId,
                                                        GstPercentage: stockserialitems[batid].GstPercentage,
                                                        UnitGstAmount: 0,
                                                        GstAmount: 0,
                                                        InGstId: stockserialitems[batid].InGstId,
                                                        InGstPercentage: stockserialitems[batid].InGstPercentage,
                                                        UnitInGstAmount: 0,
                                                        InGstAmount: 0,
                                                        CGstId: stockserialitems[batid].CGstId,
                                                        CGstPercentage: stockserialitems[batid].CGstPercentage,
                                                        UnitCGstAmount: 0,
                                                        CGstAmount: 0,
                                                        SGstId: stockserialitems[batid].SGstId,
                                                        SGstPercentage: stockserialitems[batid].SGstPercentage,
                                                        UnitSGstAmount: 0,
                                                        SGstAmount: 0,
                                                        NetAmountBeforeGst: 0,
                                                        NetAmount: 0,
                                                        MinQuantity: psritem.ItemMaster.StockItem.MinQuantity,
                                                        MaxQuantity: psritem.ItemMaster.StockItem.MaxQuantity,
                                                        TotalAvailableQuantity: psritem.ItemMaster.StockItem.Quantity,
                                                        BatchQuantity: stockserialitems[batid].Quantity,
                                                        ReceivedQuantity: psritem.DispensedQuantity,
                                                        TransitQuantity: stockserialitems[batid].Quantity,
                                                        StockItemRev: psritem.ItemMaster.StockItem.Rev,
                                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                                        EncounterId: $scope.item.EncounterId,
                                                        PatientBillStatusId: 3,
                                                        GSTId: stockserialitems[batid].GstId,
                                                        GSTPercentage: stockserialitems[batid].GstPercentage,
                                                        UnitGSTAmount: 0,
                                                        GSTAmount: 0,
                                                        NetAmountBeforeGST: 0,
                                                        IsPharmacySale: 1,
                                                        PharmacySaleTypeId: 2,
                                                        BillDateTime: null,
                                                        ServiceId: psritem.ItemMasterId,
                                                        ServiceCode: psritem.ItemCode,
                                                        ServiceName: psritem.ItemName,
                                                        IsSupplementary: psritem.IsSupplementary,
                                                        Quantity: stockserialitems[batid].Quantity,
                                                        Rate: stockserialitems[batid].Mrp,
                                                        PatientStockRequestDetailRev: psritem.Rev,
                                                        CanOpenAlternates: false,
                                                        CanViewStock: false,
                                                        CanDelete: true,
                                                        IsAlternateIssued: false,
                                                        Status: 1,
                                                        IsNonClaimable: psritem.ItemMaster.IsNonClaimable
                                                    };

                                                    ExpiryDays = GetExpiryDays(stockserialitems[batid].ExpiryDate);
                                                    if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                                        patientdispenseDetail.ExpiryStop = true;
                                                    } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                    } else {
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                    }

                                                    if (patientdispenseDetail.ExpiryAlert) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryAlert = true;
                                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    } else if (patientdispenseDetail.ExpiryStop) {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryStop = true;
                                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    } else {
                                                        patientdispenseDetail.ExpiryDate = null;
                                                        patientdispenseDetail.ExpiryProceed = true;
                                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    }

                                                    if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQuantity) {
                                                        patientdispenseDetail.IsFallUnderMinQty = true;
                                                    } else {
                                                        patientdispenseDetail.IsFallUnderMinQty = false;
                                                    }

                                                    patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.GrossAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                                                    patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                                                    //patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                                                    //patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                                                    patientdispenseDetail.UnitCGstAmount = patientdispenseDetail.UnitGSTAmount / 2;
                                                    patientdispenseDetail.UnitSGstAmount = patientdispenseDetail.UnitGSTAmount / 2;
                                                    patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    //patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    //patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.CGstAmount = patientdispenseDetail.GSTAmount / 2;
                                                    patientdispenseDetail.SGstAmount = patientdispenseDetail.GSTAmount / 2;
                                                    patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                                    patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                                    patientdispenseDetail.PatNetAmount = parseFloat(patientdispenseDetail.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                                                    patientdispenseDetail.InsNetAmount = parseFloat(patientdispenseDetail.NetAmount) - parseFloat(patientdispenseDetail.PatNetAmount);
                                                    patientdispenseDetail.BalanceRequestedQuantity = ReqQty;
                                                    patientdispenseDetail.BatchDetails = stockserialitems;
                                                    $scope.patientdispenseDetails.push(patientdispenseDetail);
                                                    ReqQty = ReqQty - stockserialitems[batid].Quantity;
                                                }
                                            }
                                        }
                                    }
                                }

                            } else {
                                patientdispenseDetail = {
                                    Id: 0,
                                    PatientStockRequestDetailId: psritem.Id,
                                    PrescriptionDetailId: psritem.PrescriptionDetailId,
                                    ReqItemMasterId: 0,
                                    ItemMasterId: psritem.ItemMasterId,
                                    ItemCode: psritem.ItemCode,
                                    ItemName: psritem.ItemName,
                                    CategoryId: psritem.ItemMaster.CategoryId,
                                    SubCategoryId: psritem.ItemMaster.SubCategoryId,
                                    ProductTypeId: psritem.ItemMaster.ProductTypeId,
                                    SubProductTypeId: psritem.ItemMaster.SubProductTypeId,
                                    ServiceTypeId: psritem.ServiceTypeId,
                                    ServiceGroupId: psritem.ServiceGroupId,
                                    ServiceCategoryId: psritem.ServiceCategoryId,
                                    MasterName: psritem.MasterName,
                                    MasterItemId: psritem.MasterItemId,
                                    DrugName: psritem.DrugName,
                                    DrugId: psritem.DrugId,
                                    MasterTypeId: psritem.MasterTypeId,
                                    GenericId: psritem.ItemMaster.GenericId,
                                    GenericName: psritem.ItemMaster.GenericName,
                                    ManufacturerId: psritem.ItemMaster.ManufacturerId,
                                    ManufacturerName: psritem.ItemMaster.ManufacturerName,
                                    ScheduleTypeId: psritem.ItemMaster.ScheduleTypeId,
                                    ScheduleTypeDescription: psritem.ScheduleTypeDescription,
                                    BaseUomId: psritem.ItemMaster.BaseUomId,
                                    SaleUomId: psritem.ItemMaster.SaleUomId,
                                    RequestedQuantity: psritem.RequestedQuantity,
                                    QuantityBeforeDispense: 0,
                                    DispensedQuantity: 0,
                                    StockItemId: 0,
                                    StockSerialItemId: 0,
                                    Batch: false,
                                    BatchId: '',
                                    ExpiryDate: null,
                                    ExpiryAlert: false,
                                    ExpiryStop: false,
                                    ExpiryProceed: false,
                                    PurchasePrice: 0,
                                    UnitCostPrice: 0,
                                    Ucp: 0,
                                    MrPrice: 0,
                                    Mrp: 0,
                                    IsPharmacyCredit: 1,
                                    Amount: 0,
                                    GrossAmount: 0,
                                    DiscountModeId: 2,
                                    DiscountValue: 0,
                                    DiscountAmount: 0,
                                    DoctorDiscountAmount: 0,
                                    GstId: 0,
                                    GstPercentage: 0,
                                    UnitGstAmount: 0,
                                    GstAmount: 0,
                                    InGstId: 0,
                                    InGstPercentage: 0,
                                    UnitInGstAmount: 0,
                                    InGstAmount: 0,
                                    CGstId: 0,
                                    CGstPercentage: 0,
                                    UnitCGstAmount: 0,
                                    CGstAmount: 0,
                                    SGstId: 0,
                                    SGstPercentage: 0,
                                    UnitSGstAmount: 0,
                                    SGstAmount: 0,
                                    NetAmountBeforeGst: 0,
                                    NetAmount: 0,
                                    // MinQuantity: psritem.ItemMaster.StockItem.MinQuantity,
                                    // MaxQuantity: psritem.ItemMaster.StockItem.MaxQuantity,
                                    TotalAvailableQuantity: 0,
                                    BatchQuantity: 0,
                                    ReceivedQuantity: psritem.DispensedQuantity,
                                    TransitQuantity: 0,
                                    // StockItemRev: psritem.ItemMaster.StockItem.Rev,
                                    StockSerialItemRev: 0,
                                    EncounterId: $scope.item.EncounterId,
                                    PatientBillStatusId: 3,
                                    GSTId: 0,
                                    GSTPercentage: 0,
                                    UnitGSTAmount: 0,
                                    GSTAmount: 0,
                                    NetAmountBeforeGST: 0,
                                    IsPharmacySale: 1,
                                    PharmacySaleTypeId: 2,
                                    BillDateTime: null,
                                    ServiceId: psritem.ItemMasterId,
                                    ServiceCode: psritem.ItemCode,
                                    ServiceName: psritem.ItemName,
                                    IsSupplementary: psritem.IsSupplementary,
                                    Quantity: 0,
                                    Rate: 0,
                                    PatientStockRequestDetailRev: psritem.Rev,
                                    CanOpenAlternates: false,
                                    CanViewStock: false,
                                    CanDelete: true,
                                    IsAlternateIssued: false,
                                    Status: 1,
                                    IsNonClaimable: psritem.ItemMaster.IsNonClaimable
                                };

                                patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                patientdispenseDetail.GrossAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                                patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                                //patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                                //patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                                patientdispenseDetail.UnitCGstAmount = patientdispenseDetail.UnitGSTAmount / 2;
                                patientdispenseDetail.UnitSGstAmount = patientdispenseDetail.UnitGSTAmount / 2;
                                patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                //patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                //patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                patientdispenseDetail.CGstAmount = patientdispenseDetail.GSTAmount / 2;
                                patientdispenseDetail.SGstAmount = patientdispenseDetail.GSTAmount / 2;
                                patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                patientdispenseDetail.BatchDetails = [];
                                patientdispenseDetail.PatNetAmount = parseFloat(patientdispenseDetail.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                                patientdispenseDetail.InsNetAmount = parseFloat(patientdispenseDetail.NetAmount) - parseFloat(patientdispenseDetail.PatNetAmount);
                                $scope.patientdispenseDetails.push(patientdispenseDetail);
                            }
                            // }
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
                    $scope.applyVisibilityRules();

                    $scope.patientdispenseDetails.sort($scope.custom_sort);
                    $scope.setIndexforTableIndex();
                });
            }
        };

        $scope.custom_multi_sort = function (a, b) {
            var aExpiryDate = a.ExpiryDate;
            var bExpiryDate = b.ExpiryDate;
            var aQuantity = a.Quantity;
            var bQuantity = b.Quantity;

            if (aExpiryDate == bExpiryDate) {
                return (aQuantity < bQuantity) ? -1 : (aQuantity > bQuantity) ? 1 : 0;
            } else {
                return (aExpiryDate < bExpiryDate) ? -1 : 1;
            }
        };

        $scope.custom_sort = function (a, b) {
            if (a.Id < b.Id)
                return -1;
            if (a.Id > b.Id)
                return 1;
            return 0;
        };

        function GetExpiryDays(ExpiryDate) {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var CurDate = new Date(TodayDate);

            var FutureDate = ExpiryDate.slice(0, 10);
            var ExpDate = new Date(FutureDate);

            var ExpiryDays = Math.round((ExpDate - CurDate) / (1000 * 60 * 60 * 24));
            return ExpiryDays;
        }

        $scope.batchDetails = function (idx, item) {
            utl.Modal.openFixedDialog('app.batch-dispense', {
                params: {
                    current_index: idx,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: $scope.item.StoreMasterId,
                    current_item: item,
                    grid_items: $scope.patientdispenseDetails
                },
                confirmCallback: $scope.onDispensingBatchChange
            });
        };

        $scope.onDispensingBatchChange = function (UpdatedItemData) {
            var ExpiryDays = null;
            var item = [];
            item = UpdatedItemData.UpdatedItem;

            for (var count = 0; count < $scope.patientdispenseDetails.length; count++) {
                var cllitem = $scope.patientdispenseDetails[count];
                if (cllitem.ItemMasterId == UpdatedItemData.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.DeletedpatientdispenseDetails.push(cllitem);
                    var index1 = $scope.patientdispenseDetails.indexOf(cllitem);
                    $scope.patientdispenseDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                var batchitem = item.BatchDetails[batid];
                var patientdispenseDetail = {
                    Id: 0,
                    PatientStockRequestDetailId: item.PatientStockRequestDetailId,
                    PrescriptionDetailId: item.PrescriptionDetailId,
                    ItemMasterId: item.ItemMasterId,
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    CategoryId: item.CategoryId,
                    SubCategoryId: item.SubCategoryId,
                    ProductTypeId: item.ProductTypeId,
                    SubProductTypeId: item.SubProductTypeId,
                    ServiceTypeId: item.ServiceTypeId,
                    ServiceGroupId: item.ServiceGroupId,
                    ServiceCategoryId: item.ServiceCategoryId,
                    MasterName: item.MasterName,
                    MasterItemId: item.MasterItemId,
                    DrugName: item.DrugName,
                    DrugId: item.DrugId,
                    MasterTypeId: item.MasterTypeId,
                    GenericId: item.GenericId,
                    GenericName: item.GenericName,
                    ManufacturerId: item.ManufacturerId,
                    ManufacturerName: item.ManufacturerName,
                    ScheduleTypeId: item.ScheduleTypeId,
                    ScheduleTypeDescription: item.ScheduleTypeDescription,
                    BaseUomId: batchitem.BaseUomId,
                    SaleUomId: batchitem.SaleUomId,
                    RequestedQuantity: item.RequestedQuantity,
                    QuantityBeforeDispense: batchitem.Quantity,
                    DispensedQuantity: parseInt(batchitem.IssueQty),
                    StockItemId: batchitem.StockItemId,
                    StockSerialItemId: batchitem.Id,
                    StockSerialItemRev: batchitem.Rev,
                    Batch: true,
                    BatchId: batchitem.BatchId,
                    ExpiryDate: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false,
                    PurchasePrice: batchitem.Ucp,
                    UnitCostPrice: batchitem.Ucp,
                    Ucp: batchitem.Ucp,
                    MrPrice: batchitem.Mrp,
                    Mrp: batchitem.Mrp,
                    IsPharmacyCredit: 1,
                    Amount: 0,
                    GrossAmount: 0,
                    DiscountModeId: 2,
                    DiscountValue: 0,
                    DiscountAmount: 0,
                    DoctorDiscountAmount: 0,
                    GstId: batchitem.GstId,
                    GstPercentage: batchitem.GstPercentage,
                    UnitGstAmount: 0,
                    GstAmount: 0,
                    InGstId: batchitem.InGstId,
                    InGstPercentage: batchitem.InGstPercentage,
                    UnitInGstAmount: 0,
                    InGstAmount: 0,
                    CGstId: batchitem.CGstId,
                    CGstPercentage: batchitem.CGstPercentage,
                    UnitCGstAmount: 0,
                    CGstAmount: 0,
                    SGstId: batchitem.SGstId,
                    SGstPercentage: batchitem.SGstPercentage,
                    UnitSGstAmount: 0,
                    SGstAmount: 0,
                    NetAmountBeforeGst: 0,
                    NetAmount: 0,
                    MinQuantity: item.MinQuantity,
                    MaxQuantity: item.MaxQuantity,
                    TotalAvailableQuantity: item.Quantity,
                    BatchQuantity: batchitem.Quantity,
                    ReceivedQuantity: parseInt(batchitem.IssueQty),
                    TransitQuantity: parseInt(batchitem.IssueQty),
                    StockItemRev: item.Rev,
                    StockSerialItemRev: batchitem.Rev,
                    EncounterId: $scope.item.EncounterId,
                    PatientBillStatusId: 3,
                    GSTId: batchitem.GstId,
                    GSTPercentage: batchitem.GstPercentage,
                    UnitGSTAmount: 0,
                    GSTAmount: 0,
                    NetAmountBeforeGST: 0,
                    IsPharmacySale: 1,
                    PharmacySaleTypeId: 2,
                    BillDateTime: null,
                    ServiceId: item.ItemMasterId,
                    ServiceCode: item.ItemCode,
                    ServiceName: item.ItemName,
                    IsSupplementary: item.IsSupplementary,
                    Quantity: parseInt(batchitem.IssueQty),
                    Rate: batchitem.Mrp,
                    PatientStockRequestDetail: item.Rev,
                    Status: 1
                };

                ExpiryDays = GetExpiryDays(batchitem.ExpiryDate);
                if (ExpiryDays <= item.ExpiryPriorStopDays) {
                    patientdispenseDetail.ExpiryStop = true;
                } else if (ExpiryDays > item.ExpiryPriorStopDays && ExpiryDays <= item.ExpiryWarningDays) {
                    patientdispenseDetail.ExpiryAlert = true;
                } else {
                    patientdispenseDetail.ExpiryProceed = true;
                }

                if (patientdispenseDetail.ExpiryAlert) {
                    patientdispenseDetail.ExpiryDate = null;
                    patientdispenseDetail.ExpiryAlert = true;
                    patientdispenseDetail.ExpiryDate = batchitem.ExpiryDate;
                } else if (patientdispenseDetail.ExpiryStop) {
                    patientdispenseDetail.ExpiryDate = null;
                    patientdispenseDetail.ExpiryStop = true;
                    patientdispenseDetail.ExpiryDate = batchitem.ExpiryDate;
                } else {
                    patientdispenseDetail.ExpiryDate = null;
                    patientdispenseDetail.ExpiryProceed = true;
                    patientdispenseDetail.ExpiryDate = batchitem.ExpiryDate;
                }

                if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQuantity) {
                    patientdispenseDetail.IsFallUnderMinQty = true;
                } else {
                    patientdispenseDetail.IsFallUnderMinQty = false;
                }

                patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.GrossAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                patientdispenseDetail.BalanceRequestedQuantity = 0;
                patientdispenseDetail.BatchDetails = item.AllBatchDetails;
                $scope.patientdispenseDetails.push(patientdispenseDetail);
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
            $scope.applyVisibilityRules();

            /* $scope.patientdispenseDetails.sort($scope.custom_sort); */
            $scope.setIndexforTableIndex();
        };

        $scope.alternateDetails = function (idx, item) {
            utl.Modal.openFixedDialog('app.alternate-dispense', {
                params: {
                    genericid: item.GenericId,
                    itemmasterid: item.ItemMasterId,
                    requestedquantity: item.RequestedQuantity,
                    dispensedquantity: item.ReceivedQuantity,
                    storemasterid: $scope.item.StoreMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                    actual_item: item,
                    lineindex: idx
                },
                confirmCallback: replaceAlternate
            });
        };

        function replaceAlternate(alternatedata) {
            var ActualItem = {};
            var AlternateItem = {};
            var AlternateItemDetail = {};
            ActualItem = alternatedata.ActualItem;
            AlternateItem = alternatedata.AlternateItem;
            $scope.ActualOrderedItem(ActualItem);
            var patientdispenseDetail = {};
            var ExpiryDays = null;
            var ReqQty = 0;
            if (AlternateItem.Id > 0) {
                if (AlternateItem.SubCategoryId == 1) {
                    AlternateItem.SubCategoryId = 1;
                    AlternateItem.ServiceTypeId = 0;
                    AlternateItem.ServiceGroupId = $scope.DrugServiceGroupId;
                    AlternateItem.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    AlternateItem.MasterName = AlternateItem.DrugName;
                    AlternateItem.MasterItemId = AlternateItem.DrugId;
                    AlternateItem.MasterTypeId = AlternateItem.SubCategoryId;
                } else if (AlternateItem.SubCategoryId == 2) {
                    AlternateItem.SubCategoryId = 2;
                    AlternateItem.ServiceTypeId = 0;
                    AlternateItem.ServiceGroupId = $scope.NonDrugServiceGroupId;
                    AlternateItem.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                    AlternateItem.MasterName = AlternateItem.DrugName;
                    AlternateItem.MasterItemId = AlternateItem.DrugId;
                    AlternateItem.MasterTypeId = AlternateItem.SubCategoryId;
                } else {
                    AlternateItem.SubCategoryId = 0;
                    AlternateItem.ServiceTypeId = 0;
                    AlternateItem.ServiceGroupId = 0;
                    AlternateItem.ServiceCategoryId = 0;
                    AlternateItem.MasterName = '';
                    AlternateItem.MasterItemId = 0;
                    AlternateItem.DrugName = 0;
                    AlternateItem.DrugId = 0;
                    AlternateItem.MasterTypeId = 0;
                }
                if (AlternateItem.ScheduleType) {
                    AlternateItem.ScheduleTypeDescription = AlternateItem.ScheduleType.Description;
                }
                if (AlternateItem.Supplementary && AlternateItem.Supplementary.length > 0) {
                    AlternateItem.IsSupplementary = true;
                }
                ReqQty = alternatedata.totalreqqty - alternatedata.totaldisqty;
                AlternateItem.BalanceRequestedQuantity = ReqQty;
                if (AlternateItem.StockItem !== null) {
                    var stockserialitems = null;
                    if (AlternateItem.StockItem.StockSerialItems.length > 0) {
                        stockserialitems = AlternateItem.StockItem.StockSerialItems;
                        for (var batid = 0; batid < stockserialitems.length; batid++) {
                            AlternateItem.TotalAvailableQuantity = AlternateItem.StockItem.Quantity;
                            AlternateItem.MinQuantity = AlternateItem.StockItem.MinQuantity;
                            AlternateItem.MaxQuantity = AlternateItem.StockItem.MaxQuantity;
                            AlternateItem.StockItemRev = AlternateItem.StockItem.Rev;
                            if (ReqQty > 0) {
                                if (stockserialitems[batid].Quantity >= ReqQty) {
                                    patientdispenseDetail = {
                                        Id: 0,
                                        PatientStockRequestDetailId: ActualItem.PatientStockRequestDetailId,
                                        PrescriptionDetailId: ActualItem.PrescriptionDetailId,
                                        ItemMasterId: AlternateItem.Id,
                                        ItemCode: AlternateItem.ItemCode,
                                        ItemName: AlternateItem.ItemName,
                                        ReqItemMasterId: ActualItem.ItemMasterId,
                                        ReqItemCode: ActualItem.ItemCode,
                                        ReqItemName: ActualItem.ItemName,
                                        CategoryId: AlternateItem.CategoryId,
                                        SubCategoryId: AlternateItem.SubCategoryId,
                                        ProductTypeId: AlternateItem.ProductTypeId,
                                        SubProductTypeId: AlternateItem.SubProductTypeId,
                                        ServiceTypeId: AlternateItem.ServiceTypeId,
                                        ServiceGroupId: AlternateItem.ServiceGroupId,
                                        ServiceCategoryId: AlternateItem.ServiceCategoryId,
                                        MasterName: AlternateItem.MasterName,
                                        MasterItemId: AlternateItem.MasterItemId,
                                        DrugName: AlternateItem.DrugName,
                                        DrugId: AlternateItem.DrugId,
                                        MasterTypeId: AlternateItem.MasterTypeId,
                                        GenericId: AlternateItem.GenericId,
                                        GenericName: AlternateItem.GenericName,
                                        ManufacturerId: AlternateItem.ManufacturerId,
                                        ManufacturerName: AlternateItem.ManufacturerName,
                                        ScheduleTypeId: AlternateItem.ScheduleTypeId,
                                        ScheduleTypeDescription: AlternateItem.ScheduleTypeDescription,
                                        BaseUomId: stockserialitems[batid].BaseUomId,
                                        SaleUomId: stockserialitems[batid].SaleUomId,
                                        RequestedQuantity: ReqQty,
                                        QuantityBeforeDispense: stockserialitems[batid].Quantity,
                                        DispensedQuantity: ReqQty,
                                        StockItemId: stockserialitems[batid].StockItemId,
                                        StockSerialItemId: stockserialitems[batid].Id,
                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                        Batch: true,
                                        BatchId: stockserialitems[batid].BatchId,
                                        //ExpiryDate: stockserialitems[batid].ExpiryDate,
                                        ExpiryDate: null,
                                        ExpiryAlert: false,
                                        ExpiryStop: false,
                                        ExpiryProceed: false,
                                        PurchasePrice: stockserialitems[batid].Ucp,
                                        UnitCostPrice: stockserialitems[batid].Ucp,
                                        Ucp: stockserialitems[batid].Ucp,
                                        MrPrice: stockserialitems[batid].Mrp,
                                        Mrp: stockserialitems[batid].Mrp,
                                        IsPharmacyCredit: 1,
                                        Amount: 0,
                                        GrossAmount: 0,
                                        DiscountModeId: 2,
                                        DiscountValue: 0,
                                        DiscountAmount: 0,
                                        DoctorDiscountAmount: 0,
                                        GstId: stockserialitems[batid].GstId,
                                        GstPercentage: stockserialitems[batid].GstPercentage,
                                        UnitGstAmount: 0,
                                        GstAmount: 0,
                                        InGstId: stockserialitems[batid].InGstId,
                                        InGstPercentage: stockserialitems[batid].InGstPercentage,
                                        UnitInGstAmount: 0,
                                        InGstAmount: 0,
                                        CGstId: stockserialitems[batid].CGstId,
                                        CGstPercentage: stockserialitems[batid].CGstPercentage,
                                        UnitCGstAmount: 0,
                                        CGstAmount: 0,
                                        SGstId: stockserialitems[batid].SGstId,
                                        SGstPercentage: stockserialitems[batid].SGstPercentage,
                                        SNo: ActualItem.SNo,
                                        UnitSGstAmount: 0,
                                        SGstAmount: 0,
                                        NetAmountBeforeGst: 0,
                                        NetAmount: 0,
                                        MinQuantity: AlternateItem.StockItem.MinQuantity,
                                        MaxQuantity: AlternateItem.StockItem.MaxQuantity,
                                        TotalAvailableQuantity: AlternateItem.StockItem.Quantity,
                                        BatchQuantity: stockserialitems[batid].Quantity,
                                        ReceivedQuantity: alternatedata.totaldisqty,
                                        TransitQuantity: ReqQty,
                                        StockItemRev: AlternateItem.StockItem.Rev,
                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                        EncounterId: ActualItem.EncounterId,
                                        PatientBillStatusId: 3,
                                        GSTId: stockserialitems[batid].GstId,
                                        GSTPercentage: stockserialitems[batid].GstPercentage,
                                        UnitGSTAmount: 0,
                                        GSTAmount: 0,
                                        NetAmountBeforeGST: 0,
                                        IsPharmacySale: 1,
                                        PharmacySaleTypeId: 2,
                                        BillDateTime: null,
                                        ServiceId: AlternateItem.Id,
                                        ServiceCode: AlternateItem.ItemCode,
                                        ServiceName: AlternateItem.ItemName,
                                        IsSupplementary: AlternateItem.IsSupplementary,
                                        Quantity: ReqQty,
                                        Rate: stockserialitems[batid].Mrp,
                                        PatientStockRequestDetailRev: ActualItem.Rev,
                                        CanOpenAlternates: true,
                                        CanViewStock: false,
                                        CanDelete: false,
                                        IsAlternateIssued: false,
                                        Status: 1,
                                        IsNonClaimable: AlternateItem.IsNonClaimable
                                    };

                                    ExpiryDays = GetExpiryDays(stockserialitems[batid].ExpiryDate);
                                    if (ExpiryDays <= ActualItem.ExpiryPriorStopDays) {
                                        patientdispenseDetail.ExpiryStop = true;
                                    } else if (ExpiryDays > ActualItem.ExpiryPriorStopDays && ExpiryDays <= ActualItem.ExpiryWarningDays) {
                                        patientdispenseDetail.ExpiryAlert = true;
                                    } else {
                                        patientdispenseDetail.ExpiryProceed = true;
                                    }

                                    if (patientdispenseDetail.ExpiryAlert) {
                                        patientdispenseDetail.ExpiryDate = null;
                                        patientdispenseDetail.ExpiryAlert = true;
                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                    } else if (patientdispenseDetail.ExpiryStop) {
                                        patientdispenseDetail.ExpiryDate = null;
                                        patientdispenseDetail.ExpiryStop = true;
                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                    } else {
                                        patientdispenseDetail.ExpiryDate = null;
                                        patientdispenseDetail.ExpiryProceed = true;
                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                    }

                                    if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQuantity) {
                                        patientdispenseDetail.IsFallUnderMinQty = true;
                                    } else {
                                        patientdispenseDetail.IsFallUnderMinQty = false;
                                    }

                                    patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.GrossAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                                    patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                                    patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                    patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                                    patientdispenseDetail.BalanceRequestedQuantity = ReqQty;
                                    patientdispenseDetail.BatchDetails = stockserialitems;
                                    $scope.patientdispenseDetails.push(patientdispenseDetail);
                                    ReqQty = 0;
                                } else if (stockserialitems[batid].Quantity < ReqQty) {
                                    patientdispenseDetail = {
                                        Id: 0,
                                        PatientStockRequestDetailId: ActualItem.PatientStockRequestDetailId,
                                        PrescriptionDetailId: ActualItem.PrescriptionDetailId,
                                        ItemMasterId: AlternateItem.Id,
                                        ItemCode: AlternateItem.ItemCode,
                                        ItemName: AlternateItem.ItemName,
                                        ReqItemMasterId: ActualItem.ItemMasterId,
                                        ReqItemCode: ActualItem.ItemCode,
                                        ReqItemName: ActualItem.ItemName,
                                        CategoryId: AlternateItem.CategoryId,
                                        SubCategoryId: AlternateItem.SubCategoryId,
                                        ProductTypeId: AlternateItem.ProductTypeId,
                                        SubProductTypeId: AlternateItem.SubProductTypeId,
                                        ServiceTypeId: AlternateItem.ServiceTypeId,
                                        ServiceGroupId: AlternateItem.ServiceGroupId,
                                        ServiceCategoryId: AlternateItem.ServiceCategoryId,
                                        MasterName: AlternateItem.MasterName,
                                        MasterItemId: AlternateItem.MasterItemId,
                                        DrugName: AlternateItem.DrugName,
                                        DrugId: AlternateItem.DrugId,
                                        MasterTypeId: AlternateItem.MasterTypeId,
                                        GenericId: AlternateItem.GenericId,
                                        GenericName: AlternateItem.GenericName,
                                        ManufacturerId: AlternateItem.ManufacturerId,
                                        ManufacturerName: AlternateItem.ManufacturerName,
                                        ScheduleTypeId: AlternateItem.ScheduleTypeId,
                                        ScheduleTypeDescription: AlternateItem.ScheduleTypeDescription,
                                        BaseUomId: stockserialitems[batid].BaseUomId,
                                        SaleUomId: stockserialitems[batid].SaleUomId,
                                        RequestedQuantity: alternatedata.totalreqqty,
                                        QuantityBeforeDispense: stockserialitems[batid].Quantity,
                                        DispensedQuantity: stockserialitems[batid].Quantity,
                                        StockItemId: stockserialitems[batid].StockItemId,
                                        StockSerialItemId: stockserialitems[batid].Id,
                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                        Batch: true,
                                        BatchId: stockserialitems[batid].BatchId,
                                        //ExpiryDate: stockserialitems[batid].ExpiryDate,
                                        ExpiryDate: null,
                                        ExpiryAlert: false,
                                        ExpiryStop: false,
                                        ExpiryProceed: false,
                                        PurchasePrice: stockserialitems[batid].Ucp,
                                        UnitCostPrice: stockserialitems[batid].Ucp,
                                        Ucp: stockserialitems[batid].Ucp,
                                        MrPrice: stockserialitems[batid].Mrp,
                                        Mrp: stockserialitems[batid].Mrp,
                                        IsPharmacyCredit: 1,
                                        Amount: 0,
                                        GrossAmount: 0,
                                        DiscountModeId: 2,
                                        DiscountValue: 0,
                                        DiscountAmount: 0,
                                        DoctorDiscountAmount: 0,
                                        GstId: stockserialitems[batid].GstId,
                                        GstPercentage: stockserialitems[batid].GstPercentage,
                                        UnitGstAmount: 0,
                                        GstAmount: 0,
                                        InGstId: stockserialitems[batid].InGstId,
                                        InGstPercentage: stockserialitems[batid].InGstPercentage,
                                        UnitInGstAmount: 0,
                                        InGstAmount: 0,
                                        CGstId: stockserialitems[batid].CGstId,
                                        CGstPercentage: stockserialitems[batid].CGstPercentage,
                                        UnitCGstAmount: 0,
                                        CGstAmount: 0,
                                        SGstId: stockserialitems[batid].SGstId,
                                        SGstPercentage: stockserialitems[batid].SGstPercentage,
                                        SNo: ActualItem.SNo,
                                        UnitSGstAmount: 0,
                                        SGstAmount: 0,
                                        NetAmountBeforeGst: 0,
                                        NetAmount: 0,
                                        MinQuantity: AlternateItem.StockItem.MinQuantity,
                                        MaxQuantity: AlternateItem.StockItem.MaxQuantity,
                                        TotalAvailableQuantity: AlternateItem.StockItem.Quantity,
                                        BatchQuantity: stockserialitems[batid].Quantity,
                                        ReceivedQuantity: AlternateItem.DispensedQuantity,
                                        TransitQuantity: stockserialitems[batid].Quantity,
                                        StockItemRev: AlternateItem.StockItem.Rev,
                                        StockSerialItemRev: stockserialitems[batid].Rev,
                                        EncounterId: ActualItem.EncounterId,
                                        PatientBillStatusId: 3,
                                        GSTId: stockserialitems[batid].GstId,
                                        GSTPercentage: stockserialitems[batid].GstPercentage,
                                        UnitGSTAmount: 0,
                                        GSTAmount: 0,
                                        NetAmountBeforeGST: 0,
                                        IsPharmacySale: 1,
                                        PharmacySaleTypeId: 2,
                                        BillDateTime: null,
                                        ServiceId: AlternateItem.ItemMasterId,
                                        ServiceCode: AlternateItem.ItemCode,
                                        ServiceName: AlternateItem.ItemName,
                                        IsSupplementary: AlternateItem.IsSupplementary,
                                        Quantity: stockserialitems[batid].Quantity,
                                        Rate: stockserialitems[batid].Mrp,
                                        PatientStockRequestDetailRev: ActualItem.Rev,
                                        CanOpenAlternates: true,
                                        CanViewStock: false,
                                        CanDelete: false,
                                        IsAlternateIssued: false,
                                        Status: 1,
                                        IsNonClaimable: AlternateItem.IsNonClaimable
                                    };

                                    ExpiryDays = GetExpiryDays(stockserialitems[batid].ExpiryDate);
                                    if (ExpiryDays <= ActualItem.ExpiryPriorStopDays) {
                                        patientdispenseDetail.ExpiryStop = true;
                                    } else if (ExpiryDays > ActualItem.ExpiryPriorStopDays && ExpiryDays <= ActualItem.ExpiryWarningDays) {
                                        patientdispenseDetail.ExpiryAlert = true;
                                    } else {
                                        patientdispenseDetail.ExpiryProceed = true;
                                    }

                                    if (patientdispenseDetail.ExpiryAlert) {
                                        patientdispenseDetail.ExpiryDate = null;
                                        patientdispenseDetail.ExpiryAlert = true;
                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                    } else if (patientdispenseDetail.ExpiryStop) {
                                        patientdispenseDetail.ExpiryDate = null;
                                        patientdispenseDetail.ExpiryStop = true;
                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                    } else {
                                        patientdispenseDetail.ExpiryDate = null;
                                        patientdispenseDetail.ExpiryProceed = true;
                                        patientdispenseDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                    }

                                    if (patientdispenseDetail.TotalAvailableQuantity <= patientdispenseDetail.MinQuantity) {
                                        patientdispenseDetail.IsFallUnderMinQty = true;
                                    } else {
                                        patientdispenseDetail.IsFallUnderMinQty = false;
                                    }

                                    patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.GrossAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                                    patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                                    patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                                    patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                                    patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                                    patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));

                                    patientdispenseDetail.BalanceRequestedQuantity = ReqQty;
                                    patientdispenseDetail.BatchDetails = stockserialitems;
                                    $scope.patientdispenseDetails.push(patientdispenseDetail);
                                    ReqQty = ReqQty - stockserialitems[batid].Quantity;
                                }
                            }
                        }
                    } else {
                        patientdispenseDetail = {
                            Id: 0,
                            PatientStockRequestDetailId: ActualItem.PatientStockRequestDetailId,
                            PrescriptionDetailId: ActualItem.PrescriptionDetailId,
                            ItemMasterId: AlternateItem.Id,
                            ItemCode: AlternateItem.ItemCode,
                            ItemName: AlternateItem.ItemName,
                            ReqItemMasterId: ActualItem.ItemMasterId,
                            ReqItemCode: ActualItem.ItemCode,
                            ReqItemName: ActualItem.ItemName,
                            CategoryId: AlternateItem.CategoryId,
                            SubCategoryId: AlternateItem.SubCategoryId,
                            ProductTypeId: AlternateItem.ProductTypeId,
                            SubProductTypeId: AlternateItem.SubProductTypeId,
                            ServiceTypeId: AlternateItem.ServiceTypeId,
                            ServiceGroupId: AlternateItem.ServiceGroupId,
                            ServiceCategoryId: AlternateItem.ServiceCategoryId,
                            MasterName: AlternateItem.MasterName,
                            MasterItemId: AlternateItem.MasterItemId,
                            DrugName: AlternateItem.DrugName,
                            DrugId: AlternateItem.DrugId,
                            MasterTypeId: AlternateItem.MasterTypeId,
                            GenericId: AlternateItem.GenericId,
                            GenericName: AlternateItem.GenericName,
                            ManufacturerId: AlternateItem.ManufacturerId,
                            ManufacturerName: AlternateItem.ManufacturerName,
                            ScheduleTypeId: AlternateItem.ScheduleTypeId,
                            ScheduleTypeDescription: AlternateItem.ScheduleTypeDescription,
                            BaseUomId: AlternateItem.BaseUomId,
                            SaleUomId: AlternateItem.SaleUomId,
                            RequestedQuantity: alternatedata.totalreqqty,
                            QuantityBeforeDispense: 0,
                            DispensedQuantity: 0,
                            StockItemId: 0,
                            StockSerialItemId: 0,
                            Batch: false,
                            BatchId: '',
                            ExpiryDate: null,
                            ExpiryAlert: false,
                            ExpiryStop: false,
                            ExpiryProceed: false,
                            PurchasePrice: 0,
                            UnitCostPrice: 0,
                            Ucp: 0,
                            MrPrice: 0,
                            Mrp: 0,
                            IsPharmacyCredit: 1,
                            Amount: 0,
                            GrossAmount: 0,
                            DiscountModeId: 2,
                            DiscountValue: 0,
                            DiscountAmount: 0,
                            DoctorDiscountAmount: 0,
                            GstId: 0,
                            GstPercentage: 0,
                            UnitGstAmount: 0,
                            GstAmount: 0,
                            InGstId: 0,
                            InGstPercentage: 0,
                            UnitInGstAmount: 0,
                            InGstAmount: 0,
                            CGstId: 0,
                            CGstPercentage: 0,
                            UnitCGstAmount: 0,
                            CGstAmount: 0,
                            SGstId: 0,
                            SGstPercentage: 0,
                            SNo: ActualItem.SNo,
                            UnitSGstAmount: 0,
                            SGstAmount: 0,
                            NetAmountBeforeGst: 0,
                            NetAmount: 0,
                            MinQuantity: AlternateItem.StockItem.MinQuantity,
                            MaxQuantity: AlternateItem.StockItem.MaxQuantity,
                            TotalAvailableQuantity: AlternateItem.StockItem.Quantity,
                            BatchQuantity: 0,
                            ReceivedQuantity: alternatedata.totaldisqty,
                            TransitQuantity: 0,
                            StockItemRev: AlternateItem.StockItem.Rev,
                            StockSerialItemRev: 0,
                            EncounterId: ActualItem.EncounterId,
                            PatientBillStatusId: 3,
                            GSTId: 0,
                            GSTPercentage: 0,
                            UnitGSTAmount: 0,
                            GSTAmount: 0,
                            NetAmountBeforeGST: 0,
                            IsPharmacySale: 1,
                            PharmacySaleTypeId: 2,
                            BillDateTime: null,
                            ServiceId: AlternateItem.ItemMasterId,
                            ServiceCode: AlternateItem.ItemCode,
                            ServiceName: AlternateItem.ItemName,
                            IsSupplementary: AlternateItem.IsSupplementary,
                            Quantity: 0,
                            Rate: 0,
                            PatientStockRequestDetailRev: ActualItem.Rev,
                            CanOpenAlternates: true,
                            CanViewStock: false,
                            CanDelete: false,
                            IsAlternateIssued: false,
                            Status: 1,
                            IsNonClaimable: AlternateItem.IsNonClaimable
                        };

                        patientdispenseDetail.Amount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.GrossAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.UnitPrice = parseFloat(((patientdispenseDetail.MrPrice * 100) / (100 + patientdispenseDetail.GstPercentage)).toFixed(2));
                        patientdispenseDetail.UnitGSTAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                        patientdispenseDetail.UnitGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.GstPercentage).toFixed(2));
                        patientdispenseDetail.UnitInGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.InGstPercentage).toFixed(2));
                        patientdispenseDetail.UnitCGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.CGstPercentage).toFixed(2));
                        patientdispenseDetail.UnitSGstAmount = parseFloat(((patientdispenseDetail.UnitPrice / 100) * patientdispenseDetail.SGstPercentage).toFixed(2));
                        patientdispenseDetail.GSTAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.GstAmount = parseFloat((patientdispenseDetail.UnitGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.InGstAmount = parseFloat((patientdispenseDetail.UnitInGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.CGstAmount = parseFloat((patientdispenseDetail.UnitCGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.SGstAmount = parseFloat((patientdispenseDetail.UnitSGstAmount * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.NetAmount = parseFloat((patientdispenseDetail.MrPrice * patientdispenseDetail.DispensedQuantity).toFixed(2));
                        patientdispenseDetail.NetAmountBeforeGST = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                        patientdispenseDetail.NetAmountBeforeGst = parseFloat((patientdispenseDetail.NetAmount - patientdispenseDetail.GstAmount).toFixed(2));
                        patientdispenseDetail.BatchDetails = [];
                        $scope.patientdispenseDetails.push(patientdispenseDetail);
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
                $scope.applyVisibilityRules();

                $scope.patientdispenseDetails.sort($scope.alternate_custom_sort);

                /* $scope.setIndexforTableIndex(); */
            }
        }

        $scope.alternate_custom_sort = function (a, b) {
            if (a.SNo < b.SNo)
                return -1;
            if (a.SNo > b.SNo)
                return 1;
            return 0;
        };

        $scope.ActualOrderedItem = function (ActualItem) {
            for (var count = 0; count < $scope.patientdispenseDetails.length; count++) {
                var cllitem = $scope.patientdispenseDetails[count];
                if (cllitem.ItemMasterId == ActualItem.ItemMasterId) {
                    cllitem.DispensedQuantity = 0;
                    cllitem.Quantity = 0;
                    cllitem.NetAmount = 0;
                    cllitem.IsFullyDispensed = true;

                    cllitem.CanOpenAlternates = true;
                    cllitem.CanViewStock = false;
                    cllitem.CanDelete = true;

                    cllitem.IsAlternateIssued = true;
                }
            }
        };

        $scope.deleteStockDispenseDetail = function (idx, selectedItem) {
            if (selectedItem.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.ItemMasterId != -1) {
                item.Status = 2;
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
                return false;
            }

            var reqcount = 0;
            for (var count = 0; count < $scope.patientdispenseDetails.length; count++) {
                var cllitem = $scope.patientdispenseDetails[count];
                if (cllitem.Status == 1 && cllitem.ReqItemMasterId == item.ReqItemMasterId) {
                    reqcount = reqcount + 1;
                }
            }

            if (reqcount == 0) {
                for (var count1 = 0; count1 < $scope.patientdispenseDetails.length; count1++) {
                    var cllitem1 = $scope.patientdispenseDetails[count1];
                    if (cllitem1.ItemMasterId == item.ReqItemMasterId) {
                        cllitem1.IsFullyDispensed = false;
                        cllitem1.CanOpenAlternates = false;
                        cllitem1.CanViewStock = false;
                        cllitem1.CanDelete = true;
                        cllitem1.IsAlternateIssued = false;
                    }
                }
            }

            $scope.item.OtherCharges = 0;
            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalDiscountAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmount = 0;
            $scope.item.TotalAmount = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalNetAmountBeforeGst = 0;
            $scope.DispensedValue = 0;

            calculatetotalAmount();
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

                if (item.SubCategoryId == 1) {
                    item.ServiceGroupId = $scope.DrugServiceGroupId;
                    item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                } else if (item.SubCategoryId == 2) {
                    item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                    item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                } else {
                    item.ServiceGroupId = 0;
                    item.ServiceCategoryId = 0;
                }

                utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.notemptyqty.lbl'));
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

                if (item.SubCategoryId == 1) {
                    item.ServiceGroupId = $scope.DrugServiceGroupId;
                    item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                } else if (item.SubCategoryId == 2) {
                    item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                    item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                } else {
                    item.ServiceGroupId = 0;
                    item.ServiceCategoryId = 0;
                }

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

                    if (item.SubCategoryId == 1) {
                        item.ServiceGroupId = $scope.DrugServiceGroupId;
                        item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    } else if (item.SubCategoryId == 2) {
                        item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                        item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                    } else {
                        item.ServiceGroupId = 0;
                        item.ServiceCategoryId = 0;
                    }

                    utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.enterqty.lbl'));

                    return false;
                } else {
                    item.GrossAmount = item.MrPrice * item.DispensedQuantity;
                    item.NetAmount = item.MrPrice * item.DispensedQuantity;
                    item.Quantity = item.DispensedQuantity;
                    item.TransitQuantity = item.DispensedQuantity;

                    if (item.SubCategoryId == 1) {
                        item.ServiceGroupId = $scope.DrugServiceGroupId;
                        item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    } else if (item.SubCategoryId == 2) {
                        item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                        item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                    } else {
                        item.ServiceGroupId = 0;
                        item.ServiceCategoryId = 0;
                    }

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
                    item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                    item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);
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
            $scope.NetPatientAmt = 0;
            $scope.NetInsuranceAmt = 0;
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
                    $scope.NetPatientAmt = parseFloat(($scope.NetPatientAmt + activeitem.PatNetAmount).toFixed(4));
                    $scope.NetInsuranceAmt = parseFloat(($scope.NetInsuranceAmt + activeitem.InsNetAmount).toFixed(4));
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
            $scope.item.NetPatientAmount = $scope.NetPatientAmt;
            $scope.item.NetInsuranceAmount = $scope.NetInsuranceAmt;
        }

        $scope.SaveandDraft = function () {
            $scope.item.DispenseStatusId = 1;
            $scope.saveItem();
        };

        $scope.Dispense = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.patientdispense-form.dispensemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onDispenseConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onDispenseConfirmed = function () {
            $scope.item.DispenseStatusId = 2;
            $scope.item.PatientStockRequestId = $scope.currentcontext.patientstockrequestid;
            $scope.item.DispensedBy = utl.Session.getCurrentUserId();
            $scope.item.DispenseDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function () {
            $scope.item.DispenseStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.DispenseStatusId = 4;
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.DispenseStatusId = 3;
            $scope.saveItem();
        };

        $scope.CancelTransfer = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.patientdispense-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.Complete = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.patientdispense-form.completemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCompleteConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCompleteConfirmed = function () {
            $scope.completePatientRequest();
        };

        $scope.completePatientRequest = function () {
            var actionName = 'IPManagement/PatientStockRequests/CompletePatientStockRequest';
            $scope.currentrequest.Id = $scope.currentcontext.patientstockrequestid;
            $scope.currentrequest.PatientRequestStatusId = 5;
            $scope.currentrequest.PrescriptionId = $scope.item.PrescriptionId;
            var lines = null;
            var inputData = {
                Header: $scope.currentrequest,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.completePatientRequestCallback
            };
            utl.Http.doAction(options);
        };

        $scope.completePatientRequestCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.Reject = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.patientdispense-form.rejectmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onRejectConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onRejectConfirmed = function () {
            $scope.rejectPatientRequest();
        };

        $scope.rejectPatientRequest = function () {
            var actionName = 'IPManagement/PatientStockRequests/RejectPatientStockRequest';
            $scope.currentrequest.Id = $scope.currentcontext.patientstockrequestid;
            $scope.currentrequest.PatientRequestStatusId = 7;
            $scope.currentrequest.PrescriptionId = $scope.item.PrescriptionId;
            var lines = null;
            var inputData = {
                Header: $scope.currentrequest,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.rejectPatientRequestCallback
            };
            utl.Http.doAction(options);
        };

        $scope.rejectPatientRequestCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.errorItemCallback = function (data, options) {
            console.log(data);
            if (data.Error.Message) {
                var message = data.Error.Message;

                if (message.includes('Stock Changes Happened') == true) {
                    message = message.replace("Stock Changes Happened for ", "");
                    let error_items = message.split("$,$");
                    for (var idx in error_items) {
                        let item = error_items[idx];
                        let item_det = item.split(":");
                        var itemid = Number(item_det[0]);

                        $scope.patientdispenseDetails.forEach(function (elem, index, array) {
                            if (elem.ItemMasterId === itemid) {
                                $scope.patientdispenseDetails[index].removeEntry = true;
                            } else {
                                $scope.patientdispenseDetails[index].removeEntry = false;
                            }
                            // return indexesOf12
                        });
                        // console.log(find_index);
                        // if (find_index != -1) {
                        //     $scope.PatientBillDetails[find_index].removeEntry = true;
                        // }
                    }
                    console.log($scope.patientdispenseDetails); //return;
                } else if (message.includes('Error in Dispense') == true) {
                    message = message.replace("Error in Dispense ", "");
                    let error_items = message.split("$,$");
                    for (var idx in error_items) {
                        let item = error_items[idx];
                        let item_det = item.split(":");
                        var itemid = Number(item_det[0]);

                        $scope.patientdispenseDetails.forEach(function (elem, index, array) {
                            if (elem.ItemMasterId === itemid) {
                                $scope.patientdispenseDetails[index].removeEntry = true;
                            } else {
                                $scope.patientdispenseDetails[index].removeEntry = false;
                            }
                            // return indexesOf12
                        });
                        // console.log(find_index);
                        // if (find_index != -1) {
                        //     $scope.PatientBillDetails[find_index].removeEntry = true;
                        // }
                    }
                    console.log($scope.patientdispenseDetails); //return;
                }
                else if (message.includes('Stock Already Transfered') == true) {
                    $scope.backToList();
                } else if (message.includes('Medicine Already Dispensed') == true) {
                    $scope.backToList();
                } else {
                    console.log(message);
                }
                console.log($scope.patientdispenseDetails); //return;

            }
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.AdmissionStatusId === 5) {
                utl.Alert.showErrorMsg($translate.instant('billing.patientdispense-form.financedischarge.lbl'));
                return false;
            } else if ($scope.item.AdmissionStatusId === 6) {
                utl.Alert.showErrorMsg($translate.instant('billing.patientdispense-form.physicaldischarge.lbl'));
                return false;
            } else {
                if ($scope.item.IsBillLock == true) {
                    //     if ($scope.currentcontext.isAutoBillLock == 1 && $scope.selectedEncounter.GuarantorId == 1) { console.log('Allow Dispense') } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.patientdispense-form.billlock.lbl'));

                    return false;
                    //     }
                }
            }

            var AtLeatOneItem = 0;
            var PatientRequestStatusCheck = 0;
            var PatientRequestedQtyCheck = 0;
            var PatientRequestedItemName = null;
            var CheckExpiry = 0;
            for (var preqidx in $scope.patientstockrequestDetails) {
                var preqitem = $scope.patientstockrequestDetails[preqidx];
                var BalanceOfRequestedQty = preqitem.RequestedQuantity - preqitem.DispensedQuantity;
                if (BalanceOfRequestedQty < 0)
                    BalanceOfRequestedQty = 0;
                var DispQty = 0;
                for (var dispidx in $scope.patientdispenseDetails) {
                    var dispitem = $scope.patientdispenseDetails[dispidx];
                    if (dispitem.ItemMasterId > 0 && dispitem.Status == 1) {
                        if (dispitem.DispensedQuantity > 0) {
                            AtLeatOneItem = 1;
                        }
                    }
                    if (dispitem.ExpiryStop) {
                        CheckExpiry = 1;
                        PatientRequestedItemName = preqitem.ItemName;
                    }
                    /*
                    if (dispitem.ItemMasterId > 0 &&
                        dispitem.Status == 1 &&
                        dispitem.ItemMasterId == preqitem.ItemMasterId) {
                        DispQty = DispQty + dispitem.DispensedQuantity;
                    }
                    */
                    if (dispitem.ItemMasterId > 0 && dispitem.Status == 1 &&
                        dispitem.ReqItemMasterId == 0 && dispitem.ItemMasterId == preqitem.ItemMasterId) {
                        var AlternateQuantity = 0;
                        if (dispitem.IsAlternateIssued) {
                            for (var didx in $scope.patientdispenseDetails) {
                                var ditem = $scope.patientdispenseDetails[didx];
                                if (ditem.ReqItemMasterId == dispitem.ItemMasterId) {
                                    AlternateQuantity = AlternateQuantity + ditem.DispensedQuantity;
                                }
                            }
                        }
                        DispQty = DispQty + AlternateQuantity + dispitem.DispensedQuantity;
                    }
                }

                if (BalanceOfRequestedQty > DispQty) {
                    PatientRequestStatusCheck = 1;
                }

                if (BalanceOfRequestedQty < DispQty) {
                    PatientRequestedQtyCheck = 1;
                    PatientRequestedItemName = preqitem.ItemName;
                    break;
                } else {
                    continue;
                }
            }

            if (AtLeatOneItem === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.patientdispense-form.quantity.lbl'));

                return false;
            }

            if (PatientRequestStatusCheck === 1) {
                $scope.item.PatientRequestStatusId = 4;
            } else {
                $scope.item.PatientRequestStatusId = 5;
            }

            if (PatientRequestedQtyCheck === 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.patientdispense-form.requestedquantity.lbl' + PatientRequestedItemName));

                return false;
            }

            var lines = getLinesForSave();

            var actionName = 'billing/patientdispense/AddPatientDispense';
            if ($scope.currentcontext.patientdispenseid && $scope.currentcontext.patientdispenseid > 0) {
                actionName = 'billing/patientdispense/UpdatePatientDispense';
            }

            var inputData = {
                Header: $scope.item,
                Details: lines
            };
            console.log(inputData);
            // return;
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.patientdispenseDetails) {
                var item = $scope.patientdispenseDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1 && item.DispensedQuantity > 0) {
                    item.StoreMasterId = $scope.item.StoreMasterId;
                    item.DepartmentId = $scope.item.DepartmentId;
                    item.FacilityId = $scope.item.FacilityId;
                    item.OrganizationId = 1;
                    item.DoctorId = $scope.item.DoctorId;
                    item.DoctorName = $scope.item.DoctorName;

                    if (item.SubCategoryId == 1) {
                        item.ServiceGroupId = $scope.DrugServiceGroupId;
                        item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    } else if (item.SubCategoryId == 2) {
                        item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                        item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                    }
                    if (!item.ServiceCategoryId) {
                        item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                    }

                    if (!item.IsSupplementary)
                        item.IsSupplementary = false;
                    if (!item.IsNonClaimable || item.IsNonClaimable == false) {
                        if ($scope.item.CoPayPercent) {
                            item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                            item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);
                        }
                        if (!$scope.item.CoPayPercent) {
                            item.InsNetAmount = parseFloat(item.NetAmount);
                        }
                    } else {
                        if ($scope.item.GuarantorTypeId > 1) {
                            item.PatNetAmount = parseFloat(item.NetAmount);
                            item.InsNetAmount = 0;
                            item.IsSupplementary = true;
                        }
                    }

                    result.push(item);
                }

                if (item.ItemMasterId > 0 && item.Status == 1) {
                    if (item.IsAlternateIssued) {
                        item.StoreMasterId = $scope.item.StoreMasterId;
                        item.DepartmentId = $scope.item.DepartmentId;
                        item.FacilityId = $scope.item.FacilityId;
                        item.OrganizationId = 1;
                        item.DoctorId = $scope.item.DoctorId;
                        item.DoctorName = $scope.item.DoctorName;

                        if (item.SubCategoryId == 1) {
                            item.ServiceGroupId = $scope.DrugServiceGroupId;
                            item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                        } else if (item.SubCategoryId == 2) {
                            item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                            item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                        }
                        if (item.IsNonClaimable == false) {
                            if ($scope.item.CoPayPercent) {
                                item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                                item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);
                            }
                            if (!$scope.item.CoPayPercent) {
                                item.InsNetAmount = parseFloat(item.NetAmount);
                            }
                        } else {
                            item.PatNetAmount = parseFloat(item.NetAmount);
                            item.InsNetAmount = 0;
                            item.IsSupplementary = true;
                        }
                        result.push(item);
                    }

                }
            }
            return result;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.patientdispenseid = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.patientdispenseid = data;
            }
            $scope.print();
            $scope.getPatientDispenseInfoById();
        };

        $scope.backToList = function () {
            $state.go('app.dispenseworklisttab.dispenseworklists', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientRequestInfoById();
                $scope.getPatientDispenseDetails();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    //$scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                    //$scope.item.StoreSubTypeId = value[0].StoreMaster.StoreSubTypeId;
                    //$scope.item.SequenceOptionId = value[0].StoreMaster.SequenceOptionId;
                    $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                    $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                }
                if (key == 'ServiceCategory' && !$scope.currentcontext.issurgery) {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'DRUG') {
                            $scope.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'NONDRUG') {
                            $scope.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
                if (key == 'ServiceCategory' && $scope.currentcontext.issurgery) {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'OTDRUG') {
                            $scope.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'OTNONDRUG') {
                            $scope.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });
            loadData();
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
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "DispenseType"
            },
            {
                "Key": "DispenseStatus"
            },
            {
                "Key": "ServiceCategory"
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
            ];

            $scope.getLookUp(inputData);
            // loadData();
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

    PatientDispenseFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();