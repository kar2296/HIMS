(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentSessionListController', appointmentSessionListController);

    function appointmentSessionListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            AppointmentSessionTypeId: -1,
            DoctorId: -1,
            SpecialityId: -1,
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.AppointmentSessionTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.SpecialityId
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
                action: 'appointment/AppointmentSession/GetAppointmentSessions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.appointmentsession', { id:0 });
            $state.go('app.appointmentsessionformtab', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'appointment/AppointmentSession/DeleteAppointmentSession',
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
                // $state.go('app.appointmentsession', { id:entity.Id });
                $state.go('app.appointmentsessionformtab', {
                    id: entity.Id
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
                //   { field: "Speciality.SpecialityName", displayName: $translate.instant('appointment.appointmentsession-list.Specialityname.lbl') },
                {
                    field: "StartDate",
                    displayName: $translate.instant('appointment.appointmentsession-list.startdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.StartDate'></ngformatdate>"
                },
                {
                    field: "EndDate",
                    displayName: $translate.instant('appointment.appointmentsession-list.enddate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.EndDate'></ngformatdate>"
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
                                                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        },
                        {
                            actiontype: 'delete',
                            display: 'common.deleteaction.lbl'
                        }
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

    appointmentSessionListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();