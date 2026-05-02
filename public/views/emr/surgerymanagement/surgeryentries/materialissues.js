(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('materialIssueListController', materialIssueListController);

    function materialIssueListController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            DispenseNumber: '',
            DispenseStatusId: 2,
            DispenseTypeId: 2,
            DispenseDateTime: utl.Formatter.getCurrentDate(),
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
            var From = $filter('date')($scope.currentfilter.DispenseDateTime, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.DispenseDateTime, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.DispenseNumber
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.DispenseTypeId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.DispenseStatusId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 11,
                    Value: From
                },
                {
                    Key: 12,
                    Value: To
                },
                {
                    Key: 17,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 20,
                    Value: $scope.currentcontext.eid
                },
                {
                    Key: 21,
                    Value: $scope.currentcontext.surgentryid
                }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientDispense/GetPatientDispenses',
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
                data: {
                    Id: $scope.currentcontext.surgentryid
                },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('surgeryentry.materialissue', {
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
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('surgeryentry.materialissue', {
                    id: entity.OTRegisterId,
                    eid: entity.EncounterId,
                    pid: entity.PatientId,
                    otidentifier: entity.OTIdentifier,
                    otroomid: entity.OTRoomId,
                    patientdispenseid: entity.Id,
                    storeid: entity.StoreMasterId
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DispenseIdentifier);
            } else if (actionType == 'view') {
                $state.go('surgeryentry.materialissue', {
                    id: entity.OTRegisterId,
                    eid: entity.EncounterId,
                    pid: entity.PatientId,
                    otidentifier: entity.OTIdentifier,
                    otroomid: entity.OTRoomId,
                    patientdispenseid: entity.Id,
                    storeid: entity.StoreMasterId
                });
                //$state.go('app.patientdispense-view', { id: entity.Id, PatientDispenseId: entity.Id, DispenseStatusId: entity.DispenseStatusId, StoreMasterId: entity.StoreMasterId });
            }
        };

        vm.gridConfig = {
            columnDefs: [{
                field: "DispenseDateTime",
                displayName: $translate.instant('billing.patientdispenses.dispensedatetime.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DispenseDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.DispenseDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "DispenseNumber",
                displayName: $translate.instant('billing.patientdispenses.dispensenumber.lbl')
            },
            {
                field: "DispenseStore.StoreName",
                displayName: $translate.instant('billing.patientdispenses.dispensedstore.lbl')
            },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('billing.patientdispenses.totalnetamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "DispensedBy",
                displayName: $translate.instant('billing.patientdispenses.dispensedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DispensedUser.Title.Description}}&nbsp;</span>" + "{{entity.DispensedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.DispensedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "DispenseStatus.Description",
                displayName: $translate.instant('billing.patientdispenses.dispensestatus.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'view\',entity)"  ng-show="entity.DispenseStatusId==2||entity.DispenseStatusId==3||entity.DispenseStatusId==4||entity.DispenseStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"   ng-show="entity.DispenseStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.DispenseStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                    </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        function setDefaults() {
            var DispensedId = utl.Lookup.getDefault($scope.lookup.DispenseStatus, 'Dispensed');
            var AcceptedId = utl.Lookup.getDefault($scope.lookup.DispenseStatus, 'Accepted');
            $scope.currentfilter.DispenseStatusId = DispensedId + "," + AcceptedId;
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
            var inputData = [{
                "Key": "DispenseStatus",
                Default: false
            },
            {
                "Key": "DispensedUser"
            },
            {
                "Key": "ApprovedUser"
            },
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

    materialIssueListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();