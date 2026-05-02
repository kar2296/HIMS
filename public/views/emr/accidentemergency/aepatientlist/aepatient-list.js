(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('aepatientListController', aepatientListController);

    function aepatientListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentfilter = {
            Status: -1,
            ERTypeId: -1
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Patient },
                    { Key: 2, Value: $scope.currentfilter.Status },
                    { Key: 3, Value: $scope.currentfilter.ERTypeId }

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentfilter.ERDate) {
                var FrmDate = $filter('date')($scope.currentfilter.ERDate, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.currentfilter.ERDate, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push(
                    { Key: 4, Value: [FrmDate, ToDate] },
                );
            }

            var options = {
                action: 'AccidentEmergency/AERegistration/GetAERegistrations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getList
            });
        }
        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.physicalpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter, type: 1 });
        }

        $scope.patientDischarge = function (Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: Encounter.Id, Encounter: Encounter },
                type: 'post',
                onComplete: $scope.getPhysicalDischargeCallback
            };
            utl.Http.doAction(options);
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'aer') {
                $state.go('app.aeregistrationtab.aeregistration', { id: row.entity.Id });
            }
            else if (actionType == 'discharge') {
                row.entity.Encounter.Patient = row.entity.Patient;
                $scope.patientDischarge(row.entity.Encounter);
            }
            else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
            else if (actionType == 'emr') {
                utl.Session.setEMRPatientId(row.entity.PatientId);
                $state.go('patientemr.patientdashboard', { eid: row.entity.EncounterId });
            }
            else if (actionType == 'triage') {
                utl.Session.setEMRPatientId(row.entity.PatientId);
                $state.go('app.triages', { aeid: row.entity.Id, eid: row.entity.EncounterId });
            }
            /*  for bedtransfer*/
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Patient", displayName: $translate.instant('accidentemergency.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                    '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                    // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                    +
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
                // { field: "VisitIdentifier", displayName: $translate.instant('admissions.admissionno.lbl') },

                {
                    field: "EmergencyDate", displayName: $translate.instant('accidentemergency.emergencydate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.EmergencyDate '></ngformatdate>"
                },
                {
                    field: "ERType.Description", displayName: $translate.instant('accidentemergency.emergencytype.lbl')
                },

                {
                    field: "ModeOfTransport.Description", displayName: $translate.instant('accidentemergency.arrivalmode.lbl')
                },
                {
                    field: "Doctor", displayName: $translate.instant('accidentemergency.doctor.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                    "<span >{{row.entity.User.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.User.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.User.LastName}}&nbsp;</span>" +
                    "</span></div>"
                },
                // {
                //     field: "PatientGuarantor.GuarantorName", displayName: $translate.instant('accidentemergency.guarantor.lbl')
                // },
                {
                    field: "IncidentAddress", displayName: $translate.instant('accidentemergency.incidentplace.lbl')
                },
                {
                    field: "Encounter.AdmissionStatus.Description", displayName: $translate.instant('accidentemergency.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <span class="grid-action" ng-click="grid.appScope.handleEvents(\'aer\',row)"><i class="btn text-white dem-color4  btn-xs" aria-hidden="true"><strong>AER</strong></i></span>\
                                                <span class="grid-action" ng-click="grid.appScope.handleEvents(\'discharge\',row)" ng-if="row.entity.Encounter.AdmissionStatusId==5"><i class="btn text-white new-color5 btn-xs" aria-hidden="true"><strong>Dis</strong></i></span>\
                                                <span class="grid-action" ng-click="grid.appScope.handleEvents(\'emr\',row)"><i class="text-white btn emr-color11 btn-xs" aria-hidden="true"><strong>EMR</strong></i></span>\
                                                <span class="grid-action" ng-click="grid.appScope.handleEvents(\'triage\',row)"><i class="text-white btn pyr-color10 btn-xs" aria-hidden="true"><strong>TRI</strong></i></span>\
                                                </div>',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData =
                [
                    { "Key": "ERType" },
                    { "Key": "AdmissionStatus" }
                ]
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

    aepatientListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();