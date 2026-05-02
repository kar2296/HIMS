(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('doctordisplayListController', doctordisplayListController);
    function doctordisplayListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorName: -1,
            DepartmentId: -1,
            LocationId: -1,
            DisplayStatusId: 1,
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DepartmentId },
                    { Key: 2, Value: $scope.currentfilter.LocationId },
                    { Key: 3, Value: $scope.currentfilter.DoctorName },
                    { Key: 4, Value: $scope.currentfilter.DisplayStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'Appointment/DoctorDisplay/GetDoctorDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.doctordisplayform', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        //Grid Actions
        $scope.addNew = function () {
            $scope.openModal(0);
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Appointment/DoctorDisplay/DeleteDoctorDisplay',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.updateCallback = function (scope, data, options, hasError) {
            $scope.getList();
        };
        $scope.Update = function (DoctorId, DisplayStatusId) {
            var options = {
                action: 'Appointment/DoctorDisplay/UpdateDoctorDisplay',
                data: { Data: { Id: DoctorId, DisplayStatusId: DisplayStatusId } },
                type: 'post',
                onComplete: $scope.updateCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
            }
            else if (actionType == 'in') {
                $scope.Update(row.entity.Id, 1);
            }
            else if (actionType == 'out') {
                $scope.Update(row.entity.Id, 2);
            }
            else if (actionType == 'cancel') {
                $scope.Update(row.entity.Id, 3);
            }
        }
        vm.gridConfig = {
            columnDefs: [
                { field: "User.FirstName", displayName: $translate.instant('appointment.doctordisplay-list.Doctorname.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('appointment.doctordisplay-list.departmentId.lbl') },
                {
                    field: "AvailableTime", displayName: $translate.instant('appointment.doctordisplay-list.availabletime.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.Availablefrom}}-{{row.entity.Availableto}}</div>'
                },
                { field: "RoomNo", displayName: $translate.instant('appointment.doctordisplay-list.roomno.lbl') },
                { field: "LOCATION.Description", displayName: $translate.instant('appointment.doctordisplay-list.locationId.lbl') },
                { field: "DisplayNo.Description", displayName: $translate.instant('appointment.doctordisplay-list.displaynoId.lbl') },
                { field: "DisplayStatus.Description", displayName: $translate.instant('appointment.doctordisplay-list.displaystatusId.lbl') },
                { field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-hide="row.entity.DisplayStatusId == 4||row.entity.DisplayStatusId == 5"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\                            <span class="grid-action" ng-click="grid.appScope.handleEvents(\'in\',row)"  ng-hide="row.entity.DisplayStatusId == 1||row.entity.DisplayStatusId == 1"><button type="button"  class="btn btn-primary btn-xs">In</button></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'out\',row)"ng-hide="row.entity.DisplayStatusId == 2||row.entity.DisplayStatusId == 2"><button type="button" class="btn btn-warning btn-xs">Out</button></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-hide="row.entity.DisplayStatusId == 3||row.entity.DisplayStatusId == 3"><i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"></i></span>\
                                               </div>',
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DisplayNo" },
                { "Key": "LOCATION" },
                { "Key": "Speciality" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "DisplayStatus" }
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
    doctordisplayListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();