(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ehealthSummaryController', ehealthSummaryController);

    function ehealthSummaryController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        //Preference code
        angular.extend(this, utl.Ctrl.getUPCtrl({ $scope: $scope }));

        $scope.currentfilter = {
        };

        $scope.currentcontext = {
            paneltype: 'panel-info'
        };

        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.dashboardinfo = {};

        function getSectionPath() {
            return "app/views/patientportal/ehealthsummary/sections/";
        }

        var sectionMap = {};
        var sectionList = [
            { id: 'allergy', text: 'Allergy', tmpl: getSectionPath() + 'allergy-section.html' },
            { id: 'appointments', text: 'Appointments', tmpl: getSectionPath() + 'appointment-section.html' },
            { id: 'conditions', text: 'Conditions', tmpl: getSectionPath() + 'condition-section.html' },
            { id: 'familyconditions', text: 'Family Conditions', tmpl: getSectionPath() + 'familycondition-section.html' },
            { id: 'familysocialhistory', text: 'Family Social History', tmpl: getSectionPath() + 'familysocialhistory-section.html' },
            { id: 'immunizations', text: 'Immunizations', tmpl: getSectionPath() + 'immunization-section.html' },
            { id: 'medications', text: 'Medications', tmpl: getSectionPath() + 'medication-section.html' },
            { id: 'procedures', text: 'Procedures', tmpl: getSectionPath() + 'procedure-section.html' },
            { id: 'socialhistory', text: 'Social History', tmpl: getSectionPath() + 'socialhistory-section.html' },
            { id: 'surgicals', text: 'Surgicals', tmpl: getSectionPath() + 'surgical-section.html' },
            { id: 'vitals', text: 'Vitals', tmpl: getSectionPath() + 'vital-section.html' }
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

        $scope.configuration = function () {
            utl.Modal.open('patientemr.emrconfiguration', {
                params: { cfg: { master: getMasterList(), prefkey: $scope.prefKeys.PMHXDashboardSections } },
                confirmCallback: refreshPref
            });
        }

        prepareMap();
        getUserPref();
    }

    ehealthSummaryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();