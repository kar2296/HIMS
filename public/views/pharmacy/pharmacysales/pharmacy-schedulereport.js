(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacyschedulerptController', pharmacyschedulerptController);

    function pharmacyschedulerptController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));
        $scope.lookup = {};
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.canShowDMPrintBtn = false;
        $scope.currentfilter = {
            FromBillDate: utl.Formatter.getCurrentDate(),
            ToBillDate: utl.Formatter.getCurrentDate(),
            DueApprovedById: -1,
            PharmacySaleTypeId: -1,
            StoreMasterId: -1,
            ScheduleTypeId: 1
        };
        $scope.Details = [];

        $scope.backtoReport = function () {
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Bill Date", "Bill", "Patient", "Doctor", "Bill Amount", "Discount", "Round Off", "Net Amount"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var billDate = '';
                var bill = '';
                var patName = '';
                var doc = '';
                var billAmt = '';
                var discount = '';
                var roundOff = '';
                var netAmt = '';

                if (rowArray.BillDateTime) {
                    billDate = rowArray.BillDateTime;
                }
                // if (rowArray.PatientBill.BillDateTime) {
                //     billDate += ' ' + rowArray.PatientBill.BillDateTime;
                // }
                if (rowArray.BillNumber) {
                    bill = rowArray.BillNumber;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title.Description) {
                        patName = rowArray.Patient.Title.Description;
                    }
                    if (rowArray.Patient.FirstName) {
                        patName += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patName += ' ' + rowArray.Patient.LastName;
                    }
                }
                // if (rowArray.PatientInfo) {
                //     patName = rowArray.PatientInfo;
                // }
                if (rowArray.User) {
                    if (rowArray.User.Title.Description) {
                        doc = rowArray.User.Title.Description;
                    }
                    if (rowArray.User.FirstName) {
                        doc += ' ' + rowArray.User.FirstName;
                    }
                    if (rowArray.User.LastName) {
                        doc += ' ' + rowArray.User.LastName;
                    }
                }
                if (rowArray.BillAmount) {
                    billAmt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    discount = rowArray.BillDiscount;
                }
                if (rowArray.RoundOff) {
                    roundOff = rowArray.RoundOff;
                }
                if (rowArray.NetAmount) {
                    netAmt = rowArray.NetAmount;
                }
                doc = doc.replace(/,/g, " ");
                doc = doc.replace(/ /g, " ");

                csvContent += billDate + ',' + bill + ',' + patName + ',' + doc + ',' + billAmt + ',' + discount + ',' + roundOff + ',' + netAmt + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'pharmacy-schedule-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if ($scope.currentfilter.StoreMasterId > 0) {
                var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 21,
                            Value: true
                        },
                        {
                            Key: 17,
                            Value: FrmDate
                        },
                        {
                            Key: 18,
                            Value: ToDate
                        },
                        {
                            Key: 29,
                            Value: $scope.currentfilter.StoreMasterId
                        },
                        {
                            Key: 34,
                            Value: $scope.currentfilter.ScheduleTypeId
                        }
                    ],

                };
                var options = {
                    action: "billing/PatientBills/GetPatientBills",
                    data: inputData,
                    type: "post",
                    onComplete: $scope.excelDownloadCallbackExcel,
                };
                utl.Http.doAction(options);
            };

        };


        $scope.getPharmacyBillsCallback = function (scope, data, options, hasError) {
            var startTime = new Date($scope.currentfilter.FromBillDate);
            var endTime = new Date($scope.currentfilter.ToBillDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 15)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 15 days...");
                $scope.currentfilter.FromBillDate = new Date();
                $scope.currentfilter.ToBillDate = new Date();
                return false;
            }
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.NetAmount = item.BillAmount - item.BillDiscount;
                item.NetAmount = Math.ceil(item.NetAmount);
                $scope.canShowDMPrintBtn = true;
                item.PatientInfo = '';
                if (item.Patient) {
                    if (item.Patient.Title)
                        item.PatientInfo = item.Patient.Title.Description;
                    if (item.Patient.FirstName)
                        item.PatientInfo += ' ' + item.Patient.FirstName;
                    if (item.Patient.LastName)
                        item.PatientInfo += ' ' + item.Patient.LastName;
                    if (item.Patient.MRN)
                        item.PatientInfo += '/' + item.Patient.MRN;
                    if (item.Patient.Age)
                        item.PatientInfo += '/' + item.Patient.Age;
                    if (item.Patient.Gender)
                        item.PatientInfo += '/' + item.Patient.Gender.Description;
                } else if (!item.Patient) {
                    item.PatientInfo = item.PatientName + '/' + item.Age + '/' + item.Gender.Description;
                }
                vm.gridConfig.data.push(item);

            }
            data.Data.sort(function (a, b) {
                if (a.BillNumber < b.BillNumber) return -1;
                else if (a.BillNumber > b.BillNumber) return 1;
                return 0;
            });
            // vm.gridConfig.data = data.Data || [];
            if ($scope.currentfilter.ScheduleTypeId > 0) {
                $scope.getScheduleType();
            } else {
                $scope.currentfilter.ScheduleType = '';
            }
        };
        $scope.getPharmacyBills = function () {
            if ($scope.currentfilter.StoreMasterId > 0) {
                var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 21,
                            Value: true
                        },
                        {
                            Key: 17,
                            Value: FrmDate
                        },
                        {
                            Key: 18,
                            Value: ToDate
                        },
                        {
                            Key: 29,
                            Value: $scope.currentfilter.StoreMasterId
                        },
                        {
                            Key: 34,
                            Value: $scope.currentfilter.ScheduleTypeId
                        }
                    ]
                };
                var options = {
                    action: 'billing/PatientBills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPharmacyBillsCallback
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showSuccessMsg($translate.instant('billing.opbilling-list.storename.lbl'));

            }
        };

        $scope.getScheduleTypeCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.currentfilter.ScheduleType = data.Data[0].Description;
            }
        };

        $scope.getScheduleType = function () {
            if ($scope.currentfilter.ScheduleTypeId > 0) {
                var inputData = {
                    Params: [{
                            Key: 3,
                            Value: 'ScheduleType'
                        },
                        {
                            Key: 7,
                            Value: $scope.currentfilter.ScheduleTypeId
                        }
                    ]
                };
                var options = {
                    action: 'SystemSettings/ReferenceValue/GetReferenceValues',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getScheduleTypeCallback
                };
                utl.Http.doAction(options);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "BillDateTime",
                    displayName: $translate.instant('billing.pharmacy-billdetails.billdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PatientBill.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
                }, {
                    field: "BillNumber",
                    displayName: $translate.instant('billing.pharmacy-billdetails.billno.lbl')
                }, {
                    field: "PatientInfo",
                    displayName: $translate.instant('billing.pharmacy-billdetails.patient.lbl'),
                    // cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    //     '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    //     "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    //     "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    //     "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                    //     "<span >/</span>" +
                    //     "<span >{{entity.Patient.MRN}}</span>" +
                    //     "<span >/<span>" +
                    //     "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    //     "<span >{{entity.Patient.Age}}</span>" +
                    //     "<span >/</span>" +
                    //     "<span >{{entity.Patient.Gender.Description}}</span>" +
                    //     "</a></div>"
                },
                // {
                //     field: "RoomDetails",
                //     displayName: $translate.instant('billing.pharmacy-billdetails.roomdetails.lbl'),
                // },
                {
                    field: "UserName",
                    displayName: $translate.instant('billing.pharmacy-billdetails.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.User.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.User.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.User.LastName}}&nbsp;</span>" +
                        "</span></div>"
                }, {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.pharmacy-billdetails.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillAmount | displaycurrency}}</span>' + '</div>'
                }, {
                    field: "BillDiscount",
                    displayName: $translate.instant('billing.pharmacy-billdetails.discount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillDiscount | displaycurrency}}</span>' + '</div>'
                }, {
                    field: "RoundOff",
                    displayName: $translate.instant('billing.pharmacy-billdetails.roundoff.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RoundOffValue | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.RoundOffValue | displaycurrency}}</span>' + '</div>'
                }, {
                    field: "NetAmount",
                    displayName: $translate.instant('billing.pharmacy-billdetails.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.NetAmount | displaycurrency}}</span>' + '</div>'
                },
                // {
                //     field: "NetAmount",
                //     displayName: $translate.instant('billing.pharmacy-billdetails.paymentmode.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.PaymentType | displaycurrency}}</span>' + '</div>'
                // }
            ]
        };
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true;
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        }

        $scope.Print = function () {
            // $scope.Details = getSelectionRows();
            // var actionName = 'billing/patientbills/printPharmacybilldetails';
            // var options = {
            //     action: actionName,
            //     data: { Data: $scope.item },
            //     type: 'post',
            //     onComplete: $scope.saveItemCallback
            // };
            // // utl.Http.doAction(options);
        };


        /* Pharmacy dotmatrix print starts */
        $scope.dmPrint = function () {
            // if ($scope.dmprintpreferences != 1) {
            //     utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));
            //     return false;
            // } else {
            var dmAllPrintInput = preparePrintData();
            console.log(dmAllPrintInput);
            $scope.printPharmacyScheduleReport(dmAllPrintInput);
            // }
        };

        function preparePrintData() {
            console.log('preparePrintData starts');
            var dmAllPrintInput = [];
            var islno = 0;
            var idx2 = 0;
            for (var idx in vm.gridConfig.data) {
                var currentBill = vm.gridConfig.data[idx];
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
                var vpatientName = '';
                var vsign = '';
                var vPAddress1 = '';
                var vPAddress2 = '';
                var vPAddress = '';
                var vPAddress_FirstRow = '';
                var vPAddress_SecondRow = '';
                var vDrQalfca = '';
                var vDrQalfca_FirstRow = '';
                var vDrQalfca_SecondRow = '';

                if (currentBill.Encounter) vIPOPNO = '' + currentBill.Encounter.VisitIdentifier;
                if (currentBill.Facility) vGST = '' + currentBill.Facility.GstNumber;



                if (currentBill.User) {
                    if (currentBill.User.Title) vUTitle = currentBill.User.Title.Description;
                    if (currentBill.User.FirstName) vUFirstName = currentBill.User.FirstName;
                    if (currentBill.User.LastName) vULastName = currentBill.User.LastName;
                    //vDrName = (vUTitle + '.' + vUFirstName + ' ' + vULastName);
                    vDrName = (vUTitle + vUFirstName + ' ' + vULastName);
                    if (currentBill.User.Qualification) vDrQalfca = currentBill.User.Qualification;
                    if (vDrQalfca && vDrQalfca.length > 24) {
                        vDrQalfca_FirstRow = vDrQalfca.substring(0, 24);
                        vDrQalfca_SecondRow = vDrQalfca.substring(25, 48);
                    } else {
                        vDrQalfca_FirstRow = vDrQalfca;
                        vDrQalfca_SecondRow = '';
                    }

                }
                if (currentBill.CreatedUser) {
                    if (currentBill.CreatedUser.Title) vCTitle = currentBill.CreatedUser.Title.Description;
                    if (currentBill.CreatedUser.FirstName) vCFirstName = currentBill.CreatedUser.FirstName;
                    if (currentBill.CreatedUser.LastName) vCLastName = currentBill.CreatedUser.LastName;
                }

                if (currentBill.PatientId > 0) {
                    if (currentBill.Patient) {
                        if (currentBill.Patient.Title) vPTitle = currentBill.Patient.Title.Description;
                        if (currentBill.Patient.FirstName) vPFirstName = currentBill.Patient.FirstName;
                        if (currentBill.Patient.LastName) vPLastName = currentBill.Patient.LastName;
                        if (currentBill.Patient.AddressLine1) vPAddress1 = currentBill.Patient.AddressLine1;
                        if (currentBill.Patient.AddressLine2) vPAddress2 = currentBill.Patient.AddressLine2;
                        if (currentBill.Patient.MRN) vMRN = currentBill.Patient.MRN;
                        if (currentBill.Patient.Age) vAge = '' + currentBill.Patient.Age;
                        if (currentBill.Patient.DOB) vDOB = '' + currentBill.Patient.DOB;
                        if (currentBill.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(currentBill.Patient.DOB);
                        if (currentBill.Patient.Gender) vGender = '' + currentBill.Patient.Gender.Description;
                        //vpatientName = (vPTitle + '.' + vPFirstName + ' ' + vPLastName + '/' + vMRN)
                        vpatientName = (vPTitle + vPFirstName + ' ' + vPLastName)

                        vPAddress = vPAddress1 + ' ' + vPAddress2;
                        if (vPAddress && vPAddress.length > 18) {
                            vPAddress_FirstRow = vPAddress.substring(0, 18);
                            vPAddress_SecondRow = vPAddress.substring(19, 36);
                        } else {
                            vPAddress_FirstRow = vPAddress;
                            vPAddress_SecondRow = '';
                        }

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
                } else if (currentBill.PatientId == 0) {
                    vpatientName = currentBill.PatientName;
                }

                if (currentBill.StoreMaster) vTinNo = currentBill.StoreMaster.TinNo;


                var vPayTypeId = -1;

                if (currentBill.PatientPaymentDetails)
                    for (var idxpy in currentBill.PatientPaymentDetails)
                        vPayTypeId = currentBill.PatientPaymentDetails[idxpy].PaymentTypeId;

                var BillDate = utl.Formatter.getDateString(currentBill.BillDateTime);
                var BillDateTime = new Date(currentBill.BillDateTime);
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

                var dmPrintInput = {};
                dmPrintInput.header = {
                    prescribedby: vDrName || '',
                    DrQalfca: vDrQalfca || '',
                    DrQalfca_FirstRow: vDrQalfca_FirstRow || '',
                    DrQalfca_SecondRow: vDrQalfca_SecondRow || '',
                    licenseno: '' + currentBill.StoreMaster.LicenseNo,
                    billno: '' + currentBill.BillNumber,
                    patientname: vpatientName,
                    PAddress1: vPAddress1 || '',
                    PAddress2: vPAddress2 || '',
                    PAddress: vPAddress || '',
                    PAddress_FirstRow: vPAddress_FirstRow || '',
                    PAddress_SecondRow: vPAddress_SecondRow || '',
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
                    sign: '',
                    BillDate: BillDate,
                    BillTime: BillTime
                };

                dmPrintInput.lines = [];
                var dummypatientname = '';
                idx2 = 0;
                var dispslon = '';
                var billdate = utl.Formatter.getDateTimeString(currentBill.BillDateTime);
                for (var idx1 in currentBill.PatientBillDetails) {
                    if (idx2 > 0) vpatientName = '';
                    if (idx2 > 0) currentBill.BillNumber = '';
                    if (idx2 > 0) billdate = '';
                    if (idx2 > 0) vDrName = '';
                    if (idx2 > 0) dispslon = '';
                    var billDetail = currentBill.PatientBillDetails[idx1];
                    if (billDetail.ItemMaster.SubCategoryId == 1) {

                        if (idx2 == 0) {
                            islno++;
                            dispslon = '' + islno;
                        }


                        var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                        var manu = billDetail.ManufacturerName;
                        if (manu && manu.length > 9) {
                            manu = manu.substring(0, 9);
                        }
                        var batchid = billDetail.BatchId;
                        if (batchid && batchid.length > 7) {
                            batchid = batchid.substring(0, 7);
                        }


                        var cgstamt = parseFloat(billDetail.CGstAmount).toFixed(2);
                        var sgstamt = parseFloat(billDetail.SGstAmount).toFixed(2);

                        var vHSN = '';
                        if (billDetail.ItemMaster)
                            if (billDetail.ItemMaster.ProductRegNo)
                                vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                        var vSCH = '';
                        if (billDetail.ScheduleTypeDescription)
                            vSCH = billDetail.ScheduleTypeDescription;

                        var detail = {
                            ispace: ' ',
                            slno: dispslon,
                            billno: '' + currentBill.BillNumber,
                            billdate: billdate,
                            doctor: vDrName || '',
                            DrQalfca: vDrQalfca || '',
                            DrQalfca_FirstRow: vDrQalfca_FirstRow || '',
                            DrQalfca_SecondRow: vDrQalfca_SecondRow || '',
                            patient: vpatientName,
                            PAddress1: vPAddress1 || '',
                            PAddress2: vPAddress2 || '',
                            PAddress: vPAddress || '',
                            PAddress_FirstRow: vPAddress_FirstRow || '',
                            PAddress_SecondRow: vPAddress_SecondRow || '',
                            desc: billDetail.ItemName,
                            hsn: vHSN,
                            sch: vSCH,
                            batch: batchid,
                            exp: expiryDate,
                            qty: billDetail.Quantity,
                            mrp: parseFloat(billDetail.Rate).toFixed(2),
                            value: parseFloat(billDetail.NetAmountBeforeGST).toFixed(2),
                            cgstper: billDetail.CGstPercentage,
                            cgstamt: cgstamt,
                            sgstper: billDetail.SGstPercentage,
                            sgstamt: sgstamt,
                            totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                            amount: parseFloat(billDetail.Amount).toFixed(2),
                            mfr: manu,
                            netamount: parseFloat(billDetail.NetAmount).toFixed(2),
                            sign: '',
                        };

                        var header = {
                            slno: dispslon,
                            billno: '' + currentBill.BillNumber,
                            billdate: billdate,
                            doctor: vDrName || '',
                            patient: vpatientName,
                        };


                        dmPrintInput.lines.push(detail);
                        idx2++;
                    }

                }

                var FromDate = utl.Formatter.getDateString($scope.currentfilter.FromBillDate);
                var ToDate = utl.Formatter.getDateString($scope.currentfilter.ToBillDate);
                var ScheduleType = $scope.currentfilter.ScheduleType;
                dmPrintInput.Summary = {
                    FromDate: FromDate,
                    ToDate: ToDate,
                    ScheduleType: ScheduleType
                };

                dmAllPrintInput.push(dmPrintInput);
            }
            console.log('preparePrintData ends');
            return dmAllPrintInput;
        }
        /* Pharmacy dotmatrix print ends */

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === -1) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === 0) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                    }
                }
                // var InPatientSaleType = {
                //     Code: "Credit-InPatient",
                //     Id: 6,
                //     IsDefault: true,
                //     Language: null,
                //     Text: "Credit InPatient"
                // }
                // $scope.lookup["PharmacySaleType"].push(InPatientSaleType);
            });

        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ScheduleType"
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
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
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

        // $scope.getPharmacyPrintPreference();
        $scope.initLookup();
        $scope.getPharmacyBills();


    }

    pharmacyschedulerptController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();