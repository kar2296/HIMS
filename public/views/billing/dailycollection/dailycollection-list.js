(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DailyCollectionListController', DailyCollectionListController);

    function DailyCollectionListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;

        var today = new Date();
        $scope.firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            PaymentIdentifier: '',
            GeneratedBy: -1,
            //FromDate: utl.Formatter.getCurrentDate(),
            FromDate: $scope.firstDay,
            ToDate: utl.Formatter.getCurrentDate(),
            CollectionStatusId: -1,
            DoctorName: ''
        };
        $scope.Approve = 0;
        //$scope.item = {};

        $scope.CollectionDetails = [];

        $scope.selectAllItems = function () {
            for (var idx in $scope.CollectionDetails) {
                var item = $scope.CollectionDetails[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSelected = $scope.currentcontext.selectall;
                }
            }
        }
        $scope.SelectionChange = function (item) {

            if (item.IsSelected) {
                item.IsSelected = false;
            } else if (!item.IsSelected) {
                item.IsSelected = true;
            }

        }

        function getSelectionRows() {
            var SelectedRows = [];
            for (var idx in $scope.CollectionDetails) {
                var item = $scope.CollectionDetails[idx];
                if (item.IsSelected == true) {
                    if ($scope.Approve == 1) {
                        item.CollectionStatusId = 2;
                        item.IsUpdated = 1;
                    }
                    SelectedRows.push(item);
                }
            }
            //console.log($scope.SelectedRows);return;
            return SelectedRows;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {

            $scope.CollectionDetails = res.Data;
            // vm.gridConfig.data = res.Data;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.selectAllItems = function () {
            for (var idx in $scope.CollectionDetails) {
                var item = $scope.CollectionDetails[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSelected = $scope.currentcontext.selectall;
                }
            }
        }

        $scope.calc_bal = function (item) {
            item.IsSelected = true;
            item.BalanceCash = (item.OpeningBalance + item.Cash + item.PettyCash) - item.Deposit;
            item.VarianceCard = item.Card - item.EOD;
            item.VarianceUPI = item.UPI - item.BankCredit;
            item.VarianceCheque = item.Chequeddwire - item.ChequeDeposit;
        }

        // $scope.drInvSelectionChange = function (list, item) {
        //     for (var idx1 in list) {
        //         var detail = list[idx1];
        //         if (detail.IsAllSelected && !detail.IsReadOnly) {
        //             detail.IsSelected = true;
        //         } else if (!detail.IsAllSelected && !detail.IsReadOnly) {
        //             detail.IsSelected = false;
        //         }
        //     }
        // }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: FrmDate },
                    { Key: 3, Value: ToDate },
                    { Key: 4, Value: $scope.currentfilter.CollectionStatusId },
                    //{ Key: 3, Value: $scope.currentfilter.DoctorPaymentNo },
                    // { Key: 4, Value: $scope.currentfilter.DoctorId },
                    // { Key: 5, Value: 2 },//IP
                    // { Key: 12, Value: $scope.currentfilter.DoctorShareStatusId },
                    // { Key: 17, Value: $scope.currentfilter.DoctorShareStatusIPId },
                ],
                PageContext: {
                    // PageSize: vm.gridConfig.pagerObj.pageSize,
                    // PageNumber: vm.gridConfig.pagerObj.currentPage
                    PageSize: 50,
                    PageNumber: 1
                }
            };

            // if ($scope.currentfilter.PatientBillNo) {
            //     inputData.Params.push({
            //         Key: 16,
            //         Value: $scope.currentfilter.PatientBillNo
            //     });
            // }

            var options = {
                action: 'billing/CollectionReport/GetCollectionReports',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // $scope.getList = function () {
        //     //if ($scope.item.PatientId && $scope.item.PatientId > 0) {
        //         var options = {
        //             action: 'billing/CollectionReport/GetCollectionReportById',
        //             data: {
        //                 Id: 1
        //             },
        //             type: 'post',
        //             onComplete: $scope.getListCallback
        //         };
        //         utl.Http.doAction(options);
        //     //}
        // };


        $scope.NavigateForm = function (Id) {
            $state.go('app.doctorpayment', { id: Id });
        }

        $scope.addNew = function () {
            $scope.NavigateForm(0);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();

        };

        $scope.saveDraft = function () {
            $scope.Approve = 0;
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            //$scope.item.Details = [];
            $scope.item = getSelectionRows();
            console.log($scope.item);
            if ($scope.item.length > 0) {
                var Details = $scope.item;
            } else {
                utl.Alert.showErrorMsg('Please Select Any Bill');
                return;
            }

            var actionName = 'billing/CollectionReport/ManageCollectionReportUpdate';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     var actionName = 'doctorinvoice/DoctorInvoice/UpdateDoctorInvoice';
            //     $scope.item.Id = $scope.currentcontext.id;
            // }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.openattachments = function (item) {
            if (item.EncounterId > 0) {
                utl.Modal.open('app.payoutattachments', {
                    params: {
                        eid: item.EncounterId,
                        //itemid: $scope.item.Id
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        };

        $scope.onSaveandApprove = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            $scope.Approve = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Approve This Collection Report?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'cancel') {

            }
            if (actionType == 'edit') {
                $scope.NavigateForm(row.entity.Id);
            }
        };

        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     columnDefs: [{
        //         field: "BillDateTime",
        //         displayName: $translate.instant('Bill Date'),
        //         cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
        //     },
        //     {
        //         field: "PatientBill.BillNumber",
        //         displayName: $translate.instant('Bill No')
        //     },
        //     {
        //         field: "PatientBill.BillNumber",
        //         displayName: $translate.instant('Bill No')
        //     },
        //     {
        //         field: "PatientBill.Patient",
        //         displayName: $translate.instant('Patient Name'),
        //         cellTemplate: "<div class='ui-grid-cell-contents'>" +
        //             "<span >{{row.entity.PatientBill.Patient.Title.Description}}&nbsp;</span>" +
        //             "<span >{{row.entity.PatientBill.Patient.FirstName}}&nbsp;</span>" +
        //             "<span >{{row.entity.PatientBill.Patient.LastName}}&nbsp;</span>" +
        //             "</span></div>"
        //     },
        //     {
        //         field: "DoctorName",
        //         displayName: $translate.instant('Doctor Name')
        //     },
        //     {
        //         field: "PAN",
        //         displayName: $translate.instant('PAN No')
        //     },
        //     {
        //         field: "Insurance",
        //         displayName: $translate.instant('Insurance')
        //     },
        //     {
        //         field: "ServiceName",
        //         displayName: $translate.instant('Billing Service')
        //     },
        //     {
        //         field: "ServiceAmount",
        //         displayName: $translate.instant('Service Amount')
        //     },
        //     {
        //         field: "DoctorShareAmount",
        //         displayName: $translate.instant('Dr. Share')
        //     },
        //     {
        //         field: "DoctorShareAmount",
        //         displayName: $translate.instant('Dr. Share')
        //     },

        //     ],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                //{ "Key": "PaymentDate" },
                { "Key": "CollectionStatus" }
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
    DailyCollectionListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];
})();