(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointementrequestController', appointementrequestController);

    function appointementrequestController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        var userdept = -1;
        try {
            userdept = parseInt(utl.Session.getCurrentDepartmentId());
        } catch (ex) { userdept - 1; }

        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: -1,
            MRDFileStatusId: 1,
            DepartmentId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.currentcontext = {
            canDisableAcceptCancel: false
        };

        $scope.lookup = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.orderid = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            for(var idx in res.Data) {
                res.Data[idx].TempStatus = 1;
            }
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var apptStart = utl.Formatter.getDateStringForAppointment($scope.currentfilter.FromDate) + " 00:00";
            var apptEnd = utl.Formatter.getDateStringForAppointment($scope.currentfilter.ToDate) + " 23:59";
            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.currentfilter.AppointmentStatusId },
                    { Key: 9, Value: apptStart },
                    { Key: 10, Value: apptEnd },
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 18, Value: false }, // IsMrdFileRequest
                    { Key: 19, Value: true }, // MRNTypeId = 2
                ],
                PageContext:{
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'appointment/Appointment/GetAppointmentWithFileLocation',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'delete') {
                row.entity.TempStatus = 0;
                vm.gridConfig.data = vm.gridConfig.data.filter(function(e) { return e.TempStatus !== 0 });
            }
        };


        $scope.save = function () {
            utl.Modal.open('app.appointmentreqconfirm', {
                params: {
                    patientinfo: vm.gridConfig.data,
                    FrmDeptId: userdept },
                    confirmCallback: $scope.backtolist
            });
        }

        $scope.backtolist = function() {
            $scope.confirmCallback();
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "PatientId",
                    displayName: $translate.instant('frequest.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="right">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span >{{row.entity.Patient.FirstName}}</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "MRN",
                    displayName: $translate.instant('frequest.onlymrn.lbl'),
                    cellTemplate: "<span >{{row.entity.Patient.MRN}}</span>"
                },
                {
                    field: "AppointmentDate",
                    displayName: $translate.instant('appointment.appointment-list.appointmenttime.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.AppointmentDate' time-val='row.entity.StartTime'></ngformatdate>"
                },
                { field: "Department.DepartmentName", displayName: $translate.instant('ordermanagement.orderacknowledgement-form.department.lbl') },
                {
                    field: "Doctor",
                    displayName: $translate.instant('otrequest-list.admittingdoctor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.User.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{row.entity.User.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{row.entity.User.LastName}}</span>' + '</div>'
                },
                {
                    field: "FileLocation",
                    displayName: $translate.instant('frequest.filelocation.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                    {{row.entity.FileLocation}} </div>"
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ">\
                                    <img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var scheduledStautsId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'SCHEDULED');
            var confirmed = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'CONFIRMED');
            var rescheduleid = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'RESCHEDULED');
            $scope.currentfilter.AppointmentStatusId = scheduledStautsId + "," + confirmed + "," + rescheduleid;
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
                { "Key": "Department" },
                { "Key": "AppointmentStatus" }
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

    appointementrequestController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();
