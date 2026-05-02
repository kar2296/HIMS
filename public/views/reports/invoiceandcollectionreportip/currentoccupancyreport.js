(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CurrentOccupancyReportController', CurrentOccupancyReportController);

    function CurrentOccupancyReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }



        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["DOA", "IP Number", "Patient Name", "MRN", "Room Details", "Doctor Name", "Payer Name", "Department", "Pharmacy Bill", "Pharmacy Due", "Credit", "Debit", "Balance", "Admission State", "Attender Name", "Attender Phone"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                for (var idx in data.Data) {
                    var item = data.Data[idx];
                    var FinalBill = item.FinalBills[0];
                    var BillDiscount = 0;
                    var isFinalize = false;
                    if (FinalBill) {
                        isFinalize = true;
                        BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount)) ? 0 : parseFloat(FinalBill.BillDiscount);
                    }
                    var Debit =
                        (isNaN(parseFloat(item.Disallowance)) ? 0 : parseFloat(item.Disallowance)) +
                        ((isNaN(parseFloat(item.TDS)) ? 0 : parseFloat(item.TDS))) +
                        (isNaN(parseFloat(item.Debit)) ? (0) : parseFloat(item.Debit));
                    item.Debit = Debit;
                    var Credit = (!item.IsPackageAssigned ?
                        (isNaN(parseFloat(item.BillAmount)) ? 0 : parseFloat(item.BillAmount)) :
                        (isNaN(parseFloat(item.InclusionAmount)) ? (0) : parseFloat(item.InclusionAmount)) +
                        (isNaN(parseFloat(item.ExclusionAmount)) ? (0) : parseFloat(item.ExclusionAmount))) -
                        (isFinalize ? BillDiscount :
                            (!item.IsPackageAssigned ?
                                (isNaN(parseFloat(item.DiscountAmount)) ? 0 : parseFloat(item.DiscountAmount)) :
                                (isNaN(parseFloat(item.PackageDiscountAmount)) ? 0 : parseFloat(item.PackageDiscountAmount))));

                    item.Credit = (isNaN(parseFloat(Credit)) ? 0 : parseFloat(Credit));
                    item.Balance = (Credit - (isNaN(parseFloat(item.Debit)) ? 0 : parseFloat(item.Debit)));
                    if (item.FinalBills.length > 0)
                        item.Balance = item.Balance + (isNaN(parseFloat(item.FinalBills[0].RefundAmount)) ?
                            0 : parseFloat(item.FinalBills[0].RefundAmount));
                    vm.gridConfig.data.push(item);
                    //             vm.gridConfig.data = res.Data;
                    // for (var idx in res.Data) {
                    //     var item = res.Data[idx]; 
                    //     vm.gridConfig.data.push(item);
                }
                var doa = '';
                var ipNum = '';
                var patientName = '';
                var mrn = '';
                var room = '';
                var docName = '';
                var insurancename = '';
                var dept = '';
                var debit = '';
                var credit = '';
                var balance = '';
                var state = '';
                var attender = '';
                var attenderPh = '';
                var pharmacybillamt = '';
                var pharbilldue = '';
                if (rowArray.AdmissionDate) {
                    // doa = rowArray.AdmissionDate;
                    // doa = $filter('date')(rowArray.AdmissionDate, 'yyyy-MM-dd') || null;
                    doa = utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }

                if (rowArray.VisitIdentifier) {
                    ipNum = rowArray.VisitIdentifier;
                }
                if (rowArray.Patient.Title.Description) {
                    patientName = rowArray.Patient.Title.Description;
                }
                if (rowArray.Patient.FirstName) {
                    patientName += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patientName += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.WardMaster.WardName) {
                    room = rowArray.WardMaster.WardName;
                }
                if (rowArray.WardRoomMaster.RoomNo) {
                    room += ' ' + rowArray.WardRoomMaster.RoomNo;
                }
                if (rowArray.WardRoomBedMaster.BedNo) {
                    room += ' ' + rowArray.WardRoomBedMaster.BedNo;
                }
                if (rowArray.Doctor.Title.Description) {
                    docName = rowArray.Doctor.Title.Description;
                }
                if (rowArray.Doctor.FirstName) {
                    docName += ' ' + rowArray.Doctor.FirstName;
                }
                if (rowArray.Doctor.LastName) {
                    docName += ' ' + rowArray.Doctor.LastName;
                }
                if (rowArray.Guarantor.GuarantorName) {
                    insurancename = rowArray.Guarantor.GuarantorName;
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        dept = rowArray.Department.DepartmentName;
                    }
                }
                if (rowArray.PharmacyDue) {
                    pharbilldue = rowArray.PharmacyDue;
                }
                if (rowArray.PharmacyBillAmt) {
                    pharmacybillamt = rowArray.PharmacyBillAmt;
                }
                if (rowArray.Debit) {
                    debit = rowArray.Debit;
                }
                if (rowArray.Credit) {
                    credit = rowArray.Credit;
                }
                if (rowArray.Balance) {
                    balance = rowArray.Balance;
                }
                if (rowArray.AdmissionStatus) {
                    if (rowArray.AdmissionStatus.Description) {
                        state = rowArray.AdmissionStatus.Description;
                    }
                }

                if (rowArray.AttenderName) {
                    attender = rowArray.AttenderName;
                }
                if (rowArray.AttenderPhone) {
                    attenderPh = rowArray.AttenderPhone;
                }

                docName = docName.replace(/,/g, " ");
                docName = docName.replace(/ /g, " ");

                csvContent += doa + ',' + ipNum + ',' + patientName + ',' + mrn + ',' + room + ',' + docName + ',' + insurancename + ',' + dept + ',' + pharmacybillamt + ',' + pharbilldue + ',' + credit + ',' + debit + ',' + balance + ',' + state + ',' + attender + ',' + attenderPh + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'currentoccupancy-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    //     {
                    //     Key: 17,
                    //     Value: From
                    // },
                    // {
                    //     Key: 18,
                    //     Value: To
                    // },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 15,
                        Value: 2
                    },
                    {
                        Key: 31,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 22,
                        Value: true
                    }
                ],

            };
            var options = {
                action: "Visit/Visit/GetEncounters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.PharmacyDue = 0;
                item.PharmacyBillAmt = 0;
                var FinalBill = item.FinalBills[0];
                var BillDiscount = 0;
                var isFinalize = false;
                if (FinalBill) {
                    isFinalize = true;
                    BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount)) ? 0 : parseFloat(FinalBill.BillDiscount);
                }
                var Debit =
                    (isNaN(parseFloat(item.Disallowance)) ? 0 : parseFloat(item.Disallowance)) +
                    ((isNaN(parseFloat(item.TDS)) ? 0 : parseFloat(item.TDS))) +
                    (isNaN(parseFloat(item.Debit)) ? (0) : parseFloat(item.Debit));
                item.Debit = Debit;
                var Credit = (!item.IsPackageAssigned ?
                    (isNaN(parseFloat(item.BillAmount)) ? 0 : parseFloat(item.BillAmount)) :
                    (isNaN(parseFloat(item.InclusionAmount)) ? (0) : parseFloat(item.InclusionAmount)) +
                    (isNaN(parseFloat(item.ExclusionAmount)) ? (0) : parseFloat(item.ExclusionAmount))) -
                    (isFinalize ? BillDiscount :
                        (!item.IsPackageAssigned ?
                            (isNaN(parseFloat(item.DiscountAmount)) ? 0 : parseFloat(item.DiscountAmount)) :
                            (isNaN(parseFloat(item.PackageDiscountAmount)) ? 0 : parseFloat(item.PackageDiscountAmount))));

                item.Credit = (isNaN(parseFloat(Credit)) ? 0 : parseFloat(Credit));
                item.Balance = (Credit - (isNaN(parseFloat(item.Debit)) ? 0 : parseFloat(item.Debit)));
                if (item.FinalBills.length > 0) {
                    item.Balance = item.Balance + (isNaN(parseFloat(item.FinalBills[0].RefundAmount)) ?
                        0 : parseFloat(item.FinalBills[0].RefundAmount));
                }
                if (item.PharmacyBills.length > 0) {
                    var pharbillamt = 0;
                    var pharbilldue = 0;
                    for (var pdx in item.PharmacyBills) {
                        var pharmacybill = item.PharmacyBills[pdx];
                        pharbillamt += pharmacybill.BillAmount;
                        pharbilldue += pharmacybill.OutStandingAmount;
                    }
                    item.PharmacyDue = pharbilldue;
                    item.PharmacyBillAmt = pharbillamt;
                }
                vm.gridConfig.data.push(item);
                //             vm.gridConfig.data = res.Data;
                // for (var idx in res.Data) {
                //     var item = res.Data[idx]; 
                //     vm.gridConfig.data.push(item);
            }
            $scope.DoctorName = '';
            if ($scope.currentfilter.DoctorId > 0) {
                if (res.Data[0].Doctor) {
                    if (res.Data[0].Doctor.Title)
                        $scope.DoctorName = res.Data[0].Doctor.Title.Description;
                    if (res.Data[0].Doctor.FirstName)
                        $scope.DoctorName += res.Data[0].Doctor.FirstName;
                    if (res.Data[0].Doctor.LastName)
                        $scope.DoctorName += res.Data[0].Doctor.LastName;
                }
            }
            if ($scope.currentfilter.WardId > 0) {
                $scope.WardName = res.Data[0].WardMaster.WardName;
            } else {
                $scope.WardName = '';
            }
            if ($scope.currentfilter.GuarantorId > 0) {
                $scope.GuarantorName = res.Data[0].Guarantor.GuarantorName;
            } else {
                $scope.GuarantorName = '';
            }
            if ($scope.currentfilter.AdmissionStatusId > 0) {
                $scope.AdmissionStatus = res.Data[0].AdmissionStatus.Description;
            } else {
                $scope.AdmissionStatus = '';
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }


            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 30)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    //     {
                    //     Key: 17,
                    //     Value: From
                    // },
                    // {
                    //     Key: 18,
                    //     Value: To
                    // },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 15,
                        Value: 2
                    },
                    {
                        Key: 31,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 22,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'ipinvoicebillingreport') {
                $state.go('app.billingreportstab.ipinvoicebillingreport');
            }
            if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }

        };


        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    DoctorName: $scope.DoctorName,
                    WardName: $scope.WardName,
                    GuarantorName: $scope.GuarantorName,
                    AdmissionStatus: $scope.AdmissionStatus

                },
                Params: [
                    //     {
                    //     Key: 17,
                    //     Value: From
                    // },
                    // {
                    //     Key: 18,
                    //     Value: To
                    // },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 15,
                        Value: 2
                    },
                    {
                        Key: 31,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 22,
                        Value: true
                    }
                ],
            };
            var options = {
                action: 'Visit/Visit/PrintCurrentOccupancyReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "AdmissionDate",
                displayName: $translate.instant('reports.doa.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "VisitIdentifier",
                displayName: $translate.instant('reports.visitnum.lbl')
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                        </div>"
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('reports.mrn.lbl')
            },

            {
                field: "WardRoomMaster",
                displayName: $translate.instant('reports.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}}&nbsp;</span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}}&nbsp;</span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                 </div>"
            },
            {
                field: "Guarantor.GuarantorName",
                displayName: $translate.instant('reports.insurance.lbl')
            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "PharmacyBillAmt",
                displayName: $translate.instant('Pharmacy Bill'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PharmacyBillAmt | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Debit | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "PharmacyDue",
                displayName: $translate.instant('Pharmacy Due'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PharmacyDue | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Debit | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "Credit",
                displayName: $translate.instant('billing.inpatients.credit.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Credit | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Credit | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "Debit",
                displayName: $translate.instant('billing.inpatients.debit.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Debit | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Debit | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "Balance",
                displayName: $translate.instant('billing.inpatients.balance.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Balance | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Balance | displaycurrency}}</span>' + '</div>'
            },

            {
                field: "AdmissionStatus.Description",
                displayName: $translate.instant('reports.admstatus.lbl')
            },
            {
                field: "AttenderName",
                displayName: $translate.instant('Attender Name')
            },
            {
                field: "AttenderPhone",
                displayName: $translate.instant('Attender Phone')
            },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "Department"
            },
            {
                "Key": "AdmissionStatus"
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
                "Key": "Ward"
            },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();

    }

    CurrentOccupancyReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();