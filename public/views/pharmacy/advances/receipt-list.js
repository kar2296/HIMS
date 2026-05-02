(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacyAdvancereceiptListController', pharmacyAdvancereceiptListController);

    function pharmacyAdvancereceiptListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.Items = [];

        $scope.currentfilter = {
            namemrn: '',
            ReceiptStatusId: 1,
            ReceiptTypeId: 7

        };

        $scope.item = {
            receiptdate: utl.Formatter.getCurrentDate(),

        };
        $scope.currentcontext = {

        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            forEach(data.Data, function (value, index) {
                value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
            });

            vm.gridConfig.data = data.Data;
            var Amount = 0;
            for (var idx in data.Data) {
                Amount = Amount + data.Data[idx].AmountPaid

            }
            $scope.TotalAmount = Amount;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            $scope.currentfilter.Fromreceiptdate = $filter('date')($scope.item.receiptdate, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.Toreceiptdate = $filter('date')($scope.item.receiptdate, 'yyyy-MM-dd 23:59:59');


            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.receipt },
                    { Key: 3, Value: [$scope.currentfilter.Fromreceiptdate, $scope.currentfilter.Toreceiptdate] },
                    { Key: 4, Value: $scope.currentfilter.ReceiptTypeId },
                    { Key: 5, Value: $scope.currentfilter.ReceiptStatusId },
                    { Key: 8, Value: $scope.currentfilter.namemrn },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.advance-form', { id: 0 });
        }

        function receiptPicker(receiptData) {

            $state.go('app.advance-form', { id: receiptData.rid });
        }
        $scope.pickPatient = function () {
            utl.Modal.open('app.receiptpicker', {
                params: {},
                confirmCallback: receiptPicker
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.onDeleteConfirmed($scope.vDeletedId);
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function () {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.open('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* Security IsValid */
        $scope.vDeletedId = -1;
        $scope.onDeleteConfirmed = function (deleteId) { //
            $scope.vDeletedId = deleteId;
            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;
            /* Security IsValid */

            var options = {
                action: 'Billing/PatientPaymentDetails/DeletePatientPaymentDetails',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.advance-form', { id: entity.Id });
            } else if (actionType == 'refund') {
                utl.Modal.open('app.refund-form', {
                    params: {
                        id: 0,
                        eid: entity.EncounterId,
                        receipt: entity,
                        IsAgainstReceipt: true
                    },
                    confirmCallback: $scope.getList
                });
                // $state.go('app.refund-form', { id: entity.Id });
            } else if (actionType == 'view') {
                $state.go('app.advance-form', { id: entity.Id });
            } else if (actionType == 'delete') {
                if (entity.PaymentStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.paymentconsumeddelete.lbl'));
                } else if (entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.opbilling-form.paymentdraft.lbl'));
                } else {
                    $scope.requiredsecuritypin =
                        utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');
                    if ($scope.requiredsecuritypin) $scope.onDeleteConfirmed(entity.Id);
                    else utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.SpecialityName);
                }
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ReceiptNumber", displayName: $translate.instant('billing.receipt-list.receiptno.lbl') },

                {
                    field: "ReceiptDateTime",
                    displayName: $translate.instant('billing.receipt-list.receiptdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReceiptDateTime '></ngformatdate>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.receipt-list.patientinfor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>{{entity.Patient.LastName}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.MRN}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                { field: "ReceiptType.Description", displayName: $translate.instant('billing.receipt-list.type.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('Department') },
                { field: "Encounter.PatientGuarantor.GuarantorName", displayName: $translate.instant('Insurance') },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('IP No.') },
                {
                    field: "AmountPaid",
                    displayName: $translate.instant('billing.receipt-list.receiptamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountPaid | displaycurrency}}</span>" + "</div>"
                },
                { field: "AmountAdjusted", displayName: $translate.instant('Amount Adjusted') },
                { field: "RefundAmount", displayName: $translate.instant('Refund Anount') },
                { field: "PaymentType.Description", displayName: $translate.instant('billing.receipt-list.paymentmode.lbl') },
                { field: "ReceiptStatus.Description", displayName: $translate.instant('billing.receipt-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action"  ng-click="handleEvents(\'view\',entity)" ng-show="entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 4"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'refund\',entity)" ng-show="entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3  || entity.ReceiptStatusId == 4"><i class="fas fa-money"></i></span>\
                    <!--<a class="grid-action" ng-click="handleEvents(\'edit\',entity)"  ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></a>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                          </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ReceiptType" },
                { "Key": "ReceiptStatus" },
                { "Key": "CardType" }

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

    pharmacyAdvancereceiptListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();