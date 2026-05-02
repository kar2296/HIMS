(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentReqListController', appointmentReqListController);

    function appointmentReqListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.DoctorId = -1;
        $scope.currentfilter.appointmentdate = new Date();
        $scope.currentfilter.AppointmentRequestStatusId = -1;
        $scope.currentfilter.FacilityId = parseInt(utl.Session.getCurrentFacilityId());


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 3, Value: utl.Formatter.getFilterDate($scope.currentfilter.appointmentdate) },
                    { Key: 4, Value: $scope.currentfilter.AppointmentRequestStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'appointment/AppointmentRequest/GetAppointmentRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };



        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'associate') {

                var DrName = '';
                if (row.entity.Doctor && row.entity.Doctor.Title
                    && row.entity.Doctor.Title.Description) {
                    DrName += row.entity.Doctor.Title.Description;
                }
                if (row.entity.Doctor && row.entity.Doctor.FirstName) {
                    DrName += ' '+row.entity.Doctor.FirstName;
                }
                if (row.entity.Doctor && row.entity.Doctor.LastName) {
                    DrName += ' '+row.entity.Doctor.LastName;
                }

                utl.Modal.open('app.apptreqconfirm', {
                    params: {
                        id: row.entity.Id,
                        pid: row.entity.PatientId,
                        appointmentDate: row.entity.AppointmentDate,
                        deptid: row.entity.DepartmentId,
                        doctorid: row.entity.DoctorId,
                        reason: row.entity.RequestMessage,
                        doctorname: DrName,
                        starttime: row.entity.StartTime,
                        endtime: row.entity.EndTime,
                        appointmentid: row.entity.AppointmentId,
                        appointmentrequeststatusid: row.entity.AppointmentRequestStatusId,
                        appointmentstatusid:  row.entity.AppointmentRequestStatusId,
                        appointmentreqstatus:  row.entity.AppointmentRequestStatus.Description,
                    },
                    confirmCallback: $scope.getList

                });

            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('appointment.appointmentreq-list.facility.lbl') },
                {
                    field: "Doctor.FirstName", displayName: $translate.instant('appointment.appointmentreq-list.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                    + "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>"
                    + "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>"
                    + "<span >{{row.entity.Doctor.LastName}}</span>"
                    + "</span></div>"
                },
                { field: "Department.DepartmentName", displayName: $translate.instant('appointment.appointmentreq-list.department.lbl') },

                { field: "AppointmentDate", displayName: $translate.instant('appointment.appointmentreq-list.appointmentdate.lbl'),
                        cellTemplate:"<ngformatdate date-val='row.entity.AppointmentDate' time-val='row.entity.StartTime'></ngformatdate>" },
                { field: "AppointmentRequestStatus.Description", displayName: $translate.instant('appointment.appointmentreq-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-if="row.entity.AppointmentRequestStatusId == 1" ng-click="grid.appScope.handleEvents(\'associate\',row)">\
                    <img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                     </div>',
                    actions: [ ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var pendingid = utl.Lookup.getDefault($scope.lookup.AppointmentRequestStatus, 'Pending');
            $scope.currentfilter.AppointmentRequestStatusId = pendingid + ",";
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Resource" },
                { "Key": "AppointmentRequestStatus", Default: false },
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

    appointmentReqListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();