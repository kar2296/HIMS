(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalCollectionReportController', OpticalCollectionReportController);

    function OpticalCollectionReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Bill Referrence", "Receipt Amount", "Payment Type"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var billref = '';
                var receiptAmt = '';
                var payType = '';
                      
                if (rowArray.ReceiptDateTime) {
                    date = rowArray.ReceiptDateTime;
                }
                if (rowArray.PatientBill.BillNumber) {
                    billref = rowArray.PatientBill.BillNumber;
                }
                if (rowArray.AmountPaid) {
                    receiptAmt = rowArray.AmountPaid;
                }
                if (rowArray.PaymentType.Description) {
                    payType = rowArray.PaymentType.Description;
                }
                csvContent += date + ',' + billref + ',' + receiptAmt + ',' + payType + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'opticalcollectionreport.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
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
                    Key: 23,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 12,
                    Value: 4
                },
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
            var totalrefundamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.PaymentTypeId > 0) {
                    $scope.PaymentType = item.PaymentType.Description;
                }
                item.AmountPaid = isNaN(parseFloat(item.AmountPaid)) ? (0) : parseFloat(item.AmountPaid);
                item.PatientBill.RefundAmount = isNaN(parseFloat(item.PatientBill.RefundAmount)) ? (0) : parseFloat(item.PatientBill.RefundAmount);
                totalreceiptamount = totalreceiptamount + (item.AmountPaid)
                totalrefundamount = totalrefundamount + (item.PatientBill.RefundAmount)
                vm.gridConfig.data.push(item);
            }
            $scope.TotalAmountPaid = totalreceiptamount;
            $scope.TotalRefundAmount = totalrefundamount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
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
                    Key: 23,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 12,
                    Value: 4
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
                $scope.getList();
            }
        };

        $scope.backtoReport = function() {
            $state.go('app.opticalreports')
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
                    Key: 23,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 5,
                    Value: 1
                },
                ],
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintOpticalCollectionReport',
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
            // {
            //     field: "ReceiptNumber",
            //     displayName: $translate.instant('reports.receipt.lbl')
            // },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('reports.billreferrence.lbl')
            },
            {
                field: "PatientName",
                displayName: $translate.instant('Patient Name')
            },
            // {
            //     field: "Patient Name",
            //     displayName: $translate.instant('reports.patient.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            //                            <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
            //                            <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
            //                             </div>"
            // },
            // {
            //     field: "Patient.MRN",
            //     displayName: $translate.instant('reports.mrn.lbl')
            // },
            {
                field: "AmountPaid",
                displayName: $translate.instant('reports.receiptamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountPaid | displaycurrency}}</span>" + "</div>"
            },
            // {
            //     field: "PatientBill.RefundAmount",
            //     displayName: $translate.instant('reports.refundamount.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientBill.RefundAmount | displaycurrency}}</span>" + "</div>"
            // },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('reports.paymenttype.lbl')
            },

            // {
            //     field: "ReceiptStatus.Description",
            //     displayName: $translate.instant('reports.receiptstatus.lbl')
            // },
            // {
            //     field: "Cashier Name",
            //     displayName: $translate.instant('reports.cashiername.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            //                            <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
            //                            <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
            //                             </div>"
            // },
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
            $scope.getList();
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

    OpticalCollectionReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();