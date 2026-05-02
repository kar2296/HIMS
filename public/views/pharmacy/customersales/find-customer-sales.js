(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findcustomersalesListController', findcustomersalesListController);

    function findcustomersalesListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.customermasterid = modalConfig.params.customermasterid;
        $scope.currentcontext.storemasterid = modalConfig.params.storemasterid;

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                BillPriorityId: -1,
                BillTypeId: -1,
                CustomerBillStatusId: 3,
                BillNumber: null,
                FacilityId: -1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'date', translate: 'billing.findcustomerbill-list.date.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.findcustomerbill-list.todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'billing.findcustomerbill-list.billnumber.lbl', model: 'BillNumber', position: { r: 0, c: 2 } },
                    { type: 'select', translate: 'billing.findcustomerbill-list.customerbillstatus.lbl', model: 'CustomerBillStatusId', options: $scope.lookup.CustomerBillStatus, position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'billing.findcustomerbill-list.customername.lbl', model: 'CustomerName', position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'billing.findcustomerbill-list.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 1, c: 2 } },

                    { type: '', translate: '', model: '', position: { r: 2, c: 1 } },
                    { type: '', translate: '', model: '', position: { r: 2, c: 2 } }
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
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#BillNumber').focus();
        };
        /* Customer Sales Find Bills - ShortCut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 13) { // Enter Key
                $scope.actionClick('apply');
            }
        }
        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Customer Sales Find Bills - ShortCut Keys - End */
        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 1, Value: [FrmDate, ToDate] },
                    { Key: 2, Value: $scope.modeldata.BillNumber },
                    { Key: 4, Value: $scope.modeldata.CustomerBillStatusId },
                    { Key: 7, Value: $scope.modeldata.FacilityId },
                    { Key: 15, Value: $scope.currentcontext.storemasterid },
                    { Key: 19, Value: $scope.currentcontext.customermasterid },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'billing/customerbills/GetCustomerBills',
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

        $scope.handleEvents = function (actionType, entity) {
            // if (actionType == 'edit') {
            //     $state.go('app.ipbillingtab.summary', { id: entity.Id });
            // } 
            if (actionType == 'select') {
                $scope.confirmCallback({
                    BillId: entity.Id,
                    IsCashToCreditBill: entity.IsCashToCreditBill,
                    PatientId: entity.PatientId,
                    BillStatusId: entity.PatientBillStatusId,
                    StoreId: entity.StoreMasterId
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            }
        };

        vm.gridConfig = {
            columnDefs: [{
                field: "Id",
                displayName: $translate.instant('Select'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="btn-rounded fa fa-check" aria-hidden="true"></i></span>\
                        </div>',
                handleEvent: $scope.handleEvents,
            },
            { field: "BillNumber", displayName: $translate.instant('billing.findcustomerbill-list.billnumber.lbl') },
            {
                field: "BillTypeId",
                displayName: $translate.instant('billing.findcustomerbill-list.billtype.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">{{"Customer"}}</div>'
            },
            {
                field: "CustomerName",
                displayName: $translate.instant('billing.findcustomerbill-list.customername.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.CustomerName}} </div><div class="ui-grid-cell-contents"> {{entity.Customer.Title.Description}} {{entity.Customer.CustomerName}} {{entity.Customer.CustomerName}}</div>'
            },
            {
                field: "Date",
                displayName: $translate.instant('billing.findcustomerbill-list.date.lbl'),
                cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
            },
            { field: "CustomerBillStatus.Description", displayName: $translate.instant('billing.findcustomerbill-list.status.lbl') },
            { field: "NetAmount", displayName: $translate.instant('billing.findcustomerbill-list.billamount.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        // vm.gridConfig.enableRowSelection = true;
        // vm.gridConfig.multiSelect = false;
        // vm.gridConfig.onRegisterApi = function (gridApi) {
        //     $scope.gridApi = gridApi;
        //     gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        //         var returnobj = {};
        //         returnobj.CustomerBillId = entity.Id;
        //         returnobj.CustomerBillStatusId = entity.CustomerBillStatusId;

        //         $scope.confirmCallback(returnobj);
        //     });
        // };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "BillPriority" },
                { "Key": "BillType" },
                { "Key": "CustomerBillStatus" },
                { "Key": "Facility" }
            ];

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

    findcustomersalesListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();