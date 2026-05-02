(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('otbedreceiveListController', otbedreceiveListController);

    function otbedreceiveListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {

            RoomTypeId: -1,
            WardId: -1,
            StatusId: -1,
            ReceivedStatusId: 1,
            FromWardId: -1,
            TransferDate: utl.Formatter.getCurrentDate(),

        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.currentfilter.facilityid = utl.Session.getCurrentFacilityId();

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {

            var From = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.TransferDate, 'yyyy-MM-dd 23:59:59') || null;

            // if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
            //     $scope.currentfilter.RequestDate = '';
            // }
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    // { Key: 3, Value: $scope.currentfilter.PatientId },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FromWardId
                    },
                    {
                        Key: 18,
                        Value: $scope.currentfilter.RequestedStatusId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.RequestDate
                    },
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    },
                    {
                        Key: 19,
                        Value: true
                    },
                    {
                        Key: 20,
                        Value: $scope.currentfilter.ReceivedStatusId
                    },
                    {
                        Key: 16,
                        Value: utl.Session.getCurrentFacilityId()
                    },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/BedTransfer/GetBedTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function receiveBedCallback() {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        }

        function receiveBed(itemId) {
            $scope.BedReceiveInfo = {};
            $scope.BedReceiveInfo = itemId;
            $scope.BedReceiveInfo.Id = itemId.Id;
            $scope.BedReceiveInfo.ReceivedStatusId = 2;
            $scope.BedReceiveInfo.ReceivedBy = utl.Session.getCurrentUserId();
            $scope.BedReceiveInfo.ReceivedDate = utl.Formatter.getCurrentDate();

            var options = {
                action: 'ipmanagement/BedTransfer/UpdateBedTransfer',
                data: { Data: $scope.BedReceiveInfo },
                type: 'post',
                onComplete: receiveBedCallback
            };

            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'receive') {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Do You Want to Receive this Transfer?',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: receiveBed,
                    itemId: entity
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "CreatedAt", displayName: $translate.instant('bedtransfer-list.requestedon.lbl') },
                {
                    field: "TransferDate",
                    displayName: $translate.instant('bedtransfer-list.transferdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransferDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.TransferDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "RequestIdentifier",
                    displayName: $translate.instant('bedtransfer-list.refnum.lbl')
                },

                {
                    field: "Patient",
                    displayName: $translate.instant('medicalcertificate.dischargesummary-list.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        // + '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} '
                        // + '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom" >'
                        +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
                },
                // {
                //  field: "WardRoomMaster", displayName: $translate.instant('bedtransfer-list.requestfrom.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>"
                //     + "<span >{{entity.FromWard.WardName}}</span>"
                //     + "<span >&nbsp;/&nbsp;{{entity.FromRoom.RoomNo}}</span>"
                //     + "<span >&nbsp;/&nbsp;{{entity.FromBed.BedNo}}</span>"
                //     + "</div>"
                // },
                {
                    field: "ToWard.WardName",
                    displayName: $translate.instant('bedtransfer-list.tobed.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.ToWard.WardName}}&nbsp;</span>" +
                        "<span >&nbsp;/&nbsp;{{entity.ToRoom.RoomNo}}&nbsp;</span>" +
                        "<span >&nbsp;/&nbsp;{{entity.ToBed.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('bedtransfer-list.requestedby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ entity.Doctor.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{entity.Doctor.FirstName}}</span>' + '</div>'
                },
                // { field: "Department.DepartmentName", displayName: $translate.instant('bedtransfer-list.department.lbl') },
                {
                    field: "RequestedStatus.Description",
                    displayName: $translate.instant('bedtransfer-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                        <span class="grid-action" ng-click="handleEvents(\'receive\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                     </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Ward"
                },
                {
                    "Key": "ReceiveStatus"
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

    otbedreceiveListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();