(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('iprefundListController', iprefundListController);

    function iprefundListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        vm.gridConfig = {
            columnDefs: []
        };
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext.CanIPREF_REFUND = utl.Privilege.hasAccess('CanIPREF_REFUND');
        $scope.currentcontext.CanIPREF_PARTIAL_REFUND = utl.Privilege.hasAccess('CanIPREF_PARTIAL_REFUND');

        $scope.iprefund = 0;
        $scope.iprefund =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'iprefundapproval')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'iprefundapproval') : 0;

        $scope.currentcontext = {};
        $scope.UserCounterInfo = [];
        $scope.currentfilter = {
            RefundDateTime: utl.Formatter.getCurrentDate(),
            RefundStatusId: 1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.IsLocked = $scope.$parent.Islocked;
        $scope.currentcontext.isdaycare = $stateParams.isdaycare;
        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.TotalAmt = 0;
            forEach(data.Data, function (value, index) {
                $scope.TotalAmt += value.RefundAmount;
                value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
                value.IsRefundApproval = $scope.iprefund;
            });
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.CheckFinalize();
        };

        $scope.getList = function () {
            var fromDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.receipt
                },
                // { Key: 3, Value: $scope.currentfilter.RefundDateTime },
                // {
                //     Key: 4,
                //     Value: $scope.currentfilter.RefundTypeId
                // },
                {
                    Key: 25,
                    Value: [1, 2, 4]//AgainstReceipt Included(2)
                },
                // {
                //     Key: 5,
                //     Value: $scope.currentfilter.RefundStatusId
                // },
                {
                    Key: 26,
                    Value: [1, 2, 3]
                },
                {
                    Key: 10,
                    Value: $scope.currentcontext.id
                },
                // {
                //     Key: 11,
                //     Value: 2
                // },
                // {
                //     Key: 12,
                //     Value: fromDate
                // },
                // {
                //     Key: 13,
                //     Value: toDate
                // },
                {
                    Key: 19,
                    Value: false
                },
                {
                    Key: 24,//Receipt Type
                    Value: [1, 2, 3, 7]//Receipt,DueCollect,ipadvance,pharmacy advance
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if (!$scope.currentcontext.isdaycare) {
                inputData.Params.push({
                    Key: 11,
                    Value: 2
                })
            }
            if ($scope.currentcontext.isdaycare) {
                inputData.Params.push({
                    Key: 11,
                    Value: 5
                })
            }
            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addRefund = function () {
            if (!$scope.IsDisabled) {
                $scope.openModal(0);
            } else if ($scope.BillFinalized && $scope.BillInfo && $scope.BillInfo.ToBeRefunded > 0) {
                $scope.openModal(0);
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.openModal = function (refundId) {
            utl.Modal.open('app.iprefund-form', {
                params: {
                    id: refundId,
                    eid: $scope.currentcontext.id,
                    refundamount: $scope.BillInfo && $scope.BillInfo.ToBeRefunded ? $scope.BillInfo.ToBeRefunded : 0,
                    billid: $scope.BillInfo && $scope.BillInfo.Id ? $scope.BillInfo.Id : 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.addPartialRefund = function () {
            if (!$scope.IsDisabled) {
                $scope.openPartialRefundModal(0);
            } else if (!$scope.BillFinalized) {
                $scope.openPartialRefundModal(0);
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.openPartialRefundModal = function (refundId) {
            utl.Modal.open('app.ippartialrefund-form', {
                params: {
                    id: refundId,
                    eid: $scope.currentcontext.id,
                    refundamount: $scope.BillInfo && $scope.BillInfo.ToBeRefunded ? $scope.BillInfo.ToBeRefunded : 0,
                    billid: $scope.BillInfo && $scope.BillInfo.Id ? $scope.BillInfo.Id : 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientRefund/DeletePatientRefund',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $state.go('app.ipbillingtab.summary');
            // if ($scope.item.AdmissionStatusId == 6) {
            //     $state.go('app.ipbilling-listtab.dischargedpatients');
            // } else {
            //     $state.go('app.ipbilling-listtab.inpatients');
            // }
        };
        $scope.CheckFinalizeCallback = function (scope, res, options, hasError) {
            $scope.BillFinalized = false;
            if (res.Data.length > 0) {
                $scope.BillFinalized = true;
                $scope.BillInfo = res.Data[0];
            }
            $scope.IsDisabled = $scope.BillFinalized || $scope.IsLocked ? true : false;
        };

        $scope.CheckFinalize = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 16,
                    Value: $scope.currentcontext.id
                }
                ]
            };
            var options = {

                // action: 'billing/PatientBills/GetPatientBills',
                action: 'billing/PatientBills/checkBillFinalized',
                data: inputData,
                type: 'post',
                onComplete: $scope.CheckFinalizeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'view') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.SpecialityName);
            }
        };


        vm.gridConfig = {
            columnDefs: [{
                field: "RefundIdentifier",
                displayName: $translate.instant('billing.refund-list.refundno.lbl')
            },
            {
                field: "RefundDateTime",
                displayName: $translate.instant('billing.refund-list.refunddate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RefundDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.RefundDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "RefundType.Description",
                displayName: $translate.instant('billing.receipt-list.type.lbl')
            },
            {
                field: "RefundAmount",
                displayName: $translate.instant('billing.refund-list.refundamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.RefundAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('billing.receipt-list.paymentmode.lbl')
            },
            {
                field: "RefundStatus.Description",
                displayName: $translate.instant('Refund Status')
            },
            // {
            //     field: "RefundApprovalStatus.Description",
            //     displayName: $translate.instant('Refund Approval')
            // },
            // {
            //     field: "RefundApprovalStatus.Description",
            //     cellTemplate: '<div class="ui-grid-cell-contents" ng-show="entity.IsRefundApproval == 1">' + '<span>{{entity.RefundApprovalStatus.Description}}</span>' + '</div>',
            //     displayName: $translate.instant('Refund Approval')
            // },
            // {
            //     field: "Id",
            //     displayName: $translate.instant('common.actions_col.lbl'),
            //     cellTemplate: '<div class="ui-grid-cell-contents actionbuttons ">\
            //         <span class="grid-action" style="text-decoration: underline;font-size:20px;" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
            //         </div>',
            //     handleEvent: $scope.handleEvents,
            // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        if ($scope.iprefund == 1) {
            vm.gridConfig.columnDefs.push({
                field: "RefundApprovalStatus.Description",
                cellTemplate: '<div class="ui-grid-cell-contents" ng-show="entity.IsRefundApproval == 1">' + '<span>{{entity.RefundApprovalStatus.Description}}</span>' + '</div>',
                displayName: $translate.instant('Refund Approval')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents actionbuttons ">\
                    <span class="grid-action" style="text-decoration: underline;font-size:20px;" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    </div>',
                handleEvent: $scope.handleEvents,
            });
        } else {
            vm.gridConfig.columnDefs.push(
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents actionbuttons ">\
                    <span class="grid-action" style="text-decoration: underline;font-size:20px;" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    </div>',
                handleEvent: $scope.handleEvents,
            });
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "RefundType"
            },
            {
                "Key": "RefundStatus"
            }
            ]
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

    iprefundListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();