(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimsummaryController', claimsummaryController);

    function claimsummaryController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                MRN: null,
                DoctorId: -1,
                MobileNo: null,
                BillPriorityId: -1,
                BillStatusId: -1,
                BillTypeId: -1,
                PatientId: -1,
                PatientBillStatusId: 3,
                BillNumber: null,
                FacilityId: -1, //parseInt(utl.Session.getCurrentFacilityId())
                GuarantorTypeId: -1,
                GuarantorId: -1,
                IsOutStanding: false
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'date', translate: 'billing.findbill-list.date.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.findbill-list.todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'billing.findbill-list.mrn.lbl', model: 'MRN', position: { r: 0, c: 2 } },
                    { type: 'select', translate: 'billing.findbill-list.consdoctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'billing.findbill-list.mobileno.lbl', model: 'MobileNo', position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'billing.findbill-list.billpriority.lbl', model: 'BillPriorityId', options: $scope.lookup.BillPriority, position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'billing.findbill-list.billstatus.lbl', model: 'PatientBillStatusId', options: $scope.lookup.PatientBillStatus, position: { r: 2, c: 0 } },
                    // { type: 'select', translate: 'billing.findbill-list.billtype.lbl', model: 'BillTypeId', options: $scope.lookup.BillType, position: { r: 2, c: 1 } },
                   { type: 'select', translate: 'billing.findbill-list.guarantortype.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 2, c: 1 } },
                    { type: 'text', translate: 'billing.findbill-list.patientname.lbl', model: 'PatientName', position: { r: 2, c: 2 } },
                    { type: 'text', translate: 'billing.findbill-list.billnumber.lbl', model: 'BillNumber', position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'billing.findbill-list.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'billing.findbill-list.guarantor.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 3, c: 2 } },
                   { type: 'checkbox', translate: 'billing.findbill-list.isoutstanding.lbl', model: 'IsOutStanding', position: { r: 4, c: 0 } },
                   { type: '', translate: '', model: '', position: { r: 4, c: 1 } },
                   // { type: 'select', translate: 'billing.findbill-list.guarantortype.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 4, c: 0 } },
                   // { type: 'checkbox', translate: 'billing.findbill-list.isoutstanding.lbl', model: 'IsOutStanding', position: { r: 4, c: 1 } },
                   { type: '', translate: '', model: '', position: { r: 4, c: 2 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }
            $scope.getList();
        }

        //Dynamic form  ends
        //getList
        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.Data.length;
        };

        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            var inputData = {
                Params: [
                    { Key: 1, Value: [FrmDate, ToDate] },
                    { Key: 2, Value: $scope.modeldata.BillNumber },
                    { Key: 4, Value: $scope.modeldata.PatientBillStatusId },
                    { Key: 5, Value: $scope.modeldata.BillPriorityId },
                    { Key: 6, Value: 1 },
                    { Key: 7, Value: $scope.modeldata.DoctorId },
                    { Key: 8, Value: $scope.modeldata.FacilityId },
                    { Key: 9, Value: $scope.modeldata.GuarantorTypeId },
                    { Key: 10, Value: $scope.modeldata.GuarantorId },
                    { Key: 11, Value: OutStandingcond },
                    { Key: 12, Value: $scope.modeldata.PatientId },
                    { Key: 13, Value: $scope.modeldata.MRN },
                    { Key: 14, Value: $scope.modeldata.MobileNo },
                    { Key: 15, Value: $scope.modeldata.PatientName },
                    { Key: 12, Value: $scope.currentcontext.id },
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientbills/GetPatientBills',
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
        }


        //Grid Actions
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.ipbillingtab.summary', { id: row.entity.Id });
                //    $state.go('app.ipbillingtab.summary');
            }
            else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            }
        }
        vm.gridConfig = {
            columnDefs: [
                { field: "Patient.MRN", displayName: $translate.instant('billing.findbill-list.mrn.lbl') },
                { field: "BillNumber", displayName: $translate.instant('billing.findbill-list.billnumber.lbl') },
                {
                    field: "EncountertypeId", displayName: $translate.instant('billing.findbill-list.ipnumber.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{"OP"}}</div>'
                },
{
                    field: "PatientName", displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.FirstName}}" tooltip-placement="left" >'
                    + "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>"
                    + "</a></div>"
                },

                {
                    field: "Date", displayName: $translate.instant('billing.findbill-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
                },


                {
                    field: "ConsDoctor", displayName: $translate.instant('billing.findbill-list.consdoctor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{row.entity.User.Title.Description}} {{row.entity.User.FirstName}} {{row.entity.User.LastName}}</div>'
                },
                { field: "PatientBillStatus.Description", displayName: $translate.instant('billing.findbill-list.status.lbl') },
                { field: "OutStandingAmount", displayName: $translate.instant('billing.findbill-list.dueamount.lbl') },
                { field: "PaidAmount", displayName: $translate.instant('billing.findbill-list.paidamount.lbl') },
                { field: "BillAmount", displayName: $translate.instant('billing.findbill-list.billamount.lbl') }
            ],
                        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
                                    enableFullRowSelection : true


        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.confirmCallback({ BillId: row.entity.Id ,PatientId:row.entity.PatientId});
            });
        };
        //Grid selection related code ends

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();

        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "BillPriority" },
                { "Key": "BillType" },
                { "Key": "Patient" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "PatientBillStatus" },
                { "Key": "ServiceCategory" },
                { "Key": "Facility" },
                { "Key": "GuarantorType" },
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

    claimsummaryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();