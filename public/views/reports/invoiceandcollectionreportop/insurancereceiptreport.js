(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('insurancereceiptreportController', insurancereceiptreportController);

    function insurancereceiptreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Date and Time", "Receipt", "Payer Name", "Payment Type", "Cheque Number", "Cheque Date", "Receipt Amount", "TDS", "Disallowed", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var date = '';
                var receipt = '';
                var insurance = '';
                var payType = '';
                var chequeNum = '';
                var chequeDate = '';
                var receiptAmt = '';
                var tds = '';
                var disAllow = '';
                var status = '';

                if (rowArray.PaymentDate) {
                    date = rowArray.PaymentDate;
                }
                if (rowArray.PaymentIdentifier) {
                    receipt = rowArray.PaymentIdentifier;
                }
                if (rowArray.GuarantorName) {
                    insurance = rowArray.GuarantorName;
                }
                if (rowArray.PaymentType.Description) {
                    payType = rowArray.PaymentType.Description;
                }
                if (rowArray.ChequeNo) {
                    chequeNum = rowArray.ChequeNo;
                }
                if (rowArray.ChequeDate) {
                    chequeDate = rowArray.ChequeDate;
                }
                if (rowArray.ReceivedAmount) {
                    receiptAmt = rowArray.ReceivedAmount;
                }
                if (rowArray.TDSAmount) {
                    tds = rowArray.TDSAmount;
                }
                if (rowArray.Disallowed) {
                    disAllow = rowArray.Disallowed;
                }
                if (rowArray.InsurancePaymentStatus.Description) {
                    status = rowArray.InsurancePaymentStatus.Description;
                }

                csvContent += date + ',' + receipt + ',' + insurance + ',' + payType + ',' + chequeNum + ',' + chequeDate + ',' + receiptAmt + ',' + tds + ',' + disAllow + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'insurancereceiptreport.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalRecAmt = 0;
                $scope.TotalTDS = 0;
                $scope.TotalDisallowance = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 7,
                        Value: From
                    },
                    {
                        Key: 8,
                        Value: To
                    },
                    {
                        Key: 3,
                        Value: 3
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.GuarantorTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.GuarantorId
                    }
                ],

            };
            var options = {
                action: "billing/insurancepayment/GetInsurancePayments",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };




        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalreceiptamount = 0;
            var totaltds = 0;
            var totaldisallowanceamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.GuarantorId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorName = item.GuarantorName;
                    }
                } else {
                    $scope.GuarantorName = '';
                }
                if ($scope.currentfilter.GuarantorTypeId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorType = item.GuarantorType.Description;
                    }
                } else {
                    $scope.GuarantorType = '';
                }
                totalreceiptamount = totalreceiptamount + (item.ReceivedAmount);
                totaltds = totaltds + (item.TDSAmount);
                totaldisallowanceamount = totaldisallowanceamount + (item.Disallowed);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalRecAmt = totalreceiptamount;
            $scope.TotalTDS = totaltds;
            $scope.TotalDisallowance = totaldisallowanceamount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

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
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalRecAmt = 0;
                $scope.TotalTDS = 0;
                $scope.TotalDisallowance = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 7,
                        Value: From
                    },
                    {
                        Key: 8,
                        Value: To
                    },
                    {
                        Key: 3,
                        Value: 3
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.GuarantorTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.GuarantorId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/insurancepayment/GetInsurancePayments',
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
            if ($scope.Context == 'opinvoicebillingreport') {
                $state.go('app.billingreportstab.opinvoicebillingreport');
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
                    GuarantorType: $scope.GuarantorType,
                    GuarantorName: $scope.GuarantorName
                },
                Params: [{
                        Key: 7,
                        Value: From
                    },
                    {
                        Key: 8,
                        Value: To
                    },
                    {
                        Key: 3,
                        Value: 3
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.GuarantorTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.GuarantorId
                    },
                ],
            };
            var options = {
                action: 'billing/insurancepayment/PrintInsuranceReceiptReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('currentinpatient.ipno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "PaymentDate",
                    displayName: $translate.instant('billing.claimmanagement.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PaymentDate'></ngformatdate>"
                },
                {
                    field: "PaymentIdentifier",
                    displayName: $translate.instant('billing.claimmanagement.receiptnos.lbl')
                },
                {
                    field: "GuarantorName",
                    displayName: $translate.instant('billing.claimmanagement.guarantorname.lbl')
                },
                {
                    field: "PaymentType.Description",
                    displayName: $translate.instant('reports.paymenttype.lbl')
                },
                {
                    field: "ChequeNo",
                    displayName: $translate.instant('reports.chequeno.lbl')
                },
                {
                    field: "ChequeDate",
                    displayName: $translate.instant('reports.chequedate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ChequeDate'></ngformatdate>"
                },
                {
                    field: "ReceivedAmount",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ReceivedAmount | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('billing.claimmanagement.receivedamount.lbl')
                },
                {
                    field: "TDSAmount",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TDSAmount | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('billing.claimmanagement.tds.lbl')
                },
                {
                    field: "Disallowed",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Disallowed | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('billing.claimmanagement.disallowed.lbl')
                },
                {
                    field: "InsurancePaymentStatus.Description",
                    displayName: $translate.instant('billing.claimmanagement.status.lbl')
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

    insurancereceiptreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();