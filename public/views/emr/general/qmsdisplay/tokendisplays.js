(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('tokenController', tokenController);
    function tokenController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.addNew = function (Id) {
            utl.Modal.open('app.tokenfilter', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
    }
   tokenController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();