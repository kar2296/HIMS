(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pastVisitListController', pastVisitListController);

    function pastVisitListController($rootScope,$scope, $stateParams, $state, $translate, utl, $uibModalInstance,$timeout, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.doctor_dashboard = function () {
            if ($scope.Fromview == 'fromward') {
                $state.go('app.bedmanagementtab.inpatient');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList();
        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'encounter') {
                utl.Session.setEMRPatientId(entity.PatientId);
                var encounterId = entity ? entity.Id : 0;
                if (encounterId == 0)
                    encounterId = entity ? (entity.length > 0 ? entity[0].Id : 0) : 0;
                $state.go('patientemr.patientdashboard', { eid: encounterId });
                // $state.go('patientemr.patientdashboard', { encounter: entity });
                $scope.confirmCallback();
            } else if (actionType == 'reviewnote') {
                utl.Modal.open('patientemr.consultations', {
                    params: { eid: entity.Id, pid: entity.PatientId },
                    confirmCallback: $scope.getList
                });
                // utl.Modal.open('patientemr.reviewnotes', {
                //     params: { cid: entity.Id, pid: $scope.currentcontext.pid }
                // });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "VisitIdentifier", displayName: $translate.instant('patientemr.pastvisit-list.visitidentifier.lbl') },
                {
                    field: "DoctorName", displayName: $translate.instant('patientemr.pastvisit-list.doctor.lbl'),
                    cellTemplate: "<displayuser user='entity.Doctor'></displayuser>"
                },
                {
                    field: "Department.DepartmentName", displayName: $translate.instant('patientemr.pastvisit-list.department.lbl')
                },
                {
                    field: "AdmissionDate", displayName: $translate.instant('patientemr.pastvisit-list.admissiondate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.AdmissionDate'></ngformatdate>"
                },
                {
                    field: "DischargeDate", displayName: $translate.instant('patientemr.pastvisit-list.dishcargedate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.AdmissionDate'></ngformatdate>"
                },
                { field: "EncounterType.Description", displayName: $translate.instant('patientemr.pastvisit-list.encountertype.lbl') },
                {
                    field: "IsNoBill", displayName: $translate.instant('patientemr.pastvisit-list.nobill.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.IsNoBill==true'>Yes</span>" +
                        "<span  ng-if='entity.IsNoBill==false'>No</span>" +
                        "</div>"
                },
                {
                    field: "IsPaidvisit", displayName: $translate.instant('patientemr.pastvisit-list.paidvisit.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.IsPaidVisit==true'>Yes</span>" +
                        "<span  ng-if='entity.IsPaidVisit==false'>No</span>" +
                        "</div>"
                },
                { field: "FreeVisit", displayName: $translate.instant('patientemr.pastvisit-list.freevisit.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'encounter\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'reviewnote\',entity)" ><img class="imgsrc" src="app/img/main/alternate.png" style="margin-top:1px; width:25px;    margin: 1px 2px;"></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'encounter', display: 'common.editaction.lbl', icon: 'fa-eye' },
                        { actiontype: 'reviewnote', display: 'common.editaction.lbl', icon: 'fa-download' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getList();
    }
    pastVisitListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance','$timeout', 'modalConfig'];
})();