(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientRheumatologyFormController', patientRheumatologyFormController);

    function patientRheumatologyFormController($scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.backToList = function() {
            $state.go('patientemr.patientrheumatologys');
        }

        $scope.save = function() {
            $('#InnerIframe').contents().find('#save').trigger( "click");
            utl.Alert.showSuccessMsg('Successfully Saved');
        }

        $scope.saveAndApprove = function() {
            $('#InnerIframe').contents().find('#saveandapprove').trigger( "click");
            utl.Alert.showSuccessMsg('Successfully Saved');
        }

        $scope.Reviewed = function() {
            $('#InnerIframe').contents().find('#reviewed').trigger( "click");
            utl.Alert.showSuccessMsg('Successfully Review Completed');
        }



        $scope.currentcontext = {};
        $scope.currentcontext.targetUrl = 'app/views/emr/patientemr/patientrheumatology/Rheumatology/Rheumatology.html';
    }

    patientRheumatologyFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();