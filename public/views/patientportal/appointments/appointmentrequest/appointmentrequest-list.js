(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentRequestListController', appointmentRequestListController);

function appointmentRequestListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.currentcontext =  {};
    

    $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());    

    $scope.getListCallback = function (scope,res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentcontext.pid }
            ],
            PageContext:{
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

    $scope.addNew = function() {
        $state.go('patientportal.appointmentrequestform', { id:0 });
    }

    $scope.handleEvents = function (actionType, row) {

        if (actionType == 'edit') {
            $state.go('patientportal.appointmentrequestform', { id: row.entity.Id });
        }
        else if (actionType == 'delete') {
            
        }
    }

    vm.gridConfig = {
        columnDefs: [
            { field: "Facility.FacilityName", displayName: $translate.instant('patientportal.appointment-list.facility.lbl') },
            {
                field: "User.FirstName", displayName: $translate.instant('patientportal.appointment-list.doctor.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>"
                + '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                + "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>"
                + "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>"
                + "<span >{{row.entity.Doctor.LastName}}</span>"
                + "</span></div>"
            },
            { field: "Department.DepartmentName", displayName: $translate.instant('patientportal.appointment-list.department.lbl') },
            
            { field: "AppointmentDate", displayName: $translate.instant('patientportal.appointment-list.appointmentdate.lbl'),
                    cellTemplate:"<ngformatdate date-val='row.entity.AppointmentDate' time-val='row.entity.StartTime'></ngformatdate>" },
            {
                field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: 'actionTemplate.html',
                actions: [
                    { actiontype: 'edit', display: 'common.editaction.lbl' },
                    { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                ]
            }            
        ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };

    $scope.getList();
    
}

appointmentRequestListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();