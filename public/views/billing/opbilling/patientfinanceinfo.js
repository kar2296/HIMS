(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientFinanceController', patientFinanceController);

    function patientFinanceController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        var vm = this;
        $scope.currentcontext = {
            id: -1,
            TotalBillAmount: 0,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        if (modalConfig.params && modalConfig.params.id) {
            $scope.currentcontext.id = modalConfig.params.id;
        }

        if (modalConfig.params && modalConfig.params.EncounterId) {
            $scope.currentcontext.EncounterId = modalConfig.params.EncounterId;
        }

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                FacilityId: utl.Session.getCurrentFacilityId()
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'select', translate: 'billing.patientfinance.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.patientfinance.fromdate.lbl', model: 'FromDate', position: { r: 0, c: 1 } },
                    { type: 'date', translate: 'billing.patientfinance.todate.lbl', model: 'ToDate', position: { r: 0, c: 2 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }

            $scope.getList();
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.TransactionDate).getTime() - new Date(a.TransactionDate).getTime();
        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            $scope.List = data.Data;
            for (var idx in $scope.List) {
                var billitem = $scope.List[idx];
                $scope.currentcontext.TotalBillAmount = $scope.currentcontext.TotalBillAmount + billitem.BillAmount;
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function (PatientId) {
            var inputData = {
                Params: [
                    { Key: 5, Value: PatientId }
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

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "TransactionDate", displayName: $translate.instant('billing.patientfinance.transactiondate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.TransactionDate '></ngformatdate>"
                },
                { field: "TransactionNumber", displayName: $translate.instant('billing.patientfinance.transactionnumber.lbl') },
                { field: "VisitNumber", displayName: $translate.instant('billing.patientfinance.visitnumber.lbl') },
                {
                    field: "BillAmount", displayName: $translate.instant('billing.patientfinance.billamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.BillAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "PaidAmount", displayName: $translate.instant('billing.patientfinance.paidamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.PaidAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "AdjustedAmount", displayName: $translate.instant('billing.patientfinance.adjustedamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.AdjustedAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "UnAdjustedAmount", displayName: $translate.instant('billing.patientfinance.unadjustedamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{row.entity.UnAdjustedAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "DueAmount", displayName: $translate.instant('billing.patientfinance.dueamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.DueAmount | displaycurrency}}</span>' + '</div>'
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList($scope.currentcontext.id);
            $scope.action();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                rows: (vm.gridConfig && vm.gridConfig.data) || []
            };
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    patientFinanceController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();