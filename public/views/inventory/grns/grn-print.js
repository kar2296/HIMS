(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('grnprintController', grnprintController);

function grnprintController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {}; 

    $scope.cancelCallback = $uibModalInstance.dismiss;

grnprintController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

}
})();