(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('HistoryComplaintsController', HistoryComplaintsController);

    function HistoryComplaintsController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        //Preference code
        angular.extend(this, utl.Ctrl.getUPCtrl({ $scope: $scope }));

        $scope.currentfilter = {
        };

        $scope.currentcontext = {
            paneltype: 'panel-info',
            recordcount: 3
        };
        $scope.canShowDischargeBtn = false;
        if ($stateParams.eid) {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        }
        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);
        utl.Session.set('dashboard-record-count', $scope.currentcontext.recordcount);

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.dashboardinfo = {};

        var sectionMap = {};
        var sectionList = [
            { id: 'generalhistory', text: 'GeneralHistory', tmpl: getSectionPath() + 'generalhistory-section.html' },
            { id: 'complaints', text: 'Presenting Complaints', tmpl: getSectionPath() + 'complaint-section.html' },
            { id: 'pastocularhistory', text: 'Past Ocular History', tmpl: getSectionPath() + 'pastocularhistory-section.html' },
            { id: 'eyesocialhistory', text: 'Social History', tmpl: getSectionPath() + 'socialhistory-section.html' },
            { id: 'familycondition', text: 'Family History', tmpl: getSectionPath() + 'familycondition-section.html' },
            { id: 'familysocialhistory', text: 'Family Social History', tmpl: getSectionPath() + 'familysocialhistory-section.html' },
            { id: 'patientcondition', text: 'Past Medical History', tmpl: getSectionPath() + 'patientmedcondition-section.html' },
            { id: 'allergies', text: 'Allergies', tmpl: getSectionPath() + 'allergy-section.html' },
        ];

        function getMasterList() {
            var result = [];
            for (var idx in sectionList) {
                var item = sectionList[idx];
                var cfgItem = { Id: item.id, Text: item.text };
                result.push(cfgItem);
            }
            return result;
        }

        function getSectionPath() {
            return "app/views/emr/patientemr/historyandcomplaints/sections/";
        }

        function refreshPref() {
            $scope.refreshUP($scope.prefKeys.HistoryComplaintSection, getUserPrefCallback);
        }
        function getUserPref() {
            $scope.getUP($scope.prefKeys.HistoryComplaintSection, getUserPrefCallback);
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
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        //Compute section based on preference ends
        //Actions
        $scope.print = function () {
            utl.Modal.open('app.appointmentprint', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }
        $scope.configuration = function () {
            utl.Modal.open('patientemr.emrconfiguration', {
                params: { cfg: { master: getMasterList(), prefkey: $scope.prefKeys.HistoryComplaintSection } },
                confirmCallback: refreshPref
            });
        }
        $scope.prescribe = function () {
            $state.go('patientemr.prescriptions', $scope.currentcontext.pid);
        }

        $scope.patientorders = function () {
            $state.go('patientemr.patientorders', $scope.currentcontext.pid);
        }

        $scope.openPreviousAppointment = function () {
            utl.Modal.open('app.previousappointment', {
                params: { pid: $scope.currentcontext.pid }
            }
            );
        }
        $scope.getencounterCallback = function (scope, data, options, hasError) {
            $scope.Encounter = data.Data[0];
            if (data.Data.length > 0)
                $scope.canShowDischargeBtn = true;
        };

        $scope.getEncounter = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid },
                    { Key: 15, Value: 2 }
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
            $scope.openModal('app.dischargeadvicer', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.fitfordischarge = function () {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: $scope.currentcontext.eid, Encounter: $scope.Encounter },
                type: 'post',
                onComplete: $scope.getPatientDischargeCallback
            };
            utl.Http.doAction(options);
        }


        $scope.getPatientDischargeEventCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.discharpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.clinicalDischarge = function (Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: $scope.currentcontext.eid, Encounter: $scope.Encounter },
                type: 'post',
                onComplete: $scope.getPatientDischargeEventCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {

            $scope.openModal('app.physicalpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.patientDischarge = function (Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: $scope.currentcontext.eid, Encounter: $scope.Encounter },
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

    HistoryComplaintsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();