(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPBillModificationListController', OPBillModificationListController);

    function OPBillModificationListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.SelectedPatientBillId = 0;
        $scope.currentfilter = {
            BillNumber: null,
            BillDateTime: utl.Formatter.getCurrentDate(),
            NameMrn: null,
            VisitNumber: null,
            FromDate: null,
            ToDate: null
        };

        if ($stateParams.filterbillnr)
            $scope.currentfilter.BillNumber = $stateParams.filterbillnr;

        if ($stateParams.filterbilldt)
            $scope.currentfilter.BillDateTime = $stateParams.filterbilldt;

        if ($stateParams.filterbilldt)
            $scope.currentfilter.NameMrn = $stateParams.filtermrn;


        $scope.getList = function (pageNo) {
            $scope.currentfilter.FromDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.ToDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 23:59:59');
            if (($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) ||
                $scope.currentfilter.BillNumber || $scope.currentfilter.NameMrn) {
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentfilter.BillNumber
                        },
                        {
                            Key: 4,
                            Value: 3
                        },
                        {
                            Key: 20,
                            Value: [1, 5]
                        },
                        {
                            Key: 13,
                            Value: $scope.currentfilter.NameMrn
                        },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                if ($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) {
                    inputData.Params.push({
                        Key: 1,
                        Value: [$scope.currentfilter.FromDate, $scope.currentfilter.ToDate]
                    });
                }

                $scope.insurancebillmodified =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'insurancebillmodified');
                if (!$scope.insurancebillmodified) {
                    inputData.Params.push({
                        Key: 9,
                        Value: 1
                    });
                }

                var options = {
                    action: 'billing/Patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "BillNumber",
                    displayName: $translate.instant('billmodifications.ipbill.billnumber.lbl')
                },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('billmodifications.ipbill.billdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime '></ngformatdate>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientmrn.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{entity.Patient.MRN}}</a>' + '</div>'
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>{{entity.Patient.LastName}}</a>' + '</div>'
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbill.patientagegender.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billmodifications.ipbill.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billmodifications.ipbill.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billmodifications.ipbill.dueamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <a class="grid-action" ng-click="handleEvents(\'view\',entity)"  translate="Original"></a>\
                                                <a class="grid-action" ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pensil-square-o" </a>\
                                                </div>',
                                                handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }

        };


        $scope.handleEvents = function (actionType, entity) {
            var contexttp = 'OP';
            if (entity.BillTypeId == 5)
                contexttp = 'DG';

            if (actionType == 'edit') {
                $state.go('app.opbillmodificationtab.opbillmodifyform', {
                    id: entity.Id,
                    tp: contexttp,
                    mode: 1,
                    pid: entity.PatientId,
                    eid: entity.EncounterId,
                    filterbillnr: $scope.currentfilter.BillNumber,
                    filterbilldt: $scope.currentfilter.BillDateTime,
                    filtermrn: $scope.currentfilter.NameMrn,
                })
            } else if (actionType == 'view') {
                $state.go('app.opbillmodificationtab.opbillmodifyview', {
                    id: entity.Id,
                    tp: contexttp,
                    mode: 0,
                    pid: entity.PatientId,
                    eid: entity.EncounterId,
                    filterbillnr: $scope.currentfilter.BillNumber,
                    filterbilldt: $scope.currentfilter.BillDateTime,
                    filtermrn: $scope.currentfilter.NameMrn,
                });
            }
        };

        $scope.getList();

    }

    OPBillModificationListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();