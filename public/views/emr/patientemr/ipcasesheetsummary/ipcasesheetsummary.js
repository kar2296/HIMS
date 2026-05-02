(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipcasesheetsummaryController', ipcasesheetsummaryController);

    function ipcasesheetsummaryController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        //Preference code
        angular.extend(this, utl.Ctrl.getUPCtrl({
            $scope: $scope
        }));

        $scope.currentfilter = {};

        $scope.currentcontext = {
            paneltype: 'panel-info',
            recordcount: 3
        };
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        $scope.canShowDischargeBtn = false;

        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }

        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);
        utl.Session.set('dashboard-record-count', $scope.currentcontext.recordcount);

        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.dashboardinfo = {};

        $scope.doctor_dashboard = function () {
            if ($scope.context == 'emr' || $scope.context == 'ipemr') {
                if ($scope.From == 'nursing') {
                    $state.go('app.nursingdashboard');
                } else {
                    $state.go('app.doctordashboard');
                }
            }
            if ($scope.context == 'surgery') {
                $state.go('app.surgerydashboard');
            }
        };
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        var sectionMap = {};
        var sectionList = [{
                id: 'conditions',
                text: 'Conditions',
                tmpl: getSectionPath() + 'condition-section.html'
            },
            {
                id: 'vitals',
                text: 'Vitals',
                tmpl: getSectionPath() + 'vital-section.html'
            },
            {
                id: 'doctornotes',
                text: 'doctornotes',
                tmpl: getSectionPath() + 'doctornotes-section.html'
            },
            {
                id: 'nursenotes',
                text: 'nursenotes',
                tmpl: getSectionPath() + 'nursenotes-section.html'
            }
        ];

        function getMasterList() {
            var result = [];
            for (var idx in sectionList) {
                var item = sectionList[idx];
                var cfgItem = {
                    Id: item.id,
                    Text: item.text
                };
                result.push(cfgItem);
            }
            return result;
        }
      
        function getSectionPath() {
            return "app/views/emr/patientemr/ipcasesheetsummary/sections/";
        }

        function refreshPref() {
            $scope.refreshUP($scope.prefKeys.PMHXDashboardSections, getUserPrefCallback);
        }

        function getUserPref() {
            $scope.getUP($scope.prefKeys.PMHXDashboardSections, getUserPrefCallback);
        }

        //Compute section based on preference starts
        function getUserPrefCallback(prefValue) {
            var selectedSections = prefValue && prefValue.selected ? prefValue.selected : [];
            var resultList = [];
            if (selectedSections && selectedSections.length > 0) {
                for (var idx in selectedSections) {
                    var item = selectedSections[idx];
                    var sectionItem = sectionMap[item.Id];
                    resultList.push(sectionItem);
                }
                $scope.sections = resultList;
            } else {
                $scope.sections = sectionList;;
            }
        }

        function prepareMap() {
            var resultList = [];
            for (var idx in sectionList) {
                var item = sectionList[idx];
                sectionMap[item.id] = item;
            }
        }

        //Compute section based on preference ends

        $scope.configuration = function () {
            utl.Modal.open('patientemr.emrconfiguration', {
                params: {
                    cfg: {
                        master: getMasterList(),
                        prefkey: $scope.prefKeys.PMHXDashboardSections
                    }
                },
                confirmCallback: refreshPref
            });
        }
        $scope.prescribe = function () {
            $state.go('patientemr.prescriptions', $scope.currentcontext.pid);
        }

        $scope.patientorders = function () {
            $state.go('patientemr.patientorders', $scope.currentcontext.pid);
        }
        $scope.print = function () {
            var inputData = {
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                }
            };
            var options = {
                action: 'emr/consultation/PrintIPCaseSheetSummary',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.openPreviousAppointment = function () {
            utl.Modal.open('app.previousappointment', {
                params: {
                    pid: $scope.currentcontext.pid
                }
            });
        }
        $scope.getencounterCallback = function (scope, data, options, hasError) {
            $scope.Encounter = data.Data[0];
            if (data.Data.length > 0)
                $scope.canShowDischargeBtn = true;
        };

        $scope.getEncounter = function () {
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 15,
                        Value: 2
                    }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencounterCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getEncounter
            });
        }

        $scope.getPatientDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.dischargeadvicer', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.fitfordischarge = function () {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.eid,
                    Encounter: $scope.Encounter
                },
                type: 'post',
                onComplete: $scope.getPatientDischargeCallback
            };
            utl.Http.doAction(options);
        }


        $scope.getPatientDischargeEventCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.discharpatient', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.clinicalDischarge = function (Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.eid,
                    Encounter: $scope.Encounter
                },
                type: 'post',
                onComplete: $scope.getPatientDischargeEventCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {

            $scope.openModal('app.physicalpatient', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.patientDischarge = function (Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.eid,
                    Encounter: $scope.Encounter
                },
                type: 'post',
                onComplete: $scope.getPhysicalDischargeCallback
            };
            utl.Http.doAction(options);
        }

        prepareMap();
        getUserPref();

        if ($scope.currentcontext.eid)
            $scope.getEncounter();
    }

    ipcasesheetsummaryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();