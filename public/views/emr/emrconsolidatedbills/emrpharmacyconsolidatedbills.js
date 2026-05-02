(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('EmrpharmabilldetailsController', EmrpharmabilldetailsController);

    function EmrpharmabilldetailsController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.currentcontext = {};
        $scope.canShowDMPrintBtn = false;
        $scope.currentfilter = {
            FromBillDate: utl.Formatter.getCurrentDate(),
            ToBillDate: utl.Formatter.getCurrentDate(),
            DueApprovedById: -1,
            PharmacySaleTypeId: -1,
            TotalAmount: 0,
            TotalSalesAmount: 0,
            TotalReturnAmount: 0,
            IsOutStanding: false,
            NotOutStanding: false
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentfilter.PatientId = $scope.currentcontext.pid;
        $scope.Details = [];
        $scope.PatientBillsWithReturn = [];
        $scope.PatientPharmacyBills = [];
        $scope.PatientPharmacyReturns = [];
        $scope.SalesSerialNo = 0;
        $scope.ReturnSerialNo = 0;
        var PatientBillIds = Array();
        var PatientReturnIds = Array();
        $scope.currentcontext.selectallchk = true;
        $scope.currentcontext.selectallchk1 = true;
        $scope.SelectAll = function(chk) {
            for (var idx in $scope.PatientPharmacyBills) {
                $scope.PatientPharmacyBills[idx].select = chk;
            }
        };

        $scope.SelectAll1 = function(chk) {
            for (var idx in $scope.PatientPharmacyReturns) {
                $scope.PatientPharmacyReturns[idx].select1 = chk;
            }
        };

        $scope.UncheckCash = function() {
            $scope.currentfilter.NotOutStanding = false;
            $scope.getPharmacyBills();
        };

        $scope.UncheckCredit = function() {
            $scope.currentfilter.IsOutStanding = false;
            $scope.getPharmacyBills();
        };

        $scope.getPharmacyBillsCallback = function(scope, data, options, hasError) {
            $scope.SalesSerialNo = 0;
            $scope.ReturnSerialNo = 0;
            $scope.PatientPharmacyBills = [];
            $scope.PatientPharmacyReturns = [];
            $scope.PatientBillsWithReturn = data;
            $scope.currentfilter.TotalAmount = 0;
            $scope.currentfilter.TotalSalesAmount = 0;
            $scope.currentfilter.TotalReturnAmount = 0;
            for (var i = 0; i < $scope.PatientBillsWithReturn.length; i++) {
                var item = $scope.PatientBillsWithReturn[i];
                if (item.ReturnNumber && item.ReturnNumber != undefined &&
                    item.ReturnNumber != null && item.ReturnNumber != '') {
                    item.ReturnSerialNo = $scope.ReturnSerialNo + 1;
                    if (item.ReturnAmount == 0 && item.GrossAmount > 0) {
                        item.ReturnAmount = item.GrossAmount;
                    }
                    item.NetReturnAmount = item.ReturnAmount - item.DiscountAmount;
                    item.NetReturnAmount = Math.round(item.NetReturnAmount);
                    $scope.currentfilter.TotalReturnAmount = $scope.currentfilter.TotalReturnAmount + item.NetReturnAmount;
                    $scope.PatientPharmacyReturns.push(item);
                    $scope.ReturnSerialNo++;
                } else {
                    item.SalesSerialNo = $scope.SalesSerialNo + 1;
                    item.NetAmount = item.BillAmount - item.BillDiscount;
                    item.NetAmount = Math.round(item.NetAmount);
                    $scope.currentfilter.TotalSalesAmount = $scope.currentfilter.TotalSalesAmount + item.NetAmount;
                    $scope.PatientPharmacyBills.push(item);
                    $scope.SalesSerialNo++;
                }
            }
            $scope.SelectAll($scope.currentcontext.selectallchk);
            $scope.SelectAll1($scope.currentcontext.selectallchk1);
            $scope.canShowDMPrintBtn = true;
            $scope.currentfilter.TotalAmount = $scope.currentfilter.TotalSalesAmount - $scope.currentfilter.TotalReturnAmount;
        };

        $scope.getPharmacyBills = function() {
            if ($scope.currentfilter.PatientId > 0) {
                var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputData = {
                    Data: {
                        PatientId: $scope.currentfilter.PatientId,
                        PharmacySaleTypeId: $scope.currentfilter.PharmacySaleTypeId,
                        DueApprovedById: $scope.currentfilter.DueApprovedById,
                        FromDate: FromDate,
                        ToDate: ToDate,
                        IsOutStanding: $scope.currentfilter.IsOutStanding,
                        NotOutStanding: $scope.currentfilter.NotOutStanding
                    }
                };

                var options = {
                    action: 'billing/PatientBills/getPharmacyBillsWithReturn',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPharmacyBillsCallback
                };

                utl.Http.doAction(options);
            } else {
                utl.Alert.showSuccessMsg('billing.pharmacy-billdetails.process.lbl');
            }
        };

        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.PatientPharmacyBills) {
                if ($scope.PatientPharmacyBills[idx].select) {
                    currentSelection.push($scope.PatientPharmacyBills[idx]);
                }
            }
            return currentSelection;
        }

        function getSelectionRowsForReturn() {
            var currentSelection = [];
            for (var idx in $scope.PatientPharmacyReturns) {
                if ($scope.PatientPharmacyReturns[idx].select1) {
                    currentSelection.push($scope.PatientPharmacyReturns[idx]);
                }
            }
            return currentSelection;
        }

        $scope.Print = function() {
            $scope.Details = getSelectionRows();
            var ids = [];
            for (var idx in $scope.Details) {
                var currentBill = $scope.Details[idx];
                ids.push(currentBill.Id);
            }
            if (ids.length > 0) {
                var actionName = 'billing/patientbills/PrintConsolidatedPharmacybilldetails';
                var options = {
                    action: actionName,
                    data: {
                        Data: ids
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.dmPrintForPharmacyBillsWithReturn = function() {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg('billing.pharmacy.preferencesetting.lbl');
                return false;
            } else {
                PatientBillIds = [];
                PatientReturnIds = [];
                var selectedRows = getSelectionRows();
                for (var index in selectedRows) {
                    PatientBillIds.push(selectedRows[index].Id);
                }
                var selectedRowsForReturn = getSelectionRowsForReturn();
                for (var index1 in selectedRowsForReturn) {
                    PatientReturnIds.push(selectedRowsForReturn[index1].Id);
                }
                var inputData = {
                    Data: {
                        PatientBillIds: PatientBillIds,
                        PatientReturnIds: PatientReturnIds,
                        PatientId: $scope.currentfilter.PatientId
                    }
                };
                var options = {
                    action: 'billing/patientbills/DMPrintPharmacyBillsWithReturn',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintForPharmacyBillsWithReturnCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintForPharmacyBillsWithReturnCallback = function(scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintDataForSalesWithReturn(data);
            $scope.printPharmacyConsolidatedBill(dmPrintInput);
        };

        function preparePrintDataForSalesWithReturn(data) {
            console.log('preparePrintDataForSalesWithReturn starts');

            var vIPOPNO = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vPAddressLine1 = '';
            var vPAddressLine2 = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vFDOB = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var vGuarantorName = '';

            if (data.PatientData) {
                if (data.PatientData.Title) vPTitle = data.PatientData.Title.Description;
                if (data.PatientData.FirstName) vPFirstName = data.PatientData.FirstName;
                if (data.PatientData.LastName) vPLastName = data.PatientData.LastName;
                if (data.PatientData.MRN) vMRN = data.PatientData.MRN;
                if (data.PatientData.Age) vAge = '' + data.PatientData.Age;
                if (data.PatientData.DOB) vDOB = '' + data.PatientData.DOB;
                if (data.PatientData.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientData.DOB);
                if (data.PatientData.Gender) vGender = '' + data.PatientData.Gender.Description;
                if (data.PatientData.AddressLine1) vPAddressLine1 = data.PatientData.AddressLine1;
                if (data.PatientData.AddressLine2) vPAddressLine2 = data.PatientData.AddressLine2;
            }

            if (data.Encounter) vIPOPNO = '' + data.Encounter.VisitIdentifier;
            if (data.Encounter) vDrName = '' + data.Encounter.DoctorName;
            if (data.Encounter.PatientGuarantor) {
                if (data.Encounter.PatientGuarantor.GuarantorName) vGuarantorName = '' + data.Encounter.PatientGuarantor.GuarantorName;
            }

            var dmPrintInput = {};
            dmPrintInput.header = {
                PatientName: vPTitle +
                    vPFirstName + ' ' + vPLastName,
                MRN: vMRN,
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                DrName: vDrName,
                AgeGender: vAge + ' Y / ' + vGender,
                Address: vPAddressLine1 + ',' + vPAddressLine2
            };
            var TotalSalesAmount = 0;
            var TotalReturnAmount = 0;
            var TotalAmount = 0;
            var TinNo = '';
            var LicenseNo = '';

            dmPrintInput.PharmacyBills = [];
            var islno = 1;
            for (var index in data.PharmacyBillsDetails) {
                var PharmacyBill = data.PharmacyBillsDetails[index];
                var BillNumber = PharmacyBill.BillNumber;
                //var BillDateTime = PharmacyBill.BillDateTime;

                var BillDate = utl.Formatter.getDateString(PharmacyBill.BillDateTime);
                var BillDateTime = new Date(PharmacyBill.BillDateTime);
                var Minutes = BillDateTime.getMinutes();
                var Hours = BillDateTime.getHours();
                var Meridiem = 'AM';
                if (Hours > 12 || Hours == 12) {
                    Meridiem = 'PM';
                    Hours = Hours - 12;
                }
                if (Hours < 10) {
                    Hours = '0' + Hours;
                }
                if (Minutes < 10) {
                    Minutes = '0' + Minutes;
                }
                var BillTime = Hours + ':' + Minutes + ' ' + Meridiem;
                var BillDateWithTime = BillDate + ' ' + BillTime;


                var BillAmount = PharmacyBill.BillAmount.toFixed(2);
                var BillDiscount = PharmacyBill.BillDiscount.toFixed(2);
                var RoundOffValue = PharmacyBill.RoundOffValue.toFixed(2);
                var BillNetAmount = BillAmount - BillDiscount;
                BillNetAmount = Math.round(BillNetAmount);
                BillNetAmount = BillNetAmount.toFixed(2);
                var vBillDoctorName = PharmacyBill.DoctorName;
                var vBillDoctorId = PharmacyBill.DoctorId;
                var vUTitle = '';
                var vUFirstName = '';
                var vULastName = '';
                var vCTitle = '';
                var vCFirstName = '';
                var vCLastName = '';
                var vCreatedUser = '';

                TotalSalesAmount = TotalSalesAmount + PharmacyBill.BillAmount;
                if (TinNo == '' || TinNo == undefined || TinNo == null) {
                    TinNo = PharmacyBill.StoreMaster.TinNo;
                }
                if (LicenseNo == '' || LicenseNo == undefined || LicenseNo == null) {
                    LicenseNo = PharmacyBill.StoreMaster.LicenseNo;
                }

                if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                    if (PharmacyBill.GuarantorMaster) {
                        if (PharmacyBill.GuarantorMaster.GuarantorName) vGuarantorName = '' + PharmacyBill.GuarantorMaster.GuarantorName;
                    }
                }

                if (vBillDoctorName == '' || vBillDoctorName == undefined || vBillDoctorName == null) {
                    if (PharmacyBill.User) {
                        if (PharmacyBill.User.Title) vUTitle = PharmacyBill.User.Title.Description;
                        if (PharmacyBill.User.FirstName) vUFirstName = PharmacyBill.User.FirstName;
                        if (PharmacyBill.User.LastName) vULastName = PharmacyBill.User.LastName;
                        vBillDoctorName = (vUTitle + '.' + vUFirstName + ' ' + vULastName);
                    }
                }
                if (PharmacyBill.CreatedUser) {
                    if (PharmacyBill.CreatedUser.Title) vCTitle = PharmacyBill.CreatedUser.Title.Description;
                    if (PharmacyBill.CreatedUser.FirstName) vCFirstName = PharmacyBill.CreatedUser.FirstName;
                    if (PharmacyBill.CreatedUser.LastName) vCLastName = PharmacyBill.CreatedUser.LastName;
                    vCreatedUser = vCTitle + '.' + vCFirstName + ' ' + vCLastName;
                }

                var SalesDetail = {
                    ispace: ' ',
                    slno: islno++,
                    BillNumber: BillNumber,
                    BillDateTime: BillDateTime,
                    BillAmount: BillAmount,
                    BillDiscount: BillDiscount,
                    RoundOffValue: RoundOffValue,
                    BillNetAmount: BillNetAmount,
                    BillDoctorName: vBillDoctorName,
                    BillDoctorId: vBillDoctorId,
                    CreatedUser: vCreatedUser,
                    BillDateWithTime: BillDateWithTime
                };

                dmPrintInput.PharmacyBills.push(SalesDetail);
            }

            dmPrintInput.PharmacyReturns = [];
            var IsDisplayReturns = true;
            var islno1 = 1;
            if (data.PharmacyReturnDetails.length > 0) {
                for (var index1 in data.PharmacyReturnDetails) {
                    var PharmacyReturn = data.PharmacyReturnDetails[index1];

                    var ReturnNumber = PharmacyReturn.ReturnNumber;
                    //var ReturnDateTime = PharmacyReturn.ReturnDateTime;

                    var ReturnDate = utl.Formatter.getDateString(PharmacyReturn.ReturnDateTime);
                    var ReturnDateTime = new Date(PharmacyReturn.ReturnDateTime);
                    var ReturnMinutes = ReturnDateTime.getMinutes();
                    var ReturnHours = ReturnDateTime.getHours();
                    var ReturnMeridiem = 'AM';
                    if (ReturnHours > 12 || ReturnHours == 12) {
                        ReturnMeridiem = 'PM';
                        ReturnHours = ReturnHours - 12;
                    }
                    if (ReturnHours < 10) {
                        ReturnHours = '0' + ReturnHours;
                    }
                    if (ReturnMinutes < 10) {
                        ReturnMinutes = '0' + ReturnMinutes;
                    }
                    var ReturnTime = ReturnHours + ':' + ReturnMinutes + ' ' + ReturnMeridiem;
                    var ReturnDateWithTime = ReturnDate + ' ' + ReturnTime;

                    var BillNumberAgainstReturn = PharmacyReturn.BillNumber;
                    //var BillDateTimeAgainstReturn = PharmacyReturn.BillDateTime;

                    var BillDateAgainstReturn = utl.Formatter.getDateString(PharmacyReturn.BillDateTime);
                    var BillDateTimeAgainstReturn = new Date(PharmacyReturn.BillDateTime);
                    var MinutesAgainstReturn = BillDateTimeAgainstReturn.getMinutes();
                    var HoursAgainstReturn = BillDateTimeAgainstReturn.getHours();
                    var MeridiemAgainstReturn = 'AM';
                    if (HoursAgainstReturn > 12 || HoursAgainstReturn == 12) {
                        MeridiemAgainstReturn = 'PM';
                        HoursAgainstReturn = HoursAgainstReturn - 12;
                    }
                    if (HoursAgainstReturn < 10) {
                        HoursAgainstReturn = '0' + HoursAgainstReturn;
                    }
                    if (MinutesAgainstReturn < 10) {
                        MinutesAgainstReturn = '0' + MinutesAgainstReturn;
                    }
                    var BillTimeAgainstReturn = HoursAgainstReturn + ':' + MinutesAgainstReturn + ' ' + MeridiemAgainstReturn;
                    var BillDateWithTimeAgainstReturn = BillDateAgainstReturn + ' ' + BillTimeAgainstReturn;

                    if (PharmacyReturn.ReturnAmount == 0 && PharmacyReturn.GrossAmount > 0) {
                        PharmacyReturn.ReturnAmount = PharmacyReturn.GrossAmount;
                    }

                    var ReturnAmount = PharmacyReturn.ReturnAmount.toFixed(2);
                    var DiscountAmount = PharmacyReturn.DiscountAmount.toFixed(2);
                    var RoundOffValue = PharmacyReturn.RoundOffValue.toFixed(2);
                    var ReturnNetAmount = ReturnAmount - DiscountAmount;
                    ReturnNetAmount = Math.round(ReturnNetAmount);
                    ReturnNetAmount = ReturnNetAmount.toFixed(2);
                    var vReturnDoctorId = PharmacyReturn.DoctorId;
                    var vReturnDoctorName = ''
                    var vReturnUTitle = '';
                    var vReturnUFirstName = '';
                    var vReturnULastName = '';
                    var vReturnCTitle = '';
                    var vReturnCFirstName = '';
                    var vReturnCLastName = '';
                    var vReturnCreatedUser = '';

                    TotalReturnAmount = TotalReturnAmount + PharmacyReturn.ReturnAmount;

                    if (PharmacyReturn.User) {
                        if (PharmacyReturn.User.Title) vReturnUTitle = PharmacyReturn.User.Title.Description;
                        if (PharmacyReturn.User.FirstName) vReturnUFirstName = PharmacyReturn.User.FirstName;
                        if (PharmacyReturn.User.LastName) vReturnULastName = PharmacyReturn.User.LastName;
                        vReturnDoctorName = (vReturnUTitle + '.' + vReturnUFirstName + ' ' + vReturnULastName);
                    }

                    if (PharmacyReturn.CreatedUser) {
                        if (PharmacyReturn.CreatedUser.Title) vReturnCTitle = PharmacyReturn.CreatedUser.Title.Description;
                        if (PharmacyReturn.CreatedUser.FirstName) vReturnCFirstName = PharmacyReturn.CreatedUser.FirstName;
                        if (PharmacyReturn.CreatedUser.LastName) vReturnCLastName = PharmacyReturn.CreatedUser.LastName;
                        vReturnCreatedUser = vReturnCTitle + '.' + vReturnCFirstName + ' ' + vReturnCLastName;
                    }

                    var ReturnDetail = {
                        ispace: ' ',
                        slno1: islno1++,
                        ReturnNumber: ReturnNumber,
                        ReturnDateTime: ReturnDateTime,
                        BillNumberAgainstReturn: BillNumberAgainstReturn,
                        BillDateTimeAgainstReturn: BillDateTimeAgainstReturn,
                        ReturnAmount: ReturnAmount,
                        DiscountAmount: DiscountAmount,
                        RoundOffValue: RoundOffValue,
                        ReturnNetAmount: ReturnNetAmount,
                        ReturnDoctorId: vReturnDoctorId,
                        vReturnDoctorName: vReturnDoctorName,
                        vReturnCreatedUser: vReturnCreatedUser,
                        ReturnDateWithTime: ReturnDateWithTime,
                        BillDateWithTimeAgainstReturn: BillDateWithTimeAgainstReturn
                    };

                    dmPrintInput.PharmacyReturns.push(ReturnDetail);
                }
            } else {
                IsDisplayReturns = false;
            }

            TotalSalesAmount = Math.round(TotalSalesAmount);
            TotalSalesAmount = TotalSalesAmount.toFixed(2);
            TotalReturnAmount = Math.round(TotalReturnAmount);
            TotalReturnAmount = TotalReturnAmount.toFixed(2);
            TotalAmount = TotalSalesAmount - TotalReturnAmount;
            TotalAmount = Math.round(TotalAmount);
            TotalAmount = TotalAmount.toFixed(2);

            dmPrintInput.summary = {
                TotalSalesAmount: TotalSalesAmount,
                TotalReturnAmount: TotalReturnAmount,
                TotalAmount: TotalAmount,
                IsDisplayReturns: IsDisplayReturns,
                TinNo: TinNo,
                LicenseNo: LicenseNo,
                GuarantorName: vGuarantorName
            };

            console.log('preparePrintDataForSalesWithReturn ends');
            return dmPrintInput;
        }

        /* Pharmacy dotmatrix print starts */
        $scope.dmPrint = function() {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg('billing.pharmacy.preferencesetting.lbl');

                return false;
            } else {

                var selectedRows = getSelectionRows();
                for (var idx in selectedRows) {
                    var options = {
                        action: 'billing/patientbills/DMPrintPatientBills',
                        data: selectedRows[idx],
                        type: 'post',
                        onComplete: $scope.dmPrintCallback
                    };
                }
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function(scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            $scope.printPharmacyBillDetails(dmPrintInput);
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');
            var dmAllPrintInput = [];
            var selectedRows = getSelectionRows();
            for (var idx in selectedRows) {
                var currentBill = selectedRows[idx];
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
                var vDrName = '';
                var vStoreheading1 = '';
                var vStoreheading2 = '';
                var vStoreheading3 = '';
                var vStoreheading4 = '';

                if (currentBill.Encounter) vIPOPNO = '' + currentBill.Encounter.VisitIdentifier;
                if (currentBill.Facility) vGST = '' + currentBill.Facility.GstNumber;



                if (currentBill.User) {
                    if (currentBill.User.Title) vUTitle = currentBill.User.Title.Description;
                    if (currentBill.User.FirstName) vUFirstName = currentBill.User.FirstName;
                    if (currentBill.User.LastName) vULastName = currentBill.User.LastName;
                    vDrName = (vUTitle + '.' + vUFirstName + ' ' + vULastName)
                }
                if (currentBill.CreatedUser) {
                    if (currentBill.CreatedUser.Title) vCTitle = currentBill.CreatedUser.Title.Description;
                    if (currentBill.CreatedUser.FirstName) vCFirstName = currentBill.CreatedUser.FirstName;
                    if (currentBill.CreatedUser.LastName) vCLastName = currentBill.CreatedUser.LastName;
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
                    if (currentBill.Title)
                        vPTitle = currentBill.Title.Description;
                    vPFirstName = currentBill.PatientName;
                    if (currentBill.Age)
                        vAge = '' + currentBill.Age;
                    if (currentBill.Gender)
                        vGender = '' + currentBill.Gender.Description;
                    if (currentBill.DoctorName)
                        vDrName = '' + currentBill.DoctorName;
                }



                if (currentBill.StoreMaster) vTinNo = currentBill.StoreMaster.TinNo;


                var vPayTypeId = -1;

                if (currentBill.PatientPaymentDetails)
                    for (var idxpy in currentBill.PatientPaymentDetails)
                        vPayTypeId = currentBill.PatientPaymentDetails[idxpy].PaymentTypeId;

                if (data.PrintData.heading1)
                    vStoreheading1 = data.PrintData.heading1
                if (data.PrintData.heading2)
                    vStoreheading2 = data.PrintData.heading2
                if (data.PrintData.heading3)
                    vStoreheading3 = data.PrintData.heading3
                if (data.PrintData.heading4)
                    vStoreheading4 = data.PrintData.heading4

                var dmPrintInput = {};
                dmPrintInput.header = {
                    prescribedby: vDrName || '',
                    licenseno: '' + currentBill.StoreMaster.LicenseNo,
                    billno: '' + currentBill.BillNumber,
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
                    billdate: utl.Formatter.getDateTimeString(currentBill.BillDateTime),
                    // addressline: currentBill.Patient.AddressLine1,
                    // state: currentBill.Patient.State,
                    // city: currentBill.Patient.City,
                    // pincode: '' + currentBill.Patient.Pincode || '',
                    totalamount: currentBill.BillAmount,
                    totDiscont: currentBill.BillDiscount,
                    totroundoff: currentBill.RoundOffValue,
                    totpaidamt: currentBill.PaidAmount,
                    billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName,
                    paytypeid: vPayTypeId || -1,
                    vStoreheading1: vStoreheading1,
                    vStoreheading2: vStoreheading2,
                    vStoreheading3: vStoreheading3,
                    vStoreheading4: vStoreheading4
                };

                dmPrintInput.lines = [];
                var islno = 1;
                for (var idx1 in currentBill.PatientBillDetails) {
                    var billDetail = currentBill.PatientBillDetails[idx1];
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
                        qty: billDetail.Quantity,
                        mrp: billDetail.Rate.toFixed(2),
                        value: billDetail.NetAmountBeforeGST.toFixed(2),
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

                dmAllPrintInput.push(dmPrintInput);
            }
            console.log('preparePrintData ends');
            return dmAllPrintInput;
        }
        /* Pharmacy dotmatrix print ends */

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var InPatientSaleType = {
                Code: "Credit-InPatient",
                Id: 6,
                IsDefault: true,
                Language: null,
                Text: "Credit InPatient"
            }
            $scope.lookup["PharmacySaleType"].push(InPatientSaleType);
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "PharmacySaleType"
                },
                {
                    "Key": "PrivateDueApprover"
                },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPharmacyPrintPreference = function() {
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
        $scope.initLookup();
    }

    EmrpharmabilldetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();