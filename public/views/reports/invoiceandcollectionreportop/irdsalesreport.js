(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('irdsalesreportController', irdsalesreportController);

    function irdsalesreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.lookup = {};
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalbillamount = 0;
            var totalbilldiscount = 0;
            var totalnetamount = 0;
            var totalgstamount = 0;
            var totalamount = 0;
            $scope.TotalBillAmt = 0;
            $scope.TotalDisAmt = 0;
            $scope.TotalNetAmt = 0;
            $scope.TotalGstAmt = 0;
            $scope.TotalAmt = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.PatientBill) {
                    if (item.PatientBill.PatientBillDetails.length > 0) {
                        for (var pdx in item.PatientBill.PatientBillDetails) {
                            var detail = item.PatientBill.PatientBillDetails[pdx];
                            var irdData = {};
                            irdData.ServiceName = '';
                            irdData.PatientName = '';
                            irdData.EnteredBy = '';
                            irdData.GrossAmount = 0;
                            irdData.DiscAmount = 0;
                            irdData.GstAmount = 0;
                            irdData.NetAmountBeforeGST = 0;
                            irdData.NetAmount = 0;
                            irdData.FacilityName = item.Facility.FacilityName;
                            irdData.FacilityPAN = item.Facility.PAN;
                            // irdData.SyncWithIRD = 'Yes';
                            irdData.IsBillPrinted = 'Yes';
                            irdData.IsBillActive = 'Yes';
                            irdData.IsRealTime = 'Yes';
                            irdData.FiscalYear = '2021/2022';
                            if (item.Patient) {
                                irdData.PatientMrn = item.Patient.MRN;
                            }
                            irdData.PaymentType = item.PaymentType.Description;
                            irdData.TrnxRefNo = item.ReceiptNumber;
                            irdData.TrnxStatus = item.ReceiptStatus.Description;
                            irdData.BillNumber = item.PatientBill.BillNumber;
                            if (item.PatientBill.IntegrationStatus == true) {
                                irdData.SyncWithIRD = 'Yes';
                            } else if (item.PatientBill.IntegrationStatus == false) {
                                irdData.SyncWithIRD = 'No';
                            }
                            irdData.BillDateTime = item.PatientBill.BillDateTime;
                            if (item.Patient) {
                                if (item.Patient.Title) {
                                    if (item.Patient.Title.Description) {
                                        irdData.PatientName = item.Patient.Title.Description;
                                    }
                                }
                                if (item.Patient.FirstName) {
                                    irdData.PatientName += ' ' + item.Patient.FirstName;
                                }
                                if (item.Patient.LastName) {
                                    irdData.PatientName += ' ' + item.Patient.LastName;
                                }
                            }
                            if (item.PatientBill.CreatedUser) {
                                if (item.PatientBill.CreatedUser.Title) {
                                    if (item.PatientBill.CreatedUser.Title.Description) {
                                        irdData.EnteredBy = item.PatientBill.CreatedUser.Title.Description;
                                    }
                                }
                                if (item.PatientBill.CreatedUser.FirstName) {
                                    irdData.EnteredBy += ' ' + item.PatientBill.CreatedUser.FirstName;
                                }
                                if (item.PatientBill.CreatedUser.LastName) {
                                    irdData.EnteredBy += ' ' + item.PatientBill.CreatedUser.LastName;
                                }
                            }
                            irdData.ServiceName = detail.ServiceName;
                            irdData.GrossAmount = detail.GrossAmount;
                            irdData.DiscAmount = detail.DiscountAmount;
                            irdData.GstAmount = detail.GSTAmount;
                            irdData.NetAmountBeforeGST = parseFloat(detail.GrossAmount || 0) - parseFloat(detail.DiscountAmount || 0);
                            irdData.NetAmount = detail.NetAmount;
                            vm.gridConfig.data.push(irdData);
                        }
                    }
                }

            }

            for (var gdx in vm.gridConfig.data) {
                var totData = vm.gridConfig.data[gdx];
                totalbillamount = totalbillamount + (totData.GrossAmount);
                totalbilldiscount = totalbilldiscount + (totData.DiscAmount);
                totalgstamount = totalgstamount + (totData.GstAmount);
                totalamount = totalamount + (totData.NetAmountBeforeGST);
                totalnetamount = totalnetamount + (totData.NetAmount);
            }

            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalBillAmt = totalbillamount.toFixed(2);
            $scope.TotalDisAmt = totalbilldiscount.toFixed(2);
            $scope.TotalNetAmt = totalnetamount.toFixed(2);
            $scope.TotalGstAmt = totalgstamount.toFixed(2);
            $scope.TotalAmt = totalamount.toFixed(2);
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
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
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
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
                        Key: 5,
                        Value: 1
                    },
                    // {
                    //     Key: 13,
                    //     Value: 1
                    // },
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
        $scope.backtoReport = function () {
            $state.go('app.financereporttab.collectionsummary');
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    CategoryName: $scope.CategoryName,
                    SubCategoryName: $scope.SubCategoryName,
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
                    Key: 5,
                    Value: 1
                },
                    // {
                    //     Key: 13,
                    //     Value: 1
                    // },
                ],
                PageContext: { PageSize: -1, PageNumber: 1 },
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintIRDSalesReport',
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
                field: "FacilityName",
                displayName: $translate.instant('Provider')
            },
            {
                field: "FacilityPAN",
                displayName: $translate.instant('Provider PAN')
            },
            // {
            //     field: "OrderScheduleDate",
            //     displayName: $translate.instant('reports.schedate.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OrderScheduleDate | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            // },
            {
                field: "PatientMrn",
                displayName: $translate.instant('reports.mrn.lbl')
            },
            {
                field: "PatientName",
                displayName: $translate.instant('reports.patient.lbl'),
            },
            {
                field: "ServiceName",
                displayName: $translate.instant('Purpose Of Payment')
            },
            {
                field: "PaymentType",
                displayName: $translate.instant('Payment Type')
            },
            {
                field: "TrnxRefNo",
                displayName: $translate.instant('Trnx Ref No')
            },
            {
                field: "TrnxStatus",
                displayName: $translate.instant('Trnx Status')
            },
            {
                field: "FiscalYear",
                displayName: $translate.instant('Fiscal Year')
            },
            {
                field: "BillNumber",
                displayName: $translate.instant('Bill No')
            },
            {
                field: "BillDateTime",
                displayName: $translate.instant('Bill Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },


            {
                field: "",
                displayName: $translate.instant('Patient PAN')
            },
            {
                field: "BillAmount",
                displayName: $translate.instant('Bill Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount}}</span>" + "</div>"
            },
            {
                field: "BillDiscount",
                displayName: $translate.instant('Dis Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DiscAmount}}</span>" + "</div>"
            },

            {
                field: "NetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmountBeforeGST}}</span>" + "</div>"
            },
            {
                field: "GSTAmount",
                displayName: $translate.instant('Tax Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GstAmount}}</span>" + "</div>"

            },
            {
                field: "TotalAmount",
                displayName: $translate.instant('Total Amt'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount}}</span>" + "</div>"

            },
            {
                field: "SyncWithIRD",
                displayName: $translate.instant('Sync With IRD')
            },
            {
                field: "IsBillPrinted",
                displayName: $translate.instant('IS Bill Printed')
            },
            {
                field: "IsBillActive",
                displayName: $translate.instant('Is Bill Active')
            },
            {
                field: "BillDateTime",
                displayName: $translate.instant('Printed Time'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "EnteredBy",
                displayName: $translate.instant('Entered By'),
            },
            {
                field: "EnteredBy",
                displayName: $translate.instant('Printed By'),
            },
            {
                field: "IsRealTime",
                displayName: $translate.instant('Is RealTime')
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
            })
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility"
                },
                {
                    "Key": "VirtualSubCategory"
                },
                {
                    "Key": "VirtualCategory"
                }]
            $scope.getLookUp(inputData);
        }

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getVirtualCtgrylookup = function () {
            $scope.currentfilter.VirtualCategoryId = -1;
            var inputData = [{
                "Key": "VirtualCategory",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: [-1, $scope.currentfilter.FacilityId]
                    }]
                }
            }];
            $scope.getLookUp(inputData);
        };

        $scope.getVirtualSubCtgrylookup = function () {
            $scope.currentfilter.VirtualSubCategoryId = -1;
            var inputData = [{
                "Key": "VirtualSubCategory",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.VirtualCategoryId
                    }]
                }
            }];
            $scope.getLookUp(inputData);
        };

        $scope.initLookup();

    }

    irdsalesreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();