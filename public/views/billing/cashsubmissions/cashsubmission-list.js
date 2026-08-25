(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CashSubmissionListController', CashSubmissionListController);

    function CashSubmissionListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.currentfilter = {
            UserId: -1,
            BillingCounterId: -1,
            DepartmentId: -1,
            DocumentNumber: '',
            BillingCounterStatusId: 3,
            DocumentDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.advancedfilter = {
            OpeningDate: null,
            ClosingDate: null
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1,
            userbillingcounterid: -1
        };


        function initDynamicForm() {
            $scope.advancedfilterDefault = {};
            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'billing.cashsubmissions.openingdate.lbl', model: 'OpeningDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.cashsubmissions.closingdate.lbl', model: 'ClosingDate', position: { r: 0, c: 1 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-success' },
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

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.OpeningBalance = isNaN(parseFloat(item.OpeningBalance)) ? (0) : parseFloat(item.OpeningBalance);
                item.ClosingBalance = isNaN(parseFloat(item.ClosingBalance)) ? (0) : parseFloat(item.ClosingBalance);

                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FromReq = $filter('date')($scope.advancedfilter.OpeningDateTime, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.ClosingDateTime, 'yyyy-MM-dd 23:59:59') || null;

            var StartDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 00:00:00') || null;
            var EndDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.UserId },
                    { Key: 2, Value: $scope.currentfilter.BillingCounterId },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.DocumentNumber },
                    { Key: 10, Value: $scope.currentfilter.BillingCounterStatusId },
                    { Key: 17, Value: StartDate },
                    { Key: 18, Value: EndDate },
                    { Key: 17, Value: FromReq },
                    { Key: 18, Value: ToReq }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/userbillingcounters/GetBillingCounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.cashsubmission-form', { id: entity.Id, userbillingcounterid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DocumentNumber);
            } else if (actionType == 'view') {
                $state.go('app.cashsubmission-form', { id: entity.Id, userbillingcounterid: entity.Id });
            }
        };
        var rowtpl = '<div ng-class="{\'status\':entity.BillingCounterStatusId == 4 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                field: "DocumentDate",
                displayName: $translate.instant('billing.billingcounters.documentdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DocumentDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.DocumentDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "DocumentNumber", displayName: $translate.instant('billing.billingcounters.documentnumber.lbl') },
            { field: "Department.DepartmentName", displayName: $translate.instant('billing.billingcounters.departments.lbl') },
            { field: "BillingCounter.Description", displayName: $translate.instant('billing.billingcounters.billingcounters.lbl') },
            {
                field: "CreatedUser",
                displayName: $translate.instant('billing.billingcounters.username.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='entity.CreatedUser'>{{entity.CreatedUser.Title.Description }}</span>" +
                    "<span  ng-if='entity.CreatedUser'>&nbsp;</span>" +
                    "<span  ng-if='entity.CreatedUser'>{{entity.CreatedUser.FirstName }}</span>" +
                    "<span  ng-if='entity.CreatedUser'>&nbsp;</span>" +
                    "<span  ng-if='entity.CreatedUser'>{{entity.CreatedUser.LastName}}</span>" +
                    "</div>"
            },
            {
                field: "OpeningBalance",
                displayName: $translate.instant('billing.billingcounters.openingbalance.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.OpeningBalance | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "ClosingBalance",
                displayName: $translate.instant('billing.billingcounters.closingbalance.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.ClosingBalance | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            { field: "BillingCounterStatus.Description", displayName: $translate.instant('billing.billingcounters.documentstatus.lbl') },
            {
                field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
               </div>',
                handleEvent: $scope.handleEvents,
                actions: [{ actiontype: 'edit', display: 'common.editaction.lbl' }]
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.UserTypeId = selectedItem.UserTypeId;
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentfilter.FacilityId }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'BillingCounterStatus') {
                    $scope.CounterStatus = value || [];
                    $scope.lookup["BillingCounterStatus"] = [];
                    for (var idx in $scope.CounterStatus) {
                        var statusitem = $scope.CounterStatus[idx];
                        if (statusitem.Id == 3) {
                            $scope.lookup["BillingCounterStatus"].push(statusitem);
                        } else if (statusitem.Id == 4) {
                            $scope.lookup["BillingCounterStatus"].push(statusitem);
                        } else if (statusitem.Id == 5) {
                            $scope.lookup["BillingCounterStatus"].push(statusitem);
                        }
                    }
                }
            });
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "BillingCounter" },
                { "Key": "BillingCounterStatus", Default: false },
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                submissions: vm.gridConfig.data,
                pager: vm.gridConfig.pagerObj
            };
            $scope.$applyAsync();
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, data, options, hasError) {
            _origGetListCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            if (actionName === 'billingCounterChange') {
                $scope.currentfilter.BillingCounterId = payload.value;
                $scope.getList();
            } else if (actionName === 'documentNumberChange') {
                $scope.currentfilter.DocumentNumber = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'search') {
                $scope.getList();
            } else if (actionName === 'documentDateChange') {
                $scope.currentfilter.DocumentDate = payload.value ? new Date(payload.value) : null;
                $scope.getList();
            } else if (actionName === 'departmentChange') {
                $scope.currentfilter.DepartmentId = payload.value;
                $scope.getList();
            } else if (actionName === 'statusChange') {
                $scope.currentfilter.BillingCounterStatusId = payload.value;
                $scope.getList();
            } else if (actionName === 'openAdvancedFilter') {
                $scope.openAdvancedFilter();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload.entity);
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload.page;
                $scope.getList();
            }
        };

        $scope.initLookup();
    }

    CashSubmissionListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();