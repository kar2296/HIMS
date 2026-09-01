(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('refundListController', refundListController);

    function refundListController($scope, $filter, $stateParams, $state, $translate, utl) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.Items = [

        ];
        $scope.currentfilter = {
            RefundDateTime: utl.Formatter.getCurrentDate()

        };
        $scope.currentcontext = {

        };
        $scope.currentfilter = {
            RefundStatusId: 1,
            namemrn: '',
        };
        $scope.custom_sort = function (a, b) {
            return new Date(b.RefundDateTime).getTime() - new Date(a.RefundDateTime).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            // forEach(data.Data, function (value, index) {
            //     //     value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
            // });
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            $scope.refreshGridProps();
            var Amount = 0;
            for (var idx in res.Data) {
                Amount = Amount + res.Data[idx].RefundAmount

            }

            $scope.TotalAmount = Amount;

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
        $scope.refreshGridProps();
        };

        $scope.getList = function () {
            var fromDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Refundidentifier },
                    { Key: 2, Value: $scope.currentfilter.namemrn },
                    //{ Key: 3, Value: [$scope.currentfilter.Fromrefunddate, $scope.currentfilter.Torefunddate] },
                    //{ Key: 3, Value: $scope.currentfilter.RefundDateTime },
                    { Key: 4, Value: $scope.currentfilter.RefundTypeId },
                    { Key: 5, Value: $scope.currentfilter.RefundStatusId },
                    { Key: 12, Value: fromDate },
                    { Key: 13, Value: toDate },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
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

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.refund-form', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientRefund/DeletePatientRefund',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.refund-form', { id: row.entity.Id });
            } else if (actionType == 'view') {
                $state.go('app.refund-form', { id: row.entity.Id });
            } else if (actionType == 'delete') {
                if (row.entity.PaymentStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.paymentconsumeddelete.lbl'));
                } else if (row.entity.RefundStatusId == 1 || row.entity.RefundStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.opbilling-form.paymentdraft.lbl'));
                } else {
                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.SpecialityName);
                }
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "RefundIdentifier", displayName: $translate.instant('billing.refund-list.refundno.lbl') },

                {
                    field: "RefundDateTime",
                    displayName: $translate.instant('billing.refund-list.refunddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.RefundDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span class='pl-3'>{{row.entity.RefundDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "Patient",
                    displayName: $translate.instant('billing.receipt-list.filter_patient.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a href>{{ row.entity.Patient.Title && row.entity.Patient.Title.Description}}</a>' + '<a href>.</a>' +
                        '<a href>{{row.entity.Patient.FirstName}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.MRN}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.Age}}</a>' + '<a href>/</a>' + '<a href>{{row.entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                //{ field: "Description", displayName: $translate.instant('billing.receipt-list.description.lbl') },
                { field: "RefundType.Description", displayName: $translate.instant('billing.receipt-list.type.lbl') },
                {
                    field: "RefundAmount",
                    displayName: $translate.instant('billing.receipt-list.receiptamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.RefundAmount | displaycurrency}}</span>" + "</div>"
                },
                { field: "PaymentType.Description", displayName: $translate.instant('billing.receipt-list.paymentmode.lbl') },
                { field: "RefundStatus.Description", displayName: $translate.instant('billing.receipt-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                   <a class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"  translate="common.viewaction.lbl" ng-show="row.entity.RefundStatusId == 1 || row.entity.RefundStatusId == 3"></a>\
                                                   <a class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  translate="common.editaction.lbl" ng-show="row.entity.RefundStatusId == 2"></a>\
                                                    <a class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  translate="common.deleteaction.lbl" ng-show="row.entity.RefundStatusId == 2"></a>\
                                                </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                //{ "Key": "Status" },
                { "Key": "RefundType" },
                { "Key": "RefundStatus" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }


        // Grid bridge: replaces the last native <div ui-grid="vm.gridConfig">
        // on this screen with the shared BridgeGridScreen. This is a REAL
        // ui-grid, so its cellTemplates' row.entity / grid.appScope expressions
        // were valid -- this is a straight port, not a repair. The dispatcher
        // hands $scope.handleEvents the SAME { entity: ... } wrapper ui-grid
        // passed, so handleEvents keeps reading row.entity.Id,
        // row.entity.PaymentStatusId and row.entity.RefundStatusId unchanged,
        // and every $state.go / confirmDelete / payment-consumed guard inside
        // it still runs from the controller.
        $scope.handleGridAction = function (actionType, payload) {
            var items = (vm.gridConfig && vm.gridConfig.data) || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (entity === null) { return; }
            if (actionType == 'rowAction') {
                $scope.handleEvents(payload.key, { entity: entity });
            }
        };

        $scope.refreshGridProps = function () {
            var defs = (vm.gridConfig && vm.gridConfig.columnDefs) || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function dt(v, f) { return v ? $filter('date')(v, f) : ''; }
            function cur(v) { return $filter('displaycurrency')(v); }
            function patientLabel(pt) {
                if (!pt) { return ''; }
                var title = pt.Title && pt.Title.Description ? pt.Title.Description + '.' : '';
                return title + (pt.FirstName || '') + '/' + (pt.MRN || '') + '/' + (pt.Age || '') + '/' + (pt.Gender && pt.Gender.Description ? pt.Gender.Description : '');
            }
            var items = (vm.gridConfig && vm.gridConfig.data) || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'refundno', header: hdr(0), sortable: true },
                        { key: 'refunddate', header: hdr(1) },
                        { key: 'patient', header: hdr(2) },
                        { key: 'refundtype', header: hdr(3), sortable: true },
                        { key: 'refundamount', header: hdr(4), align: 'right' },
                        { key: 'paymentmode', header: hdr(5), sortable: true },
                        { key: 'refundstatus', header: hdr(6), sortable: true }
                    ],
                    actionsHeader: hdr(7) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        var acts = [];
                        // ng-show="RefundStatusId == 1 || RefundStatusId == 3"
                        if (entity.RefundStatusId == 1 || entity.RefundStatusId == 3) {
                            acts.push({ key: 'view', label: $translate.instant('common.viewaction.lbl'), variant: 'link' });
                        }
                        // ng-show="RefundStatusId == 2"
                        if (entity.RefundStatusId == 2) {
                            acts.push({ key: 'edit', label: $translate.instant('common.editaction.lbl'), variant: 'link' });
                            acts.push({ key: 'delete', label: $translate.instant('common.deleteaction.lbl'), variant: 'link' });
                        }
                        return {
                            id: entity.Id,
                            actions: acts,
                            cells: {
                                refundno: entity.RefundIdentifier,
                                refunddate: dt(entity.RefundDateTime, 'dd-MMM-yyyy') + ' ' + dt(entity.RefundDateTime, 'HH:mm'),
                                patient: patientLabel(entity.Patient),
                                refundtype: entity.RefundType && entity.RefundType.Description,
                                refundamount: cur(entity.RefundAmount),
                                paymentmode: entity.PaymentType && entity.PaymentType.Description,
                                refundstatus: entity.RefundStatus && entity.RefundStatus.Description
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup || {},
                totalAmount: $scope.TotalAmount || 0
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'addNew':
                    $scope.addNew();
                    break;
                case 'refundTypeChange':
                    $scope.currentfilter.RefundTypeId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'namemrnChange':
                    $scope.currentfilter.namemrn = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'refundDateChange':
                    $scope.currentfilter.RefundDateTime = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'refundStatusChange':
                    $scope.currentfilter.RefundStatusId = payload.value;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'refundIdentifierChange':
                    $scope.currentfilter.Refundidentifier = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'fetch':
                    $scope.getList();
                    break;
            }
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }
    refundListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();