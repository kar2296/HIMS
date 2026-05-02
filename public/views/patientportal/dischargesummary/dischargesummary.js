(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargesummaryController', dischargesummaryController);

    function dischargesummaryController($scope, $stateParams, $filter, $state, $translate, utl) {
        var vm = this;

        $scope.DisSummary = [];
        $scope.currentfilter = {
            PatientId: parseInt(utl.Session.getPatientPortalPatientId())
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.DisSummary = data.Data;
            // vm.gridConfig.data = data.Data;
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: 5
                    }, // Release to Patient
                    {
                        Key: 10,
                        Value: $scope.currentfilter.PatientId
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'DischargeSummary/patientcertificate/GetPatientCertificates',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Patient Info popup  Start  

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };
        // Patient Info popup  End   
        //Grid Actions
        $scope.records = function () {
            $state.go('patientportal.portalmyhealthrecord');
        }
        $scope.view = function (item) {
            $state.go('patientportal.dischargesummaryform', {
                id: item.Id,
                eid: item.EncounterId,
                pid: item.PatientId
            });
        }
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'view') {
                $state.go('patientportal.dischargesummaryform', {
                    id: row.entity.Id,
                    eid: row.entity.EncounterId,
                    pid: row.entity.PatientId
                });
            }
        };


        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     columnDefs: [
        //         {
        //             field: "AdmissionDate", displayName: $translate.instant('admissions.admissionon.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.AdmissionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
        //         },
        //         // { field: "VisitIdentifier", displayName: $translate.instant('admissions.admissionno.lbl') },
        //         // { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
        //         {
        //             field: "WardRoomMaster", displayName: $translate.instant('admissions.roomdetails.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'>"
        //             + "<span class='pl-3' ng-if='row.entity.WardRoomMaster'>{{row.entity.WardRoomMaster.RoomNo }}</span>"
        //             + "<span class='pl-3' ng-if='row.entity.WardRoomMaster'>/</span>"
        //             + "<span class='pl-3' ng-if='row.entity.WardRoomBedMaster'>{{row.entity.WardRoomBedMaster.BedNo}}</span>"
        //             + "</div>"
        //         },
        //         // {
        //         //     field: "DischargeDate",
        //         //     displayName: $translate.instant('mrd.dod.lbl'),
        //         //     cellTemplate: "<ngformatdate date-val='row.entity.DischargeDate'> </ngformatdate>"
        //         // },
        //         {
        //             field: "Doctor", displayName: $translate.instant('admissions.admittedby.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'>"
        //             + '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
        //             + "<span class='pl-3'>{{row.entity.Doctor.Title.Description}}&nbsp;</span>"
        //             + "<span class='pl-3'>{{row.entity.Doctor.FirstName}}&nbsp;</span>"
        //             + "<span class='pl-3'>{{row.entity.Doctor.LastName}}&nbsp;</span>"
        //             + "</span></div>"
        //         },
        //         // { field: "Department.DepartmentName", displayName: $translate.instant('admissions.department.lbl') },
        //         // { field: "AdmissionStatus.Description", displayName: $translate.instant('admissions.status.lbl') },
        //         {
        //             field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
        //             cellTemplate: '<div class="ui-grid-cell-contents">\
        //                                              <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\
        //                                         </div>',
        //             actions: [
        //                 // { actiontype: 'edit', display: 'common.editaction.lbl' },
        //                 // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
        //             ]
        //         }
        //     ],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        // };

        $scope.getList();

    }
    dischargesummaryController.$inject = ['$scope', '$stateParams', '$filter', '$state', '$translate', 'utl'];

})();