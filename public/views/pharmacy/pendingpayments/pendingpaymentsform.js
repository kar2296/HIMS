(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingPaymentsFormController', pendingPaymentsFormController);

    function pendingPaymentsFormController($scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentfilter = {};

        $scope.currentfilter.StoreMasterId = 0;
        $scope.currentfilter.PatientName = '';
        $scope.currentfilter.BillNumber = '';
        $scope.currentfilter.FromDate = utl.Formatter.getCurrentDate();


        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#BillNumber').focus();
        };

        $scope.getList = function (pageNo) {
            var OutStandingcond = 1;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.BillNumber },
                    { Key: 4, Value: 3 },
                    { Key: 6, Value: 4 },
                    { Key: 11, Value: OutStandingcond },
                    { Key: 13, Value: $scope.currentfilter.PatientName },
                    { Key: 21, Value: 1 },
                    { Key: 29, Value: $scope.currentfilter.StoreMasterId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.FromDate) {
                var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59');
                if (FrmDate && ToDate)
                    inputData.Params.push({ Key: 1, Value: [FrmDate, ToDate] });
            }
            var options = {
                action: 'billing/patientbills/GetFindPharmacyBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findbill-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
                },
                { field: "BillNumber", displayName: $translate.instant('billing.findbill-list.billnumber.lbl') },
                { field: "Patient.MRN", displayName: $translate.instant('billing.findbill-list.mrn.lbl') },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId == 4"> {{row.entity.PatientName}}\
                     </div><div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId != 4">\
                      {{row.entity.Patient.Title.Description}} {{row.entity.Patient.FirstName}}\
                      {{row.entity.Patient.LastName}} </div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "BillDiscount",
                    displayName: $translate.instant('billing.pharmacypayments.discount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billing.pharmacypayments.outstandingamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billing.findbill-list.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "BilledBy",
                    displayName: $translate.instant('billing.pharmacypayments.billedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>\
                    {{row.entity.CreatedUser.Title.Description}} {{row.entity.CreatedUser.FirstName}}\
                    {{row.entity.CreatedUser.LastName}} </span>" + "</div>"
                },
                { field: "PatientBillStatus.Description", displayName: $translate.instant('billing.findbill-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    \<span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"  ><i class="btn btn-success btn-rounded fa fa-eye" aria-hidden="true"></i></span>\
                                    \<span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                    \</div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                $scope.printView(row.entity.Id);
            }
            else if (actionType == 'edit') {
                utl.Modal.open('app.pharmacypendingsales', {
                    params: {
                        id: row.entity.Id,
                        storeid:row.entity.StoreMasterId
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        $scope.printView = function (BillId) {
            var inputData = {
                Id: BillId,
                Data: {
                    isprint: false
                }
            };
            var options = {
                action: 'billing/patientbills/PrintPharmacyBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
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

    pendingPaymentsFormController.$inject = ['$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();