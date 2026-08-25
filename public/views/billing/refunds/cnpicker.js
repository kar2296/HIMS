(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnPickerController', cnPickerController);

    function cnPickerController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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
                ToDate: utl.Formatter.getCurrentDate(),
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
                    { type: 'date', translate: 'billing.creditnote.filter_from.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.creditnote.filter_to.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'billing.creditnote.filter_name.lbl', model: 'name', position: { r: 0, c: 2 } },
                    { type: 'text', translate: 'billing.creditnote.filter_cnno.lbl', model: 'CreditNoteIdentifier', position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'billing.creditnote.filter_cntype.lbl', model: 'CreditNoteTypeId',options: $scope.lookup.CreditNoteType, position: { r: 1, c: 1 } },

                    { type: 'select', translate: 'billing.creditnote.filter_cnstatus.lbl', model: 'CreditNoteStatusId',options: $scope.lookup.CreditNoteStatus, position: { r: 1, c: 2 } }
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
        $scope.custom_sort = function(a, b) {
            return new Date(b.CreditNoteDateTime).getTime() - new Date(a.CreditNoteDateTime).getTime();
        }
        $scope.getListCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
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
        };
 $scope.getList = function(pageNo) {
            // var fromDate = $filter('date')($scope.modeldata.From, 'yyyy-MM-dd 00:00:00');
            // var toDate = $filter('date')($scope.modeldata.To, 'yyyy-MM-dd 23:59:59');

            if ($scope.modeldata.FromDate || $scope.modeldata.ToDate) {
                $scope.modeldata.CreditNoteDateTime = '';
            }

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.modeldata.CreditNoteIdentifier },
                    { Key: 2, Value: $scope.modeldata.name },
                    { Key: 1, Value: $scope.modeldata.CreditNoteDateTime },
                    { Key: 3, Value: $scope.modeldata.CreditNoteTypeId },
                    { Key: 5, Value: $scope.modeldata.CreditNoteStatusId },
                    { Key: 11, Value: $scope.modeldata.FromDate },
                    { Key: 12, Value: $scope.modeldata.ToDate },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Billing/PatientCreditNote/GetPatientCreditNotes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            columnDefs: [{
                    field: "CreditNoteIdentifier",
                    displayName: $translate.instant('billing.creditnote.cnno.lbl'),
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.creditnote.name.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.MRN}}</span>" +
                        "<span >/</span>" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span >&nbsp;{{row.entity.Patient.FirstName}}</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "CreditNoteDateTime",
                    displayName: $translate.instant('billing.creditnote.cndate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>{{row.entity.CreditNoteDateTime | date : 'dd-MMM-yyyy'}}&nbsp;{{row.entity.CreditNoteDateTime | date : 'HH:mm'}}</div>"
                },
                {
                    field: "CreditNoteType.Description",
                    displayName: $translate.instant('billing.creditnote.cntype.lbl'),
                },
                { field: "CreditNoteAmount", displayName: $translate.instant('billing.creditnote.cnamt.lbl') },

                { field: "CreditNoteStatus.Description", displayName: $translate.instant('billing.creditnote.status.lbl') }
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
                $scope.confirmCallback(row.entity);
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
                { "Key": "Facility" },
                { "Key": "CreditNoteType" },
                { "Key": "CreditNoteStatus" },
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


        // ---- React bridge (UI-MODERNIZATION RETROFIT) ----
        // AngularJS remains authoritative for all data/business logic in this
        // controller; this section only mirrors state into reactProps and
        // dispatches UI actions from BillingCnPickerScreen back onto the real,
        // unchanged $scope/vm functions and fields. The dynamicform-driven
        // filter area, its Apply/Reset buttons, and the modal header are left
        // as native AngularJS markup in cnpicker.html and are NOT covered by
        // this bridge -- see the disclosure comment in
        // BillingCnPickerScreen.tsx for the full rationale.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                gridData: vm.gridConfig.data,
                pagerObj: vm.gridConfig.pagerObj
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

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'selectRow':
                    $scope.confirmCallback(payload);
                    break;
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    break;
                default:
                    // covers cancelCallback (real, working dismiss), and the confirmed
                    // pre-existing dead 'patientinfo' handler (grid.appScope.handleEvents
                    // is never defined on this controller's scope, so this safely
                    // no-ops, matching the real app's behavior today)
                    if (typeof $scope[actionName] === 'function') {
                        $scope[actionName]();
                    }
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    cnPickerController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();