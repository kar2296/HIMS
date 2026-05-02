(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StaffPendingPaymentReportController', StaffPendingPaymentReportController);

    function StaffPendingPaymentReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = [" Bill Date", "Bill Number", "Patient Name", "Bill Amount", "Bill Discount", "Net Amount", "Paid Amount", "Due Amount"]
            let csvContent = JsonFields.join(",") + "\n";
            var billdata = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.NetAmount = parseInt(item.BillAmount) - parseInt(item.BillDiscount);
                billdata.push(item);
            }
            billdata.forEach(function (rowArray) {
                var billDate = '';
                var billNum = '';
                var patName = '';
                var billAmt = '';
                var billDis = '';
                var netAmt = '';
                var paidAmt = '';
                var dueAMt = '';

                if (rowArray.BillDateTime) {
                    // billDate = rowArray.BillDateTime;
                    // billDate = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd 00:00:00') || null;
                    billDate = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.BillNumber) {
                    billNum = rowArray.BillNumber;
                }
                // if (rowArray.PatientInfo) {
                //     patName = rowArray.PatientInfo;
                // }
                if (rowArray.BillAmount) {
                    billAmt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    billDis = rowArray.BillDiscount;
                }
                if (rowArray.NetAmount) {
                    netamt = rowArray.NetAmount;
                }
                if (rowArray.PaidAmount) {
                    paidAmt = rowArray.PaidAmount;
                }
                if (rowArray.OutStandingAmount) {
                    dueAMt = rowArray.OutStandingAmount;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title) {
                            patName = rowArray.Patient.Title.Description;
                        }
                        if (rowArray.Patient.FirstName) {
                            patName += ' ' + rowArray.Patient.FirstName;
                        }
                        if (rowArray.Patient.LastName) {
                            patName += ' ' + rowArray.Patient.LastName;
                        }
                        if (rowArray.Patient.MRN) {
                            patName += ' ' + rowArray.Patient.MRN;
                        }
                    }
                }


                csvContent += billDate + ',' + billNum + ',' + patName + ',' + billAmt + ',' + billDis + ',' + netAmt + ',' + paidAmt + ',' + dueAMt + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'staffpendingpayment-report.csv';
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
                $scope.TotalGSTAmt = 0;
                $scope.TotalCGSTAmt = 0;
                $scope.TotalSGSTAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 17,
                    Value: From
                },
                {
                    Key: 18,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 59,
                    Value: $scope.currentfilter.StaffId
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 33,
                    Value: 6
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 56,
                    Value: true
                },
                {
                    Key: 50,
                    Value: false
                }
                ],

            };
            var options = {
                action: "billing/patientbills/GetPatientBills",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalbillamount = 0;
            var totalbilldiscount = 0;
            var totalpaidamount = 0;
            var totaldueamount = 0;
            var totalgstamount = 0;
            var totalcgstamount = 0;
            var totalsgstamount = 0;
            var totalnetamount = 0;
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
                    item.PatientInfo = item.PatientName + '/' + item.Age + '/' + item.Gender.Description;
                }
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = res.Data[0].StoreMaster.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.StaffId > 0) {
                    if (item.StaffUser) {
                        if (item.StaffUser.Title)
                            $scope.StaffName = item.StaffUser.Title.Description;
                        if (item.StaffUser.FirstName)
                            $scope.StaffName += ' ' + item.StaffUser.FirstName;
                        if (item.StaffUser.LastName)
                            $scope.StaffName += ' ' + item.StaffUser.LastName;
                    }
                }
                else {
                    $scope.StaffName = '';
                }
                totalbillamount = totalbillamount + (item.BillAmount);
                totalbilldiscount = totalbilldiscount + (item.BillDiscount);
                item.NetAmount = parseInt(item.BillAmount) - parseInt(item.BillDiscount);
                totalnetamount = totalnetamount + (item.NetAmount);
                totalpaidamount = totalpaidamount + (item.PaidAmount);
                totaldueamount = totaldueamount + (item.OutStandingAmount);
                totalgstamount = totalgstamount + (item.GSTAmount);
                totalcgstamount = totalcgstamount + (item.CGstAmount);
                totalsgstamount = totalsgstamount + (item.SGstAmount);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalBillAmt = totalbillamount;
            $scope.TotalDisAmt = totalbilldiscount;
            $scope.TotalPaidAmt = totalpaidamount;
            $scope.TotalNetAmt = totalnetamount;
            $scope.TotalDueAmt = totaldueamount;
            $scope.TotalGSTAmt = totalgstamount;
            $scope.TotalCGSTAmt = totalcgstamount;
            $scope.TotalSGSTAmt = totalsgstamount;
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
                $scope.TotalGSTAmt = 0;
                $scope.TotalCGSTAmt = 0;
                $scope.TotalSGSTAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 17,
                    Value: From
                },
                {
                    Key: 18,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 59,
                    Value: $scope.currentfilter.StaffId
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 33,
                    Value: 6
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 56,
                    Value: true
                },
                {
                    Key: 50,
                    Value: false
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.StaffId = -1
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
                    StaffName: $scope.StaffName,
                    StoreName: $scope.StoreName
                },
                Params: [{
                    Key: 17,
                    Value: From
                },
                {
                    Key: 18,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 59,
                    Value: $scope.currentfilter.StaffId
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 33,
                    Value: 6
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 56,
                    Value: true
                },
                {
                    Key: 50,
                    Value: false
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintStaffPendingPaymentReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };



        vm.staffcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Staff Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Staff Name',
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
            var selectedItem = vm.staffcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.staffcontrolconfig.rowdata) {
                result = [vm.staffcontrolconfig.rowdata.UserId, vm.staffcontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.staffcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 19,
                    Value: true
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.staffcontrolconfig.searchbyid == true) {
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

            vm.staffcontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.staffcontrolconfig.result) {
                var item = vm.staffcontrolconfig.result[idx];
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
                field: "BillDateTime",
                displayName: $translate.instant('reports.billdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "BillNumber",
                displayName: $translate.instant('reports.billno.lbl')
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
                field: "BillAmount",
                displayName: $translate.instant('reports.billamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"

            },
            {
                field: "BillDiscount",
                displayName: $translate.instant('reports.billdis.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PaidAmount",
                displayName: $translate.instant('reports.paidamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "OutStandingAmount",
                displayName: $translate.instant('reports.dueamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
            },
                // {
                //     field: "GSTAmount",
                //     displayName: $translate.instant('reports.gst.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GSTAmount | displaycurrency}}</span>" + "</div>"
                // },
                // {
                //     field: "CGstAmount",
                //     displayName: $translate.instant('reports.cgst.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.CGstAmount | displaycurrency}}</span>" + "</div>"
                // },
                // {
                //     field: "SGstAmount",
                //     displayName: $translate.instant('reports.sgst.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.SGstAmount | displaycurrency}}</span>" + "</div>"
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
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
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
                "Key": "UserStores",
                Default: false,
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
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

    StaffPendingPaymentReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();