(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('baseController', baseController);

function baseController($scope, $stateParams, $state, $translate, utl) {
    
    //Save and approve
    $scope.saveAndApprove = function () {
        $scope.item.ActiveStatus = 'Active' //Active
        $scope.saveItem();
    }

    $scope.save = function () {
        $scope.item.ActiveStatus = 'Draft'; //Draft
        $scope.saveItem();
    }

    $scope.canUpdatePatientInfo = function () {
        var patientObj = utl.Session.getObject('PatientObject');
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

baseController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();