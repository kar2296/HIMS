(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPRefundReportController', IPRefundReportController);

    function IPRefundReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Refund No", "Bill Referrence", "Patient Name", "MRN", "Refund Amount", "Payment Type", "Refund Status", "Cashier Name"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var refundNo = '';
                var billNef = '';
                var patientName = '';
                var mrn = '';
                var refundAmt = '';
                var paymentType = '';
                var refundStatus = '';
                var cashier = '';

                if (rowArray.RefundDateTime) {
                    // date = rowArray.RefundDateTime;
                    // date = $filter('date')(rowArray.RefundDateTime, 'yyyy-MM-dd') || null;
                    date = utl.Formatter.getDateTimeString(rowArray.RefundDateTime);
                }
                if (rowArray.RefundIdentifier) {
                    refundNo = rowArray.RefundIdentifier;
                }
                if (rowArray.PatientBill) {
                    if (rowArray.PatientBill.BillNumber) {
                        billNef = rowArray.PatientBill.BillNumber;
                    }
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patientName = rowArray.Patient.Title.Description;
                        }
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
                }
                if (rowArray.RefundAmount) {
                    refundAmt = rowArray.RefundAmount;
                }
                if (rowArray.PaymentType) {
                    if (rowArray.PaymentType.Description) {
                        paymentType = rowArray.PaymentType.Description;
                    }
                }
                if (rowArray.RefundStatus) {
                    if (rowArray.RefundStatus.Description) {
                        refundStatus = rowArray.RefundStatus.Description;
                    }
                }
                if (rowArray.CreatedUser) {
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
                }

                csvContent += date + ',' + refundNo + ',' + billNef + ',' + patientName + ',' + mrn + ',' + refundAmt + ',' + paymentType + ',' + refundStatus + ',' + cashier + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'iprefundreport.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalRefAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 12,
                    Value: From
                },
                {
                    Key: 13,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 11,
                    Value: 2
                }
                ],

            };
            var options = {
                action: "Billing/PatientRefund/GetPatientRefund",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalrefundamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                totalrefundamount = totalrefundamount + (item.RefundAmount);
                if ($scope.currentfilter.PaymentTypeId > 0) {
                    $scope.PaymentType = res.Data[0].PaymentType.Description;
                }
                vm.gridConfig.data.push(item);
            }
            $scope.TotalRefAmt = totalrefundamount;
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
                $scope.TotalRefAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 12,
                    Value: From
                },
                {
                    Key: 13,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 11,
                    Value: 2
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
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
            } if ($scope.Context == 'collectionsummary') {
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
                    UserName: $scope.currentfilter.UserName,
                    PaymentType: $scope.PaymentType
                },
                Params: [{
                    Key: 12,
                    Value: From
                },
                {
                    Key: 13,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 11,
                    Value: 2
                },
                ],
            };
            var options = {
                action: 'Billing/PatientRefund/PrintIPRefundReport',
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
                    PageSize: -1,
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
                field: "RefundDateTime",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RefundDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "RefundIdentifier",
                displayName: $translate.instant('reports.refundno.lbl')
            },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('reports.billreferrence.lbl')
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
                field: "RefundAmount",
                displayName: $translate.instant('reports.refundamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RefundAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('reports.paymenttype.lbl')
            },

            {
                field: "RefundStatus.Description",
                displayName: $translate.instant('reports.refundstatus.lbl')
            },
            {
                field: "Bank.Description",
                displayName: $translate.instant('Bank Name')
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
            },
            {
                "Key": "PaymentType"
            }]
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

    IPRefundReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();