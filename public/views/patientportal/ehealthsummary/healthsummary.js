(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ehealthSummaryController', ehealthSummaryController);

function ehealthSummaryController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.currentfilter= {
    };

    $scope.currentcontext =  {
        paneltype : 'panel-info'
    };
    
    utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

    $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
    $scope.dashboardinfo = {};

    function getSectionPath() {
        return "app/views/patientportal/ehealthsummary/healthsummary/sections/";
    }

    $scope.sections = [
            { key: 'allergy',  tmpl: getSectionPath() + 'allergy-section.html'},
            { key: 'conditions',  tmpl: getSectionPath() +'condition-section.html'},
            { key: 'immunizations',  tmpl: getSectionPath() +'immunization-section.html' },
            { key: 'medications',  tmpl: getSectionPath() +'medication-section.html' },
            { key: 'procedures', tmpl: getSectionPath() +'procedure-section.html' },
            { key: 'socialhistory', tmpl : getSectionPath() +'socialhistory-section.html' },
            { key: 'vitals', tmpl : getSectionPath() +'vital-section.html'},
            { key: 'familyconditions', tmpl: getSectionPath() +'familycondition-section.html' },
            { key: 'familysocialhistory', tmpl: getSectionPath() +'familysocialhistory-section.html'},
            { key: 'surgicals', tmpl: getSectionPath() +'surgical-section.html'},
            { key: 'appointments', tmpl: getSectionPath() +'appointment-section.html'}
    ];
}

ehealthSummaryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();