(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientReturnListController', PatientReturnListController);

    function PatientReturnListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            DispenseReturnNumber: '',
            DispenseReturnDateTime: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            PatientName: null,
            PatientReturnNumber: '',
            WardId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.advancedfilter = {
            FromDate: null,
            ToDate: null
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {};
            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'inventory.stocktransfers.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'inventory.stocktransfers.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.requestedby.lbl', model: 'RequestedBy', options: $scope.lookup.RequestedUser, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'inventory.stocktransfers.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'inventory.stocktransfers.transferedby.lbl', model: 'TransferedBy', options: $scope.lookup.TranferedUser, position: { r: 2, c: 0 } },
                    { type: 'text', translate: 'inventory.stocktransfers.acceptedno.lbl', model: 'AcceptanceNumber', position: { r: 2, c: 1 } }
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

        $scope.getList = function (pageNo) {
            // var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            if (!$scope.currentfilter.DispenseReturnDateTime) {
                utl.Alert.showErrorMsg('Please Select Rec.Date');
                return false;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DispenseReturnNumber },
                    { Key: 2, Value: $scope.currentfilter.DispenseReturnStatusId },
                    //{ Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 7, Value: $scope.currentfilter.PatientReturnNumber },
                    { Key: 4, Value: $scope.currentfilter.PatientReturnStatus },
                    // { Key: 10, Value: $scope.advancedfilter.RequestedBy },
                    // { Key: 11, Value: $scope.advancedfilter.ApprovedBy },
                    // { Key: 12, Value: $scope.advancedfilter.TransferedBy },
                    // { Key: 13, Value: $scope.advancedfilter.AcceptanceNumber },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                    // { Key: 9, Value: FromReq },
                    // { Key: 10, Value: ToReq },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientDispenseReturn/GetPatientDispenseReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.stocktransfer', { id: 0 });
        };

        $scope.filter = function () {
            $state.go('app.stocktransfers.transferfilter', { transferfilterid: 0 });
        };


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/StockTransfer/DeleteStockTransfer',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.returnreceive-view', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DispenseReturnIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.returnreceive-view', { id: entity.Id, PatientDispenseReturnId: entity.Id, DispenseReturnStatusId: entity.DispenseReturnStatusId, StoreMasterId: entity.StoreMasterId });
            }
        };

        vm.gridConfig = {
            columnDefs: [{
                field: "DispenseReturnDateTime",
                displayName: $translate.instant('billing.patientreturns.dispensereturndatetime.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DispenseReturnDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.DispenseReturnDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "DispenseReturnNumber", displayName: $translate.instant('billing.patientreturns.dispensereturnnumber.lbl') },
            { field: "ReceivedStore.StoreName", displayName: $translate.instant('billing.patientreturns.mystore.lbl') },
            // { field: "PatientName", displayName: $translate.instant('billing.patientreturns.patientname.lbl') },
            {
                field: "PatientName",
                displayName: $translate.instant('billing.patientreturns.patientname.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Patient.Title.Description}}&nbsp;</span><span>{{entity.Patient.FirstName}}&nbsp;</span><span>{{entity.Patient.LastName}}&nbsp;</span>' + '</div>'
            },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('mrd.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName }}</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
                    "</div>"
            },
            // {
            //     field: "WardMaster",
            //     displayName: $translate.instant('billing.patientreturns.wardroom.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.WardMaster.WardName}}&nbsp;</span>" + " / " + "<span >{{entity.WardRoomMaster.RoomNo}}</span>" + "</div>"
            // },
            { field: "PatientReturnNumber", displayName: $translate.instant('billing.patientreturns.returnno.lbl') },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('billing.patientreturns.totalnetamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "ReturnReceivedBy",
                displayName: $translate.instant('billing.patientreturns.receivedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReturnReceivedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.ReturnReceivedUser.LastName}}</span>" + "</div>"
            },
            { field: "DispenseReturnStatus.Description", displayName: $translate.instant('billing.patientreturns.dispensereturnstatus.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.DispenseReturnStatusId == 2 || entity.DispenseReturnStatusId == 3 || entity.DispenseReturnStatusId == 4"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                </div>',
                                                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        function setDefaults() {
            var ReceivedId = utl.Lookup.getDefault($scope.lookup.DispenseReturnStatus, 'Received');
            var RejectedId = utl.Lookup.getDefault($scope.lookup.DispenseReturnStatus, 'Rejected');
            $scope.currentfilter.DispenseReturnStatusId = ReceivedId + "," + RejectedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });

            setDefaults();
            $scope.getList();
            initDynamicForm();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "DispenseReturnStatus", Default: false },
                { "Key": "Ward" },
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

    PatientReturnListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();