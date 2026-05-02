(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('receiptListController', receiptListController);

    function receiptListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.Items = [];

        var currentdate =  new Date();
        var startdate = new Date(currentdate.setDate(currentdate.getDate() - 30));
        $scope.currentfilter = {
            namemrn: '',
            ReceiptStatusId: 1,
            ReceiptTypeId: 2,
            Fromreceiptdate: startdate,
            Toreceiptdate: utl.Formatter.getCurrentDate(),
            Facilityid: utl.Session.getCurrentFacilityId(),

        };

        $scope.item = {
            receiptdate: utl.Formatter.getCurrentDate(),

        };
        $scope.currentcontext = {

        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            // forEach(data.Data, function (value, index) {
            //     value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
            // });

            vm.gridConfig.data = data.Data;
            var Amount = 0;
            for (var idx in data.Data) {
                Amount = Amount + data.Data[idx].AmountPaid

            }
            $scope.TotalAmount = Amount;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.Fromreceiptdate, 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')($scope.currentfilter.Toreceiptdate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.receipt
                },
                {
                    Key: 26,
                    Value: $scope.currentfilter.Facilityid
                },
                // {
                //     Key: 3,
                //     Value: [$scope.currentfilter.Fromreceiptdate, $scope.currentfilter.Toreceiptdate]
                // },
                {
                    Key: 4,
                    Value: $scope.currentfilter.ReceiptTypeId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ReceiptStatusId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.namemrn
                },
                {
                    Key: 27,
                    Value: From
                },
                {
                    Key: 28,
                    Value: To
                },
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
            $state.go('app.receipt-form', {
                id: 0
            });
        }

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
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.printrefund = function () {
            var inputData = {
                Id: $scope.currentcontext.refid,
                Data: {
                    withHeader: true
                }
            };
            var options = {
                action: 'Billing/PatientRefund/PrintPatientRefund',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.getRefundDataCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.currentcontext.refid = data.Data[0].Id;
                $scope.printrefund();
            }
        };

        $scope.getRefundData = function (info) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 1
                }, //Completed
                {
                    Key: 9,
                    Value: info.Id
                },
                {
                    Key: 10,
                    Value: info.EncounterId
                },
                ]
            };

            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRefundDataCallback
            };

            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.receipt-form', {
                    id: entity.Id,
                    pid: entity.PatientId
                });
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
            } else if (actionType == 'refundview') {
                $scope.getRefundData(entity);
                // utl.Modal.open('app.refund-form', {
                //     params: {
                //         eid: entity.EncounterId,
                //         receipt: entity,
                //         IsAgainstReceipt: true,
                //         context: 'receipt'
                //     },
                //     confirmCallback: $scope.getList
                // });
                // $state.go('app.refund-form', { id: entity.Id });
            } else if (actionType == 'view') {
                $state.go('app.receipt-form', {
                    id: entity.Id,
                    pid: entity.PatientId
                });
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
            columnDefs: [{
                field: "ReceiptNumber",
                displayName: $translate.instant('billing.receipt-list.receiptno.lbl')
            },

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
            {
                field: "ReceiptType.Description",
                displayName: $translate.instant('billing.receipt-list.type.lbl')
            },
            {
                field: "AmountPaid",
                displayName: $translate.instant('billing.receipt-list.receiptamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountPaid | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('billing.receipt-list.paymentmode.lbl')
            },
            {
                field: "ReceiptStatus.Description",
                displayName: $translate.instant('billing.receipt-list.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                            <a class="grid-action" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></a>\
                            <a class="grid-action" ng-click="handleEvents(\'refund\',entity)" ng-show="entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3"><i class="fas fa-money"></i></a>\
                            <a class="grid-action" ng-click="handleEvents(\'refundview\',entity)"  ng-show="entity.ReceiptStatusId == 4"><i class="fas fa-print"></i></a>\
                            <a class="grid-action" ng-click="handleEvents(\'edit\',entity)"  ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></a>\
                            <a class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></a>\
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
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "ReceiptType"
            },
            {
                "Key": "ReceiptStatus"
            },
            {
                "Key": "CardType"
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

        $scope.initLookup();
    }

    receiptListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();