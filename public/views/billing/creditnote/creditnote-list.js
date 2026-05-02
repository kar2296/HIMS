(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('creditnoteListController', creditnoteListController);

    function creditnoteListController($scope, $stateParams, $state, $filter, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CreditNoteTypeId: -1,
            CreditNoteStatusId: 2
        };

        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                DepartmentId: -1,
                DoctorId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1,
                // FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'billing.creditnote.filter_fromdate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.creditnote.filter_todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'billing.creditnote.filter_cnamount.lbl', model: 'CreditNoteAmount', position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'billing.creditnote.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'billing.creditnote.filter_guarantortype.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'billing.creditnote.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 2, c: 1 } },
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
        }
        //Dynamic form  ends
        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }
        $scope.custom_sort = function (a, b) {
            return new Date(b.CreditNoteDateTime).getTime() - new Date(a.CreditNoteDateTime).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // var FrmDate = $filter('date')($scope.advancedfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            // var ToDate = $filter('date')($scope.advancedfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            if ($scope.advancedfilter.FromDate || $scope.advancedfilter.ToDate) {
                $scope.currentfilter.CreditNoteDateTime = '';
            }

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.CreditNoteDateTime },
                    { Key: 2, Value: $scope.currentfilter.name },
                    { Key: 4, Value: $scope.currentfilter.CreditNoteIdentifier },
                    { Key: 5, Value: $scope.currentfilter.CreditNoteStatusId },
                    { Key: 3, Value: $scope.currentfilter.CreditNoteTypeId },
                    { Key: 7, Value: $scope.advancedfilter.GuarantorId },
                    { Key: 8, Value: $scope.advancedfilter.GuarantorTypeId },
                    { Key: 10, Value: $scope.advancedfilter.DoctorId },
                    { Key: 9, Value: $scope.advancedfilter.CreditNoteAmount },
                    { Key: 11, Value: $scope.advancedfilter.FromDate },
                    { Key: 12, Value: $scope.advancedfilter.ToDate },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
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
        $scope.addNew = function () { $state.go('app.creditnote', { id: 0 }); }
        //Grid Actions
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientCreditNote/DeletePatientCreditNote',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.creditnote', { id: row.entity.Id })
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
            else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "CreditNoteIdentifier", displayName: $translate.instant('billing.creditnote.creditnote.lbl') },
                {
                    field: "PatientName", displayName: $translate.instant('billing.creditnote.name.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >'
                    + "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >"
                    + "{{row.entity.Patient.MRN}}</span>"
                    + "<span >/</span>"
                    + "{{row.entity.Patient.Title.Description}}</span>"
                    + "<span >&nbsp;{{row.entity.Patient.FirstName}}&nbsp;</span>"
                    + "<span >{{row.entity.Patient.LastName}}&nbsp;</span>"
                    + "<span >/</span>"
                    + "<span >{{row.entity.Patient.Age}}&nbsp;</span>"
                    + "<span >{{row.entity.Patient.Gender.Description}}</span>"
                    + "</a></div>"
                },
                {
                    field: "CreditNoteDateTime", displayName: $translate.instant('billing.creditnote.cndate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreditNoteDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.CreditNoteDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "CreditNoteType.Description", displayName: $translate.instant('billing.creditnote.cntype.lbl') },
                {
                    field: "CreditNoteAmount", displayName: $translate.instant('billing.creditnote.cnamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreditNoteAmount | displaycurrency}}</span>" + "</div>"
                },
                { field: "CreditNoteStatus.Description", displayName: $translate.instant('billing.creditnote.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.CreditNoteStatusId == 2 || row.entity.CreditNoteStatusId == 3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"   ng-show="row.entity.CreditNoteStatusId == 1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-show="row.entity.CreditNoteStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "CreditNoteType" },
                { "Key": "CreditNoteStatus" },
                { "Key": "ActiveStatus" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "GuarantorType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
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

    creditnoteListController.$inject = ['$scope', '$stateParams', '$state', '$filter', '$translate', 'utl'];

})();