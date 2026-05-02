(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drshareitemwisecollectionsummaryopController', drshareitemwisecollectionsummaryopController);

    function drshareitemwisecollectionsummaryopController($scope, $stateParams, $state, $translate, $filter, utl) {
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


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalamount = 0;
            var totaldisamount = 0;
            var totalnetamount = 0;
            var totaldocshare = 0;
            var totalprovidershare = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                // if (item.ProportionateDiscount > 0) {
                //     item.DiscountAmt = item.ProportionateDiscount;
                // } else if (item.DiscountAmount > 0) {
                //     item.DiscountAmt = item.DiscountAmount;
                // }
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
                    if (res.Data.length > 0) {
                        $scope.DoctorName = item.DoctorName;
                    }
                } else {
                    $scope.DoctorName = '';
                }
                totalamount = totalamount + (item.BillAmount);
                totaldisamount = totaldisamount + (item.BillDiscount || 0);
                totalnetamount = totalnetamount + (item.BillNetAmount || 0);
                totaldocshare = totaldocshare + (item.NetDoctorShare);
                totalprovidershare = totalprovidershare + (item.ProviderShare);

                vm.gridConfig.data.push(item);
            }
            $scope.TotalAmount = totalamount;
            $scope.TotalDisAmount = totaldisamount;
            $scope.TotalNetAmount = totalnetamount;
            $scope.TotalDocshare = totaldocshare;
            $scope.TotalProvidershare = totalprovidershare;

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
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
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
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 3,
                        Value: 3
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/CollectionBaseRevenue/GetCollectionBaseRevenues',
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
            $state.go('app.financereporttab.doctorsharereport');

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
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 3,
                        Value: 3
                    },
                ],
            };
            var options = {
                action: 'billing/CollectionBaseRevenue/PrintDocShareItemCollectionSummaryOPReport',
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
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{index+1}} </span> </div>"
                },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('reports.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "BillNumber",
                    displayName: $translate.instant('reports.billreferrence.lbl')
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('reports.patient.lbl')
                },
                {
                    field: "SwosthaID",
                    displayName: $translate.instant('reports.mrn.lbl')
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('reports.doctorname.lbl')
                },
                {
                    field: "TestDepartmentName",
                    displayName: $translate.instant('DepartmentName')
                },
                {
                    field: "ServiceName",
                    displayName: $translate.instant('reports.servicename.lbl')
                },
                {
                    field: "ServiceCategoryName",
                    displayName: $translate.instant('Billing Group')
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('reports.amt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "BillDiscount",
                    displayName: $translate.instant('reports.disamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                },

                {
                    field: "BillNetAmount",
                    displayName: $translate.instant('reports.netamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillNetAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "NetDoctorShare",
                    displayName: $translate.instant('reports.doctorshare.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetDoctorShare | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "ProviderShare",
                    displayName: $translate.instant('Provider Share'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ProviderShare | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "ReferralName",
                    displayName: $translate.instant('Referral Name')
                },
                {
                    field: "BillGeneratedName",
                    displayName: $translate.instant('Collected By')
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

    drshareitemwisecollectionsummaryopController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();