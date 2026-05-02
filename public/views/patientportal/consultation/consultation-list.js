(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('consultationsController', consultationsController);

    function consultationsController($scope, $stateParams, $state, $translate, utl, $rootScope) {
        var vm = this;

        $scope.currentcontext = {};

        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.pid },
                    { Key: 5, Value: '3' } // ProgressNoteStatus - released to patient
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
       
        //back
        
        //Grid Actions
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'reviewnote') {
                utl.Modal.open('patientportal.reviewnote', {
                    params: { cid: row.entity.Id, pid: $scope.currentcontext.pid }
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('patientportal.consultation-list.visitidentifier.lbl') },
                {
                    field: "Encounter.DoctorName", displayName: $translate.instant('patientportal.consultation-list.doctor.lbl')
                },
                {
                    field: "Encounter.Department.DepartmentName", displayName: $translate.instant('patientportal.consultation-list.department.lbl')
                },
                { field: "Name", displayName: $translate.instant('patientportal.consultation-list.consultationname.lbl') },
                {
                    field: "CreatedAt", displayName: $translate.instant('patientportal.consultation-list.consultationdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.CreatedAt'></ngformatdate>"
                },
                {
                    field: "Encounter.AdmissionDate", displayName: $translate.instant('patientportal.consultation-list.admissiondate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.Encounter.AdmissionDate'></ngformatdate>"
                },
                {
                    field: "Encounter.DischargeDate", displayName: $translate.instant('patientportal.consultation-list.dishcargedate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.Encounter.AdmissionDate'></ngformatdate>"
                },
                { field: "Encounter.EncounterType.Description", displayName: $translate.instant('patientportal.consultation-list.encountertype.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'reviewnote', display: 'patientportal.consultation-list.reviewnote.lbl', icon: 'fa-download' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.getList();
    }

    consultationsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$rootScope'];

})();