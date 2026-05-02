(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('insurancetdsreportController', insurancetdsreportController);

    function insurancetdsreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Date and Time", "Receipt", "Payer Name", "Patient Name", "MRN", "Bill Number", "Bill Date","Tds", "Remark"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var date = '';
                var receipt = '';
                var insurance = '';
                var patName = '';
                var mrn = '';
                var billNum = '';
                var tds = '';
                var billDate ='';
                var remark = '';

                if (rowArray.InsurancePayment.PaymentDate) {
                    date = rowArray.InsurancePayment.PaymentDate;
                }
                if (rowArray.InsurancePayment.PaymentIdentifier) {
                    receipt = rowArray.InsurancePayment.PaymentIdentifier;
                }
                if (rowArray.InsurancePayment.GuarantorName) {
                    insurance = rowArray.InsurancePayment.GuarantorName;
                }
                if (rowArray.Patient.Title.Description) {
                    patName = rowArray.Patient.Title.Description;
                }
                if (rowArray.Patient.FirstName) {
                    patName += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patName += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.BillIdentifier) {
                    billNum = rowArray.BillIdentifier;
                }
                if (rowArray.BillDateTime) {
                    tds = rowArray.BillDateTime;
                }
                if (rowArray.Disallowed) {
                    billDate = rowArray.Disallowed;
                }
                if (rowArray.Comments) {
                    remark = rowArray.Comments;
                }
                csvContent += date + ',' + receipt + ',' + insurance + ',' + patName + ',' + mrn + ',' + billNum + ',' + tds + ',' + billDate + ',' + remark + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'insurancetdsreport.csv';
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
                    Key: 4,
                    Value: From
                },
                {
                    Key: 5,
                    Value: To
                },
                {
                    Key: 6,
                    Value: 3
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.GuarantorTypeId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 9,
                    Value: '0'
                },
                ],

            };

            var options = {
                action: "billing/insurancepaymentdetails/GetInsurancePaymentDetails",
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
                        $scope.GuarantorName = item.InsurancePayment.GuarantorName;
                    }
                }
                else {
                    $scope.GuarantorName = '';
                }
                if ($scope.currentfilter.GuarantorTypeId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorType = item.InsurancePayment.GuarantorType.Description;
                    }
                }
                else {
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
        $scope.backtoReport = function () {
            if ($scope.Context == 'opinvoicebillingreport') {
                $state.go('app.billingreportstab.opinvoicebillingreport');
            } if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }

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
                    Key: 4,
                    Value: From
                },
                {
                    Key: 5,
                    Value: To
                },
                {
                    Key: 6,
                    Value: 3
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.GuarantorTypeId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 9,
                    Value: '0'
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/insurancepaymentdetails/GetInsurancePaymentDetails',
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

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: $scope.currentfilter.FacilityId,
                    GuarantorType: $scope.GuarantorType,
                    GuarantorName: $scope.GuarantorName,
                },
                Params: [{
                    Key: 4,
                    Value: From
                },
                {
                    Key: 5,
                    Value: To
                },
                {
                    Key: 6,
                    Value: 3
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.GuarantorTypeId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 9,
                    Value: '0'
                },
                ],
            };
            var options = {
                action: 'billing/insurancepaymentdetails/PrintInsurancetdsreport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No",
                    displayName: $translate.instant('currentinpatient.ipno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "InsurancePayment.PaymentDate",
                    displayName: $translate.instant('billing.claimmanagement.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.InsurancePayment.PaymentDate'></ngformatdate>"
                },
                {
                    field: "InsurancePayment.PaymentIdentifier",
                    displayName: $translate.instant('billing.claimmanagement.receiptnos.lbl')
                },
                {
                    field: "InsurancePayment.GuarantorName",
                    displayName: $translate.instant('billing.claimmanagement.guarantorname.lbl')
                },
                {
                    field: "Patient Name",
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
                    field: "BillIdentifier",
                    displayName: $translate.instant('reports.billno.lbl')
                },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('reports.billdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
                },
                {
                    field: "TDSAmount",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TDSAmount | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('billing.claimmanagement.tds.lbl')
                },
                {
                    field: "Comments",
                    displayName: $translate.instant('reports.remark.lbl')
                },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
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
            { "Key": "GuarantorType" },
            {
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },]
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

    insurancetdsreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();