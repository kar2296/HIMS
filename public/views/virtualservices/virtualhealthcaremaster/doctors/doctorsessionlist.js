(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorSessionListController', DoctorSessionListController);

    function DoctorSessionListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            AppointmentSessionTypeId: -1,
            DoctorId: -1,
            SpecialityId: -1,
            ActiveStatusId: 2
        };
        $scope.currentfilter.userid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentfilter.userid &&
                $scope.currentfilter.userid > 0) {
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentfilter.FacilityId
                        },
                        {
                            Key: 5,
                            Value: $scope.currentfilter.userid
                        },
                        {
                            Key: 8,
                            Value: $scope.currentfilter.ActiveStatusId
                        }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('app.docsessionform', {
                params: {
                    id: 0,
                    selecteddocid: $scope.currentfilter.userid
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'appointment/AppointmentMultiSession/DeleteAppointmentMultiSession',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.docsessionform', {
                    params: {
                        id: entity.Id
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('appointment.appointmentsession-list.facilityname.lbl') },
                {
                    field: "AppointmentSessionType.Description",
                    displayName: $translate.instant('appointment.appointmentsession-list.appointmentsessiontype.lbl')
                },
                {
                    field: "User.FirstName",
                    displayName: $translate.instant('appointment.appointmentsession-list.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div ng-if='entity.ResourceMaster'>\
                                                        <span>{{entity.ResourceMaster.ResourceName}}</span>\
                                                    </div>\
                                                    <div ng-if='entity.User'>\
                                                        <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                                                        <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}</span>\
                                                    </div>\
                                            </div>"
                },
                // { field: "Speciality.SpecialityName", displayName: $translate.instant('appointment.appointmentsession-list.Specialityname.lbl') },
                {
                    field: "StartDate",
                    displayName: $translate.instant('appointment.appointmentsession-list.startdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.StartDate'></ngformatdate>"
                },
                {
                    field: "StartTime",
                    displayName: $translate.instant('appointment.appointmentsession-list.startdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.StartTime'></ngformatdate>"
                },
                {
                    field: "EndDate",
                    displayName: $translate.instant('appointment.appointmentsession-list.enddate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.EndDate'></ngformatdate>"
                },
                {
                    field: "EndTime",
                    displayName: $translate.instant('appointment.appointmentsession-list.enddate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.EndTime'></ngformatdate>"
                },
                {
                    field: "MaxSlotPerDay",
                    displayName: $translate.instant('appointment.appointmentsession-list.maxslotperday.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('appointment.appointmentcategory-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                    </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "AppointmentSessionType"
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Speciality"
                },
                {
                    "Key": "ActiveStatus"
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

    DoctorSessionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();