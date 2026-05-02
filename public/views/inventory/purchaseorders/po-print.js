(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('poprintController', poprintController);

function poprintController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {}; 

    $scope.cancelCallback = $uibModalInstance.dismiss;

poprintController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

}
})();