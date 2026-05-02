(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnRheumatologySectionController', cnRheumatologySectionController);

    function cnRheumatologySectionController($scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.targetUrl = 'app/views/emr/patientemr/patientrheumatology/Rheumatology/Rheumatology.html';
    }

    cnRheumatologySectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();