(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DiscountReportController', DiscountReportController);

    function DiscountReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Bill Date", "Bill Number", "MRN", "Patient Name", "Discount Per", "Bill Amount", "Bill Discount", "Net Amount", "Doctor Name", "Discount Approval", "Remark", "Billed By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var billdate = '';
                var billno = '';
                var mrn = '';
                var patname = '';
                var disper = '';
                var billamt = '';
                var billdis = '';
                var netamt = '';
                var docName = '';
                var disApprove = '';
                var remark = '';
                var billedBy = '';

                if (rowArray.BillDateTime) {
                    // billdate = rowArray.BillDateTime;
                    // billdate = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                    billdate = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.BillNumber) {
                    billno = rowArray.BillNumber;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patname = rowArray.Patient.Title.Description;
                        }
                        if (rowArray.Patient.FirstName) {
                            patname += ' ' + rowArray.Patient.FirstName;
                        }
                        if (rowArray.Patient.LastName) {
                            patname += ' ' + rowArray.Patient.LastName;
                        }
                    }
                }
                if (rowArray.DiscountPercentage) {
                    disper = rowArray.DiscountPercentage;
                }
                if (rowArray.BillAmount) {
                    billamt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    billdis = rowArray.BillDiscount;
                }
                if (rowArray.BillAmount) {
                    netamt = rowArray.BillAmount - rowArray.BillDiscount;
                }
                if (rowArray.User) {
                    if (rowArray.User.Title.Description) {
                        docName = rowArray.User.Title.Description;
                    }
                    if (rowArray.User.FirstName) {
                        docName += ' ' + rowArray.User.FirstName;
                    }
                    if (rowArray.User.LastName) {
                        docName += ' ' + rowArray.User.LastName;
                    }
                }
                if (rowArray.DiscountApprovedUser) {
                    if (rowArray.DiscountApprovedUser.Title) {
                        if (rowArray.DiscountApprovedUser.Title.Description) {
                            disApprove = rowArray.DiscountApprovedUser.Title.Description;
                        }
                    }
                    if (rowArray.DiscountApprovedUser.FirstName) {
                        disApprove += ' ' + rowArray.DiscountApprovedUser.FirstName;
                    }
                    if (rowArray.DiscountApprovedUser.LastName) {
                        disApprove += ' ' + rowArray.DiscountApprovedUser.LastName;
                    }
                }
                if (rowArray.Comments) {
                    remark = rowArray.Comments;
                }
                if (rowArray.Updateduser) {
                    if (rowArray.Updateduser.Title) {
                        if (rowArray.Updateduser.Title.Description) {
                            billedBy = rowArray.Updateduser.Title.Description;
                        }
                    }
                    if (rowArray.Updateduser.FirstName) {
                        billedBy += ' ' + rowArray.Updateduser.FirstName;
                    }
                    if (rowArray.Updateduser.LastName) {
                        billedBy += ' ' + rowArray.Updateduser.LastName;
                    }
                }
                docName = docName.replace(/,/g, " ");
                docName = docName.replace(/ /g, " ");

                disApprove = disApprove.replace(/,/g, " ");
                disApprove = disApprove.replace(/ /g, " ");
                
                csvContent += billdate + ',' + billno + ',' + mrn + ',' + patname + ',' + disper + ',' + billamt + ',' + billdis + ',' + netamt + ',' + docName + ',' + disApprove + ',' + remark + ',' + billedBy + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'discount-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalDisAmt = 0;
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
                    Key: 51,
                    Value: '0'
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 6,
                    Value: [1, 5]
                },
                {
                    Key: 55,
                    Value: $scope.currentfilter.DiscountApprovedBy
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
            var totalbilldiscount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.DiscountApprovedBy > 0) {
                    if (item.DiscountApprovedUser.Title)
                        $scope.DiscountApprover = item.DiscountApprovedUser.Title.Description;
                    if (item.DiscountApprovedUser.FirstName)
                        $scope.DiscountApprover += ' ' + item.DiscountApprovedUser.FirstName;
                    if (item.DiscountApprovedUser.LastName)
                        $scope.DiscountApprover += ' ' + item.DiscountApprovedUser.LastName;
                } else {
                    $scope.DiscountApprover = '';
                }
                item.NetAmount = parseInt(item.BillAmount) - parseInt(item.BillDiscount);
                totalbilldiscount = totalbilldiscount + (item.BillDiscount);

                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalDisAmt = totalbilldiscount;
            // for (var idx in res.Data) {
            //     var item = res.Data[idx];
            //     item.NetAmount = parseInt(item.BillAmount) - parseInt(item.BillDiscount);
            //     vm.gridConfig.data.push(item);
            // }
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
                $scope.TotalDisAmt = 0;
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
                    Key: 51,
                    Value: '0'
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 6,
                    Value: [1, 5]
                },
                {
                    Key: 55,
                    Value: $scope.currentfilter.DiscountApprovedBy
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
                    DiscountApprover: $scope.DiscountApprover
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
                    Key: 51,
                    Value: '0'
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 6,
                    Value: [1, 5]
                },
                {
                    Key: 55,
                    Value: $scope.currentfilter.DiscountApprovedBy
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientbills/PrintDiscountReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
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
            // {
            //     field: "ReferralName",
            //     displayName: $translate.instant('reports.referraldoctor.lbl')
            // },
            {
                field: "DiscountPercentage",
                displayName: $translate.instant('Discount Percentage')
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
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.User.Title.Description && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                <span ng-if='entity.User.FirstName'>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}</span>\
                 </div>"
            },
            {
                field: "DiscountApproval",
                displayName: $translate.instant('reports.disapproval.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.DiscountApprovedUser.Title.Description && entity.DiscountApprovedUser.Title.Description'>{{entity.DiscountApprovedUser.Title.Description}}&nbsp;</span>\
                <span ng-if='entity.DiscountApprovedUser.FirstName'>{{entity.DiscountApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.DiscountApprovedUser.LastName}}</span>\
                 </div>"
            },
            {
                field: "Comments",
                displayName: $translate.instant('reports.remark.lbl')
            },
            {
                field: "Billed By",
                displayName: $translate.instant('reports.billedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Updateduser.Title.Description && entity.Updateduser.Title.Description'>{{entity.Updateduser.Title.Description}}&nbsp;</span>\
                <span ng-if='entity.Updateduser.FirstName'>{{entity.Updateduser.FirstName}}</span>&nbsp;<span>{{entity.Updateduser.LastName}}</span>\
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
                "Key": "DiscountApprover"
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

    DiscountReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();