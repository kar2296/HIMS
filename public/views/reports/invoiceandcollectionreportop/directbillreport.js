(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DirectBillReportController', DirectBillReportController);

    function DirectBillReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = [" Bill Date", "Bill Number", "Patient Name", "Bill Amount", "Bill Discount", "Net Amount", "Paid Amount", "Due Amount"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var billdate = '';
                var billno = '';
                var patname = '';
                var billAmt = '';
                var billDis = '';
                var netAmt = '';
                var paidAmt = '';
                var dueAmt = '';

                if (rowArray.BillDateTime) {
                    // billdate = rowArray.BillDateTime;
                    // billdate = $filter('date')(rowArray.BillDateTime,'yyyy-MM-dd') || null;
                    billdate = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }

                if (rowArray.BillNumber) {
                    billno = rowArray.BillNumber;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patname = rowArray.Patient.Title.Description;
                        }
                    }
                    if (rowArray.Patient.FirstName) {
                        patname += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patname += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.BillAmount) {
                    billAmt = rowArray.BillAmount;
                }
                if (rowArray.PatientBillDetails) {
                    if (rowArray.PatientBillDetails.BillDiscount) {
                        billDis = rowArray.PatientBillDetails.BillDiscount;
                    }
                }
                if (rowArray.PaidAmount) {
                    netAmt = rowArray.PaidAmount;
                }
                if (rowArray.PaidAmount) {
                    paidAmt = rowArray.PaidAmount;
                }
                if (rowArray.OutStandingAmount) {
                    dueAmt = rowArray.OutStandingAmount;
                }


                csvContent += billdate + ',' + billno + ',' + patname + ',' + billAmt + ',' + billDis + ',' + netAmt + ',' + paidAmt + ',' + dueAmt + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'directbill-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.From || $scope.currentfilter.From == '' ||
                !$scope.currentfilter.To || $scope.currentfilter.To == '') {
                vm.gridConfig.data = [];
                $scope.TotalBillAmt = 0;
                $scope.TotalDisAmt = 0;
                $scope.TotalNetAmt = 0;
                $scope.TotalPaidAmt = 0;
                $scope.TotalDueAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 17,
                    Value: $scope.currentfilter.From
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 6,
                    Value: 5
                },
                {
                    Key: 4,
                    Value: 3
                },
                ],

            };
            var options = {
                action: "billing/patientbills/GetPatientBillswithoutdetails",
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
            var totalnetamount = 0;
            var totalpaidamount = 0;
            var totaldueamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                totalbillamount = totalbillamount + (item.BillAmount);
                totalbilldiscount = totalbilldiscount + (item.BillDiscount);
                item.NetAmount = parseInt(item.BillAmount) - parseInt(item.BillDiscount);
                totalnetamount = totalnetamount + (item.NetAmount);
                totalpaidamount = totalpaidamount + (item.PaidAmount);
                totaldueamount = totaldueamount + (item.OutStandingAmount);
                vm.gridConfig.data.push(item);
            }
            $scope.TotalBillAmt = totalbillamount;
            $scope.TotalDisAmt = totalbilldiscount;
            $scope.TotalNetAmt = totalnetamount;
            $scope.TotalPaidAmt = totalpaidamount;
            $scope.TotalDueAmt = totaldueamount;
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }
            if (!$scope.currentfilter.From || $scope.currentfilter.From == '' ||
                !$scope.currentfilter.To || $scope.currentfilter.To == '') {
                vm.gridConfig.data = [];
                $scope.TotalBillAmt = 0;
                $scope.TotalDisAmt = 0;
                $scope.TotalNetAmt = 0;
                $scope.TotalPaidAmt = 0;
                $scope.TotalDueAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 17,
                    Value: $scope.currentfilter.From
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 6,
                    Value: 5
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
                action: 'billing/patientbills/GetPatientBillswithoutdetails',
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
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityName: $scope.currentfilter.FacilityName
                },
                Params: [{
                    Key: 17,
                    Value: $scope.currentfilter.From
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 6,
                    Value: 5
                },
                {
                    Key: 4,
                    Value: 3
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintDirectBillReport',
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
                field: "BillDateTime",
                displayName: $translate.instant('reports.billdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "BillNumber",
                displayName: $translate.instant('reports.billno.lbl')
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

    DirectBillReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();