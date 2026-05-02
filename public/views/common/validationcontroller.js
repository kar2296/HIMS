(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('validationController', validationController);

function validationController($scope, $stateParams, $state, $translate, utl) {
    
    $scope.validationtypes = {
        onlynumbers : '/^\d+$/'
    }
}

validationController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();