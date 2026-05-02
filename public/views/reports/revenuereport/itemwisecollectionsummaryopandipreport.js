(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemwisecollectionsummaryopandipreportController', itemwisecollectionsummaryopandipreportController);

    function itemwisecollectionsummaryopandipreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.ItemWiseData = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Bill Referrence", "Patient Name", "MRN", "Doctor Name", "Service Name", "Billing Group", "Amount", "Discount Amt", "Net Amount", "Doctor Share", "Referral Name", "Collected By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var billref = '';
                var patname = '';
                var mrn = '';
                var docname = '';
                var serviceName = '';
                var billAmount = '';
                var Amount = '';
                var discountAmount = '';
                var netAmt = '';
                var docShare = '';
                var collectedBy = '';
                var ReferralName = '';
                if (rowArray.ProportionateDiscount > 0) {
                    rowArray.DiscountAmt = rowArray.ProportionateDiscount;
                } else if (rowArray.DiscountAmount > 0) {
                    rowArray.DiscountAmt = rowArray.DiscountAmount;
                }
                if (rowArray.BillDateTime) {
                    // date = rowArray.BillDateTime;
                    // date = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                    date = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.ReceiptDateTime) {
                    // date += ' ' + rowArray.ReceiptDateTime;
                    // date += ' ' + $filter('date')(rowArray.ReceiptDateTime, 'yyyy-MM-dd') || null;
                    date += ' ' + utl.Formatter.getDateTimeString(rowArray.ReceiptDateTime);
                }
                if (rowArray.PatientBill.BillNumber) {
                    billref = rowArray.PatientBill.BillNumber;
                }
                if (rowArray.PatientBill.Patient) {
                    if (rowArray.PatientBill.Patient.Referral) {
                        if (rowArray.PatientBill.Patient.Referral.ReferralName) {
                            ReferralName = rowArray.PatientBill.Patient.Referral.ReferralName;
                        }
                    }
                }
                if (rowArray.PatientBill.Patient) {
                    if (rowArray.PatientBill.Patient.Title) {
                        if (rowArray.PatientBill.Patient.Title.Description) {
                            patname = rowArray.PatientBill.Patient.Title.Description;
                        }
                    }
                    if (rowArray.PatientBill.Patient.FirstName) {
                        patname += ' ' + rowArray.PatientBill.Patient.FirstName;
                    }
                    if (rowArray.PatientBill.Patient.LastName) {
                        patname += ' ' + rowArray.PatientBill.Patient.LastName;
                    }

                    if (rowArray.PatientBill.Patient.MRN) {
                        mrn = rowArray.PatientBill.Patient.MRN;
                    }
                }
                if (rowArray.User) {
                    if (rowArray.User.Title.Description) {
                        docname = rowArray.User.Title.Description;
                    }
                    if (rowArray.User.FirstName) {
                        docname += ' ' + rowArray.User.FirstName;
                    }
                    if (rowArray.User.LastName) {
                        docname += ' ' + rowArray.User.LastName;
                    }
                }
                if (rowArray.ServiceName) {
                    serviceName = rowArray.ServiceName;
                }
                if (rowArray.ServiceCategory) {
                    if (rowArray.ServiceCategory.ServiceCategoryName) {
                        billAmount = rowArray.ServiceCategory.ServiceCategoryName;
                    }
                }
                if (rowArray.GrossAmount) {
                    Amount = rowArray.GrossAmount;
                }
                if (rowArray.DiscountAmt) {
                    discountAmount = rowArray.DiscountAmt;
                }
                if (!rowArray.DiscountAmt) {
                    netAmt = rowArray.NetAmount;
                }
                if (rowArray.DiscountAmt) {
                    netAmt = (rowArray.GrossAmount) - (rowArray.DiscountAmt);
                }
                if (rowArray.DoctorShare) {
                    docShare = rowArray.DoctorShare;
                }
                if (rowArray.CreatedUser.Title) {
                    if (rowArray.CreatedUser.Title.Description) {
                        collectedBy = rowArray.CreatedUser.Title.Description;
                    }
                }
                if (rowArray.CreatedUser.FirstName) {
                    collectedBy += ' ' + rowArray.CreatedUser.FirstName;
                }
                if (rowArray.CreatedUser.LastName) {
                    collectedBy += ' ' + rowArray.CreatedUser.LastName;
                }
                csvContent += date + ',' + billref + ',' + patname + ',' + mrn + ',' + docname + ',' + serviceName + ',' + billAmount + ',' + Amount + ',' + discountAmount + ',' + netAmt + ',' + docShare + ',' + ReferralName + ',' + collectedBy + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'itemwisecollectionsummaryop.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalAmount = 0;
                $scope.TotalDisAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.TotalDocshare = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ServiceCategoryId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId || -1
                },
                // {
                //     Key: 17,
                //     Value: 1
                // },
                // {
                //     Key: 32,
                //     Value: [1, 5]
                // },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 36,
                    Value: false
                }
                ],

            };
            var options = {
                action: "billing/PatientBillDetails/GetPatientBillDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalamount = 0;
            var totaldisamount = 0;
            var totalnetamount = 0;
            var totaldocshare = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.ProportionateDiscount > 0) {
                    item.DiscountAmt = item.ProportionateDiscount;
                } else if (item.DiscountAmount > 0) {
                    item.DiscountAmt = item.DiscountAmount;
                }
                // item.PaymentType = '';
                // item.CollectedBy = '';
                // if (item.PatientBill) {
                //     if (item.PatientBill.PatientPaymentDetails.length > 0) {
                //         var PayDetails = item.PatientBill.PatientPaymentDetails[0];
                //         item.PaymentType = PayDetails.PaymentType.Description;
                //         if (item.CreatedUser) {
                //             if (item.CreatedUser.Title) {
                //                 item.CollectedBy = item.CreatedUser.Title.Description;
                //             }
                //             if (item.CreatedUser.FirstName) {
                //                 item.CollectedBy += ' ' + item.CreatedUser.FirstName;
                //             }
                //             if (item.CreatedUser.LastName) {
                //                 item.CollectedBy += ' ' + item.CreatedUser.LastName;
                //             }
                //         }
                //     }
                // }
                if ($scope.currentfilter.DoctorId > 0) {
                    if (item.User.Title)
                        $scope.DoctorName = item.User.Title.Description;
                    if (item.User.FirstName)
                        $scope.DoctorName += ' ' + item.User.FirstName;
                    if (item.User.LastName)
                        $scope.DoctorName += ' ' + item.User.LastName;
                } else {
                    $scope.DoctorName = '';
                }
                if ($scope.currentfilter.ServiceCategoryId > 0) {
                    if (res.Data.length > 0) {
                        $scope.BillingGroup = item.ServiceCategory.ServiceCategoryName;
                    }
                } else {
                    $scope.BillingGroup = '';
                }
                if ($scope.currentfilter.ServiceId > 0) {
                    if (res.Data.length > 0) {
                        $scope.BillingService = item.ServiceName;
                    }
                } else {
                    $scope.BillingService = '';
                }
                item.NetAmt = parseFloat(item.GrossAmount) - parseFloat(item.DiscountAmt || 0);
                totalamount = totalamount + (item.GrossAmount);
                totaldisamount = totaldisamount + (item.DiscountAmt || 0);
                totalnetamount = totalnetamount + (item.NetAmt || 0);
                totaldocshare = totaldocshare + (item.DoctorShare);

                vm.gridConfig.data.push(item);
            }
            $scope.TotalAmount = totalamount;
            $scope.TotalDisAmount = totaldisamount;
            $scope.TotalNetAmount = totalnetamount;
            $scope.TotalDocshare = totaldocshare;
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
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
                $scope.TotalAmount = 0;
                $scope.TotalDisAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.TotalDocshare = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ServiceCategoryId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId || -1
                },
                // {
                //     Key: 17,
                //     Value: 1
                // },
                // {
                //     Key: 32,
                //     Value: [1, 5]
                // },
                // {
                //     Key: 46,
                //     Value: 3
                // },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 36,
                    Value: false
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ServiceId = -1;
                // $scope.getList();
            }
        };

        $scope.backtoReport = function () {
            if ($scope.Context == 'revenuereport') {
                $state.go('app.billingreportstab.revenuereport');
            }
            if ($scope.Context == 'revenuesummary') {
                $state.go('app.financereporttab.revenuesummary');
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
                    BillingGroup: $scope.BillingGroup,
                    BillingService: $scope.BillingService
                },
                Params: [{
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ServiceCategoryId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId
                },
                // {
                //     Key: 17,
                //     Value: 1
                // },
                // {
                //     Key: 32,
                //     Value: [1, 5]
                // },
                // {
                //     Key: 46,
                //     Value: 3
                // },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 36,
                    Value: false
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/PatientBillDetails/PrintItemCollectionSummaryOPReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Service Code',
                field: 'ServiceCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Service Name',
                field: 'ServiceName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        };

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                // if (otherservicemiddlesearch) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
                // }
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        };

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
            }
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
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('reports.billreferrence.lbl')
            },
            {
                field: "Patient Name",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientBill.Patient.Title && entity.PatientBill.Patient.Title.Description'>{{entity.PatientBill.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientBill.Patient.FirstName}}</span>&nbsp;<span>{{entity.PatientBill.Patient.LastName}}</span>\
                                        </div>"
            },
            {
                field: "PatientBill.Patient.MRN",
                displayName: $translate.instant('reports.mrn.lbl')
            },
            {
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}</span>\
                                        </div>"
            },
            {
                field: "ServiceName",
                displayName: $translate.instant('reports.servicename.lbl')
            },
            {
                field: "ServiceCategory.ServiceCategoryName",
                displayName: $translate.instant('Billing Group')
            },
            {
                field: "GrossAmount",
                displayName: $translate.instant('reports.amt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "DiscountAmt",
                displayName: $translate.instant('reports.disamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DiscountAmt | displaycurrency}}</span>" + "</div>"
            },

            {
                field: "NetAmt",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "DoctorShare",
                displayName: $translate.instant('reports.doctorshare.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DoctorShare | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PatientBill.Patient.Referral.ReferralName",
                displayName: $translate.instant('Referral Name')
            },
            {
                field: "Collected By",
                displayName: $translate.instant('Collected By'),
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
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "ServiceCategory"
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

    itemwisecollectionsummaryopandipreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();