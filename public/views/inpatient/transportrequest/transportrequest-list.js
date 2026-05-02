(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('transportRequestListController', transportRequestListController);

    function transportRequestListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            RequestTypeId: -1,
            TransportStatusId: 2
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                CreatedAt: utl.Formatter.getCurrentDate(),
                AssignedId: -1,
                FromBedId: -1,
                ToBedId: -1,
                FromWardId: -1,
                ToWardId: -1,
                FromRoomId: -1,
                ToRoomId: -1,
                FromLocationId: -1,
                ToLocationId: -1,
                TransportActivityId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'transportrequests.filter_requestdate.lbl', model: 'CreatedAt', position: { r: 0, c: 0 } },
                    // { type: 'select', translate: 'transportrequests.filter_activity.lbl', model: 'TransportActivityId', options: $scope.lookup.TransportActivity, position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'transportrequests.filter_type.lbl', model: 'RequestTypeId', options: $scope.lookup.RequestType, position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'transportrequests.filter_fromlocation.lbl', model: 'FromLocationId', options: $scope.lookup.Location, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'transportrequests.filter_tolocation.lbl', model: 'ToLocationId', options: $scope.lookup.Location, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'transportrequests.filter_fromward.lbl', model: 'FromWardId', options: $scope.lookup.Ward, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'transportrequests.filter_toward.lbl', model: 'ToWardId', options: $scope.lookup.Ward, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'transportrequests.filter_fromroom.lbl', model: 'FromRoomId', options: $scope.lookup.Room, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'transportrequests.filter_toroom.lbl', model: 'ToRoomId', options: $scope.lookup.Room, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'transportrequests.filter_frombed.lbl', model: 'FromBedId', options: $scope.lookup.Bed, position: { r: 4, c: 0 } },
                    { type: 'select', translate: 'transportrequests.filter_tobed.lbl', model: 'ToBedId', options: $scope.lookup.Bed, position: { r: 4, c: 1 } },
                    { type: 'select', translate: 'transportrequests.filter_assignedto.lbl', model: 'AssignedId', options: $scope.lookup.User, position: { r: 5, c: 0 } },
                    { position: { r: 5, c: 1 } }
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

        $scope.openAdvancedFilter = function() {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.TransportStatusId },
                    { Key: 2, Value: $scope.currentfilter.patientnamemrn },
                    { Key: 3, Value: $scope.advancedfilter.RequestTypeId },
                    { Key: 4, Value: $scope.currentfilter.TransportIdentifier },
                    { Key: 5, Value: $scope.currentfilter.TransportActivityId },
                    { Key: 6, Value: $scope.advancedfilter.CreatedAt },
                    { Key: 7, Value: $scope.advancedfilter.FromLocationId },
                    { Key: 8, Value: $scope.advancedfilter.ToLocationId },
                    { Key: 9, Value: $scope.advancedfilter.FromWardId },
                    { Key: 10, Value: $scope.advancedfilter.ToWardId },
                    { Key: 11, Value: $scope.advancedfilter.FromRoomId },
                    { Key: 12, Value: $scope.advancedfilter.ToRoomId },
                    { Key: 13, Value: $scope.advancedfilter.FromBedId },
                    { Key: 14, Value: $scope.advancedfilter.ToBedId },
                    { Key: 15, Value: $scope.advancedfilter.AssignedId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/BedTransportation/GetBedTransportations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function() {
            $state.go('app.transportrequest', { id: 0 });
        }

        $scope.currentfilter.registereddate = utl.Formatter.getCurrentDate()



        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.patientprofiledetails = function(patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.onDeleteConfirmed = function(deleteId) {
                var options = {
                    action: 'IPManagement/BedTransportation/DeleteBedTransportation',
                    data: { Id: deleteId },
                    type: 'post',
                    onComplete: $scope.deleteItemCallback
                };
                utl.Http.doAction(options);
            }
            // Cancel Requests from List Screen Function - Start 
        $scope.cancelItem = function() {
            $scope.item.TransportStatusId = 5;
            var options = {
                action: 'IPManagement/BedTransportation/UpdateBedTransportation',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function(pageNo) {

            var options = {
                action: 'IPManagement/BedTransportation/GetBedTransportationById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function(cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }

        // Cancel Requests from List Screen Function - End 
        $scope.handleEvents = function(actionType, row) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.transportrequest', { id: row.entity.Id });
            } else if (actionType == 'delete') {
                var PatientName = row.entity.Patient.Title.Description + ' ' + row.entity.Patient.FirstName + '/' + row.entity.Patient.MRN
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, PatientName);
            } else if (actionType == 'cancel') { //Cancel Event 
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, row.entity.Id, row.entity.Patient.FirstName);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "CreatedAt",
                    displayName: $translate.instant('transportrequests.requestedon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "TransportIdentifier", displayName: $translate.instant('transportrequests.requestedno.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('transportrequests.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.MRN}}</span>" +
                        "<span >/</span>" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span >&nbsp;{{row.entity.Patient.FirstName}}</span>" +
                        "<span >&nbsp;{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                { field: "RequestType.Description", displayName: $translate.instant('transportrequests.type.lbl') },
                { field: "FromWard.WardName", displayName: $translate.instant('transportrequests.ward.lbl') },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('transportrequests.room.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{row.entity.FromRoom.RoomNo}}</span>" +
                        "<span >&nbsp;/&nbsp;{{row.entity.FromBed.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "Assigned.FirstName",
                    displayName: $translate.instant('transportrequests.assignedto.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span>' +
                        "{{row.entity.Assigned.Title.Description}}</span>" +
                        "<span >&nbsp;{{row.entity.Assigned.FirstName}}</span>" +
                        "<span >&nbsp;{{row.entity.Assigned.LastName}}</span>" +
                        "</span></div>"
                },
                { field: "TransportActivity.Description", displayName: $translate.instant('transportrequests.activity.lbl') },
                { field: "TransportStatus.Description", displayName: $translate.instant('transportrequests.status.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.TransportStatusId == 4 || row.entity.TransportStatusId == 5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"   ng-hide="row.entity.TransportStatusId == 4||row.entity.TransportStatusId == 5"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-show="row.entity.TransportStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-show="row.entity.TransportStatusId==2||row.entity.TransportStatusId==3"><a translate="Cancel"></a></span>\
                                                </div>',
                    actions: [

                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm()
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                    { "Key": "Facility" },
                    { "Key": "RequestType" },
                    { "Key": "TransportStatus" },
                    { "Key": "Ward" },
                    { "Key": "Room" },
                    { "Key": "Bed" },
                    { "Key": "TransportActivity" },
                    { "Key": "Location" },
                    { "Key": "User" }
                ]
                /*   2/12/2016 */
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
    transportRequestListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();