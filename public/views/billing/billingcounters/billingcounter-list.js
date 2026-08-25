(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BillingCounterListController', BillingCounterListController);

    function BillingCounterListController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.billingcounter-form', { id: 0, userbillingcounterid: $scope.currentcontext.userbillingcounterid });
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
                $state.go('app.billingcounter-form', { id: entity.Id, userbillingcounterid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DocumentNumber);
            } else if (actionType == 'view') {
                $state.go('app.billingcounter-form', { id: entity.Id, userbillingcounterid: entity.Id });
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
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="viewoption grid-action" ng-click="grid.appScope.handleEvents(\'view\',entity)" ng-show="entity.BillingCounterStatusId == 3 || entity.BillingCounterStatusId == 4 || entity.BillingCounterStatusId == 5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',entity)" ng-show="entity.BillingCounterStatusId == 1 || entity.BillingCounterStatusId == 2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                </div>',
                    actions: []
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                counters: vm.gridConfig.data,
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
            } else if (actionName === 'statusChange') {
                $scope.currentfilter.BillingCounterStatusId = payload.value;
                $scope.getList();
            } else if (actionName === 'documentDateChange') {
                $scope.currentfilter.DocumentDate = payload.value ? new Date(payload.value) : null;
                $scope.getList();
            } else if (actionName === 'documentNumberChange') {
                $scope.currentfilter.DocumentNumber = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'search') {
                $scope.getList();
            } else if (actionName === 'openAdvancedFilter') {
                $scope.openAdvancedFilter();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'view') {
                $scope.handleEvents('view', payload.entity);
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload.entity);
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload.page;
                $scope.getList();
            }
        };

        $scope.initLookup();
    }

    BillingCounterListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();