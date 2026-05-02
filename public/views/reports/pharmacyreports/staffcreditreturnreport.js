(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StaffCreditReturnReportController', StaffCreditReturnReportController);

    function StaffCreditReturnReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Return Date", "Return Number", "Patient Name", "MRN", "Doctor Name", "Return Amount", "Return Discount", "Issued By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var returnDate = '';
                var returnNum = '';
                var patientName = '';
                var mrn = '';
                var docName = '';
                var returnAmt = '';
                var returnDis = '';
                var issueBy = '';

                if (rowArray.ReturnDateTime) {
                    // returnDate = rowArray.ReturnDateTime;
                    returnDate = utl.Formatter.getDateTimeString(rowArray.ReturnDateTime);
                }
                if (rowArray.BillDateTime) {
                    // returnDate += ' ' + rowArray.BillDateTime;
                    returnDate += ' ' + utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.ReturnNumber) {
                    returnNum = rowArray.ReturnNumber;
                }
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
                if (rowArray.User.Title) {
                    if (rowArray.User.Title.Description) {
                        docName = rowArray.User.Title.Description;
                    }
                }
                if (rowArray.User.FirstName) {
                    docName += ' ' + rowArray.User.FirstName;
                }
                if (rowArray.User.LastName) {
                    docName += ' ' + rowArray.User.LastName;
                }

                if (rowArray.ReturnAmount) {
                    returnAmt += ' ' + rowArray.ReturnAmount;
                }
                if (rowArray.DiscountAmount) {
                    returnDis = rowArray.DiscountAmount;
                }
                if (rowArray.CreatedUser.Title) {
                    if (rowArray.CreatedUser.Title.Description) {
                        issueBy = rowArray.CreatedUser.Title.Description;
                    }
                }
                if (rowArray.CreatedUser.FirstName) {
                    issueBy += ' ' + rowArray.CreatedUser.FirstName;
                }
                if (rowArray.CreatedUser.LastName) {
                    issueBy += ' ' + rowArray.CreatedUser.LastName;
                }


                csvContent += returnDate + ',' + returnNum + ',' + patientName + ',' + mrn + ',' + docName + ',' + returnAmt + ',' + returnDis + ',' + issueBy + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'staffcreditreturn-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalRetAmt = 0;
                $scope.TotalDisAmt = 0;
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
                    Key: 24,
                    Value: From
                },
                {
                    Key: 25,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.StoreMasterId
                },
                // {
                //     Key: 29,
                //     Value: $scope.currentfilter.WardId
                // },
                {
                    Key: 4,
                    Value: 2
                },
                {
                    Key: 6,
                    Value: 7
                }
                ],

            };
            var options = {
                action: "billing/patientreturns/GetPatientReturns",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalreturnamount = 0;
            var totaldiscount = 0;
            var totalgstamount = 0;
            var totalcgstamount = 0;
            var totalsgstamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.StoreMaster.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                // if ($scope.currentfilter.WardId > 0) {
                //     $scope.WardName = item.WardMaster.WardName;
                // }
                // else {
                //     $scope.WardName = '';
                // }
                totalreturnamount = totalreturnamount + (item.ReturnAmount);
                totaldiscount = totaldiscount + (item.DiscountAmount);
                totalgstamount = totalgstamount + (item.GstAmount);
                totalcgstamount = totalcgstamount + (item.CGstAmount);
                totalsgstamount = totalsgstamount + (item.SGstAmount);
                vm.gridConfig.data.push(item);
            }
            $scope.TotalRetAmt = totalreturnamount;
            $scope.TotalDisAmt = totaldiscount;
            $scope.TotalGSTAmt = totalgstamount;
            $scope.TotalCGSTAmt = totalcgstamount;
            $scope.TotalSGSTAmt = totalsgstamount;

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
                $scope.TotalRetAmt = 0;
                $scope.TotalDisAmt = 0;
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
                    Key: 24,
                    Value: From
                },
                {
                    Key: 25,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.StoreMasterId
                },
                // {
                //     Key: 29,
                //     Value: $scope.currentfilter.WardId
                // },
                {
                    Key: 4,
                    Value: 2
                },
                {
                    Key: 6,
                    Value: 7
                },
                    // {
                    //     Key: 28,
                    //     Value: $scope.currentfilter.patientname
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
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
                    StoreName: $scope.StoreName,
                    WardName: $scope.WardName
                },
                Params: [{
                    Key: 24,
                    Value: From
                },
                {
                    Key: 25,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 4,
                    Value: 2
                },
                {
                    Key: 6,
                    Value: 7
                },
                ],
            };
            var options = {
                action: 'billing/patientreturns/PrintStaffCreditReturnReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "ReturnDateTime",
                displayName: $translate.instant('reports.returndate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReturnDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "ReturnNumber",
                displayName: $translate.instant('reports.returnno.lbl')
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
            // {
            //     field: "Encounter.VisitIdentifier",
            //     displayName: $translate.instant('reports.opvisitnum.lbl')
            // },
            {
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}\
                                        </div>"
            },
            {
                field: "ReturnAmount",
                displayName: $translate.instant('reports.returnamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ReturnAmount | displaycurrency}}</span>" + "</div>"

            },
            {
                field: "DiscountAmount",
                displayName: $translate.instant('reports.returndis.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DiscountAmount | displaycurrency}}</span>" + "</div>"
            },

            {
                field: "Issued Name",
                displayName: $translate.instant('reports.issuedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}\
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
            },
            {
                "Key": "Ward"
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

    StaffCreditReturnReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();