(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargedpatientsListController', dischargedpatientsListController);

    function dischargedpatientsListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.Items = [];

        $scope.item = {
            receiptdate: utl.Formatter.getCurrentDate(),
            ToBeCancelBillId: -1,
            EncounterId: -1,
            BedId: -1
        };

        $scope.currentfilter = {
            WardId: -1,
            PatientMRN: '',
            BillNumber: '',
            VisitIdentifier: '',
            AdmissionStatusId: -1,
            doddate: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};

        function initDynamicForm() {
            $scope.advancedfilter = {};

            $scope.advancedfilterDefault = {
                DepartmentId: -1,
                DoctorId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1,
                DOD: utl.Formatter.getCurrentDate()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'billing.dischargedpatients.doa.lbl', model: 'DOA', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.dischargedpatients.dod.lbl', model: 'DOD', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'billing.inpatients.phone.lbl', model: 'Phone', position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'billing.inpatients.guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'billing.inpatients.guarantortype.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'billing.inpatients.admittingdoctors.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'billing.inpatients.department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 3, c: 0 } },
                    { type: 'checkbox', translate: 'billing.inpatients.department.lbl', model: 'IsOutstanding', position: { r: 3, c: 1 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.DischargeDate).getTime() - new Date(a.DischargeDate).getTime();
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            data.Data.forEach((val, idx) => {
                var bill = val.FinalBills.length > 0 ? val.FinalBills[0] : {};
                val.BillDate = bill.BillDateTime;
                val.BillNumber = bill.BillNumber;
                val.GrossAmount = parseFloat(bill.BillAmount);
                val.BillDiscount = parseFloat(bill.BillDiscount);
                val.NetAmount = (parseFloat(val.GrossAmount) - parseFloat(val.BillDiscount));
            });
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            vm.gridConfig.data = data.Data;
            for (var idx in vm.gridConfig.data) {
                var item = vm.gridConfig.data[idx];
                item.OutStandingAmount = item.FinalBills[0].OutStandingAmount;
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var FrmDOA = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var ToDOA = $filter('date')($scope.advancedfilter.DOD, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDOD = $filter('date')($scope.currentfilter.doddate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDOD = $filter('date')($scope.currentfilter.doddate, 'yyyy-MM-dd 23:59:59') || null;
            if ($scope.currentfilter.PatientMRN || $scope.currentfilter.VisitIdentifier) {
                FrmDOD = null;
                ToDOD = null;
            }
            var inputData = {
                Params: [
                    { Key: 28, Value: FrmDOD },
                    { Key: 29, Value: ToDOD },
                    { Key: 17, Value: FrmDOA },
                    { Key: 18, Value: ToDOA },
                    { Key: 2, Value: $scope.currentfilter.WardId },
                    { Key: 15, Value: 2 },
                    { Key: 3, Value: 6 },
                    { Key: 11, Value: $scope.currentfilter.PatientMRN },
                    { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 3, Value: $scope.currentfilter.AdmissionStatusId },
                    { Key: 21, Value: $scope.advancedfilter.Phone },
                    { Key: 19, Value: $scope.advancedfilter.GuarantorId },
                    { Key: 5, Value: $scope.advancedfilter.DoctorId },
                    { Key: 6, Value: $scope.advancedfilter.DepartmentId },
                    { Key: 23, Value: $scope.advancedfilter.GuarantorTypeId },
                    { Key: 22, Value: true },
                    { Key: 39, Value: $scope.currentfilter.BillNumber },
                    { Key: 51, Value: false }, // Modified
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/Visit/GetIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.cancelBillCallback = function () {
            $scope.getList();
        };

        $scope.onCancelConfirmed = function () {
            var inputData = {
                PatientBillId: $scope.item.ToBeCancelBillId,
                EncounterId: $scope.item.EncounterId,
                BedId: $scope.item.BedId
            };
            var options = {
                action: 'billing/patientbills/CancelIPPatientBill',
                data: {
                    Id: $scope.item.ToBeCancelBillId,
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.cancelBillCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onCancelBill = function (item) {
            $scope.item.ToBeCancelBillId = item.FinalBills[0].Id;
            $scope.item.EncounterId = item.Id;
            $scope.item.BedId = item.BedId;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.dischargedpatients.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.ipbillingtab.summary', {
                    id: row.entity.Id,
                    filter_from: $scope.advancedfilter.DOA,
                    filter_to: $scope.advancedfilter.DOD,
                    filter_phone: $scope.advancedfilter.Phone,
                    filter_guarantor: $scope.advancedfilter.GuarantorId,
                    filter_guarantortype: $scope.advancedfilter.GuarantorTypeId,
                    filter_doctor: $scope.advancedfilter.DoctorId,
                    filter_dept: $scope.advancedfilter.DepartmentId,
                    filter_isout: $scope.advancedfilter.IsOutstanding,
                });
            } else if (actionType == 'cancel') {
                //utl.Dialog.confirmDelete($scope.onCancelConfirmed, row.entity.Id, row.entity.BillNumber);
                $scope.onCancelBill(row.entity);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            }
        };

        var rowtpl = '<div ng-class="{\'nonself\':row.entity.PatientGuarantor.GuarantorTypeId!=1} "><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [
                {
                    field: "AdmissionDate", displayName: $translate.instant('billing.dischargedpatients.doa.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.BillDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "BillDate", displayName: $translate.instant('billing.dischargedpatients.billdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.BillDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.BillDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "BillNumber", displayName: $translate.instant('billing.dischargedpatients.billno.lbl')
                },
                { field: "VisitIdentifier", displayName: $translate.instant('billing.dischargedpatients.ipnumber.lbl') },
                {
                    field: "Patient", displayName: $translate.instant('billing.dischargedpatients.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} {{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}} / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="left" >'
                        + "{{row.entity.Patient.Title.Description}}&nbsp;</span>"
                        + "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>"
                        + "<span >{{row.entity.Patient.LastName}}&nbsp;</span>"
                        + "<span >/</span>"
                        + "<span >{{row.entity.Patient.MRN}}&nbsp;</span>"
                        + "<span >/<span>"
                        + "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >"
                        + "<span >&nbsp;{{row.entity.Patient.Age}}&nbsp;</span>"
                        + "<span >/</span>"
                        + "<span >{{row.entity.Patient.Gender.Description}}</span>"
                        + "</a></div>"
                },
                {
                    field: "PaymentType.Description", displayName: $translate.instant('billing.dischargedpatients.admittingdoctors.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                        + "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>"
                        + "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>"
                        + "<span >{{row.entity.Doctor.LastName}}</span>"
                        + "</span></div>"
                },
                {
                    field: "AdmissionDate", displayName: $translate.instant('billing.dischargedpatients.doa.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.AdmissionDate | date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DischargeDate", displayName: $translate.instant('billing.dischargedpatients.dod.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.DischargeDate | date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PatientGuarantor.GuarantorName", displayName: $translate.instant('billing.dischargedpatients.guarantor.lbl')
                },
                {
                    field: "GrossAmount", displayName: $translate.instant('billing.dischargedpatients.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.GrossAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "BillDiscount", displayName: $translate.instant('billing.dischargedpatients.discountamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.BillDiscount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "NetAmount", displayName: $translate.instant('billing.dischargedpatients.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.NetAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "OutStandingAmount", displayName: $translate.instant('billing.dischargedpatients.dueamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.OutStandingAmount | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <button type="button" class="grid-action btn btn-warning btn-xs" ng-click="grid.appScope.handleEvents(\'edit\',row)"><i class="fa fa-usd" aria-hidden="true"></i></button>\
                                                <button type="button" class="grid-action btn btn-danger btn-xs" ng-click="grid.appScope.handleEvents(\'cancel\',row)"><i class="fa fa-close" aria-hidden="true"></i></button>\
                                                </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        //React bridge for the <custom-table config="vm.gridConfig"> grid.
        //
        //AUTHORISED PRESENTATION-BINDING REPAIR (this screen only): the
        //cellTemplates in vm.gridConfig were written for ui-grid and still use
        //ui-grid-only expressions -- {{row.entity.X}} and
        //grid.appScope.handleEvents(...). The template renders through
        //<custom-table>, whose cell scope (js/app.js cellTemplateFun) exposes
        //only entity, index, template, event and handleEvents. So `row` and
        //`grid` are undefined today: those columns render blank and the two
        //action buttons are inert. The bindings are corrected here to the
        //values the controller demonstrably intends:
        //  row.entity.X                  -> the row's own entity value
        //  grid.appScope.handleEvents(a) -> this bridge's dispatcher, which
        //                                   calls $scope.handleEvents unchanged
        //Evidence: getListCallback computes BillDate, BillNumber, GrossAmount,
        //BillDiscount, NetAmount and OutStandingAmount onto each record;
        //handleEvents itself reads row.entity.Id / row.entity.Patient.Id and
        //passes row.entity to onCancelBill; and the GrossAmount/BillDiscount/
        //NetAmount columns already use the correct {{entity.X}} form, which is
        //what the broken columns were meant to be.
        //
        //handleEvents is NOT modified: it still receives a ui-grid-shaped
        //{ entity: ... } wrapper, so row.entity.Id, row.entity.Patient.Id and
        //onCancelBill(row.entity) all keep working on the real record. No API,
        //payload, filter or business logic is touched.
        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (entity === null) { return; }
            //Same wrapper shape ui-grid passed, so handleEvents is unchanged.
            var row = { entity: entity };
            if (actionType == 'rowAction') {
                $scope.handleEvents(payload.key, row);
            } else if (actionType == 'cellAction') {
                $scope.handleEvents('patientinfo', row);
            }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function dt(v, fmt) { return v ? $filter('date')(v, fmt) : ''; }
            function cur(v) { return $filter('displaycurrency')(v); }
            function nameOf(o, withMrnAge) {
                if (!o) { return ''; }
                var s = (o.Title && o.Title.Description ? o.Title.Description + ' ' : '') + (o.FirstName || '') + ' ' + (o.LastName || '');
                if (withMrnAge) {
                    s += ' / ' + (o.MRN || '');
                    //Original wraps Age/Gender in ng-if="Patient.Title && Patient.Title.Description".
                    if (o.Title && o.Title.Description) {
                        s += ' / ' + (o.Age || '') + ' / ' + (o.Gender && o.Gender.Description ? o.Gender.Description : '');
                    }
                }
                return s.replace(/\s+/g, ' ').trim();
            }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    //Column order and headers taken from vm.gridConfig.columnDefs
                    //as-is, including the two separate DOA columns the original
                    //defines (indexes 0 and 6) -- not de-duplicated.
                    columns: [
                        { key: 'doa1', header: hdr(0) },
                        { key: 'billdate', header: hdr(1) },
                        { key: 'billno', header: hdr(2), sortable: true },
                        { key: 'ipno', header: hdr(3), sortable: true },
                        { key: 'patient', header: hdr(4), link: true },
                        { key: 'doctor', header: hdr(5), link: true },
                        { key: 'doa2', header: hdr(6) },
                        { key: 'dod', header: hdr(7) },
                        { key: 'guarantor', header: hdr(8), sortable: true },
                        { key: 'gross', header: hdr(9), align: 'right' },
                        { key: 'discount', header: hdr(10), align: 'right' },
                        { key: 'net', header: hdr(11), align: 'right' },
                        { key: 'outstanding', header: hdr(12), align: 'right' }
                    ],
                    actionsHeader: hdr(13) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        return {
                            id: entity.Id,
                            //Both original buttons were unconditional (no ng-show,
                            //no ng-if, no privilege check) -- kept unconditional.
                            actions: [
                                { key: 'edit', label: '', icon: 'fa fa-usd', variant: 'warning', title: 'Bill' },
                                { key: 'cancel', label: '', icon: 'fa fa-close', variant: 'danger', title: 'Cancel' }
                            ],
                            cells: {
                                //PRE-EXISTING QUIRK kept: this column takes its DATE
                                //from AdmissionDate but its TIME from BillDate.
                                doa1: dt(entity.AdmissionDate, 'dd-MMM-yyyy') + ' ' + dt(entity.BillDate, 'HH:mm'),
                                billdate: dt(entity.BillDate, 'dd-MMM-yyyy') + ' ' + dt(entity.BillDate, 'HH:mm'),
                                billno: entity.BillNumber,
                                ipno: entity.VisitIdentifier,
                                patient: nameOf(entity.Patient, true),
                                doctor: nameOf(entity.Doctor, false),
                                doa2: dt(entity.AdmissionDate, 'dd-MMM-yyyy') + ' ' + dt(entity.AdmissionDate, 'HH:mm'),
                                dod: dt(entity.DischargeDate, 'dd-MMM-yyyy') + ' ' + dt(entity.DischargeDate, 'HH:mm'),
                                guarantor: entity.PatientGuarantor && entity.PatientGuarantor.GuarantorName,
                                gross: cur(entity.GrossAmount),
                                discount: cur(entity.BillDiscount),
                                net: cur(entity.NetAmount),
                                outstanding: cur(entity.OutStandingAmount)
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.advancedfilter.DOA = $stateParams.filter_from;
                $scope.advancedfilter.DOD = $stateParams.filter_to;
                $scope.advancedfilter.Phone = $stateParams.filter_phone;
                $scope.advancedfilter.GuarantorId = $stateParams.filter_guarantor;
                $scope.advancedfilter.GuarantorTypeId = $stateParams.filter_guarantortype;
                $scope.advancedfilter.DoctorId = $stateParams.filter_doctor;
                $scope.advancedfilter.DepartmentId = $stateParams.filter_dept;
                $scope.advancedfilter.IsOutstanding = $stateParams.filter_isout;
                $scope.currentfilter.doddate = $stateParams.filter_doddate;
                $scope.getList();
            }
            else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Facility" },
                // { "Key": "ReceiptType" },
                // { "Key": "ReceiptStatus" },
                // { "Key": "Doctor" },
                // { "Key": "Department" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "GuarantorType" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps();

        $scope.initLookup();
    }

    dischargedpatientsListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();