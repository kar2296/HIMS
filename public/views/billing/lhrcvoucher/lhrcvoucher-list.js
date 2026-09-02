(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LHRCVoucherListController', LHRCVoucherListController);

    function LHRCVoucherListController($scope, $stateParams, $state, $filter, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            VoucherDate: utl.Formatter.getCurrentDate(),
            VoucherStatusId: 2
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.VoucherDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.VoucherDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.LHRCVoucherNo },
                    { Key: 3, Value: FrmDate },
                    { Key: 4, Value: ToDate },
                    { Key: 5, Value: $scope.currentfilter.CreatedBy },
                    { Key: 6, Value: $scope.currentfilter.VoucherStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/LHRCVoucher/GetLHRCVouchers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            utl.Modal.open('app.lhrcvoucherform', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
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
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.currentfilter.UserName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
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

        //Grid Actions
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/LHRCVoucher/DeleteLHRCVoucher',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit' || actionType == 'view') {
                utl.Modal.open('app.lhrcvoucherform', {
                    params: { id: row.entity.Id },
                    confirmCallback: $scope.getList
                });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('billing.lhrcvoucher.snum.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{rowRenderIndex+ 1}} </span> </div>"
                },
                {
                    field: "Date", displayName: $translate.instant('billing.lhrcvoucher.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.VoucherDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.VoucherDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "LHRCVoucherNo", displayName: $translate.instant('billing.lhrcvoucher.vouchernnum.lbl'),
                },
                {
                    field: "VoucherAmount", displayName: $translate.instant('billing.lhrcvoucher.amount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.VoucherAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "CreditNoteAmount", displayName: $translate.instant('billing.lhrcvoucher.username.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{row.entity.CreatedUser.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.CreatedUser.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.CreatedUser.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                { field: "VoucherType.Description", displayName: $translate.instant('billing.lhrcvoucher.type.lbl') },
                { field: "VoucherStatus.Description", displayName: $translate.instant('billing.lhrcvoucher.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.VoucherStatusId == 2 || row.entity.VoucherStatusId == 3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"   ng-show="row.entity.VoucherStatusId == 1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-show="row.entity.VoucherStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshStatusFilterProps();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "User" },
                { "Key": "VoucherType" },
                { "Key": "VoucherStatus" },
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
        // dispatches UI actions from BillingLhrcVoucherListScreen (header /
        // Add New) and BillingLhrcVoucherGridScreen (grid + pagination + row
        // actions) back onto the real, unchanged $scope/vm functions and
        // fields. The entire real filter row (Voucher No, Voucher Date,
        // "Created By" <autosearch>, Status) is left as native, untouched
        // AngularJS markup in lhrcvoucher-list.html and is NOT covered by this
        // bridge -- splitting one visual filter row's fields across React and
        // native AngularJS (in particular the generic, not-yet-migrated
        // <autosearch> component) would be awkward/fragile -- see the
        // disclosure comment in BillingLhrcVoucherListScreen.tsx. The native
        // filter fields' own existing ng-change/on-enter bindings already call
        // $scope.getList() directly and need no bridge dispatch.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data,
                pagerObj: vm.gridConfig.pagerObj
            };
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    break;
                case 'view':
                case 'edit':
                case 'delete':
                    $scope.handleEvents(actionName, { entity: payload });
                    break;
                default:
                    if (typeof $scope[actionName] === 'function') {
                        $scope[actionName]();
                    }
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };


        // Status filter: the last remaining native <ui-select> on this screen,
        // now rendered through the shared BridgeLookupSelectScreen. It has no
        // `required` (and this screen has no item_form and never calls
        // utl.Validator.validate), so NO validator shim is added. It has no
        // ng-disabled and no on-select; its only binding was
        // ng-change="getList()", so the dispatch writes the same currentfilter
        // field its ng-model wrote and then calls the same unchanged
        // $scope.getList(). The rest of the filter row (Voucher No, Voucher
        // Date, the <autosearch> "Created By") stays native, exactly as the
        // disclosure above describes.
        $scope.handleStatusFilterAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.currentfilter.VoucherStatusId = payload.id;
                $scope.getList();
                $scope.refreshStatusFilterProps();
                $scope.$applyAsync();
            }
        };

        $scope.refreshStatusFilterProps = function () {
            $scope.reactPropsStatusContainer = {
                reactProps: {
                    options: ($scope.lookup && $scope.lookup.VoucherStatus) || [],
                    value: $scope.currentfilter.VoucherStatusId
                },
                onAction: $scope.handleStatusFilterAction
            };
        };

        $scope.refreshStatusFilterProps();

        $scope.initLookup();
    }

    LHRCVoucherListController.$inject = ['$scope', '$stateParams', '$state', '$filter', '$translate', 'utl'];

})();