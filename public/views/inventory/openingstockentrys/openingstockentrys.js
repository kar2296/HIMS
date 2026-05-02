(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpeningStockEntrysListController', OpeningStockEntrysListController);

    function OpeningStockEntrysListController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            // StockEntryDate: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
            StockEntryTypeId: 1,
            StoreMasterId: 0,
            VendorMasterId: -1,
            EntryNumber: '',
            StockEntryStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.advancedfilter = {
            From: '',
            To: '',
            StoreMasterId: 0,
            ToStoreMasterId: -1,
            CreatedUserId: -1,
            ApprovedUserId: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };


        $scope.addNew = function () {
            $state.go('app.openingstockentry', { id: 0, grnid: $scope.currentcontext.stockentryid });
        };

        $scope.findOpeningStockEntry = function () {
            $state.go('app.openingstockentry.find', { findid: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/stockentry/DeleteStockEntry',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.openingstockentry', { id: entity.Id, stockentryid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'view') {
                $state.go('app.openingstockentry', { id: entity.Id });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                { field: "StockEntryNumber", displayName: $translate.instant('inventory.openingstockentrys.ref#.lbl') },
                {
                    field: "StockEntryDate",
                    displayName: $translate.instant('inventory.openingstockentrys.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StockEntryDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.StockEntryDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.openingstockentrys.storename.lbl') },
                // { field: "StockEntryType.Description", displayName: $translate.instant('inventory.openingstockentrys.stockentrytype.lbl') },

                {
                    field: "EnterBy",
                    displayName: $translate.instant('inventory.openingstockentrys.enteredby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CreatedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "ApprovedUser",
                    displayName: $translate.instant('inventory.openingstockentrys.approvedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CreatedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "TotalNetAmount",
                    displayName: $translate.instant('inventory.purchaseorders.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "StockEntryStatus.Description", displayName: $translate.instant('inventory.openingstockentrys.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('inventory.openingstockentrys.action.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.StockEntryStatusId==2||entity.StockEntryStatusId==3||entity.StockEntryStatusId==4||entity.StockEntryStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.StockEntryStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.StockEntryStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        function initDynamicForm() {
            $scope.advancedfilterDefault = {
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.openingstockentry.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.openingstockentry.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.openingstockentry.fromstore.lbl', model: 'StoreMasterId', options: $scope.lookup.UserStores, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.openingstockentry.tostore.lbl', model: 'ToStoreMasterId', options: $scope.lookup.ToStore, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'inventory.openingstockentry.createdby.lbl', model: 'CreatedUserId', options: $scope.lookup.CreatedUser, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'inventory.openingstockentry.approvedby.lbl', model: 'ApprovedUserId', options: $scope.lookup.ApprovedUser, position: { r: 2, c: 1 } },

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
                item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StockEntryNumber },
                    // { Key: 2, Value: $scope.currentfilter.StockEntryTypeId },
                    { Key: 3, Value: $scope.currentfilter.FacilityId },
                    { Key: 4, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 5, Value: $scope.currentfilter.StockEntryStatusId },
                    { Key: 6, Value: [FromDate, ToDate] },
                    // { Key: 7, Value: From },
                    // { Key: 8, Value: To },
                    // {
                    //     Key: 5,
                    //     Value: utl.Formatter.getFilterDate(FromDate)
                    // },
                    // {
                    //     Key: 6,
                    //     Value: utl.Formatter.getFilterDate(ToDate)
                    // },
                    // { Key: 7, Value: FromReq },
                    // { Key: 8, Value: ToReq },
                    { Key: 9, Value: $scope.currentfilter.ApprovedBy },
                    // { Key: 10, Value: $scope.currentfilter.AuthorizedBy }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockentry/GetStockEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        function setDefaults() {
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.StockEntryStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.StockEntryStatus, 'Authorized');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.StockEntryStatus, 'Completed');
            $scope.currentfilter.StockEntryStatusId = ApprovedId + "," + AuthorizedId + "," + CompletedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    if (key == 'UserStores' && $scope.advancedfilter.StoreMasterId === 0) {
                        $scope.advancedfilter.StoreMasterId = value[0].Id;
                        if (key == 'ApprovedUser' && $scope.advancedfilter.ApprovedUserId === 0) {
                            $scope.advancedfilter.ApprovedUserId = value[0].Id;
                        }
                    }
                }
            });
            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "StockEntryStatus", Default: false },
                { "Key": "Facility" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
            ]
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

    OpeningStockEntrysListController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();