(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('newappointments', newappointments);

function newappointments($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.currentfilter= {
    };

    $scope.currentcontext =  {
        paneltype : 'panel-info'
    };
    
    utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

    $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
    $scope.dashboardinfo = {};

    $scope.getListCallback = function (scope,res, options, hasError) {
        vm.gridConfig.data = res.Data;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 15, Value: $scope.currentcontext.pid }
            ],
            PageContext:{
                PageSize: 500,
                PageNumber: 1
            }
        };

        var options = {
            action: 'appointment/Appointment/GetAppointments',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    $scope.getList();

    vm.gridConfig = {
        columnDefs: [
                        { field: "AppointmentStatus.Description", displayName: $translate.instant('patientportal.previous-appointment.status.lbl'),
                                    cellTemplate:"<div class='ui-grid-cell-contents'>\
                                                    <div style='height:20px;width:20px;background:{{row.entity.AppointmentCategory.Color}}' class='col-sm-2'></div>\
                                                &nbsp;<span>{{row.entity.AppointmentStatus.Description}}</span>\
                                            </div>" },
                        { field: "AppointmentType.Description", displayName: $translate.instant('patientportal.previous-appointment.appointmenttype.lbl') },
                        
                        { field: "User.FirstName", displayName: $translate.instant('patientportal.previous-appointment.doctor.lbl'), width : '15%',
                                    cellTemplate:"<div class='ui-grid-cell-contents'>\
                                                    <div ng-if='row.entity.ResourceMaster'>\
                                                        <span>{{row.entity.ResourceMaster.ResourceName}}</span>\
                                                    </div>\
                                                    <div ng-if='row.entity.User'>\
                                                        <span ng-if='row.entity.User.Title && row.entity.User.Title.Description'>{{row.entity.User.Title.Description}}&nbsp;</span>\
                                                        <span>{{row.entity.User.FirstName}}</span>&nbsp;<span>{{row.entity.User.LastName}}</span>\
                                                    </div>\
                                            </div>" },
                        { field: "AppointmentDate", displayName: $translate.instant('patientportal.previous-appointment.appointmentdate.lbl'),
                                cellTemplate:"<ngformatdate date-val='row.entity.AppointmentDate' time-val='row.entity.StartTime'></ngformatdate>" },
                        { field: "Referral.ReferralName", displayName: $translate.instant('patientportal.previous-appointment.referredby.lbl') },
                        { field: "PatientGuarantor.GuarantorName", displayName: $translate.instant('patientportal.previous-appointment.guarantor.lbl') },
                        { field: "Priority.Description", displayName: $translate.instant('patientportal.previous-appointment.priority.lbl') },
                        { field: "VisitType.Description", displayName: $translate.instant('patientportal.previous-appointment.visittype.lbl') },
                        { field: "Remark.Remarks", displayName: $translate.instant('patientportal.previous-appointment.remarks.lbl') },

                    ]
    };
}

newappointments.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();