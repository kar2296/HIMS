(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientRevenueController', PatientRevenueController);

    function PatientRevenueController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1,
            TotalCredit: 0,
            TotalDebit: 0,
            EncounterId: 0,
            VisitNumber: ''
        };
        $scope.currentfilter = {
            PatientId: 0,
            PatientName: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };

        $scope.patientChange = function () {
            if ($scope.currentfilter.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentfilter.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.currentfilter.PatientName = $scope.selectedPatient.FirstName;
            $scope.currentfilter.PatientId = $scope.selectedPatient.Id;

            $scope.fnencounter();
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [
                    { Key: 14, Value: 1 },
                    { Key: 4, Value: $scope.currentfilter.PatientId }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVisitIndentifier
            };

            utl.Http.doAction(options);
        };

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.currentcontext.EncounterId = $scope.encounter.Id;
                $scope.currentcontext.VisitNumber = $scope.encounter.VisitIdentifier;
            }

            $scope.getList();
        };

        $scope.getList = function (pageNo) {
            //var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            //var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 17, Value: From },
                    { Key: 18, Value: To },
                    //{ Key: 0, Value: FromReq },
                    //{ Key: 0, Value: ToReq },
                    { Key: 4, Value: 3 },
                    { Key: 12, Value: $scope.currentfilter.PatientId },
                    { Key: 33, Value: [1, 4] }
                ],
                PageContext: {
                    PageSize: 1000,//vm.gridConfig.pagerObj.pageSize,
                    PageNumber: 1//vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientBills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        /*
        var groupBy_ServiceCategory = function (obj, value, context) {
            if (!value.length)
                return obj;
            var byFirst = _.groupBy(obj, value[0], context),
                rest = value.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupBy_ServiceCategory(byFirst[prop], rest, context);
            }
            return byFirst;
        };
        */

        var groupBy_BillDate_ServiceCategory = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupBy_BillDate_ServiceCategory(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            var BillDetailedItems = [];
            //var ServiceCategories = [];
            $scope.ServiceCategories = [];
            //vm.gridConfig.data = [];
            for (var billidx in data.Data) {
                var billitem = data.Data[billidx];
                for (var billdetailidx in billitem.PatientBillDetails) {
                    var billdetailitem = billitem.PatientBillDetails[billdetailidx];
                    billdetailitem.BillDateTime = $filter('date')(billdetailitem.BillDateTime, 'dd-MMM-yyyy');
                    BillDetailedItems.push(billdetailitem);
                    //vm.gridConfig.data.push(billdetailitem);
                    //arr.push(billdetailitem);
                }
            }

            var groupedBillDates = groupBy_BillDate_ServiceCategory(BillDetailedItems, ['BillDateTime', 'ServiceCategoryId']);
            for (var groupedbilldateidx in groupedBillDates) {
                var groupedServiceCategories = groupedBillDates[groupedbilldateidx];
                for (var groupedservicecategoryidx in groupedServiceCategories) {
                    var groupedservicecategory = groupedServiceCategories[groupedservicecategoryidx];
                    var BillDate = null;
                    var CategoryId = 0;
                    var CategoryName = null;
                    var CategoryCreditAmount = 0;
                    var CategoryDebitAmount = 0;
                    for (var i = 0, len = groupedservicecategory.length; i < len; i++) {
                        var itemcreditamount = 0;
                        var itemdebitamount = 0;

                        itemcreditamount = groupedservicecategory[i].NetAmount;
                        itemdebitamount = groupedservicecategory[i].ReceivedAmount;

                        BillDate = groupedservicecategory[i].BillDateTime;
                        CategoryId = groupedservicecategory[i].ServiceCategoryId;
                        if (groupedservicecategory[i].ServiceCategory) {
                            CategoryName = groupedservicecategory[i].ServiceCategory.ServiceCategoryName;
                        } else {
                            CategoryName = '';
                        }
                        CategoryCreditAmount += itemcreditamount;
                        CategoryDebitAmount += itemdebitamount;
                    }

                    var ServiceCategory = {
                        TransactionDate: BillDate,
                        ServiceCategoryId: CategoryId,
                        ServiceCategoryName: CategoryName,
                        CreditAmount: CategoryCreditAmount,
                        DebitAmount: CategoryDebitAmount,
                        Status: 1
                    }

                    $scope.ServiceCategories.push(ServiceCategory);
                }
            }

            $scope.currentcontext.TotalCredit = 0;
            $scope.currentcontext.TotalDebit = 0;

            for (var scidx in $scope.ServiceCategories) {
                var scitem = $scope.ServiceCategories[scidx];
                $scope.currentcontext.TotalCredit = $scope.currentcontext.TotalCredit + scitem.CreditAmount;
                $scope.currentcontext.TotalDebit = $scope.currentcontext.TotalDebit + scitem.DebitAmount;
            }
            $scope.refreshReactProps();
            /*
            var groupedServiceCategorys = groupBy_ServiceCategory(BillDetailedItems, ['ServiceCategoryId']);
            for (var groupedservicecategoryidx in groupedServiceCategorys) {
                var groupedservicecategory = groupedServiceCategorys[groupedservicecategoryidx];
                var BillDate = null;
                var CategoryId = 0;
                var CategoryName = null;
                var CategoryCreditAmount = 0;
                var CategoryDebitAmount = 0;
                for (var i = 0, len = groupedservicecategory.length; i < len; i++) {
                    var itemcreditamount = 0;
                    var itemdebitamount = 0;

                    itemcreditamount = groupedservicecategory[i].NetAmount;
                    itemdebitamount = groupedservicecategory[i].ReceivedAmount;

                    BillDate = groupedservicecategory[i].BillDateTime;
                    CategoryId = groupedservicecategory[i].ServiceCategoryId;
                    if (groupedservicecategory[i].ServiceCategory) {
                        CategoryName = groupedservicecategory[i].ServiceCategory.ServiceCategoryName;
                    } else {
                        CategoryName = '';
                    }
                    CategoryCreditAmount += itemcreditamount;
                    CategoryDebitAmount += itemdebitamount;
                }
                var ServiceCategory = {
                    TransactionDate: BillDate,
                    ServiceCategoryId: CategoryId,
                    ServiceCategoryName: CategoryName,
                    CreditAmount: CategoryCreditAmount,
                    DebitAmount: CategoryDebitAmount
                }

                ServiceCategories.push(ServiceCategory);
            }
            */

            //vm.gridConfig.data = ServiceCategories;

            //vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        /*
        var rowtpl = '<div ng-class="{\'priority\':row.entity.IsPharmacyBill==1 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            rowTemplate: rowtpl,
            enableColumnResizing: true,
            columnDefs: [{
                field: "TransactionDate",
                displayName: $translate.instant('billing.patientrevenueinfo.transactiondate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.TransactionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "</div>"
            },
            { field: "ServiceCategoryName", displayName: $translate.instant('billing.patientrevenueinfo.revenuecategory.lbl') },
            {
                field: "CreditAmount", displayName: $translate.instant('billing.patientrevenueinfo.credit.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.CreditAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "DebitAmount", displayName: $translate.instant('billing.patientrevenueinfo.debit.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.DebitAmount | displaycurrency}}</span>' + '</div>'
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        */

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                currentcontext: $scope.currentcontext,
                rows: $scope.ServiceCategories
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'fromDateChange':
                    $scope.currentfilter.FromDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'toDateChange':
                    $scope.currentfilter.ToDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();


        $scope.initLookup();
    }

    PatientRevenueController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();