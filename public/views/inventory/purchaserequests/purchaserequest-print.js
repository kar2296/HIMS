(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchaserequestprintController', purchaserequestprintController);

function purchaserequestprintController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.item = {};

    $scope.currentcontext =  {}; 

    $scope.cancelCallback = $uibModalInstance.dismiss;

purchaserequestprintController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

}
})();