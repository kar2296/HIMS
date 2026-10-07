(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cashcounterlistController', cashcounterlistController);

    function cashcounterlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.currentfilter = {
            UserId: utl.Session.getCurrentUserId(),
            BillingCounterId: -1,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            DocumentNumber: '',
            BillingCounterStatusId: 1,
            DocumentDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.advancedfilter = {
            OpeningDateTime: null,
            ClosingDateTime: null
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
                    { type: 'date', translate: 'billing.billingcounters.openingdate.lbl', model: 'FromOpen', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.billingcounters.closingdate.lbl', model: 'ClosingDate', position: { r: 0, c: 1 } }
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
            var FromOpen = $filter('date')($scope.advancedfilter.OpeningDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToOpen = $filter('date')($scope.advancedfilter.OpeningDate, 'yyyy-MM-dd 23:59:59') || null;

            var FromClosed = $filter('date')($scope.advancedfilter.ClosingDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToClosed = $filter('date')($scope.advancedfilter.ClosingDate, 'yyyy-MM-dd 23:59:59') || null;

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
                    { Key: 13, Value: $scope.currentfilter.FromOpen },
                    { Key: 14, Value: $scope.currentfilter.ToOpen },
                    { Key: 15, Value: $scope.currentfilter.FromClosed },
                    { Key: 16, Value: $scope.currentfilter.ToClosed },
                    { Key: 11, Value: StartDate },
                    { Key: 12, Value: EndDate },
                    { Key: 10, Value: $scope.currentfilter.BillingCounterStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.DocumentDate) {
                StartDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 00:00:00');
                EndDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push({ Key: 7, Value: [StartDate, EndDate] });

            }
            var options = {
                action: 'billing/userbillingcounters/GetUserBillingCounterWithoutDenominations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.cashcounter', { id: 0, userbillingcounterid: $scope.currentcontext.userbillingcounterid });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/purchaseorder/DeletePurchaseOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.cashcounter', { id: entity.Id, userbillingcounterid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DocumentNumber);
            } else if (actionType == 'view') {
                $state.go('app.cashcounter', { id: entity.Id, userbillingcounterid: entity.Id });
            }
        };
        var rowtpl = '<div ng-class="{\'status\':entity.BillingCounterStatusId == 3 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [
                { field: "DocumentNumber", displayName: $translate.instant('billing.billingcounters.documentnumber.lbl') },
                //{ field: "Department.DepartmentName", displayName: $translate.instant('billing.billingcounters.departments.lbl') },
                { field: "BillingCounter.Description", displayName: $translate.instant('billing.billingcounters.billingcounters.lbl') },
                //{ field: "User.FirstName", displayName: $translate.instant('billing.billingcounters.username.lbl') },
                {
                    field: "OpeningDate",
                    displayName: $translate.instant('billing.billingcounters.openingdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OpeningDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.OpeningDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "OpeningBalance",
                    displayName: $translate.instant('billing.billingcounters.openingbalance.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.OpeningBalance | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "ClosingDate",
                    displayName: $translate.instant('billing.billingcounters.closingdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ClosingDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.ClosingDate| date: 'HH:mm'}}</span>" + "</div>"
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
            });
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "BillingCounter" },
                { "Key": "BillingCounterStatus" },
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

        // ------------------------------------------------------------------
        // React view bridge (CashCounterListScreen). New code only: no function above was
        // changed. The view model is rebuilt from $scope on every digest; user input is routed
        // to the same functions the AngularJS template called (getList, openAdvancedFilter,
        // addNew, handleEvents).
        // ------------------------------------------------------------------
        function cclText(value) {
            return value === null || value === undefined ? '' : String(value);
        }

        function cclId(value) {
            return typeof value === 'number' && isFinite(value) ? value : null;
        }

        // Same output as the grid cell templates: "dd-MMM-yyyy HH:mm".
        function cclDateTime(value) {
            return value ? $filter('date')(value, 'dd-MMM-yyyy') + ' ' + $filter('date')(value, 'HH:mm') : '';
        }

        function cclColumn(field) {
            var col = vm.gridConfig.columnDefs.filter(function (c) { return c.field === field; })[0];
            return col ? col.displayName : '';
        }

        $scope.buildCashCounterListReactProps = function () {
            var f = $scope.currentfilter;
            return {
                labels: {
                    title: $translate.instant('billing.billingcounters.pagetitle.lbl'),
                    filterTooltip: $translate.instant('clinicalmaster.serviceitem-list.filter-tooltip.lbl'),
                    addTooltip: $translate.instant('billing.billingcounters.addnew-tooltip.lbl'),
                    counters: $translate.instant('billing.billingcounters.billingcounters.lbl'),
                    status: $translate.instant('billing.billingcounters.documentstatus.lbl'),
                    documentDate: $translate.instant('billing.billingcounters.documentdate.lbl'),
                    documentNumber: $translate.instant('billing.billingcounters.documentnumber.lbl'),
                    edit: $translate.instant('common.editaction.lbl'),
                    colDocumentNumber: cclColumn('DocumentNumber'),
                    colCounter: cclColumn('BillingCounter.Description'),
                    colOpeningDate: cclColumn('OpeningDate'),
                    colOpeningBalance: cclColumn('OpeningBalance'),
                    colClosingDate: cclColumn('ClosingDate'),
                    colClosingBalance: cclColumn('ClosingBalance'),
                    colStatus: cclColumn('BillingCounterStatus.Description'),
                    colActions: cclColumn('Id')
                },
                filter: {
                    billingCounterId: cclId(f.BillingCounterId),
                    statusId: cclId(f.BillingCounterStatusId),
                    documentDate: f.DocumentDate ? ($filter('date')(f.DocumentDate, 'yyyy-MM-dd') || '') : '',
                    documentNumber: cclText(f.DocumentNumber)
                },
                lookup: {
                    BillingCounter: $scope.lookup.BillingCounter || [],
                    BillingCounterStatus: $scope.lookup.BillingCounterStatus || []
                },
                rows: (vm.gridConfig.data || []).map(function (e, index) {
                    return {
                        index: index,
                        documentNumber: cclText(e.DocumentNumber),
                        counter: cclText(e.BillingCounter && e.BillingCounter.Description),
                        openingDate: cclDateTime(e.OpeningDate),
                        openingBalance: $filter('displaycurrency')(e.OpeningBalance),
                        closingDate: cclDateTime(e.ClosingDate),
                        closingBalance: $filter('displaycurrency')(e.ClosingBalance),
                        status: cclText(e.BillingCounterStatus && e.BillingCounterStatus.Description)
                    };
                }),
                pager: {
                    totalItems: vm.gridConfig.pagerObj.totalItems || 0,
                    currentPage: vm.gridConfig.pagerObj.currentPage || 1,
                    pageSize: vm.gridConfig.pagerObj.pageSize || 25
                }
            };
        };

        $scope.reactProps = $scope.buildCashCounterListReactProps();
        $scope.$watch(function () {
            return $scope.buildCashCounterListReactProps();
        }, function (props) {
            $scope.reactProps = props;
        }, true);

        // "yyyy-MM-dd" from the date input -> local-midnight Date (what the date picker stored);
        // empty -> null, which leaves the date out of the request as before.
        function cclParseDate(value) {
            var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
            return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
        }

        $scope.handleReactAction = function (action, payload) {
            payload = payload || {};
            $scope.$evalAsync(function () {
                switch (action) {
                    case 'setCounter':
                        $scope.currentfilter.BillingCounterId = payload.value;
                        $scope.getList();
                        break;
                    case 'setStatus':
                        $scope.currentfilter.BillingCounterStatusId = payload.value;
                        $scope.getList();
                        break;
                    case 'setDocumentDate':
                        $scope.currentfilter.DocumentDate = cclParseDate(payload.value);
                        $scope.getList();
                        break;
                    case 'setDocumentNumber':
                        $scope.currentfilter.DocumentNumber = payload.value;
                        break;
                    case 'search':
                        $scope.getList();
                        break;
                    case 'page':
                        vm.gridConfig.pagerObj.currentPage = payload.page;
                        $scope.getList();
                        break;
                    case 'openAdvancedFilter':
                        $scope.openAdvancedFilter();
                        break;
                    case 'addNew':
                        $scope.addNew();
                        break;
                    case 'edit':
                        var entity = vm.gridConfig.data[payload.index];
                        if (entity) {
                            $scope.handleEvents('edit', entity);
                        }
                        break;
                }
            });
        };

        // ------------------------------------------------------------------
        // Show only the answer to the latest list request (new code; getList and
        // getListCallback above are unchanged). Changing filters quickly sends several
        // requests; an older answer that arrived last used to replace the newer one, so the
        // table showed results for a filter that was no longer selected. Each request now
        // carries a number and answers to older requests are ignored.
        // ------------------------------------------------------------------
        var latestListRequest = 0;
        var latestOnlyGetList = $scope.getList;
        $scope.getList = function () {
            var requestNo = ++latestListRequest;
            var originalDoAction = utl.Http.doAction;
            utl.Http.doAction = function (options) {
                if (options) {
                    options.listRequestNo = requestNo;
                }
                return originalDoAction.apply(this, arguments);
            };
            try {
                return latestOnlyGetList.apply(this, arguments);
            } finally {
                utl.Http.doAction = originalDoAction;
            }
        };
        var latestOnlyGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, data, options, hasError) {
            if (options && options.listRequestNo !== undefined && options.listRequestNo !== latestListRequest) {
                return; // answer to an older request
            }
            return latestOnlyGetListCallback.apply(this, arguments);
        };

        $scope.initLookup();
    }

    cashcounterlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();