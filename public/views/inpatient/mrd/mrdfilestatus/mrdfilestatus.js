(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MrdFileStatusController', MrdFileStatusController);

    function MrdFileStatusController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {};

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
            if ($scope.currentfilter.PatientNameMRN) {
                var inputData = {
                    Params: [
                        { Key: 6, Value: $scope.currentfilter.PatientNameMRN },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
                var options = {
                    action: 'IPManagement/MRDLocation/GetMRDLocations',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'locationchange') {
                utl.Modal.open('app.locationreassign', {
                    params: {
                        id: row.entity.Id,
                        pid: row.entity.PatientId,
                        rackid: row.entity.RackId,
                        self: row.entity.Self,
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'movement') {
                utl.Modal.open('app.mrdmovement', {
                    params: {
                        id: row.entity.Id,
                        pid: row.entity.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "PatientMrn",
                    displayName: $translate.instant('fileissues.mrn.lbl'),

                },
                {
                    field: "PatientId",
                    displayName: $translate.instant('frequest.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" + "<span>&nbsp;&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}</span>" + "<span ng-if='row.entity.Patient.LastName>&nbsp;&nbsp;</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "</a></div>"
                },
                {
                    field: "Patient.Age",
                    displayName: $translate.instant('filestatus.age.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</div>"
                },
                {
                    field: "Encounter.VisitIdentifier",
                    displayName: $translate.instant('fileissues.visitno.lbl')
                },
                {
                    field: "FileLocation.DepartmentName",
                    displayName: $translate.instant('frequest.filelocation.lbl')
                },
                {
                    field: "FileRack",
                    displayName: $translate.instant('filestatus.rackdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{row.entity.FileRack.Description}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Self}}</span>" +
                        "</div>"
                },
                {
                    field: "DoctorId",
                    displayName: $translate.instant('frequest.requesttedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                {
                    field: "MRDMovementStatus.Description",
                    displayName: $translate.instant('frequest.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                               <span class="grid-action" ng-click="grid.appScope.handleEvents(\'movement\',row)"><i class="btn btn-info btn-rounded fa fa-map-signs" aria-hidden="true"></i></span>\
                                </div>',
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "EncounterType" },
                { "Key": "Priority" },
                { "Key": "MRDFileStatus" },
                { "Key": "MRDMovementStatus" },
                { "Key": "MRDDepartment" },
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

    MrdFileStatusController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();