(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('refundListController', refundListController);

    function refundListController($scope, $filter, $stateParams, $state, $translate, utl) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.Items = [

        ];
        $scope.currentfilter = {
            RefundDateTime: utl.Formatter.getCurrentDate()

        };
        $scope.currentcontext = {

        };
        $scope.currentfilter = {
            RefundStatusId: 1,
            namemrn: '',
        };
        $scope.custom_sort = function (a, b) {
            return new Date(b.RefundDateTime).getTime() - new Date(a.RefundDateTime).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            // forEach(data.Data, function (value, index) {
            //     //     value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
            // });
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            var Amount = 0;
            for (var idx in res.Data) {
                Amount = Amount + res.Data[idx].RefundAmount

            }

            $scope.TotalAmount = Amount;

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var fromDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Refundidentifier },
                    { Key: 2, Value: $scope.currentfilter.namemrn },
                    //{ Key: 3, Value: [$scope.currentfilter.Fromrefunddate, $scope.currentfilter.Torefunddate] },
                    //{ Key: 3, Value: $scope.currentfilter.RefundDateTime },
                    { Key: 4, Value: $scope.currentfilter.RefundTypeId },
                    { Key: 5, Value: $scope.currentfilter.RefundStatusId },
                    { Key: 12, Value: fromDate },
                    { Key: 13, Value: toDate },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.refund-form', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientRefund/DeletePatientRefund',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.refund-form', { id: row.entity.Id });
            } else if (actionType == 'view') {
                $state.go('app.refund-form', { id: row.entity.Id });
            } else if (actionType == 'delete') {
                if (row.entity.PaymentStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.paymentconsumeddelete.lbl'));
                } else if (row.entity.RefundStatusId == 1 || row.entity.RefundStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.opbilling-form.paymentdraft.lbl'));
                } else {
                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.SpecialityName);
                }
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "RefundIdentifier", displayName: $translate.instant('billing.refund-list.refundno.lbl') },

                {
                    field: "RefundDateTime",
                    displayName: $translate.instant('billing.refund-list.refunddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.RefundDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{row.entity.RefundDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "Patient",
                    displayName: $translate.instant('billing.receipt-list.filter_patient.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ row.entity.Patient.Title && row.entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{row.entity.Patient.FirstName}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.MRN}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                //{ field: "Description", displayName: $translate.instant('billing.receipt-list.description.lbl') },
                { field: "RefundType.Description", displayName: $translate.instant('billing.receipt-list.type.lbl') },
                {
                    field: "RefundAmount",
                    displayName: $translate.instant('billing.receipt-list.receiptamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.RefundAmount | displaycurrency}}</span>" + "</div>"
                },
                { field: "PaymentType.Description", displayName: $translate.instant('billing.receipt-list.paymentmode.lbl') },
                { field: "RefundStatus.Description", displayName: $translate.instant('billing.receipt-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                   <a class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"  translate="common.viewaction.lbl" ng-show="row.entity.RefundStatusId == 1 || row.entity.RefundStatusId == 3"></a>\
                                                   <a class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  translate="common.editaction.lbl" ng-show="row.entity.RefundStatusId == 2"></a>\
                                                    <a class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  translate="common.deleteaction.lbl" ng-show="row.entity.RefundStatusId == 2"></a>\
                                                </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                //{ "Key": "Status" },
                { "Key": "RefundType" },
                { "Key": "RefundStatus" }
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
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup || {},
                totalAmount: $scope.TotalAmount || 0
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'addNew':
                    $scope.addNew();
                    break;
                case 'refundTypeChange':
                    $scope.currentfilter.RefundTypeId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'namemrnChange':
                    $scope.currentfilter.namemrn = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'refundDateChange':
                    $scope.currentfilter.RefundDateTime = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'refundStatusChange':
                    $scope.currentfilter.RefundStatusId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'refundIdentifierChange':
                    $scope.currentfilter.Refundidentifier = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'fetch':
                    $scope.getList();
                    break;
            }
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }
    refundListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();