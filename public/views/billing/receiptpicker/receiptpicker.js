(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('receiptPickerController', receiptPickerController);

    function receiptPickerController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.id = modalConfig.params.id

        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                mrn: '',
                patientname: '',
                dateofbirth: '',
                ReceiptStatusId: 1,
                phoneno: '',
                visitid: '',
                From: utl.Formatter.getCurrentDate(),
                PatientId: -1,
                ReceiptTypeId: 2,
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
                Area: ''
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'date', translate: 'billing.receiptpicker.filter_fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'select', translate: 'billing.receiptpicker.filter_mrnumber.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'billing.receiptpicker.filter_firstname.lbl', model: 'FirstName', position: { r: 0, c: 2 } },
                    { type: 'date', translate: 'billing.receiptpicker.filter_todate.lbl', model: 'To', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'billing.receiptpicker.filter_op/dg/ip.lbl', model: 'OP/DG/IPNumber', position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'billing.receiptpicker.filter_lastname.lbl', model: 'LastName', position: { r: 1, c: 2 } },
                    { type: 'text', translate: 'billing.receiptpicker.filter_receiptnumber.lbl', model: 'receipt', position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'billing.receiptpicker.filter_receiptstatus.lbl', model: 'ReceiptStatusId', options: $scope.lookup.ReceiptStatus, position: { r: 2, c: 1 } },
                    { type: 'text', translate: 'billing.receiptpicker.filter_billnumber.lbl', model: 'billnumber', options: $scope.lookup.Referral, position: { r: 2, c: 2 } },
                    { type: 'text', translate: 'billing.receiptpicker.filter_phamarcybillnumber.lbl', model: 'phamarcybillnumber', position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'billing.receiptpicker.filter_Facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'appmanager.specialitys.filter_type.lbl', model: 'ReceiptTypeId', options: $scope.lookup.ReceiptType, position: { r: 3, c: 2 } },

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
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function(pageNo) {
            var fromDate = $filter('date')($scope.modeldata.From, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.modeldata.To, 'yyyy-MM-dd 23:59:59');
            if (!$scope.modeldata.To) {
                toDate = $filter('date')($scope.modeldata.From, 'yyyy-MM-dd 23:59:59');
            }

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.modeldata.receipt },
                    { Key: 2, Value: $scope.modeldata.PatientId },
                    { Key: 3, Value: [fromDate, toDate] },
                    { Key: 5, Value: $scope.modeldata.ReceiptStatusId },
                    { Key: 6, Value: $scope.modeldata.FirstName },
                    { Key: 7, Value: $scope.modeldata.LastName },
                    { Key: 4, Value: $scope.modeldata.ReceiptTypeId },

                    { Key: 2, Value: $scope.currentcontext.id },


                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
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

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ReceiptDateTime",
                    displayName: $translate.instant('billing.receipt-list.receiptdate.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.ReceiptDateTime ? (entity.ReceiptDateTime | date : "dd-MM-yyyy HH:mm:ss") : "N/A"}} </div>'
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('billing.receiptpicker.mrnumber.lbl'),
                },
                {
                    field: "EncountertypeId",
                    displayName: $translate.instant('billing.receiptpicker.op/dg/ip.lbl'),
                    width: '10%',
                    cellTemplate: '<div class="ui-grid-cell-contents">{{"OP"}}</div>'
                },

                {
                    field: "ReceiptNumber",
                    displayName: $translate.instant('billing.receiptpicker.receipt.lbl'),
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.receipt-list.patientinfor.lbl'),
                    width: '20%',
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ entity.Patient.Title && entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{entity.Patient.FirstName}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.MRN}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                { field: "PaymentType.Description", displayName: $translate.instant('billing.receiptpicker.paymenttype.lbl') },
                { field: "GuarantorType.Description", displayName: $translate.instant('billing.receiptpicker.payerscenario.lbl') },

                { field: "GurantorName", displayName: $translate.instant('billing.receiptpicker.guarantorname.lbl') },

                { field: "AmountPaid", displayName: $translate.instant('billing.receiptpicker.receiptsamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountPaid | displaycurrency}}</span>" + "</div>"
            },

            ],
            enableFullRowSelection: true,
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function(gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(row) {

                console.log(entity.Id);
                $scope.confirmCallback({ rid: entity.Id });
            });
        };
        //Grid selection related code ends

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
                { "Key": "VisitType" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // ---------------------------------------------------------------
        // REACT BRIDGE (UI-modernization retrofit, Billing / Find Receipt
        // picker modal). AngularJS still owns all real state and logic
        // below -- this block only mirrors it into $scope.reactProps and
        // routes UI interactions back here by action name via
        // handleReactAction. No business logic was changed.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                modeldata: $scope.modeldata,
                lookup: $scope.lookup,
                gridData: $scope.gridData
            };
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'apply') {
                angular.extend($scope.modeldata, (payload && payload.modeldata) || {});
                $scope.actionClick('apply');
            } else if (actionName === 'reset') {
                $scope.actionClick('reset');
            } else if (actionName === 'pageChange') {
                $scope.getList();
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    receiptPickerController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();