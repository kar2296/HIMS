(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bankstatementListController', bankstatementListController);

    function bankstatementListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.currentfilter = {
            UserId: utl.Session.getCurrentUserId(),
            BankStatementId: -1,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            DocumentNumber: '',
            BillingCounterStatusId: 3,
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
            userbillingcounterid: 1
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
            var StartDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 00:00:00') || null;
            var EndDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 19, Value: $scope.currentfilter.UserId },
                    { Key: 2, Value: $scope.currentfilter.BankStatementId },
                    //{ Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.DocumentNumber },
                    { Key: 13, Value: $scope.currentfilter.FromOpen },
                    { Key: 14, Value: $scope.currentfilter.ToOpen },
                    { Key: 15, Value: $scope.currentfilter.FromClosed },
                    { Key: 16, Value: $scope.currentfilter.ToClosed },
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
                action: 'billing/bankstatements/GetBankStatementWithoutDenominations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.bankstatementform', { id: 0, userbillingcounterid: $scope.currentcontext.userbillingcounterid });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            let inputData = {
                Data: {
                    Header: {
                        Id: deleteId,
                        BillingCounterStatusId: 6,
                    }
                }
            };
            var options = {
                action: 'billing/bankstatements/UpdateBankStatements',
                data: inputData,
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DocumentNumber);
            } else if (actionType == 'view') {
                $state.go('app.bankstatementform', { id: entity.Id, userbillingcounterid: entity.Id });
            }
        };
        var rowtpl = '<div ng-class="{\'status\':entity.BankStatementStautsId == 3 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [
                { field: "DocumentNumber", displayName: $translate.instant('billing.bankstatementform.documentnumber.lbl') },
                {
                    field: "DocumentDate",
                    displayName: $translate.instant('billing.bankstatementform.docdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DocumentDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.DocumentDate | date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "FromDate",
                    displayName: $translate.instant('billing.bankstatementform.fromdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OpeningDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.OpeningDate | date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "ToDate",
                    displayName: $translate.instant('billing.bankstatementform.todate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ClosingDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.ClosingDate | date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "ClosingCash",
                    displayName: $translate.instant('billing.bankstatementform.cashamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.ClosingCash | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "DenominationsNetTotal",
                    displayName: $translate.instant('billing.bankstatementform.cashinhand.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.DenominationsNetTotal | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "BillingCounterStatus.Description", displayName: $translate.instant('billing.bankstatementform.documentstatus.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',entity)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',entity)" ><i class="btn btn-success btn-rounded fa fa-trash" aria-hidden="true"></i></span>\
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
                {
                    "Key": "BillingCounterStatus",
                    Request: {
                        Params: [
                            { Key: 3, Value: 'BillingCounterStatus'},
                            { Key: 7, Value: [3, 4, 5] }
                        ]
                    }
                },
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

    bankstatementListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();