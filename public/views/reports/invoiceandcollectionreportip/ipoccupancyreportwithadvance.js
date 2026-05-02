(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipoccupancyreportwithadvanceController', ipoccupancyreportwithadvanceController);

    function ipoccupancyreportwithadvanceController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["IP Number", "Patient Name", "Doctor Name", "Room Details", "DOA", "Payer Name", "Pharmacy Bill", "Pharmacy Due", "Credit", "Debit", "Balance", "status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var ipNo = '';
                var patname = '';
                var docname = '';
                var room = '';
                var doa = '';
                var insurance = '';
                var debit = '';
                var credit = '';
                var balance = '';
                var status = '';
                var pharmacybillamt = '';
                var pharbilldue = '';

                if (rowArray.VisitIdentifier) {
                    ipNo = rowArray.VisitIdentifier;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patname = rowArray.Patient.Title.Description;
                        }
                    }
                    if (rowArray.Patient.FirstNam) {
                        patname += ' ' + rowArray.Patient.FirstNam;
                    }
                    if (rowArray.Patient.LastName) {
                        patname = ' ' + rowArray.Patient.LastName;
                    }

                    if (rowArray.Patient.MRN) {
                        patname = ' ' + rowArray.Patient.MRN;
                    }
                }
                if (rowArray.Doctor) {
                    if (rowArray.Doctor.Title) {
                        if (rowArray.Doctor.Title.Description) {
                            docname = rowArray.Doctor.Title.Description;
                        }
                    }
                    if (rowArray.Doctor.FirstName) {
                        docname += ' ' + rowArray.Doctor.FirstName;
                    }
                    if (rowArray.Doctor.LastName) {
                        docname += ' ' + rowArray.Doctor.LastName;
                    }
                }
                if (rowArray.WardMaster) {
                    if (rowArray.WardMaster.WardName) {
                        room = rowArray.WardMaster.WardName;
                    }
                    if (rowArray.WardRoomBedMaster.WardRoomMaster.RoomNo) {
                        room += ' ' + rowArray.WardRoomBedMaster.WardRoomMaster.RoomNo;
                    }
                    if (rowArray.WardRoomBedMaster.BedNo) {
                        room += ' ' + rowArray.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.AdmissionDate) {
                    // doa = rowArray.AdmissionDate;
                    doa = utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }
                if (rowArray.Guarantor.GuarantorName) {
                    insurance = rowArray.Guarantor.GuarantorName;
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
                if (rowArray.PharmacyDue) {
                    pharbilldue = rowArray.PharmacyDue;
                }
                if (rowArray.PharmacyBillAmt) {
                    pharmacybillamt = rowArray.PharmacyBillAmt;
                }
                if (rowArray.AdmissionStatus) {
                    if (rowArray.AdmissionStatus.Description) {
                        status = rowArray.AdmissionStatus.Description;
                    }
                }
                csvContent += ipNo + ',' + patname + ',' + docname + ',' + room + ',' + doa + ',' + insurance + ',' + pharmacybillamt + ',' + pharbilldue + ',' + credit + ',' + debit + ',' + balance + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'ipoccupancyreportwithadvance.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 17,
                    Value: FromAdm
                },
                {
                    Key: 18,
                    Value: ToAdm
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
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
                action: "Visit/Visit/GetIPPatientsBills",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var totaldebit = 0;
            var totalcredit = 0;
            var totalbalance = 0;
            var totalpharbilldue = 0;
            var totalpharbillamt = 0;
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.PharmacyDue = 0;
                item.PharmacyBillAmt = 0;
                if ($scope.currentfilter.GuarantorId > 0) {
                    if (data.Data.length > 0) {
                        $scope.GuarantorName = item.Guarantor.GuarantorName;
                    }
                } else {
                    $scope.GuarantorName = '';
                }
                if ($scope.currentfilter.WardId > 0) {
                    $scope.WardName = item.WardMaster.WardName;
                } else {
                    $scope.WardName = '';
                }
                if (item.FinalBills.length == 1) {
                    var FinalBill = item.FinalBills[0];
                } else if (item.FinalBills.length > 1) {
                    var lastIndex = item.FinalBills.length - 1;
                    var FinalBill = item.FinalBills[lastIndex];
                }
                var BillDiscount = 0;
                var isFinalize = false;
                if (FinalBill) {
                    isFinalize = true;
                    BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount)) ? 0 : parseFloat(FinalBill.BillDiscount);
                }
                var TotBillAmt = parseFloat(item.BillAmount || 0) + parseFloat(item.RoundOffValue || 0);
                var Debit =
                    (isNaN(parseFloat(item.Disallowance)) ? 0 : parseFloat(item.Disallowance)) +
                    ((isNaN(parseFloat(item.TDS)) ? 0 : parseFloat(item.TDS))) +
                    (isNaN(parseFloat(item.Debit)) ? (0) : parseFloat(item.Debit));
                item.Debit = Debit;
                var Credit = (!item.IsPackageAssigned ?
                    (isNaN(parseFloat(TotBillAmt)) ? 0 : parseFloat(TotBillAmt)) :
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
                totaldebit = totaldebit + (item.Debit);
                totalcredit = totalcredit + (item.Credit);
                totalbalance = totalbalance + (item.Balance);
                totalpharbilldue = totalpharbilldue + (item.PharmacyDue);
                totalpharbillamt = totalpharbillamt + (item.PharmacyBillAmt);
                vm.gridConfig.data.push(item);
            }
            $scope.TotalDebit = totaldebit;
            $scope.TotalCredit = totalcredit;
            $scope.TotalBalance = totalbalance;
            $scope.TotalPharmacyDue = totalpharbilldue;
            $scope.TotalPharmacyBill = totalpharbillamt;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
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
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 17,
                    Value: FromAdm
                },
                {
                    Key: 18,
                    Value: ToAdm
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
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
                action: 'Visit/Visit/GetIPPatientsBills',
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
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FacilityName: $scope.currentfilter.FacilityName,
                    GuarantorName: $scope.GuarantorName,
                    WardName: $scope.WardName,
                    AdmDate: $scope.currentfilter.admissiondate
                },
                Params: [{
                    Key: 17,
                    Value: FromAdm
                },
                {
                    Key: 18,
                    Value: ToAdm
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
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
                    Key: 31,
                    Value: [2, 3, 4, 5]
                },
                {
                    Key: 22,
                    Value: true
                },
                ],
            };
            var options = {
                action: 'Visit/Visit/PrintIPOccupancyAdvanceReport',
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
                field: "VisitIdentifier",
                displayName: $translate.instant('billing.inpatients.ipnumber.lbl')
            },
            {
                field: "Patient Name",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\<span>{{entity.Patient.MRN}}</span>\
                                        </div>"
            },
            {
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                                        </div>"
            },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('reports.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.WardMaster'>{{entity.WardMaster.WardName}} </span>" +
                    "<span ng-if='entity.WardRoomBedMaster.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster.WardRoomMaster'>{{entity.WardRoomBedMaster.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.WardRoomBedMaster.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "AdmissionDate",
                displayName: $translate.instant('DOA'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "Guarantor.GuarantorName",
                displayName: $translate.instant('reports.insurance.lbl')
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
                displayName: $translate.instant('billing.inpatients.status.lbl')
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

    ipoccupancyreportwithadvanceController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();