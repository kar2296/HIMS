(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtcnRheumatologySectionController', discasshtcnRheumatologySectionController);

    function discasshtcnRheumatologySectionController($scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.targetUrl = 'app/views/emr/patientemr/patientrheumatology/Rheumatology/Rheumatology.html';
    }

    discasshtcnRheumatologySectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();