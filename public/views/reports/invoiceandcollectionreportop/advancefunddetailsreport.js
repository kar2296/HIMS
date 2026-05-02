(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('advancefunddetailsreportController', advancefunddetailsreportController);

    function advancefunddetailsreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Receipt Date", "Receipt Number", "MRN", "Patient Name", "Department", "Receipt Amt", "Adjust Amt", "Pending Amt", "Payment Type", "Remark"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var recDate = '';
                var recNum = '';
                var mrn = '';
                var patName = '';
                var dept = '';
                var receiptAmy = '';
                var adjAmt = '';
                var pendingAmt = '';
                var payType = '';
                var remark = '';

                if (rowArray.ReceiptDateTime) {
                    // recDate = rowArray.ReceiptDateTime; 
                    // recDate = $filter('date')(rowArray.ReceiptDateTime, 'yyyy-MM-dd HH:MM') || null;
                    recDate = utl.Formatter.getDateTimeString(rowArray.ReceiptDateTime);
                }
                if (rowArray.ReceiptNumber) {
                    recNum = rowArray.ReceiptNumber;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.MRN) {
                        mrn = rowArray.Patient.MRN;
                    }

                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patName = rowArray.Patient.Title.Description;
                        }
                    }
                    if (rowArray.Patient.FirstName) {
                        patName += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patName += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        dept = rowArray.Department.DepartmentName;
                    }
                }
                if (rowArray.AmountPaid) {
                    receiptAmy = rowArray.AmountPaid;
                }
                if (rowArray.AmountAdjusted) {
                    adjAmt = rowArray.AmountAdjusted;
                }
                if (rowArray.PendingAmount) {
                    pendingAmt = rowArray.PendingAmount;
                }
                if (rowArray.PaymentType) {
                    if (rowArray.PaymentType.Description) {
                        payType = rowArray.PaymentType.Description;
                    }
                }
                if (rowArray.Comments) {
                    remark = rowArray.Comments;
                }


                csvContent += recDate + ',' + recNum + ',' + mrn + ',' + patName + ',' + dept + ',' + receiptAmy + ',' + adjAmt + ',' + pendingAmt + ',' + payType + ',' + remark + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'advancefunddetails.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalBillAmt = 0;
                $scope.TotalDisAmt = 0;
                $scope.TotalNetAmt = 0;
                $scope.TotalPaidAmt = 0;
                $scope.TotalDueAmt = 0;
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
                    Key: 32,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 13,
                    Value: false
                },
                {
                    Key: 21,
                    Value: 1
                },
                ],

            };
            var options = {
                action: "Billing/PatientPaymentDetails/GetPatientPaymentDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };




        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalreceiptamount = 0;
            var totaladjustdiscount = 0;
            var totalpendingamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.DepartmentId > 0) {
                    if (res.Data.length > 0) {
                        $scope.DepartmentName = item.Department.DepartmentName;
                    }
                }
                else {
                    $scope.DepartmentName = '';
                }
                totalreceiptamount = totalreceiptamount + (item.AmountPaid);
                totaladjustdiscount = totaladjustdiscount + (item.AmountAdjusted);
                item.PendingAmount = parseInt(item.AmountPaid) - parseInt(item.AmountAdjusted);
                totalpendingamount = totalpendingamount + (item.PendingAmount);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalReceiptAmt = totalreceiptamount;
            $scope.TotalAdjustAmt = totaladjustdiscount;
            $scope.TotalPendingAmt = totalpendingamount;
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
                $scope.TotalBillAmt = 0;
                $scope.TotalDisAmt = 0;
                $scope.TotalNetAmt = 0;
                $scope.TotalPaidAmt = 0;
                $scope.TotalDueAmt = 0;
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
                    Key: 32,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 13,
                    Value: false
                },
                {
                    Key: 21,
                    Value: 1
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
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
                    DoctorName: $scope.DoctorName,
                    GuarantorName: $scope.GuarantorName,
                    DepartmentName: $scope.DepartmentName
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
                    Key: 32,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 13,
                    Value: false
                },
                {
                    Key: 21,
                    Value: 1
                },
                ],
            };
            var options = {
                action: 'Billing/PatientPaymentDetails/PrintAdvanceFundDetailsReport',
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
                displayName: $translate.instant('Receipt Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReceiptDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "ReceiptNumber",
                displayName: $translate.instant('Receipt Number')
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('MRN')
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
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "AmountPaid",
                displayName: $translate.instant('Receipt Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountPaid | displaycurrency}}</span>" + "</div>"

            },
            {
                field: "AmountAdjusted",
                displayName: $translate.instant('Adjust Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountAdjusted | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PendingAmount",
                displayName: $translate.instant('Pending Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PendingAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('Payment Type')
            },
            {
                field: "Comments",
                displayName: $translate.instant('Remark')
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
            var inputData = [

                { "Key": "Department" }]
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

    advancefunddetailsreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();