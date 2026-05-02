(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('housekeepRequestListController', housekeepRequestListController);

    function housekeepRequestListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            WardId: -1,
            HousekeepingStatusId: 2,
            RequestTypeId: -1,
            // registereddate: utl.Formatter.getCurrentDate(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()

        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                CreatedAt: utl.Formatter.getCurrentDate(),
                HousekeepingActivityId: 1,
                LocationId: -1,
                WardId: -1,
                RoomId: -1,
                BedId: -1,
                AssignedId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'housekeeprequests.filter_requestdate.lbl', model: 'CreatedAt', position: { r: 0, c: 0 } },

                    { type: 'select', translate: 'housekeeprequests.filter_location.lbl', model: 'LocationId', options: $scope.lookup.Location, position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'housekeeprequests.filter_ward.lbl', model: 'WardId', options: $scope.lookup.Ward, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'housekeeprequests.filter_room.lbl', model: 'RoomId', options: $scope.lookup.Room, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'housekeeprequests.filter_bed.lbl', model: 'BedId', options: $scope.lookup.Bed, position: { r: 2, c: 0 } },
                    // { type: 'select', translate: 'housekeeprequests.filter_activity.lbl', model: 'HousekeepingActivityId', options: $scope.lookup.HousekeepingActivity, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'housekeeprequests.filter_type.lbl', model: 'RequestTypeId', options: $scope.lookup.RequestType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'housekeeprequests.filter_assignedto.lbl', model: 'AssignedId', options: $scope.lookup.User, position: { r: 3, c: 0 } },
                    { position: { r: 3, c: 1 } }
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
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        // $scope.advancedfilter.FromCreatedAt = $filter('date')($scope.advancedfilter.CreatedAt, 'yyyy-MM-dd 00:00:00');
        // $scope.advancedfilter.ToCreatedAt = $filter('date')($scope.advancedfilter.CreatedAt, 'yyyy-MM-dd 23:59:59');
        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.advancedfilter.WardId },
                    { Key: 2, Value: $scope.currentfilter.HousekeepingStatusId },
                    { Key: 3, Value: $scope.currentfilter.patientnamemrn },
                    // { Key: 4, Value: $scope.advancedfilter.RequestTypeId },
                    // { Key: 5, Value: $scope.currentfilter.RequestIdentifier },
                    { Key: 6, Value: $scope.currentfilter.HousekeepingActivityId },
                    // { Key: 7, Value: [$scope.advancedfilter.FromCreatedAt, $scope.advancedfilter.ToCreatedAt] },
                    // { Key: 8, Value: $scope.advancedfilter.RoomId },
                    // { Key: 9, Value: $scope.advancedfilter.LocationId },
                    // { Key: 10, Value: $scope.advancedfilter.BedId },
                    // { Key: 11, Value: $scope.advancedfilter.AssignedId },
                    {
                        Key: 14,
                        Value: From
                    },
                    {
                        Key: 15,
                        Value: To
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/BedHousekeeping/GetBedHousekeepings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.housekeeprequest', { id: 0, eid: 0, pid: 0 });
        }

        $scope.filter = function () {
            $state.go('app.housekeeprequests.housekeepfilter', { housekeepfilterid: 0 });
        }



        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/BedHousekeeping/DeleteBedHousekeeping',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        // Cancel Requests from List Screen Function - Start
        $scope.cancelItem = function () {
            $scope.item.HousekeepingStatusId = 5;
            var options = {
                action: 'IPManagement/BedHousekeeping/UpdateBedHousekeeping',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function (pageNo) {

            var options = {
                action: 'IPManagement/BedHousekeeping/GetBedHousekeepingById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function (cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }

        // Cancel Requests from List Screen Function - End 

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.housekeeprequest', { id: entity.Id, eid: 0, pid: 0 });
            } else if (actionType == 'delete') {
                var PatientName = entity.Patient.Title.Description + ' ' + entity.Patient.FirstName + '/' + entity.Patient.MRN
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, PatientName);
            } else if (actionType == 'cancel') { //Cancel Event 
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity.Id, entity.RequestIdentifier);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            }
        }


        //Visibility rules starts
        $scope.canShowEdit = function () {
            return false;
        }

        //Visibility rules starts
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "CreatedAt",
                displayName: $translate.instant('admissionrequests.requestedon.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span class='pl-3'>{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "RequestIdentifier", displayName: $translate.instant('housekeeprequests.requestedno.lbl') },
            {
                field: "Patient",
                displayName: $translate.instant('housekeeprequests.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)">' +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' class='pl-3'>" +
                    "{{entity.Patient.MRN}}</span>" +
                    "<span class='pl-3'>/</span>" +
                    "{{entity.Patient.Title.Description}}</span>" +
                    "<span class='pl-3'>&nbsp;{{entity.Patient.FirstName}}</span>" +
                    "<span class='pl-3'>{{entity.Patient.LastName}}</span>" +
                    "<span class='pl-3'>/</span>" +
                    "<span class='pl-3'>{{entity.Patient.Age}}</span>" +
                    "<span class='pl-3'>{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            },
            { field: "RequestType.Description", displayName: $translate.instant('housekeeprequests.type.lbl') },
            { field: "WardMaster.WardName", displayName: $translate.instant('housekeeprequests.ward.lbl') },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('housekeeprequests.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span class='pl-3'>{{entity.WardRoomMaster.RoomNo}}</span>" +
                    "<span class='pl-3'>&nbsp;/&nbsp;{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "Assigned",
                displayName: $translate.instant('housekeeprequests.assignedto.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<span>' +
                    "{{entity.Assigned.Title.Description}}</span>" +
                    "<span class='pl-3'>&nbsp;{{entity.Assigned.FirstName}}</span>" +
                    "<span class='pl-3'>&nbsp;{{entity.Assigned.LastName}}</span>" +
                    "</span></div>"
            },
            { field: "HousekeepingActivity.Description", displayName: $translate.instant('housekeeprequests.activity.lbl') },
            { field: "HousekeepingStatus.Description", displayName: $translate.instant('housekeeprequests.status.lbl') },


            {
                field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><i class=" fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.HousekeepingStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-show="entity.HousekeepingStatusId==2||entity.HousekeepingStatusId==3"> <i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"> </i> </span>\
                                                                                   </div>',
                handleEvent: $scope.handleEvents,

            }
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //       <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><i class=" fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                //        </div>',
                //     handleEvent: $scope.handleEvents,
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "HouseKeepingStatus" },
                // { "Key": "Patient" },
                { "Key": "RequestType" },
                { "Key": "HousekeepingActivity" },
                { "Key": "Bed" },
                { "Key": "Room" },
                { "Key": "Location" },
                { "Key": "Ward" },
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
    housekeepRequestListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();