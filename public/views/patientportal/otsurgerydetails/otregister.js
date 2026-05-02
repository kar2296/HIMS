(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otregisterController', otregisterController);

    function otregisterController($scope, $stateParams, $filter, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            PatientId: parseInt(utl.Session.getPatientPortalPatientId())
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentfilter.PatientId }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                $state.go('patientportal.otdetails', { id: row.entity.Id, eid: row.entity.EncounterId, pid: row.entity.PatientId });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "OTStartedate",
                    displayName: $translate.instant('otrequest-list.requestedon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span>{{row.entity.OTStartedate | date:'dd-MMM-yyyy'}}</span>" + " " + "<span>{{row.entity.OTStartedate| date:'HH:mm'}}</span>" +
                        "</div>"
                },
                {
                    field: "OTIdentifier", displayName: $translate.instant('otrequest-list.otno.lbl')
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('otrequest-list.admittingdoctor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.Doctor.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{row.entity.Doctor.FirstName}}</span>' + '</div>'
                },
                {
                    field: "AnaesthesiaType.Description",
                    displayName: $translate.instant('otregister-form.anesthesiatype.lbl')
                },
                {
                    field: "Anaesthesist",
                    displayName: $translate.instant('otregister-form.anesthetist.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.Anaesthesist.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{row.entity.Anaesthesist.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                        '<span>{{row.entity.Anaesthesist.LastName}}</span>' + '</div>'
                },
                {
                    field: "OTRoom.RoomNo", displayName: $translate.instant('otrequest-list.otroom.lbl')
                },
                {
                    field: "Procedure.ProcedureName", displayName: $translate.instant('otrequest-list.surgeryname.lbl')
                },
                {
                    field: "OTRegisterStatus.Description", displayName: $translate.instant('otrequest-list.status.lbl')
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.getList();

    }

    otregisterController.$inject = ['$scope', '$stateParams', '$filter', '$state', '$translate', 'utl'];

})();