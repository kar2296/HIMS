(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyCardCollectionReportController', PharmacyCardCollectionReportController);

    function PharmacyCardCollectionReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            UserId: -1,
            // UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;



        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Receipt", "Bill Referrence", "Patient Name", "Bill Amount", "Receipt Amount", "Bank Name", "Authorized Code", "Cashier Name"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var receipt = '';
                var billRef = '';
                var patName = '';
                var billAmt = '';
                var recAmt = '';
                var bankName = '';
                var authorize = '';
                var cashier = '';

                if (rowArray.ReceiptDateTime) {
                    // date = rowArray.ReceiptDateTime;
                    // date = $filter('date')(rowArray.ReceiptDateTime, 'yyyy-MM-dd') || null;
                    date = utl.Formatter.getDateTimeString(rowArray.ReceiptDateTime);
                }
                if (rowArray.ReceiptNumber) {
                    receipt = rowArray.ReceiptNumber;
                }
                if (rowArray.PatientBill.BillNumber) {
                    billRef = rowArray.PatientBill.BillNumber;
                }
                if (rowArray.PatientBill.PatientName) {
                    patName = rowArray.PatientBill.PatientName;
                }
                if (rowArray.PatientBill.BillAmount) {
                    billAmt = rowArray.PatientBill.BillAmount;
                }
                if (rowArray.AmountPaid) {
                    recAmt = rowArray.AmountPaid;
                }
                if (rowArray.Bank.Description) {
                    bankName = rowArray.Bank.Description;
                }
                if (rowArray.AuthorizedCode) {
                    authorize = rowArray.AuthorizedCode;
                }
                if (rowArray.CreatedUser.Title) {
                    if (rowArray.CreatedUser.Title.Description) {
                        cashier = rowArray.CreatedUser.Title.Description;
                    }
                }
                if (rowArray.CreatedUser.FirstName) {
                    cashier += ' ' + rowArray.CreatedUser.FirstName;
                }
                if (rowArray.CreatedUser.LastName) {
                    cashier += ' ' + rowArray.CreatedUser.LastName;
                }

                csvContent += date + ',' + receipt + ',' + billRef + ',' + patName + ',' + billAmt + ',' + recAmt + ',' + bankName + ',' + authorize + ',' + cashier + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'pharmacycardcollection-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalAmountPaid = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 27,
                    Value: From
                },
                {
                    Key: 28,
                    Value: To
                },
                {
                    Key: 26,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 23,
                    Value: [5, 6]
                },
                {
                    Key: 13,
                    Value: true
                }
                ],

            };
            var options = {
                action: "billing/PatientPaymentDetails/GetPatientPaymentDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalreceiptamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
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
                    if (item.PatientBill.Gender)
                        var gender = item.PatientBill.Gender.Description
                    item.PatientInfo = item.PatientName + '/' + item.PatientBill.Age + '/' + gender;
                }
                item.AmountPaid = isNaN(parseFloat(item.AmountPaid)) ? (0) : parseFloat(item.AmountPaid);
                totalreceiptamount = totalreceiptamount + (item.AmountPaid)
                vm.gridConfig.data.push(item);
            }
            $scope.TotalAmountPaid = totalreceiptamount;
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
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
                $scope.TotalAmountPaid = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 27,
                    Value: From
                },
                {
                    Key: 28,
                    Value: To
                },
                {
                    Key: 26,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 23,
                    Value: [5, 6]
                },
                {
                    Key: 13,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.UserId = -1;
                // $scope.getList();
            }
        };

        $scope.backtoReport = function () {
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    UserName: $scope.UserName
                },
                Params: [{
                    Key: 27,
                    Value: From
                },
                {
                    Key: 28,
                    Value: To
                },
                {
                    Key: 26,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 23,
                    Value: [5, 6]
                },
                {
                    Key: 13,
                    Value: true
                },
                ],
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintPharmacyCardCollectionReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }
            $scope.UserName = result;
            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "ReceiptDateTime",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReceiptDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "ReceiptNumber",
                displayName: $translate.instant('reports.receipt.lbl')
            },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('reports.billreferrence.lbl')
            },
            {
                field: "PatientInfo",
                displayName: $translate.instant('reports.patient.lbl')

            },
            // {
            //     field: "Patient.MRN",
            //     displayName: $translate.instant('reports.mrn.lbl')
            // },
            {
                field: "PatientBill.BillAmount",
                displayName: $translate.instant('reports.billamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientBill.BillAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "AmountPaid",
                displayName: $translate.instant('reports.receiptamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountPaid | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('Payment Type')
            },
            // {
            //     field: "CardNumber",
            //     displayName: $translate.instant('reports.cardno.lbl')
            // },

            {
                field: "Bank.Description",
                displayName: $translate.instant('reports.bankname.lbl')
            },
            {
                field: "AuthorizedCode",
                displayName: $translate.instant('reports.auth.lbl')
            },
            {
                field: "Cashier Name",
                displayName: $translate.instant('reports.cashiername.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
                                        </div>"
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
            }
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

    PharmacyCardCollectionReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();