(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('emrBaseController', emrBaseController);

function emrBaseController($scope, $stateParams, $state, $translate, utl) {

    //Can update patient records
    $scope.canUpdatePatientEMR = function () {
        var patientObj = utl.Session.getObject('EMRPatientObject');
        if(patientObj) {
            var paitentStatus = patientObj.PatientStatus.Description;
            if(paitentStatus != 'Deceased') {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }
}

emrBaseController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();