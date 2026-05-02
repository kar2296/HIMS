(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('materialReturnListController', materialReturnListController);

    function materialReturnListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentcontext = {};
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        if ($stateParams.id)
            $scope.currentcontext.surgentryid = $stateParams.id;
        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;

        $scope.lookup = {};
        $scope.item = {};
        $scope.currentfilter = {
            DispenseReturnNumber: '',
            DispenseReturnDateTime: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0
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
            var From = $filter('date')($scope.currentfilter.DispenseReturnDateTime, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.DispenseReturnDateTime, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DispenseReturnNumber },
                    { Key: 2, Value: $scope.currentfilter.DispenseReturnStatusId },
                    //{ Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 7, Value: $scope.currentfilter.PatientReturnNumber },
                    { Key: 4, Value: $scope.currentfilter.PatientReturnStatus },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To }
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

        $scope.getOtregisterCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = $scope.item.EncounterId;
            $scope.currentcontext.pid = $scope.item.PatientId;
            $scope.currentcontext.otidentifier = $scope.item.OTIdentifier;
            $scope.currentcontext.doctorid = $scope.item.DoctorId;
            $scope.currentcontext.doctorname = $scope.item.DoctorName;
            $scope.currentcontext.wardid = $scope.item.WardId;
            $scope.currentcontext.roomid = $scope.item.RoomId;
            $scope.currentcontext.bedid = $scope.item.BedId;
            $scope.currentcontext.otroomid = $scope.item.OTRoomId;
        };

        $scope.getOtregisterById = function () {
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntryById',
                data: { Id: $scope.currentcontext.surgentryid },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('surgeryentry.materialreturn', {
                otregisterid: $scope.currentcontext.surgentryid,
                eid: $scope.currentcontext.eid,
                pid: $scope.currentcontext.pid,
                otidentifier: $scope.currentcontext.otidentifier,
                doctorid: $scope.currentcontext.doctorid,
                doctorname: $scope.currentcontext.doctorname,
                wardid: $scope.currentcontext.wardid,
                roomid: $scope.currentcontext.roomid,
                bedid: $scope.currentcontext.bedid,
                otroomid: $scope.currentcontext.otroomid
            });
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
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('billing.patientreturns.totalnetamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
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
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.DispenseReturnStatusId == 2 || entity.DispenseReturnStatusId == 3 || entity.DispenseReturnStatusId == 4"><i class="fas fa-eye" aria-hidden="true"></i></span>\
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
            $scope.getOtregisterById();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DispenseReturnStatus", Default: false },
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

    materialReturnListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();