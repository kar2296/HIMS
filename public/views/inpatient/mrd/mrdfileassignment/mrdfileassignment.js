(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MrdFileAssignmentController', MrdFileAssignmentController);

    function MrdFileAssignmentController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {};

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
            if ($scope.currentfilter.PatientNameMRN) {
                var inputData = {
                    Params: [{
                        Key: 6,
                        Value: $scope.currentfilter.PatientNameMRN
                    }, ],
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

        // $scope.UpdateFileStatus = function (Id, MRDMovementStatusId) {
        //     var options = {
        //         action: 'IPManagement/MRDLocation/UpdateMRDLocationData',
        //         data: { Data: { Id: Id, MRDMovementStatusId: MRDMovementStatusId } },
        //         type: 'post',
        //         onComplete: $scope.getList
        //     };
        //     utl.Http.doAction(options);
        // }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'locationchange') {
                utl.Modal.open('app.locationreassign', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        rackid: entity.RackId,
                        self: entity.Self,
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'movement') {
                utl.Modal.open('app.mrdmovement', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            } else if (actionType == 'misplaced') {
                utl.Modal.open('app.filestatusreason', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        misplacereason: entity.MisplacedReason,
                        statusid: 7
                    },
                    confirmCallback: $scope.getList
                });
                // $scope.UpdateFileStatus(entity.Id, 7);
            } else if (actionType == 'damaged') {
                utl.Modal.open('app.filestatusreason', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        damagereason: entity.DamagedReason,
                        statusid: 8
                    },
                    confirmCallback: $scope.getList
                });
                // $scope.UpdateFileStatus(entity.Id, 8);
            }
        }

        var rowtpl = '<div ng-class="{\'misplaced\':entity.MRDMovementStatusId==7,\'damaged\':entity.MRDMovementStatusId == 8 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            rowTemplate: rowtpl,
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "PatientMrn",
                    displayName: $translate.instant('UHID'),

                },
                {
                    field: "PatientId",
                    displayName: $translate.instant('frequest.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "{{entity.Patient.Title.Description}}</span>" + "<span>&nbsp;</span>" +
                        "<span >{{entity.Patient.FirstName}}&nbsp;</span>" + "<span ng-if='entity.Patient.LastName>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}</span>" +
                        "</a></div>"
                },
                {
                    field: "Patient.Age",
                    displayName: $translate.instant('filestatus.age.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
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
                        "<span >{{entity.FileRack.Description}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Self}}</span>" +
                        "</div>"
                },
                {
                    field: "DoctorId",
                    displayName: $translate.instant('frequest.requesttedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
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
                                <span class="grid-action" ng-click="handleEvents(\'locationchange\',entity)"><i class="btn btn-primary btn-rounded fa fa-exchange" aria-hidden="true"uib-tooltip="Location Assign"  tooltip-placement="bottom"></i></span>\
                                <span class="grid-action" ng-click="handleEvents(\'misplaced\',entity)"><img src="app/img/main/filelost.png" aria-hidden="true"uib-tooltip="MisPlaced"  tooltip-placement="bottom" style="width:14%;"></span>\
                                <span class="grid-action" ng-click="handleEvents(\'damaged\',entity)"><img src="app/img/main/filecrack.png" aria-hidden="true"uib-tooltip="Damaged"  tooltip-placement="bottom" style="width:14%;"></span>\
                                <span class="grid-action" ng-click="handleEvents(\'movement\',entity)"><i class="btn btn-info btn-rounded fa fa-map-signs" aria-hidden="true"uib-tooltip="MRD Movement"  tooltip-placement="bottom"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
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
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Department"
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
                    "Key": "EncounterType"
                },
                {
                    "Key": "Priority"
                },
                {
                    "Key": "MRDFileStatus"
                },
                {
                    "Key": "MRDMovementStatus"
                },
                {
                    "Key": "MRDDepartment"
                },
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

    MrdFileAssignmentController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();