(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorPaymentReportController', DoctorPaymentReportController);

    function DoctorPaymentReportController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        $scope.item = [];
        $scope.CanShowPrint = false;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        
       $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
        const JsonFields = ["Date","Voucher Number","Doctor Name", "Voucher Amount", "TDS Amount","Paid Amount","Payment Type"]
        let csvContent = JsonFields.join(",") + "\n";
        data.Data.forEach(function (rowArray) {
            var date = '';
            var voucherNum = '';
            var docName = '';
            var voucherAmt = '';
            var tdsAmt = '';
            var paidAmt='';
            var payment='';

            if (rowArray.PaymentDateTime) {
                date = rowArray.PaymentDateTime;
            }
            if (rowArray.ReceiptDateTime) {
                date += ' ' + rowArray.ReceiptDateTime;
            }
            if (rowArray.DoctorPaymentIdentifier) {
                voucherNum = rowArray.DoctorPaymentIdentifier;
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
            if (rowArray.DcotorInvoiceAmount) {
                voucherAmt = rowArray.DcotorInvoiceAmount;
            }
            if (rowArray.TDSAmount) {
                tdsAmt = rowArray.TDSAmount;
            }
            if (rowArray.DoctorPaymentAmount) {
                paidAmt = rowArray.DoctorPaymentAmount;
            }
            if (rowArray.PaymentType.Description) {
                payment = rowArray.PaymentType.Description;
            }
            csvContent += date + ',' +voucherNum + ',' + docName + ',' + voucherAmt + ',' + tdsAmt + ',' + paidAmt + ',' + payment + "\n";
        });
        var encodedUri = encodeURI(csvContent);
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
        hiddenElement.target = '_blank';
        hiddenElement.download = 'doctorpayment.csv';
        hiddenElement.click();

    };

    $scope.excelDownload = function () {
         var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            $scope.CanShowPrint = false;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: From },
                    { Key: 8, Value: To },
                    { Key: 6, Value: 3 }
            ],

        };
        var options = {
            action: "doctorInvoice/DoctorPayment/GetDoctorPayments",
            data: inputData,
            type: "post",
            onComplete: $scope.excelDownloadCallbackExcel,
        };
        utl.Http.doAction(options);
    };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = []; 
            var totalvoucheramount = 0; 
            var totaltdsamount = 0; 
            var totalpaidamount = 0;  
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if ($scope.currentfilter.DoctorId > 0) {
                    if (item.Doctor.Title)
                        $scope.DoctorName = item.Doctor.Title.Description;
                    if (item.Doctor.FirstName)
                        $scope.DoctorName += ' ' + item.Doctor.FirstName;
                    if (item.Doctor.LastName)
                        $scope.DoctorName += ' ' + item.Doctor.LastName;
                } else {
                    $scope.DoctorName = '';
                }
                totalvoucheramount = totalvoucheramount + (item.DcotorInvoiceAmount);
                totaltdsamount = totaltdsamount + (item.TDSAmount);
                totalpaidamount = totalpaidamount + (item.DoctorPaymentAmount); 
               
                vm.gridConfig.data.push(item);
            }
            if(vm.gridConfig.data.length) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalVoucherAmt = totalvoucheramount;
            $scope.TotalTDSAmt = totaltdsamount; 
            $scope.TotalPaidAmt = totalpaidamount; 

            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.backtoReport = function () {
            $state.go('app.financereporttab.doctorinvoicereport')
        }
        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            $scope.CanShowPrint = false;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: From },
                    { Key: 8, Value: To },
                    { Key: 6, Value: 3 },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'doctorInvoice/DoctorPayment/GetDoctorPayments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    DoctorName: $scope.DoctorName
                },
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: From },
                    { Key: 8, Value: To },
                    { Key: 6, Value: 3 },
                ],
            };
            var options = {
                action: 'doctorInvoice/DoctorPayment/PrintDoctorPaymentReport',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "PaymentDateTime",
                    displayName: $translate.instant('reports.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PaymentDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DoctorPaymentIdentifier",
                    displayName: $translate.instant('reports.vouchernum.lbl')
                }, 
                {
                    field: "First Name",
                    displayName: $translate.instant('reports.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                           <span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                                           <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                                            </div>"
                }, 
                {
                    field: "DcotorInvoiceAmount",
                    displayName: $translate.instant('reports.voucheramt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DcotorInvoiceAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "TDSAmount",
                    displayName: $translate.instant('reports.tdsamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TDSAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "DoctorPaymentAmount",
                    displayName: $translate.instant('reports.paidamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DoctorPaymentAmount | displaycurrency}}</span>" + "</div>"
                }, 
                {
                    field: "PaymentType.Description",
                    displayName: $translate.instant('reports.paymenttype.lbl')
                },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "InvoiceDate" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
            ]
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

    DoctorPaymentReportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();