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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig ? vm.gridConfig.data : [],
                totalItems: (vm.gridConfig && vm.gridConfig.pagerObj) ? vm.gridConfig.pagerObj.totalItems : 0,
                pageSize: (vm.gridConfig && vm.gridConfig.pagerObj) ? vm.gridConfig.pagerObj.pageSize : 25,
                currentPage: (vm.gridConfig && vm.gridConfig.pagerObj) ? vm.gridConfig.pagerObj.currentPage : 1,
                lookup: $scope.lookup || {},
                currentfilter: $scope.currentfilter
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                if (payload) {
                    if (payload.AppointmentSessionTypeId !== undefined) $scope.currentfilter.AppointmentSessionTypeId = payload.AppointmentSessionTypeId;
                    if (payload.DoctorId !== undefined) $scope.currentfilter.DoctorId = payload.DoctorId;
                    if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
                    if (payload.FacilityId !== undefined) $scope.currentfilter.FacilityId = payload.FacilityId;
                    if (payload.currentPage && vm.gridConfig) vm.gridConfig.pagerObj.currentPage = payload.currentPage;
                    if (payload.pageSize && vm.gridConfig) vm.gridConfig.pagerObj.pageSize = payload.pageSize;
                }
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter.AppointmentSessionTypeId = -1;
                $scope.currentfilter.DoctorId = -1;
                $scope.currentfilter.ActiveStatusId = 2;
                if (vm.gridConfig && vm.gridConfig.pagerObj) vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                if (vm.gridConfig && vm.gridConfig.pagerObj) {
                    vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
                }
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName](payload);
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (!hasError && res && res.Data) {
                vm.gridConfig.data = res.Data;
                vm.gridConfig.pagerObj.totalItems = (res.PageContext && res.PageContext.TotalRecords !== undefined) ? res.PageContext.TotalRecords : res.Data.length;
            } else {
                vm.gridConfig.data = [];
                vm.gridConfig.pagerObj.totalItems = 0;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
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

        // Grid Actions
        $scope.addNew = function () {
            $state.go('app.appointmentsessionformtab', {
                id: 0
            });
        };

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
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType === 'edit') {
                $state.go('app.appointmentsessionformtab', {
                    id: entity.Id
                });
            } else if (actionType === 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "AppointmentSessionType.Description",
                    displayName: $translate.instant('appointment.appointmentsession-list.appointmentsessiontype.lbl')
                },
                {
                    field: "User.FirstName",
                    displayName: $translate.instant('appointment.appointmentsession-list.doctor.lbl')
                },
                {
                    field: "StartDate",
                    displayName: $translate.instant('appointment.appointmentsession-list.startdate.lbl')
                },
                {
                    field: "EndDate",
                    displayName: $translate.instant('appointment.appointmentsession-list.enddate.lbl')
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
                    handleEvent: $scope.handleEvents
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
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
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
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    appointmentSessionListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();