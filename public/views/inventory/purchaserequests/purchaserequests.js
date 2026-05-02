(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchaseRequestsListController', purchaseRequestsListController);

    function purchaseRequestsListController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PrTypeId: 1,
            PrNumber: '',
            PrStatusId: 2,
            isDisabled: false,
            RequestedDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0,
            DepartmentId: -1
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
            FromStoreMasterId: 0,
            ToStoreMasterId: -1,
            ApprovedBy: utl.Session.getCurrentUserId(),
            AuthorizedBy: -1
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.currentcontext.prid = parseInt(utl.Session.getEMRPatientId());

        function initDynamicForm() {
            $scope.advancedfilterDefault = {
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.purchaserequest.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.purchaserequest.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.purchaserequest.fromstore.lbl', model: 'FromStoreMasterId', options: $scope.lookup.UserStores, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.purchaserequest.tostore.lbl', model: 'ToStoreMasterId', options: $scope.lookup.ToStore, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'inventory.purchaserequest.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.User, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'inventory.purchaserequest.authorizedby.lbl', model: 'AuthorizedBy', options: $scope.lookup.AuthorizedUser, position: { r: 2, c: 1 } }
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
            // vm.gridConfig.data = [];
            // for (var idx in data.Data) {
            //     var item = data.Data[idx];
            //     item.TotalNetAmount = isNaN(parseFloat(item.TotalNetAmount)) ? (0) : parseFloat(item.TotalNetAmount);
            //     vm.gridConfig.data.push(item);
            // }
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            if ($scope.advancedfilter.From != '' || $scope.advancedfilter.To != '') {
                $scope.currentfilter.RequestedDate = '';
                var fromDate = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00');
                var toDate = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59');
            } else {
                var fromDate = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 00:00:00');
                var toDate = $filter('date')($scope.currentfilter.RequestedDate, 'yyyy-MM-dd 23:59:59');
            }

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.PrNumber },
                    { Key: 2, Value: $scope.currentfilter.PrTypeId },
                    { Key: 3, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 4, Value: $scope.currentfilter.PrStatusId },
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: [fromDate, toDate] },
                    { Key: 7, Value: $scope.advancedfilter.ToStoreMasterId },
                    { Key: 11, Value: $scope.advancedfilter.ApprovedBy },
                    { Key: 12, Value: $scope.advancedfilter.AuthorizedBy },
                    { Key: 14, Value: $scope.advancedfilter.FromStoreMasterId },
                    { Key: 15, Value: $scope.currentfilter.DepartmentId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/purchaserequest/GetPurchaseRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.purchaserequest', { id: 0, prid: $scope.currentcontext.prid });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/purchaserequest/DeletePurchaseRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.purchaserequest', { id: entity.Id, prid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.PrNumber);
            } else if (actionType == 'view') {
                $state.go('app.purchaserequest', { id: entity.Id, prid: entity.Id });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "RequestedDate",
                    displayName: $translate.instant('inventory.purchaserequests.requesteddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.RequestedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "PrNumber", displayName: $translate.instant('inventory.purchaserequests.prnumber.lbl') },
                { field: "FromStore.StoreName", displayName: $translate.instant('inventory.purchaserequests.fromstore.lbl') },
                { field: "ToStore.StoreName", displayName: $translate.instant('inventory.purchaserequests.tostore.lbl') },
                { field: "PrType.Description", displayName: $translate.instant('inventory.purchaserequests.type.lbl') },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.purchaserequests.vendorname.lbl') },
                // {
                //     field: "TotalNetAmount", displayName: $translate.instant('inventory.purchaserequests.pramount.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                //     // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                // },
                { field: "PrStatus.Description", displayName: $translate.instant('inventory.purchaserequests.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.PrStatusId==2||entity.PrStatusId==3||entity.PrStatusId==4||entity.PrStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.PrStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.PrStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        //{ actiontype: 'edit', display: 'common.editaction.lbl' },
                        //{ actiontype: 'delete', display: 'common.deleteaction.lbl' },
                        //{ actiontype: 'history', display: 'common.history.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        function setDefaults() {
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.PrStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PrStatus, 'Authorized');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.PrStatus, 'Completed');
            $scope.currentfilter.PrStatusId = ApprovedId + "," + AuthorizedId + "," + CompletedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
                if (key == 'User' && $scope.advancedfilter.ApprovedBy === 0) {
                    $scope.advancedfilter.ApprovedBy = value[0].Id;
                }
            });
            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "PrType" },
                { "Key": "ActiveStatus" },
                { "Key": "PrStatus", Default: false },
                {
                    "Key": "FromStore",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentfilter.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentfilter.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    }
                },
                { "Key": "AuthorizedUser" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [
                            { Key: 1, Value: utl.Session.getCurrentUserId() },
                            { Key: 2, Value: $scope.currentfilter.FacilityId },
                            { Key: 5, Value: 2 }
                        ]
                    },
                    Default: false
                },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    },
                    Default: false
                },
                { "Key": "Department" }
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

    purchaseRequestsListController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();