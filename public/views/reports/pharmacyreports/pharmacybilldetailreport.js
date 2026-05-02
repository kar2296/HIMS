(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyBillDetailReportController', PharmacyBillDetailReportController);

    function PharmacyBillDetailReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Bill Date", "Bill Number", "Patient Name", "Bill Amount", "Bill Discount", "Net Amount", "Paid Amount", "Due Amount", "GST", "CGST", "SGST"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var billDate = '';
                var billNum = '';
                var patName = '';
                var billAmt = '';
                var billDis = '';
                var netAmt = '';
                var paidAmt = '';
                var dueAmt = '';
                var gst = '';
                var cgst = '';
                var sgst = '';


                if (rowArray.BillDateTime) {
                    // billDate = rowArray.BillDateTime;
                    // billDate = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                    billDate = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.BillNumber) {
                    billNum = rowArray.BillNumber;
                }
                if (rowArray.PatientInfo) {
                    patName = rowArray.PatientInfo;
                }
                if (rowArray.BillAmount) {
                    billAmt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    billDis = rowArray.BillDiscount;
                }
                if (rowArray.NetAmount) {
                    netAmt = rowArray.NetAmount;
                }
                if (rowArray.PaidAmount) {
                    paidAmt = rowArray.PaidAmount;
                }
                if (rowArray.OutStandingAmount) {
                    dueAmt = rowArray.OutStandingAmount;
                }
                if (rowArray.GSTAmount) {
                    gst = rowArray.GSTAmount;
                }
                if (rowArray.CGstAmount) {
                    cgst = rowArray.CGstAmount;
                }
                if (rowArray.SGstAmount) {
                    sgst = rowArray.SGstAmount;
                }


                csvContent += billDate + ',' + billNum + ',' + patName + ',' + billAmt + ',' + billDis + ',' + netAmt + ',' + paidAmt + ',' + dueAmt + ',' + gst + ',' + cgst + ',' + sgst + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'pharmacybilldetail-report.csv';
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
                    Key: 39,
                    Value: $scope.currentfilter.CreatedBy
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 33,
                    Value: 4
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 74,
                    Value: $scope.currentfilter.PatientTypeId
                },
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
                    item.PatientInfo = item.PatientName + '/' + item.Age;
                    if (item.Gender)
                        item.PatientInfo += '/' + item.Gender.Description;

                }
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = res.Data[0].StoreMaster.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.CreatedBy > 0) {
                    if (item.CreatedUser.Title)
                        $scope.UserName = item.CreatedUser.Title.Description;
                    if (item.CreatedUser.FirstName)
                        $scope.UserName += ' ' + item.CreatedUser.FirstName;
                    if (item.CreatedUser.LastName)
                        $scope.UserName += ' ' + item.CreatedUser.LastName;
                } else {
                    $scope.UserName = '';
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
                    Key: 74,
                    Value: $scope.currentfilter.PatientTypeId
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.CreatedBy
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 6,
                    Value: 4
                },
                {
                    Key: 4,
                    Value: 3
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
                $scope.currentfilter.CreatedBy = -1
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'invoicecollectionreport') {
                $state.go('app.pharmacytabreport.invoicecollectionreport');
            }
            if ($scope.Context == 'pharmacyreport') {
                $state.go('app.financereporttab.pharmacyreport');
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
                    UserName: $scope.UserName,
                    StoreName: $scope.StoreName,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId,
                    StoreMaster: $scope.currentfilter.StoreMaster,
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
                    Key: 39,
                    Value: $scope.currentfilter.CreatedBy
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 33,
                    Value: 4
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 74,
                    Value: $scope.currentfilter.PatientTypeId
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintPharmacyBillDetailReport',
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
                field: "idx",
                displayName: $translate.instant('S.No'),
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
            {
                field: "GSTAmount",
                displayName: $translate.instant('reports.gst.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GSTAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "CGstAmount",
                displayName: $translate.instant('reports.cgst.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.CGstAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "SGstAmount",
                displayName: $translate.instant('reports.sgst.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.SGstAmount | displaycurrency}}</span>" + "</div>"
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
                "Key": 'PatientType'
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

    PharmacyBillDetailReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();