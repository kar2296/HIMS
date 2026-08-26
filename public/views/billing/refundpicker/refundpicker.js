(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('refundPickerController', refundPickerController);

    function refundPickerController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                mrn: '',
                patientname: '',
                dateofbirth: '',
                RefundStatusId: 1,
                phoneno: '',
                visitid: '',
                From: utl.Formatter.getCurrentDate(),
                To: '',
                ReferralId: -1,
                PinCode: '',
                VisitDate: '',
                Country: '',
                VisitTypeId: -1,
                State: '',
                GuarantorId: -1,
                CityTown: '',
                IsAdmitted: false,
                Area: '',
                FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'date', translate: 'billing.refundpicker.filter_fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_mrnumber.lbl', model: 'namemrn', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_firstname.lbl', model: 'FirstName', position: { r: 0, c: 2 } },
                    { type: 'date', translate: 'billing.refundpicker.filter_todate.lbl', model: 'To', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_op/dg/ip.lbl', model: 'OP/DG/IPNumber', position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_lastname.lbl', model: 'LastName', position: { r: 1, c: 2 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_receiptnumber.lbl', model: 'Refundidentifier', position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'billing.refundpicker.filter_receiptstatus.lbl', model: 'RefundStatusId', options: $scope.lookup.ReceiptStatus, position: { r: 2, c: 1 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_search.lbl', model: 'Country', position: { r: 2, c: 2 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_phamarcybillnumber.lbl', model: 'phamarcybillnumber', position: { r: 3, c: 0 } },
                    { type: 'text', translate: 'billing.refundpicker.filter_billnumber.lbl', model: 'billnumber', options: $scope.lookup.Referral, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'billing.refundpicker.filter_Facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 3, c: 2 } },

                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function(actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));;
            }
            $scope.getList();
        }

        //Dynamic form  ends

        //getList
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            for (var idx in items) {
                var item = items[idx];
                item.LatestAppointment = (item.Appointments != null &&
                        item.Appointments.length > 0) ?
                    item.Appointments[0] : null;
            }
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            $scope.refreshReactProps();
        };

        $scope.getList = function(pageNo) {
            var fromDate = $filter('date')($scope.modeldata.From, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.modeldata.To, 'yyyy-MM-dd 23:59:59');
            if (!$scope.modeldata.To) {
                toDate = $filter('date')($scope.modeldata.From, 'yyyy-MM-dd 23:59:59');
            }

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.modeldata.Refundidentifier },
                    { Key: 2, Value: $scope.modeldata.namemrn },
                    { Key: 3, Value: [fromDate, toDate] },
                    { Key: 5, Value: $scope.modeldata.RefundStatusId },
                    { Key: 6, Value: $scope.modeldata.FirstName },
                    { Key: 7, Value: $scope.modeldata.LastName },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
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

        vm.gridConfig = {
            columnDefs: [{
                    field: "RefundDateTime",
                    displayName: $translate.instant('billing.refund-list.refunddate.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.RefundDateTime ? (row.entity.RefundDateTime | date : "dd-MM-yyyy HH:mm:ss") : "N/A"}} </div>'
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('billing.refundpicker.mrnumber.lbl'),
                },
                {
                    field: "EncountertypeId",
                    displayName: $translate.instant('billing.refundpicker.op/dg/ip.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{"OP"}}</div>'
                },


                {
                    field: "Refundidentifier",
                    displayName: $translate.instant('billing.refundpicker.receipt.lbl'),
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.receipt-list.patientinfor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ row.entity.Patient.Title && row.entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{row.entity.Patient.FirstName}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.MRN}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                { field: "PaymentType.Description", displayName: $translate.instant('billing.refundpicker.paymenttype.lbl') },

                { field: "GurantorName", displayName: $translate.instant('billing.refundpicker.guarantorname.lbl') },

                { field: "RefundAmount", displayName: $translate.instant('billing.refundpicker.receiptsamount.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function(gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                console.log(row.entity.Id);
                $scope.confirmCallback({ rid: row.entity.Id });
            });
        };
        //Grid selection related code ends

        //React bridge: replaces the ui-grid="vm.gridConfig" grid above.
        //The gridApi.selection based onRegisterApi handler above is no
        //longer invoked (no ui-grid directive remains to call it) -- its
        //exact behaviour, closing this picker modal with the selected
        //refund's Id via confirmCallback({ rid: ... }), is reproduced
        //below in handleReactAction's 'rowSelected' case instead.
        $scope.handleReactAction = function(actionType, payload) {
            if (actionType == 'rowSelected') {
                console.log(payload.id);
                $scope.confirmCallback({ rid: payload.id });
            }
        };

        $scope.refreshReactProps = function() {
            var items = vm.gridConfig.data || [];
            var rows = items.map(function(item) {
                var patient = item.Patient || {};
                return {
                    id: item.Id,
                    refundDateDisplay: item.RefundDateTime ? $filter('date')(item.RefundDateTime, 'dd-MM-yyyy HH:mm:ss') : 'N/A',
                    mrn: patient.MRN,
                    refundidentifier: item.Refundidentifier,
                    patientTitle: patient.Title && patient.Title.Description,
                    patientFirstName: patient.FirstName,
                    patientMRN: patient.MRN,
                    patientAge: patient.Age,
                    patientGender: patient.Gender && patient.Gender.Description,
                    paymentType: item.PaymentType && item.PaymentType.Description,
                    guarantorName: item.GurantorName,
                    refundAmount: item.RefundAmount
                };
            });

            $scope.reactPropsContainer = {
                reactProps: {
                    headers: vm.gridConfig.columnDefs.map(function(c) { return c.displayName; }),
                    rows: rows
                },
                onAction: $scope.handleReactAction
            };
        };

        $scope.refreshReactProps();

        //Lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "ReceiptStatus" },
                { "Key": "Referral" },
                { "Key": "Facility" },
                { "Key": "VisitType" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
            ];

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

    refundPickerController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();