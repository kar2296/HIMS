(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientPaymentAdjustmentController', PatientPaymentAdjustmentController);

    function PatientPaymentAdjustmentController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1,
            TotalBillAmount: 0,
            TotalPaidAmount: 0,
            TotalAdjustedAmount: 0,
            TotalUnAdjustedAmount: 0,
            TotalDueAmount: 0,
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

            //var From = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 00:00:00') || null;
            //var To = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    //{ Key: 0, Value: From },
                    //{ Key: 0, Value: To },
                    //{ Key: 0, Value: FromReq },
                    //{ Key: 0, Value: ToReq },
                    { Key: 5, Value: $scope.currentfilter.PatientId }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientAccounts/GetPatientAccounts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                $scope.currentcontext.TotalBillAmount = $scope.currentcontext.TotalBillAmount + item.BillAmount;
                $scope.currentcontext.TotalPaidAmount = $scope.currentcontext.TotalPaidAmount + item.PaidAmount;
                $scope.currentcontext.TotalAdjustedAmount = $scope.currentcontext.TotalAdjustedAmount + item.AdjustedAmount;
                $scope.currentcontext.TotalUnAdjustedAmount = $scope.currentcontext.TotalUnAdjustedAmount + item.UnAdjustedAmount;
                $scope.currentcontext.TotalDueAmount = $scope.currentcontext.TotalDueAmount + item.DueAmount;
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            $scope.refreshReactProps();
        };

        var rowtpl = '<div ng-class="{\'priority\':entity.IsAdvance==1 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            rowTemplate: rowtpl,
            enableColumnResizing: true,
            columnDefs: [{
                field: "TransactionDate",
                displayName: $translate.instant('billing.patientadjustmentinfo.transactiondate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TransactionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span class='pl-3'>{{entity.TransactionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "TransactionNumber",
                displayName: $translate.instant('billing.patientadjustmentinfo.transactionnumber.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'transaction\',row)">' +
                    "{{entity.TransactionNumber}}" +
                    "</a></div>"
            },
            { field: "VisitNumber", displayName: $translate.instant('billing.patientfinance.visitnumber.lbl') },
            {
                field: "BillAmount", displayName: $translate.instant('billing.patientfinance.billamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "PaidAmount", displayName: $translate.instant('billing.patientfinance.paidamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.PaidAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "AdjustedAmount", displayName: $translate.instant('billing.patientfinance.adjustedamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.AdjustedAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "UnAdjustedAmount", displayName: $translate.instant('billing.patientfinance.unadjustedamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.UnAdjustedAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "DueAmount", displayName: $translate.instant('billing.patientfinance.dueamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.DueAmount | displaycurrency}}</span>' + '</div>'
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                currentcontext: $scope.currentcontext,
                rows: vm.gridConfig.data
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

        $scope.initLookup();
    }

    PatientPaymentAdjustmentController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();