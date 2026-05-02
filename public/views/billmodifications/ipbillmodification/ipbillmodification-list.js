(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillModificationListController', IPBillModificationListController);

    function IPBillModificationListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentfilter = {
            BillNumber: null,
            ModifiedBillNumber: null,
            BillDateTime: utl.Formatter.getCurrentDate(),
            NameMrn: null,
            VisitNumber: null,
            ModifiedBillDateTime: null,
            FromDate: null,
            ToDate: null,
            ModifiedFromDate: null,
            ModifiedToDate: null
        };

        if ($stateParams.filterbillnr)
            $scope.currentfilter.BillNumber = $stateParams.filterbillnr;

        if ($stateParams.filterbilldt)
            $scope.currentfilter.BillDateTime = $stateParams.filterbilldt;

        if ($stateParams.filterbilldt)
            $scope.currentfilter.NameMrn = $stateParams.filtermrn;


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            $scope.currentfilter.FromDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.ToDate = $filter('date')($scope.currentfilter.BillDateTime, 'yyyy-MM-dd 23:59:59');

            ////// $scope.currentfilter.ModifiedFromDate = $filter('date')($scope.currentfilter.ModifiedBillDateTime, 'yyyy-MM-dd 00:00:00');
            ////// $scope.currentfilter.ModifiedToDate = $filter('date')($scope.currentfilter.ModifiedBillDateTime, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentfilter.NameMrn
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.BillNumber
                    },
                    ////// { Key: 7, Value: $scope.currentfilter.ModifiedBillNumber }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if ($scope.currentfilter.FromDate && $scope.currentfilter.ToDate) { // Bill Date
                inputData.Params.push({
                    Key: 4,
                    Value: [$scope.currentfilter.FromDate, $scope.currentfilter.ToDate]
                });
            }

            // if ($scope.currentfilter.ModifiedFromDate && $scope.currentfilter.ModifiedToDate) { // Modified Bill Date
            //     inputData.Params.push({ Key: 5, Value: [$scope.currentfilter.ModifiedFromDate, $scope.currentfilter.ModifiedToDate] });
            // }

            var options = {
                action: 'BillModification/ModifiedPatientBills/GetModifiedPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.receipt-form', {
                id: 0
            });
        };

        function receiptPicker(receiptData) {
            $state.go('app.receipt-form', {
                id: receiptData.rid
            });
        }

        $scope.pickPatient = function () {
            utl.Modal.open('app.receiptpicker', {
                params: {},
                confirmCallback: receiptPicker
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientPaymentDetails/DeletePatientPaymentDetails',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.ipbillmodificationtab.ipbillmodification-form', {
                    id: entity.Id,
                    mode: 1,
                    patientid: entity.PatientId,
                    eid: entity.EncounterId,
                    filterbillnr: $scope.currentfilter.BillNumber,
                    filterbilldt: $scope.currentfilter.BillDateTime,
                    filtermrn: $scope.currentfilter.NameMrn,
                });
            } else if (actionType == 'view') {
                $state.go('app.ipbillmodificationtab.ipbillmodification-view', {
                    id: entity.Id,
                    mode: 0,
                    patientid: entity.PatientId,
                    eid: entity.EncounterId,
                    filterbillnr: $scope.currentfilter.BillNumber,
                    filterbilldt: $scope.currentfilter.BillDateTime,
                    filtermrn: $scope.currentfilter.NameMrn,
                });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "BillNumber",
                    displayName: $translate.instant('billmodifications.ipbillmodification.billnumber.lbl')
                },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('billmodifications.ipbillmodification.billdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime '></ngformatdate>"
                },
                {
                    field: "ModifiedBillDateTime",
                    displayName: $translate.instant('billmodifications.ipbillmodification.modifieddate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ModifiedBillDateTime '></ngformatdate>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billmodifications.ipbillmodification.patientinfo.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>{{entity.Patient.LastName}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.MRN}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billmodifications.ipbillmodification.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "ModifiedBillAmount",
                    displayName: $translate.instant('billmodifications.ipbillmodification.modifiedamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ModifiedBillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billmodifications.ipbillmodification.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <a class="grid-action" ng-click="handleEvents(\'view\',entity)"  translate="Original"></a>\
                                                <a class="grid-action" ng-click="handleEvents(\'edit\',entity)"  translate="common.editaction.lbl"></a>\
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


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            }]
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

    IPBillModificationListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();